-- TT Rivals 1.0.2: envío al crear el aviso, sin esperar el minuto de Cron.
-- PRIMERO actualizar la función tt-push-dispatch-v100 con el código 1.0.2.
-- DESPUÉS ejecutar completo este archivo en SQL Editor.
-- Reutiliza el secreto de Vault. No pegar ni cambiar claves.
-- Mantiene Cron como respaldo y no reenvía avisos antiguos.
begin;

do $$
begin
  if to_regprocedure('net.http_post(text,jsonb,jsonb,jsonb,integer)') is null then
    raise exception 'Falta pg_net. Activarlo en Database > Extensions antes de continuar.';
  end if;
  if not exists (
    select 1 from vault.decrypted_secrets
    where name='tt_push_cron_secret_v100' and nullif(decrypted_secret,'') is not null
  ) then
    raise exception 'Falta el secreto tt_push_cron_secret_v100 en Vault. Conservar el mismo usado por Cron.';
  end if;
end $$;

-- Registro técnico sin claves, endpoints de teléfonos ni contenido del aviso.
create table if not exists public.push_dispatch_requests_v102(
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  request_id bigint,
  queued_count integer not null,
  fallback_reason text
);
alter table public.push_dispatch_requests_v102 enable row level security;
revoke all on public.push_dispatch_requests_v102 from public,anon,authenticated;

create or replace function public.wake_push_dispatch_v102()
returns trigger language plpgsql security definer set search_path=''
as $$
declare
  v_count integer;
  v_secret text;
  v_request_id bigint;
begin
  select count(*) into v_count from inserted_pushes_v102
  where status='pending' and available_at<=now();
  if v_count=0 then return null; end if;
  if not exists (
    select 1 from public.push_public_config_v100 where singleton and enabled
  ) then return null; end if;

  -- pg_net inicia el HTTP DESPUÉS del commit, cuando la cola ya es visible.
  -- Una invocación por INSERT, aunque ese aviso tenga varios dispositivos.
  begin
    select decrypted_secret into v_secret from vault.decrypted_secrets
    where name='tt_push_cron_secret_v100' limit 1;
    if nullif(v_secret,'') is null then
      raise exception using errcode='P0001',message='Push secret unavailable';
    end if;

    select net.http_post(
      url:='https://yfwuwrpfpzhpddgkjvty.supabase.co/functions/v1/tt-push-dispatch-v100',
      headers:=jsonb_build_object('Content-Type','application/json','x-tt-push-secret',v_secret),
      body:='{"source":"queue_insert","version":"1.0.2"}'::jsonb,
      timeout_milliseconds:=10000
    ) into v_request_id;

    insert into public.push_dispatch_requests_v102(request_id,queued_count)
    values(v_request_id,v_count);
  exception when others then
    -- Si falla la activación inmediata, el desafío y su cola se conservan.
    -- Cron vuelve a intentarlo. No registrar SQLERRM: podría contener secretos.
    insert into public.push_dispatch_requests_v102(queued_count,fallback_reason)
    values(v_count,SQLSTATE);
  end;
  return null;
end;
$$;
revoke all on function public.wake_push_dispatch_v102() from public,anon,authenticated;

drop trigger if exists trg_wake_push_dispatch_v102 on public.push_delivery_queue_v100;
create trigger trg_wake_push_dispatch_v102
  after insert on public.push_delivery_queue_v100
  referencing new table as inserted_pushes_v102
  for each statement execute function public.wake_push_dispatch_v102();

commit;

select jsonb_build_object(
  'version','1.0.2',
  'resultado','Envío inmediato activado; Cron queda como respaldo',
  'envio_inmediato_activo',exists(
    select 1 from pg_trigger
    where tgrelid='public.push_delivery_queue_v100'::regclass
      and tgname='trg_wake_push_dispatch_v102' and tgenabled='O'
  )
) as resultado;
