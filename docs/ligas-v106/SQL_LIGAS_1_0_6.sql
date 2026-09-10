-- TT Rivals 1.0.6: resultados propuestos, aprobación del anfitrión, formatos y acceso privado.
-- Ejecutar completo después de Ligas 1.0.5. No vuelve a aplicar RP de resultados existentes.
begin;
set local lock_timeout='5s';
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
do $$begin
 if to_regprocedure('public.league_command_v105(text,jsonb)') is null then raise exception 'Primero instalá Ligas 1.0.5';end if;
end$$;
alter table public.leagues_v105 drop constraint if exists leagues_v105_best_of_check;
alter table public.leagues_v105 add constraint leagues_v105_best_of_check check(best_of in(1,3,5));
create table if not exists public.league_settings_v106(
 league_id bigint primary key references public.leagues_v105 on delete cascade,
 visibility text not null default 'public' check(visibility in('public','private')),
 password_hash text,
 formats jsonb not null default '{}',
 check(visibility='public' or password_hash is not null)
);
create table if not exists public.league_members_v106(
 league_id bigint references public.leagues_v105 on delete cascade,
 user_id uuid references auth.users on delete cascade,
 status text not null check(status in('pending','approved','rejected')),
 requested_at timestamptz not null default now(),decided_at timestamptz,
 primary key(league_id,user_id)
);
create table if not exists public.league_join_attempts_v106(
 user_id uuid references auth.users on delete cascade,
 league_id bigint references public.leagues_v105 on delete cascade,
 attempts int not null default 0,started_at timestamptz not null default now(),
 primary key(user_id,league_id)
);
create table if not exists public.league_results_v106(
 id bigint generated always as identity primary key,
 game_id bigint not null references public.league_games_v105 on delete cascade,
 submitted_by uuid references auth.users on delete set null,
 sets jsonb not null,sets1 int not null,sets2 int not null,
 status text not null default 'pending' check(status in('pending','approved','rejected','obsolete')),
 reason text,created_at timestamptz not null default now(),decided_at timestamptz,
 decided_by uuid references auth.users on delete set null
);
create unique index if not exists league_pending_result_v106 on public.league_results_v106(game_id) where status='pending';
insert into public.league_settings_v106(league_id)select id from public.leagues_v105 on conflict do nothing;
insert into public.league_members_v106(league_id,user_id,status)
 select distinct d.league_id,e.user_id,'approved' from public.league_entries_v105 e join public.league_dates_v105 d on d.id=e.date_id where e.user_id is not null on conflict do nothing;

create or replace function public.league_password_v106(p_plain text,p_hash text default null) returns text
language plpgsql security definer set search_path='' as $$declare ns text;answer text;begin
 select n.nspname into ns from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='pgcrypto';
 if ns is null then raise exception 'Falta pgcrypto';end if;
 if p_hash is null then execute format('select %I.crypt($1,%I.gen_salt(''bf'',10))',ns,ns) into answer using p_plain;
 else execute format('select %I.crypt($1,$2)',ns) into answer using p_plain,p_hash;end if;
 return answer;
end$$;
create or replace function public.league_access_v106(p_league bigint) returns boolean
language sql stable security definer set search_path='' as $$select auth.uid() is not null and exists(
 select 1 from public.leagues_v105 l left join public.league_settings_v106 s on s.league_id=l.id
 where l.id=p_league and (l.owner_id=auth.uid() or coalesce(s.visibility,'public')='public' or exists(
 select 1 from public.league_members_v106 m where m.league_id=l.id and m.user_id=auth.uid() and m.status='approved')));$$;
create or replace function public.league_best_of_v106(p_league bigint,p_group int,p_round int) returns int
language sql stable security definer set search_path='' as $$select coalesce((s.formats->>case when p_group is not null then 'groups' else p_round::text end)::int,l.best_of)
 from public.leagues_v105 l left join public.league_settings_v106 s on s.league_id=l.id where l.id=p_league;$$;

