# TT Rivals 1.0.2 — envío inmediato de notificaciones externas

## Actualizar una instalación que ya envía notificaciones

No cambiar ni volver a generar las claves. La función conserva su nombre
`tt-push-dispatch-v100` para no romper el programador existente.

1. En Supabase > Edge Functions > tt-push-dispatch-v100 > Code, reemplazar
   todo `index.ts` por el archivo de esta carpeta y pulsar **Deploy updates**.
   Mantener desactivado **Verify JWT with legacy secret**: la protección es
   el encabezado secreto `x-tt-push-secret`, como antes.
2. Una prueba autenticada con el mismo encabezado utilizado anteriormente
   debe devolver `version: "1.0.2"`. No compartir el valor del encabezado.
3. Solo después del despliegue, ejecutar el archivo de la raíz
   `SQL_TT_RIVALS_1_0_2_PUSH_IMMEDIATE.sql` en SQL Editor. Debe devolver
   `envio_inmediato_activo: true`.
4. Con la cuenta receptora fuera de la app, enviar un desafío nuevo.

La reserva atómica de cada envío evita que el aviso inmediato y Cron envíen
la misma fila simultáneamente. No activar el SQL nuevo con la función antigua.
La publicación en GitHub Pages no despliega esta función ni ejecuta el SQL.

## Funcionamiento y verificación

Cada inserción de avisos solicita el envío mediante pg_net. El HTTP arranca
después de confirmar la transacción, sin esperar el minuto de Cron. Si falla
esa solicitud, la cola sigue pendiente y Cron actúa como respaldo.
Los desafíos usan prioridad alta y se procesan hasta cuatro envíos en paralelo.
Esto elimina la espera programada, no garantiza una latencia de entrega del
sistema operativo. `sent_at` indica aceptación del proveedor push, no que el
teléfono haya mostrado el aviso.

`SQL_TT_RIVALS_1_0_2_PUSH_TIMING.sql` consulta tiempos de cola y respuestas de
la activación inmediata sin mostrar secretos o direcciones de suscripción.

Referencias: [pg_net](https://supabase.com/docs/guides/database/extensions/pg_net)
y [opciones de Web Push](https://github.com/web-push-libs/web-push#sendnotificationpushsubscription-payload-options).

## Instalación inicial (solo si aún no está configurada)

1. Generar un par VAPID y guardar `TT_VAPID_PUBLIC_KEY`, `TT_VAPID_PRIVATE_KEY`, `TT_VAPID_SUBJECT` y `TT_PUSH_CRON_SECRET` como secretos de Supabase.
2. Publicar `tt-push-dispatch-v100` sin exponer la clave privada en el cliente.
3. Copiar la clave pública a `push_public_config_v100.vapid_public_key` y cambiar `enabled` a `true`.
4. Invocar la función periódicamente desde un cron seguro enviando `x-tt-push-secret`.

La cola solo se genera cuando ninguna sesión del destinatario informó estar visible durante los últimos 75 segundos.
