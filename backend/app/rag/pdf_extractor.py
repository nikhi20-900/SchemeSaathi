"""
PDF Document Text Extraction for Government Scheme PDFs.
Owned by: Member 1 (AI + RAG + Data)

Extracts text from official government PDF documents using pdfplumber
(primary) with PyPDF2 fallback. Handles multi-column layouts, scanned
headers, and typical government gazette formatting.
"""

import logging
import re
from pathlib import Path
from typing import List, Optional

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str, max_pages: Optional[int] = None) -> str:
    """
    Extract text from a PDF file.

    Uses pdfplumber as the primary extractor for its superior handling of
    multi-column layouts common in government documents. Falls back to
    PyPDF2 if pdfplumber is unavailable.

    Args:
        file_path: Path to the PDF file.
        max_pages: Optional limit on the number of pages to extract.

    Returns:
        Extracted text content as a single string.
    """
    path = Path(file_path)
    if not path.exists():
        logger.warning(f"PDF file not found: {file_path}")
        return ""

    if path.suffix.lower() != ".pdf":
        logger.warning(f"Not a PDF file: {file_path}")
        return ""

    # Try pdfplumber first (better table/column handling for govt docs)
    text = _extract_with_pdfplumber(str(path), max_pages)
    if text and len(text.strip()) > 50:
        return _clean_pdf_text(text)

    # Fallback to PyPDF2
    text = _extract_with_pypdf2(str(path), max_pages)
    if text and len(text.strip()) > 50:
        return _clean_pdf_text(text)

    logger.warning(f"Could not extract meaningful text from PDF: {file_path}")
    return ""


def _extract_with_pdfplumber(file_path: str, max_pages: Optional[int] = None) -> str:
    """Extract text using pdfplumber library."""
    try:
        import pdfplumber  # type: ignore
    except ImportError:
        logger.debug("pdfplumber not installed, skipping.")
        return ""

    pages_text: List[str] = []
    try:
        with pdfplumber.open(file_path) as pdf:
            page_limit = max_pages or len(pdf.pages)
            for i, page in enumerate(pdf.pages[:page_limit]):
                page_text = page.extract_text()
                if page_text:
                    pages_text.append(page_text)

                # Also extract tables as text
                tables = page.extract_tables()
                for table in tables:
                    if table:
                        for row in table:
                            if row:
                                cells = [str(c).strip() if c else "" for c in row]
                                pages_text.append(" | ".join(cells))
    except Exception as e:
        logger.warning(f"pdfplumber extraction failed for {file_path}: {e}")
        return ""

    return "\n\n".join(pages_text)


def _extract_with_pypdf2(file_path: str, max_pages: Optional[int] = None) -> str:
    """Extract text using PyPDF2 library."""
    try:
        from PyPDF2 import PdfReader  # type: ignore
    except ImportError:
        logger.debug("PyPDF2 not installed, skipping.")
        return ""

    pages_text: List[str] = []
    try:
        reader = PdfReader(file_path)
        page_limit = max_pages or len(reader.pages)
        for page in reader.pages[:page_limit]:
            page_text = page.extract_text()
            if page_text:
                pages_text.append(page_text)
    except Exception as e:
        logger.warning(f"PyPDF2 extraction failed for {file_path}: {e}")
        return ""

    return "\n\n".join(pages_text)


def _clean_pdf_text(text: str) -> str:
    """
    Clean and normalize text extracted from PDFs.
    Handles common artifacts from government document PDFs:
    - Excessive whitespace and line breaks
    - Page numbers and headers/footers
    - Encoding artifacts
    """
    if not text:
        return ""

    # Remove common PDF artifacts
    # Page numbers like "Page 1 of 10" or standalone numbers
    text = re.sub(r"\bPage\s+\d+\s+of\s+\d+\b", "", text, flags=re.IGNORECASE)

    # Remove standalone page numbers on their own line
    text = re.sub(r"^\s*\d{1,3}\s*$", "", text, flags=re.MULTILINE)

    # Remove excessive whitespace but preserve paragraph breaks
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)

    # Clean up lines
    lines = [line.strip() for line in text.split("\n")]
    cleaned_lines = [line for line in lines if line]

    return "\n".join(cleaned_lines)


def extract_pdf_metadata(file_path: str) -> dict:
    """
    Extract metadata from a PDF file (title, author, creation date, etc.).
    Useful for automatic source attribution.
    """
    path = Path(file_path)
    if not path.exists() or path.suffix.lower() != ".pdf":
        return {}

    metadata = {"filename": path.name, "file_size_bytes": path.stat().st_size}

    try:
        from PyPDF2 import PdfReader  # type: ignore
        reader = PdfReader(str(path))
        info = reader.metadata
        if info:
            metadata["title"] = info.get("/Title", "") or ""
            metadata["author"] = info.get("/Author", "") or ""
            metadata["subject"] = info.get("/Subject", "") or ""
            metadata["creator"] = info.get("/Creator", "") or ""
            metadata["num_pages"] = len(reader.pages)
    except Exception:
        pass

    try:
        import pdfplumber  # type: ignore
        with pdfplumber.open(str(path)) as pdf:
            metadata["num_pages"] = len(pdf.pages)
            if pdf.metadata:
                metadata.update({
                    k: v for k, v in pdf.metadata.items()
                    if isinstance(v, str) and v.strip()
                })
    except Exception:
        pass

    return metadata
