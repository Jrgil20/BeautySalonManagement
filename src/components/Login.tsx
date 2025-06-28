import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
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
  const { state, dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showAccounts, setShowAccounts] = useState(false);

  // Auto-show demo accounts when coming from landing page
  useEffect(() => {
    if (state.showDemoAccountsOnLogin) {
      setShowAccounts(true);
      dispatch({ type: 'SET_SHOW_DEMO_ACCOUNTS_ON_LOGIN', payload: false });
    }
  }, [state.showDemoAccountsOnLogin, dispatch]);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    const user = state.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      if (!user.isActive) {
        setError('Esta cuenta está desactivada. Contacta al administrador.');
        return;
      }
      dispatch({ type: 'LOGIN_USER', payload: user });
    } else {
      setError('Email o contraseña incorrectos');
    }
  };

  const handleQuickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'manager':
        return Users;
      case 'employee':
        return User;
      default:
        return User;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'employee':
        return 'Empleado';
      default:
        return 'Usuario';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className={`w-full gap-8 ${showAccounts ? 'max-w-6xl grid grid-cols-1 lg:grid-cols-2' : 'max-w-md'}`}>
        {/* Login Form */}
        <section className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
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
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              Iniciar Sesión
            </button>
          </form>

          <footer className="mt-8 text-center">
            {!state.hideDemoAccountsButton && (
              <button
                onClick={() => setShowAccounts(!showAccounts)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
              >
                {showAccounts ? 'Ocultar' : 'Ver'} cuentas de demostración
              </button>
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

        {/* Registered Accounts Panel */}
        {showAccounts && (
          <section className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
          <header className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cuentas Registradas</h2>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" aria-hidden="true" />
              {state.users.length} usuarios
            </div>
          </header>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {state.users.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              
              return (
                <article
                  key={user.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    user.isActive 
                      ? 'border-gray-200 hover:border-purple-300 bg-white' 
                      : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                  onClick={() => user.isActive && handleQuickLogin(user.email, user.password)}
                >
                  <header className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                        <RoleIcon className="w-5 h-5 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                      {!user.isActive && (
                        <span className="text-xs text-red-500 mt-1">Inactivo</span>
                      )}
                    </div>
                  </header>

                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Contraseña:</span>
                      <p className="font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                        ••••••••
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Último acceso:</span>
                      <div className="flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                        <time>
                          {user.lastLogin 
                            ? format(user.lastLogin, 'dd/MM/yyyy', { locale: es })
                            : 'Nunca'
                          }
                        </time>
                      </div>
                    </div>
                  </div>

                  {user.isActive && (
                    <footer className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-purple-600 font-medium">
                        Haz clic para usar estas credenciales
                      </p>
                    </footer>
                  )}
                </article>
              );
            })}
          </div>

          <aside className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">Información de Demostración</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Haz clic en cualquier cuenta activa para usar sus credenciales</li>
              <li>• Las contraseñas se muestran solo para propósitos de demostración</li>
              <li>• Cada rol tiene diferentes permisos en el sistema</li>
            </ul>
          </aside>
        </section>
        )}
      </div>
    </div>
  );
}