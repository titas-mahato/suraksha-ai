import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Import local agent functions
from agents.ocr_agent import extract_document_data
from agents.classifier_agent import classify_document
from agents.metadata_agent import extract_metadata
from agents.cv_fraud_agent import run_cv_fraud_checks
from agents.font_alignment_agent import analyze_fonts_and_alignment
from agents.risk_scoring_agent import calculate_final_risk

app = FastAPI(title="Real-Time Document Fraud Detection Pipeline")

# Allow Web UI connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "./stored_documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/v1/analyze")
async def analyze_document(file: UploadFile = File(...)):
    # Step 1: Generate Document ID & Store File
    doc_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    saved_file_path = os.path.join(UPLOAD_DIR, f"{doc_id}{file_extension}")
    
    with open(saved_file_path, "wb") as f:
        f.write(await file.read())
        
    try:
        # Step 2: OCR Agent
        ocr_data = extract_document_data(saved_file_path)
        
        # Step 3: Document Classification Agent
        classification_result = classify_document(ocr_data["text"])
        doc_type = classification_result["document_type"]
        
        # Step 4: Metadata Agent
        metadata = extract_metadata(saved_file_path)
        
        # Step 5: CV Fraud Agent (Splicing, ELA, Compression)
        cv_fraud_results = run_cv_fraud_checks(saved_file_path)
        
        # Step 6: Font & Alignment Agent
        alignment_results = analyze_fonts_and_alignment(saved_file_path)
        
        # Step 7 & 8: Risk Scoring Agent
        final_assessment = calculate_final_risk(
            doc_type=doc_type,
            ocr_data=ocr_data,
            metadata=metadata,
            cv_results=cv_fraud_results,
            alignment_results=alignment_results
        )
        
        # Compile response payload for the dashboard
        return {
            "document_id": doc_id,
            "filename": file.filename,
            "document_type": doc_type,
            "metadata_summary": metadata,
            "cv_fraud_metrics": cv_fraud_results,
            "alignment_metrics": alignment_results,
            "risk_assessment": final_assessment
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)