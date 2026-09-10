-- TT Rivals 1.0.5 · Ejecutar después de SQL_LIGAS_1_0_5.sql.
-- Reutiliza las notificaciones y el despachador push ya instalados.
-- No solicita ni modifica claves VAPID, secretos o el Cron de envío actual.
begin;
set local lock_timeout='5s';
do $$ begin
 if to_regclass('public.league_reminders_v105') is null then raise exception 'Primero ejecutá SQL_LIGAS_1_0_5.sql';end if;
 if to_regclass('cron.job') is null then raise exception 'Habilitá pg_cron en Database → Extensions y repetí este archivo';end if;
 if to_regclass('public.push_delivery_queue_v100') is null then raise exception 'Falta instalar las notificaciones externas de TT Rivals';end if;
 if not exists(select 1 from pg_trigger where tgrelid='public.notifications_v58'::regclass and not tgisinternal and tgenabled in ('O','A')) then
  raise exception 'No hay un disparador activo de notificaciones. Revisar el sistema push antes de continuar';
 end if;
end $$;

create or replace function public.league_reminder_tick_v105() returns jsonb
language plpgsql security definer set search_path='' as $$
declare r record; notice bigint; inserted_count int; processed int:=0; begin
 -- Short transaction-level lock: overlapping Cron/manual executions cannot duplicate.
 if not pg_try_advisory_xact_lock(105,2026) then return jsonb_build_object('ocupado',true);end if;
 for r in
  select d.id date_id,d.revision,d.date_no,d.starts_at,d.venue,l.id league_id,l.name,l.timezone,f.user_id,
   case when d.starts_at>now()+interval '6 days' then '7d'
        when d.starts_at>now()+interval '23 hours' then '1d' else '1h' end reminder
  from public.league_dates_v105 d join public.leagues_v105 l on l.id=d.league_id
  join public.league_followers_v105 f on f.league_id=l.id and f.reminders
  left join public.user_preferences p on p.user_id=f.user_id
  where l.status='active' and d.status in ('registration','groups') and coalesce(p.notify_tournaments,true)
   and ((d.starts_at>now()+interval '6 days' and d.starts_at<=now()+interval '7 days')
     or ((d.starts_at>now()+interval '23 hours' and d.starts_at<=now()+interval '1 day'
       or d.starts_at>now() and d.starts_at<=now()+interval '1 hour')
      and exists(select 1 from public.league_entries_v105 e where e.date_id=d.id and e.user_id=f.user_id and not e.withdrawn)))
   and not exists(select 1 from public.league_reminders_v105 sent where sent.date_id=d.id and sent.user_id=f.user_id and sent.revision=d.revision
     and sent.reminder=case when d.starts_at>now()+interval '6 days' then '7d' when d.starts_at>now()+interval '23 hours' then '1d' else '1h' end)
  order by d.starts_at,f.user_id limit 2000
 loop
  -- Serialise a reminder with edits to its schedule/registration.
  perform 1 from public.leagues_v105 where id=r.league_id for update;
  perform 1 from public.league_dates_v105 where id=r.date_id and revision=r.revision and status in ('registration','groups') for update;
  if not found then continue;end if;
  if not exists(select 1 from public.league_followers_v105 f join public.leagues_v105 l on l.id=f.league_id
   left join public.user_preferences p on p.user_id=f.user_id
   where f.league_id=r.league_id and f.user_id=r.user_id and f.reminders and l.status='active' and coalesce(p.notify_tournaments,true)) then continue;end if;
  if r.reminder<>'7d' and not exists(select 1 from public.league_entries_v105 where date_id=r.date_id and user_id=r.user_id and not withdrawn) then continue;end if;
  insert into public.league_reminders_v105(date_id,user_id,revision,reminder) values(r.date_id,r.user_id,r.revision,r.reminder) on conflict do nothing;
  get diagnostics inserted_count=row_count;if inserted_count=0 then continue;end if;
  insert into public.notifications_v58(user_id,type,title,body,entity_kind,entity_id,action)
  values(r.user_id,'league_reminder',case r.reminder when '7d' then '¡Tu próxima fecha de liga es en 7 días!' when '1d' then 'Mañana jugás tu fecha de liga' else '¡Tu fecha de liga empieza en menos de una hora!' end,
   r.name||' · Fecha '||r.date_no||' · '||to_char(r.starts_at at time zone r.timezone,'DD/MM HH24:MI')||case when r.venue<>'' then ' · '||r.venue else '' end,
   'league',r.league_id::text,'leagues') returning id into notice;
  update public.league_reminders_v105 set notification_id=notice where date_id=r.date_id and user_id=r.user_id and revision=r.revision and reminder=r.reminder;
  processed:=processed+1;
 end loop;
 return jsonb_build_object('notificaciones_creadas',processed);
end $$;

create or replace function public.league_schedule_changed_v105() returns trigger
language plpgsql security definer set search_path='' as $$
declare r record; title_text text; lname text; zone text; begin
 if new.revision=old.revision then return new;end if;
 -- Never alter an already delivered notification. Retire only unsent queue work.
 update public.push_delivery_queue_v100 q set status='expired',last_error='league_schedule_changed'
 where q.status='pending' and q.notification_id in(select notification_id from public.league_reminders_v105 where date_id=new.id and revision<>new.revision);
 select name,timezone into lname,zone from public.leagues_v105 where id=new.league_id;
 title_text:=case when new.status='cancelled' then 'Fecha de liga cancelada' else 'Cambió el horario o lugar de tu liga' end;
 for r in select f.user_id from public.league_followers_v105 f left join public.user_preferences p on p.user_id=f.user_id
  where f.league_id=new.league_id and f.reminders and coalesce(p.notify_tournaments,true)
 loop
  insert into public.notifications_v58(user_id,type,title,body,entity_kind,entity_id,action)
  values(r.user_id,'league_schedule',title_text,lname||' · Fecha '||new.date_no||case when new.status='cancelled' then '' else ' · '||to_char(new.starts_at at time zone zone,'DD/MM HH24:MI')||' · '||new.venue end,'league',new.league_id::text,'leagues');
 end loop;
 return new;
end $$;
drop trigger if exists trg_league_schedule_changed_v105 on public.league_dates_v105;
create trigger trg_league_schedule_changed_v105 after update of revision on public.league_dates_v105 for each row execute function public.league_schedule_changed_v105();
revoke all on function public.league_reminder_tick_v105(),public.league_schedule_changed_v105() from public,anon,authenticated;
-- Named schedule updates the existing job on subsequent runs; no duplicate jobs.
select cron.schedule('tt-league-reminders-v105','* * * * *','select public.league_reminder_tick_v105();');
commit;
select jsonb_build_object('resultado','Recordatorios de Ligas activados','avisos','7 días, 1 día y 1 hora','respeta_preferencias',true) as resultado;
