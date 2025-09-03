#!/bin/bash

# Script de deployment para Vercel
# Mood Log App

echo "🚀 Iniciando deployment a Vercel..."

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado. Instalando..."
    npm install -g vercel
fi

# Verificar que las dependencias estén instaladas
echo "📦 Verificando dependencias..."
npm run install-deps

# Build del proyecto
echo "🔨 Construyendo proyecto..."
npm run build

# Verificar que el build fue exitoso
if [ -d "dist" ]; then
    echo "✅ Build exitoso!"
else
    echo "❌ Error en el build. Verifica los logs."
    exit 1
fi

# Deploy a Vercel
echo "🌐 Desplegando a Vercel..."
vercel --prod

echo "🎉 Deployment completado!"

