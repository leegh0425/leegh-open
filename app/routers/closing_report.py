from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.closing_report import ClosingReportCreate
from app.crud.closing_report import create_closing_report  # ✅ 함수 직접 import

router = APIRouter()

@router.post("/")
async def register_closing_report(
    report: ClosingReportCreate,
    db: AsyncSession = Depends(get_db)
):
    result = await create_closing_report(db, report)  # ✅ 이제 정상 호출
    return {
        "message": "마감 등록 완료",
        "comp_cd": result.comp_cd,
        "close_date": str(result.close_date)
    }
