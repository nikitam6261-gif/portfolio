@echo off
setlocal
cd /d %~dp0

if not exist cloudflared.exe (
  echo Downloading official cloudflared for Windows...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
  if errorlevel 1 (
    echo Failed to download cloudflared.
    pause
    exit /b 1
  )
)

echo.
echo Creating temporary HTTPS tunnel to PEGAS FLOW Voice STT...
echo Copy the https://....trycloudflare.com URL printed below.
echo Keep this window open.
echo.
cloudflared.exe tunnel --url http://localhost:8001
