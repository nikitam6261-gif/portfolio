import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from faster_whisper import WhisperModel

MODEL_NAME = os.getenv("WHISPER_MODEL", "large-v3-turbo")
DEVICE = os.getenv("WHISPER_DEVICE", "cuda")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "float16" if DEVICE == "cuda" else "int8")

app = FastAPI(title="PEGAS FLOW Voice STT", version="1.0.0")
_model = None


def get_model():
    global _model
    if _model is None:
        try:
            _model = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)
        except Exception:
            # Safe fallback so the service still starts if CUDA libraries are unavailable.
            _model = WhisperModel(MODEL_NAME, device="cpu", compute_type="int8")
    return _model


@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "pegas-flow-stt",
        "model": MODEL_NAME,
        "requested_device": DEVICE,
    }


@app.post("/v1/audio/transcriptions")
async def transcribe(
    file: UploadFile = File(...),
    model: str | None = Form(default=None),
    language: str | None = Form(default="ru"),
    response_format: str | None = Form(default="json"),
):
    suffix = Path(file.filename or "voice.ogg").suffix or ".ogg"
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty audio file")
    if len(data) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="audio file too large")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(data)
            tmp_path = tmp.name

        whisper = get_model()
        segments, info = whisper.transcribe(
            tmp_path,
            language=language or "ru",
            vad_filter=True,
            beam_size=5,
            condition_on_previous_text=True,
        )
        text = " ".join(segment.text.strip() for segment in segments if segment.text.strip()).strip()
        return JSONResponse(
            {
                "text": text,
                "language": getattr(info, "language", language or "ru"),
                "duration": getattr(info, "duration", None),
                "model": MODEL_NAME,
            }
        )
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
