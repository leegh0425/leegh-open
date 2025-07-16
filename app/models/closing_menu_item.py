from sqlalchemy import Column, String, Integer, Date, Text, TIMESTAMP, ForeignKeyConstraint
from sqlalchemy.orm import relationship
from app.db import Base

class ClosingMenuItem(Base):
    __tablename__ = "closing_menu_items"

    comp_cd = Column(String, primary_key=True)
    close_date = Column(Date, primary_key=True)
    menu_id = Column(String, primary_key=True)
    menu_name = Column(String)
    qty = Column(Integer)
    crdt = Column(TIMESTAMP)

    __table_args__ = (
        ForeignKeyConstraint(
            ['comp_cd', 'close_date'],
            ['closing_reports.comp_cd', 'closing_reports.close_date'],
            ondelete="CASCADE"
        ),
    )

    report = relationship("ClosingReport", back_populates="menu_items")
