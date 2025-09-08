import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Heart, 
  Brain, 
  Users, 
  BarChart3, 
  Shield, 
  Smartphone, 
  ArrowRight, 
  CheckCircle,
  Star,
  TrendingUp,
  MessageCircle,
  Award
} from 'lucide-react';
import SEO from '../components/SEO';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Remover dependencia del AuthContext para evitar errores
  // useEffect(() => {
  //   if (user && !loading) {
  //     navigate('/dashboard');
  //   }
  // }, [user, loading, navigate]);

  const testimonials = [
    {
      name: "María González",
      role: "Psicóloga Clínica",
      content: "Mood Log App ha revolucionado la forma en que mis pacientes monitorean su bienestar emocional. Los insights de IA son increíblemente precisos.",
      rating: 5
    },
    {
      name: "Carlos Rodríguez",
      role: "Usuario",
      content: "Llevo 6 meses usando la app y he visto una mejora significativa en mi autoconocimiento emocional. La interfaz es intuitiva y los reportes muy útiles.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Terapeuta",
      content: "La integración con profesionales de salud mental es excelente. Permite un seguimiento continuo y personalizado de mis pacientes.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Seguimiento Emocional",
      description: "Registra tu estado de ánimo diario con nuestra interfaz intuitiva y obtén insights personalizados."
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Análisis con IA",
      description: "Nuestra inteligencia artificial analiza patrones emocionales y proporciona recomendaciones personalizadas."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Conexión Profesional",
      description: "Conecta con psicólogos y terapeutas certificados para recibir apoyo profesional cuando lo necesites."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Estadísticas Detalladas",
      description: "Visualiza tu progreso con gráficos y estadísticas que te ayudan a entender tus patrones emocionales."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacidad Total",
      description: "Tus datos están protegidos con encriptación de grado militar. Tu privacidad es nuestra prioridad."
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Acceso Móvil",
      description: "Accede a tu información desde cualquier dispositivo. Sincronización automática y modo offline."
    }
  ];

  const stats = [
    { number: "50K+", label: "Usuarios Activos" },
    { number: "1M+", label: "Registros de Estado de Ánimo" },
    { number: "95%", label: "Satisfacción del Usuario" },
    { number: "24/7", label: "Soporte Disponible" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <>
      <SEO 
        title="Mood Log App - Tu Compañero de Bienestar Emocional"
        description="La aplicación líder para el seguimiento del estado de ánimo. Conecta con profesionales, obtén insights de IA y mejora tu bienestar emocional."
        keywords="mood tracking, bienestar emocional, psicología, terapia, IA, salud mental"
      />
      
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Mood Log App
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Características</a>
                <a href="#testimonials" className="text-gray-600 hover:text-purple-600 transition-colors">Testimonios</a>
                <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Precios</a>
                <Link to="/login" className="text-gray-600 hover:text-purple-600 transition-colors">Iniciar Sesión</Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Empezar Gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 mr-2" />
                    #1 App de Bienestar Emocional
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Tu Compañero de
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Bienestar Emocional</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Descubre patrones en tus emociones, conecta con profesionales de salud mental y mejora tu bienestar con el poder de la inteligencia artificial.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/register" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <span>Empezar Gratis</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200 flex items-center justify-center"
                  >
                    Iniciar Sesión
                  </Link>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Gratis para empezar</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Sin tarjeta de crédito</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Configuración en 2 minutos</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">¿Cómo te sientes hoy?</h3>
                        <p className="text-sm text-gray-500">Registra tu estado de ánimo</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-3">
                      {['😢', '😕', '😐', '😊', '🤩'].map((emoji, index) => (
                        <button key={index} className="w-12 h-12 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center text-2xl">
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Insight de IA</h4>
                        <p className="text-sm text-gray-600">"Has mostrado una tendencia positiva en los últimos 7 días. ¡Sigue así!"</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">Progreso semanal</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">+15%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Todo lo que necesitas para tu bienestar emocional
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Una plataforma completa que combina tecnología avanzada con el cuidado humano para ayudarte a entender y mejorar tu estado emocional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Lo que dicen nuestros usuarios
              </h2>
              <p className="text-xl text-gray-600">
                Miles de personas ya han transformado su bienestar emocional con nuestra app
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl leading-relaxed mb-6">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold">{testimonials[currentTestimonial].name}</div>
                    <div className="text-white/80">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentTestimonial ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              ¿Listo para transformar tu bienestar emocional?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Únete a miles de personas que ya están mejorando su calidad de vida con Mood Log App
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Empezar Gratis Ahora</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200 flex items-center justify-center"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">Mood Log App</span>
                </div>
                <p className="text-gray-400">
                  Tu compañero de confianza para el bienestar emocional.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Producto</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Características</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Precios</a></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Términos</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Soporte</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                  <li><Link to="/forgot-password" className="hover:text-white transition-colors">Recuperar Contraseña</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/terms" className="hover:text-white transition-colors">Términos de Servicio</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Mood Log App. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
