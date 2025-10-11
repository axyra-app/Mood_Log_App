# Configuración de Agentes de IA para Mood Log App

## 🤖 GROQ (RECOMENDADO - GRATIS)

### Cómo obtener tu API Key:
1. Ve a [groq.com](https://groq.com)
2. Regístrate con tu email
3. Ve a Dashboard → API Keys
4. Crea una nueva API Key
5. Copia la key (empieza con `gsk_`)

### Configuración:
```bash
# En tu archivo .env
VITE_GROQ_API_KEY=gsk_tu_api_key_aqui
```

### Límites gratuitos:
- ✅ **14,400 requests por día**
- ✅ **Sin límite de tiempo**
- ✅ **Modelos avanzados** (Llama 3.1, Mixtral)
- ✅ **Ultra rápido** (hasta 800 tokens/segundo)

---

## 🥈 OPENAI (ALTERNATIVA)

### Cómo obtener tu API Key:
1. Ve a [platform.openai.com](https://platform.openai.com)
2. Regístrate con tu email
3. Ve a API Keys → Create new secret key
4. Copia la key (empieza con `sk-`)

### Configuración:
```bash
# En tu archivo .env
VITE_OPENAI_API_KEY=sk-tu_api_key_aqui
```

### Límites gratuitos:
- ✅ **$5 USD gratis por mes**
- ✅ **Modelos GPT-3.5 incluidos**
- ✅ **API establecida**

---

## 🥉 OLLAMA (100% LOCAL - GRATIS)

### Instalación:
```bash
# Windows
winget install Ollama.Ollama

# O descarga desde ollama.com
```

### Uso:
```bash
# Instalar modelo
ollama pull llama3.1

# Ejecutar
ollama serve
```

### Configuración:
```bash
# En tu archivo .env
VITE_OLLAMA_URL=http://localhost:11434
```

---

## 🚀 IMPLEMENTACIÓN RÁPIDA

### 1. Crear archivo .env en frontend/
```bash
# Groq (Recomendado)
VITE_GROQ_API_KEY=gsk_tu_api_key_aqui

# O OpenAI
VITE_OPENAI_API_KEY=sk-tu_api_key_aqui
```

### 2. Los agentes ya están implementados en:
- `frontend/src/services/aiAgents.ts`

### 3. Funcionalidades incluidas:
- ✅ **Análisis de estado de ánimo**
- ✅ **Análisis de conversaciones**
- ✅ **Detección de crisis**
- ✅ **Recomendaciones personalizadas**

### 4. Uso en componentes:
```typescript
import { moodAnalysisAgent, chatAnalysisAgent } from '../services/aiAgents';

// Análisis de estado de ánimo
const analysis = await moodAnalysisAgent.analyzeMood(moodData);

// Análisis de conversaciones
const chatAnalysis = await chatAnalysisAgent.analyzeChat(chatData);
```

---

## 📊 COMPARACIÓN DE OPCIONES

| Característica | Groq | OpenAI | Ollama |
|----------------|------|--------|--------|
| **Costo** | Gratis | $5/mes | Gratis |
| **Velocidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Calidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Privacidad** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 RECOMENDACIÓN FINAL

**Para tu aplicación de salud mental, recomiendo GROQ porque:**

1. ✅ **Completamente gratuito**
2. ✅ **Ultra rápido** (importante para UX)
3. ✅ **Modelos avanzados** (Llama 3.1)
4. ✅ **Fácil de implementar**
5. ✅ **Sin límites de tiempo**

**Pasos para implementar:**
1. Regístrate en [groq.com](https://groq.com)
2. Obtén tu API Key
3. Agrega `VITE_GROQ_API_KEY=tu_key` al archivo .env
4. ¡Listo! Los agentes ya están funcionando
