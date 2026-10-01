"""
Pydantic Schemas for AI Assistant & RAG Subsystem.
Owned by: Member 1 & Member 4
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class AssistantQueryRequest(BaseModel):
    """User inquiry request to the AI Assistant."""
    query: str = Field(..., description="Natural language question about government schemes", min_length=2)
    language: Optional[str] = Field("en", description="Preferred response language (en, hi, kn)")
    state: Optional[str] = Field(None, description="Optional state filter (e.g. Karnataka, All India)")
    category: Optional[str] = Field(None, description="Optional category filter (e.g. OBC, SC, ST, General)")
    top_k: Optional[int] = Field(4, description="Maximum number of context chunks to retrieve", ge=1, le=10)


class SourceCitation(BaseModel):
    """Citation metadata for a retrieved government source."""
    scheme_id: str
    scheme_name: str
    department: Optional[str] = None
    state: Optional[str] = None
    section_title: Optional[str] = None
    source_title: Optional[str] = None
    source_url: Optional[str] = None
    relevance_score: Optional[float] = None
    matched_snippet: Optional[str] = None


class AssistantQueryResponse(BaseModel):
    """AI Assistant grounded query response with verified citations."""
    query: str
    language: str
    response: str
    sources: List[SourceCitation] = []
    matched_schemes_count: int = 0
    disclaimer: str
