-- TT Rivals 1.0.1 — P7.4R Rivalidades reales
-- Aditivo: no modifica la fórmula Elo, resultados, desafíos ni datos históricos.
-- Reglas:
--   · solo cuentan resultados oficiales que aportan Elo;
--   · las partidas casuales no suman ni cortan rachas;
--   · individual y dobles mantienen rachas independientes;
--   · las rivalidades 1 vs 1 se forman automáticamente desde partidos verificados.

begin;

create index if not exists matches_v74_player1_competitive_idx
  on public.matches(player1_id,result_status,confirmed_at desc);
create index if not exists matches_v74_player2_competitive_idx
  on public.matches(player2_id,result_status,confirmed_at desc);
create index if not exists tournament_games_v74_status_idx
  on public.tournament_games_v8(status,created_at desc);
create index if not exists tournament_members_v74_user_idx
  on public.tournament_entry_members_v8(user_id,tournament_id,entry_id);
create index if not exists doubles_matches_v74_status_idx
  on public.doubles_matches_v62(result_status,created_at desc);

-- Flujo interno unificado para calcular rachas oficiales.
create or replace function public.tt_v74_competitive_events(p_user uuid)
returns table(
  scope text,
  event_key text,
  won boolean,
  skip_win boolean,
  reset_streak boolean,
  played_at timestamptz,
  source text
)
language sql
stable
security definer
set search_path=public,pg_temp
as $$
  select
    'individual'::text,
    'match:'||m.id::text,
    m.winner_id=p_user,
    coalesce(to_jsonb(m)->>'completion_type','')='abandonment'
      and coalesce(to_jsonb(m)->>'abandoned_by','')<>p_user::text,
    (m.winner_id<>p_user)
      or (
        coalesce(to_jsonb(m)->>'completion_type','')='abandonment'
        and coalesce(to_jsonb(m)->>'abandoned_by','')=p_user::text
      ),
    coalesce(
      nullif(to_jsonb(m)->>'confirmed_at','')::timestamptz,
      nullif(to_jsonb(m)->>'played_at','')::timestamptz,
      m.created_at
    ),
    case
      when lower(coalesce(to_jsonb(m)->>'match_type','ranked'))='tournament' then 'tournament'
      else 'ranked'
    end
  from public.matches m
  where m.result_status::text='confirmed'
    and (m.player1_id=p_user or m.player2_id=p_user)
    and lower(coalesce(to_jsonb(m)->>'match_type','ranked')) in('ranked','competitive','tournament')

  union all

  select
    case when member_count.members=1 then 'individual' else 'doubles' end,
    'tournament:'||g.id::text,
    g.winner_entry_id=mine.entry_id,
    false,
    g.winner_entry_id<>mine.entry_id,
    coalesce(
      nullif(to_jsonb(g)->>'completed_at','')::timestamptz,
      nullif(to_jsonb(g)->>'updated_at','')::timestamptz,
      g.created_at
    ),
    'tournament'
  from public.tournament_games_v8 g
  join public.tournament_entry_members_v8 mine
    on mine.tournament_id=g.tournament_id
   and mine.user_id=p_user
   and mine.entry_id in(g.entry1_id,g.entry2_id)
  join lateral(
    select count(*)::integer members
    from public.tournament_entry_members_v8 em
    where em.tournament_id=g.tournament_id
      and em.entry_id=mine.entry_id
  ) member_count on true
  where g.status::text='completed'
    and g.winner_entry_id is not null
    and g.entry1_id is not null
    and g.entry2_id is not null

  union all

  select
    'doubles',
    'doubles:'||d.id::text,
    case
      when p_user in(d.team1_player1,d.team1_player2)
        then coalesce(d.team1_sets,0)>coalesce(d.team2_sets,0)
      else coalesce(d.team2_sets,0)>coalesce(d.team1_sets,0)
    end,
    false,
    case
      when p_user in(d.team1_player1,d.team1_player2)
        then coalesce(d.team1_sets,0)<=coalesce(d.team2_sets,0)
      else coalesce(d.team2_sets,0)<=coalesce(d.team1_sets,0)
    end,
    coalesce(
      nullif(to_jsonb(d)->>'confirmed_at','')::timestamptz,
      nullif(to_jsonb(d)->>'updated_at','')::timestamptz,
      d.created_at
    ),
    'ranked_doubles'
  from public.doubles_matches_v62 d
  where d.result_status::text='confirmed'
    and lower(coalesce(to_jsonb(d)->>'match_type','ranked')) in('ranked','competitive','tournament')
    and p_user in(d.team1_player1,d.team1_player2,d.team2_player1,d.team2_player2);
