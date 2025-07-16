from sqlalchemy.ext.asyncio import AsyncSession
from app.models.closing_report import ClosingReport
from app.models.closing_menu_item import ClosingMenuItem
from app.schemas.closing_report import ClosingReportCreate
from datetime import datetime

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
        crdt=datetime.utcnow()
    )
    db.add(report)

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
