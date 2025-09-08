import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

const HomeSimple: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      title: "Seguimiento Emocional",
      description: "Registra tu estado de ánimo diario con nuestra interfaz intuitiva y obtén insights personalizados."
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: "IA Avanzada",
      description: "Nuestra IA analiza tus patrones emocionales y te proporciona recomendaciones personalizadas."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Conexión Profesional",
      description: "Conecta con psicólogos certificados para recibir apoyo profesional cuando lo necesites."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-500" />,
      title: "Analytics Detallados",
      description: "Visualiza tu progreso emocional con gráficos y estadísticas detalladas."
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-500" />,
      title: "Privacidad Total",
      description: "Tus datos están completamente seguros con encriptación de extremo a extremo."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-orange-500" />,
      title: "PWA Optimizada",
      description: "Instala la app en tu dispositivo para acceso rápido y funcionamiento offline."
    }
  ];

  const benefits = [
    "Mejora tu autoconocimiento emocional",
    "Identifica patrones y tendencias",
    "Recibe recomendaciones personalizadas",
    "Conecta con profesionales de salud mental",
    "Acceso 24/7 desde cualquier dispositivo",
    "Interfaz intuitiva y fácil de usar"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Mood Log App</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Características</a>
              <a href="#testimonials" className="text-white/80 hover:text-white transition-colors">Testimonios</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Precios</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-white/80 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-white text-purple-600 font-semibold py-2 px-6 rounded-xl hover:bg-white/90 transition-all duration-200"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Tu Compañero Personal para el
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Bienestar Emocional
            </span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Descubre el poder del autoconocimiento emocional con nuestra aplicación 
            impulsada por IA. Conecta con profesionales y transforma tu bienestar mental.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-purple-600 font-semibold py-4 px-8 rounded-xl hover:bg-white/90 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Comenzar Gratis</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="bg-white/20 backdrop-blur-lg text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20">
              Ver Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Todo lo que necesitas para mejorar tu bienestar emocional en una sola aplicación
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  ¿Por qué elegir Mood Log App?
                </h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span className="text-white/90">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <TrendingUp className="w-16 h-16 text-white mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">+95%</h3>
                  <p className="text-white/80">de usuarios reportan mejoras en su bienestar emocional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-white/80">
              Historias reales de transformación y bienestar
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-xl text-white/90 mb-6 italic">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-white/60">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentTestimonial ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-6">
              ¿Listo para transformar tu bienestar emocional?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Únete a miles de usuarios que ya están mejorando su calidad de vida 
              con Mood Log App. Comienza tu viaje hacia el bienestar emocional hoy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-purple-600 font-semibold py-4 px-8 rounded-xl hover:bg-white/90 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Comenzar Ahora</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="bg-white/20 backdrop-blur-lg text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Mood Log App</span>
              </div>
              <p className="text-white/60">
                Tu compañero personal para el seguimiento del estado de ánimo y bienestar emocional.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-white/60 hover:text-white transition-colors">Características</a></li>
                <li><a href="#pricing" className="text-white/60 hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-white/60 hover:text-white transition-colors">Términos</Link></li>
                <li><Link to="/privacy" className="text-white/60 hover:text-white transition-colors">Privacidad</Link></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Ayuda</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Conectar</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <Award className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/60">
              © 2024 Mood Log App. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeSimple;
