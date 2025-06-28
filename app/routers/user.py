from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.user import UserCreate, UserRead
from app.crud.user import create_user
from app.crud.user import get_users, get_user_by_id
from app.schemas.user import UserRead
from app.schemas.user import UserUpdate
from app.crud.user import update_user
from app.crud.user import delete_user

router = APIRouter()

# insert "USER" 테이블 등록 예제
@router.post("/users", response_model=UserRead)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    return await create_user(db, user)

# 모든 사용자 조회
@router.get("/users", response_model=list[UserRead])
async def list_users(db: AsyncSession = Depends(get_db)):
    return await get_users(db)

# ID로 단일 사용자 조회
@router.get("/users/{user_id}", response_model=UserRead)
async def read_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ID기준으로 Update 처리
@router.put("/users/{user_id}", response_model=UserRead)
async def update_user_api(user_id: int, user_update: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await update_user(db, user_id, user_update)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ID 기준으로 Delete 처리
@router.delete("/users/{user_id}", response_model=UserRead)
async def delete_user_api(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await delete_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user