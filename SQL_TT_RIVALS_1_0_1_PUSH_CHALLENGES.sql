-- TT Rivals 1.0.1: conectar los desafíos nuevos con el envío externo.
-- Ejecutar completo en SQL Editor, después de la migración 1.0.0.
-- No contiene secretos, no reenvía desafíos anteriores y puede repetirse.
begin;

alter table public.push_delivery_queue_v100
  alter column notification_id drop not null,
  add column if not exists event_key text;

create unique index if not exists push_queue_event_device_v101_idx
  on public.push_delivery_queue_v100(event_key,subscription_id)
  where event_key is not null;

create or replace function public.queue_challenge_push_v101()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_event_key text;
  v_payload jsonb;
begin
  -- Solo la creación de un desafío pendiente: responder o editar no reavisa.
  if new.status::text is distinct from 'pending'
    or new.challenged_id is null
    or new.challenged_id = new.challenger_id then
    return new;
  end if;

  if not exists (
    select 1 from public.push_public_config_v100 where singleton and enabled
  ) then return new; end if;

  if exists (
    select 1 from public.user_preferences p
    where p.user_id = new.challenged_id
      and (to_jsonb(p)->>'notify_challenges')::boolean = false
  ) then return new; end if;

  -- La presencia es por cuenta: si está usando la app en otro dispositivo,
  -- conserva únicamente el aviso interno, como en la versión 1.0.0.
  if exists (
    select 1 from public.app_presence_v100 p
    where p.user_id = new.challenged_id and p.is_visible
      and p.last_seen_at > now() - interval '75 seconds'
  ) then return new; end if;

  v_event_key := 'challenge:' || new.id::text || ':received';
  v_payload := jsonb_build_object(
    'title','Nuevo desafío',
    'body','Te enviaron un desafío. Entrá a TT Rivals para responder.',
    'type','challenge_received',
    'action','play',
    'entity_kind','challenge',
    'entity_id',new.id::text,
    'event_key',v_event_key,
    -- Compatibilidad con teléfonos que todavía ejecutan el worker 1.0.0:
    -- este identificador es solo la etiqueta del aviso, no una FK de la cola.
    'notification_id',v_event_key,
    'url','./'
  );

  insert into public.push_delivery_queue_v100(event_key,subscription_id,payload)
  select v_event_key,s.id,v_payload
  from public.push_subscriptions_v100 s
  where s.user_id = new.challenged_id and s.enabled
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function public.queue_challenge_push_v101() from public,anon,authenticated;

drop trigger if exists trg_queue_challenge_push_v101 on public.challenges;
create trigger trg_queue_challenge_push_v101
  after insert on public.challenges
  for each row execute function public.queue_challenge_push_v101();

commit;

select jsonb_build_object(
  'version','1.0.1',
  'resultado','Conexión de desafíos con notificaciones activada',
  'trigger_activo',exists(
    select 1 from pg_trigger
    where tgrelid = 'public.challenges'::regclass
      and tgname = 'trg_queue_challenge_push_v101' and tgenabled = 'O'
  )
) as resultado;
