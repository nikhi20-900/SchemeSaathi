"""
Pydantic Schemas for AI Assistant & RAG Subsystem.
Owned by: Member 1 & Member 4
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ConversationMessage(BaseModel):
    """A single turn in a conversation."""
    role: str = Field(..., description="Speaker role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class AssistantQueryRequest(BaseModel):
    """User inquiry request to the AI Assistant."""
    query: str = Field(..., description="Natural language question about government schemes", min_length=2)
    language: Optional[str] = Field("en", description="Preferred response language (en, hi, kn)")
    state: Optional[str] = Field(None, description="Optional state filter (e.g. Karnataka, All India)")
    category: Optional[str] = Field(None, description="Optional category filter (e.g. OBC, SC, ST, General)")
    top_k: Optional[int] = Field(4, description="Maximum number of context chunks to retrieve", ge=1, le=10)
    conversation_history: Optional[List[ConversationMessage]] = Field(
        None, description="Optional conversation history for follow-up questions"
    )


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


class IngestionStatusResponse(BaseModel):
    """Response schema for ingestion status/stats."""
    total_schemes: int
    total_chunks: int
    total_evidence_records: int
    schemes_by_state: Dict[str, int] = {}
    timestamp: str


class IngestionTriggerResponse(BaseModel):
    """Response schema for triggering ingestion."""
    status: str
    total_chunks_created: int
    message: str


class LanguageInfo(BaseModel):
    """Information about a supported language."""
    code: str
    name: str
    native_name: str


class SupportedLanguagesResponse(BaseModel):
    """List of supported languages."""
    languages: List[LanguageInfo]
