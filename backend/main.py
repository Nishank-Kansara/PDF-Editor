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
from pathlib import Path

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

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

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
    Parse instruction via AI, apply edits to the PDF, return download URL.
    """
    input_path = UPLOADS_DIR / f"{request.file_id}.pdf"
    if not input_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found. Please upload first.")

    # 1. Extract full text for AI context
    try:
        pdf_text = extract_text(str(input_path))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to extract text: {e}")

    # 2. Ask AI to parse instruction into a structured action
    try:
        action = parse_instruction(pdf_text, request.instruction)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI parsing failed: {e}")

    # 3. Apply the editing action
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

    elif name == "change_background":
        color = action.get("color", [0, 0, 0])
        edit_service.change_background(input_path, output_path, color)
        return f"Changed background color of all pages."

    else:
        import shutil
        shutil.copy(input_path, output_path)
        return f"Action '{name}' not implemented yet; returned original PDF."
