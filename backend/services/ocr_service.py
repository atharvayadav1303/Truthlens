"""
Screenshot OCR - matches the "Image" upload / "Screenshot OCR" tab
in the frontend. Requires the tesseract binary on the host
(apt-get install tesseract-ocr) in addition to the pytesseract package.
"""
import io
import os
from PIL import Image
import pytesseract


_WINDOWS_TESSERACT = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.name == "nt" and os.path.exists(_WINDOWS_TESSERACT):
    pytesseract.pytesseract.tesseract_cmd = _WINDOWS_TESSERACT


def extract_text_from_image(image_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(image_bytes))
    text = pytesseract.image_to_string(image)
    return text.strip()
