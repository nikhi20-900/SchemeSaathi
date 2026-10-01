"""Eligibility rules database model."""

from sqlalchemy import JSON, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.connection import Base


class EligibilityRule(Base):
    __tablename__ = "eligibility_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    field = Column(String, nullable=False)
    operator = Column(String, nullable=False)
    value = Column(JSON, nullable=False)
    description = Column(String, nullable=True)

    scheme = relationship("Scheme", back_populates="eligibility_rules")

    def to_rule_dict(self) -> dict:
        return {
            "field": self.field,
            "operator": self.operator,
            "value": self.value,
            "description": self.description or self.field.replace("_", " ").title(),
        }
