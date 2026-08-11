# PEGAS FLOW

Production workspace for the LTL Control Tower.

## Current backend

Supabase project: `vvjuwtorumxhltrxejfc`

Implemented foundation:

- Telegram identity binding via `@pegas_flow_bot`
- application roles: `admin`, `director`, `dispatcher`, `warehouse`, `driver`, `manager`, `client`
- role/permission catalogue
- tenant/customer scoping foundation
- operational tables for customers, orders, pallets, pickup tasks, vehicles, warehouse cells, trips, events and alerts
- Row Level Security foundation
- Telegram Edge Function webhook

## Target architecture

`Telegram / Web -> Auth & RBAC -> API -> Supabase/PostgreSQL -> PEGAS AI tools`

Frontend migration will replace the current browser `localStorage` state with the Supabase operational model while preserving the useful workflows from the HTML prototype.

This branch is intentionally isolated from `main` until the new application is ready for review.
