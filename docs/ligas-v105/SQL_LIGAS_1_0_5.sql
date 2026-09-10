-- TT Rivals 1.0.5 · Ligas por fechas. Ejecutar completo, una sola transacción.
-- No borra competiciones ni modifica sus resultados. Reejecutable.
begin;
set local lock_timeout='5s';
set local statement_timeout='90s';

do $$ begin
 if to_regclass('public.ratings') is null or to_regclass('public.rating_history') is null
 or to_regclass('public.notifications_v58') is null then
  raise exception 'Falta el esquema de RP o notificaciones de TT Rivals. No se aplicó Ligas.';
 end if;
end $$;

create table if not exists public.leagues_v105(
 id bigint generated always as identity primary key,
 owner_id uuid references auth.users(id) on delete set null,
 name text not null check(length(name) between 3 and 80),
 description text not null default '' check(length(description)<=1000),
 frequency text not null check(frequency in ('weekly','monthly')),
 date_count int not null check(date_count between 1 and 60),
 timezone text not null default 'America/Montevideo',
 draw_mode text not null check(draw_mode in ('random','balanced')),
 best_of int not null default 5 check(best_of in (3,5)),
 status text not null default 'active' check(status in ('active','completed','cancelled')),
 created_at timestamptz not null default now()
);
create table if not exists public.league_dates_v105(
 id bigint generated always as identity primary key,
 league_id bigint not null references public.leagues_v105(id) on delete cascade,
 date_no int not null,
 starts_at timestamptz not null,
 venue text not null default '' check(length(venue)<=180),
 status text not null default 'registration' check(status in ('registration','groups','groups_done','knockout','completed','cancelled')),
 revision int not null default 1,
 drawn_at timestamptz,
 champion_id bigint,
 unique(league_id,date_no)
);
create table if not exists public.league_entries_v105(
 id bigint generated always as identity primary key,
 date_id bigint not null references public.league_dates_v105(id) on delete cascade,
 user_id uuid references auth.users(id) on delete set null,
 group_no int,
 seed_rating int not null default 1000,
 tie_order uuid not null default gen_random_uuid(),
 withdrawn boolean not null default false,
 joined_at timestamptz not null default now(),
 unique(date_id,user_id)
);
create table if not exists public.league_games_v105(
 id bigint generated always as identity primary key,
 date_id bigint not null references public.league_dates_v105(id) on delete cascade,
 group_no int,
 round_size int check(round_size in (2,4,8,16,32,64,128)),
 slot int not null,
 player1 bigint references public.league_entries_v105(id),
 player2 bigint references public.league_entries_v105(id),
 winner bigint references public.league_entries_v105(id),
 status text not null default 'pending' check(status in ('pending','played','walkover','bye','void')),
 sets jsonb not null default '[]',
 sets1 int not null default 0, sets2 int not null default 0,
 points1 int not null default 0, points2 int not null default 0,
 rp1 int not null default 0, rp2 int not null default 0,
 resolved_at timestamptz,
 check(player1 is null or player2 is null or player1<>player2),
 check(winner is null or winner=player1 or winner=player2),
 check((group_no is not null and round_size is null) or (group_no is null and round_size is not null))
);
create unique index if not exists league_group_pair_v105 on public.league_games_v105(date_id,least(player1,player2),greatest(player1,player2)) where group_no is not null;
create unique index if not exists league_bracket_slot_v105 on public.league_games_v105(date_id,round_size,slot) where round_size is not null;
create index if not exists league_dates_parent_v105 on public.league_dates_v105(league_id);
create index if not exists league_games_date_v105 on public.league_games_v105(date_id,status);
create table if not exists public.league_followers_v105(
 league_id bigint not null references public.leagues_v105(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 reminders boolean not null default true,
 joined_at timestamptz not null default now(),
 primary key(league_id,user_id)
);
create table if not exists public.league_audit_v105(
 id bigint generated always as identity primary key,
 league_id bigint not null references public.leagues_v105(id) on delete cascade,
 date_id bigint references public.league_dates_v105(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null,
 action text not null, details jsonb not null default '{}',
 created_at timestamptz not null default now()
);
create table if not exists public.league_reminders_v105(
 date_id bigint not null references public.league_dates_v105(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 revision int not null, reminder text not null,
 notification_id bigint,
 created_at timestamptz not null default now(),
 primary key(date_id,user_id,revision,reminder)
);

-- An explicit origin and one ledger entry per player/game prevent duplicate RP.
alter table public.rating_history add column if not exists source_type text;
alter table public.rating_history add column if not exists league_game_id bigint references public.league_games_v105(id);
create unique index if not exists league_rp_once_v105 on public.rating_history(league_game_id,user_id) where league_game_id is not null;
do $$ declare r record; a smallint; begin
 select attnum into a from pg_attribute where attrelid='public.rating_history'::regclass and attname='source_type';
 for r in select conname,pg_get_expr(conbin,conrelid) expression,conkey from pg_constraint
  where conrelid='public.rating_history'::regclass and contype='c' and a=any(conkey)
 loop
  if r.conkey<>array[a]::smallint[] then raise exception 'Revisar restricción combinada de rating_history: %',r.conname; end if;
  if position('league_v105' in r.expression)=0 then
   execute format('alter table public.rating_history drop constraint %I',r.conname);
   execute format('alter table public.rating_history add constraint %I check ((%s) or source_type = ''league_v105'')',r.conname,r.expression);
  end if;
 end loop;
end $$;

create or replace function public.league_owner_v105(p_league bigint) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.leagues_v105 where id=p_league and owner_id=auth.uid());
$$;

-- Reuse the application's existing access and competitive sanctions.
create or replace function public.league_eligible_v105(p_user uuid) returns void
language plpgsql security definer set search_path='' as $$ declare blocked boolean; sanction jsonb;begin
 if to_regprocedure('public.tt_v76_user_is_hidden(uuid)') is not null then
  execute 'select public.tt_v76_user_is_hidden($1)' into blocked using p_user;
  if blocked then raise exception 'Esta cuenta no está habilitada para competir';end if;
 end if;
 if to_regprocedure('public.tt_v63_assert_user_can_challenge(uuid,text)') is not null then
  perform public.tt_v63_assert_user_can_challenge(p_user,'ranked');
 end if;
 if to_regprocedure('public.tt_v78_active_sanction(uuid)') is not null then
  execute 'select to_jsonb(s) from public.tt_v78_active_sanction($1) s' into sanction using p_user;
  if coalesce((sanction->>'competitive_locked')::boolean,false) then raise exception 'Esta cuenta tiene una restricción competitiva activa';end if;
 end if;
end $$;

-- Statistics are derived from immutable resolved games, not client-supplied totals.
create or replace function public.league_stats_v105(p_date bigint)
returns table(entry_id bigint,user_id uuid,group_no int,withdrawn boolean,tie_order uuid,played bigint,wins bigint,losses bigint,walkovers bigint,group_wins bigint,sets_for bigint,sets_against bigint,points_for bigint,points_against bigint,score bigint)
language sql stable security definer set search_path='' as $$
 select e.id,e.user_id,e.group_no,e.withdrawn,e.tie_order,
 count(g.id) filter(where g.status='played'),
 count(g.id) filter(where g.status='played' and g.winner=e.id),
 count(g.id) filter(where g.status='played' and g.winner<>e.id),
 count(g.id) filter(where g.status='walkover' and g.winner=e.id),
 count(g.id) filter(where g.group_no is not null and g.status in ('played','walkover') and g.winner=e.id),
 coalesce(sum(case when g.status='played' then case when g.player1=e.id then g.sets1 else g.sets2 end else 0 end),0),
 coalesce(sum(case when g.status='played' then case when g.player1=e.id then g.sets2 else g.sets1 end else 0 end),0),
 coalesce(sum(case when g.status='played' then case when g.player1=e.id then g.points1 else g.points2 end else 0 end),0),
 coalesce(sum(case when g.status='played' then case when g.player1=e.id then g.points2 else g.points1 end else 0 end),0),
 coalesce(sum(case when g.winner=e.id and g.status in ('played','walkover') then
 case when g.group_no is not null then 1 when g.round_size=2 then 5 when g.round_size=4 then 3 else 2 end else 0 end),0)
 from public.league_entries_v105 e left join public.league_games_v105 g on g.date_id=e.date_id and e.id in(g.player1,g.player2)
 where e.date_id=p_date group by e.id;
$$;

create or replace function public.search_league_players_v105(p_query text) returns jsonb
language plpgsql stable security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception using errcode='42501',message='Iniciá sesión';end if;
 if length(trim(p_query))<2 or length(p_query)>80 then return '[]';end if;
 return coalesce((select jsonb_agg(to_jsonb(x)) from(
  select p.id,p.username,p.first_name,p.last_name from public.visible_profiles_v76 p
  where position(lower(trim(p_query)) in lower(coalesce(p.username,'')||' '||coalesce(p.first_name,'')||' '||coalesce(p.last_name,'')))>0
  order by p.username limit 20
 )x),'[]');
end $$;

create or replace function public.get_leagues_v105() returns jsonb
language plpgsql stable security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception using errcode='42501',message='Iniciá sesión'; end if;
 return coalesce((select jsonb_agg(to_jsonb(x)) from(
  select l.*,l.owner_id=auth.uid() is_owner,
  (select count(*) from public.league_dates_v105 d where d.league_id=l.id and d.status='completed') finished_dates,
  exists(select 1 from public.league_followers_v105 f where f.league_id=l.id and f.user_id=auth.uid()) following
  from public.leagues_v105 l order by (l.owner_id=auth.uid()) desc,l.created_at desc limit 100
 ) x),'[]');
end $$;

create or replace function public.get_league_v105(p_league bigint) returns jsonb
language plpgsql stable security definer set search_path='' as $$ declare result jsonb; begin
 if auth.uid() is null then raise exception using errcode='42501',message='Iniciá sesión'; end if;
 select jsonb_build_object('league',to_jsonb(l),'is_owner',l.owner_id=auth.uid(),
 'reminders',(select reminders from public.league_followers_v105 where league_id=l.id and user_id=auth.uid()),
 'dates',(select coalesce(jsonb_agg(to_jsonb(d)||jsonb_build_object('entries',(select count(*) from public.league_entries_v105 where date_id=d.id)) order by d.date_no),'[]') from public.league_dates_v105 d where d.league_id=l.id),
 'standings',(with stats as(
 select s.*,d.champion_id,d.status date_status from public.league_dates_v105 d cross join lateral public.league_stats_v105(d.id) s where d.league_id=l.id and d.status<>'cancelled'
 ), totals as(
 select s.user_id,case when s.user_id is null then s.entry_id else 0 end deleted_entry,
 count(*) filter(where s.date_status not in ('registration')) dates,
 count(*) filter(where s.champion_id=s.entry_id and s.date_status='completed') titles,
 sum(s.played) played,sum(s.wins) wins,sum(s.losses) losses,sum(s.walkovers) walkovers,
 sum(s.sets_for) sets_for,sum(s.sets_against) sets_against,sum(s.points_for) points_for,sum(s.points_against) points_against,sum(s.score) score
 from stats s group by s.user_id,case when s.user_id is null then s.entry_id else 0 end
 ), ranked as(
 select t.*,dense_rank() over(order by score desc,titles desc,wins desc,(sets_for-sets_against) desc,(points_for-points_against) desc) position,
 coalesce(nullif(trim(p.first_name||' '||p.last_name),''),p.username,'Cuenta eliminada') name,p.username,p.profile_photo_url
 from totals t left join public.profiles p on p.id=t.user_id
 ) select coalesce(jsonb_agg(to_jsonb(r) order by r.position,r.name),'[]') from ranked r),
 'audit',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from(select action,details,created_at,date_id from public.league_audit_v105 where league_id=l.id order by id desc limit 40) a))
 into result from public.leagues_v105 l where l.id=p_league;
 if result is null then raise exception 'Liga no encontrada'; end if; return result;
end $$;

create or replace function public.get_league_date_v105(p_date bigint) returns jsonb
language plpgsql stable security definer set search_path='' as $$ declare result jsonb; begin
 if auth.uid() is null then raise exception using errcode='42501',message='Iniciá sesión'; end if;
 select jsonb_build_object('date',to_jsonb(d),'league',to_jsonb(l),'is_owner',l.owner_id=auth.uid(),
 'entries',(select coalesce(jsonb_agg(to_jsonb(x) order by x.group_no nulls last,x.group_position),'[]') from(
 select s.*,row_number() over(partition by s.group_no order by s.group_wins desc,(s.sets_for-s.sets_against) desc,(s.points_for-s.points_against) desc,s.tie_order) group_position,
 coalesce(nullif(trim(p.first_name||' '||p.last_name),''),p.username,'Cuenta eliminada') name,p.username,p.profile_photo_url
 from public.league_stats_v105(d.id) s left join public.profiles p on p.id=s.user_id) x),
 'games',(select coalesce(jsonb_agg(to_jsonb(g) order by g.group_no nulls last,g.round_size desc,g.slot,g.id),'[]') from public.league_games_v105 g where g.date_id=d.id))
 into result from public.league_dates_v105 d join public.leagues_v105 l on l.id=d.league_id where d.id=p_date;
 if result is null then raise exception 'Fecha no encontrada'; end if; return result;
end $$;

-- Internal state transition. Caller holds the parent league and date locks.
create or replace function public.league_progress_v105(p_date bigint) returns void
language plpgsql security definer set search_path='' as $$
declare d public.league_dates_v105%rowtype; n int; next_n int; arr bigint[]; i int; w bigint; begin
 select * into d from public.league_dates_v105 where id=p_date;
 if d.status='groups' and not exists(select 1 from public.league_games_v105 where date_id=p_date and status='pending') then
  update public.league_dates_v105 set status='groups_done' where id=p_date; return;
 end if;
 if d.status<>'knockout' then return; end if;
 loop
  select min(round_size) into n from public.league_games_v105 where date_id=p_date and round_size is not null;
  -- A withdrawn winner can reach a later round after the other match finishes.
  update public.league_games_v105 g set status=case when
   exists(select 1 from public.league_entries_v105 e where e.id in(g.player1,g.player2) and not e.withdrawn and e.user_id is not null) then 'walkover' else 'void' end,
   winner=(select e.id from public.league_entries_v105 e where e.id in(g.player1,g.player2) and not e.withdrawn and e.user_id is not null limit 1),resolved_at=now()
   where g.date_id=p_date and g.round_size=n and g.status='pending' and
   exists(select 1 from public.league_entries_v105 e where e.id in(g.player1,g.player2) and (e.withdrawn or e.user_id is null));
  if exists(select 1 from public.league_games_v105 where date_id=p_date and round_size=n and status='pending') then return; end if;
  if n=2 then
   select winner into w from public.league_games_v105 where date_id=p_date and round_size=2;
   update public.league_dates_v105 set status='completed',champion_id=w where id=p_date; return;
  end if;
  select array_agg(winner order by slot) into arr from public.league_games_v105 where date_id=p_date and round_size=n;
  next_n:=n/2;
  for i in 1..next_n/2 loop
   insert into public.league_games_v105(date_id,round_size,slot,player1,player2,status,winner,resolved_at)
   values(p_date,next_n,i,arr[i*2-1],arr[i*2],
   case when arr[i*2-1] is null and arr[i*2] is null then 'void' when arr[i*2-1] is null or arr[i*2] is null then 'bye' else 'pending' end,
   case when arr[i*2-1] is null or arr[i*2] is null then coalesce(arr[i*2-1],arr[i*2]) end,
   case when arr[i*2-1] is null or arr[i*2] is null then now() end);
  end loop;
 end loop;
end $$;

-- RP follows the existing individual tournament formula, with ordered locks.
-- Only real, validated scores reach this function; walkovers/byes never do.
create or replace function public.league_apply_rp_v105(p_game bigint,p_best int) returns void
language plpgsql security definer set search_path='' as $$
declare g public.league_games_v105%rowtype; a uuid; b uuid; r1 int; r2 int; delta int; k int; begin
 select * into g from public.league_games_v105 where id=p_game;
 if g.status<>'played' then raise exception 'Solo partidos jugados aportan RP'; end if;
 if exists(select 1 from public.rating_history where league_game_id=p_game) then raise exception 'RP ya registrado'; end if;
 select user_id into a from public.league_entries_v105 where id=g.player1;
 select user_id into b from public.league_entries_v105 where id=g.player2;
 if a is null or b is null or a=b then raise exception 'Participantes no válidos para RP'; end if;
 perform public.league_eligible_v105(a);perform public.league_eligible_v105(b);
 perform 1 from public.ratings where user_id in(a,b) and modality='individual' order by user_id for update;
 select rating into r1 from public.ratings where user_id=a and modality='individual';
 select rating into r2 from public.ratings where user_id=b and modality='individual';
 if r1 is null or r2 is null then raise exception 'Falta el ranking de un participante'; end if;
 k:=case when p_best=5 then 80 else 52 end;
 delta:=round(k*((case when g.winner=g.player1 then 1 else 0 end)-1.0/(1.0+power(10.0,(r2::numeric-r1)/400.0))));
 if delta=0 then delta:=case when g.winner=g.player1 then 1 else -1 end; end if;
 update public.ratings set rating=rating+case when user_id=a then delta else -delta end,
 matches_played=matches_played+1,wins=wins+case when (user_id=a and g.winner=g.player1) or (user_id=b and g.winner=g.player2) then 1 else 0 end,
 losses=losses+case when (user_id=a and g.winner=g.player2) or (user_id=b and g.winner=g.player1) then 1 else 0 end,updated_at=now()
 where user_id in(a,b) and modality='individual';
 insert into public.rating_history(user_id,modality,previous_rating,rating_change,new_rating,source_type,league_game_id)
 values(a,'individual',r1,delta,r1+delta,'league_v105',p_game),(b,'individual',r2,-delta,r2-delta,'league_v105',p_game);
 update public.league_games_v105 set rp1=delta,rp2=-delta where id=p_game;
end $$;

create or replace function public.league_command_v105(p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 uid uuid:=auth.uid(); lid bigint; did bigint; eid bigint; gid bigint; target uuid;
 l public.leagues_v105%rowtype; d public.league_dates_v105%rowtype; g public.league_games_v105%rowtype;
 n int; groups int; i int; j int; gn int; chosen int; cnt int; needed int; a int; b int; s1 int:=0; s2 int:=0; p1 int:=0; p2 int:=0;
 first_local timestamp; at_time timestamptz; tz text; mode text; freq text; reason text;
 arr bigint[]; seeds int[]; expanded int[]; positions bigint[]; tmp bigint; opp bigint; r record; item jsonb; owner boolean;
begin
 if uid is null then raise exception using errcode='42501',message='Iniciá sesión'; end if;
 if not exists(select 1 from public.profiles where id=uid) then raise exception 'Completá tu perfil'; end if;
 perform public.league_eligible_v105(uid);
 if p_action='create' then
  n:=(p_payload->>'date_count')::int; tz:=coalesce(p_payload->>'timezone','America/Montevideo');
  freq:=p_payload->>'frequency'; mode:=p_payload->>'draw_mode';
  if not exists(select 1 from pg_timezone_names where name=tz) then raise exception 'Zona horaria inválida'; end if;
  at_time:=(p_payload->>'starts_at')::timestamptz;
  if at_time is null or at_time<now()-interval '1 day' then raise exception 'Elegí una primera fecha válida'; end if;
  if (select count(*) from public.leagues_v105 where owner_id=uid and status='active')>=20 then raise exception 'Ya tenés 20 ligas activas'; end if;
  insert into public.leagues_v105(owner_id,name,description,frequency,date_count,timezone,draw_mode,best_of)
  values(uid,trim(p_payload->>'name'),coalesce(p_payload->>'description',''),freq,n,tz,mode,coalesce((p_payload->>'best_of')::int,5)) returning * into l;
  lid:=l.id; first_local:=at_time at time zone tz;
  for i in 0..n-1 loop
   at_time:=(first_local+case when freq='weekly' then make_interval(days=>7*i) else make_interval(months=>i) end) at time zone tz;
   insert into public.league_dates_v105(league_id,date_no,starts_at,venue) values(lid,i+1,at_time,coalesce(p_payload->>'venue',''));
  end loop;
  insert into public.league_followers_v105(league_id,user_id) values(lid,uid);
  insert into public.league_audit_v105(league_id,actor_id,action) values(lid,uid,'create');
  return jsonb_build_object('league_id',lid);
 end if;
 did:=nullif(p_payload->>'date_id','')::bigint;
 lid:=nullif(p_payload->>'league_id','')::bigint;
 if did is not null then select league_id into lid from public.league_dates_v105 where id=did; end if;
 -- All mutating operations acquire locks in the same order.
 select * into l from public.leagues_v105 where id=lid for update;
 if not found then raise exception 'Liga no encontrada'; end if;
 owner:=l.owner_id=uid;
 if p_action='follow' then
  insert into public.league_followers_v105(league_id,user_id,reminders) values(lid,uid,coalesce((p_payload->>'enabled')::boolean,true))
  on conflict(league_id,user_id) do update set reminders=excluded.reminders;
  return jsonb_build_object('league_id',lid);
 end if;
 if p_action not in ('join','leave') and owner is distinct from true then raise exception using errcode='42501',message='Solo el anfitrión puede realizar esta acción'; end if;
 if l.status<>'active' then raise exception 'La liga está cerrada'; end if;
 if p_action='finish_league' then
  if exists(select 1 from public.league_dates_v105 where league_id=lid and status not in ('completed','cancelled')) then raise exception 'Todavía hay fechas pendientes'; end if;
  update public.leagues_v105 set status='completed' where id=lid;
 else
  select * into d from public.league_dates_v105 where id=did and league_id=lid for update;
  if not found then raise exception 'Fecha no encontrada'; end if;
  if p_action='reschedule' then
   if d.status not in ('registration','groups') then raise exception 'Esta fecha ya no admite reprogramación'; end if;
   at_time:=(p_payload->>'starts_at')::timestamptz;
   if at_time is null or at_time<=now() then raise exception 'Elegí un horario futuro'; end if;
   update public.league_dates_v105 set starts_at=at_time,venue=coalesce(p_payload->>'venue',venue),revision=revision+1 where id=did;
  elsif p_action in ('add','join') then
   target:=case when p_action='join' then uid else (p_payload->>'user_id')::uuid end;
   if d.status not in ('registration','groups') then raise exception 'La fase de grupos ya terminó: no se admiten altas'; end if;
   if d.status='groups' and not exists(select 1 from public.league_games_v105 where date_id=did and status='pending') then raise exception 'Todos los grupos terminaron'; end if;
   if not exists(select 1 from public.profiles where id=target and profile_completed) then raise exception 'El participante debe tener un perfil completo'; end if;
   perform public.league_eligible_v105(target);
   if exists(select 1 from public.league_entries_v105 where date_id=did and user_id=target) then raise exception 'El jugador ya está inscrito'; end if;
   if (select count(*) from public.league_entries_v105 where date_id=did)>=128 then raise exception 'Límite de 128 inscritos por fecha'; end if;
   if d.status='groups' then
    select x.group_no into chosen from(select group_no,count(*) size from public.league_entries_v105 where date_id=did group by group_no) x order by x.size,random() limit 1;
   end if;
   insert into public.league_entries_v105(date_id,user_id,group_no,seed_rating)
   values(did,target,chosen,coalesce((select rating from public.ratings where user_id=target and modality='individual'),1000)) returning id into eid;
   insert into public.league_followers_v105(league_id,user_id) values(lid,target) on conflict do nothing;
   if d.status='groups' then
    for r in select id,withdrawn,user_id from public.league_entries_v105 where date_id=did and group_no=chosen and id<>eid loop
     insert into public.league_games_v105(date_id,group_no,slot,player1,player2,status,winner,resolved_at)
     values(did,chosen,0,r.id,eid,case when r.withdrawn or r.user_id is null then 'walkover' else 'pending' end,
     case when r.withdrawn or r.user_id is null then eid end,case when r.withdrawn or r.user_id is null then now() end);
    end loop;
    perform public.league_progress_v105(did);
   end if;
  elsif p_action in ('remove','leave') then
   if d.status<>'registration' then raise exception 'Con el sorteo realizado, usá Retirar de esta fecha'; end if;
   target:=case when p_action='leave' then uid else (p_payload->>'user_id')::uuid end;
   delete from public.league_entries_v105 where date_id=did and user_id=target;
  elsif p_action='draw' then
   if d.status<>'registration' or d.drawn_at is not null then raise exception 'El sorteo ya fue realizado'; end if;
   delete from public.league_entries_v105 where date_id=did and user_id is null;
   select count(*) into n from public.league_entries_v105 where date_id=did and user_id is not null;
   if n<3 then raise exception 'Se necesitan al menos 3 participantes para grupos y eliminatorias'; end if;
   groups:=(n+3)/4;
   update public.league_entries_v105 e set seed_rating=rtg.rating from public.ratings rtg
   where e.date_id=did and rtg.user_id=e.user_id and rtg.modality='individual';
   i:=0;
   for r in select e.id from public.league_entries_v105 e where date_id=did
    order by case when l.draw_mode='balanced' then e.seed_rating end desc,e.tie_order loop
    gn:=case when l.draw_mode='balanced' and (i/groups)%2=1 then groups-(i%groups) else (i%groups)+1 end;
    update public.league_entries_v105 set group_no=gn where id=r.id; i:=i+1;
   end loop;
   insert into public.league_games_v105(date_id,group_no,slot,player1,player2)
   select did,a.group_no,0,a.id,b.id from public.league_entries_v105 a join public.league_entries_v105 b on b.date_id=a.date_id and b.group_no=a.group_no and b.id>a.id where a.date_id=did;
   update public.league_dates_v105 set status='groups',drawn_at=now() where id=did;
  elsif p_action='knockout' then
   if d.status<>'groups_done' then raise exception 'Primero deben terminar todos los grupos'; end if;
   select array_agg(entry_id order by pos,group_no) into arr from(
    select s.*,row_number() over(partition by group_no order by group_wins desc,(sets_for-sets_against) desc,(points_for-points_against) desc,tie_order) pos
    from public.league_stats_v105(did) s where not withdrawn and user_id is not null
   ) x where pos<=2;
   cnt:=coalesce(array_length(arr,1),0);
   if cnt<=1 then update public.league_dates_v105 set status='completed',champion_id=arr[1] where id=did;
   else
    n:=2;seeds:=array[1,2];
    while n<cnt loop n:=n*2;expanded:='{}';foreach i in array seeds loop expanded:=expanded||array[i,n+1-i];end loop;seeds:=expanded;end loop;
    positions:='{}';foreach i in array seeds loop positions:=array_append(positions,arr[i]);end loop;
    -- Avoid a group rematch in the opening knockout round when a swap permits it.
    for i in 1..n/2 loop
     if positions[i*2-1] is not null and positions[i*2] is not null and
      (select group_no from public.league_entries_v105 where id=positions[i*2-1])=(select group_no from public.league_entries_v105 where id=positions[i*2]) then
      for j in 1..n/2 loop
       if i<>j and positions[j*2] is not null and
        (select group_no from public.league_entries_v105 where id=positions[i*2-1])<>(select group_no from public.league_entries_v105 where id=positions[j*2]) and
        (positions[j*2-1] is null or (select group_no from public.league_entries_v105 where id=positions[j*2-1])<>(select group_no from public.league_entries_v105 where id=positions[i*2])) then
        tmp:=positions[i*2];positions[i*2]:=positions[j*2];positions[j*2]:=tmp;exit;
       end if;
      end loop;
     end if;
    end loop;
    for i in 1..n/2 loop
     insert into public.league_games_v105(date_id,round_size,slot,player1,player2,status,winner,resolved_at)
     values(did,n,i,positions[i*2-1],positions[i*2],case when positions[i*2-1] is null or positions[i*2] is null then 'bye' else 'pending' end,
      case when positions[i*2-1] is null or positions[i*2] is null then coalesce(positions[i*2-1],positions[i*2]) end,
      case when positions[i*2-1] is null or positions[i*2] is null then now() end);
    end loop;
    update public.league_dates_v105 set status='knockout' where id=did;perform public.league_progress_v105(did);
   end if;
  elsif p_action in ('score','walkover','void') then
   if d.status not in ('groups','knockout') then raise exception 'Esta fecha no admite resultados'; end if;
   gid:=(p_payload->>'game_id')::bigint;
   select * into g from public.league_games_v105 where id=gid and date_id=did for update;
   if not found or g.status<>'pending' then raise exception 'Partido inexistente o ya resuelto'; end if;
   if p_action='score' then
    if exists(select 1 from public.league_entries_v105 where id in(g.player1,g.player2) and (withdrawn or user_id is null)) then raise exception 'Un participante se retiró. Resolvé la incomparecencia'; end if;
    if g.player1 is null or g.player2 is null then raise exception 'Falta un participante'; end if;
    if jsonb_typeof(p_payload->'sets') is distinct from 'array' then raise exception 'Ingresá los sets'; end if;
    cnt:=jsonb_array_length(p_payload->'sets');needed:=l.best_of/2+1;
    if cnt<needed or cnt>l.best_of then raise exception 'Cantidad de sets inválida'; end if;
    for item in select * from jsonb_array_elements(p_payload->'sets') loop
     if jsonb_typeof(item) is distinct from 'array' or jsonb_array_length(item)<>2 then raise exception 'Set inválido';end if;
     if (item->>0) !~ '^\d+$' or (item->>1) !~ '^\d+$' or item->>0 is null or item->>1 is null then raise exception 'Usá puntos enteros';end if;
     a:=(item->>0)::int;b:=(item->>1)::int;
     if a>999 or b>999 or greatest(a,b)<11 or not ((greatest(a,b)=11 and least(a,b)<=9) or (greatest(a,b)>11 and abs(a-b)=2)) then raise exception 'Set inválido: 11 puntos y diferencia de 2'; end if;
     if s1=needed or s2=needed then raise exception 'El partido ya había terminado';end if;
     s1:=s1+case when a>b then 1 else 0 end;s2:=s2+case when b>a then 1 else 0 end;p1:=p1+a;p2:=p2+b;
    end loop;
    if greatest(s1,s2)<>needed then raise exception 'Falta definir el ganador';end if;
    update public.league_games_v105 set status='played',winner=case when s1>s2 then player1 else player2 end,
     sets=p_payload->'sets',sets1=s1,sets2=s2,points1=p1,points2=p2,resolved_at=now() where id=gid;
    perform public.league_apply_rp_v105(gid,l.best_of);
   else
    reason:=trim(coalesce(p_payload->>'reason',''));
    if length(reason)<3 or length(reason)>300 then raise exception 'Indicá el motivo (3 a 300 caracteres)';end if;
    eid:=(p_payload->>'absent_id')::bigint;
    if p_action='walkover' and (eid is null or eid not in(g.player1,g.player2) or g.player1 is null or g.player2 is null) then raise exception 'Seleccioná quién no participa';end if;
    update public.league_games_v105 set status=case when p_action='void' then 'void' else 'walkover' end,
     winner=case when p_action='walkover' then case when g.player1=eid then g.player2 else g.player1 end end,resolved_at=now() where id=gid;
   end if;
   perform public.league_progress_v105(did);
  elsif p_action='withdraw' then
   if d.status not in ('groups','groups_done','knockout') then raise exception 'No se puede retirar en este estado';end if;
   eid:=(p_payload->>'entry_id')::bigint;reason:=trim(coalesce(p_payload->>'reason',''));
   if length(reason)<3 or length(reason)>300 then raise exception 'Indicá el motivo del retiro';end if;
   update public.league_entries_v105 set withdrawn=true where id=eid and date_id=did;
   if not found then raise exception 'Participante no encontrado';end if;
   update public.league_games_v105 game set
    status=case when exists(select 1 from public.league_entries_v105 o where o.id=case when game.player1=eid then game.player2 else game.player1 end and not o.withdrawn and o.user_id is not null) then 'walkover' else 'void' end,
    winner=case when exists(select 1 from public.league_entries_v105 o where o.id=case when game.player1=eid then game.player2 else game.player1 end and not o.withdrawn and o.user_id is not null) then case when game.player1=eid then game.player2 else game.player1 end end,
    resolved_at=now() where date_id=did and status='pending' and eid in(game.player1,game.player2);
   perform public.league_progress_v105(did);
  elsif p_action='cancel_date' then
   if exists(select 1 from public.league_games_v105 where date_id=did and status<>'pending') then raise exception 'No se puede cancelar una fecha con resultados';end if;
   update public.league_dates_v105 set status='cancelled',revision=revision+1 where id=did;
  else raise exception 'Acción no admitida';end if;
 end if;
 insert into public.league_audit_v105(league_id,date_id,actor_id,action,details)
 values(lid,did,uid,p_action,jsonb_strip_nulls(jsonb_build_object('entry_id',coalesce(eid,(p_payload->>'entry_id')::bigint),'group_no',chosen,'game_id',gid,'reason',reason,'user_id',target)));
 return jsonb_build_object('league_id',lid,'date_id',did,'entry_id',eid);
end $$;

-- Tables are private to audited RPCs. No client can write points, RP or draws.
do $$ declare t text; f record; begin
 foreach t in array array['leagues_v105','league_dates_v105','league_entries_v105','league_games_v105','league_followers_v105','league_audit_v105','league_reminders_v105'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public,anon,authenticated',t);
 end loop;
 for f in select oid::regprocedure sig from pg_proc where pronamespace='public'::regnamespace and proname in
 ('league_owner_v105','league_eligible_v105','league_stats_v105','league_progress_v105','league_apply_rp_v105','league_command_v105','get_leagues_v105','get_league_v105','get_league_date_v105','search_league_players_v105') loop
  execute format('revoke all on function %s from public,anon,authenticated',f.sig);
 end loop;
end $$;
grant execute on function public.league_command_v105(text,jsonb),public.get_leagues_v105(),public.get_league_v105(bigint),public.get_league_date_v105(bigint),public.search_league_players_v105(text) to authenticated;
notify pgrst,'reload schema';
commit;
select jsonb_build_object('resultado','Ligas 1.0.5 instaladas','version','1.0.5','rp_global',true,'recordatorios','Ejecutar también SQL_LIGAS_RECORDATORIOS_1_0_5.sql') as resultado;
