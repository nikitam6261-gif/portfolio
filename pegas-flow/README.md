# PEGAS FLOW

Рабочая версия LTL Control Tower для PEGAS-AUTO.

## Готовый контур

- Telegram `@pegas_flow_bot`: вход по одноразовому коду, роли, статус груза, сводка и отчёт.
- Supabase/PostgreSQL: единая операционная база.
- Роли: `admin`, `director`, `dispatcher`, `warehouse`, `driver`, `manager`, `client`.
- Серверная RBAC-проверка и область данных по компании/клиенту/назначенному водителю.
- Сущности: заказчики, заявки, паллеты, задания на забор, транспорт, складские ячейки, рейсы, события, алерты, аудит.
- 49 исторических заказчиков импортированы из исходного LTL-прототипа.
- `app-api` Edge Function v2: CRUD, генерация паллет, pickup, warehouse placement, trip builder, kg/LDM validation, route planning, pallet journey, reports, users, AI gateway.
- `telegram-webhook` v6: `/login`, `/status`, `/summary`, `/report`, роли и управление пользователями.
- Автоалерты SLA, паллет без рейса и перегруза рейса.
- Серверные login rate limits и закрытый Data API: операционные таблицы недоступны `anon`/`authenticated`, браузер не получает service-role key.
- PEGAS AI работает в безопасном tool-based режиме на живых данных; Qwen подключается через OpenAI-compatible endpoint без изменения модели прав.

## Интерфейс

Финальный интерфейс собран как самодостаточный `index.html`, без обязательной npm-сборки. Он подключается к Supabase `app-api` и включает Control Tower, заявки, паллеты, заборы, склад, рейсы, транспорт, заказчиков, аналитику, PEGAS AI и пользователей.

## Архитектура

`Telegram / Web -> custom session + RBAC -> Supabase Edge Function -> PostgreSQL -> PEGAS AI tools / optional Qwen`

## Принцип данных

Фиктивные рабочие заявки, машины, рейсы, складские ячейки и паллеты намеренно не создаются. Операционный контур начинается с реальных данных пользователя. Исторические данные заказчиков сохранены отдельно как справочная аналитика.

Ветка изолирована от `main`: `agent/pegas-flow-production-v1`.
