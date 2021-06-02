from fastapi import FastAPI, Depends
from google.cloud import ndb
from models import Entry, Tag

app = FastAPI()
client = ndb.Client()

async def create_context():
    with client.context():
        yield

@app.get('/', dependencies=[Depends(create_context)])
def home():
    entries = Entry.query().fetch()
    return {
        'titles': [entry.title for entry in entries]
    }
