"""
Eligibility Rules Database Model.
Managed by: Member 2 / Eligibility Engine

SQLAlchemy model representing stored eligibility rules.
In Phase 2 these are kept in-memory (see scheme_rules.py).
This model is provided for future persistence.
"""

from typing import Any, Optional

from sqlalchemy import Column, Integer, String, JSON
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class EligibilityRule(Base):
    """
    Represents a single eligibility criterion attached to a government scheme.

    Columns:
      id          – auto-incrementing primary key
      scheme_id   – foreign key / identifier for the scheme
      field       – profile field name (e.g. "age", "state")
      operator    – comparison operator (e.g. "<=", "in")
      value       – required value (stored as JSON for flexibility)
      description – human-readable label
    """

    __tablename__ = "eligibility_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scheme_id = Column(String, nullable=False, index=True)
    field = Column(String, nullable=False)
    operator = Column(String, nullable=False)
    value = Column(JSON, nullable=False)
    description = Column(String, nullable=True)

    def __repr__(self) -> str:
        return (
            f"<EligibilityRule(scheme_id={self.scheme_id!r}, "
            f"field={self.field!r}, operator={self.operator!r}, "
            f"value={self.value!r})>"
        )

    def to_rule_dict(self) -> dict:
        """Convert the ORM row into the dict format expected by the engine."""
        return {
            "field": self.field,
            "operator": self.operator,
            "value": self.value,
            "description": self.description or self.field.replace("_", " ").title(),
        }
