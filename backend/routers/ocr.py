from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ocr import extract_formula_from_image

router = APIRouter(prefix="/api", tags=["ocr"])

ALLOWED_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    """Accept an image and return extracted LaTeX formula."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            400,
            f"Unsupported image type: {file.content_type}. Use PNG, JPG, or WEBP.",
        )

    image_bytes = await file.read()
    if len(image_bytes) > MAX_SIZE:
        raise HTTPException(400, "Image too large. Maximum 5 MB.")
    if len(image_bytes) < 500:
        raise HTTPException(400, "Image too small or empty.")

    try:
        latex = extract_formula_from_image(image_bytes)
        return {"latex": latex}
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception as e:
        raise HTTPException(500, f"OCR failed: {e}")