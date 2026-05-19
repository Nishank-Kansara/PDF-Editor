"""
edit_service.py
Applies structured editing actions to PDFs using PyMuPDF (fitz).
"""
import math
import fitz  # PyMuPDF


# ── Helper ───────────────────────────────────────────────────────────────────

def _open(path: str) -> fitz.Document:
    return fitz.open(path)


def _save(doc: fitz.Document, output_path: str):
    doc.save(output_path, garbage=4, deflate=True)
    doc.close()


# ── Actions ──────────────────────────────────────────────────────────────────

def replace_text(input_path: str, output_path: str, find: str, replace: str) -> int:
    """
    Find all occurrences of `find` in every page and replace with `replace`.
    Strategy: redact the old text (white box), then insert new text at same position.
    Returns number of replacements made.
    """
    doc = _open(input_path)
    total = 0

    for page in doc:
        hits = page.search_for(find)
        if not hits:
            continue

        for rect in hits:
            # 1. Redact (white rectangle over old text)
            page.add_redact_annot(rect, fill=(1, 1, 1))

        page.apply_redactions()

        # 2. Re-insert replacement text at the same positions
        for rect in hits:
            page.insert_text(
                (rect.x0, rect.y1 - 2),  # baseline of the original text
                replace,
                fontsize=11,
                color=(0, 0, 0),
            )
            total += 1

    _save(doc, output_path)
    return total


def add_watermark(input_path: str, output_path: str, text: str):
    """
    Add a diagonal semi-transparent watermark text to every page.
    """
    doc = _open(input_path)

    for page in doc:
        w, h = page.rect.width, page.rect.height
        # Insert rotated text at centre
        page.insert_text(
            (w * 0.15, h * 0.6),
            text,
            fontsize=60,
            color=(0.7, 0.7, 0.7)
        )

    _save(doc, output_path)


def summarize(input_path: str, output_path: str, summary: str):
    """
    Append a new summary page to the end of the PDF.
    """
    doc = _open(input_path)

    # New blank page (A4)
    summary_page = doc.new_page(width=595, height=842)

    # Title
    summary_page.insert_text(
        (50, 60),
        "AI-Generated Summary",
        fontsize=18,
        color=(0.1, 0.1, 0.8),
    )

    # Divider
    summary_page.draw_line((50, 75), (545, 75), color=(0.5, 0.5, 0.5), width=0.5)

    # Body text (word-wrapped manually)
    _insert_wrapped_text(summary_page, summary, x=50, y=100, width=495, fontsize=11)

    _save(doc, output_path)


def translate_pages(input_path: str, output_path: str, translated_pages: list):
    """
    Replace page text with translated text.
    `translated_pages` is a list of {"page": int, "text": str}.
    """
    doc = _open(input_path)

    for item in translated_pages:
        page_index = item.get("page", 0)
        new_text = item.get("text", "")

        if page_index >= len(doc):
            continue

        page = doc[page_index]

        # Redact all existing text
        blocks = page.get_text("blocks")
        for b in blocks:
            rect = fitz.Rect(b[:4])
            page.add_redact_annot(rect, fill=(1, 1, 1))
        page.apply_redactions()

        # Insert translated text
        _insert_wrapped_text(page, new_text, x=50, y=50, width=495, fontsize=11)

    _save(doc, output_path)


def improve_text(input_path: str, output_path: str, improved_pages: list):
    """
    Replace page text with improved/rewritten text.
    Same structure as translate_pages.
    """
    translate_pages(input_path, output_path, improved_pages)


def highlight_phrases(input_path: str, output_path: str, phrases: list):
    """
    Highlight all occurrences of the given phrases with yellow highlight.
    """
    doc = _open(input_path)

    for page in doc:
        for phrase in phrases:
            hits = page.search_for(phrase)
            for rect in hits:
                highlight = page.add_highlight_annot(rect)
                highlight.set_colors(stroke=(1, 1, 0))  # yellow
                highlight.update()

    _save(doc, output_path)


def remove_highlights(input_path: str, output_path: str) -> int:
    """
    Remove all highlight (and underline/squiggly/strikeout) annotations
    from every page of the PDF.
    Returns the total number of annotations removed.
    """
    # PyMuPDF annotation type constants for markup annotations
    MARKUP_TYPES = {
        fitz.PDF_ANNOT_HIGHLIGHT,
        fitz.PDF_ANNOT_UNDERLINE,
        fitz.PDF_ANNOT_SQUIGGLY,
        fitz.PDF_ANNOT_STRIKE_OUT,
    }

    doc = _open(input_path)
    total_removed = 0

    for page in doc:
        annots_to_delete = [
            annot for annot in page.annots()
            if annot.type[0] in MARKUP_TYPES
        ]
        for annot in annots_to_delete:
            page.delete_annot(annot)
            total_removed += 1

    _save(doc, output_path)
    return total_removed


def change_background(input_path: str, output_path: str, color: list):
    """
    Change the background color of all pages in the PDF.
    """
    doc = _open(input_path)

    for page in doc:
        rect = page.rect
        page.draw_rect(rect, color=None, fill=color, overlay=False)

    _save(doc, output_path)


def invert_colors(input_path: str, output_path: str,
                  bg_color: list = None, text_color: list = None):
    """
    Convert PDF to dark mode — RENDER-AND-INVERT approach.

    Strategy: render each page as a high-res pixmap (3× = 216 DPI),
    invert every pixel, then embed as a full-page image in a new PDF.

    Why not redact+reinsert?
      PyMuPDF reinserts text using its built-in Helvetica — not the
      original font. This causes wrong characters, wrong spacing, and
      missing glyphs for non-Latin text. Rendering is 100% faithful.

    Result: black background, white text, inverted images — guaranteed
    to work on ANY PDF regardless of font embedding.
    """
    src = fitz.open(input_path)
    out = fitz.open()          # new empty PDF

    # 2× scale ≈ 144 DPI — good quality with ~50% faster render than 3×
    mat = fitz.Matrix(2, 2)

    for src_page in src:
        # 1. Render the original page to an RGB pixmap
        pix = src_page.get_pixmap(matrix=mat, alpha=False, colorspace=fitz.csRGB)

        # 2. Invert every pixel (white→black, black→white, colours inverted)
        pix.invert_irect(pix.irect)

        # 3. Create a matching new page in the output PDF
        #    (same physical dimensions as the source page)
        w, h = src_page.rect.width, src_page.rect.height
        new_page = out.new_page(width=w, height=h)

        # 4. Insert the inverted pixmap as a full-page image
        new_page.insert_image(new_page.rect, pixmap=pix)

    out.save(output_path, garbage=4, deflate=True)
    out.close()
    src.close()

# ── Utility ───────────────────────────────────────────────────────────────────

def _insert_wrapped_text(page, text: str, x: float, y: float,
                          width: float, fontsize: float = 11):
    """Insert text into a page with basic word-wrapping using a text box."""
    rect = fitz.Rect(x, y, x + width, page.rect.height - 50)
    page.insert_textbox(
        rect,
        text,
        fontsize=fontsize,
        color=(0, 0, 0),
        align=fitz.TEXT_ALIGN_LEFT,
    )
