# Flujo de Trabajo de Ramas - Mood Log App

## Estructura de Ramas

### 🌟 **main** 
- **Propósito**: Código más estable y funcional
- **Uso**: Solo para releases y código completamente probado
- **Acceso**: Solo administradores pueden hacer push directo

### 🚀 **DEV** 
- **Propósito**: Desarrollo activo y cambios más arriesgados
- **Uso**: Donde los compañeros de proyecto van a estar programando
- **Acceso**: Todos los desarrolladores pueden hacer push

### 🧪 **test** 
- **Propósito**: Pruebas del código unificado con los nuevos cambios
- **Uso**: Para testing antes de mergear a main
- **Acceso**: Solo para testing, no para desarrollo activo

## Flujo de Trabajo Recomendado

### Para Desarrollo Diario:
1. **Crear feature branch desde DEV**:
   ```bash
   git checkout DEV
   git pull origin DEV
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Desarrollar y hacer commits**:
   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   ```

3. **Mergear a DEV**:
   ```bash
   git checkout DEV
   git merge feature/nueva-funcionalidad
   git push origin DEV
   git branch -d feature/nueva-funcionalidad
   ```

### Para Testing:
1. **Mergear DEV a test**:
   ```bash
   git checkout test
   git pull origin test
   git merge DEV
   git push origin test
   ```

2. **Probar en test branch**

### Para Release:
1. **Mergear test a main** (solo cuando esté completamente probado):
   ```bash
   git checkout main
   git pull origin main
   git merge test
   git push origin main
   ```

## Reglas Importantes

- ❌ **NO** hacer push directo a `main`
- ❌ **NO** crear ramas desde `main` para desarrollo
- ✅ **SÍ** usar `DEV` como base para todas las nuevas funcionalidades
- ✅ **SÍ** usar `test` para probar antes de release
- ✅ **SÍ** mantener `main` siempre estable

## Comandos Útiles

```bash
# Ver todas las ramas
git branch -a

# Cambiar a DEV
git checkout DEV

# Actualizar DEV con los últimos cambios
git pull origin DEV

# Crear nueva rama de feature
git checkout -b feature/nombre-funcionalidad

# Ver estado de las ramas
git status
```

## Notas

- Las ramas de Dependabot han sido eliminadas para mantener el repositorio limpio
- Solo mantenemos las 3 ramas principales: `main`, `DEV`, `test`
- Todos los desarrolladores trabajan principalmente en `DEV`
