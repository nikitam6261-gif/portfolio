# PEGAS FLOW login incident QA — 2026-08-11

## Root cause

The one-time Telegram code was accepted successfully. Immediately after redemption, the old `app-api` failed during `bootstrap` with HTTP 500. Because the UI stayed on the login screen, subsequent attempts reused an already-consumed one-time code, causing HTTP 401 and eventually the login rate limiter returned HTTP 429.

One bootstrap failure source was the automatic alerts refresh path using an unsafe raw wildcard query (`alert_type=like.auto_%`) and allowing alert-refresh errors to fail the entire bootstrap.

## Fixes

- Replaced the frontend endpoint with the hardened `pegas-flow-api`.
- Login attempt counters are written only for failed attempts and cleared on successful login.
- A successful code redemption creates the session before bootstrap.
- Automatic alert refresh no longer breaks the entire Control Tower bootstrap.
- Wildcard query values are URL-encoded.
- Telegram webhook upgraded to v7 with `/health`.
- `/login` deletes older unused codes and clearly states that only the latest code is valid.
- Old frontend session keys are discarded.
- Standalone frontend has a fallback hydration path if aggregate bootstrap fails.
- Direct Data API access for application tables remains server-only; explicit deny RLS policies were added.
- Duplicate indexes reported by Supabase Advisor were removed.

## Verification performed

Server-side self-test passed all of the following in the live Supabase project:

- companies
- app_users
- role_permissions
- customers
- orders
- pallets
- vehicles
- warehouse_cells
- pickup_tasks
- trips
- alerts
- operational_events
- web_sessions
- web_login_codes
- bootstrap
- redeem_code
- authenticated session lookup
- bootstrap after successful login

Live health checks returned HTTP 200 for both the new core API and Telegram webhook. Telegram webhook v7 reported its core API as healthy.

Telegram `getWebhookInfo` was also checked directly through a temporary server-side QA function. It returned:

- webhook URL = the production Supabase `telegram-webhook` URL;
- pending update count = 0;
- last error date/message = none;
- allowed updates = `message`.

The temporary Telegram QA endpoint was disabled immediately after the check.

Supabase Security Advisor currently reports zero security lints. Duplicate-index warnings from the Performance Advisor were removed; remaining performance entries are informational unused-index notices expected for an almost-empty new operational database.

Frontend static validation:

- standalone JavaScript syntax passes `node --check`;
- all 25 API actions referenced by the standalone HTML exist in the backend implementation;
- no missing action names were detected.

A full Chromium render could not be executed inside the ChatGPT sandbox because local/file navigation is blocked by the environment administrator. This is an environment restriction, not an application JavaScript syntax failure.

## Current endpoints

- Core: `/functions/v1/pegas-flow-api`
- Telegram: `/functions/v1/telegram-webhook`

Vercel was not used during this incident repair.
