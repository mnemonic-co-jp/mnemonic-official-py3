import logging
import os
import redis
import jinja2
import json
import datetime
import requests
import yaml
import smtplib
import ssl
from email.mime.text import MIMEText
from fastapi import FastAPI, Response, Depends, HTTPException
from fastapi_camelcase import CamelModel
from google.cloud import ndb, tasks_v2
from models import Entry
from admin import router as admin_router

logger = logging.getLogger('uvicorn')
ndb_client = ndb.Client()
tasks_client = tasks_v2.CloudTasksClient()
project_name = 'mnemonic-official-py3'
tasks_location = 'asia-northeast1'

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates'))
)


async def create_context():
    with ndb_client.context():
        yield

app = FastAPI(dependencies=[Depends(create_context)])
app.include_router(admin_router)

with open('secret.yaml') as file:
    SECRET = yaml.safe_load(file.read())

redis_client = redis.StrictRedis(**SECRET['redis'], health_check_interval=30, decode_responses=True)


class QueryParams:
    def __init__(self, sort: str = None, fields: str = None, limit: int = None, cursor: str = None) -> None:
        self.orders = sort.split(',') if sort else None
        self.include = fields.split(',') if fields else None
        self.limit = limit
        self.start_cursor = ndb.Cursor(urlsafe=cursor) if cursor else None

    def get_keystring(self) -> str:
        order_string = ','.join(self.orders) if self.orders else ''
        include_string = ','.join(self.include) if self.include else ''
        return f'{order_string}:{include_string}:{self.limit}:{str(self.start_cursor.urlsafe(), 'utf8') if self.start_cursor else ''}'


def fetched_response(query: ndb.query.Query, params: QueryParams, response: Response) -> list[dict]:
    redis_key = f'entries:{params.get_keystring()}'
    resp_json = redis_client.get(redis_key)
    if resp_json:
        logger.info(f'"redis": Getting value \'{redis_key}\'')
        resp = json.loads(resp_json)
        if resp['cursor']:
            response.headers['X-Next-Cursor'] = resp['cursor']
        return resp['data']
    if params.orders:
        query = query.order(*params.orders)
    if params.limit:
        entries, cursor, more = query.fetch_page(params.limit, start_cursor=params.start_cursor)
        if more:
            response.headers['X-Next-Cursor'] = str(cursor.urlsafe(), 'utf8')
        data = [e.to_dict(include=params.include) for e in entries]
        redis_client.set(redis_key, json.dumps({
            'data': data,
            'cursor': str(cursor.urlsafe(), 'utf8') if more else None
        }, default=str))
        return data
    data = [e.to_dict(include=params.include) for e in query]
    redis_client.set(redis_key, json.dumps({
        'data': data,
        'cursor': None
    }, default=str))
    return data


class EntryModel(CamelModel):
    id: int
    title: str = None
    date: datetime.datetime = None
    tweet_ids: list[str] = None
    body: str = None
    tags: list[str] = None
    views: int = None


@app.get('/api/entries/')
def fetch_entries(response: Response, params: QueryParams = Depends(QueryParams)) -> list[EntryModel]:
    return fetched_response(Entry.query().filter(Entry.is_deleted == False), params, response)


@app.get('/api/entries/{id}')
def get_entry(id: int) -> EntryModel:
    redis_key = f'entry:{id}'
    result_json = redis_client.get(redis_key)
    if result_json:
        logger.info(f'"redis": Getting value \'{redis_key}\'')
        return json.loads(result_json)
    entry = Entry.get_by_id(id)
    if not entry or entry.is_deleted:
        raise HTTPException(status_code=404, detail='その記事は存在しません。')
    keys = Entry.fetch_all_sorted_keys()
    index = keys.index(entry.key)
    result = entry.to_dict()
    result['previous'] = keys[index - 1].get().to_tiny_dict() if index > 0 else None
    result['next'] = keys[index + 1].get().to_tiny_dict() if index < len(keys) - 1 else None
    redis_client.set(redis_key, json.dumps(result, default=str))
    return result


class InquiryModel(CamelModel):
    name: str
    phone: str | None = ''
    email: str | None = ''
    body: str
    token: str = None


@app.post('/api/inquiry/')
def post_inquiry(inquiry: InquiryModel) -> None:
    session = requests.Session()
    adapter = requests.adapters.HTTPAdapter(max_retries=3)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    payload = {
        'secret': SECRET['recaptcha']['secret'],
        'response': inquiry.token
    }
    # reCAPTCHA v3 の verify（https://developers.google.com/recaptcha/docs/verify）
    response = session.post('https://www.google.com/recaptcha/api/siteverify', data=payload)
    if response.status_code != 200:
        logger.info(response.content)
        raise HTTPException(status_code=502, detail='Connection to Google reCAPTCHA failed.')
    result = response.json()
    logger.info(result)
    if not result['success'] or result['action'] != 'mnemonic':
        raise HTTPException(status_code=400)
    if result['score'] < 0.5:
        raise HTTPException(status_code=403, detail='リクエストは拒否されました。')
    payload = inquiry.model_dump(exclude={'token'})
    logger.info(payload)
    if os.getenv('GAE_INSTANCE', '') == '':
        send_inquiry_mail(InquiryModel(**payload))
        return
    parent = tasks_client.queue_path(project_name, tasks_location, 'send-inquiry-mail')
    task = {
        'app_engine_http_request': {
            'http_method': tasks_v2.HttpMethod.POST,
            'relative_uri': '/task/inquiry/send_mail/',
            'headers': {
                'Content-type': 'application/json'
            },
            'body': json.dumps(payload).encode()
        }
    }
    tasks_client.create_task(parent=parent, task=task)


def send_inquiry_mail(payload: InquiryModel) -> None:
    body = jinja_environment.get_template('email/inquiry.txt').render(payload)
    msg = MIMEText(body, 'plain', 'utf-8')
    msg['Subject'] = f'【Mnemonic】{payload.name} さんからのお問い合わせ'
    msg['From'] = 'somin@mnemonic.co.jp'
    msg['To'] = 'somin@mnemonic.co.jp'
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=ssl.create_default_context()) as server:
        server.login('somin@mnemonic.co.jp', SECRET['gmail']['app_password'])
        errors = server.send_message(msg)
        if isinstance(errors, dict) and len(errors) > 0:
            logger.info(errors)
            raise HTTPException(status_code=500, detail='Failed to send inquiry mail.')


@app.post('/task/inquiry/send_mail/')
def post_send_inquiry_mail(payload: InquiryModel) -> None:
    send_inquiry_mail(payload)
