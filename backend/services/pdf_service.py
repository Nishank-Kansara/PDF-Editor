"""
pdf_service.py
Handles all PDF text extraction and metadata using PyMuPDF (fitz).
"""
import fitz  # PyMuPDF


def extract_text(pdf_path: str) -> str:
    """Extract all text from every page of the PDF."""
    doc = fitz.open(pdf_path)
    full_text = []
    for page in doc:
        full_text.append(page.get_text("text"))
    doc.close()
    return "\n".join(full_text)


def get_page_count(pdf_path: str) -> int:
    """Return the total number of pages in the PDF."""
    doc = fitz.open(pdf_path)
    count = doc.page_count
    doc.close()
    return count


def get_text_preview(pdf_path: str, max_chars: int = 500) -> str:
    """Return a short preview of the PDF text (first max_chars characters)."""
    text = extract_text(pdf_path)
    return text[:max_chars].strip()
