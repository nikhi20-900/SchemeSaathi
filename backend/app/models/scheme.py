"""Government scheme database model."""

from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=True)
    state = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)

    eligibility_rules = relationship(
        "EligibilityRule",
        back_populates="scheme",
        cascade="all, delete-orphan",
    )
    documents = relationship("Document", back_populates="scheme")
    evidence_records = relationship("Evidence", back_populates="scheme")
    chunks = relationship("SchemeChunk", back_populates="scheme", cascade="all, delete-orphan")
