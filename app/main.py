from fastapi import FastAPI
from app.routers import user   # /users API 라우터 임포트

app = FastAPI()                # FastAPI 앱 생성
app.include_router(user.router) # users API 라우터 등록