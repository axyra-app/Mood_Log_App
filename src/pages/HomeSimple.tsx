import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle,
  Heart,
  MessageCircle,
  Moon,
  Rocket,
  Shield,
  Smartphone,
  Star,
  Sun,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HomeSimple: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const testimonials = [
    {
      name: 'María González',
      role: 'Psicóloga Clínica',
      content:
        'Mood Log App ha revolucionado la forma en que mis pacientes monitorean su bienestar emocional. Los insights de IA son increíblemente precisos.',
      rating: 5,
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Usuario',
      content:
        'Llevo 6 meses usando la app y he visto una mejora significativa en mi autoconocimiento emocional. La interfaz es intuitiva y los reportes muy útiles.',
      rating: 5,
    },
    {
      name: 'Ana Martínez',
      role: 'Terapeuta',
      content:
        'La integración con profesionales de salud mental es excelente. Permite un seguimiento continuo y personalizado de mis pacientes.',
      rating: 5,
    },
  ];

  const features = [
    {
      icon: <Zap className='w-10 h-10' />,
      title: 'ANÁLISIS EMOCIONAL INSTANTÁNEO',
      description:
        'IA de última generación que procesa tus emociones en tiempo real y genera insights brutales sobre tu estado mental.',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: <Target className='w-10 h-10' />,
      title: 'PRECISIÓN MILIMÉTRICA',
      description:
        'Algoritmos avanzados que identifican patrones emocionales con 99.7% de precisión. Sin margen de error.',
      color: 'from-red-500 to-pink-600',
    },
    {
      icon: <Rocket className='w-10 h-10' />,
      title: 'TRANSFORMACIÓN BRUTAL',
      description: 'Conecta con los mejores psicólogos del mundo. Tu evolución emocional será exponencial.',
      color: 'from-purple-600 to-indigo-700',
    },
    {
      icon: <BarChart3 className='w-10 h-10' />,
      title: 'DATOS QUE IMPACTAN',
      description: 'Visualizaciones de datos que te mostrarán tu progreso de manera brutal y honesta.',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: <Shield className='w-10 h-10' />,
      title: 'SEGURIDAD EXTREMA',
      description: 'Encriptación militar. Tus datos están más protegidos que los secretos de estado.',
      color: 'from-blue-600 to-cyan-500',
    },
    {
      icon: <Smartphone className='w-10 h-10' />,
      title: 'POTENCIA MÓVIL',
      description: 'PWA que funciona offline. Tu bienestar emocional, siempre contigo, sin excusas.',
      color: 'from-gray-700 to-gray-900',
    },
  ];

  const benefits = [
    'AUTOCONOCIMIENTO EMOCIONAL BRUTAL',
    'IDENTIFICACIÓN DE PATRONES SIN PIEDAD',
    'RECOMENDACIONES QUE CAMBIAN VIDAS',
    'CONEXIÓN CON LOS MEJORES PROFESIONALES',
    'ACCESO 24/7 SIN LÍMITES',
    'INTERFAZ QUE IMPACTA',
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header
        className={`relative z-10 border-b transition-all duration-500 ${
          isDarkMode ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'
        } backdrop-blur-lg`}
      >
        <nav className='container mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
              >
                <Heart className='w-7 h-7 text-white' />
              </div>
              <span
                className={`text-3xl font-black transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                MOOD LOG
              </span>
            </div>
            <div className='hidden md:flex items-center space-x-8'>
              <a
                href='#features'
                className={`font-bold text-sm uppercase tracking-wider transition-colors duration-500 hover:scale-105 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                CARACTERÍSTICAS
              </a>
              <a
                href='#testimonials'
                className={`font-bold text-sm uppercase tracking-wider transition-colors duration-500 hover:scale-105 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                TESTIMONIOS
              </a>
              <a
                href='#pricing'
                className={`font-bold text-sm uppercase tracking-wider transition-colors duration-500 hover:scale-105 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                PRECIOS
              </a>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={toggleDarkMode}
                className={`p-3 rounded-xl transition-all duration-500 hover:scale-110 ${
                  isDarkMode
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
              </button>
              <Link
                to='/login'
                className={`font-bold text-sm uppercase tracking-wider transition-all duration-500 hover:scale-105 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                INICIAR SESIÓN
              </Link>
              <Link
                to='/register'
                className={`font-black text-sm uppercase tracking-wider py-4 px-8 rounded-2xl transition-all duration-500 hover:scale-105 transform ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/25'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/25'
                }`}
              >
                REGISTRARSE
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className={`relative z-10 container mx-auto px-6 py-32 text-center transition-all duration-500 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className='max-w-6xl mx-auto'>
          <div className='mb-8'>
            <span
              className={`inline-block px-6 py-3 rounded-full text-sm font-black uppercase tracking-wider transition-all duration-500 ${
                isDarkMode
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'bg-purple-100 text-purple-600 border border-purple-200'
              }`}
            >
              ⚡ REVOLUCIÓN EMOCIONAL ⚡
            </span>
          </div>
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black mb-8 leading-tight transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            <span className='block'>TU</span>
            <span className='block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent break-words'>
              TRANSFORMACIÓN
            </span>
            <span className='block'>EMOCIONAL</span>
          </h1>
          <p
            className={`text-xl md:text-2xl font-bold mb-12 max-w-4xl mx-auto leading-relaxed transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            IA de última generación que analiza tus emociones con precisión milimétrica.
            <span className='block mt-2 text-lg'>
              Conecta con los mejores psicólogos del mundo. Tu evolución será BRUTAL.
            </span>
          </p>
          <div className='flex flex-col sm:flex-row gap-6 justify-center items-center'>
            <Link
              to='/register'
              className={`group font-black text-lg uppercase tracking-wider py-6 px-12 rounded-2xl transition-all duration-500 hover:scale-110 transform flex items-center justify-center space-x-3 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50'
              }`}
            >
              <span>COMENZAR AHORA</span>
              <ArrowRight className='w-6 h-6 group-hover:translate-x-1 transition-transform duration-300' />
            </Link>
            <button
              className={`group font-bold text-lg uppercase tracking-wider py-6 px-12 rounded-2xl transition-all duration-500 hover:scale-110 transform border-2 ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              VER DEMO BRUTAL
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id='features'
        className={`relative z-10 py-32 transition-all duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
      >
        <div className='container mx-auto px-6'>
          <div className='text-center mb-20'>
            <h2
              className={`text-5xl md:text-7xl font-black mb-6 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              CARACTERÍSTICAS
              <span className='block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                BRUTALES
              </span>
            </h2>
            <p
              className={`text-xl md:text-2xl font-bold max-w-4xl mx-auto transition-colors duration-500 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Tecnología de vanguardia que transformará tu bienestar emocional de manera radical
            </p>
          </div>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:scale-105 transform ${
                  isDarkMode
                    ? 'bg-gray-900 border border-gray-700 hover:border-gray-600'
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                } hover:shadow-2xl`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>
                <div className='relative z-10'>
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                  >
                    <div className='text-white'>{feature.icon}</div>
                  </div>
                  <h3
                    className={`text-lg font-black uppercase tracking-wider mb-4 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`relative z-10 py-32 transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className='container mx-auto px-6'>
          <div
            className={`rounded-3xl p-12 md:p-16 border-2 transition-all duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className='grid md:grid-cols-2 gap-16 items-center'>
              <div>
                <h2
                  className={`text-5xl md:text-6xl font-black mb-8 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  ¿POR QUÉ ELEGIR
                  <span className='block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                    MOOD LOG?
                  </span>
                </h2>
                <div className='space-y-6'>
                  {benefits.map((benefit, index) => (
                    <div key={index} className='flex items-center space-x-4 group'>
                      <div className='w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                        <CheckCircle className='w-5 h-5 text-white' />
                      </div>
                      <span
                        className={`text-lg font-bold transition-colors duration-500 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className='text-center'>
                <div
                  className={`rounded-3xl p-12 border-2 transition-all duration-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className='w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-6'>
                    <TrendingUp className='w-10 h-10 text-white' />
                  </div>
                  <h3
                    className={`text-6xl font-black mb-4 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    +99.7%
                  </h3>
                  <p
                    className={`text-xl font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    de usuarios experimentan
                    <span className='block text-lg mt-2'>transformación emocional BRUTAL</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id='testimonials'
        className={`relative z-10 py-32 transition-all duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
      >
        <div className='container mx-auto px-6'>
          <div className='text-center mb-20'>
            <h2
              className={`text-5xl md:text-7xl font-black mb-6 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              TESTIMONIOS
              <span className='block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                BRUTALES
              </span>
            </h2>
            <p
              className={`text-xl md:text-2xl font-bold transition-colors duration-500 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Historias reales de transformación emocional radical
            </p>
          </div>
          <div className='max-w-5xl mx-auto'>
            <div
              className={`rounded-3xl p-12 border-2 transition-all duration-500 ${
                isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className='text-center'>
                <div className='flex justify-center mb-8'>
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className='w-8 h-8 text-yellow-400 fill-current' />
                  ))}
                </div>
                <p
                  className={`text-2xl md:text-3xl font-bold mb-8 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}
                >
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div>
                  <h4
                    className={`text-2xl font-black mb-2 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p
                    className={`text-lg font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </div>
            <div className='flex justify-center mt-12 space-x-3'>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-125 ${
                    index === currentTestimonial
                      ? `${isDarkMode ? 'bg-purple-500' : 'bg-purple-600'}`
                      : `${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`relative z-10 py-32 transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className='container mx-auto px-6 text-center'>
          <div
            className={`rounded-3xl p-16 border-2 transition-all duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <h2
              className={`text-5xl md:text-7xl font-black mb-8 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              ¿LISTO PARA TU
              <span className='block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                TRANSFORMACIÓN?
              </span>
            </h2>
            <p
              className={`text-xl md:text-2xl font-bold mb-12 max-w-4xl mx-auto leading-relaxed transition-colors duration-500 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Únete a miles de usuarios que ya están experimentando una evolución emocional BRUTAL.
              <span className='block mt-4 text-lg'>Tu bienestar mental nunca será igual.</span>
            </p>
            <div className='flex flex-col sm:flex-row gap-6 justify-center items-center'>
              <Link
                to='/register'
                className={`group font-black text-xl uppercase tracking-wider py-8 px-16 rounded-2xl transition-all duration-500 hover:scale-110 transform flex items-center justify-center space-x-4 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                }`}
              >
                <span>COMENZAR AHORA</span>
                <ArrowRight className='w-6 h-6 group-hover:translate-x-2 transition-transform duration-300' />
              </Link>
              <Link
                to='/login'
                className={`font-bold text-xl uppercase tracking-wider py-8 px-16 rounded-2xl transition-all duration-500 hover:scale-110 transform border-2 ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                YA TENGO CUENTA
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`relative z-10 py-16 border-t-2 transition-all duration-500 ${
          isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className='container mx-auto px-6'>
          <div className='grid md:grid-cols-4 gap-12'>
            <div>
              <div className='flex items-center space-x-3 mb-6'>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                >
                  <Heart className='w-7 h-7 text-white' />
                </div>
                <span
                  className={`text-2xl font-black transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  MOOD LOG
                </span>
              </div>
              <p
                className={`text-lg font-bold leading-relaxed transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Tu compañero personal para una transformación emocional BRUTAL y sin límites.
              </p>
            </div>
            <div>
              <h4
                className={`text-xl font-black uppercase tracking-wider mb-6 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                PRODUCTO
              </h4>
              <ul className='space-y-3'>
                <li>
                  <a
                    href='#features'
                    className={`text-lg font-bold transition-colors duration-500 hover:scale-105 ${
                      isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    CARACTERÍSTICAS
                  </a>
                </li>
                <li>
                  <a
                    href='#pricing'
                    className={`text-lg font-bold transition-colors duration-500 hover:scale-105 ${
                      isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    PRECIOS
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className={`text-lg font-bold transition-colors duration-500 hover:scale-105 ${
                      isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className={`text-xl font-black uppercase tracking-wider mb-6 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                SOPORTE
              </h4>
              <ul className='space-y-3'>
                <li>
                  <Link
                    to='/terms'
                    className={`text-lg font-bold transition-colors duration-500 hover:scale-105 ${
                      isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    TÉRMINOS
                  </Link>
                </li>
                <li>
                  <Link
                    to='/privacy'
                    className={`text-lg font-bold transition-colors duration-500 hover:scale-105 ${
                      isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    PRIVACIDAD
                  </Link>
                </li>
                <li>
                  <a
                    href='#'
                    className={`text-lg font-bold transition-colors duration-500 hover:scale-105 ${
                      isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    AYUDA
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className={`text-xl font-black uppercase tracking-wider mb-6 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                CONECTAR
              </h4>
              <div className='flex space-x-4'>
                <a
                  href='#'
                  className={`p-3 rounded-xl transition-all duration-500 hover:scale-110 ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900'
                  }`}
                >
                  <MessageCircle className='w-6 h-6' />
                </a>
                <a
                  href='#'
                  className={`p-3 rounded-xl transition-all duration-500 hover:scale-110 ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900'
                  }`}
                >
                  <Award className='w-6 h-6' />
                </a>
              </div>
            </div>
          </div>
          <div
            className={`border-t-2 mt-12 pt-8 text-center transition-all duration-500 ${
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            }`}
          >
            <p
              className={`text-lg font-bold transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              © 2024 MOOD LOG APP. TODOS LOS DERECHOS RESERVADOS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeSimple;
