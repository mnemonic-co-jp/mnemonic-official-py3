import logging
import yaml
import datetime
import redis
from urllib.parse import parse_qs, urlparse
import requests as http_client
from fastapi import APIRouter, Request, Response, Depends, HTTPException
from fastapi.responses import JSONResponse
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


# Web クライアントの code 交換は PKCE だけでは通らず client_secret が要る。
# 秘密はここに留め、ブラウザは code と code_verifier だけを渡す。
oauth_router = APIRouter(prefix='/admin/api')
GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'


def _form_value(form: dict[str, list[str]], name: str) -> str | None:
    values = form.get(name)
    if not values or not values[0]:
        return None
    return values[0]


def _valid_redirect_uri(redirect_uri: str) -> bool:
    parsed = urlparse(redirect_uri)
    return (
        parsed.scheme in ('http', 'https')
        and bool(parsed.netloc)
        and parsed.path == '/admin'
        and not parsed.query
        and not parsed.fragment
        and not parsed.username
    )


@oauth_router.post('/oauth/token')
async def exchange_google_token(request: Request) -> Response:
    client_secret = SECRET['google'].get('client_secret')
    if not client_secret:
        logger.error('google.client_secret is not set')
        return JSONResponse(status_code=500, content={
            'error': 'server_error',
            'error_description': 'Google client secret is not configured.',
        })

    form = parse_qs((await request.body()).decode(), keep_blank_values=False)
    grant_type = _form_value(form, 'grant_type')
    client_id = _form_value(form, 'client_id')
    if client_id and client_id != SECRET['google']['client_id']:
        return JSONResponse(status_code=400, content={
            'error': 'invalid_client',
            'error_description': 'Invalid client.',
        })

    payload = {
        'grant_type': grant_type,
        'client_id': SECRET['google']['client_id'],
        'client_secret': client_secret,
    }
    if grant_type == 'authorization_code':
        code = _form_value(form, 'code')
        redirect_uri = _form_value(form, 'redirect_uri')
        code_verifier = _form_value(form, 'code_verifier')
        if not code or not redirect_uri or not code_verifier or not _valid_redirect_uri(redirect_uri):
            return JSONResponse(status_code=400, content={
                'error': 'invalid_request',
                'error_description': 'Missing or invalid code exchange parameters.',
            })
        payload.update({
            'code': code,
            'redirect_uri': redirect_uri,
            'code_verifier': code_verifier,
        })
    elif grant_type == 'refresh_token':
        refresh_token = _form_value(form, 'refresh_token')
        if not refresh_token:
            return JSONResponse(status_code=400, content={
                'error': 'invalid_request',
                'error_description': 'Missing refresh token.',
            })
        payload['refresh_token'] = refresh_token
        scope = _form_value(form, 'scope')
        if scope:
            payload['scope'] = scope
    else:
        return JSONResponse(status_code=400, content={
            'error': 'unsupported_grant_type',
            'error_description': 'Unsupported grant type.',
        })

    try:
        token_response = http_client.post(GOOGLE_TOKEN_ENDPOINT, data=payload, timeout=10)
    except http_client.RequestException as error:
        logger.error('Google token endpoint request failed: %s', error.__class__.__name__)
        return JSONResponse(status_code=502, content={
            'error': 'server_error',
            'error_description': 'Token endpoint is unavailable.',
        })

    try:
        body = token_response.json()
    except ValueError:
        logger.error('Google token endpoint returned a non-JSON body: %s', token_response.status_code)
        return JSONResponse(status_code=502, content={
            'error': 'server_error',
            'error_description': 'Token endpoint returned an invalid response.',
        })

    if token_response.status_code >= 400:
        error_code = body.get('error') if isinstance(body, dict) else None
        logger.error('Google token endpoint failed: %s %s', token_response.status_code, error_code)
    return JSONResponse(status_code=token_response.status_code, content=body)


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
