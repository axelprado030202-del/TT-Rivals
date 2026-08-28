-- TT Rivals 1.0.1 · P7.4R.4.7
-- RP es el nombre visible de los puntos competitivos. Las columnas internas
-- conservan "rating" para no romper datos, funciones ni integraciones.
--
-- Regla de abandono clasificatorio:
--   * el ganador conserva la ganancia normal;
--   * quien abandona recibe una pérdida doble;
--   * casual no modifica RP;
--   * la corrección se ejecuta una sola vez al insertarse el movimiento base.

create or replace function public.tt_v747_double_abandonment_penalty()
returns trigger
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_match jsonb;
  v_new_rating integer;
begin
  if new.match_id is null or coalesce(new.rating_change,0)>=0 then
    return new;
  end if;

  select to_jsonb(m) into v_match
  from public.matches m
  where m.id=new.match_id;

  if v_match is null
     or lower(coalesce(v_match->>'completion_type',''))<>'abandonment'
     or lower(coalesce(v_match->>'match_type','ranked'))<>'ranked'
     or nullif(v_match->>'abandoned_by','')::uuid<>new.user_id then
    return new;
  end if;

  -- rating_change ya contiene la pérdida normal (un número negativo).
  -- Sumamos ese mismo valor una segunda vez, respetando el piso de 0 RP.
  update public.ratings
  set rating=greatest(0,rating+new.rating_change)
  where user_id=new.user_id and modality=new.modality
  returning rating into v_new_rating;

  if v_new_rating is null then
    return new;
  end if;

  update public.rating_history
  set new_rating=v_new_rating,
      rating_change=v_new_rating-new.previous_rating
  where id=new.id;

  return new;
end;
$function$;

drop trigger if exists rating_history_double_abandonment_v747 on public.rating_history;
create constraint trigger rating_history_double_abandonment_v747
after insert on public.rating_history
deferrable initially deferred
for each row execute function public.tt_v747_double_abandonment_penalty();

revoke all on function public.tt_v747_double_abandonment_penalty() from public,anon,authenticated;

