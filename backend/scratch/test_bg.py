import fitz
import sys

def change_background(input_path: str, output_path: str, color: list):
    doc = fitz.open(input_path)
    for page in doc:
        rect = page.rect
        page.draw_rect(rect, color=None, fill=color, overlay=False)
    doc.save(output_path, garbage=4, deflate=True)
    doc.close()

if __name__ == "__main__":
    change_background(sys.argv[1], sys.argv[2], [0, 0, 0])
