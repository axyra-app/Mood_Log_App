# 📱 Mood Log App - Multiplataforma

Esta aplicación está configurada para funcionar en múltiples plataformas usando **Capacitor**.

## 🌐 Plataformas Soportadas

- ✅ **Web** - Funcionando en Vercel
- 📱 **Android** - APK nativo
- 🍎 **iOS** - App Store
- 💻 **PWA** - Progressive Web App

## 🚀 Construcción Rápida

### Windows

```bash
build-multiplatform.bat
```

### Linux/macOS

```bash
./build-multiplatform.sh
```

## 📱 Android

### Requisitos

- Java 11 o superior
- Android Studio (recomendado)
- Android SDK

### Construir APK

```bash
# Construir proyecto web
npm run build

# Sincronizar con Capacitor
npx cap sync

# Construir APK
cd android
./gradlew assembleDebug
```

El APK se generará en: `android/app/build/outputs/apk/debug/app-debug.apk`

### Abrir en Android Studio

```bash
npx cap open android
```

## 🍎 iOS

### Requisitos

- macOS
- Xcode
- CocoaPods

### Construir para iOS

```bash
# Construir proyecto web
npm run build

# Sincronizar con Capacitor
npx cap sync

# Abrir en Xcode
npx cap open ios
```

## 🌐 Web

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
```

## 🎨 Iconos y Splash Screens

Los iconos se generan automáticamente desde `resources/icon.png`:

```bash
npx @capacitor/assets generate
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/                    # Código fuente React
├── dist/                   # Build web
├── android/                # Proyecto Android nativo
├── ios/                    # Proyecto iOS nativo
├── resources/              # Iconos y assets
├── capacitor.config.ts     # Configuración Capacitor
└── package.json           # Dependencias
```

## 🔧 Configuración

### Capacitor Config (`capacitor.config.ts`)

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moodlog.app',
  appName: 'Mood Log App',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
```

## 📦 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Desarrollo web
npm run dev

# Construir web
npm run build

# Sincronizar con plataformas nativas
npx cap sync

# Generar iconos
npx @capacitor/assets generate

# Abrir Android Studio
npx cap open android

# Abrir Xcode
npx cap open ios

# Ejecutar en dispositivo Android
npx cap run android

# Ejecutar en dispositivo iOS
npx cap run ios
```

## 🚀 Despliegue

### Web

- ✅ **Vercel**: Despliegue automático desde GitHub
- ✅ **Firebase Hosting**: `firebase deploy --only hosting`

### Android

1. Construir APK: `cd android && ./gradlew assembleDebug`
2. Firmar APK para producción
3. Subir a Google Play Store

### iOS

1. Abrir en Xcode: `npx cap open ios`
2. Configurar certificados de desarrollo
3. Construir y subir a App Store Connect

## 🔍 Debugging

### Android

```bash
# Ver logs en tiempo real
adb logcat | grep "Mood Log"
```

### iOS

```bash
# Ver logs en Xcode
# Window > Devices and Simulators > View Device Logs
```

## 📚 Recursos

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Development](https://developer.android.com/)
- [iOS Development](https://developer.apple.com/ios/)
- [React Documentation](https://reactjs.org/docs)

## 🎯 Próximos Pasos

1. **Instalar Java 11+** para construir Android
2. **Instalar Android Studio** para desarrollo Android
3. **Configurar certificados** para firmar APKs
4. **Probar en dispositivos** reales
5. **Optimizar rendimiento** para móviles
6. **Agregar plugins nativos** según necesidades

---

**¡Tu aplicación Mood Log está lista para ser multiplataforma!** 🎉
