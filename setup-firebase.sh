#!/bin/bash

# Script de configuración de Firebase
# Mood Log App

echo "🔥 Configurando Firebase para Mood Log App..."

# Verificar que Firebase CLI esté instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI no está instalado. Instalando..."
    npm install -g firebase-tools
fi

# Login en Firebase
echo "🔐 Verificando login en Firebase..."
firebase login

# Crear proyecto de Firebase
echo "📝 Creando proyecto de Firebase..."
echo "Por favor, ve a https://console.firebase.google.com y crea un nuevo proyecto llamado 'mood-log-app-2024'"
echo "Una vez creado, presiona Enter para continuar..."
read

# Configurar proyecto
echo "⚙️ Configurando proyecto..."
cd backend
firebase use --add

# Habilitar servicios
echo "🚀 Habilitando servicios de Firebase..."
echo "Por favor, habilita los siguientes servicios en la consola de Firebase:"
echo "1. Authentication (Email/Password)"
echo "2. Firestore Database"
echo "3. Hosting"
echo "Una vez habilitados, presiona Enter para continuar..."
read

# Deploy inicial
echo "🚀 Realizando deploy inicial..."
firebase deploy

echo "✅ Configuración de Firebase completada!"
echo "Tu proyecto está listo para usar Firebase!"

