"""Database seeding utilities."""

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.connection import Base, SessionLocal, engine
from app.eligibility.scheme_rules import EXAMPLE_SCHEMES
from app.models import Document, EligibilityRule, Evidence, Scheme, SchemeChunk, UserProfile


REQUIRED_DOCUMENTS = {
    "KA-SCHOLARSHIP-001": [
        ("Income Certificate", "Latest family income certificate from competent authority"),
        ("Caste Certificate", "Valid OBC/Category certificate"),
        ("Domicile Certificate", "Karnataka domicile certificate"),
    ],
    "IN-PMKVY-001": [
        ("Aadhaar", "Valid Aadhaar card linked with bank details"),
    ],
}


DEFAULT_PROFILE = {
    "name": "Nikhil Kumar",
    "age": 20,
    "state": "Karnataka",
    "district": "Bengaluru Urban",
    "education": "Undergraduate",
    "course": "BCA",
    "annual_income": 240000.0,
    "student_status": True,
    "category": "2A",
}


def seed_database(db: Session) -> None:
    existing_schemes = {
        scheme.id: scheme
        for scheme in db.execute(
            select(Scheme).options(selectinload(Scheme.eligibility_rules))
        ).scalars()
    }

    for scheme_data in EXAMPLE_SCHEMES:
        scheme = existing_schemes.get(scheme_data["id"])
        if scheme is None:
            scheme = Scheme(
                id=scheme_data["id"],
                name=scheme_data["name"],
                department=scheme_data.get("department"),
                state=scheme_data.get("state"),
                description=scheme_data.get("description"),
                benefits=scheme_data.get("benefits"),
            )
            db.add(scheme)
            db.flush()

        if not scheme.eligibility_rules:
            for rule in scheme_data.get("eligibility_rules", []):
                db.add(
                    EligibilityRule(
                        scheme_id=scheme.id,
                        field=rule["field"],
                        operator=rule["operator"],
                        value=rule["value"],
                        description=rule.get("description"),
                    )
                )

        existing_required_types = {
            row[0]
            for row in db.execute(
                select(Document.document_type).where(
                    Document.scheme_id == scheme.id,
                    Document.required.is_(True),
                )
            ).all()
        }

        for document_type, description in REQUIRED_DOCUMENTS.get(scheme.id, []):
            if document_type not in existing_required_types:
                db.add(
                    Document(
                        scheme_id=scheme.id,
                        document_type=document_type,
                        required=True,
                        description=description,
                        verification_status="REQUIRED",
                    )
                )

        has_evidence = db.execute(
            select(Evidence.id).where(Evidence.scheme_id == scheme.id).limit(1)
        ).first()
        if not has_evidence:
            db.add(
                Evidence(
                    scheme_id=scheme.id,
                    source_title=f"{scheme.name} - Official Summary",
                    source_url="https://www.india.gov.in/",
                    content=scheme.description,
                    page_or_section="Overview",
                )
            )

    has_profile = db.execute(select(UserProfile.id).limit(1)).first()
    if not has_profile:
        db.add(UserProfile(**DEFAULT_PROFILE))

    db.commit()

    # Seed scheme chunks if scheme_chunks table is empty
    has_chunks = db.execute(select(SchemeChunk.id).limit(1)).first()
    if not has_chunks:
        try:
            from app.rag.ingestion import ingest_knowledge_base_json
            ingest_knowledge_base_json(db=db, clear_existing=False)
        except Exception:
            pass


def init_database() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
    print("Database initialized and seeded.")