$$;

revoke all on function public.tt_v74_competitive_events(uuid) from public;

-- Historial competitivo individual normalizado para Rivalidades reales.
create or replace function public.tt_v74_individual_rivalry_events(p_user uuid)
returns table(
  event_key text,
  match_id bigint,
  opponent_id uuid,
  won boolean,
  my_sets integer,
  opponent_sets integer,
  match_format text,
  source text,
  played_at timestamptz,
  elo_delta integer
)
language sql
stable
security definer
set search_path=public,pg_temp
as $$
  select
    'match:'||m.id::text,
    m.id,
    case when m.player1_id=p_user then m.player2_id else m.player1_id end,
    m.winner_id=p_user,
    case when m.player1_id=p_user then coalesce(m.player1_sets,0) else coalesce(m.player2_sets,0) end,
    case when m.player1_id=p_user then coalesce(m.player2_sets,0) else coalesce(m.player1_sets,0) end,
    coalesce(to_jsonb(m)->>'match_format','bo3'),
    case
      when lower(coalesce(to_jsonb(m)->>'match_type','ranked'))='tournament' then 'tournament'
      else 'ranked'
    end,
    coalesce(
      nullif(to_jsonb(m)->>'confirmed_at','')::timestamptz,
      nullif(to_jsonb(m)->>'played_at','')::timestamptz,
      m.created_at
    ),
    coalesce(
      nullif(to_jsonb(rh)->>'rating_change','')::integer,
      nullif(to_jsonb(rh)->>'new_rating','')::integer-nullif(to_jsonb(rh)->>'previous_rating','')::integer,
      0
    )
  from public.matches m
  left join public.rating_history rh
    on rh.match_id=m.id and rh.user_id=p_user
  where m.result_status::text='confirmed'
    and (m.player1_id=p_user or m.player2_id=p_user)
    and lower(coalesce(to_jsonb(m)->>'match_type','ranked')) in('ranked','competitive','tournament')

  union all

  select
    'tournament:'||g.id::text,
    null::bigint,
    opponent.user_id,
    g.winner_entry_id=mine.entry_id,
    case when mine.entry_id=g.entry1_id then coalesce(g.entry1_sets,0) else coalesce(g.entry2_sets,0) end,
    case when mine.entry_id=g.entry1_id then coalesce(g.entry2_sets,0) else coalesce(g.entry1_sets,0) end,
    coalesce(to_jsonb(g)->>'match_format','tournament'),
    'tournament',
    coalesce(
      nullif(to_jsonb(g)->>'completed_at','')::timestamptz,
      nullif(to_jsonb(g)->>'updated_at','')::timestamptz,
      g.created_at
    ),
    0
  from public.tournament_games_v8 g
  join public.tournament_entry_members_v8 mine
    on mine.tournament_id=g.tournament_id
   and mine.user_id=p_user
   and mine.entry_id in(g.entry1_id,g.entry2_id)
  join lateral(
    select count(*)::integer members
    from public.tournament_entry_members_v8 em
    where em.tournament_id=g.tournament_id and em.entry_id=mine.entry_id
  ) mine_count on true
  join public.tournament_entry_members_v8 opponent
    on opponent.tournament_id=g.tournament_id
   and opponent.entry_id=case when mine.entry_id=g.entry1_id then g.entry2_id else g.entry1_id end
  join lateral(
    select count(*)::integer members
    from public.tournament_entry_members_v8 em
    where em.tournament_id=g.tournament_id and em.entry_id=opponent.entry_id
  ) opponent_count on true
  where g.status::text='completed'
    and g.winner_entry_id is not null
    and mine_count.members=1
    and opponent_count.members=1
    and opponent.user_id<>p_user;
$$;

revoke all on function public.tt_v74_individual_rivalry_events(uuid) from public;

