@echo off
REM Script para generar claves de firma para Google Play Store

echo 🔐 Generando claves de firma para Mood Log App...
echo.

REM Crear directorio para claves si no existe
if not exist "android\app\keystore" mkdir "android\app\keystore"

echo Generando keystore...
keytool -genkey -v -keystore android\app\keystore\mood-log-release-key.keystore -alias mood-log-key -keyalg RSA -keysize 2048 -validity 10000

echo.
echo ✅ Keystore generado exitosamente!
echo.
echo 📋 Información importante:
echo    - Archivo: android\app\keystore\mood-log-release-key.keystore
echo    - Alias: mood-log-key
echo    - Validez: 10000 días
echo.
echo ⚠️  IMPORTANTE: Guarda esta información de forma segura:
echo    - Contraseña del keystore
echo    - Contraseña de la clave
echo    - Información personal ingresada
echo.
echo 📝 Próximos pasos:
echo    1. Configurar signingConfigs en build.gradle
echo    2. Crear archivo keystore.properties
echo    3. Construir APK firmado
echo    4. Subir a Google Play Console
echo.
pause
