import { AlertTriangle, ArrowLeft, Calendar, FileText, Shield, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Terms: React.FC = () => {
  return (
    <>
      <SEO
        title='Términos de Servicio - Mood Log App'
        description='Términos y condiciones de uso de Mood Log App. Conoce tus derechos y responsabilidades al usar nuestra plataforma de seguimiento del estado de ánimo.'
        keywords='términos de servicio, condiciones de uso, mood log app, legal'
      />

      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className='bg-white shadow-sm border-b border-gray-200'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex items-center justify-between h-16'>
              <div className='flex items-center space-x-4'>
                <Link to='/' className='p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100'>
                  <ArrowLeft className='w-6 h-6' />
                </Link>
                <div className='flex items-center space-x-3'>
                  <FileText className='w-6 h-6 text-primary-600' />
                  <div>
                    <h1 className='text-xl font-semibold text-gray-900'>Términos de Servicio</h1>
                    <p className='text-sm text-gray-600'>
                      Última actualización: {new Date().toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8'>
            {/* Introduction */}
            <div className='mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>Bienvenido a Mood Log App</h2>
              <p className='text-gray-600 leading-relaxed'>
                Estos Términos de Servicio ("Términos") rigen el uso de la aplicación Mood Log App ("la Aplicación",
                "nuestro Servicio") operada por nuestro equipo ("nosotros", "nuestro", "la Compañía").
              </p>
              <p className='text-gray-600 leading-relaxed mt-4'>
                Al acceder y usar nuestra aplicación, aceptas estar sujeto a estos Términos. Si no estás de acuerdo con
                alguna parte de estos términos, no debes usar nuestro Servicio.
              </p>
            </div>

            {/* Quick Info */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <Calendar className='w-8 h-8 text-blue-600 mb-2' />
                <h3 className='font-semibold text-blue-900'>Vigencia</h3>
                <p className='text-sm text-blue-700'>Efectivo desde {new Date().toLocaleDateString('es-ES')}</p>
              </div>
              <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <Shield className='w-8 h-8 text-green-600 mb-2' />
                <h3 className='font-semibold text-green-900'>Privacidad</h3>
                <p className='text-sm text-green-700'>Tus datos están protegidos</p>
              </div>
              <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
                <Users className='w-8 h-8 text-purple-600 mb-2' />
                <h3 className='font-semibold text-purple-900'>Soporte</h3>
                <p className='text-sm text-purple-700'>Estamos aquí para ayudarte</p>
              </div>
            </div>

            {/* Terms Content */}
            <div className='space-y-8'>
              {/* 1. Aceptación de Términos */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>1. Aceptación de los Términos</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed'>
                    Al crear una cuenta, acceder o usar Mood Log App, confirmas que:
                  </p>
                  <ul className='list-disc list-inside text-gray-600 space-y-2 mt-4'>
                    <li>Tienes al menos 18 años de edad o tienes el consentimiento de tus padres/tutores</li>
                    <li>Proporcionarás información precisa y actualizada</li>
                    <li>Eres responsable de mantener la confidencialidad de tu cuenta</li>
                    <li>Aceptas estos términos y nuestra Política de Privacidad</li>
                  </ul>
                </div>
              </section>

              {/* 2. Descripción del Servicio */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>2. Descripción del Servicio</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed'>Mood Log App es una plataforma digital diseñada para:</p>
                  <ul className='list-disc list-inside text-gray-600 space-y-2 mt-4'>
                    <li>Registrar y analizar tu estado de ánimo diario</li>
                    <li>Proporcionar insights basados en IA sobre patrones emocionales</li>
                    <li>Conectar usuarios con profesionales de salud mental</li>
                    <li>Ofrecer herramientas de bienestar y seguimiento personal</li>
                  </ul>
                </div>
              </section>

              {/* 3. Uso Aceptable */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>3. Uso Aceptable</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed mb-4'>Al usar nuestro servicio, te comprometes a:</p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h4 className='font-semibold text-green-700 mb-2'>✅ Permitido</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-1 text-sm'>
                        <li>Usar la app para seguimiento personal</li>
                        <li>Compartir información con profesionales autorizados</li>
                        <li>Reportar problemas técnicos</li>
                        <li>Sugerir mejoras</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className='font-semibold text-red-700 mb-2'>❌ Prohibido</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-1 text-sm'>
                        <li>Usar la app para actividades ilegales</li>
                        <li>Intentar acceder a cuentas de otros usuarios</li>
                        <li>Interferir con el funcionamiento del servicio</li>
                        <li>Compartir contenido ofensivo o inapropiado</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. Privacidad y Datos */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>4. Privacidad y Protección de Datos</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed'>
                    Tu privacidad es fundamental para nosotros. Nos comprometemos a:
                  </p>
                  <ul className='list-disc list-inside text-gray-600 space-y-2 mt-4'>
                    <li>Proteger tu información personal con encriptación de grado militar</li>
                    <li>Nunca vender tus datos a terceros</li>
                    <li>Permitirte exportar o eliminar tus datos en cualquier momento</li>
                    <li>Cumplir con todas las regulaciones de privacidad aplicables (GDPR, CCPA)</li>
                  </ul>
                  <p className='text-gray-600 leading-relaxed mt-4'>
                    Para más detalles, consulta nuestra{' '}
                    <Link to='/privacy' className='text-primary-600 hover:text-primary-700'>
                      Política de Privacidad
                    </Link>
                    .
                  </p>
                </div>
              </section>

              {/* 5. Limitaciones de Responsabilidad */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>5. Limitaciones de Responsabilidad</h3>
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4'>
                  <div className='flex items-start space-x-3'>
                    <AlertTriangle className='w-5 h-5 text-yellow-600 mt-0.5' />
                    <div>
                      <h4 className='font-semibold text-yellow-800'>Importante</h4>
                      <p className='text-sm text-yellow-700 mt-1'>
                        Mood Log App no reemplaza el consejo médico profesional. Siempre consulta con un profesional de
                        salud mental para asuntos serios.
                      </p>
                    </div>
                  </div>
                </div>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed'>
                    Nuestro servicio se proporciona "tal como está". No garantizamos:
                  </p>
                  <ul className='list-disc list-inside text-gray-600 space-y-2 mt-4'>
                    <li>Disponibilidad ininterrumpida del servicio</li>
                    <li>Resultados específicos del uso de la aplicación</li>
                    <li>Precisión absoluta de los análisis de IA</li>
                    <li>Compatibilidad con todos los dispositivos</li>
                  </ul>
                </div>
              </section>

              {/* 6. Modificaciones */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>6. Modificaciones de los Términos</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed'>
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre
                    cambios significativos a través de:
                  </p>
                  <ul className='list-disc list-inside text-gray-600 space-y-2 mt-4'>
                    <li>Notificaciones dentro de la aplicación</li>
                    <li>Email a la dirección registrada</li>
                    <li>Actualización de la fecha en esta página</li>
                  </ul>
                  <p className='text-gray-600 leading-relaxed mt-4'>
                    El uso continuado del servicio después de los cambios constituye aceptación de los nuevos términos.
                  </p>
                </div>
              </section>

              {/* 7. Terminación */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>7. Terminación</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed'>
                    Puedes terminar tu cuenta en cualquier momento desde la configuración de la aplicación. Nos
                    reservamos el derecho de suspender o terminar cuentas que violen estos términos.
                  </p>
                </div>
              </section>

              {/* 8. Contacto */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>8. Contacto</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed'>
                    Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos:
                  </p>
                  <ul className='list-disc list-inside text-gray-600 space-y-2 mt-4'>
                    <li>Email: legal@moodlogapp.com</li>
                    <li>Dirección: [Tu dirección de empresa]</li>
                    <li>Teléfono: [Tu número de teléfono]</li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className='mt-12 pt-8 border-t border-gray-200'>
              <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
                <div className='text-sm text-gray-500'>
                  <p>© {new Date().getFullYear()} Mood Log App. Todos los derechos reservados.</p>
                </div>
                <div className='flex space-x-6'>
                  <Link to='/privacy' className='text-sm text-primary-600 hover:text-primary-700'>
                    Política de Privacidad
                  </Link>
                  <Link to='/' className='text-sm text-primary-600 hover:text-primary-700'>
                    Inicio
                  </Link>
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
