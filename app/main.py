# main.py (app/)
from fastapi import FastAPI
from app.routers import user, auth # /users , auth API 라우터 임포트

app = FastAPI()   # FastAPI 앱 생성

# users , auth API 라우터 등록
app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(auth.router, tags=["auth"])

