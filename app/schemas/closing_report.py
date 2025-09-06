from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

# --- 메뉴 아이템 등록/조회용 ---
class ClosingMenuItemCreate(BaseModel):
    menu_id: str
    menu_name: str
    qty: int

class ClosingMenuItem(ClosingMenuItemCreate):
    crdt: Optional[datetime] = None   # 조회용(생성일시)

    class Config:
        orm_mode = True

# --- 마감 등록/수정 ---
class ClosingReportBase(BaseModel):
    comp_cd: str
    close_date: date
    today_sales: int
    last_week_sales: Optional[int] = 0
    emp_cnt: Optional[int] = 0
    tb_cnt: Optional[int] = 0
    tb_detail: Optional[str] = ""
    rmrk: Optional[str] = ""
    wait_note: Optional[str] = ""
    pd_amt: Optional[str] = ""

class ClosingReportCreate(ClosingReportBase):
    items: List[ClosingMenuItemCreate]

    class Config:
        from_attributes = True

# --- 마감 수정은 Create와 동일하되, is_closed는 프론트에서 안보내게 할 것 ---
class ClosingReportUpdate(ClosingReportBase):
    items: List[ClosingMenuItemCreate]

# --- 마감 조회/응답용 (메뉴+마감여부+시간 포함) ---
class ClosingReport(ClosingReportBase):
    is_closed: bool = False
    crdt: Optional[datetime] = None
    items: List[ClosingMenuItem] = []

    class Config:
        orm_mode = True

# --- 마감/마감취소 PATCH용 ---
class ClosingReportClosePatch(BaseModel):
    is_closed: bool

# --- 통계용 스키마 ---
class TopMenu(BaseModel):
    menu_name: str
    total_qty: int

class ReportNote(BaseModel):
    close_date: date
    note: str
