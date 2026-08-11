$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python не найден. Установи Python 3.11+ и запусти файл снова." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".venv")) {
    python -m venv .venv
}

& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt

if (-not $env:PEGAS_LOCAL_AI_TOKEN) {
    $env:PEGAS_LOCAL_AI_TOKEN = ([guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N"))
}
if (-not $env:WHISPER_MODEL) { $env:WHISPER_MODEL = "small" }
if (-not $env:WHISPER_DEVICE) { $env:WHISPER_DEVICE = "cuda" }
if (-not $env:WHISPER_COMPUTE_TYPE) { $env:WHISPER_COMPUTE_TYPE = "float16" }
if (-not $env:OLLAMA_MODEL) { $env:OLLAMA_MODEL = "qwen3:8b" }

Write-Host ""
Write-Host "PEGAS FLOW Local AI запускается на http://127.0.0.1:8765" -ForegroundColor Green
Write-Host "СЕКРЕТ ДЛЯ SUPABASE (PEGAS_LOCAL_AI_TOKEN):" -ForegroundColor Yellow
Write-Host $env:PEGAS_LOCAL_AI_TOKEN -ForegroundColor Cyan
Write-Host "Не публикуй этот секрет и не добавляй его в GitHub." -ForegroundColor DarkYellow
Write-Host ""

& .\.venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8765
