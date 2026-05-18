# PDFAI — AI-Powered PDF Editor

A futuristic, full-stack AI PDF editing web app.  
Upload a PDF → describe your edit in plain English → download the modified result.

Powered by **GPT-4.1-mini**, **PyMuPDF**, **FastAPI**, **React**, and **Three.js**.

---

## Features

| Action | Command example |
|---|---|
| Replace text | `Replace John with Nishank` |
| Add watermark | `Add a CONFIDENTIAL watermark` |
| Summarize | `Summarize this PDF and add a summary page` |
| Translate | `Translate this PDF to Hindi` |
| Improve text | `Improve the writing professionally` |
| Highlight | `Highlight the most important phrases` |

---

## Project Structure

```
AI PDF Editor/
├── frontend/          # React + Vite + Tailwind + Three.js
└── backend/           # FastAPI + PyMuPDF + OpenAI
```

---

## Setup

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Add your OpenAI key
# Edit backend/.env:
# OPENAI_API_KEY=sk-...

# Run the server
uvicorn main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000  
API docs: http://localhost:8000/docs

---

### 2. Frontend

```bash
cd frontend

# Install dependencies (already done if you ran npm install)
npm install

# Start dev server
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## Environment Variables

Create `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

---

## API Reference

### POST /upload
Upload a PDF file.
```json
// Response
{
  "file_id": "uuid",
  "filename": "document.pdf",
  "page_count": 3,
  "text_preview": "First 500 chars of PDF text..."
}
```

### POST /edit
Edit the PDF with an AI instruction.
```json
// Request
{ "file_id": "uuid", "instruction": "Replace John with Nishank" }

// Response
{
  "output_id": "uuid",
  "action_taken": "replace_text",
  "description": "Replaced 3 occurrence(s) of 'John' with 'Nishank'.",
  "download_url": "/download/uuid"
}
```

### GET /download/{output_id}
Download the edited PDF.

---

## Tech Stack

**Frontend**
- React 18 + Vite
- TailwindCSS v4
- Framer Motion
- Three.js + React Three Fiber + Drei
- Zustand (state management)
- Axios
- PDF.js (pdfjs-dist)

**Backend**
- Python + FastAPI + Uvicorn
- PyMuPDF (fitz)
- OpenAI SDK (`gpt-4.1-mini`)
- python-dotenv

---

## Deployment

**Frontend** → Vercel  
```bash
cd frontend && npm run build
# Deploy dist/ to Vercel
```

**Backend** → Render  
```
Build command: pip install -r requirements.txt
Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set `OPENAI_API_KEY` as an environment variable on Render.
