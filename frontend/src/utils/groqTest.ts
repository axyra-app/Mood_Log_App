// Archivo de prueba para verificar Groq
import Groq from 'groq-sdk';

// Función de prueba
export const testGroqConnection = async () => {
  try {
    const groq = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY,
      dangerouslyAllowBrowser: true
    });

    console.log('🔍 Probando conexión con Groq...');
    console.log('API Key configurada:', import.meta.env.VITE_GROQ_API_KEY ? '✅ Sí' : '❌ No');

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Eres un asistente de prueba.' },
        { role: 'user', content: 'Responde solo con "¡Conexión exitosa!"' }
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.1,
      max_tokens: 50
    });

    const result = response.choices[0]?.message?.content;
    console.log('✅ Respuesta de Groq:', result);
    return { success: true, message: result };
  } catch (error) {
    console.error('❌ Error conectando con Groq:', error);
    return { success: false, error: error.message };
  }
};

// Función para verificar configuración
export const checkGroqConfig = () => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    return {
      status: 'error',
      message: '❌ VITE_GROQ_API_KEY no está configurada en .env'
    };
  }
  
  if (!apiKey.startsWith('gsk_')) {
    return {
      status: 'warning',
      message: '⚠️ La API Key no parece ser válida (debe empezar con gsk_)'
    };
  }
  
  return {
    status: 'success',
    message: '✅ Configuración de Groq correcta'
  };
};
