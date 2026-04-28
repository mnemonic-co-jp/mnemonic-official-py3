import logging
import yaml
import datetime
import redis
from fastapi import APIRouter, Response, Depends, HTTPException
from fastapi_camelcase import CamelModel
from fastapi.security import OAuth2PasswordBearer
from google.cloud import ndb
from google.oauth2 import id_token
from google.auth.transport import requests
from models import Entry, Tag

logger = logging.getLogger('uvicorn')

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')

with open('secret.yaml') as file:
    SECRET = yaml.safe_load(file.read())


async def google_auth_required(token: str = Depends(oauth2_scheme)) -> None:
    try:
        client_id = SECRET['google']['client_id']
        id_info = id_token.verify_oauth2_token(token, requests.Request(), client_id)
        if id_info['aud'] != client_id:
            raise HTTPException(status_code=401, detail='Invalid token.')
    except ValueError as e:
        logger.error(e)
        raise HTTPException(status_code=401, detail='Invalid token.')


router = APIRouter(prefix='/admin/api', dependencies=[Depends(google_auth_required)])

with open('secret.yaml') as file:
    SECRET = yaml.safe_load(file.read())

redis_client = redis.StrictRedis(**SECRET['redis'], health_check_interval=30, decode_responses=True)


@router.get('/test/')
def test():
    return {'message': 'Hello, World!'}


class EntryModel(CamelModel):
    id: int = None
    title: str
    date: datetime.datetime
    tweet_ids: list[str] = None
    body: str = None
    tags: list[str] = None
    is_published: bool
    is_deleted: bool = False


def update_tags(tag_names: list[str]) -> None:
    lower_names = [tag.name_lower for tag in Tag.query().iter()]
    for tag_name in tag_names:
        if tag_name.lower() not in lower_names:
            tag = Tag(name=tag_name)
            tag.put()


@router.get('/entries/')
def fetch_entries(response: Response, cursor: str | None = None) -> list[EntryModel]:
    start_cursor = ndb.Cursor(urlsafe=cursor) if cursor else None
    entries, cursor, more = Entry.query().order('-date').fetch_page(20, start_cursor=start_cursor)
    if more:
        response.headers['X-Next-Cursor'] = str(cursor.urlsafe(), 'utf8')
    return [entry.to_dict() for entry in entries]


@router.post('/entries/')
def create_entry(params: EntryModel):
    del params.id
    entry = Entry(**params.model_dump())
    entry.put()
    if entry.tags:
        # 追加されたタグがあれば Tag も更新
        update_tags(entry.tags)
    # entries を抽出するキャッシュを削除
    redis_keys = redis_client.keys(pattern='entries:*')
    if len(redis_keys) > 0:
        redis_client.delete(*redis_keys)
    return entry.to_dict()


@router.get('/entries/{id}')
def get_entry(id: int) -> EntryModel:
    entry = Entry.get_by_id(id)
    if not entry:
        raise HTTPException(status_code=404, detail='その記事は存在しません。')
    return entry.to_dict()


@router.put('/entries/{id}')
def update_entry(id: int, params: EntryModel) -> EntryModel:
    entry = Entry.get_by_id(id)
    if not entry:
        raise HTTPException(status_code=404, detail='その記事は存在しません。')
    params.is_deleted = False
    entry = Entry(**params.model_dump())
    entry.put()
    if entry.tags:
        # 追加されたタグがあれば Tag も更新
        update_tags(entry.tags)
    # entries を抽出するキャッシュを削除
    redis_keys = redis_client.keys(pattern='entries:*')
    # 該当する entry のキャッシュも削除対象に
    redis_keys.append(f'entry:{id}')    
    redis_client.delete(*redis_keys)
    return entry.to_dict()


@router.delete('/entries/{id}')
def delete_entry(id: int) -> None:
    entry = Entry.get_by_id(id)
    entry.is_deleted = True
    entry.put()
    # entries を抽出するキャッシュを削除
    redis_keys = redis_client.keys(pattern='entries:*')
    # 該当する entry のキャッシュも削除対象に
    redis_keys.append(f'entry:{id}')    
    redis_client.delete(*redis_keys)


class TagModel(CamelModel):
    id: int
    name: str
    name_lower: str


@router.get('/tags/')
def fetch_tags() -> list[TagModel]:
    return [tag.to_dict(exclude={'created_at', 'updated_at'}) for tag in Tag.query().fetch()]