-- Preserve the tested 1.0.5 engine privately; no client may invoke it directly.
do $$declare def text;pair text[];begin
 foreach pair slice 1 in array array[
 ['league_command_v105(text,jsonb)','league_core_v106'],
 ['get_league_v105(bigint)','league_read_core_v106'],
 ['get_league_date_v105(bigint)','league_date_core_v106']
 ]loop
  if not exists(select 1 from pg_proc where pronamespace='public'::regnamespace and proname=pair[2]) then
   def:=pg_get_functiondef(to_regprocedure('public.'||pair[1]));
   def:=replace(def,'public.'||split_part(pair[1],'(',1)||'(','public.'||pair[2]||'(');
   if pair[2]='league_core_v106' then
    if position('perform public.league_apply_rp_v105(gid,l.best_of)' in def)=0 then raise exception 'El motor de Ligas cambió: revisar antes de actualizar';end if;
    def:=replace(def,'if p_action=''score'' then','if p_action=''score'' then'||chr(10)||'l.best_of:=public.league_best_of_v106(lid,g.group_no,g.round_size);');
   end if;
   execute def;
  end if;
 end loop;
 -- A single set uses the same K=24 as existing individual tournaments.
 def:=pg_get_functiondef('public.league_apply_rp_v105(bigint,integer)'::regprocedure);
 def:=replace(def,'k:=case when p_best=5 then 80 else 52 end','k:=case when p_best=1 then 24 when p_best=5 then 80 else 52 end');execute def;
end$$;

create or replace function public.league_validate_sets_v106(p_sets jsonb,p_best int) returns jsonb
language plpgsql immutable set search_path='' as $$declare item jsonb;a int;b int;s1 int:=0;s2 int:=0;needed int:=p_best/2+1;begin
 if p_best not in(1,3,5) or jsonb_typeof(p_sets) is distinct from 'array' then raise exception 'Formato de sets inválido';end if;
 if jsonb_array_length(p_sets)<needed or jsonb_array_length(p_sets)>p_best then raise exception 'Cantidad de sets inválida';end if;
 for item in select * from jsonb_array_elements(p_sets)loop
  if jsonb_typeof(item) is distinct from 'array' then raise exception 'Set inválido';end if;
  if jsonb_array_length(item)<>2 or coalesce(item->>0,'') !~ '^\d+$' or coalesce(item->>1,'') !~ '^\d+$' then raise exception 'Usá puntos enteros en cada set';end if;
  a:=(item->>0)::int;b:=(item->>1)::int;
  if a>999 or b>999 or not((greatest(a,b)=11 and least(a,b)<=9) or(greatest(a,b)>11 and abs(a-b)=2)) then raise exception 'Set inválido: mínimo 11 puntos y diferencia de 2';end if;
  if s1=needed or s2=needed then raise exception 'Hay sets después de terminar el partido';end if;
  s1:=s1+case when a>b then 1 else 0 end;s2:=s2+case when b>a then 1 else 0 end;
 end loop;
 if greatest(s1,s2)<>needed then raise exception 'Falta definir el ganador';end if;
 return jsonb_build_object('sets1',s1,'sets2',s2);
end$$;

