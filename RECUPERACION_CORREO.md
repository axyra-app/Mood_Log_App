# Correo de recuperación de Mood Log

En Firebase Authentication → Plantillas → Restablecimiento de contraseña, configura la URL de acción después de publicar la nueva pantalla:

https://mood-log-app-main.vercel.app/account-action

La URL de acción se comparte entre las plantillas del proyecto. La pantalla admite el restablecimiento de contraseña, la verificación de correo y la recuperación del correo anterior. El enlace de continuación del SDK no reemplaza la URL de acción.

Asunto: Restablece tu contraseña de Mood Log

Cuerpo sugerido, si el editor permite HTML:

<p>Hola,</p>
<p>Recibimos una solicitud para cambiar la contraseña de tu cuenta en Mood Log.</p>
<p><a href="%LINK%" style="display:inline-block;padding:12px 20px;background:#913a9d;color:#ffffff;border-radius:10px;text-decoration:none;font-weight:bold;">Crear una contraseña nueva</a></p>
<p>Si tú no pediste el cambio, puedes ignorar este mensaje.</p>
<p>Equipo de Mood Log</p>

Si el editor solo admite texto, coloca %LINK% en una línea debajo de «Crea una contraseña nueva» y conserva las demás frases. Para un diseño HTML completo, Firebase permite generar enlaces con el SDK Admin y enviarlos con un proveedor propio.

Después de guardar, pide un correo nuevo para una cuenta de prueba. Comprueba que abra la pantalla de Mood Log y que el código no se pueda reutilizar.
