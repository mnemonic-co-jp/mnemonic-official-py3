import os
import jinja2
import json
import pydantic
import requests
import yaml
from fastapi import FastAPI, Response, Depends, HTTPException
from google.cloud import ndb, tasks_v2
from brevo import Brevo
from brevo.transactional_emails import SendTransacEmailRequestSender, SendTransacEmailRequestToItem
from models import Entry

app = FastAPI()

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

with open('secret.yaml') as file:
    SECRET = yaml.safe_load(file.read())


class QueryParams:
    def __init__(self, sort: str = None, fields: str = None, limit: int = None, cursor: str = None):
        self.orders = sort.split(',') if sort else None
        self.include = fields.split(',') if fields else None
        self.limit = limit
        self.start_cursor = ndb.Cursor(urlsafe=cursor) if cursor else ndb.Cursor()


def fetched_response(query: ndb.query.Query, params: QueryParams, response: Response):
    if params.orders:
        query = query.order(*params.orders)
    if params.limit:
        entries, cursor, more = query.fetch_page(params.limit, start_cursor=params.start_cursor)
        if more:
            response.headers['X-Next-Cursor'] = str(cursor.urlsafe(), 'utf8')
        return [e.to_dict(include=params.include) for e in entries]
    return [c.to_dict(include=params.include) for c in query]


@app.get('/api/entries/', dependencies=[Depends(create_context)])
def fetch_entries(response: Response, params: QueryParams = Depends(QueryParams)):
    return fetched_response(Entry.query().filter(Entry.is_deleted == False), params, response)


@app.get('/api/entries/{id}', dependencies=[Depends(create_context)])
def get_entry(id: int):
    entry = Entry.get_by_id(id)
    if not entry or entry.is_deleted:
        raise HTTPException(status_code=404, detail='その記事は存在しません。')
    keys = Entry.fetch_all_sorted_keys()
    index = keys.index(entry.key)
    result = entry.to_dict()
    result['previous'] = keys[index - 1].get().to_tiny_dict() if index > 0 else None
    result['next'] = keys[index + 1].get().to_tiny_dict() if index < len(keys) - 1 else None
    return result


@app.post('/api/inquiry/', dependencies=[Depends(create_context)])
def post_inquiry(inquiry: InquiryRequestModel) -> None:
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
    result = response.json()
    if not result['success'] or result['action'] != 'mnemonic':
        # TODO: result['hostname'] をロギングする？
        raise HTTPException(status_code=400)
    if result['score'] < 0.5:
        raise HTTPException(status_code=403, detail='リクエストは拒否されました。')
    payload = inquiry.model_dump(exclude={'token'})
    if os.getenv('GAE_INSTANCE', '') == '':
        send_inquiry_mail(SendInquiryPayloadModel(**payload))
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


def send_inquiry_mail(payload: SendInquiryPayloadModel):
    brevo_client = Brevo(api_key=SECRET['brevo']['apikey'])
    response = brevo_client.transactional_emails.with_raw_response.send_transac_email(
        sender=SendTransacEmailRequestSender(
            name='Mnemonic Co., Ltd.',
            email='noreply@mnemonic.co.jp',
        ),
        to=[
            SendTransacEmailRequestToItem(
                email='somin@mnemonic.co.jp'
            )
        ],
        html_content=jinja_environment.get_template('email/inquiry.html').render(payload),
        subject=f'【Mnemonic】{payload.name} さんからのお問い合わせ',
    )
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code)


@app.post('/task/inquiry/send_mail/', dependencies=[Depends(create_context)])
def post_send_inquiry_mail(payload: SendInquiryPayloadModel):
    send_inquiry_mail(payload)
