"""Document database model."""

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scheme_id = Column(String, ForeignKey("schemes.id"), nullable=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=True, index=True)
    document_type = Column(String, nullable=False)
    required = Column(Boolean, nullable=False, default=False)
    description = Column(Text, nullable=True)
    file_path = Column(String, nullable=True)
    ocr_text = Column(Text, nullable=True)
    extracted_data = Column(JSON, nullable=True)
    verification_status = Column(String, nullable=False, default="PENDING")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    scheme = relationship("Scheme", back_populates="documents")
    profile = relationship("UserProfile", back_populates="documents")
