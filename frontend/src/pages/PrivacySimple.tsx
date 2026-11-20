import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

const PrivacySimple: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <header className={`py-6 px-6 transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
      } backdrop-blur-lg border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <Logo size="lg" />
          </Link>
          
          <button
            type='button'
            aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            onClick={toggleDarkMode}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
              isDarkMode 
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className={`inline-flex items-center space-x-2 text-sm font-semibold transition-colors duration-300 hover:underline ${
              isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
            }`}
          >
            <span>←</span>
            <span>Volver al inicio</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className={`text-5xl font-black mb-6 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            POLÍTICA DE PRIVACIDAD
          </h1>
          <p className={`text-xl transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Borrador de trabajo: 19 de noviembre de 2026
          </p>
        </div>

        <p role='note' className={`mb-8 rounded-xl border p-4 text-sm ${
          isDarkMode
            ? 'border-amber-700 bg-amber-950/40 text-amber-100'
            : 'border-amber-300 bg-amber-50 text-amber-900'
        }`}>
          Este texto está en revisión y requiere aprobación jurídica y validación contra la configuración desplegada antes de ofrecer Mood Log comercialmente.
        </p>

        <div className={`prose prose-lg max-w-none ${
          isDarkMode ? 'prose-invert' : ''
        }`}>
          <div className={`space-y-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            
            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                1. INFORMACIÓN QUE RECOPILAMOS
              </h2>
              <p className="text-lg leading-relaxed">
                La información que se procesa depende de las funciones que utilizas. Puede incluir:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Información de cuenta, como nombre y correo electrónico (las credenciales de acceso son gestionadas por el proveedor de autenticación)</li>
                <li>Datos de estado de ánimo y emociones</li>
                <li>Entradas del diario y contenido que decides enviar a una función de inteligencia artificial</li>
                <li>Preferencias de la cuenta, incluida la opción voluntaria de analítica</li>
                <li>Datos técnicos que los servicios de infraestructura puedan procesar para prestar la aplicación</li>
              </ul>
              <p className="mt-4 text-lg leading-relaxed">
                Mood Log no ofrece actualmente conexión con relojes ni recopila frecuencia cardíaca o HRV. Los registros de ánimo y cualquier futura medición de salud pueden ser información sensible; conectar una fuente de salud deberá ser opcional y contar con información y autorización separadas.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
                Guardar nuevos registros de ánimo o diario requiere una autorización opcional y separada en Configuración &gt; Autorización para ánimo y diario. Si no la otorgas, no podrás crear ni modificar esos registros; puedes seguir usando las demás funciones de cuenta disponibles. Al retirarla se bloquean nuevos registros, cambios y solicitudes de análisis con IA. Los registros existentes no se eliminan automáticamente y siguen disponibles en tu historial y estadísticas hasta que los elimines; puedes hacerlo desde la aplicación o ejercer tus derechos por los canales habilitados. Este tratamiento de registros existentes después del retiro requiere validación jurídica antes del lanzamiento.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                2. CÓMO USAMOS TU INFORMACIÓN
              </h2>
              <p className="text-lg leading-relaxed">
                Utilizamos tu información para:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Crear y mantener tu cuenta y mostrar los registros que guardas</li>
                <li>Mostrar los registros que autorizas guardar y, cuando lo solicitas, generar resúmenes o respuestas de autorreflexión con IA</li>
                <li>Procesar analítica de uso solo si activas esa opción en Configuración</li>
                <li>Atender solicitudes de soporte y obligaciones aplicables</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                3. COMPARTIR INFORMACIÓN
              </h2>
              <p className="text-lg leading-relaxed">
                No vendemos tu información personal. La información puede procesarse o compartirse en estos casos:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Firebase/Google proporciona autenticación y almacenamiento; Vercel aloja la aplicación y sus funciones; Groq procesa el contenido que eliges enviar a una tarea de IA, con una confirmación separada para cada tarea.</li>
                <li>Una nota, registro, mensaje o dato de ánimo puede revelar información sensible sobre tu salud. Si solicitas una función de IA, el contenido indicado en esa confirmación se envía a Groq; no tienes que usar IA para guardar tus registros.</li>
                <li>Groq informa públicamente que por defecto no retiene entradas ni respuestas de inferencia, pero puede registrar temporalmente datos de entrada y salida hasta 30 días para confiabilidad o abuso. Ofrece un control Zero Data Retention (ZDR), pero Mood Log no ha verificado si está activo para su organización. Groq ubica en Estados Unidos los datos de cliente que retiene; su DPA contempla operaciones de subprocesadores en otros países.</li>
                <li>Para operar la IA y estimar su uso, Mood Log guarda en Firebase Firestore un resumen diario vinculado a tu cuenta con el número de tokens de entrada y salida por modelo y tarea. No contiene tus mensajes ni respuestas; se reemplaza cuando usas la IA en otro día y se elimina al borrar la cuenta. También puedes obtenerlo en tu exportación de datos.</li>
                <li>La analítica de Firebase/Google se activa solo si la habilitas y guardas esa preferencia. Los eventos definidos por Mood Log no incluyen intencionalmente el texto del diario o las puntuaciones de ánimo; el proveedor puede procesar datos técnicos bajo la configuración efectiva del servicio.</li>
                <li>Cuando es requerido por ley o necesario para proteger derechos y seguridad</li>
              </ul>
              <p className="mt-4 text-lg leading-relaxed">
                Los proveedores y países donde se procesa información, sus funciones contractuales y las condiciones de transferencia internacional están pendientes de verificación para el entorno de lanzamiento. Los textos y consentimientos de esta versión son borradores sujetos a revisión jurídica colombiana.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                4. SEGURIDAD DE DATOS
              </h2>
              <p className="text-lg leading-relaxed">
                El código aplica controles de acceso por cuenta y comunica con servicios de Firebase. El diario se guarda como texto en Firestore. Mood Log no implementa cifrado de extremo a extremo; las reglas y controles desplegados deben verificarse antes del lanzamiento.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                5. TUS DERECHOS
              </h2>
              <p className="text-lg leading-relaxed">
                Tienes derecho a:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Acceder a tu información personal</li>
                <li>Corregir información inexacta</li>
                <li>Eliminar tu cuenta y datos</li>
                <li>Solicitar información sobre el uso de tus datos y copia de la autorización cuando corresponda</li>
                <li>Revocar autorizaciones y pedir supresión en los casos previstos por la ley aplicable</li>
                <li>Presentar consultas o reclamos por los canales que se habiliten</li>
              </ul>
              <p className="mt-4 text-lg leading-relaxed">
                Cuando esté habilitada en tu entorno, la opción de eliminación está en Configuración y requiere volver
                a verificar tu identidad. El proceso elimina la cuenta y los datos gestionados por Mood Log. No elimina
                necesariamente copias de seguridad, registros operativos ni información que un proveedor externo haya
                procesado según sus propias políticas de retención.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                6. COOKIES Y TECNOLOGÍAS SIMILARES
              </h2>
              <p className="text-lg leading-relaxed">
                La aplicación usa tecnologías del navegador y Firebase para mantener la sesión y funcionar. Firebase Analytics permanece apagado por defecto y solo se activa si lo habilitas en Configuración. Las cookies, identificadores y solicitudes reales deben verificarse en staging; no se afirma que la analítica esté activa sin esa elección.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                7. RETENCIÓN DE DATOS
              </h2>
              <p className="text-lg leading-relaxed">
                Los plazos por categoría y la retención efectiva en el hosting/proveedores siguen pendientes de verificar. La información pública de Groq describe posibles logs de inferencia de hasta 30 días salvo que ZDR u otras condiciones aplicables cambien el tratamiento; Mood Log no ha verificado la configuración de su cuenta. La eliminación desde Mood Log no demuestra que el proveedor haya borrado logs operativos. No lanzar comercialmente hasta confirmar los ajustes/contrato y publicar plazos concretos, excepciones y el proceso de eliminación aplicable.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                8. CAMBIOS A ESTA POLÍTICA
              </h2>
              <p className="text-lg leading-relaxed">
                Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios 
                significativos a través de la aplicación o por email.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                9. CONTACTO
              </h2>
              <p className="text-lg leading-relaxed">
                Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en:
              </p>
              <div className="mt-4 space-y-2">
                <p>📧 Email: <a className="underline" href="mailto:moodloga@gmail.com">moodloga@gmail.com</a></p>
                <p>📞 Teléfono: <a className="underline" href="tel:+573187249579">+57 318 724 9579</a></p>
                <p>📍 Ubicación: Envigado, Antioquia, Colombia</p>
              </div>
            </section>

          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/register"
            className={`inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg uppercase tracking-wider py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50`}
          >
            CONTINUAR CON REGISTRO
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PrivacySimple;
