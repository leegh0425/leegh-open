from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.menu import Menu
from app.schemas.menu import MenuCreate
##from uuid import UUID

# ✅ 메뉴 생성
async def create_menu(db: AsyncSession, menu_data: MenuCreate):
    new_menu = Menu(**menu_data.dict())
    db.add(new_menu)
    await db.commit()
    await db.refresh(new_menu)
    return new_menu

# ✅ 전체 메뉴 조회
async def get_all_menus(db: AsyncSession):
    result = await db.execute(
        select(Menu).order_by(Menu.id.asc())  # ASC 오름차순, DESC 내림차순
    )
    return result.scalars().all()

# ✅ 단일 메뉴 조회 (id 기준)
async def get_menu_by_id(db: AsyncSession, menu_id: str):
    result = await db.execute(select(Menu).where(Menu.id == menu_id))
    return result.scalar_one_or_none()

# ✅ 메뉴 삭제
async def delete_menu(db: AsyncSession, menu_id: str):
    menu = await get_menu_by_id(db, menu_id)
    if not menu:
        return None
    await db.delete(menu)
    await db.commit()
    return menu
