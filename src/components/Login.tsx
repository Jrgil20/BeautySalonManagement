import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useDataProvider } from '../contexts/DataProviderContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogIn, 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  Mail,
  Shield,
  Users,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Login() {
  const { dispatch } = useApp();
  const { isMock } = useDataProvider();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validación básica
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      if (isMock) {
        // Use demo authentication for mock data
        const { user, error } = await signIn(email, password);
        if (user) {
          dispatch({ type: 'LOGIN_USER', payload: user });
          dispatch({ type: 'SET_CURRENT_VIEW', payload: 'dashboard' });
        } else {
          setError(error?.message || 'Email o contraseña incorrectos');
        }
      } else {
        // Use Supabase authentication for normal mode
        const { user, error } = await signIn(email, password);
        if (user) {
          dispatch({ type: 'LOGIN_USER', payload: user });
          dispatch({ type: 'SET_CURRENT_VIEW', payload: 'dashboard' });
        } else {
          setError(error?.message || 'Error al iniciar sesión');
        }
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <section className="bg-white rounded-2xl shadow-2xl p-8">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Glam Stock
            </h1>
            <p className="text-gray-600 mt-2">Sistema de Gestión Integral</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <footer className="mt-8 text-center">
            {isMock && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Modo Demo Activo</p>
                <p className="text-xs text-blue-600 mt-1">
                  Usa cualquier email/contraseña de las cuentas de demostración
                </p>
              </div>
            )}
            <div className="mt-4">
              <button
                onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'register' })}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
              >
                ¿No tienes cuenta? Regístrate
              </button>
            </div>
          </footer>
        </section>

        {isMock && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cuentas de Demostración</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">admin@glamstock.com / admin123</p>
                <p className="text-gray-600">Administrador - Glam Stock Central</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">manager@glamstock.com / manager123</p>
                <p className="text-gray-600">Gerente - Glam Stock Central</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">admin@estiloytijeras.com / admin123</p>
                <p className="text-gray-600">Administrador - Estilo y Tijeras</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}