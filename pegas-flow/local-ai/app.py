import json
import os
import re
from datetime import datetime
from typing import Any

import requests
from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from pydantic import BaseModel
from faster_whisper import WhisperModel

APP_TOKEN = os.getenv("PEGAS_LOCAL_AI_TOKEN", "").strip()
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cuda")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "float16")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:8b")

app = FastAPI(title="PEGAS FLOW Local AI", version="1.0.0")
_whisper: WhisperModel | None = None


def require_token(authorization: str | None) -> None:
    if not APP_TOKEN:
        raise HTTPException(status_code=503, detail="PEGAS_LOCAL_AI_TOKEN is not configured")
    if authorization != f"Bearer {APP_TOKEN}":
        raise HTTPException(status_code=401, detail="Unauthorized")


def get_whisper() -> WhisperModel:
    global _whisper
    if _whisper is None:
        try:
            _whisper = WhisperModel(
                WHISPER_MODEL,
                device=WHISPER_DEVICE,
                compute_type=WHISPER_COMPUTE_TYPE,
            )
        except Exception:
            # Safe CPU fallback, so the bridge remains usable even if CUDA is not ready.
            _whisper = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
    return _whisper


class ParseOrderRequest(BaseModel):
    text: str
    role: str | None = None
    current_time: str | None = None
    timezone: str | None = "Europe/Moscow"


ORDER_SCHEMA = {
    "type": "object",
    "properties": {
        "customer": {"type": ["string", "null"]},
        "cargo": {"type": ["string", "null"]},
        "cargo_category": {"type": ["string", "null"]},
        "pallets": {"type": ["integer", "null"]},
        "weight_kg": {"type": ["number", "null"]},
        "pickup": {"type": ["string", "null"]},
        "destination": {"type": ["string", "null"]},
        "destination_city": {"type": ["string", "null"]},
        "ready_at": {"type": ["string", "null"]},
        "delivery_type": {"type": ["string", "null"], "enum": ["pickup", "self", None]},
        "regime": {"type": ["string", "null"], "enum": ["frozen", "chilled", "dry", "ph8", "ph25", None]},
        "priority": {"type": ["string", "null"]},
        "note": {"type": ["string", "null"]},
    },
    "required": [
        "customer", "cargo", "cargo_category", "pallets", "weight_kg", "pickup",
        "destination", "destination_city", "ready_at", "delivery_type", "regime",
        "priority", "note"
    ],
    "additionalProperties": False,
}


def extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.S)
        if not match:
            raise
        return json.loads(match.group(0))


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "pegas-local-ai",
        "whisper_model": WHISPER_MODEL,
        "ollama_model": OLLAMA_MODEL,
        "token_configured": bool(APP_TOKEN),
    }


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form("ru"),
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    require_token(authorization)
    suffix = os.path.splitext(file.filename or "voice.ogg")[-1] or ".ogg"
    tmp_path = os.path.join(os.getenv("TEMP", "."), f"pegas_voice_{os.getpid()}_{int(datetime.now().timestamp()*1000)}{suffix}")
    try:
        with open(tmp_path, "wb") as out:
            out.write(await file.read())
        model = get_whisper()
        segments, info = model.transcribe(
            tmp_path,
            language=language or "ru",
            vad_filter=True,
            beam_size=5,
        )
        text = " ".join(s.text.strip() for s in segments if s.text.strip()).strip()
        if not text:
            raise HTTPException(status_code=422, detail="Speech was not recognized")
        return {
            "ok": True,
            "text": text,
            "language": getattr(info, "language", language),
            "language_probability": getattr(info, "language_probability", None),
        }
    finally:
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except OSError:
            pass


@app.post("/parse/order")
def parse_order(
    request: ParseOrderRequest,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    require_token(authorization)
    system = (
        "Ты модуль структурированного разбора заявок PEGAS FLOW. "
        "Извлекай только то, что явно сказано пользователем. Никогда не придумывай вес, адрес, клиента, время или режим. "
        "Если поле не указано, верни null. Вес всегда переводи в килограммы. "
        "delivery_type по умолчанию pickup, только если пользователь явно не сказал самопривоз/self. "
        "regime: frozen=заморозка, chilled=охлаждение, dry=сухой, ph8=фарма 2-8, ph25=фарма 15-25. "
        "ready_at верни в ISO-8601 с часовым поясом, учитывая текущее время и Europe/Moscow. "
        "Ответ только JSON без пояснений."
    )
    prompt = {
        "text": request.text,
        "role": request.role,
        "current_time": request.current_time,
        "timezone": request.timezone,
        "schema": ORDER_SCHEMA,
    }
    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "stream": False,
                "format": ORDER_SCHEMA,
                "options": {"temperature": 0.0},
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": json.dumps(prompt, ensure_ascii=False)},
                ],
            },
            timeout=120,
        )
        response.raise_for_status()
        payload = response.json()
        content = payload.get("message", {}).get("content", "")
        data = extract_json(content)
        return {"ok": True, "data": data, "provider": f"ollama:{OLLAMA_MODEL}"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Ollama/Qwen is unavailable: {exc}")
