# 📚 Centro de Documentación — Mood Log App

> **"El Strava del Bienestar Emocional" + Diario Íntimo & Confidente IA**

Bienvenido a la documentación oficial y actualizada de **Mood Log App**. Este repositorio alberga la plataforma de registro y análisis de bienestar mental, diseñada con un enfoque Mobile-First, privacidad estricta y visión de cuantificación biométrica.

---

## 🧭 Mapa de Documentación

La documentación se organiza de forma integral en cuatro áreas clave:

```
docs/
├── README.md                          # Este índice central
├── product/                           # Visión de negocio, producto y experiencia de usuario
│   ├── vision-and-roadmap.md          # Propuesta de valor, pilares y fases de evolución
│   ├── user-guide.md                  # 📱 Manual funcional pantalla a pantalla (Product Tour)
│   ├── user-flows.md                  # 🔄 Flujos de usuario y diagramas de secuencia
│   ├── glossary.md                    # 📖 Glosario de términos para no expertos
│   ├── wearables-and-biometrics.md    # Integración con sensores de pulso y HRV (Fase Strava)
│   └── crisis-protocol.md             # Protocolo de contención responsable y recursos de ayuda
├── architecture/                      # Arquitectura de software, datos y seguridad
│   ├── overview.md                    # Diagrama del sistema, frontend PWA y Firebase
│   ├── database-schema.md             # Esquema detallado de Firestore y modelos de datos
│   └── security-and-privacy.md        # Reglas de seguridad, aislamiento y cifrado del diario
├── development/                       # Guías para desarrolladores
│   ├── getting-started.md             # Instalación, configuración local y variables de entorno
│   ├── deployment-guide.md            # Despliegue en Vercel y Firebase
│   ├── code-standards.md              # Estándares de TypeScript, estilos y convenciones
│   └── troubleshooting-and-faq.md     # ❓ Preguntas frecuentes y solución de problemas
└── mobile/                            # Estrategia móvil
    └── mobile-strategy.md             # PWA, navegación inferior (Bottom Bar) y Capacitor
```

---

## 📌 Estado del proyecto (10 de octubre de 2026)

- **Dirección del producto**: la documentación de visión propone centrar el producto en seguimiento personal del ánimo, diario privado y confidente IA, retirando el módulo profesional. Revisa el código y los cambios locales antes de considerar completada esa transición.
- **Rama histórica**: en el repositorio inspeccionado existe `backup-version-universitaria`; verifica que esté respaldada y actualizada antes de eliminar o reescribir historia.
- **Estado de validación**: en el workspace revisado, `npm run build` falla por un import a `CountrySelector`, archivo que ya no está en el árbol. `npm run typecheck` también reporta errores. No afirmar que una compilación está limpia hasta volver a ejecutar ambos comandos y obtener éxito.
- **Seguridad**: las reglas locales de Firestore y Storage son más restrictivas que las anteriores, pero falta verificar que las consultas/CRUD de la app coincidan con las reglas y probarlas con usuarios diferentes y Firebase Emulator Suite. Las reglas locales tampoco prueban qué está desplegado en Firebase Console.
- **Acceso privado**: la confidencialidad del código, del sitio de Vercel y de los proyectos Firebase requiere permisos y controles configurados en cada proveedor; una declaración en documentación no los aplica automáticamente.

---

## 🚀 Enlaces Rápidos Según tu Perfil

### Si es tu primera vez aquí o no tienes perfil técnico:
- Empieza por entender los conceptos básicos: 👉 [Glosario de Términos](product/glossary.md)
- Descubre qué hace la app pantalla por pantalla: 👉 [Manual de Usuario y Pantallas](product/user-guide.md)
- Conoce la visión y el concepto "Strava": 👉 [Visión de Producto y Roadmap](product/vision-and-roadmap.md)
- Respuestas a preguntas comunes: 👉 [Preguntas Frecuentes (FAQ)](development/troubleshooting-and-faq.md)

### Si eres Desarrollador o Diseñador:
- Instalación local, acceso privado y variables: 👉 [Guía interna de instalación local y variables](development/getting-started.md)
- Comprender la arquitectura y stack: 👉 [Visión General de Arquitectura](architecture/overview.md)
- Estructura de Firestore e índices: 👉 [Esquema de Base de Datos](architecture/database-schema.md)
- Despliegue en Vercel y reglas: 👉 [Guía de Despliegue](development/deployment-guide.md)
