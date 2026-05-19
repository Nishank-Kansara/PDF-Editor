"""
main.py
FastAPI application — AI PDF Editor backend.
Endpoints:
  POST /upload           — upload PDF, return file_id + text preview
  POST /edit             — edit PDF via AI instruction, return download URL
  GET  /download/{id}    — stream the edited PDF
"""
import os
import uuid
import shutil
import base64
from pathlib import Path
import fitz  # PyMuPDF — for thumbnail generation

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from services.pdf_service import extract_text, get_page_count, get_text_preview
from services.ai_service import parse_instruction
from services import edit_service

load_dotenv()

# ── Directories ───────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
UPLOADS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

# ── Limits ────────────────────────────────────────────────────────────────────
MAX_UPLOAD_BYTES = 100 * 1024 * 1024  # 100 MB

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI PDF Editor API",
    description="Upload a PDF, give a natural-language instruction, get an edited PDF.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://pdf-editor-xi-jade.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ────────────────────────────────────────────────────────────────────
class EditRequest(BaseModel):
    file_id: str
    instruction: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Accept a PDF upload, save it, return file_id and text preview."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_id = str(uuid.uuid4())
    save_path = UPLOADS_DIR / f"{file_id}.pdf"

    # Read and enforce size limit
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(contents) / 1024 / 1024:.1f} MB). Maximum allowed size is 100 MB.",
        )

    with open(save_path, "wb") as f:
        f.write(contents)

    try:
        page_count = get_page_count(str(save_path))
        text_preview = get_text_preview(str(save_path))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to read PDF: {e}")

    return {
        "file_id": file_id,
        "filename": file.filename,
        "page_count": page_count,
        "text_preview": text_preview,
    }


@app.post("/edit")
async def edit_pdf(request: EditRequest):
    """
    Parse instruction via AI (or fast-path directly), apply edits, return download URL.
    """
    input_path = UPLOADS_DIR / f"{request.file_id}.pdf"
    if not input_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found. Please upload first.")

    instr_lower = request.instruction.lower()

    # ── Fast-path: bypass AI for unambiguous intent keywords ─────────────────
    # These actions need no PDF text context, so we skip the OpenAI round-trip.
    fast_action: dict | None = None

    if any(k in instr_lower for k in ("dark mode", "invert", "night mode", "black background", "white background", "light mode")):
        fast_action = {"action": "invert_colors", "bg_color": [0, 0, 0], "text_color": [1, 1, 1]}

    elif any(k in instr_lower for k in ("remove highlight", "clear highlight", "delete highlight", "remove annotation")):
        fast_action = {"action": "remove_highlights"}

    elif any(k in instr_lower for k in ("watermark",)):
        # Extract the watermark text after "watermark" if provided, else default
        import re
        m = re.search(r'watermark[:\s]+([\w\s]+)', request.instruction, re.IGNORECASE)
        wm_text = m.group(1).strip().upper() if m else "CONFIDENTIAL"
        fast_action = {"action": "add_watermark", "text": wm_text}

    if fast_action:
        action = fast_action
    else:
        # ── AI path: extract text and ask GPT ────────────────────────────────
        try:
            pdf_text = extract_text(str(input_path))
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to extract text: {e}")

        try:
            action = parse_instruction(pdf_text, request.instruction)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"AI parsing failed: {e}")

    # ── Apply the editing action ──────────────────────────────────────────────
    output_id = str(uuid.uuid4())
    output_path = OUTPUTS_DIR / f"{output_id}.pdf"

    try:
        action_name = action.get("action", "unknown")
        action_description = _apply_action(action, str(input_path), str(output_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF editing failed: {e}")

    return {
        "output_id": output_id,
        "action_taken": action_name,
        "action_details": action,
        "description": action_description,
        "download_url": f"/download/{output_id}",
    }


@app.get("/download/{output_id}")
async def download_pdf(output_id: str):
    """Stream the edited PDF as a file download."""
    # Sanitize
    output_id = output_id.replace("/", "").replace("..", "")
    file_path = OUTPUTS_DIR / f"{output_id}.pdf"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Edited PDF not found.")

    return FileResponse(
        path=str(file_path),
        media_type="application/pdf",
        filename=f"edited_{output_id[:8]}.pdf",
    )


@app.get("/health")
async def health():
    return {"status": "ok", "model": "gpt-4.1-mini"}


@app.get("/pages/{file_id}")
async def get_page_thumbnails(file_id: str):
    """
    Return a list of base64-encoded JPEG thumbnail images for every page
    of the uploaded PDF (max 160px wide). No OCR, no AI — pure PyMuPDF.
    """
    # Sanitize file_id
    file_id = file_id.replace("/", "").replace("..", "")
    pdf_path = UPLOADS_DIR / f"{file_id}.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found.")

    doc = fitz.open(str(pdf_path))
    thumbnails = []

    for i, page in enumerate(doc):
        # Render at a small scale for thumbnails (scale = 0.25 ≈ 72dpi*0.25)
        mat = fitz.Matrix(0.3, 0.3)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img_bytes = pix.tobytes(output="jpeg", jpg_quality=70)
        b64 = base64.b64encode(img_bytes).decode("utf-8")
        thumbnails.append({
            "page": i + 1,
            "width": pix.width,
            "height": pix.height,
            "data": f"data:image/jpeg;base64,{b64}",
        })

    doc.close()
    return {"file_id": file_id, "pages": thumbnails}


# ── Action dispatcher ─────────────────────────────────────────────────────────

def _apply_action(action: dict, input_path: str, output_path: str) -> str:
    """Dispatch the AI action to the correct edit_service function."""
    name = action.get("action")

    if name == "replace_text":
        find = action.get("find", "")
        replace = action.get("replace", "")
        count = edit_service.replace_text(input_path, output_path, find, replace)
        return f"Replaced {count} occurrence(s) of '{find}' with '{replace}'."

    elif name == "add_watermark":
        text = action.get("text", "CONFIDENTIAL")
        edit_service.add_watermark(input_path, output_path, text)
        return f"Added watermark: '{text}' to all pages."

    elif name == "summarize":
        summary = action.get("summary", "")
        edit_service.summarize(input_path, output_path, summary)
        return "Appended an AI-generated summary page."

    elif name == "translate":
        pages = action.get("translated_pages", [])
        lang = action.get("language", "target language")
        edit_service.translate_pages(input_path, output_path, pages)
        return f"Translated PDF content to {lang}."

    elif name == "improve_text":
        pages = action.get("improved_pages", [])
        edit_service.improve_text(input_path, output_path, pages)
        return "Improved and rewrote the PDF text professionally."

    elif name == "highlight":
        phrases = action.get("phrases", [])
        edit_service.highlight_phrases(input_path, output_path, phrases)
        return f"Highlighted {len(phrases)} phrase(s)."

    elif name == "remove_highlights":
        count = edit_service.remove_highlights(input_path, output_path)
        return f"Removed {count} highlight annotation(s) from the PDF."

    elif name == "change_background":
        color = action.get("color", [0, 0, 0])
        edit_service.change_background(input_path, output_path, color)
        return f"Changed background color of all pages."

    elif name == "invert_colors":
        bg = action.get("bg_color", [0, 0, 0])
        fg = action.get("text_color", [1, 1, 1])
        edit_service.invert_colors(input_path, output_path, bg, fg)
        return "Converted PDF to dark mode — background is now black, text is white, images preserved."

    else:
        import shutil
        shutil.copy(input_path, output_path)
        return f"Action '{name}' not implemented yet; returned original PDF."
