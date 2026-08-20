-- TT RIVALS P7.0 METRICAS — CORREGIDO V2 (alias event_date; 2026-08-20)
-- =====================================================================
-- TT RIVALS 1.0.1 — P7.0 INSTRUMENTACIÓN Y MÉTRICAS
-- Aditivo. No reinicia usuarios, partidos, desafíos ni rating.
-- Objetivo: medir el ciclo competitivo real sin confiar en el cliente.
-- =====================================================================

begin;

create table if not exists public.product_events_v70 (
  id bigserial primary key,
  event_name text not null,
  actor_id uuid references auth.users(id) on delete set null,
  opponent_id uuid references auth.users(id) on delete set null,
  player1_id uuid references auth.users(id) on delete set null,
  player2_id uuid references auth.users(id) on delete set null,
  challenge_id bigint,
  match_id bigint,
  source text not null default 'server' check(source in('server','client')),
  metadata jsonb not null default '{}'::jsonb,
  dedupe_key text,
  created_at timestamptz not null default now()
);

create unique index if not exists product_events_v70_dedupe_idx
  on public.product_events_v70(dedupe_key)
  where dedupe_key is not null;
create index if not exists product_events_v70_created_idx
  on public.product_events_v70(created_at desc);
create index if not exists product_events_v70_event_idx
  on public.product_events_v70(event_name,created_at desc);
create index if not exists product_events_v70_match_idx
  on public.product_events_v70(match_id)
  where match_id is not null;
create index if not exists product_events_v70_challenge_idx
  on public.product_events_v70(challenge_id)
  where challenge_id is not null;

alter table public.product_events_v70 enable row level security;
revoke all on public.product_events_v70 from anon,authenticated;

-- Inserción interna tolerante a fallos. Telemetría nunca puede romper un partido.
create or replace function public.tt_v70_insert_event(
  p_event_name text,
  p_actor_id uuid default null,
  p_opponent_id uuid default null,
  p_player1_id uuid default null,
  p_player2_id uuid default null,
  p_challenge_id bigint default null,
  p_match_id bigint default null,
  p_source text default 'server',
  p_metadata jsonb default '{}'::jsonb,
  p_dedupe_key text default null
)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  insert into public.product_events_v70(
    event_name,actor_id,opponent_id,player1_id,player2_id,
    challenge_id,match_id,source,metadata,dedupe_key
  ) values(
    left(coalesce(p_event_name,'unknown'),80),p_actor_id,p_opponent_id,p_player1_id,p_player2_id,
    p_challenge_id,p_match_id,case when p_source='client' then 'client' else 'server' end,
    coalesce(p_metadata,'{}'::jsonb),p_dedupe_key
  )
  on conflict(dedupe_key) where dedupe_key is not null do nothing;
exception when others then
  -- P7.0: nunca interrumpir la operación competitiva por un error de métricas.
  null;
end;
$$;
revoke all on function public.tt_v70_insert_event(text,uuid,uuid,uuid,uuid,bigint,bigint,text,jsonb,text) from public;

create or replace function public.tt_v70_challenge_event_trigger()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_event text;
  v_actor uuid;
  v_opponent uuid;
begin
  if tg_op='INSERT' then
    perform public.tt_v70_insert_event(
      'challenge_sent',new.challenger_id,new.challenged_id,new.challenger_id,new.challenged_id,
      new.id,null,'server',
      jsonb_build_object('status',new.status,'match_type',new.match_type,'match_format',new.match_format),
      'challenge:'||new.id::text||':sent'
    );
    return new;
  end if;

  if old.status is distinct from new.status then
    v_event:=case new.status
      when 'accepted' then 'challenge_accepted'
      when 'rejected' then 'challenge_rejected'
      when 'cancelled' then 'challenge_cancelled'
      when 'completed' then 'challenge_completed'
      else null
    end;

    if v_event is not null then
      if new.status in('accepted','rejected') then
        v_actor:=new.challenged_id; v_opponent:=new.challenger_id;
      elsif new.status='cancelled' then
        v_actor:=new.challenger_id; v_opponent:=new.challenged_id;
      else
        v_actor:=null; v_opponent:=null;
      end if;

      perform public.tt_v70_insert_event(
        v_event,v_actor,v_opponent,new.challenger_id,new.challenged_id,
        new.id,null,'server',
        jsonb_build_object('status',new.status,'match_type',new.match_type,'match_format',new.match_format),
        'challenge:'||new.id::text||':'||new.status
      );
    end if;
  end if;
  return new;
exception when others then
  return new;
end;
$$;

