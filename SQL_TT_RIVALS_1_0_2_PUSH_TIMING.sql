-- Solo consulta. No envía notificaciones ni expone claves o suscripciones.
-- sent_at mide aceptación del proveedor, NO visualización en el teléfono.
with latest as (
  select id,created_at from public.challenges order by created_at desc limit 1
)
select jsonb_build_object(
  'ultimo_desafio',(select id from latest),
  'creado',(select created_at from latest),
  'envios',coalesce((
    select jsonb_agg(to_jsonb(t)) from (
      select q.id,q.status,q.attempts,q.created_at,q.sent_at,
        round(extract(epoch from(q.sent_at-q.created_at))::numeric,2) as segundos_hasta_aceptacion_push
      from public.push_delivery_queue_v100 q
      where q.event_key='challenge:'||(select id::text from latest)||':received'
      order by q.id
    ) t
  ),'[]'::jsonb),
  'activaciones_recientes',coalesce((
    select jsonb_agg(to_jsonb(t)) from (
      select d.created_at,d.queued_count,d.fallback_reason,
        r.status_code as codigo_http,r.timed_out as timeout
      from public.push_dispatch_requests_v102 d
      left join net._http_response r on r.id=d.request_id
      order by d.id desc limit 5
    ) t
  ),'[]'::jsonb)
) as tiempos_push;
