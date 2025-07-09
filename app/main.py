# main.py (app/)
from fastapi import FastAPI
from app.routers import user, auth, menu # /users , auth, menu API 라우터 임포트
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()   # FastAPI 앱 생성

# users , auth, menu API 라우터 등록
app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(auth.router, tags=["auth"])
app.include_router(menu.router) 

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 운영 땐 도메인 명시 예: ["http://localhost:3000", "https://web-production-2428.up.railway.app"]
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)