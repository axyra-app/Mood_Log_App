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
      <div className="max-w-4xl mx-auto px-6 py-12">
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
            Última actualización: 18 de octubre de 2025
          </p>
        </div>

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
                <li>Entradas del diario y contenido que envías a funciones de inteligencia artificial</li>
                <li>Información de uso de la aplicación</li>
                <li>Datos técnicos que puedan procesar los proveedores de infraestructura, como información del dispositivo o registros de diagnóstico</li>
              </ul>
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
                <li>Proporcionar y mejorar nuestros servicios</li>
                <li>Generar análisis y respuestas de autorreflexión mediante funciones de inteligencia artificial</li>
                <li>Personalizar tu experiencia</li>
                <li>Comunicarnos contigo</li>
                <li>Cumplir con obligaciones legales</li>
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
                <li>Con proveedores de infraestructura y de inteligencia artificial cuando sea necesario para prestar la función que solicitas. El contenido enviado a una función de IA puede transmitirse a ese proveedor.</li>
                <li>Cuando es requerido por ley o necesario para proteger derechos y seguridad</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                4. SEGURIDAD DE DATOS
              </h2>
              <p className="text-lg leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizacionales para proteger tu información:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Encriptación de datos en tránsito y en reposo</li>
                <li>Acceso restringido a información personal</li>
                <li>Monitoreo regular de seguridad</li>
                <li>Capacitación del personal en privacidad</li>
              </ul>
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
                <li>Portabilidad de datos</li>
                <li>Oponerte al procesamiento</li>
                <li>Retirar tu consentimiento</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                6. COOKIES Y TECNOLOGÍAS SIMILARES
              </h2>
              <p className="text-lg leading-relaxed">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso y personalizar contenido. 
                Puedes controlar las cookies a través de la configuración de tu navegador.
              </p>
            </section>

            <section>
              <h2 className={`text-3xl font-black mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                7. RETENCIÓN DE DATOS
              </h2>
              <p className="text-lg leading-relaxed">
                Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos 
                descritos en esta política, a menos que la ley requiera un período de retención más largo.
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
                <p>📧 Email: privacy@moodlogapp.com</p>
                <p>📞 Teléfono: +1 (555) 123-4567</p>
                <p>📍 Dirección: 123 Innovation St, Tech City, TC 12345</p>
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
      </div>
    </div>
  );
};

export default PrivacySimple;
