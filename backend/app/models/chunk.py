"""SQLAlchemy model for Scheme Chunks with vector embeddings."""

from datetime import datetime
import json
from typing import Any, Dict, List, Optional
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.connection import Base


class SchemeChunk(Base):
    """
    Represents a semantic chunk of a government scheme document
    with associated metadata and vector embedding.
    """
    __tablename__ = "scheme_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=True, index=True)
    chunk_index = Column(Integer, nullable=False, default=0)
    section_title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    metadata_json = Column(Text, nullable=True)
    embedding_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scheme = relationship("Scheme", back_populates="chunks")

    @property
    def metadata_dict(self) -> Dict[str, Any]:
        """Parse metadata_json into a dictionary."""
        if not self.metadata_json:
            return {}
        try:
            return json.loads(self.metadata_json)
        except Exception:
            return {}

    @metadata_dict.setter
    def metadata_dict(self, val: Dict[str, Any]) -> None:
        self.metadata_json = json.dumps(val, ensure_ascii=False)

    @property
    def embedding(self) -> Optional[List[float]]:
        """Parse embedding_json into a list of floats."""
        if not self.embedding_json:
            return None
        try:
            return json.loads(self.embedding_json)
        except Exception:
            return None

    @embedding.setter
    def embedding(self, val: Optional[List[float]]) -> None:
        self.embedding_json = json.dumps(val) if val is not None else None
