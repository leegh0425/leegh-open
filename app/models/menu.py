from sqlalchemy import Column, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.db import Base
import sqlalchemy

class Menu(Base):
    __tablename__ = "menu"

   # id = Column(UUID(as_uuid=True), primary_key=True, server_default=sqlalchemy.text("gen_random_uuid()"))
    id = Column(Text, primary_key=True)  # 여기만 수정!
    category = Column(Text, nullable=False)
    name = Column(Text, nullable=False)
    unit = Column(Text)
    price = Column(Integer)
    note = Column(Text)
