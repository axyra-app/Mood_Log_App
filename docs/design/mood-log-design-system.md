# Mood Log: sistema visual

La interfaz se siente cercana y serena, como un diario personal. Las pantallas de uso diario priorizan la pregunta “¿cómo me siento?” y los controles que la persona eligió; no presentan el pulso como una lectura emocional.

## Identidad

| Token | Valor | Uso |
|---|---|---|
| Tinta | `#101414` | Fondo oscuro e identidad del isotipo |
| Magenta | `#D65EE8` | Acento emocional de marca |
| Coral | `#FF7B9C` | Acento de interacción y continuidad |
| Ámbar | `#FFB83F` | Acento cálido, usado con moderación |
| Fondo claro | `#F7F6F2` | Lienzo de la app en tema claro |
| Superficie oscura | `#191E1C` | Paneles en tema oscuro |
| Acción principal | `#913A9D` | Botones y texto que requieren contraste |

El gradiente del logotipo se conserva en acentos y titulares. Los controles principales usan un tono más oscuro para mantener el texto legible.

## Adaptación por plataforma

- Web y teléfonos: diseño fluido, safe areas de iOS, controles táctiles de al menos 44 px y una navegación inferior para Inicio, Ánimo, Diario, Tendencias y Perfil.
- Wear OS: pantalla desplazable, contenido centrado, márgenes basados en el ancho disponible y lectura voluntaria puntual. La escala de ánimo continúa siendo independiente del pulso.
- Accesibilidad: el texto hereda el escalado del sistema; los botones conservan nombres accesibles y foco visible; las animaciones respetan movimiento reducido. Verificar lector de pantalla y el contraste de todos los estados en dispositivos físicos antes de publicación.

## Referencias de implementación

- Web: `frontend/src/index.css` y `frontend/tailwind.config.js`.
- App móvil: `frontend/capacitor.config.ts`; la app React compartida se empaqueta con Capacitor para Android y iOS.
- Wear OS: `wearos/app/src/main/java/app/moodlog/wear/MainActivity.java`.
