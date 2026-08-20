-- TT Rivals 1.0.1 — P7.3 Revancha instantánea
-- Vincula la revancha con su partido original y evita solicitudes pendientes duplicadas.
begin;

alter table public.challenges
  add column if not exists source_match_id bigint
  references public.matches(id)
  on delete set null;

create index if not exists challenges_source_match_v73_idx
  on public.challenges(source_match_id)
  where source_match_id is not null;

create unique index if not exists challenges_one_pending_rematch_v73_uidx
  on public.challenges(source_match_id)
  where source_match_id is not null
    and status = 'pending';

create or replace function public.create_rematch_challenge_v73(p_match_id bigint)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_match public.matches%rowtype;
  v_existing public.challenges%rowtype;
  v_created public.challenges%rowtype;
  v_opponent uuid;
begin
  if v_user is null then
    raise exception 'Sesión requerida.';
  end if;

  select *
    into v_match
    from public.matches
   where id = p_match_id
     and status::text = 'confirmed';

  if not found then
    raise exception 'El partido no existe o todavía no está confirmado.';
  end if;

  if v_user = v_match.player1_id then
    v_opponent := v_match.player2_id;
  elsif v_user = v_match.player2_id then
    v_opponent := v_match.player1_id;
  else
    raise exception 'Solo los participantes pueden solicitar la revancha.';
  end if;

  select *
    into v_existing
    from public.challenges
   where source_match_id = p_match_id
     and status::text = 'pending'
   order by created_at desc
   limit 1;

  if found then
    return jsonb_build_object(
      'challenge', to_jsonb(v_existing),
      'reused', true
    );
  end if;

  begin
    insert into public.challenges(
      challenger_id,
      challenged_id,
      modality,
      match_format,
      match_type,
      scheduled_date,
      scheduled_time,
      location,
      status,
      source_match_id
    )
    values(
      v_user,
      v_opponent,
      'individual',
      coalesce(v_match.match_format, 'bo3'),
      coalesce(v_match.match_type, 'ranked'),
      null,
      null,
      null,
      'pending',
      p_match_id
    )
    returning * into v_created;
  exception
    when unique_violation then
      select *
        into v_created
        from public.challenges
       where source_match_id = p_match_id
         and status::text = 'pending'
       order by created_at desc
       limit 1;
      return jsonb_build_object(
        'challenge', to_jsonb(v_created),
        'reused', true
      );
  end;

  return jsonb_build_object(
    'challenge', to_jsonb(v_created),
    'reused', false
  );
end;
$$;

revoke all on function public.create_rematch_challenge_v73(bigint) from public;
grant execute on function public.create_rematch_challenge_v73(bigint) to authenticated;

comment on column public.challenges.source_match_id is
  'P7.3: partido confirmado que originó una solicitud de revancha.';

commit;

select 'TT Rivals P7.3 revancha instalado correctamente' as resultado;
