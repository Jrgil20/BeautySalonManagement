import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useDataProvider } from '../contexts/DataProviderContext';
import { 
  Sparkles, 
  Package, 
  BarChart3, 
  Users, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
  Globe
} from 'lucide-react';

export function LandingPage() {
  const { dispatch } = useApp();
  const { switchToMock, switchToDatabase } = useDataProvider();

  const handleGetStarted = () => {
    switchToDatabase(); // Use real Supabase data (or mock in normal mode)
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'login' });
  };

  const handleViewDemo = () => {
    switchToMock(); // Use demonstration data
    // Navigate to login page where demo accounts will be displayed
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'login' });
  };
  
  const features = [
    {
      icon: Package,
      title: 'Gestión de Inventario',
      description: 'Control completo de productos, stock mínimo, fechas de vencimiento y alertas automáticas.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Análisis Financiero',
      description: 'Dashboard con métricas clave, gráficos de rendimiento y análisis de rentabilidad.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Multi-Salón',
      description: 'Gestiona múltiples salones desde una sola plataforma con datos independientes.',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Shield,
      title: 'Roles y Permisos',
      description: 'Sistema de usuarios con diferentes niveles de acceso: admin, gerente y empleado.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Servicios Inteligentes',
      description: 'Calcula automáticamente costos de servicios basados en productos utilizados.',
      color: 'from-orange-500 to-amber-500'
    },
    {
      icon: Globe,
      title: 'Proveedores',
      description: 'Gestión completa de proveedores con historial de productos y contactos.',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  const benefits = [
    'Reduce tiempo de gestión administrativa',
    'Evita pérdidas por productos vencidos',
    'Optimiza niveles de inventario',
    'Mejora la rentabilidad de servicios',
    'Centraliza información de múltiples salones',
    'Genera reportes automáticos'
  ];

  const stats = [
    { number: '3 min', label: 'Setup Inicial', icon: Clock },
    { number: '0€', label: 'Costo de Prueba', icon: TrendingUp },
    { number: 'Multi', label: 'Salones', icon: Users },
    { number: 'Cloud', label: 'Acceso Seguro', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg mr-3">
                <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Glam Stock
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Iniciar Sesión
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full text-sm font-medium text-purple-800 mb-8">
              <Star className="w-4 h-4 mr-2" aria-hidden="true" />
              Sistema de Gestión Integral para Salones de Belleza
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transforma tu
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> Salón </span>
              con Tecnología
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gestiona inventario, servicios, proveedores y finanzas de múltiples salones desde una sola plataforma. 
              Optimiza tu negocio y aumenta la rentabilidad con análisis inteligentes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg font-semibold"
              >
                Comenzar Ahora
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </button>
              <button
                onClick={handleViewDemo}
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200 text-lg font-semibold"
              >
                Ver Demo
                <Sparkles className="w-5 h-5 ml-2" aria-hidden="true" />
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'register' })}
                className="text-purple-600 hover:text-purple-700 text-lg font-medium transition-colors"
              >
                ¿No tienes cuenta? Crear Cuenta
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20 animate-pulse" aria-hidden="true"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-20 animate-pulse delay-1000" aria-hidden="true"></div>
      </section>

      {/* Floating Bolt.new Badge */}
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 flex items-center justify-center w-30 h-30 hover:scale-110 transition-transform duration-200 z-50 drop-shadow-2xl"
        aria-label="Powered by Bolt.new"
      >
        <img
          src="/white_circle_360x360.png"
          alt="Powered by Bolt.new"
          className="w-24 h-24"
        />
      </a>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm" aria-labelledby="stats-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="stats-heading" className="sr-only">Estadísticas del sistema</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <article key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> gestionar tu salón</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas profesionales diseñadas específicamente para la industria de la belleza
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg mb-6`}>
                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-500" aria-labelledby="benefits-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 id="benefits-heading" className="text-3xl md:text-4xl font-bold text-white mb-6">
                Beneficios que transformarán tu negocio
              </h2>
              <p className="text-pink-100 text-lg mb-8">
                Únete a cientos de salones que ya optimizaron sus operaciones y aumentaron su rentabilidad.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-pink-200 mr-3 flex-shrink-0" aria-hidden="true" />
                    <span className="text-white">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">15%</div>
                  <div className="text-pink-200 mb-4">Ahorro promedio en costos</div>
                  <div className="text-3xl font-bold text-white mb-2">2 horas</div>
                  <div className="text-pink-200 mb-4">Menos tiempo en administración diaria</div>
                  <div className="text-3xl font-bold text-white mb-2">99%</div>
                  <div className="text-pink-200">Satisfacción de usuarios</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white" aria-labelledby="cta-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ¿Listo para revolucionar tu salón?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Comienza tu prueba gratuita hoy y descubre cómo Glam Stock puede transformar tu negocio.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg font-semibold"
          >
            Comenzar Prueba Gratuita
            <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg mr-3">
                <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Glam Stock
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              Sistema de Gestión Integral para Salones de Belleza
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 Glam Stock. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}