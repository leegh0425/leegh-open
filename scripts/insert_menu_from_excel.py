import pandas as pd
import asyncio
import os, sys
from app.db import SessionLocal
from app.models.menu import Menu
from sqlalchemy.ext.asyncio import AsyncSession

# sys.path 추가는 이미 하신 걸 유지
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

EXCEL_PATH = "scripts/매장 메뉴리스트.xlsx"

async def insert_menus_from_excel():
    df = pd.read_excel(EXCEL_PATH)

    # 1. 컬럼명 공백 제거
    df.columns = df.columns.str.strip()

    # 컬럼명 통일
    df.rename(columns={
        "카테고리": "category",
        "메뉴명": "name",
        "판매단위": "unit",
        "판매금액": "price",
        "비고": "note"
    }, inplace=True)

    # NaN을 None으로 변경
    df = df.where(pd.notnull(df), None)

    # 안전하게 int로 변환하는 함수
    def safe_int(val):
        try:
            return int(val)
        except (ValueError, TypeError):
            return None

    menus = [
        Menu(
            category=row["category"],
            name=row["name"],
            unit=row["unit"],
            price=safe_int(row["price"]),
            note=row["note"]
        )
        for _, row in df.iterrows()
    ]

    async with SessionLocal() as session:
        session: AsyncSession
        session.add_all(menus)
        await session.commit()
        print(f"{len(menus)}개의 메뉴가 추가되었습니다.")

if __name__ == "__main__":
    asyncio.run(insert_menus_from_excel())