create or replace function public.get_player_competitive_streaks_v74(p_player_id uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path=public,pg_temp
as $$
declare
  v_requester uuid:=auth.uid();
  v_player uuid:=coalesce(p_player_id,auth.uid());
  v_event record;
  v_individual_current integer:=0;
  v_individual_best integer:=0;
  v_individual_played integer:=0;
  v_doubles_current integer:=0;
  v_doubles_best integer:=0;
  v_doubles_played integer:=0;
begin
  if v_requester is null then raise exception 'Debés iniciar sesión'; end if;
  if v_player is null then raise exception 'Jugador requerido'; end if;

  for v_event in
    select *
    from public.tt_v74_competitive_events(v_player)
    order by played_at,event_key
  loop
    if v_event.scope='doubles' then
      v_doubles_played:=v_doubles_played+1;
      if v_event.skip_win then
        null;
      elsif v_event.won then
        v_doubles_current:=v_doubles_current+1;
        v_doubles_best:=greatest(v_doubles_best,v_doubles_current);
      elsif v_event.reset_streak then
        v_doubles_current:=0;
      end if;
    else
      v_individual_played:=v_individual_played+1;
      if v_event.skip_win then
        null;
      elsif v_event.won then
        v_individual_current:=v_individual_current+1;
        v_individual_best:=greatest(v_individual_best,v_individual_current);
      elsif v_event.reset_streak then
        v_individual_current:=0;
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'individual',jsonb_build_object(
      'current',v_individual_current,
      'best',v_individual_best,
      'played',v_individual_played
    ),
    'doubles',jsonb_build_object(
      'current',v_doubles_current,
      'best',v_doubles_best,
      'played',v_doubles_played
    ),
    'rules',jsonb_build_object(
      'casual_affects_streak',false,
      'individual_and_doubles_separate',true,
      'verified_elo_matches_only',true
    ),
    'generated_at',now()
  );
end;
$$;

revoke all on function public.get_player_competitive_streaks_v74(uuid) from public;
grant execute on function public.get_player_competitive_streaks_v74(uuid) to authenticated;

create or replace function public.get_my_rivalries_v74(p_limit integer default 6)
returns jsonb
language plpgsql
stable
security definer
set search_path=public,pg_temp
as $$
declare
  v_user uuid:=auth.uid();
  v_limit integer:=greatest(1,least(coalesce(p_limit,6),12));
  v_rows jsonb;
begin
  if v_user is null then raise exception 'Debés iniciar sesión'; end if;

  with rivalry_events as(
    select * from public.tt_v74_individual_rivalry_events(v_user)
  ),
  aggregates as(
    select
      opponent_id,
      count(*)::integer total,
      count(*) filter(where won)::integer wins,
      count(*) filter(where not won)::integer losses,
      coalesce(sum(my_sets),0)::integer my_sets,
      coalesce(sum(opponent_sets),0)::integer opponent_sets,
      coalesce(sum(elo_delta),0)::integer net_elo,
      max(played_at) last_played_at,
      count(*) filter(where source='tournament')::integer tournament_matches,
      count(*) filter(where source='ranked')::integer ranked_matches
    from rivalry_events
    group by opponent_id
    having count(*)>=2
  ),
  ranked as(
    select
      a.*,
      p.username,
      p.first_name,
      p.last_name,
      p.profile_photo_url,
      (
        a.total*12
        + least(a.wins,a.losses)*5
        + case when a.last_played_at>=now()-interval '30 days' then 18
               when a.last_played_at>=now()-interval '90 days' then 8 else 0 end
      )::integer intensity_score,
      (
        select coalesce(jsonb_agg(jsonb_build_object(
          'won',recent.won,
          'my_sets',recent.my_sets,
          'opponent_sets',recent.opponent_sets,
          'format',recent.match_format,
          'source',recent.source,
          'played_at',recent.played_at
        ) order by recent.played_at desc),'[]'::jsonb)
        from(
          select e.won,e.my_sets,e.opponent_sets,e.match_format,e.source,e.played_at
          from rivalry_events e
          where e.opponent_id=a.opponent_id
          order by e.played_at desc,e.event_key desc
          limit 5
        ) recent
      ) recent
    from aggregates a
    join public.profiles p on p.id=a.opponent_id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'opponent_id',x.opponent_id,
    'username',x.username,
    'first_name',x.first_name,
    'last_name',x.last_name,
    'profile_photo_url',x.profile_photo_url,
    'total',x.total,
    'wins',x.wins,
    'losses',x.losses,
    'my_sets',x.my_sets,
    'opponent_sets',x.opponent_sets,
    'net_elo',x.net_elo,
    'win_rate',case when x.total>0 then round((x.wins::numeric/x.total::numeric)*100,1) else 0 end,
    'last_played_at',x.last_played_at,
    'ranked_matches',x.ranked_matches,
    'tournament_matches',x.tournament_matches,
    'intensity_score',x.intensity_score,
    'level',case
      when x.total>=10 and abs(x.wins-x.losses)<=2 then 'classic'
      when x.total>=8 then 'consolidated'
      when x.total>=4 then 'growing'
      else 'new'
    end,
    'recent',x.recent
  ) order by x.intensity_score desc,x.last_played_at desc),'[]'::jsonb)
  into v_rows
  from(
    select *
    from ranked
    order by intensity_score desc,last_played_at desc
    limit v_limit
  ) x;

  return jsonb_build_object(
    'rivalries',coalesce(v_rows,'[]'::jsonb),
    'generated_at',now(),
    'minimum_matches',2,
    'casuals_included',false
  );
