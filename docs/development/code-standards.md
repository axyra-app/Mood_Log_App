# 📏 Estándares de Código y Buenas Prácticas

## 1. Convenciones de TypeScript

El proyecto tiene activadas las reglas de rigor máximo en `tsconfig.json`:
- `"strict": true`
- `"noUnusedLocals": true`
- `"noUnusedParameters": true`

### Reglas Esenciales:
1. **Sin variables ni imports sin usar:** El compilador de TypeScript fallará de inmediato si se deja una variable o importación no referenciada.
2. **Tipado explícito en callbacks y colecciones:** Evitar `any` siempre que sea posible. Utilizar las interfaces definidas en `src/types/index.ts`.
3. **Parámetros intencionalmente ignorados:** Si una función de interfaz o callback requiere un parámetro que no vas a utilizar en el cuerpo, prefíjalo con un guion bajo (ej. `_index`, `_error`).

```typescript
// ❌ Incorrecto:
const result = items.map((item, index) => item.score); // 'index' provocará TS6133

// ✅ Correcto:
const result = items.map((item) => item.score);
// O si es requerido por firma:
const result = items.map((item, _index) => item.score);
```

---

## 2. Estructura de Componentes React

- Usar componentes funcionales con sintaxis moderna `React.FC<Props>` o función tipada directa.
- Mantener los componentes desacoplados de la lógica de datos mediante hooks personalizados (`useMood`, `useJournal`, `useAuth`).
- Manejar siempre estados de carga (`loading`) y error (`error`) para evitar pantallas en blanco o "flickering".

---

## 3. Estilos con Tailwind CSS y Modo Oscuro

- Todas las clases visuales deben utilizar utilidades de Tailwind CSS.
- **Soporte de Modo Oscuro obligatorio:** Cada elemento visible debe contemplar su variante nocturna con el prefijo `dark:`.

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
  <h3 className="font-semibold text-lg">Mi Registro</h3>
</div>
```

---

## 4. Convención de Mensajes de Commit (Conventional Commits)

Utilizar el estándar semántico en los commits:
- `feat:` Nueva funcionalidad para el usuario final (ej. `feat(mobile): add bottom navigation bar`)
- `fix:` Corrección de un error en código existente (ej. `fix(auth): handle null displayName`)
- `refactor:` Limpieza o reestructuración de código sin alterar el comportamiento
- `docs:` Cambios o adiciones a la documentación en `docs/`
- `chore:` Tareas rutinarias, dependencias o configuración de build
