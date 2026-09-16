"""
Scheme Pydantic Schemas.
Managed by: Member 1 / AI & Data

Future responsibility:
Pydantic schemas for government scheme definitions, benefits, citations, and query responses.
"""

from typing import List, Optional
from pydantic import BaseModel

class SchemeBase(BaseModel):
    id: str
    name: str
    department: str
    state: str
    description: str
    benefits: str
    source_url: str
    source_title: str
    last_verified: str
    required_documents: List[str] = []

class SchemeResponse(SchemeBase):
    pass
