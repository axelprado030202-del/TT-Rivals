# Activar Ligas · TT Rivals 1.0.5

La interfaz se encuentra en **Jugar → Ligas**. La base de datos necesita estos dos archivos, en orden:

1. Abrí `SQL_LIGAS_1_0_5.sql`, copiá todo y ejecutalo en una nueva consulta de Supabase → SQL Editor. Debe decir **Ligas 1.0.5 instaladas**.
2. Abrí `SQL_LIGAS_RECORDATORIOS_1_0_5.sql` y ejecutalo completo en otra consulta. Debe decir **Recordatorios de Ligas activados**.

No borres tablas, funciones, secretos, tareas programadas ni los SQL anteriores. Los dos archivos son reejecutables. Si uno falla, detenete y compartí el mensaje de error (no claves).

El segundo archivo requiere `pg_cron` y el sistema de notificaciones externas ya configurado. No cambia las claves VAPID ni necesita volver a publicar la función de envío.

## Primera prueba

1. Actualizá TT Rivals. Creá una liga con 2 fechas y elegí frecuencia, primer horario, lugar, sorteo y mejor de 3 o 5 sets.
2. Inscribí al menos 3 jugadores reales. Para probar altas tardías, empezá con 10 y añadí uno después del sorteo. Los grupos iniciales serán 4/3/3; los existentes no se vuelven a sortear.
3. Revisá grupos, partidos y clasificación. **No cargues resultados ficticios en producción: los partidos jugados modifican el RP global.** Usá una base de pruebas para simular partidos.
4. Con un partido realmente disputado, cargá sus sets y comprobá ambos RP y puntos de liga. En una ausencia real, “No participa” da puntos de liga pero no RP.
5. Cuando termine el último grupo, comprobá que no se acepten altas. Generá las eliminatorias; al terminar la final, la fecha queda archivada.
6. Para comprobar recordatorios, programá una fecha de prueba para dentro de 30–50 minutos e inscribite. Activá los permisos de notificaciones en el dispositivo y dejá la app fuera de primer plano. El aviso de una hora se prepara en la siguiente ejecución del programador. Cancelá luego esa fecha sin resultados para no dejarla pendiente.

La entrega efectiva en el teléfono depende del permiso, suscripción, navegador/sistema y servicio push. Está verificada la creación y deduplicación de los avisos en pruebas locales; resta verificar la entrega real después de instalar los archivos.

## Reglas incluidas

- De 1 a 60 fechas semanales o mensuales; entre 3 y 128 inscritos para sortear cada fecha.
- Grupos iniciales de hasta 4; sorteo aleatorio o equilibrado con el RP vigente al sortear.
- Altas tardías aleatorias entre los grupos menos numerosos, sin mover integrantes ni crear grupos nuevos. Pueden superar 4 integrantes. Un grupo terminado puede reabrirse si todavía hay otro con partidos pendientes.
- Una vez terminan todos los grupos, las altas se cierran. Clasifican los dos mejores disponibles por grupo.
- Puntos por victoria: grupos 1; rondas previas a semifinales 2; semifinal 3; final 5. Son categorías excluyentes, no puntos adicionales acumulados por el mismo partido.
- Incomparecencia: puntos de fase para el rival, sin RP. Pase libre/doble ausencia: sin puntos ni RP. Retiro de fecha: conserva lo ya disputado y resuelve pendientes.
- General: suma de todas las fechas. Desempates por títulos de fecha, victorias jugadas, diferencia de sets y tantos. Si persiste, posición compartida.
- Grupos: victorias (incluidas incomparecencias), diferencia de sets, tantos y orden aleatorio persistente fijado en la inscripción.
- Los resultados confirmados son definitivos en esta versión. No hay editor retrospectivo que altere un cuadro avanzado o recalculador de RP histórico.
- Recordatorios a 7 días para seguidores de la liga; a 1 día y 1 hora para inscritos activos. Reprogramaciones/cancelaciones avisan y descartan recordatorios pendientes del horario viejo. Los ya entregados no se pueden retirar del teléfono.
- Todas las ligas son visibles dentro de la app para usuarios registrados. El anfitrión administra; no hay ligas privadas ni cobros en esta versión.

## Verificación realizada

Pruebas locales de PostgreSQL: migración repetida, permisos, calendario mensual, altas tardías, reapertura de grupos, scores inválidos, duplicación de RP, incomparecencias, eliminatorias, retiros y recordatorios. Pruebas de interfaz con datos simulados en cinco anchos; regresión de foto de perfil y permisos de administrador.

Las pruebas no sustituyen una comprobación en la base real. No se ha ejecutado ninguna migración ni partido de prueba en tu Supabase.
