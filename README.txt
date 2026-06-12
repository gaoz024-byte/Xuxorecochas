Archivos para subir a GitHub

Sube estos archivos juntos en la raiz del repositorio:

- index.html: pagina inicial con el boton Crear combos y la lista de formaciones guardadas.
- combos.html: pagina de la cancha para crear o visitar una formacion.
- styles.css: estilos compartidos por la portada y la cancha.
- supabase-config.js: aqui debes pegar la URL y la anon key de tu proyecto de Supabase.
- home.js: controla la pagina inicial y muestra las formaciones guardadas.
- script.js: controla la cancha, los jugadores y el guardado de formaciones en Supabase.
- supabase-schema.sql: codigo SQL para crear la tabla formations en Supabase.

Pasos en Supabase:

1. Crea un proyecto en Supabase.
2. Abre SQL Editor.
3. Pega y ejecuta el contenido de supabase-schema.sql.
4. Ve a Project Settings > API.
5. Copia Project URL y anon public key.
6. Pega esos valores en supabase-config.js.

Con eso, las formaciones quedan guardadas en Supabase y se pueden ver desde otros dispositivos.
