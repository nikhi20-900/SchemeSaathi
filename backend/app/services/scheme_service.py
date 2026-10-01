"""Scheme data access service backed by SQLAlchemy."""

from __future__ import annotations

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Evidence, Scheme


class SchemeService:
    @staticmethod
    def _to_dict(scheme: Scheme) -> dict[str, Any]:
        return {
            "id": scheme.id,
            "name": scheme.name,
            "department": scheme.department,
            "state": scheme.state,
            "description": scheme.description,
            "benefits": scheme.benefits,
            "eligibility_rules": [rule.to_rule_dict() for rule in scheme.eligibility_rules],
        }

    @staticmethod
    def list_schemes(db: Session) -> list[dict[str, Any]]:
        schemes = db.execute(
            select(Scheme)
            .options(selectinload(Scheme.eligibility_rules))
            .order_by(Scheme.id.asc())
        ).scalars()
        return [SchemeService._to_dict(scheme) for scheme in schemes]

    @staticmethod
    def get_scheme_by_id(db: Session, scheme_id: str) -> dict[str, Any] | None:
        normalized = scheme_id.strip().upper()
        scheme = db.execute(
            select(Scheme)
            .options(selectinload(Scheme.eligibility_rules))
            .where(func.upper(Scheme.id) == normalized)
            .limit(1)
        ).scalar_one_or_none()
        if scheme is None:
            return None
        return SchemeService._to_dict(scheme)

    @staticmethod
    def list_evidence_for_scheme(db: Session, scheme_id: str) -> list[dict[str, Any]]:
        normalized = scheme_id.strip().upper()
        records = db.execute(
            select(Evidence)
            .where(func.upper(Evidence.scheme_id) == normalized)
            .order_by(Evidence.id.asc())
        ).scalars()
        return [
            {
                "id": record.id,
                "scheme_id": record.scheme_id,
                "source_url": record.source_url,
                "source_title": record.source_title,
                "content": record.content,
                "page_or_section": record.page_or_section,
            }
            for record in records
        ]
