from fastapi import APIRouter

router = APIRouter(prefix='/admin', tags=['admin'])

@router.get('/api/test/')
def test():
    return 'TEST'
