# Eliminar ligas · 1.0.7

Ejecutá completo SQL_ELIMINAR_LIGAS_1_0_7.sql en una consulta nueva de Supabase. Instala la función; no elimina ninguna liga al ejecutar el archivo. No repitas las migraciones anteriores.

Resultado esperado: **Eliminación de ligas 1.0.7 activada**.

Después actualizá TT Rivals. El anfitrión verá **Eliminar liga** al abrir su liga, incluso si está finalizada. Tendrá que escribir **ELIMINAR** para confirmar.

Se borran la liga, sus fechas, participantes, partidos, solicitudes y avisos internos vinculados. Se cancelan los envíos pendientes; un aviso ya entregado o en tránsito hacia el teléfono no se puede retirar con garantías.

El RP de partidos ya confirmados y su historial de variaciones se conservan, sin referencias a la liga eliminada. No se afectan otras ligas. No hay botón de recuperación después de eliminar.

Pruebas locales: propietario/autorización, confirmación escrita, eliminación de ligas activas y finalizadas, limpieza de dependencias, cancelación de envíos pendientes, preservación de otras ligas, RP e historial intactos. La entrega real requiere ejecutar el SQL en Supabase.
