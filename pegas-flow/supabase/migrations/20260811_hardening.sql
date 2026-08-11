-- PEGAS FLOW hardening and operational indexes
create table if not exists public.web_auth_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  attempted_at timestamptz not null default now()
);
alter table public.web_auth_attempts enable row level security;
create index if not exists web_auth_attempts_ip_time_idx on public.web_auth_attempts(ip_hash, attempted_at desc);
create index if not exists pallets_company_status_idx on public.pallets(company_id,status);
create index if not exists pallets_company_customer_idx on public.pallets(company_id,customer_id);
create index if not exists pallets_sscc_idx on public.pallets(company_id,sscc);
create index if not exists pallets_trip_idx on public.pallets(trip_id) where trip_id is not null;
create index if not exists pallets_pickup_idx on public.pallets(pickup_task_id) where pickup_task_id is not null;
create index if not exists pallets_cell_idx on public.pallets(warehouse_cell_id) where warehouse_cell_id is not null;
create index if not exists orders_company_customer_idx on public.orders(company_id,customer_id);
create index if not exists trips_company_status_idx on public.trips(company_id,status);
create index if not exists pickups_company_status_idx on public.pickup_tasks(company_id,status);
create index if not exists alerts_company_status_idx on public.alerts(company_id,status,severity);
create index if not exists events_entity_idx on public.operational_events(company_id,entity_type,entity_id,created_at);

do $$
declare t text;
begin
  foreach t in array array[
    'companies','app_users','app_settings','audit_log','role_permissions','customers','orders','pallets','vehicles','warehouse_cells','pickup_tasks','pickup_task_pallets','trips','trip_pallets','operational_events','alerts','web_sessions','web_login_codes','web_auth_attempts','ai_audit'
  ] loop
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
  end loop;
end $$;
revoke all on all sequences in schema public from anon, authenticated;
grant usage, select on all sequences in schema public to service_role;
