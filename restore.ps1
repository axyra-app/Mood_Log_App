# Restaurar la aplicación original
Write-Host "Restaurando la aplicación original..." -ForegroundColor Green

# Hacer checkout al commit con la aplicación completa
git checkout e967e72

# Crear una nueva rama
git checkout -b restore-original

# Hacer push de la nueva rama
git push origin restore-original

Write-Host "Aplicación restaurada en la rama 'restore-original'" -ForegroundColor Green
Write-Host "Puedes hacer checkout a esta rama para trabajar con tu aplicación original" -ForegroundColor Yellow
