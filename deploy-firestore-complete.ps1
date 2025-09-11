# Script de despliegue completo de Firestore para producción
# Ejecutar: .\deploy-firestore-complete.ps1

Write-Host "🔥 DESPLEGANDO REGLAS E ÍNDICES DE FIRESTORE PARA PRODUCCIÓN" -ForegroundColor Red
Write-Host "================================================================" -ForegroundColor Yellow

# Verificar que Firebase CLI esté instalado
Write-Host "📋 Verificando Firebase CLI..." -ForegroundColor Cyan
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI encontrado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI no encontrado. Instalando..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Verificar que estemos en el directorio correcto
if (-not (Test-Path "firestore.rules")) {
    Write-Host "❌ No se encontró firestore.rules. Ejecuta desde el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "firestore.indexes.json")) {
    Write-Host "❌ No se encontró firestore.indexes.json. Ejecuta desde el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Verificar autenticación
Write-Host "🔐 Verificando autenticación de Firebase..." -ForegroundColor Cyan
try {
    firebase projects:list | Out-Null
    Write-Host "✅ Autenticado correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ No autenticado. Iniciando login..." -ForegroundColor Red
    firebase login
}

# Desplegar reglas de Firestore
Write-Host "📝 Desplegando reglas de Firestore..." -ForegroundColor Cyan
try {
    firebase deploy --only firestore:rules
    Write-Host "✅ Reglas de Firestore desplegadas correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error desplegando reglas de Firestore" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Desplegar índices de Firestore
Write-Host "📊 Desplegando índices de Firestore..." -ForegroundColor Cyan
try {
    firebase deploy --only firestore:indexes
    Write-Host "✅ Índices de Firestore desplegados correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error desplegando índices de Firestore" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Verificar estado del proyecto
Write-Host "🔍 Verificando estado del proyecto..." -ForegroundColor Cyan
try {
    firebase projects:list
    Write-Host "✅ Estado del proyecto verificado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No se pudo verificar el estado del proyecto" -ForegroundColor Yellow
}

Write-Host "🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Yellow
Write-Host "✅ Reglas de Firestore: DESPLEGADAS" -ForegroundColor Green
Write-Host "✅ Índices de Firestore: DESPLEGADOS" -ForegroundColor Green
Write-Host "✅ Aplicación lista para producción" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Yellow
Write-Host "🚀 Tu aplicación está lista para el mercado!" -ForegroundColor Magenta
