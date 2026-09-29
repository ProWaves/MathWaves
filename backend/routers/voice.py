from fastapi import APIRouter, UploadFile, File, HTTPException
from services.transcriber import transcribe_audio

router = APIRouter(prefix="/api", tags=["voice"])


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """Accept an audio file and return transcribed text."""
    if not file.content_type or not file.content_type.startswith("audio"):
        # Some browsers send "video/webm" or "application/octet-stream"
        if not (file.content_type or "").startswith(("audio", "video")):
            raise HTTPException(400, f"Unsupported content type: {file.content_type}")

    try:
        audio_bytes = await file.read()
        if len(audio_bytes) < 1000:
            raise HTTPException(400, "Audio too short. Speak for at least 1 second.")

        text = transcribe_audio(audio_bytes, file.filename or "audio.webm")
        if not text:
            raise HTTPException(422, "Could not understand audio. Please try again.")

        return {"text": text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Transcription failed: {e}")