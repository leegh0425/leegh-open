from fastapi import APIRouter, Depends, HTTPException, Path, Body, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from datetime import date
from typing import List
from app.schemas.closing_report import (
    ClosingReport,
    ClosingReportClosePatch,
    ClosingReportCreate,
    ClosingReportUpdate,
    TopMenu,
    ReportNote,
)
from app.crud.closing_report import (
    create_closing_report,
    get_closing_report_by_date,
    update_closing_report,
    set_report_closed,
    get_closing_reports_by_date_range,
    get_top_selling_menus,
    get_bottom_selling_menus,
    get_notes_by_date_range,
)

router = APIRouter()


# 0. 기간별 마감 조회 (GET)
@router.get("/", response_model=List[ClosingReport], summary="기간별 마감 조회")
async def read_reports_by_date_range(
    start_date: date = Query(..., description="조회 시작일"),
    end_date: date = Query(..., description="조회 종료일"),
    db: AsyncSession = Depends(get_db),
):
    """
    지정된 기간 내의 모든 마감 보고서 목록을 조회합니다.
    """
    reports = await get_closing_reports_by_date_range(
        db, start_date=start_date, end_date=end_date
    )
    return reports


@router.get("/stats/top-menus", response_model=List[TopMenu], summary="기간별 인기 메뉴 TOP 5 조회")
async def read_top_menus(
    start_date: date = Query(..., description="조회 시작일"),
    end_date: date = Query(..., description="조회 종료일"),
    db: AsyncSession = Depends(get_db),
):
    """
    지정된 기간 동안 가장 많이 판매된 상위 5개 메뉴를 반환합니다.
    """
    top_menus = await get_top_selling_menus(db, start_date=start_date, end_date=end_date)
    return top_menus


@router.get("/stats/bottom-menus", response_model=List[TopMenu], summary="기간별 개선 필요 메뉴 TOP 5 조회")
async def read_bottom_menus(
    start_date: date = Query(..., description="조회 시작일"),
    end_date: date = Query(..., description="조회 종료일"),
    db: AsyncSession = Depends(get_db),
):
    """
    지정된 기간 동안 가장 적게 판매된 하위 5개 메뉴를 반환합니다.
    """
    bottom_menus = await get_bottom_selling_menus(db, start_date=start_date, end_date=end_date)
    return bottom_menus


@router.get("/stats/notes", response_model=List[ReportNote], summary="기간별 특이사항 조회")
async def read_notes(
    start_date: date = Query(..., description="조회 시작일"),
    end_date: date = Query(..., description="조회 종료일"),
    db: AsyncSession = Depends(get_db),
):
    """
    지정된 기간 내의 특이사항 목록을 반환합니다.
    """
    notes = await get_notes_by_date_range(db, start_date=start_date, end_date=end_date)
    return notes


# 1. 마감 등록 (POST)
@router.post("/", summary="마감 신규 등록")
async def register_closing_report(
    report: ClosingReportCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await create_closing_report(db, report)
    if not result:
        raise HTTPException(status_code=500, detail="등록 실패")
    return {
        "message": "마감 등록 완료",
        "comp_cd": result.comp_cd,
        "close_date": str(result.close_date),
    }

# 2. 마감 단일 조회 (GET)
@router.get("/{close_date}", summary="특정일자 마감 조회")
async def get_report_by_date(
    close_date: date = Path(..., description="YYYYMMDD 또는 YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
):
    report = await get_closing_report_by_date(db, close_date)
    if not report:
         # 404 대신 빈 응답
        return {
            "message": "등록된 마감 정보가 없습니다.",
            "data": None
        }
    return report

# 3. 마감 수정 (PUT)
@router.put("/{close_date}", summary="마감 수정")
async def update_report(
    close_date: str,
    report: ClosingReportUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated = await update_closing_report(db, close_date, report)
    if not updated:
        raise HTTPException(status_code=404, detail="수정 대상이 없거나 마감상태입니다.")
    return {"message": "수정 완료", "close_date": close_date}

# 4. 마감/마감취소 처리 (PATCH)
@router.patch("/{close_date}/close", summary="마감/마감취소 처리")
async def close_report(
    close_date: str,
    payload: ClosingReportClosePatch,
    db: AsyncSession = Depends(get_db),
):
    is_closed = payload.is_closed
    updated = await set_report_closed(db, close_date, is_closed)
    if not updated:
        raise HTTPException(status_code=404, detail="마감 내역이 없습니다.")
    return {
        "message": "마감 처리 완료" if is_closed else "마감 취소 완료",
        "close_date": close_date,
        "is_closed": is_closed,
    }
