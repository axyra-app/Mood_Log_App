import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

const TermsSimple: React.FC = () => {
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
            TÉRMINOS DE SERVICIO
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
          Este texto requiere aprobación jurídica colombiana y validación contra la configuración desplegada antes de ofrecer Mood Log comercialmente.
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
                1. ACEPTACIÓN DE TÉRMINOS
              </h2>
              <p className="text-lg leading-relaxed">
                Al acceder y utilizar Mood Log App, aceptas estar sujeto a estos términos de servicio. 
                Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                2. DESCRIPCIÓN DEL SERVICIO
              </h2>
              <p className="text-lg leading-relaxed">
                Mood Log App es una aplicación personal de seguimiento del estado de ánimo y escritura reflexiva. Sus funciones incluyen:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Resúmenes descriptivos de registros que guardas y análisis de texto con IA cuando lo solicitas</li>
                <li>Conversaciones de autorreflexión generadas por inteligencia artificial</li>
                <li>Estadísticas y reportes personalizados</li>
                <li>Herramientas de bienestar emocional</li>
              </ul>
              <p className="text-lg leading-relaxed mt-4">
                Las funciones de inteligencia artificial ofrecen contenido informativo y de autorreflexión; no proporcionan
                atención clínica, asesoría médica, diagnósticos ni servicios de emergencia.
              </p>
              <p className="text-lg leading-relaxed mt-4">
                La primera versión está dirigida a personas de 18 años o más y utiliza una autodeclaración; Mood Log no verifica la edad real. La conexión con relojes y la importación de datos fisiológicos no están disponibles actualmente.
              </p>
              <p className="text-lg leading-relaxed mt-4">
                Guardar o modificar registros de ánimo y diario requiere una autorización opcional separada. Sin ella, no podrás crear o editar esos registros. Si luego revocas la autorización, se bloquean nuevas escrituras, pero las entradas anteriores permanecen hasta que las elimines; revocar no las borra automáticamente. Cada envío de contenido a IA requiere una confirmación independiente. El contenido enviado puede incluir datos sensibles de salud y será procesado por Groq; su documentación pública describe posibles registros temporales de entrada/salida de hasta 30 días para confiabilidad o abuso. Mood Log no ha verificado el estado del control ZDR de su organización. El servicio de IA no es atención clínica.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                3. CUENTA DE USUARIO
              </h2>
              <p className="text-lg leading-relaxed">
                Para utilizar nuestro servicio, debes crear una cuenta proporcionando información precisa y actualizada. 
                Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                4. PRIVACIDAD Y PROTECCIÓN DE DATOS
              </h2>
              <p className="text-lg leading-relaxed">
                Consulta el borrador de la Política de Privacidad para conocer las categorías de información y los proveedores observados en el código. La autorización para guardar registros sensibles y la confirmación para enviar contenido a IA son separadas. Al solicitar IA, confirmas qué contenido se enviará a Groq, que puede incluir información sensible de salud. Guardar registros no inicia por sí mismo un análisis.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                5. RETENCIÓN Y ELIMINACIÓN DE DATOS
              </h2>
              <p className="text-lg leading-relaxed">
                Los registros de ánimo y diario se guardan en la cuenta mientras no los elimines. Revocar la autorización de almacenamiento detiene nuevas escrituras, pero no borra lo existente. La opción de eliminar cuenta depende de la configuración del entorno y requiere verificación de identidad; consulta Configuración para comprobar si está habilitada. La eliminación desde Mood Log no implica que copias de seguridad, logs o proveedores externos se borren al mismo tiempo.
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Los registros de estado de ánimo y las entradas del diario se guardan en tu cuenta con la autorización separada correspondiente.</li>
                <li>El contenido que envías a una función de IA puede procesarse mediante proveedores externos para generar una respuesta.</li>
                <li>Los periodos de conservación también pueden depender de los servicios de infraestructura utilizados.</li>
              </ul>
              <p className="text-lg leading-relaxed mt-4">
                La analítica es opcional y está apagada por defecto. Los datos fisiológicos de relojes no se recopilan en la versión actual. Revisa la información disponible antes de enviar contenido a IA y evita incluir datos innecesarios.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                6. USO RESPONSABLE
              </h2>
              <p className="text-lg leading-relaxed">
                Te comprometes a utilizar el servicio de manera responsable y ética. No debes:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Proporcionar información falsa o engañosa</li>
                <li>Interferir con el funcionamiento del servicio</li>
                <li>Intentar acceder a cuentas de otros usuarios</li>
                <li>Usar el servicio para actividades ilegales</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                7. LÍMITES DEL SERVICIO
              </h2>
              <p className="text-lg leading-relaxed">
                Mood Log App no presta servicios médicos ni psicológicos y no sustituye la atención de profesionales
                cualificados. Si existe peligro inmediato, contacta los servicios de emergencia de tu localidad.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                8. MODIFICACIONES
              </h2>
              <p className="text-lg leading-relaxed">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                9. CONTACTO
              </h2>
              <p className="text-lg leading-relaxed">
                Si tienes preguntas sobre estos términos, puedes contactarnos en:
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
            CONTINUAR AL REGISTRO
          </Link>
        </div>
      </main>
    </div>
  );
};

export default TermsSimple;
