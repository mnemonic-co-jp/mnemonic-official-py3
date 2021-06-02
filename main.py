from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import ndb
from models import Entry, Tag

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:4200'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

client = ndb.Client()

async def create_context():
    with client.context():
        yield

@app.get('/api/test/', dependencies=[Depends(create_context)])
def test():
    entries = Entry.query().fetch()
    return {
        'titles': [entry.title for entry in entries]
    }
