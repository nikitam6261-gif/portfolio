@echo off
setlocal
cd /d %~dp0

where py >nul 2>nul
if errorlevel 1 (
  echo Python launcher 'py' not found. Install Python 3.11+ and run again.
  pause
  exit /b 1
)

if not exist .venv (
  py -3 -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

if "%WHISPER_MODEL%"=="" set WHISPER_MODEL=large-v3-turbo
if "%WHISPER_DEVICE%"=="" set WHISPER_DEVICE=cuda
if "%WHISPER_COMPUTE_TYPE%"=="" set WHISPER_COMPUTE_TYPE=float16

echo.
echo PEGAS FLOW Voice STT starting on http://127.0.0.1:8001
echo Keep this window open while the Telegram bot should understand voice.
echo.
uvicorn app:app --host 0.0.0.0 --port 8001
