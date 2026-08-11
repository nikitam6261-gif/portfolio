import json
import os
import re
import sys
import tempfile
import time
from pathlib import Path
from typing import Any

import requests
from faster_whisper import WhisperModel

SUPABASE_URL = "https://vvjuwtorumxhltrxejfc.supabase.co"
WORKER_API = f"{SUPABASE_URL}/functions/v1/pegas-voice-worker-api"
TOKEN_FILE = Path(__file__).with_name(".pegas-worker-token")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cuda")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "float16")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:8b")
WORKER_NAME = os.getenv("PEGAS_WORKER_NAME", os.environ.get("COMPUTERNAME", "PEGAS Local AI"))

_model: WhisperModel | None = None

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


def api(action: str, token: str | None = None, **payload: Any) -> requests.Response:
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return requests.post(
        WORKER_API,
        headers=headers,
        json={"action": action, **payload},
        timeout=180,
    )


def pair() -> str:
    if TOKEN_FILE.exists():
        value = TOKEN_FILE.read_text(encoding="utf-8").strip()
        if value:
            return value
    print("\nОткрой @pegas_flow_bot и отправь /voicepair")
    code = input("Введи 6-значный код из Telegram: ").strip()
    response = api("pair", code=code, name=WORKER_NAME)
    data = response.json()
    if not response.ok or not data.get("ok"):
        raise RuntimeError(f"Не удалось привязать компьютер: {data.get('error', response.text)}")
    token = data["token"]
    TOKEN_FILE.write_text(token, encoding="utf-8")
    print("Компьютер привязан к PEGAS FLOW ✅")
    return token


def whisper() -> WhisperModel:
    global _model
    if _model is not None:
        return _model
    print(f"Загружаю Whisper {WHISPER_MODEL} на {WHISPER_DEVICE}...")
    try:
        _model = WhisperModel(
            WHISPER_MODEL,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE_TYPE,
        )
        print("Whisper работает через GPU ✅")
    except Exception as exc:
        print(f"GPU-режим Whisper не запустился: {exc}")
        print("Переключаюсь на CPU int8. Голос всё равно будет работать, но медленнее.")
        _model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
    return _model


def transcribe(audio: bytes) -> str:
    fd, path = tempfile.mkstemp(suffix=".ogg", prefix="pegas_voice_")
    os.close(fd)
    try:
        Path(path).write_bytes(audio)
        segments, _info = whisper().transcribe(
            path,
            language="ru",
            vad_filter=True,
            beam_size=5,
        )
        text = " ".join(seg.text.strip() for seg in segments if seg.text.strip()).strip()
        if not text:
            raise RuntimeError("Речь не распознана")
        return text
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


def create_intent(text: str) -> bool:
    low = text.lower()
    return (
        "создай заяв" in low
        or "создать заяв" in low
        or "нужно забрать" in low
        or "надо забрать" in low
        or ("паллет" in low and " из " in low and " в " in low)
    )


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


def parse_order(text: str) -> dict[str, Any] | None:
    if not create_intent(text):
        return None
    system = (
        "Ты модуль структурированного разбора заявки PEGAS FLOW. "
        "Извлекай только явно сказанные значения. Не придумывай вес, клиента, адреса, время или температурный режим. "
        "Если данных нет, верни null. Вес переводи в килограммы. "
        "delivery_type по умолчанию pickup, если самопривоз явно не указан. "
        "regime: frozen=заморозка, chilled=охлаждение, dry=сухой, ph8=фарма 2-8, ph25=фарма 15-25. "
        "Текущее время передано в запросе; относительные даты интерпретируй по Europe/Moscow. "
        "Ответ только JSON по схеме."
    )
    prompt = {
        "text": text,
        "current_time": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "timezone": "Europe/Moscow",
        "schema": ORDER_SCHEMA,
    }
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
    content = response.json().get("message", {}).get("content", "")
    return extract_json(content)


def process_job(token: str, job: dict[str, Any]) -> None:
    job_id = job["id"]
    print(f"\nГолосовое {job_id}: скачиваю...")
    download = api("download", token, job_id=job_id)
    if not download.ok:
        raise RuntimeError(f"Не удалось скачать голос: {download.status_code} {download.text}")
    transcript = transcribe(download.content)
    print(f"Распознано: {transcript}")
    parsed = None
    if create_intent(transcript):
        try:
            parsed = parse_order(transcript)
            print("Qwen разобрал заявку ✅")
        except Exception as exc:
            print(f"Qwen недоступен или ошибся: {exc}")
            print("Отправляю transcript на сервер — там сработает безопасный fallback-разбор.")
    complete = api(
        "complete",
        token,
        job_id=job_id,
        transcript=transcript,
        parsed_order=parsed,
    )
    if not complete.ok or not complete.json().get("ok"):
        raise RuntimeError(f"Не удалось завершить job: {complete.text}")
    print("Ответ отправлен в Telegram ✅")


def run() -> None:
    token = pair()
    print("\nPEGAS Local AI worker online ✅")
    print("Окно можно свернуть, но не закрывай, пока нужен голосовой бот.")
    print("Ctrl+C — остановить.\n")
    while True:
        try:
            response = api("claim", token)
            if response.status_code == 401:
                print("Worker token больше не действует. Удаляю локальную привязку.")
                TOKEN_FILE.unlink(missing_ok=True)
                token = pair()
                continue
            response.raise_for_status()
            data = response.json()
            job = data.get("job")
            if not job:
                time.sleep(2)
                continue
            try:
                process_job(token, job)
            except Exception as exc:
                print(f"Ошибка обработки: {exc}")
                try:
                    api("fail", token, job_id=job["id"], error=str(exc))
                except Exception:
                    pass
                time.sleep(2)
        except KeyboardInterrupt:
            print("\nPEGAS Local AI остановлен.")
            return
        except Exception as exc:
            print(f"Worker connection error: {exc}")
            time.sleep(5)


if __name__ == "__main__":
    try:
        run()
    except Exception as exc:
        print(f"\nКритическая ошибка: {exc}")
        input("Нажми Enter для выхода...")
        sys.exit(1)