create or replace function public.league_command_v106(p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();lid bigint;did bigint;gid bigint;rid bigint;target uuid;l public.leagues_v105%rowtype;
 d public.league_dates_v105%rowtype;g public.league_games_v105%rowtype;s public.league_settings_v106%rowtype;
 proposal public.league_results_v106%rowtype;outcome jsonb;totals jsonb;fmt jsonb;kv record;member_status text;
 vis text;plain text;hash text;cnt int;notice text;v_reason text;best int;
begin
 if uid is null then raise exception using errcode='42501',message='Iniciá sesión';end if;
 perform public.league_eligible_v105(uid);
 if p_action='create' then
  vis:=coalesce(p_payload->>'visibility','public');plain:=coalesce(p_payload->>'password','');fmt:=coalesce(p_payload->'formats','{}');
  if vis not in('public','private') then raise exception 'Elegí liga pública o privada';end if;
  if vis='private' and (length(plain)<8 or octet_length(plain)>72) then raise exception 'La clave debe tener al menos 8 caracteres y como máximo 72 bytes';end if;
  if jsonb_typeof(fmt)<>'object' then raise exception 'Configuración de fases inválida';end if;
  for kv in select * from jsonb_each_text(fmt)loop
   if kv.key not in('groups','128','64','32','16','8','4','2') or kv.value not in('1','3','5') or kv.value is null then raise exception 'Cada fase admite 1, 3 o 5 sets';end if;
  end loop;
  outcome:=public.league_core_v106('create',p_payload-'password'-'formats'-'visibility');lid:=(outcome->>'league_id')::bigint;
  if vis='private' then hash:=public.league_password_v106(plain);end if;
  insert into public.league_settings_v106(league_id,visibility,password_hash,formats)values(lid,vis,hash,fmt);
  return outcome;
 end if;
 did:=(p_payload->>'date_id')::bigint;lid:=(p_payload->>'league_id')::bigint;
 if did is not null then select league_id into lid from public.league_dates_v105 where id=did;end if;
 select * into l from public.leagues_v105 where id=lid for update;
 if not found then raise exception 'Liga no encontrada';end if;
 select * into s from public.league_settings_v106 where league_id=lid;
 if p_action='request_join' then
  if not exists(select 1 from public.profiles where id=uid and profile_completed) then raise exception 'Completá tu perfil antes de solicitar ingreso';end if;
  if l.status<>'active' or l.owner_id is null then raise exception 'La liga no admite solicitudes';end if;
  if s.visibility<>'private' then raise exception 'Esta liga es pública: inscribite en una fecha';end if;
  select status into member_status from public.league_members_v106 where league_id=lid and user_id=uid;
  if member_status in('approved','pending') then return jsonb_build_object('league_id',lid,'status',member_status);end if;
  insert into public.league_join_attempts_v106(user_id,league_id) values(uid,lid) on conflict do nothing;
  update public.league_join_attempts_v106 set attempts=case when started_at<now()-interval '15 minutes' then 1 else attempts+1 end,
   started_at=case when started_at<now()-interval '15 minutes' then now() else started_at end where user_id=uid and league_id=lid returning attempts into cnt;
  if cnt>5 then return jsonb_build_object('error','Demasiados intentos. Esperá 15 minutos.');end if;
  plain:=coalesce(p_payload->>'password','');
  if octet_length(plain)>72 or public.league_password_v106(plain,s.password_hash) is distinct from s.password_hash then return jsonb_build_object('error','Clave incorrecta');end if;
  insert into public.league_members_v106(league_id,user_id,status)values(lid,uid,'pending') on conflict(league_id,user_id)do update set status='pending',requested_at=now(),decided_at=null;
  select coalesce(nullif(trim(first_name||' '||last_name),''),username,'Jugador') into notice from public.profiles where id=uid;
  insert into public.notifications_v58(user_id,type,title,body,entity_kind,entity_id,action)values(l.owner_id,'league_join_confirm','Solicitud de ingreso · '||l.name,'Jugador: '||notice||' · Aceptar o rechazar solicitud.','league',lid::text,'leagues');
  return jsonb_build_object('league_id',lid,'status','pending');
 end if;
 if p_action in('accept_member','reject_member') then
  if l.owner_id is distinct from uid then raise exception using errcode='42501',message='Solo el anfitrión puede decidir ingresos';end if;
  target:=(p_payload->>'user_id')::uuid;
  update public.league_members_v106 set status=case when p_action='accept_member' then 'approved' else 'rejected' end,decided_at=now() where league_id=lid and user_id=target and status='pending';
  if not found then raise exception 'La solicitud ya fue resuelta';end if;
  if p_action='accept_member' then
   perform public.league_eligible_v105(target);
   insert into public.league_followers_v105(league_id,user_id)values(lid,target)on conflict do nothing;
  end if;
  insert into public.notifications_v58(user_id,type,title,body,entity_kind,entity_id,action)values(target,'league_membership',l.name,case when p_action='accept_member' then 'Ingreso aceptado. Ya podés inscribirte en sus fechas.' else 'El anfitrión rechazó tu solicitud de ingreso.' end,'league',lid::text,'leagues');
 else
  if not public.league_access_v106(lid) then raise exception using errcode='42501',message='Necesitás la clave y la aprobación del anfitrión';end if;
  if p_action='add' and s.visibility='private' then
   target:=(p_payload->>'user_id')::uuid;
   if target is distinct from l.owner_id and not exists(select 1 from public.league_members_v106 where league_id=lid and user_id=target and status='approved') then raise exception 'El jugador debe solicitar ingreso y ser aceptado primero';end if;
  end if;
  if p_action in('submit_result','approve_result','reject_result') then
   if l.status<>'active' then raise exception 'La liga está cerrada';end if;
   select * into d from public.league_dates_v105 where id=did and league_id=lid for update;
   if not found or d.status not in('groups','knockout') then raise exception 'La fecha no admite resultados';end if;
   if p_action='submit_result' then gid:=(p_payload->>'game_id')::bigint;
   else rid:=(p_payload->>'result_id')::bigint;select game_id into gid from public.league_results_v106 where id=rid;end if;
   select * into g from public.league_games_v105 where id=gid and date_id=did for update;
   if not found or g.status<>'pending' then raise exception 'Partido inexistente o ya resuelto';end if;
   if p_action='submit_result' then
    if not exists(select 1 from public.league_entries_v105 where id in(g.player1,g.player2) and user_id=uid and not withdrawn) then raise exception using errcode='42501',message='Solo los jugadores del partido pueden cargar su resultado';end if;
    if exists(select 1 from public.league_entries_v105 where id in(g.player1,g.player2) and (withdrawn or user_id is null)) then raise exception 'Hay un participante retirado';end if;
    best:=public.league_best_of_v106(lid,g.group_no,g.round_size);totals:=public.league_validate_sets_v106(p_payload->'sets',best);
    if exists(select 1 from public.league_results_v106 where game_id=gid and status='pending') then raise exception 'Ya hay un resultado pendiente de confirmación';end if;
    if l.owner_id is null then raise exception 'Esta liga no tiene anfitrión disponible';end if;
    insert into public.league_results_v106(game_id,submitted_by,sets,sets1,sets2)values(gid,uid,p_payload->'sets',(totals->>'sets1')::int,(totals->>'sets2')::int) returning id into rid;
    select coalesce(p.first_name,p.username,'Jugador')||' '||(totals->>'sets1')||' vs '||(totals->>'sets2')||' '||coalesce(q.first_name,q.username,'Jugador') into notice
    from public.league_entries_v105 a join public.profiles p on p.id=a.user_id cross join public.league_entries_v105 b join public.profiles q on q.id=b.user_id where a.id=g.player1 and b.id=g.player2;
    insert into public.notifications_v58(user_id,type,title,body,entity_kind,entity_id,action)values(l.owner_id,'league_result_confirm',l.name||' · Confirmar resultado',
     case when g.group_no is not null then 'Fase de grupos' when g.round_size=2 then 'Final' when g.round_size=4 then 'Semifinal' else 'Ronda de '||g.round_size end||' · '||notice,'league',lid::text,'leagues');
   else
    if l.owner_id is distinct from uid then raise exception using errcode='42501',message='Solo el anfitrión confirma o rechaza resultados';end if;
    select * into proposal from public.league_results_v106 where id=rid and game_id=gid for update;
    if not found or proposal.status<>'pending' then raise exception 'La propuesta ya fue resuelta';end if;
    v_reason:=trim(coalesce(p_payload->>'reason',''));
    if p_action='reject_result' and length(v_reason) not between 3 and 300 then raise exception 'Indicá el motivo del rechazo';end if;
    if p_action='approve_result' then
     perform public.league_core_v106('score',jsonb_build_object('date_id',did,'game_id',gid,'sets',proposal.sets));
     if exists(select 1 from public.league_dates_v105 where id=did and status='groups_done') then perform public.league_core_v106('knockout',jsonb_build_object('date_id',did));end if;
    end if;
    update public.league_results_v106 set status=case when p_action='approve_result' then 'approved' else 'rejected' end,reason=v_reason,decided_by=uid,decided_at=now() where id=rid;
    insert into public.notifications_v58(user_id,type,title,body,entity_kind,entity_id,action)
     select e.user_id,'league_result_reviewed',l.name,case when p_action='approve_result' then 'Resultado confirmado: puntos, RP y cuadro actualizados.' else 'Resultado rechazado: '||v_reason||'. Podés volver a cargarlo.' end,'league',lid::text,'leagues'
     from public.league_entries_v105 e where e.id in(g.player1,g.player2) and e.user_id is not null;
   end if;
  elsif p_action='score' then raise exception 'Los jugadores deben enviar el resultado y el anfitrión confirmarlo';
  else
   outcome:=public.league_core_v106(p_action,p_payload);
   -- Forfeits/withdrawals make an unconfirmed proposal obsolete, never approved.
   update public.league_results_v106 r set status='obsolete',decided_at=now() from public.league_games_v105 game
   where r.game_id=game.id and game.date_id=did and game.status<>'pending' and r.status='pending';
   return outcome;
  end if;
 end if;
 insert into public.league_audit_v105(league_id,date_id,actor_id,action,details)values(lid,did,uid,p_action,jsonb_strip_nulls(jsonb_build_object('result_id',rid,'game_id',gid,'user_id',target,'reason',v_reason)));
 return jsonb_build_object('league_id',lid,'date_id',did);
end$$;

-- Old clients also obey the new approval and private-access rules.
create or replace function public.league_command_v105(p_action text,p_payload jsonb default '{}')returns jsonb
language sql security definer set search_path='' as $$select public.league_command_v106(p_action,p_payload);$$;

create or replace function public.get_leagues_v105() returns jsonb
language plpgsql stable security definer set search_path='' as $$begin
 if auth.uid() is null then raise exception 'Iniciá sesión';end if;
 return coalesce((select jsonb_agg(to_jsonb(x))from(select l.id,l.name,l.status,l.frequency,l.date_count,l.owner_id=auth.uid() is_owner,coalesce(s.visibility,'public') visibility,
 (select count(*)from public.league_dates_v105 where league_id=l.id and status='completed')finished_dates,
 public.league_access_v106(l.id) can_access from public.leagues_v105 l left join public.league_settings_v106 s on s.league_id=l.id order by l.created_at desc limit 100)x),'[]');
end$$;
create or replace function public.get_league_v105(p_league bigint) returns jsonb
language plpgsql stable security definer set search_path='' as $$declare data jsonb;meta jsonb;begin
 if auth.uid() is null then raise exception 'Iniciá sesión';end if;
 select jsonb_build_object('id',l.id,'name',l.name,'status',l.status,'visibility',coalesce(s.visibility,'public'),'formats',coalesce(s.formats,'{}')) into meta from public.leagues_v105 l left join public.league_settings_v106 s on s.league_id=l.id where l.id=p_league;
 if meta is null then raise exception 'Liga no encontrada';end if;
 if not public.league_access_v106(p_league) then return jsonb_build_object('league',meta,'locked',true,'membership',(select status from public.league_members_v106 where league_id=p_league and user_id=auth.uid()));end if;
 data:=public.league_read_core_v106(p_league);data:=jsonb_set(data,'{league}',(data->'league')||meta);
 if public.league_owner_v105(p_league) then
  data:=data||jsonb_build_object('join_requests',(select coalesce(jsonb_agg(jsonb_build_object('user_id',m.user_id,'name',coalesce(nullif(trim(p.first_name||' '||p.last_name),''),p.username),'requested_at',m.requested_at)),'[]') from public.league_members_v106 m join public.profiles p on p.id=m.user_id where m.league_id=p_league and m.status='pending'),
  'result_requests',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select r.id,r.sets,r.sets1,r.sets2,g.id game_id,g.group_no,g.round_size,d.id date_id,d.date_no,
  p.first_name player1_name,q.first_name player2_name from public.league_results_v106 r join public.league_games_v105 g on g.id=r.game_id join public.league_dates_v105 d on d.id=g.date_id
  join public.league_entries_v105 a on a.id=g.player1 join public.league_entries_v105 b on b.id=g.player2 left join public.profiles p on p.id=a.user_id left join public.profiles q on q.id=b.user_id
  where d.league_id=p_league and r.status='pending' and g.status='pending' order by r.created_at)x));
 end if;return data;
