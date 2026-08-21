-- TT Rivals 1.0.1 — P7.4R.1 Hotfix: decisiones administrativas sin nota obligatoria
-- Conserva la función existente completa: auditoría, notificaciones y reversión de Elo.
-- Solo elimina la condición que impedía Reabrir o Anular con una nota vacía.

begin;

do $do$
declare
  v_definition text;
  v_updated text;
  v_required_check text := $check$if p_action in('reopen','annul') and length(v_note)<3 then raise exception 'Indicá el motivo de esta acción'; end if;$check$;
begin
  select pg_get_functiondef(p.oid) into v_definition
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='admin_review_match_v63'
  order by p.oid limit 1;

  if v_definition is null then raise exception 'No encontramos public.admin_review_match_v63'; end if;

  v_updated := replace(v_definition, v_required_check, '');

  if v_updated = v_definition then
    raise exception 'No se encontró la validación de motivo obligatoria. No se aplicó ningún cambio.';
  end if;

  execute v_updated;
end;
$do$;

commit;

select 'TT Rivals P7.4R.1: nota administrativa opcional instalada correctamente' as resultado;
