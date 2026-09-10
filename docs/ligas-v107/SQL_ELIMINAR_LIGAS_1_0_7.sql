-- TT Rivals 1.0.7. Instala el permiso de eliminación; NO elimina ninguna liga al ejecutar este archivo.
begin;
create or replace function public.delete_league_v107(p_league bigint,p_confirmation text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare host uuid;begin
 if auth.uid() is null then raise exception using errcode='42501',message='Iniciá sesión';end if;
 select owner_id into host from public.leagues_v105 where id=p_league for update;
 if not found then raise exception 'La liga ya no existe';end if;
 if host is distinct from auth.uid() then raise exception using errcode='42501',message='Solo el anfitrión puede eliminar esta liga';end if;
 if trim(coalesce(p_confirmation,''))<>'ELIMINAR' then raise exception 'Escribí ELIMINAR para confirmar';end if;
 -- Same parent-first locking order as results, registration and reminder jobs.
 perform 1 from public.league_dates_v105 where league_id=p_league order by id for update;
 if to_regclass('public.push_delivery_queue_v100') is not null then
  update public.push_delivery_queue_v100 q set status='expired',last_error='league_deleted'
  where q.status in('pending','sending') and q.notification_id in(
   select n.id from public.notifications_v58 n where n.action='leagues' and n.entity_kind='league' and n.entity_id=p_league::text
   union select r.notification_id from public.league_reminders_v105 r join public.league_dates_v105 d on d.id=r.date_id where d.league_id=p_league
  );
 end if;
 delete from public.notifications_v58 where action='leagues' and entity_kind='league' and entity_id=p_league::text;
 -- Preserve the RP ledger and totals, only detach the competition reference.
 update public.rating_history h set league_game_id=null where h.league_game_id in(
  select g.id from public.league_games_v105 g join public.league_dates_v105 d on d.id=g.date_id where d.league_id=p_league
 );
 -- Remove games before their participant rows to respect cross-references.
 delete from public.league_games_v105 where date_id in(select id from public.league_dates_v105 where league_id=p_league);
 delete from public.leagues_v105 where id=p_league;
 return jsonb_build_object('resultado','Liga eliminada','rp_conservado',true);
end$$;
revoke all on function public.delete_league_v107(bigint,text) from public,anon,authenticated;
grant execute on function public.delete_league_v107(bigint,text) to authenticated;
notify pgrst,'reload schema';
commit;
select jsonb_build_object('resultado','Eliminación de ligas 1.0.7 activada','solo_anfitrion',true,'rp_conservado',true) as resultado;