-- Se reinstala de forma idempotente.
drop trigger if exists trg_tt_v70_challenge_events on public.challenges;
create trigger trg_tt_v70_challenge_events
after insert or update of status on public.challenges
for each row execute function public.tt_v70_challenge_event_trigger();

create or replace function public.tt_v70_match_event_trigger()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_actor uuid;
  v_opponent uuid;
  v_stamp text;
begin
  if tg_op='INSERT' then
    perform public.tt_v70_insert_event(
      'match_created',null,null,new.player1_id,new.player2_id,
      new.challenge_id,new.id,'server',
      jsonb_build_object('result_status',new.result_status,'match_type',new.match_type,'match_format',new.match_format),
      'match:'||new.id::text||':created'
    );
    return new;
  end if;

  if old.result_status is distinct from new.result_status then
    if new.result_status='awaiting_confirmation' then
      v_actor:=new.result_submitted_by;
      v_opponent:=case when v_actor=new.player1_id then new.player2_id else new.player1_id end;
      v_stamp:=coalesce(new.result_submitted_at::text,clock_timestamp()::text);
      perform public.tt_v70_insert_event(
        'result_submitted',v_actor,v_opponent,new.player1_id,new.player2_id,
        new.challenge_id,new.id,'server',
        jsonb_build_object('result_status',new.result_status,'match_type',new.match_type,'match_format',new.match_format),
        'match:'||new.id::text||':submitted:'||v_stamp
      );
    elsif new.result_status='confirmed' then
      v_actor:=new.result_confirmed_by;
      v_opponent:=case when v_actor=new.player1_id then new.player2_id else new.player1_id end;
      v_stamp:=coalesce(new.confirmed_at::text,clock_timestamp()::text);
      perform public.tt_v70_insert_event(
        'match_confirmed',v_actor,v_opponent,new.player1_id,new.player2_id,
        new.challenge_id,new.id,'server',
        jsonb_build_object(
          'result_status',new.result_status,'match_type',new.match_type,'match_format',new.match_format,
          'winner_id',new.winner_id,'completion_type',new.completion_type
        ),
        'match:'||new.id::text||':confirmed:'||v_stamp
      );
    elsif new.result_status='disputed' then
      perform public.tt_v70_insert_event(
        'match_disputed',null,null,new.player1_id,new.player2_id,
        new.challenge_id,new.id,'server',
        jsonb_build_object('match_type',new.match_type,'match_format',new.match_format),
        'match:'||new.id::text||':disputed:'||clock_timestamp()::text
      );
    elsif new.result_status='annulled' then
      perform public.tt_v70_insert_event(
        'match_annulled',null,null,new.player1_id,new.player2_id,
        new.challenge_id,new.id,'server',
        jsonb_build_object('match_type',new.match_type,'match_format',new.match_format),
        'match:'||new.id::text||':annulled:'||clock_timestamp()::text
      );
    end if;
  end if;
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists trg_tt_v70_match_events on public.matches;
create trigger trg_tt_v70_match_events
after insert or update of result_status on public.matches
for each row execute function public.tt_v70_match_event_trigger();

