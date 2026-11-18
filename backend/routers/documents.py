"""
Document extraction router.
Extracts clean text from PDF (.pdf), Word (.docx), and text files for the BERT extractive QA engine.
"""

import io
from fastapi import APIRouter, UploadFile, File, HTTPException
import pypdf
import docx

router = APIRouter()


@router.post("/extract")
async def extract_document_text(file: UploadFile = File(...)):
    """
    Extract text content from an uploaded document.
    Supports PDF (.pdf), Word (.docx), and plain text / markdown / JSON / CSV.
    """
    filename = file.filename or "uploaded_file"
    ext = filename.lower().split(".")[-1] if "." in filename else ""
    contents = await file.read()

    extracted_text = ""
    pages_count = 1

    try:
        if ext == "pdf":
            reader = pypdf.PdfReader(io.BytesIO(contents))
            pages_count = len(reader.pages)
            text_parts = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_parts.append(page_text.strip())
            extracted_text = "\n\n".join(text_parts)
            if not extracted_text.strip():
                raise HTTPException(
                    status_code=422,
                    detail="No readable text found in this PDF. If this is a scanned document, please use image upload (PNG/JPG) for OCR extraction.",
                )

        elif ext in ["docx", "doc"]:
            doc = docx.Document(io.BytesIO(contents))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        paragraphs.append(row_text)
            extracted_text = "\n\n".join(paragraphs)

        elif ext in ["txt", "md", "csv", "json", "xml", "html", "text"]:
            try:
                extracted_text = contents.decode("utf-8")
            except UnicodeDecodeError:
                extracted_text = contents.decode("latin-1")

        else:
            try:
                extracted_text = contents.decode("utf-8")
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported format .{ext}. Supported formats include PDF, DOCX, TXT, MD, CSV, JSON, and PNG/JPG.",
                )

        return {
            "status": "success",
            "filename": filename,
            "extension": ext,
            "text": extracted_text.strip(),
            "pages": pages_count,
            "character_count": len(extracted_text.strip()),
            "word_count": len(extracted_text.strip().split()),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
