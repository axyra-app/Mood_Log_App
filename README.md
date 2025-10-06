# 🧠 Mood Log App - Aplicación de Seguimiento Emocional

Una aplicación web progresiva (PWA) profesional para el seguimiento del estado de ánimo con inteligencia artificial, que conecta usuarios con psicólogos profesionales.

## ✨ **Características Principales**

### **Para Usuarios** 👥

- **Registro de Estado de Ánimo**: Flujo intuitivo paso a paso
- **Análisis con IA**: Análisis emocional profesional con múltiples personalidades
- **Dashboard Personal**: Estadísticas y seguimiento de progreso
- **Chat con Psicólogos**: Comunicación directa con profesionales
- **PWA Completa**: Instalable y funciona offline

### **Para Psicólogos** 👨‍⚕️

- **Gestión de Pacientes**: Dashboard profesional completo
- **Sistema de Alertas**: Detección automática de crisis
- **Calendario de Citas**: Gestión integral de citas
- **Analytics Avanzados**: Análisis detallado del progreso
- **Chat Integrado**: Comunicación en tiempo real

## 🛠️ **Tecnologías**

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **IA**: OpenAI GPT-4 para análisis emocional
- **UI**: Tailwind CSS + Lucide React
- **PWA**: Vite PWA Plugin

## 🚀 **Instalación y Desarrollo**

### **Prerrequisitos**

- Node.js 18+
- npm o yarn
- Cuenta de Firebase

### **Configuración**

1. **Clona el repositorio**

```bash
git clone <repository-url>
cd mood-log-app
```

2. **Instala las dependencias**

```bash
npm install
```

3. **Configura Firebase**

   - Las credenciales ya están configuradas en `src/services/firebase.ts`
   - Ver `FIREBASE-SETUP.md` para detalles de configuración

4. **Ejecuta el servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔧 **Configuración de Firebase**

### **Desplegar Reglas e Índices:**

```bash
# Desplegar reglas de Firestore
firebase deploy --only firestore:rules

# Desplegar índices de Firestore
firebase deploy --only firestore:indexes

# Desplegar todo
firebase deploy
```

Ver `FIREBASE-SETUP.md` para configuración completa.

## 📱 **PWA**

La aplicación es una PWA completa:

- **Instalable**: Los usuarios pueden instalar la app desde el navegador
- **Offline**: Funciona sin conexión a internet
- **Notificaciones**: Sistema de notificaciones push

## 🧠 **Sistema de IA**

### **Personalidades de IA:**

- **Dr. Elena**: Psicóloga clínica compasiva
- **Coach Miguel**: Coach motivador y práctico
- **Dra. Sofia**: Neurocientífica analítica
- **Mentor Carlos**: Terapeuta humanista reflexivo
- **Guía Ana**: Terapeuta artística creativa

### **Análisis Multidimensional:**

- **Emocional**: Detección de emociones primarias y secundarias
- **Conductual**: Patrones de comportamiento y desencadenantes
- **Contextual**: Análisis basado en tiempo y actividades
- **Predictivo**: Predicción de estados de ánimo futuros

## 🚨 **Sistema de Alertas**

### **Detección Automática de Crisis:**

- Estado de ánimo ≤ 1.5: **ALTO RIESGO**
- Emociones preocupantes: 'hopelessness', 'despair', 'suicidal'
- Aislamiento social + mood bajo: **RIESGO MEDIO**
- Disturbios del sueño ≤ 3: **RIESGO MEDIO**
- Estrés ≥ 8: **RIESGO MEDIO**

## 📊 **Estructura del Proyecto**

Ver `PROJECT_STRUCTURE.md` para la estructura completa y detallada.

**Estructura simplificada:**
```
src/
├── 📁 components/          # Componentes reutilizables
│   ├── 📁 auth/          # Autenticación
│   ├── 📁 psychologist/  # Componentes para psicólogos
│   └── 📁 ui/            # Componentes de interfaz básicos
├── 📁 services/          # Servicios (Firebase, IA, APIs)
├── 📁 contexts/          # Contextos de React
├── 📁 hooks/            # Custom hooks personalizados
├── 📁 pages/            # Páginas principales de la app
├── 📁 types/            # Definiciones TypeScript
├── 📁 utils/            # Utilidades y helpers
└── 📁 config/           # Configuraciones
```

## 🔒 **Seguridad**

- **Autenticación Firebase**: Sistema seguro de autenticación
- **Reglas de Firestore**: Protección de datos sensibles
- **Roles diferenciados**: Usuario regular vs Psicólogo
- **Encriptación**: Datos protegidos en tránsito y en reposo

## 🚀 **Despliegue**

### **Vercel (Recomendado)**

1. Conectar repositorio con Vercel
2. Desplegar automáticamente
3. La aplicación estará disponible en tu dominio de Vercel

### **Firebase Hosting**

```bash
npm run build
firebase deploy --only hosting
```

## 📈 **Roadmap**

- [ ] Notificaciones push avanzadas
- [ ] Integración con calendarios externos
- [ ] Reportes avanzados para psicólogos
- [ ] Modo offline completo
- [ ] Integración con wearables
- [ ] Análisis de patrones avanzados

## 🤝 **Contribución**

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 **Soporte**

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles específicos

---

**Mood Log App** - Tu compañero personal para el bienestar mental 💙
