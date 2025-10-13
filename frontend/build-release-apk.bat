@echo off
REM Script para construir APK de producción para Google Play Store

echo 🚀 Construyendo APK de producción para Mood Log App...
echo.

REM Verificar que existe keystore.properties
if not exist "android\keystore.properties" (
    echo ❌ Error: No se encontró android\keystore.properties
    echo.
    echo 📋 Pasos para configurar:
    echo    1. Copia keystore.properties.example a keystore.properties
    echo    2. Ejecuta generate-keystore.bat para generar las claves
    echo    3. Configura las contraseñas en keystore.properties
    echo.
    pause
    exit /b 1
)

REM Construir proyecto web
echo 📦 Construyendo proyecto web...
cd ..
npm run build
if %errorlevel% neq 0 (
    echo ❌ Error construyendo proyecto web
    pause
    exit /b 1
)

REM Sincronizar con Capacitor
echo 🔄 Sincronizando con Capacitor...
npx cap sync
if %errorlevel% neq 0 (
    echo ❌ Error sincronizando con Capacitor
    pause
    exit /b 1
)

REM Construir APK de producción
echo 🔨 Construyendo APK de producción...
cd android
.\gradlew assembleRelease
if %errorlevel% neq 0 (
    echo ❌ Error construyendo APK
    pause
    exit /b 1
)

echo.
echo ✅ APK de producción construido exitosamente!
echo.
echo 📱 Archivo generado:
echo    android\app\build\outputs\apk\release\app-release.apk
echo.
echo 📋 Próximos pasos:
echo    1. Probar el APK en dispositivos
echo    2. Subir a Google Play Console
echo    3. Configurar metadatos de la aplicación
echo    4. Publicar en Google Play Store
echo.
pause
