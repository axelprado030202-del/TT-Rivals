TT RIVALS — V12 AVATAR + RANGO REFINADO

CAMBIOS
- Las paletas de rango ahora usan PNG con fondo transparente.
- En Inicio, la paleta grande desaparece.
- En su lugar aparece un espacio circular para la foto del usuario.
  - Si el usuario ya tiene profile_photo_url, se muestra su foto.
  - Si no tiene foto, se muestran sus iniciales.
- El rango ahora aparece al lado en una insignia compacta:
  - icono pequeño de la paleta del rango
  - nombre del rango
  - fondo del color correspondiente al rango
- Bronce / Plata / Oro / Platino / Diamante tienen ahora un badge visual propio.
- El resto de la Tabla de Rangos mantiene las paletas transparentes.

IMPORTANTE
No hace falta SQL nuevo para esta V12.
Usa el mismo sistema de datos de V11 / V10.

PARA GITHUB
Reemplazar:
- index.html
- css/
- js/
- assets/

Luego hacer Ctrl + F5 para evitar caché.
