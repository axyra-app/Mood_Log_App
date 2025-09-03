# Script de deployment para Vercel
# Mood Log App

Write-Host "🚀 Iniciando deployment a Vercel..." -ForegroundColor Green

# Verificar que Vercel CLI esté instalado
if (!(Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI no está instalado. Instalando..." -ForegroundColor Red
    npm install -g vercel
}

# Verificar que las dependencias estén instaladas
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
npm run install-deps

# Build del proyecto
Write-Host "🔨 Construyendo proyecto..." -ForegroundColor Yellow
npm run build

# Verificar que el build fue exitoso
if (Test-Path "dist") {
    Write-Host "✅ Build exitoso!" -ForegroundColor Green
} else {
    Write-Host "❌ Error en el build. Verifica los logs." -ForegroundColor Red
    exit 1
}

# Deploy a Vercel
Write-Host "🌐 Desplegando a Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host "🎉 Deployment completado!" -ForegroundColor Green

