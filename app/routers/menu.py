from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.menu import MenuCreate, MenuRead
from app.crud import menu as menu_crud
from uuid import UUID
from typing import List

router = APIRouter(prefix="/menus", tags=["menus"])

# ✅ 메뉴 등록
@router.post("/", response_model=MenuRead)
async def create_menu(menu: MenuCreate, db: AsyncSession = Depends(get_db)):
    return await menu_crud.create_menu(db, menu)

# ✅ 전체 메뉴 리스트 조회
@router.get("/", response_model=List[MenuRead])
async def read_all_menus(db: AsyncSession = Depends(get_db)):
    return await menu_crud.get_all_menus(db)

# ✅ 단일 메뉴 조회
@router.get("/{menu_id}", response_model=MenuRead)
async def read_menu(menu_id: UUID, db: AsyncSession = Depends(get_db)):
    menu = await menu_crud.get_menu_by_id(db, menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    return menu

# ✅ 메뉴 삭제
@router.delete("/{menu_id}")
async def delete_menu(menu_id: UUID, db: AsyncSession = Depends(get_db)):
    menu = await menu_crud.delete_menu(db, menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    return {"message": "Deleted successfully"}
