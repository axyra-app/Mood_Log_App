# Estrategia móvil

## Estado actual

El frontend es una SPA responsive en React/Vite con `vite-plugin-pwa`. Se añadió Capacitor 8 para reutilizar ese frontend como contenedor nativo Android e iOS sin duplicar las pantallas existentes. El identificador configurado es `com.moodlog.app`; los proyectos nativos viven en `frontend/android/` y `frontend/ios/`.

La navegación inferior compacta aparece en las rutas protegidas del teléfono (Inicio, Ánimo, Diario, Tendencias y Perfil). El shell respeta las safe areas, el teclado y el modo claro/oscuro. Android desactiva copias de seguridad automáticas de los datos de la app. Los iconos y pantallas de inicio nativos se generan desde `frontend/assets/logo.svg` mediante `npm run mobile:assets`.

El proyecto Android se generó y su variante debug compiló en este equipo Windows. El proyecto Xcode de iOS y sus recursos también se generaron; compilar, ejecutar en simulador iPhone, firmar y distribuir iOS debe hacerse en macOS con Xcode 26 o posterior. Esa compilación no se ha realizado aquí.

La app móvil comparte el frontend y sus servicios actuales; Capacitor no convierte automáticamente una vista web en una app offline ni añade permisos nativos de salud. El acceso al sensor del reloj sigue siendo una app Wear OS separada, desarrollada con Health Services.

Los proyectos nativos son fuentes versionables; los productos de Gradle, CocoaPods, Xcode y el SDK local están ignorados. Comandos útiles desde `frontend/`:

```powershell
npm run mobile:assets
npm run mobile:sync
npm run mobile:open:android
npm run mobile:open:ios
```

`mobile:sync` compila con el modo `mobile` y copia el bundle a ambas plataformas. Configura el archivo ignorado `frontend/.env.mobile.local` con los valores `VITE_FIREBASE_*` del proyecto real, `VITE_USE_FIREBASE_EMULATORS=false` y `VITE_API_BASE_URL` con el origen HTTPS de las funciones Vercel. La app nativa usa ese origen para `/api/*`; las funciones permiten los orígenes locales de Capacitor y validan el token como antes. Nunca pongas credenciales de Firebase Admin o Groq en variables `VITE_*` ni en el bundle.

Los builds de distribución se detienen si la configuración apunta a Firebase Emulator o al proyecto local `demo-mood-log-local`; configura primero un proyecto real de staging/producción. La clave de carga Android se creó en `%USERPROFILE%\\.android\\moodlog-upload.jks`, fuera del repositorio. Para generar el AAB firmado desde PowerShell, ejecuta `frontend/scripts/buildSignedAndroidRelease.ps1`; el script pide las contraseñas con entrada oculta y no las guarda en archivos del repositorio. Aún no se ha generado ni subido el AAB firmado. En un Mac, `mobile:open:ios` abre el proyecto para configuración, simulador y firma. No se han configurado credenciales de App Store Connect.

## Ruta Android/Wear OS priorizada

El fundador priorizó Wear OS/Android y pidió llevar Mood Log al reloj para registrar pulsaciones junto al ánimo. Existe una app nativa en `wearos/` (paquete `app.moodlog.wear`) con check-in manual y una lectura puntual de frecuencia cardíaca iniciada por la persona mediante `MeasureClient`. La muestra se presenta en pantalla, no se guarda ni se sincroniza. El 20-11-2026 compiló e instaló en el AVD Wear OS 6/API 36 `MoodLogWearOS36`; la pantalla se ajusta al área circular y puede desplazarse. Aún falta probar sensores en dispositivos físicos y desarrollar la persistencia local longitudinal acordada antes de usarla con participantes.

Health Connect en el teléfono es una vía complementaria para consultar historial que una app de reloj ya haya escrito allí; no es una app de Mood Log en el smartwatch y no garantiza que un fabricante publique esas muestras. La app móvil podrá importarlas en primer plano tras permiso, solo después de probar modelos y versiones concretas. Lectura pasiva Wear OS también queda para otra etapa porque sus lotes no tienen frecuencia fija y deben evaluarse consumo y permisos.