end;
$$;

revoke all on function public.get_my_rivalries_v74(integer) from public;
grant execute on function public.get_my_rivalries_v74(integer) to authenticated;

create or replace function public.get_competitive_rivalry_v74(p_opponent_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path=public,pg_temp
as $$
declare
  v_user uuid:=auth.uid();
  v_profile record;
  v_total integer:=0;
  v_wins integer:=0;
  v_losses integer:=0;
  v_my_sets integer:=0;
  v_opponent_sets integer:=0;
  v_net_elo integer:=0;
  v_ranked integer:=0;
  v_tournaments integer:=0;
  v_recent jsonb:='[]'::jsonb;
  v_last_result boolean:=null;
  v_run integer:=0;
  v_best_win_run integer:=0;
  v_running_win integer:=0;
  v_event record;
begin
  if v_user is null then raise exception 'Debés iniciar sesión'; end if;
  if p_opponent_id is null or p_opponent_id=v_user then
    raise exception 'Rival no válido';
  end if;

  select id,username,first_name,last_name,profile_photo_url
  into v_profile
  from public.profiles
  where id=p_opponent_id;

  if not found then raise exception 'No encontramos ese jugador'; end if;

  select
    count(*)::integer,
    count(*) filter(where won)::integer,
    count(*) filter(where not won)::integer,
    coalesce(sum(my_sets),0)::integer,
    coalesce(sum(opponent_sets),0)::integer,
    coalesce(sum(elo_delta),0)::integer,
    count(*) filter(where source='ranked')::integer,
    count(*) filter(where source='tournament')::integer
  into v_total,v_wins,v_losses,v_my_sets,v_opponent_sets,v_net_elo,v_ranked,v_tournaments
  from public.tt_v74_individual_rivalry_events(v_user)
  where opponent_id=p_opponent_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'won',r.won,
    'my_sets',r.my_sets,
    'opponent_sets',r.opponent_sets,
    'format',r.match_format,
    'source',r.source,
    'played_at',r.played_at,
    'elo_delta',r.elo_delta
  ) order by r.played_at desc),'[]'::jsonb)
  into v_recent
  from(
    select *
    from public.tt_v74_individual_rivalry_events(v_user)
    where opponent_id=p_opponent_id
    order by played_at desc,event_key desc
    limit 10
  ) r;

  for v_event in
    select won
    from public.tt_v74_individual_rivalry_events(v_user)
    where opponent_id=p_opponent_id
    order by played_at,event_key
  loop
    if v_event.won then
      v_running_win:=v_running_win+1;
      v_best_win_run:=greatest(v_best_win_run,v_running_win);
    else
      v_running_win:=0;
    end if;

    if v_last_result is null or v_last_result<>v_event.won then
      v_run:=1;
      v_last_result:=v_event.won;
    else
      v_run:=v_run+1;
    end if;
  end loop;

  return jsonb_build_object(
    'opponent_id',v_profile.id,
    'username',v_profile.username,
    'first_name',v_profile.first_name,
    'last_name',v_profile.last_name,
    'profile_photo_url',v_profile.profile_photo_url,
    'total',v_total,
    'wins',v_wins,
    'losses',v_losses,
    'my_sets',v_my_sets,
    'opponent_sets',v_opponent_sets,
    'net_elo',v_net_elo,
    'win_rate',case when v_total>0 then round((v_wins::numeric/v_total::numeric)*100,1) else 0 end,
    'ranked_matches',v_ranked,
    'tournament_matches',v_tournaments,
    'best_win_streak',v_best_win_run,
    'current_run',v_run,
    'current_run_owner',case when v_last_result is null then null when v_last_result then 'me' else 'opponent' end,
    'recent',v_recent,
    'casuals_included',false,
    'level',case
      when v_total>=10 and abs(v_wins-v_losses)<=2 then 'classic'
      when v_total>=8 then 'consolidated'
      when v_total>=4 then 'growing'
      when v_total>=2 then 'new'
      else 'insufficient'
    end,
    'generated_at',now()
  );
end;
$$;

revoke all on function public.get_competitive_rivalry_v74(uuid) from public;
grant execute on function public.get_competitive_rivalry_v74(uuid) to authenticated;

commit;

select 'TT Rivals P7.4R Rivalidades reales instalado correctamente' as resultado;
