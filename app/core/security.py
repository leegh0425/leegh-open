from datetime import datetime, timedelta
from jose import jwt

import os
from dotenv import load_dotenv

# 환경변수 관리 (실 서비스용)
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "Sunny90218^^*")  # 환경변수 미설정시 기본값
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(subject: str) -> str:
    """
    JWT 토큰 생성 함수
    :param subject: 유저 고유값(ID, email 등)
    :return: JWT 문자열
    """
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """
    JWT 토큰 복호화 (만료/유효성 체크)
    :param token: JWT 문자열
    :return: payload dict (exp/subject 등)
    :raises: jose.exceptions.JWTError, jose.exceptions.ExpiredSignatureError
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception as e:
        # 로깅 후 401 에러 등 처리 필요
        raise e
