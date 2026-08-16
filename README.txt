TT RIVALS — V6

V6 completa el primer circuito competitivo individual:

DESAFÍO
→ ACEPTAR
→ SE CREA PARTIDO
→ REGISTRAR SETS
→ EL OTRO JUGADOR CONFIRMA
→ ELO AUTOMÁTICO
→ RATING + ESTADÍSTICAS + HISTORIAL

IMPORTANTE: PRIMERO EJECUTÁ SQL_V6_SUPABASE.sql EN SUPABASE.

ELO EN V6
- Elo estándar.
- K = 32.
- Todavía NO incorpora:
  * modificador por marcador ajustado
  * Bo3/Bo5 como multiplicador
  * torneos
  * abandono
Es mejor comprobar primero que el núcleo Elo funciona bien antes de agregar
nuestros modificadores personalizados.

NUEVOS ARCHIVOS
- js/matches.js
- SQL_V6_SUPABASE.sql

PRUEBA RECOMENDADA
1. Usá dos cuentas distintas.
2. Cuenta A desafía a B.
3. B acepta.
4. Aparece un partido pendiente.
5. A o B registra todos los sets.
6. El otro confirma.
7. Revisá que ambos ratings dejen de ser 1000.
8. Revisá Estadísticas y el historial de rating.

SUBIDA A GITHUB
Reemplazá index.html, css/ y js/ por los de V6.
