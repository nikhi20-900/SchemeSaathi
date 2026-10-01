"""Evidence database model."""

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    source_url = Column(String, nullable=True)
    source_title = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    page_or_section = Column(String, nullable=True)

    scheme = relationship("Scheme", back_populates="evidence_records")
