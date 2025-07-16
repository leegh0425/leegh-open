import uuid
from sqlalchemy import Column, String, Integer, Date, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db import Base

class ClosingReport(Base):
    __tablename__ = "closing_reports"

    comp_cd = Column(String, primary_key=True)   # 회사코드
    close_date = Column(Date, primary_key=True)  # 마감 일자

    today_sales = Column(Integer)
    last_week_sales = Column(Integer)
    emp_cnt = Column(Integer)
    tb_cnt = Column(Integer)
    tb_detail = Column(Text)
    rmrk = Column(Text)
    wait_note = Column(Text)
    pd_amt = Column(String)
    crdt = Column(TIMESTAMP)

    menu_items = relationship("ClosingMenuItem", back_populates="report", cascade="all, delete-orphan")
