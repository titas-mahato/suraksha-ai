import pytesseract
from PIL import Image
import os
from pypdf import PdfReader

def extract_document_data(file_path: str) -> dict:
    text = ""
    # Check if PDF or Image
    if file_path.lower().endswith('.pdf'):
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() or ""
    else:
        # Fallback to local image OCR via Tesseract
        img = Image.open(file_path)
        text = pytesseract.image_to_string(img)
        
    # Basic structural heuristic for underwriting
    entities = {
        "has_currency_symbols": "$" in text or "USD" in text or "INR" in text or "₹" in text,
        "contains_legal_terms": any(term in text.lower() for term in ["deed", "agreement", "underwritten", "mortgage"])
    }
    
    return {"text": text, "entities": entities}