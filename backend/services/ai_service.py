"""
ai_service.py
Calls OpenAI GPT-4.1-mini to parse natural-language instructions into
structured editing actions.
"""
import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is missing")

client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.aicredits.in/v1"),
)

SYSTEM_PROMPT = """You are an AI PDF editing assistant.
The user will give you:
1. The full text extracted from a PDF.
2. A natural-language instruction about how to edit the PDF.

Your job is to respond ONLY with a valid JSON object describing the editing action.

Supported actions and their JSON schemas:

1. Replace text:
{"action": "replace_text", "find": "<exact text to find>", "replace": "<replacement text>"}

2. Add watermark:
{"action": "add_watermark", "text": "<watermark text>"}

3. Summarize (append a summary page):
{"action": "summarize", "summary": "<concise summary of the PDF content in 3-5 sentences>"}

4. Translate all text:
{"action": "translate", "language": "<target language>", "translated_pages": [{"page": 0, "text": "<full translated text for this page>"}]}

5. Improve / rewrite text professionally:
{"action": "improve_text", "improved_pages": [{"page": 0, "text": "<improved full text for this page>"}]}

6. Highlight important sections (returns them for display):
{"action": "highlight", "phrases": ["<phrase1>", "<phrase2>"]}

7. Change background color:
{"action": "change_background", "color": [r, g, b]} # r, g, b are floats between 0 and 1 (e.g. black is [0, 0, 0])

8. Dark mode / invert colors (background black, text white, images preserved — NO OCR needed):
{"action": "invert_colors", "bg_color": [0, 0, 0], "text_color": [1, 1, 1]}
Use this when the user asks for: dark mode, black background, invert, night mode, white text on black background.

Rules:
- Respond ONLY with the JSON object. No explanation, no markdown, no code fences.
- For summarize, translate, and improve_text, process the actual PDF text provided.
- Keep JSON keys exactly as shown.
- For translate/improve_text, only include pages that need changes.
- For dark mode / invert requests, always prefer invert_colors over change_background.
"""


def parse_instruction(pdf_text: str, instruction: str) -> dict:
    """
    Send the PDF text + user instruction to GPT-4.1-mini.
    Returns a structured dict describing what edit to perform.
    """
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"PDF TEXT:\n{pdf_text[:6000]}\n\n"  # limit context window usage
                f"INSTRUCTION: {instruction}"
            ),
        },
    ]

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=messages,
        temperature=0.2,
        max_tokens=2000,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown code fences if model adds them anyway
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)
