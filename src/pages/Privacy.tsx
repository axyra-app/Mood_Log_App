import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Database, 
  Eye, 
  Lock, 
  Shield, 
  UserCheck,
  Moon,
  Sun,
  Heart,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Users,
  FileText
} from 'lucide-react';
import SEO from '../components/SEO';

const Privacy: React.FC = () => {
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
        title='Política de Privacidad - Mood Log App'
        description='Política de privacidad de Mood Log App. Conoce cómo protegemos y manejamos tu información personal y datos de salud mental.'
        keywords='política de privacidad, protección de datos, privacidad, mood log app, GDPR'
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
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h1 className={`text-5xl md:text-6xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  POLÍTICA DE
                  <span className="block bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                    PRIVACIDAD
                  </span>
                </h1>
                <p className={`text-xl font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Última actualización: {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>

              {/* Security Badges */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
                  <Lock className={`w-8 h-8 mb-4 transition-colors duration-500 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <h3 className={`text-sm font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-green-300' : 'text-green-900'}`}>ENCRIPTACIÓN</h3>
                  <p className={`text-xs font-bold transition-colors duration-500 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                    Grado militar
                  </p>
                </div>
                <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                  <Eye className={`w-8 h-8 mb-4 transition-colors duration-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className={`text-sm font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>TRANSPARENCIA</h3>
                  <p className={`text-xs font-bold transition-colors duration-500 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Total
                  </p>
                </div>
                <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
                  <UserCheck className={`w-8 h-8 mb-4 transition-colors duration-500 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className={`text-sm font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-purple-300' : 'text-purple-900'}`}>CONTROL</h3>
                  <p className={`text-xs font-bold transition-colors duration-500 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Completo
                  </p>
                </div>
                <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'}`}>
                  <Database className={`w-8 h-8 mb-4 transition-colors duration-500 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <h3 className={`text-sm font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-orange-300' : 'text-orange-900'}`}>GDPR</h3>
                  <p className={`text-xs font-bold transition-colors duration-500 ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                    Compatible
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className={`rounded-3xl p-8 border-2 transition-all duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="space-y-12">
                  {/* Introduction */}
                  <section>
                    <h2 className={`text-3xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      TU PRIVACIDAD ES NUESTRA PRIORIDAD
                    </h2>
                    <div className={`text-lg font-bold leading-relaxed space-y-4 transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p>
                        En Mood Log App, entendemos la importancia de proteger tu información personal, especialmente cuando se
                        trata de datos relacionados con tu salud mental. Esta Política de Privacidad explica cómo recopilamos,
                        usamos, almacenamos y protegemos tu información.
                      </p>
                      <p>
                        Al usar nuestra aplicación, confías en nosotros con información muy personal. Nos comprometemos a
                        manejar esta información con el máximo cuidado y respeto.
                      </p>
                    </div>
                  </section>

                  {/* 1. Información que Recopilamos */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      1. INFORMACIÓN QUE RECOPILAMOS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <UserCheck className="w-6 h-6 text-blue-500" />
                          <h4 className={`text-lg font-black transition-colors duration-500 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>INFORMACIÓN PERSONAL</h4>
                        </div>
                        <ul className={`text-sm font-bold space-y-2 transition-colors duration-500 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                          <li>• Nombre y apellido</li>
                          <li>• Dirección de email</li>
                          <li>• Fecha de nacimiento</li>
                          <li>• Información de contacto</li>
                        </ul>
                      </div>
                      <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <Database className="w-6 h-6 text-purple-500" />
                          <h4 className={`text-lg font-black transition-colors duration-500 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>DATOS DE SALUD</h4>
                        </div>
                        <ul className={`text-sm font-bold space-y-2 transition-colors duration-500 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          <li>• Registros de estado de ánimo</li>
                          <li>• Notas y reflexiones personales</li>
                          <li>• Patrones de sueño</li>
                          <li>• Actividades y hábitos</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* 2. Cómo Usamos tu Información */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      2. CÓMO USAMOS TU INFORMACIÓN
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-4">Utilizamos tu información para:</p>
                      <ul className="list-disc list-inside space-y-3 ml-4">
                        <li>Proporcionar y mejorar nuestros servicios</li>
                        <li>Generar insights personalizados sobre tu bienestar</li>
                        <li>Conectarte con profesionales de salud mental</li>
                        <li>Enviar notificaciones importantes sobre tu cuenta</li>
                        <li>Mejorar la experiencia de usuario</li>
                        <li>Cumplir con obligaciones legales</li>
                      </ul>
                    </div>
                  </section>

                  {/* 3. Protección de Datos */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      3. PROTECCIÓN DE DATOS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
                        <Lock className={`w-8 h-8 mb-4 transition-colors duration-500 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <h4 className={`text-lg font-black mb-3 transition-colors duration-500 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>ENCRIPTACIÓN</h4>
                        <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                          Todos los datos se encriptan con estándares de grado militar
                        </p>
                      </div>
                      <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                        <Shield className={`w-8 h-8 mb-4 transition-colors duration-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h4 className={`text-lg font-black mb-3 transition-colors duration-500 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>ACCESO LIMITADO</h4>
                        <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                          Solo personal autorizado puede acceder a tus datos
                        </p>
                      </div>
                      <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
                        <Eye className={`w-8 h-8 mb-4 transition-colors duration-500 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <h4 className={`text-lg font-black mb-3 transition-colors duration-500 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>AUDITORÍA</h4>
                        <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          Monitoreo constante de accesos y actividades
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* 4. Tus Derechos */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      4. TUS DERECHOS
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-4">Tienes derecho a:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Acceder a tus datos personales</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Rectificar información incorrecta</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Eliminar tu cuenta y datos</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Exportar tus datos</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Limitar el procesamiento</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Presentar una queja</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 5. Compartir Información */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      5. COMPARTIR INFORMACIÓN
                    </h3>
                    <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center space-x-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <h4 className={`text-lg font-black transition-colors duration-500 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>NUNCA VENDEMOS TUS DATOS</h4>
                      </div>
                      <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                        No vendemos, alquilamos ni compartimos tu información personal con terceros para fines comerciales.
                        Solo compartimos datos cuando es necesario para proporcionar el servicio o cuando la ley lo requiere.
                      </p>
                    </div>
                  </section>

                  {/* 6. Retención de Datos */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      6. RETENCIÓN DE DATOS
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-4">
                        Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos
                        descritos en esta política, a menos que la ley requiera un período de retención más largo.
                      </p>
                      <ul className="list-disc list-inside space-y-3 ml-4">
                        <li>Datos de cuenta: Mientras tu cuenta esté activa</li>
                        <li>Registros de estado de ánimo: Según tu configuración de privacidad</li>
                        <li>Datos de comunicación: 3 años para fines de soporte</li>
                        <li>Datos de facturación: 7 años según requerimientos legales</li>
                      </ul>
                    </div>
                  </section>

                  {/* 7. Cookies y Tecnologías */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      7. COOKIES Y TECNOLOGÍAS
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-4">Utilizamos cookies y tecnologías similares para:</p>
                      <ul className="list-disc list-inside space-y-3 ml-4">
                        <li>Mantener tu sesión activa</li>
                        <li>Recordar tus preferencias</li>
                        <li>Mejorar la funcionalidad de la aplicación</li>
                        <li>Analizar el uso de la aplicación (datos anónimos)</li>
                      </ul>
                      <p className="mt-4">
                        Puedes controlar las cookies a través de la configuración de tu navegador.
                      </p>
                    </div>
                  </section>

                  {/* 8. Cambios en la Política */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      8. CAMBIOS EN LA POLÍTICA
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-4">
                        Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios
                        significativos a través de:
                      </p>
                      <ul className="list-disc list-inside space-y-3 ml-4">
                        <li>Notificaciones dentro de la aplicación</li>
                        <li>Email a tu dirección registrada</li>
                        <li>Actualización de la fecha en esta página</li>
                      </ul>
                      <p className="mt-4">
                        Te recomendamos revisar esta política periódicamente para mantenerte informado sobre cómo
                        protegemos tu información.
                      </p>
                    </div>
                  </section>

                  {/* 9. Contacto */}
                  <section>
                    <h3 className={`text-2xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      9. CONTACTO
                    </h3>
                    <div className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <p className="mb-6">Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`rounded-2xl p-6 border-2 transition-all duration-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                          <Mail className={`w-6 h-6 mb-3 transition-colors duration-500 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                          <h4 className={`text-sm font-black mb-2 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>EMAIL</h4>
                          <p className={`text-sm font-bold transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            privacy@moodlogapp.com
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
                    <Link to='/terms' className={`text-sm font-bold transition-colors duration-500 hover:scale-105 ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}>
                      TÉRMINOS DE SERVICIO
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

export default Privacy;