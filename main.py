import os, jinja2, json, pydantic, requests, yaml, sendgrid
from fastapi import FastAPI, Request, Response, Depends, HTTPException
from google.cloud import ndb, tasks_v2
from sendgrid.helpers.mail import Mail
from typing import Optional
from models import Entry

app = FastAPI()
ndb_client = ndb.Client()
tasks_client = tasks_v2.CloudTasksClient()
project_name = 'mnemonic-official-py3'
tasks_location = 'asia-northeast1'

jinja_environment = jinja2.Environment(
    loader = jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates'))
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
        entries, cursor, more = query.fetch_page(params.limit, start_cursor = params.start_cursor)
        if more:
            response.headers['X-Next-Cursor'] = str(cursor.urlsafe(), 'utf8')
        return [e.to_dict(include = params.include) for e in entries]
    return [c.to_dict(include = params.include) for c in query]

@app.get('/api/entries/', dependencies = [Depends(create_context)])
def fetch_entries(response: Response, params: QueryParams = Depends(QueryParams)):
    return fetched_response(Entry.query().filter(Entry.is_deleted == False), params, response)

@app.get('/api/entries/{id}', dependencies = [Depends(create_context)])
def fetch_entries(id: int):
    entry = Entry.get_by_id(id)
    if not entry or entry.is_deleted:
        raise HTTPException(status_code=404, detail='その記事は存在しません。')
    return entry.to_dict()

class ContactRequestModel(pydantic.BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    body: str
    token: str

@app.post('/api/contact/', dependencies = [Depends(create_context)])
def post_contact(contact: ContactRequestModel):
    session = requests.Session()
    adapter = requests.adapters.HTTPAdapter(max_retries=3)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    payload = {
        'secret': SECRET['recaptcha']['secret'],
        'response': contact.token
    }
    # reCAPTCHA v3 の verify（https://developers.google.com/recaptcha/docs/verify）
    response = session.post('https://www.google.com/recaptcha/api/siteverify', data=payload)
    result = response.json()
    if not result['success'] or result['score'] < 0.5:
        raise HTTPException(status_code=403, detail='リクエストは拒否されました。')
    payload = contact.dict(exclude={'token': True})
    enqueue_send_contact_mail(payload)
    return {}

def enqueue_send_contact_mail(payload):
    if os.getenv('GAE_INSTANCE', '') == '':
        send_contact_mail(payload)
        return
    parent = tasks_client.queue_path(project_name, tasks_location, 'send-contact-mail')
    task = {
        'app_engine_http_request': {
            'http_method': tasks_v2.HttpMethod.POST,
            'relative_uri': '/task/contact/send_mail/',
            'headers': {
                'Content-type': 'application/json'
            },
            'body': json.dumps(payload).encode()
        }
    }
    return tasks_client.create_task(parent=parent, task=task)

def send_contact_mail(payload):
    message = Mail(
        from_email=('noreply@mnemonic.co.jp'),
        subject=f'【Mnemonic】{payload["name"]} さんからのお問い合わせ',
        plain_text_content=jinja_environment.get_template('email/contact.txt').render(payload),
        to_emails='somin@mnemonic.co.jp'
    )
    try:
        sendgrid_client = sendgrid.SendGridAPIClient(api_key=SECRET['sendgrid']['apikey'])
        response = sendgrid_client.send(message)
    except Exception as e:
        print(e)
    return
