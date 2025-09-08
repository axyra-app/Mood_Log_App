import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Shield, 
  Users,
  Moon,
  Sun,
  Heart,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import SEO from '../components/SEO';

const Terms: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <SEO
        title='Términos de Servicio - Mood Log App'
        description='Términos y condiciones de uso de Mood Log App. Conoce tus derechos y responsabilidades al usar nuestra plataforma de seguimiento del estado de ánimo.'
        keywords='términos de servicio, condiciones de uso, mood log app, legal'
      />

      <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <header className={`relative z-10 border-b transition-all duration-500 ${isDarkMode ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-lg`}>
          <nav className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center space-x-3 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${isDarkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <span className={`text-3xl font-black transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  MOOD LOG
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-3 rounded-xl transition-all duration-500 hover:scale-110 ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <Link
                  to="/"
                  className={`font-bold text-sm uppercase tracking-wider py-3 px-6 rounded-xl transition-all duration-500 hover:scale-105 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  INICIO
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h1 className={`text-5xl md:text-6xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  TÉRMINOS DE
                  <span className="block bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
                    SERVICIO
                  </span>
                </h1>
                <p className={`text-xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Última actualización: {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                  <Calendar className={`w-8 h-8 mb-4 transition-colors duration-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className={`text-lg font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>VIGENCIA</h3>
                  <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Efectivo desde {new Date().toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
                  <Shield className={`w-8 h-8 mb-4 transition-colors duration-500 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <h3 className={`text-lg font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-green-300' : 'text-green-900'}`}>PRIVACIDAD</h3>
                  <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                    Tus datos están protegidos
                  </p>
                </div>
                <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
                  <Users className={`w-8 h-8 mb-4 transition-colors duration-500 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className={`text-lg font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-purple-300' : 'text-purple-900'}`}>SOPORTE</h3>
                  <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Estamos aquí para ayudarte
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className={`rounded-3xl p-8 border-2 transition-all duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="space-y-12">
                  {/* Introduction */}
                  <section>
                    <h2 className={`text-3xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      BIENVENIDO A MOOD LOG APP
                    </h2>
                    <div className={`text-lg font-bold leading-relaxed space-y-4 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p>
                        Estos Términos de Servicio ("Términos") rigen el uso de la aplicación Mood Log App ("la Aplicación",
                        "nuestro Servicio") operada por nuestro equipo ("nosotros", "nuestro", "la Compañía").
                      </p>
                      <p>
                        Al acceder y usar nuestra aplicación, aceptas estar sujeto a estos Términos. Si no estás de acuerdo con
                        alguna parte de estos términos, no debes usar nuestro Servicio.
                      </p>
                    </div>
                  </section>

                  {/* 1. Aceptación de Términos */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      1. ACEPTACIÓN DE LOS TÉRMINOS
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-4">Al crear una cuenta, acceder o usar Mood Log App, confirmas que:</p>
                      <ul className="list-disc list-inside space-y-3 ml-4">
                        <li>Tienes al menos 18 años de edad o tienes el consentimiento de tus padres/tutores</li>
                        <li>Proporcionarás información precisa y actualizada</li>
                        <li>Eres responsable de mantener la confidencialidad de tu cuenta</li>
                        <li>Aceptas estos términos y nuestra Política de Privacidad</li>
                      </ul>
                    </div>
                  </section>

                  {/* 2. Descripción del Servicio */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      2. DESCRIPCIÓN DEL SERVICIO
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-4">Mood Log App es una plataforma digital diseñada para:</p>
                      <ul className="list-disc list-inside space-y-3 ml-4">
                        <li>Registrar y analizar tu estado de ánimo diario</li>
                        <li>Proporcionar insights basados en IA sobre patrones emocionales</li>
                        <li>Conectar usuarios con profesionales de salud mental</li>
                        <li>Ofrecer herramientas de bienestar y seguimiento personal</li>
                      </ul>
                    </div>
                  </section>

                  {/* 3. Uso Aceptable */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      3. USO ACEPTABLE
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-6">Al usar nuestro servicio, te comprometes a:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
                          <div className="flex items-center space-x-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <h4 className={`text-lg font-black transition-colors duration-500 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>PERMITIDO</h4>
                          </div>
                          <ul className={`text-sm font-bold space-y-2 transition-colors duration-500 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                            <li>• Usar la app para seguimiento personal</li>
                            <li>• Compartir información con profesionales autorizados</li>
                            <li>• Reportar problemas técnicos</li>
                            <li>• Sugerir mejoras</li>
                          </ul>
                        </div>
                        <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center space-x-3 mb-4">
                            <XCircle className="w-6 h-6 text-red-500" />
                            <h4 className={`text-lg font-black transition-colors duration-500 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>PROHIBIDO</h4>
                          </div>
                          <ul className={`text-sm font-bold space-y-2 transition-colors duration-500 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                            <li>• Usar la app para actividades ilegales</li>
                            <li>• Intentar acceder a cuentas de otros usuarios</li>
                            <li>• Interferir con el funcionamiento del servicio</li>
                            <li>• Compartir contenido ofensivo o inapropiado</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 4. Privacidad y Datos */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      4. PRIVACIDAD Y PROTECCIÓN DE DATOS
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-4">Tu privacidad es fundamental para nosotros. Nos comprometemos a:</p>
                      <ul className="list-disc list-inside space-y-3 ml-4">
                        <li>Proteger tu información personal con encriptación de grado militar</li>
                        <li>Nunca vender tus datos a terceros</li>
                        <li>Permitirte exportar o eliminar tus datos en cualquier momento</li>
                        <li>Cumplir con todas las regulaciones de privacidad aplicables (GDPR, CCPA)</li>
                      </ul>
                      <p className="mt-4">
                        Para más detalles, consulta nuestra{' '}
                        <Link to='/privacy' className={`font-black transition-colors duration-500 hover:scale-105 ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}>
                          POLÍTICA DE PRIVACIDAD
                        </Link>
                        .
                      </p>
                    </div>
                  </section>

                  {/* 5. Limitaciones de Responsabilidad */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      5. LIMITACIONES DE RESPONSABILIDAD
                    </h3>
                    <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1" />
                        <div>
                          <h4 className={`text-lg font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>IMPORTANTE</h4>
                          <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                            Mood Log App no reemplaza el consejo médico profesional. Siempre consulta con un profesional de
                            salud mental para asuntos serios.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold leading-relaxed mt-6 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-4">Nuestro servicio se proporciona "tal como está". No garantizamos:</p>
                      <ul className="list-disc list-inside space-y-3 ml-4">
                        <li>Disponibilidad ininterrumpida del servicio</li>
                        <li>Resultados específicos del uso de la aplicación</li>
                        <li>Precisión absoluta de los análisis de IA</li>
                        <li>Compatibilidad con todos los dispositivos</li>
                      </ul>
                    </div>
                  </section>

                  {/* 6. Modificaciones */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      6. MODIFICACIONES DE LOS TÉRMINOS
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-4">
                        Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre
                        cambios significativos a través de:
                      </p>
                      <ul className="list-disc list-inside space-y-3 ml-4">
                        <li>Notificaciones dentro de la aplicación</li>
                        <li>Email a la dirección registrada</li>
                        <li>Actualización de la fecha en esta página</li>
                      </ul>
                      <p className="mt-4">
                        El uso continuado del servicio después de los cambios constituye aceptación de los nuevos términos.
                      </p>
                    </div>
                  </section>

                  {/* 7. Terminación */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      7. TERMINACIÓN
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p>
                        Puedes terminar tu cuenta en cualquier momento desde la configuración de la aplicación. Nos
                        reservamos el derecho de suspender o terminar cuentas que violen estos términos.
                      </p>
                    </div>
                  </section>

                  {/* 8. Contacto */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      8. CONTACTO
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-6">Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                          <Mail className={`w-6 h-6 mb-3 transition-colors duration-500 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                          <h4 className={`text-sm font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>EMAIL</h4>
                          <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            legal@moodlogapp.com
                          </p>
                        </div>
                        <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                          <Phone className={`w-6 h-6 mb-3 transition-colors duration-500 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                          <h4 className={`text-sm font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TELÉFONO</h4>
                          <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            +1 (555) 123-4567
                          </p>
                        </div>
                        <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                          <MapPin className={`w-6 h-6 mb-3 transition-colors duration-500 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                          <h4 className={`text-sm font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>DIRECCIÓN</h4>
                          <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            San Francisco, CA
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Footer */}
              <div className={`mt-12 pt-8 border-t-2 transition-colors duration-500 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <div className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p>© {new Date().getFullYear()} Mood Log App. Todos los derechos reservados.</p>
                  </div>
                  <div className="flex space-x-6">
                    <Link to='/privacy' className={`text-sm font-bold transition-colors duration-500 hover:scale-105 ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}>
                      POLÍTICA DE PRIVACIDAD
                    </Link>
                    <Link to='/' className={`text-sm font-bold transition-colors duration-500 hover:scale-105 ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}>
                      INICIO
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;