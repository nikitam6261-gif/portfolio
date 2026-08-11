# PEGAS FLOW Local AI

Локальный AI-мост для Telegram-бота PEGAS FLOW.

Он делает две вещи:

1. `POST /transcribe` — принимает Telegram voice OGG/Opus и распознаёт русский текст через `faster-whisper`.
2. `POST /parse/order` — превращает свободный русский текст в структурированный черновик заявки через локальный Ollama + Qwen.

## Почему отдельный мост

Supabase Edge Functions принимают Telegram webhook и работают с общей PostgreSQL-базой, но тяжёлое распознавание речи лучше выполнять на машине с NVIDIA GPU. Telegram и сайт при этом продолжают работать с одной и той же базой PEGAS FLOW.

## Windows

### 1. Ollama

Установить Ollama и один раз скачать модель:

```powershell
ollama pull qwen3:8b
```

`qwen3:8b` используется как значение по умолчанию, но модель можно поменять переменной `OLLAMA_MODEL`.

### 2. Запуск AI

Запустить:

```powershell
.\start-local-ai.ps1
```

Скрипт создаст `.venv`, установит зависимости, сгенерирует секрет и запустит API на:

`http://127.0.0.1:8765`

Сохрани показанный секрет. Он должен быть одинаковым в локальной переменной `PEGAS_LOCAL_AI_TOKEN` и в Supabase Edge Function Secret с тем же именем.

### 3. HTTPS-туннель

Во втором PowerShell запустить:

```powershell
.\start-tunnel.ps1
```

Он выдаст HTTPS URL вида:

`https://xxxxx.trycloudflare.com`

Этот URL записывается в Supabase Secret `PEGAS_LOCAL_AI_URL`.

После этого `/health` у `@pegas_flow_bot` должен показывать, что голосовой движок подключён.

## Безопасность

- Telegram Bot Token не хранится на локальном AI-сервере.
- Local AI принимает запросы только с `Authorization: Bearer <PEGAS_LOCAL_AI_TOKEN>`.
- Голосовой файл используется для распознавания и удаляется сразу после обработки.
- LLM не пишет напрямую в PostgreSQL. Он только разбирает текст в JSON.
- Создание заявки происходит в серверном `pegas-bot-api` только после нажатия пользователем `Подтвердить`.
- Все входящие Telegram-сообщения, transcript, callback и выполненные действия логируются в Supabase.
