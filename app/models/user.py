# models.py 간단한 모델 파일 추가
from sqlalchemy import Column, Integer, String, DateTime, Boolean  # ← DateTime, Boolean 추가!
from sqlalchemy.orm import declarative_base
from app.db import Base  # Base는 테이블 생성시 반드시 필요!
from sqlalchemy.sql import func

# User 테이블 정의 (ORM 객체)
class User(Base):
    __tablename__ = "users"                   # 실제 DB에 만들어질 테이블 이름
    id   = Column(Integer, primary_key=True, index=True)   # id 컬럼 (PK, 인덱스)
    name = Column(String, unique=True, nullable=False)    # 로그인 ID
    pwd  = Column(String, nullable=False)
    pwd_changed_at  = Column(DateTime, default=func.now()) # 비번 변경일
    pwd_expire_days = Column(Integer, default=90)         # 변경주기(90일)
    is_active  = Column(Boolean, default=True)             # 활성여부
    crt_dt  = Column(DateTime, default=func.now())     # 생성일
    updt_dt = Column(DateTime, default=func.now(), onupdate=func.now()) # 수정일