end$$;
create or replace function public.get_league_date_v105(p_date bigint) returns jsonb
language plpgsql stable security definer set search_path='' as $$declare data jsonb;lid bigint;begin
 select league_id into lid from public.league_dates_v105 where id=p_date;
 if not public.league_access_v106(lid) then raise exception using errcode='42501',message='No tenés acceso a esta liga';end if;
 data:=public.league_date_core_v106(p_date);
 data:=jsonb_set(data,'{league}',(data->'league')||coalesce((select jsonb_build_object('visibility',visibility,'formats',formats)from public.league_settings_v106 where league_id=lid),'{}'));
 data:=jsonb_set(data,'{games}',coalesce((select jsonb_agg(to_jsonb(g)||jsonb_build_object('best_of',public.league_best_of_v106(lid,g.group_no,g.round_size),'proposal',(select jsonb_build_object('id',r.id,'sets',r.sets,'sets1',r.sets1,'sets2',r.sets2)from public.league_results_v106 r where r.game_id=g.id and r.status='pending'))order by g.group_no nulls last,g.round_size desc,g.slot,g.id)from public.league_games_v105 g where g.date_id=p_date),'[]'));
 return data;
end$$;
do $$declare t text;f record;begin
 foreach t in array array['league_settings_v106','league_members_v106','league_join_attempts_v106','league_results_v106']loop
  execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from public,anon,authenticated',t);
 end loop;
 for f in select oid::regprocedure sig from pg_proc where pronamespace='public'::regnamespace and proname like 'league%v106'loop
  execute format('revoke all on function %s from public,anon,authenticated',f.sig);
 end loop;
end$$;
grant execute on function public.league_command_v106(text,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
select jsonb_build_object('resultado','Ligas 1.0.6 actualizadas','resultados','Jugadores cargan; anfitrión confirma','formatos','1, 3, 5 sets o por fase','privadas','Clave y aprobación de ingreso') as resultado;
