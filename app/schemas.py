from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
    pwd: str
    pwd_expire_days: Optional[int] = 90  # 기본값 예시

class UserRead(UserBase):
    id: int
    pwd_changed_at: datetime
    pwd_expire_days: int
    is_active: bool
    crt_dt: datetime
    updt_dt: datetime

class UserUpdate(BaseModel):
    pwd: Optional[str] = None
    pwd_changed_at: Optional[datetime] = None
    pwd_expire_days: Optional[int] = None
    is_active: Optional[bool] = None

    class Config:
        from_attributes = True