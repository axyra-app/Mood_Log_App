// Terms and Conditions Page
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
            <span>Volver</span>
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>Términos y Condiciones</h1>
        </div>

        {/* Content */}
        <div className='bg-white rounded-2xl shadow-lg p-8 space-y-8'>
          <div className='text-sm text-gray-500'>
            Última actualización: 2 de enero de 2025
          </div>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>1. Aceptación de los Términos</h2>
            <p className='text-gray-700 leading-relaxed'>
              Al acceder y utilizar Mood Log App, aceptas estar sujeto a estos términos y condiciones de uso. 
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestra aplicación.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>2. Descripción del Servicio</h2>
            <p className='text-gray-700 leading-relaxed'>
              Mood Log App es una aplicación web diseñada para el seguimiento del estado de ánimo y bienestar mental. 
              Ofrecemos herramientas para registrar emociones, conectar con profesionales de la salud mental, 
              y acceder a recursos de bienestar.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>3. Uso Apropiado</h2>
            <p className='text-gray-700 leading-relaxed mb-4'>
              Te comprometes a utilizar la aplicación de manera responsable y ética:
            </p>
            <ul className='list-disc list-inside text-gray-700 space-y-2 ml-4'>
              <li>Proporcionar información veraz y precisa</li>
              <li>No utilizar la aplicación para actividades ilegales o dañinas</li>
              <li>Respetar la privacidad de otros usuarios</li>
              <li>No intentar acceder a cuentas de otros usuarios</li>
              <li>No transmitir contenido ofensivo o inapropiado</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>4. Privacidad y Protección de Datos</h2>
            <p className='text-gray-700 leading-relaxed'>
              Tu privacidad es importante para nosotros. Toda la información personal y de salud mental 
              que compartas será tratada con la máxima confidencialidad y de acuerdo con nuestra 
              Política de Privacidad. Utilizamos medidas de seguridad avanzadas para proteger tus datos.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>5. Servicios de Salud Mental</h2>
            <p className='text-gray-700 leading-relaxed mb-4'>
              <strong>Importante:</strong> Mood Log App no reemplaza el consejo médico profesional. 
              Si experimentas una crisis de salud mental, contacta inmediatamente a:
            </p>
            <ul className='list-disc list-inside text-gray-700 space-y-2 ml-4'>
              <li>Línea Nacional de Prevención del Suicidio: 106 (Colombia)</li>
              <li>Emergencias: 123</li>
              <li>Tu profesional de salud mental de confianza</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>6. Limitación de Responsabilidad</h2>
            <p className='text-gray-700 leading-relaxed'>
              Mood Log App se proporciona "tal como está" sin garantías de ningún tipo. 
              No nos hacemos responsables por daños directos, indirectos, incidentales o consecuenciales 
              que puedan resultar del uso de nuestra aplicación.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>7. Modificaciones</h2>
            <p className='text-gray-700 leading-relaxed'>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. 
              Las modificaciones entrarán en vigor inmediatamente después de su publicación en la aplicación. 
              Es tu responsabilidad revisar periódicamente estos términos.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-gray-900 mb-4'>8. Contacto</h2>
            <p className='text-gray-700 leading-relaxed'>
              Si tienes preguntas sobre estos términos y condiciones, puedes contactarnos en:
            </p>
            <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
              <p className='text-gray-700'>
                <strong>Email:</strong> soporte@moodlogapp.com<br />
                <strong>Teléfono:</strong> +57 (1) 234-5678<br />
                <strong>Dirección:</strong> Bogotá, Colombia
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
