from fastapi import FastAPI, Request, Response, Depends, HTTPException
from google.cloud import ndb
from models import Entry

app = FastAPI()
client = ndb.Client()

async def create_context():
    with client.context():
        yield

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
async def fetch_entries(response: Response, params: QueryParams = Depends(QueryParams)):
    return fetched_response(Entry.query().filter(Entry.is_deleted == False), params, response)

@app.get('/api/entries/{id}', dependencies = [Depends(create_context)])
async def fetch_entries(id: int):
    entry = Entry.get_by_id(id)
    if not entry or entry.is_deleted:
        raise HTTPException(status_code=404, detail='その記事は存在しません。')
    return entry.to_dict()
