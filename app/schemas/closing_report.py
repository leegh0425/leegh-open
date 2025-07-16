from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class ClosingMenuItemCreate(BaseModel):
    menu_id: str
    menu_name: str
    qty: int

class ClosingReportCreate(BaseModel):
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
    items: List[ClosingMenuItemCreate]

    class Config:
        from_attributes = True 
