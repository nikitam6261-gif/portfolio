do $$
declare t text;
begin
  foreach t in array array[
    'companies','app_users','app_settings','audit_log','role_permissions','customers','orders','pallets','vehicles','warehouse_cells','pickup_tasks','pickup_task_pallets','trips','trip_pallets','operational_events','alerts','web_sessions','web_login_codes','web_auth_attempts','ai_audit'
  ] loop
    execute format('drop policy if exists server_only on public.%I', t);
    execute format('create policy server_only on public.%I for all to anon, authenticated using (false) with check (false)', t);
  end loop;
end $$;
