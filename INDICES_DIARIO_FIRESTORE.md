# ÍNDICES DE FIRESTORE PARA MOOD LOG APP - DIARIO

## 📝 ÍNDICES PARA JOURNAL ENTRIES

### 1. Índice Compuesto Principal (journalEntries)

```json
{
  "collectionGroup": "journalEntries",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "date",
      "order": "DESCENDING"
    }
  ]
}
```

### 2. Índice para Filtros por Usuario y Tags

```json
{
  "collectionGroup": "journalEntries",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "tags",
      "arrayConfig": "CONTAINS"
    },
    {
      "fieldPath": "date",
      "order": "DESCENDING"
    }
  ]
}
```

### 3. Índice para Filtros por Usuario y Estado de Ánimo

```json
{
  "collectionGroup": "journalEntries",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "mood",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "date",
      "order": "DESCENDING"
    }
  ]
}
```

### 4. Índice para Filtros por Usuario y Privacidad

```json
{
  "collectionGroup": "journalEntries",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "isPrivate",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "date",
      "order": "DESCENDING"
    }
  ]
}
```

## 📋 ÍNDICES PARA JOURNAL TEMPLATES

### 5. Índice para Templates por Categoría

```json
{
  "collectionGroup": "journalTemplates",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "category",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

### 6. Índice para Templates por Usuario

```json
{
  "collectionGroup": "journalTemplates",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "createdBy",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

## 💡 ÍNDICES PARA JOURNAL PROMPTS

### 7. Índice para Prompts por Categoría

```json
{
  "collectionGroup": "journalPrompts",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "category",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "difficulty",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

### 8. Índice para Prompts por Dificultad

```json
{
  "collectionGroup": "journalPrompts",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "difficulty",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "estimatedTime",
      "order": "ASCENDING"
    }
  ]
}
```

## 🔍 ÍNDICES ADICIONALES PARA BÚSQUEDAS

### 9. Índice para Búsqueda de Texto (si implementas búsqueda)

```json
{
  "collectionGroup": "journalEntries",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "title",
      "order": "ASCENDING"
    }
  ]
}
```

### 10. Índice para Filtros por Rango de Fechas

```json
{
  "collectionGroup": "journalEntries",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

## 📊 ÍNDICES PARA ESTADÍSTICAS DEL DIARIO

### 11. Índice para Estadísticas por Usuario y Mes

```json
{
  "collectionGroup": "journalEntries",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "mood",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "energy",
      "order": "ASCENDING"
    }
  ]
}
```

### 12. Índice para Análisis de Actividades

```json
{
  "collectionGroup": "journalEntries",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "activities",
      "arrayConfig": "CONTAINS"
    },
    {
      "fieldPath": "date",
      "order": "DESCENDING"
    }
  ]
}
```

## 🚀 CÓMO IMPLEMENTAR ESTOS ÍNDICES

### Opción 1: Firebase Console (Recomendado)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `mood-log-app-01`
3. Ve a **Firestore Database** → **Índices**
4. Haz clic en **Crear índice**
5. Copia y pega cada configuración JSON

### Opción 2: Firebase CLI

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar proyecto
firebase init firestore

# Crear archivo firestore.indexes.json
# Copiar las configuraciones JSON arriba

# Desplegar índices
firebase deploy --only firestore:indexes
```

### Opción 3: Archivo firestore.indexes.json

Crea un archivo `firestore.indexes.json` en la raíz del proyecto con todas las configuraciones.

## ⚡ ÍNDICES PRIORITARIOS (Crear primero)

1. **Índice Principal** (#1) - Para consultas básicas del diario
2. **Templates por Categoría** (#5) - Para cargar plantillas
3. **Prompts por Categoría** (#7) - Para cargar prompts

## 📝 NOTAS IMPORTANTES

- Los índices pueden tardar varios minutos en construirse
- Firebase te mostrará un enlace directo cuando necesites crear un índice específico
- Los índices compuestos son más costosos pero más eficientes
- Considera el costo vs beneficio para cada índice

¿Te ayudo a crear alguno de estos índices específicos o necesitas más detalles sobre algún índice en particular?
