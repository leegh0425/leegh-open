# db.py DB 연결 소스
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()  # .env 파일의 환경변수 읽기

# .env에 저장된 DATABASE_URL을 가져온다
DATABASE_URL = os.getenv("DATABASE_URL")

# 비동기로 사용할 데이터베이스 엔진 생성 (echo=True로 SQL문 출력됨)
engine = create_async_engine(DATABASE_URL, echo=True)

# 세션 객체 생성: DB 작업 시 실제로 DB에 연결해서 쿼리할 때 사용
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# SQLAlchemy의 기본 Base 객체 (테이블 생성할 때 사용)
Base = declarative_base()

# FastAPI Dependency용 비동기 DB 세션 생성 함수
async def get_db():
    async with SessionLocal() as session:  # 세션 열고
        yield session                      # 함수가 끝나면 세션 자동종료