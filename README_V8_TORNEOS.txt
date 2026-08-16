TT RIVALS — V8 TORNEOS

Esta versión rediseña por completo Torneos.

FLUJO
TORNEOS
→ Torneo 1vs1 / Torneo 2vs2
→ Simple / Intermedio / Extenso / Personalizado
→ elegir etapa inicial
→ elegir usuarios
→ sorteo totalmente aleatorio
→ cargar resultados en la llave
→ final
→ cerrar torneo
→ tabla final

TIPOS
- Simple: todos los partidos a 1 set (1×11).
- Intermedio: todos los partidos al mejor de 3.
- Extenso: todos los partidos al mejor de 5.
- Personalizado: elegís sets para grupos, dieciseisavos, octavos, cuartos, semifinal y final.

ETAPAS POSIBLES
- Fase de grupos
- Dieciseisavos
- Octavos
- Cuartos de final
- Semifinal
- Final

Si comenzás por grupos, elegís:
- cantidad de grupos
- cuántos clasifican por grupo
- desde qué etapa eliminatoria continúan

SORTEO
El Elo NO se usa para emparejar.
Los cruces se generan al azar.

2vs2
Seleccionás jugadores individuales.
El sistema forma las parejas al azar y luego sortea la llave.

ELO
- 1vs1 actualiza Elo individual.
- 2vs2 actualiza Elo de dobles de cada integrante.
- K=32 por ahora.

INSTALACIÓN
1. Ejecutar SQL_V8_TORNEOS.sql completo en Supabase.
2. Subir/reemplazar en GitHub:
   index.html
   css/style.css
   js/app.js
   js/tournaments.js
3. Mantener el resto de archivos JS de V6/V7.

IMPORTANTE
V8 crea tablas nuevas con sufijo _v8. No destruye los torneos V7 existentes.
La interfaz nueva utiliza las tablas V8.
