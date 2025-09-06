from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, or_
from app.models.closing_report import ClosingReport
from app.models.closing_menu_item import ClosingMenuItem
from app.schemas.closing_report import ClosingReportCreate, ClosingReportUpdate
from datetime import datetime
from datetime import date

# 날짜 파싱 함수
def parse_date(date_str: str):
    if "-" not in date_str:
        return datetime.strptime(date_str, "%Y%m%d").date()
    return datetime.strptime(date_str, "%Y-%m-%d").date()

# 1. 신규 마감 등록 (INSERT)
async def create_closing_report(db: AsyncSession, report_data: ClosingReportCreate):
    report = ClosingReport(
        comp_cd=report_data.comp_cd,
        close_date=report_data.close_date,
        today_sales=report_data.today_sales,
        last_week_sales=report_data.last_week_sales,
        emp_cnt=report_data.emp_cnt,
        tb_cnt=report_data.tb_cnt,
        tb_detail=report_data.tb_detail,
        rmrk=report_data.rmrk,
        wait_note=report_data.wait_note,
        pd_amt=report_data.pd_amt,
        is_closed=False,
        crdt=datetime.utcnow(),
    )
    db.add(report)

    # 메뉴 아이템 추가
    for item in report_data.items:
        menu_item = ClosingMenuItem(
            comp_cd=report.comp_cd,
            close_date=report.close_date,
            menu_id=item.menu_id,
            menu_name=item.menu_name,
            qty=item.qty,
            crdt=datetime.utcnow()
        )
        db.add(menu_item)

    await db.commit()
    return report

# 2. 단일 마감 조회 (마감일 기준)
async def get_closing_report_by_date(db: AsyncSession, close_date: date):
    #parsed_date = parse_date(close_date)
    result = await db.execute(
        select(ClosingReport)
        .options(selectinload(ClosingReport.menu_items))
        .where(ClosingReport.close_date == close_date)
    )
    report = result.scalars().first()
    return report

# 3. 마감 수정 (PUT: 헤더 + 전체 메뉴 항목 덮어씀)
async def update_closing_report(db: AsyncSession, close_date: str, report_data: ClosingReportUpdate):
    parsed_date = parse_date(close_date)
    result = await db.execute(
        select(ClosingReport)
        .options(selectinload(ClosingReport.menu_items))
        .where(ClosingReport.close_date == parsed_date)
    )
    report = result.scalars().first()
    if not report or report.is_closed:
        return None

    # 헤더 수정
    report.today_sales = report_data.today_sales
    report.last_week_sales = report_data.last_week_sales
    report.emp_cnt = report_data.emp_cnt
    report.tb_cnt = report_data.tb_cnt
    report.tb_detail = report_data.tb_detail
    report.rmrk = report_data.rmrk
    report.wait_note = report_data.wait_note
    report.pd_amt = report_data.pd_amt

    # 기존 메뉴항목 삭제 후 새로 추가
    await db.execute(
        ClosingMenuItem.__table__.delete().where(
            (ClosingMenuItem.comp_cd == report.comp_cd) & 
            (ClosingMenuItem.close_date == report.close_date)
        )
    )
    for item in report_data.items:
        menu_item = ClosingMenuItem(
            comp_cd=report.comp_cd,
            close_date=report.close_date,
            menu_id=item.menu_id,
            menu_name=item.menu_name,
            qty=item.qty,
            crdt=datetime.utcnow()
        )
        db.add(menu_item)

    await db.commit()
    return report

# 4. 마감/마감취소 (is_closed 플래그 토글)
async def set_report_closed(db: AsyncSession, close_date: str, is_closed: bool):
    parsed_date = parse_date(close_date)
    result = await db.execute(
        select(ClosingReport).where(ClosingReport.close_date == parsed_date)
    )
    report = result.scalars().first()
    if not report:
        return None
    report.is_closed = is_closed
    await db.commit()
    return report


# 5. 기간별 마감 조회
async def get_closing_reports_by_date_range(
    db: AsyncSession, start_date: date, end_date: date
):
    """지정된 기간 내의 모든 마감 보고서를 조회합니다."""
    result = await db.execute(
        select(ClosingReport)
        .options(selectinload(ClosingReport.menu_items))
        .where(ClosingReport.close_date.between(start_date, end_date))
        .order_by(ClosingReport.close_date.asc())
    )
    reports = result.scalars().all()
    return reports

# 6. Top 5 판매 메뉴 조회
async def get_top_selling_menus(db: AsyncSession, start_date: date, end_date: date):
    """지정된 기간 동안 가장 많이 판매된 상위 5개 메뉴를 조회합니다."""
    result = await db.execute(
        select(
            ClosingMenuItem.menu_name,
            func.sum(ClosingMenuItem.qty).label("total_qty"),
        )
        .where(ClosingMenuItem.close_date.between(start_date, end_date))
        .group_by(ClosingMenuItem.menu_name)
        .order_by(func.sum(ClosingMenuItem.qty).desc())
        .limit(5)
    )
    top_menus = result.all()
    return top_menus

# 7. Bottom 5 판매 메뉴 조회
async def get_bottom_selling_menus(db: AsyncSession, start_date: date, end_date: date):
    """지정된 기간 동안 가장 적게 판매된 하위 5개 메뉴를 조회합니다."""
    result = await db.execute(
        select(
            ClosingMenuItem.menu_name,
            func.sum(ClosingMenuItem.qty).label("total_qty"),
        )
        .where(ClosingMenuItem.close_date.between(start_date, end_date))
        .group_by(ClosingMenuItem.menu_name)
        .order_by(func.sum(ClosingMenuItem.qty).asc())  # 판매량 오름차순 정렬
        .limit(5)
    )
    bottom_menus = result.all()
    return bottom_menus

# 8. 기간별 특이사항 조회
async def get_notes_by_date_range(db: AsyncSession, start_date: date, end_date: date):
    """지정된 기간 내에 작성된 특이사항(rmrk, wait_note)을 조회합니다."""
    stmt = (
        select(ClosingReport.close_date, ClosingReport.rmrk, ClosingReport.wait_note)
        .where(
            ClosingReport.close_date.between(start_date, end_date),
            or_(
                ClosingReport.rmrk != None, 
                ClosingReport.wait_note != None
            ),
            or_(
                ClosingReport.rmrk != "", 
                ClosingReport.wait_note != ""
            )
        )
        .order_by(ClosingReport.close_date.desc())
    )
    result = await db.execute(stmt)
    
    notes = []
    for row in result.all():
        if row.rmrk:
            notes.append({"close_date": row.close_date, "note": row.rmrk})
        if row.wait_note:
            notes.append({"close_date": row.close_date, "note": row.wait_note})
            
    return notes
