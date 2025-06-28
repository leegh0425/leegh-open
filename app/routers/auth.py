from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.crud.user import get_user_by_name
from app.utils.password import verify_password
from app.core.security import create_access_token

router = APIRouter()

@router.post("/auth/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_by_name(db, req.username)
    if not user:
        raise HTTPException(status_code=400, detail="아이디 혹은 비밀번호 오류")

    # 패스워드 체크 (비밀번호는 해시 검증)
    if not verify_password(req.password, user.pwd):
        raise HTTPException(status_code=400, detail="아이디 혹은 비밀번호 오류")
    
    # JWT 발급
    token = create_access_token(subject=user.name)
    return {"access_token": token}
