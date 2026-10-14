# Estándares de desarrollo

## TypeScript

`frontend/tsconfig.json` habilita `strict`, `noUnusedLocals`, `noUnusedParameters` y `noFallthroughCasesInSwitch`.

- Mantén tipos de parámetros, retornos y estructuras de datos explícitos cuando aclaren el contrato.
- Prefiere los tipos compartidos de `src/types/`, pero comprueba que describan realmente el modelo activo: aún existen tipos heredados que discrepan con servicios y pantallas.
- Evita `any` y aserciones innecesarias; valida los datos procedentes de Firestore antes de tratarlos como tipos internos.
- Elimina imports y variables que no uses. Si un callback exige un parámetro que no se utiliza, omítelo si la firma lo permite o prefija el identificador con `_`.

Los datos de Firestore son schemaless: una interfaz TypeScript no valida ni protege escrituras en tiempo de ejecución. Cambios de modelo deben considerar también reglas, consultas, índices y datos existentes.

## React y estado

- Mantén la interfaz en componentes y separa las operaciones de datos en hooks/servicios siguiendo los patrones existentes.
- Representa explícitamente estados de carga, error, vacío y éxito.
- Evita ocultar fallos de Firebase o IA con respuestas que parezcan exitosas; registra errores sin incluir contenido sensible del usuario.
- No dupliques modelos de chat o estado de ánimo: consulta [database-schema.md](../architecture/database-schema.md) y acuerda un contrato antes de ampliar un flujo.

## Estilos y accesibilidad

El proyecto usa Tailwind CSS y un contexto de tema. Conserva el estilo existente, contempla tema claro/oscuro donde el componente lo requiera y valida estados de foco, contraste, teclado y pantallas móviles.

## Seguridad y privacidad

- No confíes roles, propietarios ni permisos enviados por el cliente.
- En Firestore, deriva el `userId` de la sesión autenticada y manténlo inmutable.
- No incluyas notas, mensajes, datos de salud, secretos o tokens en logs, analytics o errores visibles.
- No uses variables `VITE_*` para secretos de servidor.
- Prueba las reglas para propietario, otro usuario y usuario anónimo antes de cambiar operaciones de datos.

## Validación

Desde `frontend/` ejecuta `npm run typecheck` y `npm run build`. Los workflows actuales no ejecutan typecheck ni hay scripts de test/lint definidos en `package.json`; agrega validaciones automatizadas como parte del trabajo que las introduzca y no reportes resultados que no hayas ejecutado.

## Commits

Se recomienda Conventional Commits:

- `feat:` funcionalidad nueva
- `fix:` corrección
- `refactor:` reestructuración sin cambio funcional intencionado
- `docs:` documentación
- `chore:` dependencias o configuración

Ejemplos: `feat(mood): add weekly trend filter`, `fix(auth): handle missing profile`, `docs(architecture): clarify Firestore access`.
