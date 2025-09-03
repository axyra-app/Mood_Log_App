# Script de configuración de Firebase
# Mood Log App

Write-Host "🔥 Configurando Firebase para Mood Log App..." -ForegroundColor Green

# Verificar que Firebase CLI esté instalado
if (!(Get-Command "firebase" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI no está instalado. Instalando..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Login en Firebase
Write-Host "🔐 Verificando login en Firebase..." -ForegroundColor Yellow
firebase login

# Crear proyecto de Firebase
Write-Host "📝 Creando proyecto de Firebase..." -ForegroundColor Yellow
Write-Host "Por favor, ve a https://console.firebase.google.com y crea un nuevo proyecto llamado 'mood-log-app-2024'" -ForegroundColor Cyan
Write-Host "Una vez creado, presiona Enter para continuar..." -ForegroundColor Cyan
Read-Host

# Configurar proyecto
Write-Host "⚙️ Configurando proyecto..." -ForegroundColor Yellow
cd backend
firebase use --add

# Habilitar servicios
Write-Host "🚀 Habilitando servicios de Firebase..." -ForegroundColor Yellow
Write-Host "Por favor, habilita los siguientes servicios en la consola de Firebase:" -ForegroundColor Cyan
Write-Host "1. Authentication (Email/Password)" -ForegroundColor White
Write-Host "2. Firestore Database" -ForegroundColor White
Write-Host "3. Hosting" -ForegroundColor White
Write-Host "Una vez habilitados, presiona Enter para continuar..." -ForegroundColor Cyan
Read-Host

# Deploy inicial
Write-Host "🚀 Realizando deploy inicial..." -ForegroundColor Yellow
firebase deploy

Write-Host "✅ Configuración de Firebase completada!" -ForegroundColor Green
Write-Host "Tu proyecto está listo para usar Firebase!" -ForegroundColor Green

