# PEGAS FLOW Voice STT

Local OpenAI-compatible speech-to-text service for Telegram voice messages.

## Endpoint

`POST /v1/audio/transcriptions`

Multipart fields:
- `file`: OGG/Opus/audio file
- `model`: optional
- `language`: defaults to `ru`
- `response_format`: optional

Response:

```json
{"text":"распознанный текст","language":"ru","duration":4.2,"model":"large-v3-turbo"}
```

## Windows

Run `start_voice_server.bat`.

Default settings:
- model: `large-v3-turbo`
- device: `cuda`
- compute type: `float16`
- port: `8001`

If CUDA initialization fails, the service automatically falls back to CPU/int8 so it remains usable for diagnostics.

## Connection to Telegram webhook

Supabase Edge Function `telegram-webhook` expects an OpenAI-compatible STT server in secret `STT_BASE_URL` and optionally `STT_API_KEY`. The local service must therefore be reachable by HTTPS from Supabase (for example through a secure tunnel or a permanently hosted GPU server).

The Telegram bot never writes a voice-derived order directly. Voice is transcribed to text, parsed into a draft, missing fields are requested, and the user must press **Confirm** before `pegas-bot-api` creates the order.
