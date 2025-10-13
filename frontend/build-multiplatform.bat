@echo off

REM Script para construir la aplicación Mood Log multiplataforma en Windows

echo 🚀 Construyendo Mood Log App Multiplataforma...

REM Construir el proyecto web
echo 📦 Construyendo proyecto web...
npm run build

REM Sincronizar con Capacitor
echo 🔄 Sincronizando con Capacitor...
npx cap sync

REM Generar iconos y splash screens
echo 🎨 Generando iconos y splash screens...
npx @capacitor/assets generate

echo ✅ Construcción completada!
echo.
echo 📱 Para construir Android APK (requiere Java 11+):
echo    cd android ^&^& .\gradlew assembleDebug
echo.
echo 🍎 Para construir iOS (requiere macOS y Xcode):
echo    npx cap open ios
echo.
echo 🌐 Para desarrollo web:
echo    npm run dev
echo.
echo 📋 Instrucciones completas:
echo    1. Instala Java 11+ para Android
echo    2. Instala Android Studio para desarrollo Android
echo    3. Usa macOS + Xcode para iOS
echo    4. El proyecto web ya funciona en Vercel
