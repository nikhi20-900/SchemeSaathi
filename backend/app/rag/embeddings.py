"""
Multilingual Text Embedding Generation with Gemini & Fallback.
Owned by: Member 1 (AI + RAG + Data)

Provides vector embeddings for scheme chunks and search queries using:
1. Google Gemini Embeddings API (text-embedding-004) when GEMINI_API_KEY is configured.
2. Deterministic hashed dense vector fallback when offline or no API key is provided.
"""

import hashlib
import logging
import math
import re
from typing import List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Fallback vector dimension for offline/local deterministic search
FALLBACK_DIM = 256
EMBEDDING_MODEL = "gemini-embedding-001"


def _deterministic_fallback_embedding(text: str, dim: int = FALLBACK_DIM) -> List[float]:
    """
    Generate a normalized deterministic dense embedding vector from text.
    Uses n-gram and token feature hashing with L2 normalization.
    """
    if not text:
        return [0.0] * dim

    vec = [0.0] * dim
    tokens = re.findall(r"\w+", text.lower())

    for i, token in enumerate(tokens):
        # Unigram hash
        h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
        vec[h % dim] += 1.0

        # Bigram hash
        if i < len(tokens) - 1:
            bigram = f"{token}_{tokens[i+1]}"
            hb = int(hashlib.sha256(bigram.encode("utf-8")).hexdigest(), 16)
            vec[hb % dim] += 1.5

    # L2 normalize
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        return [round(x / norm, 6) for x in vec]
    return [0.0] * dim


def generate_embedding(text: str) -> List[float]:
    """
    Generate a vector embedding for a single text string.
    Uses Gemini API if available, otherwise falls back to deterministic vector.
    """
    if not text or not text.strip():
        return [0.0] * FALLBACK_DIM

    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            result = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=text,
            )
            # Handle response structure
            if hasattr(result, "embeddings") and result.embeddings:
                return list(result.embeddings[0].values)
            if hasattr(result, "embedding") and result.embedding:
                return list(result.embedding.values)
        except Exception as e:
            logger.warning(
                f"Gemini embedding API call failed: {e}. Falling back to deterministic embedding."
            )

    return _deterministic_fallback_embedding(text)


def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts.
    Falls back to batch deterministic embeddings if Gemini API is unavailable.
    """
    if not texts:
        return []

    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            result = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=texts,
            )
            if hasattr(result, "embeddings") and result.embeddings:
                return [list(emb.values) for emb in result.embeddings]
        except Exception as e:
            logger.warning(
                f"Gemini batch embedding call failed: {e}. Using deterministic fallback."
            )

    return [_deterministic_fallback_embedding(t) for t in texts]


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Compute cosine similarity between two numeric vectors.
    Returns a score between -1.0 and 1.0 (typically 0.0 to 1.0 for embeddings).
    """
    if not vec1 or not vec2:
        return 0.0
    if len(vec1) != len(vec2):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))

    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0

    return dot_product / (norm1 * norm2)
