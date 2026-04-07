import logging
import yaml
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from google.oauth2 import id_token
from google.auth.transport import requests

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


@router.get('/test/')
def test():
    return {'message': 'Hello, World!'}
