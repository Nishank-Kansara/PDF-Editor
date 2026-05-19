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
    Convert PDF to dark mode (pure PyMuPDF — no OCR, no OpenAI):
      - Draws a solid black background (underlay).
      - Pixel-inverts all embedded images so they stay visible.
      - Re-draws all text in white.

    KEY FIX: span data is collected BEFORE apply_redactions() is called,
    because after redaction the text is erased from the page content stream.
    """
    if bg_color is None:
        bg_color = [0, 0, 0]      # black
    if text_color is None:
        text_color = [1, 1, 1]    # white

    doc = _open(input_path)

    for page in doc:
        # ── STEP 1: Save ALL span data BEFORE touching anything ───────────
        raw = page.get_text("rawdict", flags=fitz.TEXT_PRESERVE_WHITESPACE)
        spans_data = []
        for block in raw.get("blocks", []):
            if block.get("type") != 0:   # 0 = text block
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    text   = span.get("text", "")
                    origin = span.get("origin")
                    if not text.strip() or not origin:
                        continue
                    spans_data.append({
                        "text":   text,
                        "origin": origin,
                        "size":   span.get("size", 11),
                        "bbox":   span["bbox"],
                    })

        # ── STEP 2: Paint black background (underlay) ─────────────────────
        page.draw_rect(page.rect, color=None, fill=bg_color, overlay=False)

        # ── STEP 3: Pixel-invert embedded images ──────────────────────────
        # Images with white content become black-compatible after inversion.
        for img_info in page.get_images(full=True):
            xref = img_info[0]
            img_rects = page.get_image_rects(xref)
            if not img_rects:
                continue
            try:
                pix = fitz.Pixmap(doc, xref)
                # Convert to plain RGB if CMYK or has alpha
                if pix.colorspace and pix.colorspace.n > 3:
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                if pix.alpha:
                    pix = fitz.Pixmap(pix, 0)   # strip alpha
                pix.invert_irect(pix.irect)      # pixel-level inversion
                for rect in img_rects:
                    page.insert_image(rect, pixmap=pix, overlay=True)
            except Exception as e:
                print(f"[invert_colors] image xref {xref} skipped: {e}")

        # ── STEP 4: Redact original text (fill with bg color) ─────────────
        for sd in spans_data:
            page.add_redact_annot(fitz.Rect(sd["bbox"]), fill=bg_color)
        page.apply_redactions()

        # ── STEP 5: Re-insert every span in white ─────────────────────────
        for sd in spans_data:
            page.insert_text(
                sd["origin"],
                sd["text"],
                fontsize=sd["size"],
                color=text_color,
                overlay=True,
            )

    _save(doc, output_path)

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
