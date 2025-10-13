#!/bin/bash

# Script para construir la aplicación Mood Log multiplataforma

echo "🚀 Construyendo Mood Log App Multiplataforma..."

# Construir el proyecto web
echo "📦 Construyendo proyecto web..."
npm run build

# Sincronizar con Capacitor
echo "🔄 Sincronizando con Capacitor..."
npx cap sync

# Generar iconos y splash screens
echo "🎨 Generando iconos y splash screens..."
npx @capacitor/assets generate

echo "✅ Construcción completada!"
echo ""
echo "📱 Para construir Android APK:"
echo "   cd android && ./gradlew assembleDebug"
echo ""
echo "🍎 Para construir iOS (requiere macOS y Xcode):"
echo "   npx cap open ios"
echo ""
echo "🌐 Para desarrollo web:"
echo "   npm run dev"
