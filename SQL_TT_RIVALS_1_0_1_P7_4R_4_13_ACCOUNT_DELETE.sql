-- TT Rivals P7.4R.4.13
-- Conserva el registro técnico cuando el administrador que lo atendió elimina su cuenta.
begin;
alter table if exists public.installation_exception_events_v58 alter column admin_id drop not null;
alter table if exists public.installation_exception_events_v58 drop constraint if exists installation_exception_events_v58_admin_id_fkey;
alter table if exists public.installation_exception_events_v58 add constraint installation_exception_events_v58_admin_id_fkey foreign key (admin_id) references auth.users(id) on delete set null;
commit;