Después del prototipo del reloj se decidirá el puente de sincronización al teléfono (Wear OS Data Layer, autenticación, almacenamiento local y borrado) antes de conectar el historial a la cuenta existente. No se asume que Capacitor convierta la PWA en una app de reloj; la app de reloj requiere integración nativa con Health Services. Ver [ADR-BIO-012](../features/biometric-context/decision-log.md#adr-bio-012-secuencia-de-integración-androidwear-os).
## Objetivo de experiencia

Facilitar consultas breves y voluntarias en teléfonos sin ocultar controles de privacidad ni forzar notificaciones o rachas. Las prioridades de diseño son:

- Formularios sencillos y legibles.
- Navegación predecible, con foco visible y soporte de teclado/lector de pantalla.
- Áreas táctiles adecuadas y contenido que se adapte a distintos tamaños.
- Estados explícitos de conexión, carga, error y guardado.
- Compatibilidad con safe areas y preferencias de movimiento/contraste.
- Sin divulgación de contenido íntimo en notificaciones, widgets o pantalla bloqueada.

## Navegación propuesta

Una barra inferior puede evaluarse como alternativa móvil después de consolidar las rutas actuales:

| Destino propuesto | Ruta existente | Observación |
|---|---|---|
| Inicio | `/dashboard` | Tab implementada. |
| Ánimo | `/mood-flow` | Tab implementada; check-in manual. |
| Diario | `/journal` | Tab implementada; evita exponer contenido en notificaciones. |
| Tendencias | `/statistics` | Tab implementada; resúmenes descriptivos. |
| Perfil | `/profile`, `/settings` | Tab implementada; ajustes se abren desde el perfil. |

La barra aparece en rutas protegidas cuando hay una sesión activa y se oculta en tablet/desktop.

## PWA y modo sin conexión

El service worker puede cachear recursos de aplicación. Esto no implica que Firebase funcione offline ni que los registros pendientes se sincronicen correctamente.

Antes de implementar offline se debe definir:

1. Qué datos pueden guardarse localmente y por cuánto tiempo.
2. Cifrado local y bloqueo en dispositivos compartidos.
3. Cola, reintentos, idempotencia y conflictos de edición/eliminación.
4. Indicadores de “pendiente”, “guardado” y error de sincronización.
5. Limpieza tras cerrar sesión, revocar consentimiento o borrar cuenta.
6. Pruebas sin red, cambio de cuenta, almacenamiento lleno y actualización de service worker.

No anunciar soporte offline de diarios ni datos emocionales hasta que se pruebe ese flujo completo.

## Aplicación nativa

Capacitor está integrado para empaquetar la experiencia web compartida en Android y iOS. Antes de una publicación en tiendas:

- Evaluar mantenimiento, plugins y requisitos de Apple App Store y Google Play.
- Revisar permisos, privacidad, autenticación, enlaces profundos y almacenamiento seguro.
- Probar compatibilidad y accesibilidad en dispositivos físicos.
- Definir actualización, soporte y distribución.
- Evaluar por separado el acceso a APIs de salud; un wrapper nativo no concede permisos automáticamente.

El proyecto iOS debe abrirse, compilarse, probarse y firmarse desde macOS/Xcode. El contenedor no otorga permisos de salud y la app de reloj sigue siendo nativa.

## Criterios de aceptación móvil

- Recorridos principales probados en tamaños y sistemas acordados.
- Formularios accesibles, sin desplazamiento horizontal y con foco visible.
- Navegación por teclado y lector de pantalla verificada.
- Estados de error y pérdida de conexión comprensibles.
- La instalación y actualización PWA comprobadas en cada navegador soportado.
- Ningún contenido personal se filtra en notificaciones o cachés sin decisión de privacidad.
