# 📱 Mood Log App - Android

Esta guía te ayudará a construir y publicar la aplicación Mood Log en Google Play Store.

## 🚀 Construcción Rápida

### 1. Generar Claves de Firma
```bash
# Ejecutar script para generar keystore
generate-keystore.bat
```

### 2. Configurar Claves
```bash
# Copiar archivo de ejemplo
copy android\keystore.properties.example android\keystore.properties

# Editar android\keystore.properties con tus contraseñas
```

### 3. Construir APK de Producción
```bash
# Ejecutar script de construcción
build-release-apk.bat
```

## 📋 Requisitos

### Sistema
- **Java 11+** (requerido para Gradle 8+)
- **Android SDK** (recomendado: Android Studio)
- **Node.js** (para construir el proyecto web)

### Archivos de Configuración
- `android/keystore.properties` - Configuración de claves
- `android/app/keystore/mood-log-release-key.keystore` - Archivo de claves

## 🔧 Configuración Detallada

### 1. Instalar Java 11+
```bash
# Verificar versión actual
java -version

# Si tienes Java 8, instalar Java 11+ desde:
# https://www.oracle.com/java/technologies/downloads/
```

### 2. Generar Keystore
```bash
# Ejecutar el script
generate-keystore.bat

# O manualmente:
keytool -genkey -v -keystore android\app\keystore\mood-log-release-key.keystore -alias mood-log-key -keyalg RSA -keysize 2048 -validity 10000
```

### 3. Configurar keystore.properties
```properties
storeFile=keystore/mood-log-release-key.keystore
storePassword=TU_CONTRASEÑA_DEL_KEYSTORE
keyAlias=mood-log-key
keyPassword=TU_CONTRASEÑA_DE_LA_CLAVE
```

## 🏗️ Construcción Manual

### Paso a Paso
```bash
# 1. Construir proyecto web
npm run build

# 2. Sincronizar con Capacitor
npx cap sync

# 3. Construir APK de producción
cd android
./gradlew assembleRelease
```

### Archivos Generados
- `android/app/build/outputs/apk/release/app-release.apk`

## 📱 Google Play Store

### Preparación
1. **Crear cuenta de desarrollador** en Google Play Console
2. **Configurar aplicación** con metadatos
3. **Subir APK** firmado
4. **Configurar tienda** (descripción, screenshots, etc.)

### Metadatos
Ver archivo `GOOGLE_PLAY_METADATA.md` para información completa.

### Screenshots Requeridos
- **Teléfono**: 320-3840px de altura
- **Tablet 7"**: 320-3840px de altura  
- **Tablet 10"**: 320-3840px de altura

## 🔍 Debugging

### Logs
```bash
# Ver logs en tiempo real
adb logcat | grep "Mood Log"

# Filtrar por aplicación
adb logcat | grep "com.moodlog.app"
```

### Probar APK
```bash
# Instalar en dispositivo conectado
adb install android/app/build/outputs/apk/release/app-release.apk

# O usar Android Studio
npx cap open android
```

## ⚠️ Problemas Comunes

### Java Version Error
```
Error: Dependency requires at least JVM runtime version 11
```
**Solución**: Instalar Java 11 o superior

### Keystore Not Found
```
Error: keystore.properties not found
```
**Solución**: 
1. Ejecutar `generate-keystore.bat`
2. Configurar `keystore.properties`

### Build Failed
```
Error: Build failed
```
**Solución**:
1. Verificar Java version
2. Limpiar proyecto: `./gradlew clean`
3. Reconstruir: `./gradlew assembleRelease`

## 📚 Recursos

- [Google Play Console](https://play.google.com/console)
- [Android Developer Guide](https://developer.android.com/)
- [Capacitor Android](https://capacitorjs.com/docs/android)
- [Gradle Build System](https://gradle.org/)

## 🎯 Checklist para Publicación

- [ ] Java 11+ instalado
- [ ] Keystore generado y configurado
- [ ] APK de producción construido
- [ ] APK probado en dispositivos
- [ ] Metadatos preparados
- [ ] Screenshots creados
- [ ] Política de privacidad actualizada
- [ ] Cuenta de desarrollador creada
- [ ] APK subido a Google Play Console
- [ ] Información de tienda completada
- [ ] Aplicación publicada

---

**¡Tu aplicación Mood Log está lista para Google Play Store!** 🎉
