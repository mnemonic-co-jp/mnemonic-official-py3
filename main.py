import pydantic, requests, yaml
from fastapi import FastAPI, Request, Response, Depends, HTTPException
from google.cloud import ndb
from typing import Optional
from models import Entry, Contact

app = FastAPI()
client = ndb.Client()

async def create_context():
    with client.context():
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
    entity = Contact(**contact.dict(exclude={'token': True}))
    entity.put()

    # TODO: メール送信などの処理

    return {}
