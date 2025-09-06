from pydantic import BaseModel
from typing import Optional
#from uuid import UUID

# ✅ 메뉴 생성 요청용 스키마
class MenuCreate(BaseModel):
    category: str
    name: str
    unit: Optional[str] = None
    price: Optional[int] = None
    note: Optional[str] = None

# ✅ 메뉴 조회 응답용 스키마 (id 포함)
class MenuRead(MenuCreate):
    id: str

    class Config:
        orm_mode = True
