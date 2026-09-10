# Ligas 1.0.6

## Activación

Ejecutá completo `SQL_LIGAS_1_0_6.sql` en una consulta nueva de Supabase → SQL Editor. No vuelvas a ejecutar los archivos 1.0.5 ni borres nada anterior.

El resultado esperado es **Ligas 1.0.6 actualizadas**. Después actualizá TT Rivals. Se reutilizan los recordatorios y el despachador push existentes; no cambies claves VAPID ni secretos.

## Resultados

Uno de los jugadores carga los sets. El partido queda pendiente y se avisa al anfitrión: **Liga CBPS · Confirmar resultado — Fase de grupos · Axel 2 vs 1 Gastón**.

Al abrir la notificación se abre la liga con los resultados pendientes arriba. El anfitrión tiene **Confirmar resultado** y **Rechazar resultado**. También puede revisarlos desde el partido.

Solo al confirmar se suman puntos y RP y se avanza en el cuadro. La última confirmación de grupos genera las eliminatorias automáticamente. Al rechazar se pide motivo y los jugadores pueden volver a cargarlo.

El anfitrión no puede cargar partidos ajenos. Si también juega, puede cargar su partido y confirmarlo como anfitrión. Las incomparecencias y retiros siguen bajo su gestión, sin RP.

Los resultados ya confirmados antes de actualizar no se modifican ni se contabilizan de nuevo.

## Formatos

Al crear: **1 set**, **al mejor de 3**, **al mejor de 5** o **personalizable por fase**. Se puede elegir para grupos y cada ronda de eliminatorias; solo se usan las rondas necesarias según los clasificados.

Las ligas existentes conservan su formato. Esta actualización no cambia retroactivamente su reglamento.

## Privacidad

- Pública: cualquier jugador registrado habilitado puede inscribirse.
- Privada: el nombre es visible en el listado, pero fechas, participantes y resultados solo se muestran al anfitrión y miembros aprobados.
- El jugador ingresa la clave y envía una solicitud. El anfitrión recibe una notificación y, al abrir la liga, puede **Aceptar** o **Rechazar**.
- La aceptación vale para toda la liga; después el jugador elige sus fechas.
- La clave se guarda como hash bcrypt. No aparece en respuestas de la app ni notificaciones. Hay un límite de intentos por usuario y liga. El anfitrión debe compartirla fuera de la aplicación.

Se usan las funciones de contraseñas de [PostgreSQL pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html#PGCRYPTO-PASSWORD-HASHING-FUNCS).

## Comprobación

Probá el ingreso privado desde otra cuenta: clave incorrecta, solicitud correcta, aceptación y acceso. Para partidos reales, comprobá que el RP no cambie al enviar el resultado y sí al confirmarlo.

No cargues resultados inventados en producción: al confirmarlos alteran el RP global.

Pruebas locales: migración reejecutable; permisos; propuestas duplicadas; rechazo/reenvío; RP una sola vez; K de 1 set; formatos por fase; eliminatorias automáticas; privacidad; límites de intentos; interfaz en cinco anchos. El entorno local no incluye pgcrypto, por lo que la contraseña se simuló únicamente en el test; el archivo de producción utiliza pgcrypto real. Resta verificar activación y entrega push en Supabase y dispositivos reales.
