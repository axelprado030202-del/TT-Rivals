TT RIVALS — V3

NOVEDADES
- Registro real con Supabase Auth.
- Inicio de sesión real.
- Nombre, apellido y username enviados como metadata.
- Validación básica del formulario.
- Flujo obligatorio de perfil deportivo.
- Perfil deportivo:
  * Fecha de nacimiento
  * Estilo: ofensivo / defensivo / allround
  * Mano: diestro / zurdo / ambidiestro
  * Club obligatorio o N/A
  * Foto opcional mediante URL (subida de imagen vendrá más adelante)
- Al completar el perfil se llama a la función SQL:
  public.complete_sports_profile(...)
- Pantalla de inicio básica con rating individual y dobles.
- Cierre de sesión.

IMPORTANTE SOBRE USERNAME
La tabla profiles tiene username UNIQUE. Si dos registros intentan usar exactamente
el mismo username, la base de datos impedirá el duplicado.

IMPORTANTE SOBRE CONFIRMACIÓN DE EMAIL
Supabase puede tener activada la confirmación por email.
Si está activada:
1. El usuario crea la cuenta.
2. Debe confirmar el correo.
3. Luego inicia sesión.
4. Completa su perfil deportivo.

PARA PROBAR
No abras el HTML haciendo doble clic si el navegador bloquea módulos.
Usá un servidor local, por ejemplo:
- VS Code + Live Server
o
- GitHub Pages

ARCHIVOS
index.html
css/style.css
js/supabase.js
js/auth.js
js/profile.js
js/app.js

SEGURIDAD
La publishable key es apta para frontend con RLS.
NUNCA uses una service_role key en estos archivos.
