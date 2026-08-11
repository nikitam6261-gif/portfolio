$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Ensure-WingetPackage {
    param([string]$Command, [string]$PackageId, [string]$Title)
    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        Write-Host "$Title уже установлен ✅" -ForegroundColor Green
        return
    }
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "Windows Package Manager (winget) не найден. Обнови App Installer из Microsoft Store и запусти снова."
    }
    Write-Host "Устанавливаю $Title..." -ForegroundColor Yellow
    winget install --id $PackageId -e --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

Ensure-WingetPackage -Command "python" -PackageId "Python.Python.3.11" -Title "Python 3.11"
Ensure-WingetPackage -Command "ollama" -PackageId "Ollama.Ollama" -Title "Ollama"
Ensure-WingetPackage -Command "cloudflared" -PackageId "Cloudflare.cloudflared" -Title "Cloudflared"

Write-Host ""
Write-Host "Загружаю Qwen3 8B. Первый раз это несколько гигабайт..." -ForegroundColor Yellow
ollama pull qwen3:8b

Write-Host ""
Write-Host "Запускаю PEGAS Local AI в отдельном окне..." -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-File',("`"" + (Join-Path $PSScriptRoot 'start-local-ai.ps1') + "`"")

Write-Host "Жду запуск локального сервера..." -ForegroundColor DarkGray
Start-Sleep -Seconds 12

Write-Host "Запускаю HTTPS-туннель в отдельном окне..." -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-File',("`"" + (Join-Path $PSScriptRoot 'start-tunnel.ps1') + "`"")

Write-Host ""
Write-Host "ГОТОВО. Останутся два значения для Supabase:" -ForegroundColor Cyan
Write-Host "1) PEGAS_LOCAL_AI_TOKEN — показан в окне Local AI." -ForegroundColor Yellow
Write-Host "2) PEGAS_LOCAL_AI_URL — адрес https://xxxxx.trycloudflare.com из окна туннеля." -ForegroundColor Yellow
Write-Host ""
Write-Host "TOKEN никому не отправляй. URL можно прислать в чат для проверки." -ForegroundColor DarkYellow
