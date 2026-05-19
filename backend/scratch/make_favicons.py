from PIL import Image
import os

source_img = r"C:\Users\nisha\.gemini\antigravity\brain\10d5aca6-4c67-446e-8b7b-7ab0954ce184\ai_pdf_editor_favicon_1779151242324.png"
out_dir = r"d:\AI PDF Editor\frontend\public"

os.makedirs(out_dir, exist_ok=True)
img = Image.open(source_img)

# 1. favicon.ico
img.save(os.path.join(out_dir, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32)])

# 2. apple-touch-icon.png
apple = img.resize((180, 180), Image.Resampling.LANCZOS)
apple.save(os.path.join(out_dir, "apple-touch-icon.png"))

# 3. favicon-32x32.png
fav32 = img.resize((32, 32), Image.Resampling.LANCZOS)
fav32.save(os.path.join(out_dir, "favicon-32x32.png"))

# 4. favicon-16x16.png
fav16 = img.resize((16, 16), Image.Resampling.LANCZOS)
fav16.save(os.path.join(out_dir, "favicon-16x16.png"))

# 5. android-chrome-192x192.png
android192 = img.resize((192, 192), Image.Resampling.LANCZOS)
android192.save(os.path.join(out_dir, "android-chrome-192x192.png"))

# 6. android-chrome-512x512.png
android512 = img.resize((512, 512), Image.Resampling.LANCZOS)
android512.save(os.path.join(out_dir, "android-chrome-512x512.png"))

print("Favicons generated successfully.")
