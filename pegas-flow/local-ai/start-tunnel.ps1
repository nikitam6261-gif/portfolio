$ErrorActionPreference = "Stop"

if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Write-Host "cloudflared не найден. Пытаюсь установить через winget..." -ForegroundColor Yellow
    winget install --id Cloudflare.cloudflared -e --accept-package-agreements --accept-source-agreements
}

Write-Host ""
Write-Host "Открываю защищённый HTTPS-туннель к PEGAS Local AI..." -ForegroundColor Green
Write-Host "Скопируй адрес вида https://xxxxx.trycloudflare.com и передай его для PEGAS_LOCAL_AI_URL." -ForegroundColor Cyan
Write-Host "Окно не закрывай, пока нужен Telegram-голос." -ForegroundColor DarkYellow
Write-Host ""

cloudflared tunnel --url http://127.0.0.1:8765
