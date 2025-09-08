import { ArrowLeft, Database, Eye, Lock, Shield, UserCheck } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Privacy: React.FC = () => {
  return (
    <>
      <SEO
        title='Política de Privacidad - Mood Log App'
        description='Política de privacidad de Mood Log App. Conoce cómo protegemos y manejamos tu información personal y datos de salud mental.'
        keywords='política de privacidad, protección de datos, privacidad, mood log app, GDPR'
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
                  <Shield className='w-6 h-6 text-primary-600' />
                  <div>
                    <h1 className='text-xl font-semibold text-gray-900'>Política de Privacidad</h1>
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
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>Tu Privacidad es Nuestra Prioridad</h2>
              <p className='text-gray-600 leading-relaxed'>
                En Mood Log App, entendemos la importancia de proteger tu información personal, especialmente cuando se
                trata de datos relacionados con tu salud mental. Esta Política de Privacidad explica cómo recopilamos,
                usamos, almacenamos y protegemos tu información.
              </p>
              <p className='text-gray-600 leading-relaxed mt-4'>
                Al usar nuestra aplicación, confías en nosotros con información muy personal. Nos comprometemos a
                manejar esta información con el máximo cuidado y respeto.
              </p>
            </div>

            {/* Privacy Principles */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-center'>
                <Lock className='w-8 h-8 text-blue-600 mx-auto mb-2' />
                <h3 className='font-semibold text-blue-900'>Encriptación</h3>
                <p className='text-sm text-blue-700'>Datos protegidos con encriptación de grado militar</p>
              </div>
              <div className='bg-green-50 border border-green-200 rounded-lg p-4 text-center'>
                <Eye className='w-8 h-8 text-green-600 mx-auto mb-2' />
                <h3 className='font-semibold text-green-900'>Transparencia</h3>
                <p className='text-sm text-green-700'>Sabes exactamente qué datos recopilamos</p>
              </div>
              <div className='bg-purple-50 border border-purple-200 rounded-lg p-4 text-center'>
                <UserCheck className='w-8 h-8 text-purple-600 mx-auto mb-2' />
                <h3 className='font-semibold text-purple-900'>Control</h3>
                <p className='text-sm text-purple-700'>Tienes control total sobre tus datos</p>
              </div>
              <div className='bg-orange-50 border border-orange-200 rounded-lg p-4 text-center'>
                <Database className='w-8 h-8 text-orange-600 mx-auto mb-2' />
                <h3 className='font-semibold text-orange-900'>Minimización</h3>
                <p className='text-sm text-orange-700'>Solo recopilamos lo necesario</p>
              </div>
            </div>

            {/* Privacy Content */}
            <div className='space-y-8'>
              {/* 1. Información que Recopilamos */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>1. Información que Recopilamos</h3>
                <div className='prose prose-gray max-w-none'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-3'>📝 Información Personal</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-2 text-sm'>
                        <li>Nombre y apellido</li>
                        <li>Dirección de email</li>
                        <li>Fecha de nacimiento (opcional)</li>
                        <li>Información de perfil</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-3'>💭 Datos de Salud Mental</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-2 text-sm'>
                        <li>Registros de estado de ánimo</li>
                        <li>Notas y reflexiones personales</li>
                        <li>Métricas de bienestar</li>
                        <li>Patrones de sueño y energía</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-3'>📱 Datos Técnicos</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-2 text-sm'>
                        <li>Dirección IP (anonimizada)</li>
                        <li>Tipo de dispositivo y navegador</li>
                        <li>Uso de la aplicación</li>
                        <li>Cookies y tecnologías similares</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-3'>🔗 Datos de Terceros</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-2 text-sm'>
                        <li>Información de Google (si usas Google Sign-In)</li>
                        <li>Datos de análisis (anonimizados)</li>
                        <li>Información de servicios de IA</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Cómo Usamos tu Información */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>2. Cómo Usamos tu Información</h3>
                <div className='prose prose-gray max-w-none'>
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
                    <h4 className='font-semibold text-blue-900 mb-2'>🎯 Propósitos Principales</h4>
                    <ul className='list-disc list-inside text-blue-800 space-y-1 text-sm'>
                      <li>Proporcionar y mejorar nuestros servicios</li>
                      <li>Generar insights personalizados sobre tu bienestar</li>
                      <li>Conectarte con profesionales de salud mental</li>
                      <li>Enviar notificaciones y recordatorios</li>
                    </ul>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-3'>✅ Usos Permitidos</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-2 text-sm'>
                        <li>Análisis de patrones emocionales</li>
                        <li>Recomendaciones personalizadas</li>
                        <li>Comunicación con profesionales autorizados</li>
                        <li>Mejora de la experiencia del usuario</li>
                        <li>Cumplimiento legal y regulatorio</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-3'>❌ Lo que NO Hacemos</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-2 text-sm'>
                        <li>Vender tus datos a terceros</li>
                        <li>Usar tu información para publicidad</li>
                        <li>Compartir datos sin tu consentimiento</li>
                        <li>Acceder a datos no relacionados con el servicio</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Compartir Información */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>3. Cuándo Compartimos tu Información</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed mb-4'>
                    Solo compartimos tu información en las siguientes circunstancias limitadas:
                  </p>
                  <div className='space-y-4'>
                    <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-green-900 mb-2'>👨‍⚕️ Con Profesionales de Salud</h4>
                      <p className='text-sm text-green-800'>
                        Solo cuando autorices explícitamente la conexión con un psicólogo o terapeuta.
                      </p>
                    </div>
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-blue-900 mb-2'>⚖️ Requerimientos Legales</h4>
                      <p className='text-sm text-blue-800'>
                        Cuando sea requerido por ley, orden judicial o proceso legal válido.
                      </p>
                    </div>
                    <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-purple-900 mb-2'>🛡️ Emergencias de Seguridad</h4>
                      <p className='text-sm text-purple-800'>
                        En casos de emergencia donde tu seguridad esté en riesgo.
                      </p>
                    </div>
                    <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-orange-900 mb-2'>🔧 Proveedores de Servicios</h4>
                      <p className='text-sm text-orange-800'>
                        Con proveedores confiables que nos ayudan a operar el servicio (bajo estrictos acuerdos de
                        confidencialidad).
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. Protección de Datos */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>4. Cómo Protegemos tu Información</h3>
                <div className='prose prose-gray max-w-none'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-3'>🔐 Medidas Técnicas</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-2 text-sm'>
                        <li>Encriptación AES-256 en tránsito y reposo</li>
                        <li>Autenticación de dos factores</li>
                        <li>Monitoreo de seguridad 24/7</li>
                        <li>Copias de seguridad encriptadas</li>
                        <li>Acceso restringido a datos</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-3'>👥 Medidas Organizacionales</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-2 text-sm'>
                        <li>Capacitación en privacidad del equipo</li>
                        <li>Políticas estrictas de acceso</li>
                        <li>Auditorías regulares de seguridad</li>
                        <li>Protocolos de respuesta a incidentes</li>
                        <li>Cumplimiento con estándares internacionales</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Tus Derechos */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>5. Tus Derechos sobre tus Datos</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed mb-4'>
                    Tienes control total sobre tu información personal. Puedes:
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-gray-800 mb-2'>👁️ Acceso</h4>
                      <p className='text-sm text-gray-600'>Ver todos los datos que tenemos sobre ti</p>
                    </div>
                    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-gray-800 mb-2'>✏️ Rectificación</h4>
                      <p className='text-sm text-gray-600'>Corregir información incorrecta</p>
                    </div>
                    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-gray-800 mb-2'>🗑️ Eliminación</h4>
                      <p className='text-sm text-gray-600'>Eliminar tu cuenta y todos tus datos</p>
                    </div>
                    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-gray-800 mb-2'>📤 Portabilidad</h4>
                      <p className='text-sm text-gray-600'>Exportar tus datos en formato estándar</p>
                    </div>
                    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-gray-800 mb-2'>⏸️ Limitación</h4>
                      <p className='text-sm text-gray-600'>Restringir el procesamiento de tus datos</p>
                    </div>
                    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                      <h4 className='font-semibold text-gray-800 mb-2'>🚫 Oposición</h4>
                      <p className='text-sm text-gray-600'>Oponerte al procesamiento de tus datos</p>
                    </div>
                  </div>
                  <p className='text-gray-600 leading-relaxed mt-4'>
                    Para ejercer cualquiera de estos derechos, contacta con nosotros en{' '}
                    <strong>privacy@moodlogapp.com</strong>
                  </p>
                </div>
              </section>

              {/* 6. Retención de Datos */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>6. Retención de Datos</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed'>
                    Mantenemos tu información solo durante el tiempo necesario para:
                  </p>
                  <ul className='list-disc list-inside text-gray-600 space-y-2 mt-4'>
                    <li>Proporcionar nuestros servicios</li>
                    <li>Cumplir con obligaciones legales</li>
                    <li>Resolver disputas</li>
                    <li>Hacer cumplir nuestros acuerdos</li>
                  </ul>
                  <p className='text-gray-600 leading-relaxed mt-4'>
                    <strong>Datos de cuenta activa:</strong> Mientras tu cuenta esté activa
                    <br />
                    <strong>Datos de cuenta eliminada:</strong> Eliminados dentro de 30 días
                    <br />
                    <strong>Datos de respaldo:</strong> Eliminados dentro de 90 días
                  </p>
                </div>
              </section>

              {/* 7. Cookies y Tecnologías Similares */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>7. Cookies y Tecnologías de Seguimiento</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed mb-4'>Utilizamos cookies y tecnologías similares para:</p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-3'>🍪 Cookies Esenciales</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-2 text-sm'>
                        <li>Autenticación de usuario</li>
                        <li>Preferencias de la aplicación</li>
                        <li>Seguridad y prevención de fraudes</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-3'>📊 Cookies Analíticas</h4>
                      <ul className='list-disc list-inside text-gray-600 space-y-2 text-sm'>
                        <li>Uso de la aplicación (anonimizado)</li>
                        <li>Rendimiento y errores</li>
                        <li>Mejoras de funcionalidad</li>
                      </ul>
                    </div>
                  </div>
                  <p className='text-gray-600 leading-relaxed mt-4'>
                    Puedes controlar las cookies a través de la configuración de tu navegador.
                  </p>
                </div>
              </section>

              {/* 8. Transferencias Internacionales */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>8. Transferencias Internacionales</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed'>
                    Algunos de nuestros proveedores de servicios pueden estar ubicados fuera de tu país. Cuando
                    transferimos datos internacionalmente, nos aseguramos de que:
                  </p>
                  <ul className='list-disc list-inside text-gray-600 space-y-2 mt-4'>
                    <li>El país de destino tenga un nivel adecuado de protección</li>
                    <li>Se utilicen cláusulas contractuales estándar aprobadas</li>
                    <li>Se implementen salvaguardas técnicas y organizacionales</li>
                    <li>Se cumplan todas las regulaciones aplicables</li>
                  </ul>
                </div>
              </section>

              {/* 9. Menores de Edad */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>9. Protección de Menores</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed'>
                    Nuestro servicio está dirigido a usuarios de 18 años o más. No recopilamos intencionalmente
                    información personal de menores de 18 años. Si descubrimos que hemos recopilado información de un
                    menor, la eliminaremos inmediatamente.
                  </p>
                </div>
              </section>

              {/* 10. Cambios en la Política */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>10. Cambios en esta Política</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed'>
                    Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios
                    significativos a través de:
                  </p>
                  <ul className='list-disc list-inside text-gray-600 space-y-2 mt-4'>
                    <li>Notificaciones dentro de la aplicación</li>
                    <li>Email a la dirección registrada</li>
                    <li>Actualización de la fecha en esta página</li>
                  </ul>
                </div>
              </section>

              {/* 11. Contacto */}
              <section>
                <h3 className='text-xl font-semibold text-gray-900 mb-4'>11. Contacto</h3>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 leading-relaxed mb-4'>
                    Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tu información, puedes
                    contactarnos:
                  </p>
                  <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <h4 className='font-semibold text-gray-800 mb-2'>📧 Email</h4>
                        <p className='text-sm text-gray-600'>privacy@moodlogapp.com</p>
                      </div>
                      <div>
                        <h4 className='font-semibold text-gray-800 mb-2'>🏢 Dirección</h4>
                        <p className='text-sm text-gray-600'>[Tu dirección de empresa]</p>
                      </div>
                      <div>
                        <h4 className='font-semibold text-gray-800 mb-2'>📞 Teléfono</h4>
                        <p className='text-sm text-gray-600'>[Tu número de teléfono]</p>
                      </div>
                      <div>
                        <h4 className='font-semibold text-gray-800 mb-2'>⏰ Horario</h4>
                        <p className='text-sm text-gray-600'>Lunes a Viernes, 9:00 - 18:00</p>
                      </div>
                    </div>
                  </div>
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
                  <Link to='/terms' className='text-sm text-primary-600 hover:text-primary-700'>
                    Términos de Servicio
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

export default Privacy;