-- Eventos de experiencia que no afectan el resultado competitivo.
create or replace function public.record_client_product_event_v70(
  p_event_name text,
  p_match_id bigint default null,
  p_challenge_id bigint default null,
  p_opponent_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare
  v_uid uuid:=auth.uid();
  v_name text:=lower(trim(coalesce(p_event_name,'')));
begin
  if v_uid is null then raise exception 'Debés iniciar sesión'; end if;
  if v_name not in('post_match_opened','rematch_requested') then
    raise exception 'Evento no permitido';
  end if;
  perform public.tt_v70_insert_event(
    v_name,v_uid,p_opponent_id,null,null,p_challenge_id,p_match_id,'client',
    coalesce(p_metadata,'{}'::jsonb),
    case when v_name='rematch_requested' and p_challenge_id is not null
      then 'client:rematch:'||p_challenge_id::text
      else null
    end
  );
  return true;
end;
$$;
revoke all on function public.record_client_product_event_v70(text,bigint,bigint,uuid,jsonb) from public;
grant execute on function public.record_client_product_event_v70(text,bigint,bigint,uuid,jsonb) to authenticated;

-- Panel de producto exclusivo de Administración.
create or replace function public.admin_get_product_metrics_v70(p_days integer default 7)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_days integer:=greatest(1,least(coalesce(p_days,7),90));
  v_start timestamptz:=now()-make_interval(days=>greatest(1,least(coalesce(p_days,7),90)));
  v_sent integer:=0;
  v_accepted integer:=0;
  v_submitted integer:=0;
  v_confirmed integer:=0;
  v_ranked integer:=0;
  v_casual integer:=0;
  v_disputed integer:=0;
  v_annulled integer:=0;
  v_rematches integer:=0;
  v_post_match integer:=0;
  v_active integer:=0;
  v_rival_pairs integer:=0;
  v_daily jsonb:='[]'::jsonb;
  v_started timestamptz;
begin
  if auth.uid() is null then raise exception 'Debés iniciar sesión'; end if;
  if not public.tt_v58_is_admin(auth.uid()) then raise exception 'Solo Administración puede ver estas métricas'; end if;

  select min(created_at) into v_started from public.product_events_v70;

  select
    count(*) filter(where event_name='challenge_sent'),
    count(*) filter(where event_name='challenge_accepted'),
    count(*) filter(where event_name='result_submitted'),
    count(distinct match_id) filter(where event_name='match_confirmed'),
    count(distinct match_id) filter(where event_name='match_confirmed' and coalesce(metadata->>'match_type','ranked')='ranked'),
    count(distinct match_id) filter(where event_name='match_confirmed' and metadata->>'match_type'='casual'),
    count(*) filter(where event_name='match_disputed'),
    count(*) filter(where event_name='match_annulled'),
    count(*) filter(where event_name='rematch_requested'),
    count(*) filter(where event_name='post_match_opened')
  into v_sent,v_accepted,v_submitted,v_confirmed,v_ranked,v_casual,v_disputed,v_annulled,v_rematches,v_post_match
  from public.product_events_v70
  where created_at>=v_start;

  select count(distinct uid)::integer into v_active
  from (
    select player1_id uid from public.product_events_v70
      where created_at>=v_start and event_name='match_confirmed'
        and coalesce(metadata->>'match_type','ranked')='ranked' and player1_id is not null
    union
    select player2_id uid from public.product_events_v70
      where created_at>=v_start and event_name='match_confirmed'
        and coalesce(metadata->>'match_type','ranked')='ranked' and player2_id is not null
  ) q;

  select count(distinct (least(player1_id::text,player2_id::text)||':'||greatest(player1_id::text,player2_id::text)))::integer
  into v_rival_pairs
  from public.product_events_v70
  where created_at>=v_start and event_name='match_confirmed'
    and player1_id is not null and player2_id is not null;

  select coalesce(jsonb_agg(jsonb_build_object(
    'date',x.event_date,
    'challenges',x.challenges,
    'accepted',x.accepted,
    'verified_matches',x.verified_matches
  ) order by x.event_date),'[]'::jsonb)
  into v_daily
  from (
    select d::date as event_date,
      count(*) filter(where e.event_name='challenge_sent')::integer challenges,
      count(*) filter(where e.event_name='challenge_accepted')::integer accepted,
      count(distinct e.match_id) filter(where e.event_name='match_confirmed')::integer verified_matches
    from generate_series(date_trunc('day',v_start),date_trunc('day',now()),interval '1 day') d
    left join public.product_events_v70 e
      on e.created_at>=d and e.created_at<d+interval '1 day'
    group by d
  ) x;

  return jsonb_build_object(
    'days',v_days,
    'window_start',v_start,
    'generated_at',now(),
    'telemetry_started_at',v_started,
    'active_competitive_players',coalesce(v_active,0),
    'challenges_sent',coalesce(v_sent,0),
    'challenges_accepted',coalesce(v_accepted,0),
    'challenge_acceptance_rate',case when v_sent>0 then round((v_accepted::numeric/v_sent::numeric)*100,1) else 0 end,
    'results_submitted',coalesce(v_submitted,0),
    'verified_matches',coalesce(v_confirmed,0),
    'ranked_verified_matches',coalesce(v_ranked,0),
    'casual_verified_matches',coalesce(v_casual,0),
    'confirmation_rate',case when v_submitted>0 then round((v_confirmed::numeric/v_submitted::numeric)*100,1) else 0 end,
    'verified_matches_per_active_player',case when v_active>0 then round(((v_ranked*2)::numeric/v_active::numeric),2) else 0 end,
    'different_rival_pairs',coalesce(v_rival_pairs,0),
    'disputes',coalesce(v_disputed,0),
    'annulled_matches',coalesce(v_annulled,0),
    'rematch_requests',coalesce(v_rematches,0),
    'post_match_opens',coalesce(v_post_match,0),
    'daily',v_daily
  );
end;
$$;
revoke all on function public.admin_get_product_metrics_v70(integer) from public;
grant execute on function public.admin_get_product_metrics_v70(integer) to authenticated;

commit;

select 'TT Rivals P7.0 métricas instalado correctamente' as resultado;
