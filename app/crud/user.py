from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.schemas import user
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.user import UserUpdate
from datetime import datetime
from app.utils.password import verify_password

async def authenticate_user(db, name: str, password: str):
    user = await get_user_by_name(db, name)
    if not user:
        return None
    if not verify_password(password, user.pwd):
        return None
    return user


async def get_user_by_name(db, name: str):
    result = await db.execute(select(User).where(User.name == name))
    return result.scalar_one_or_none()

# 이름으로 유저 1명 찾기 (SELECT * FROM users WHERE name=...)
# async def get_user_by_name(db: AsyncSession, name: str):
#     result = await db.execute(select(models.User).where(models.User.name == name))
#     return result.scalar_one_or_none()

# 회원등록 함수
async def create_user(db: AsyncSession, user: UserCreate):
    new_user = User(
        name=user.name,
        pwd=user.pwd,
        pwd_expire_days=user.pwd_expire_days
        # pwd_changed_at, created_at, updated_at 등은 기본값 자동!
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

# 모든 사용자 조회
async def get_users(db: AsyncSession):
    result = await db.execute(select(User))
    return result.scalars().all()

# ID로 단일 사용자 조회
async def get_user_by_id(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

# Update(수정)
async def update_user(db: AsyncSession, user_id: int, user_update: UserUpdate):
    user = await get_user_by_id(db, user_id)
    if not user:
        return None    
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if isinstance(value, datetime) and value.tzinfo is not None:
            update_data[key] = value.replace(tzinfo=None)
    for var, value in update_data.items():
        setattr(user, var, value)
    await db.commit()
    await db.refresh(user)
    return user

# Delete(삭제)
async def delete_user(db: AsyncSession, user_id: int):
    user = await get_user_by_id(db, user_id)
    if not user:
        return None
    await db.delete(user)
    await db.commit()
    return user