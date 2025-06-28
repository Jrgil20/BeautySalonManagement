import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserPlus, 
  Eye, 
  EyeOff, 
  Mail,
  Lock,
  User as UserIcon,
  Building,
  Phone,
  MapPin,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function Register() {
  const { state, dispatch } = useApp();
  const { signUp, loading } = useAuth();
  const [step, setStep] = useState(1); // 1: User Info, 2: Salon Info, 3: Success
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // User data
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'admin' | 'manager' | 'employee',
    
    // Salon data
    salonName: '',
    salonType: '',
    address: '',
    phone: '',
    salonEmail: '',
  });

  const salonTypes = [
    { value: 'general', label: 'Salón General', description: 'Servicios completos de belleza' },
    { value: 'hair', label: 'Peluquería', description: 'Especializado en cabello' },
    { value: 'nails', label: 'Salón de Uñas', description: 'Especializado en manicura y pedicura' },
    { value: 'spa', label: 'Spa & Wellness', description: 'Tratamientos de relajación y bienestar' },
    { value: 'makeup', label: 'Estudio de Maquillaje', description: 'Especializado en maquillaje profesional' },
    { value: 'barbershop', label: 'Barbería', description: 'Especializado en cortes masculinos' },
  ];

  // Validation functions
  const validateField = (name: string, value: string): string | undefined => {
    let errorMessage: string | undefined;
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errorMessage = 'El nombre es obligatorio';
        } else if (value.trim().length < 2) {
          errorMessage = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 50) {
          errorMessage = 'El nombre no puede exceder 50 caracteres';
        }
        break;

      case 'email':
        if (!value.trim()) {
          errorMessage = 'El email es obligatorio';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errorMessage = 'Por favor ingresa un email válido';
          } else if (state.users.some(u => u.email === value.toLowerCase())) {
            errorMessage = 'Este email ya está registrado';
          }
        }
        break;

      case 'password':
        if (!value) {
          errorMessage = 'La contraseña es obligatoria';
        } else if (value.length < 6) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errorMessage = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          errorMessage = 'Confirma tu contraseña';
        } else if (value !== formData.password) {
          errorMessage = 'Las contraseñas no coinciden';
        }
        break;

      case 'salonName':
        if (!value.trim()) {
          errorMessage = 'El nombre del salón es obligatorio';
        } else if (value.trim().length < 2) {
          errorMessage = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 100) {
          errorMessage = 'El nombre no puede exceder 100 caracteres';
        }
        break;

      case 'salonType':
        if (!value) {
          errorMessage = 'Selecciona el tipo de salón';
        }
        break;

      case 'address':
        if (!value.trim()) {
          errorMessage = 'La dirección es obligatoria';
        } else if (value.trim().length < 10) {
          errorMessage = 'La dirección debe tener al menos 10 caracteres';
        } else if (value.trim().length > 200) {
          errorMessage = 'La dirección no puede exceder 200 caracteres';
        }
        break;

      case 'phone':
        if (!value.trim()) {
          errorMessage = 'El teléfono es obligatorio';
        } else {
          const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
          if (!phoneRegex.test(value)) {
            errorMessage = 'Por favor ingresa un teléfono válido';
          }
        }
        break;

      case 'salonEmail':
        if (!value.trim()) {
          errorMessage = 'El email del salón es obligatorio';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errorMessage = 'Por favor ingresa un email válido';
          }
        }
        break;
    }

    return errorMessage;
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    const errorMessage = validateField(name, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (errorMessage) {
        newErrors[name] = errorMessage;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const checkStep1Validity = () => {
    const fields = ['name', 'email', 'password', 'confirmPassword'];
    return fields.every(field => 
      !validateField(field, formData[field as keyof typeof formData] as string)
    );
  };

  const checkStep2Validity = () => {
    const fields = ['salonName', 'salonType', 'address', 'phone', 'salonEmail'];
    return fields.every(field => 
      !validateField(field, formData[field as keyof typeof formData] as string)
    );
  };

  const runFullValidationAndSetErrors = (step: number) => {
    const fields = step === 1 
      ? ['name', 'email', 'password', 'confirmPassword']
      : ['salonName', 'salonType', 'address', 'phone', 'salonEmail'];
    
    const newErrors: {[key: string]: string} = {};
    let isValid = true;
    
    fields.forEach(field => {
      const errorMessage = validateField(field, formData[field as keyof typeof formData] as string);
      if (errorMessage) {
        newErrors[field] = errorMessage;
        isValid = false;
      }
    });
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNextStep = () => {
    if (step === 1 && runFullValidationAndSetErrors(1)) {
      setStep(2);
    } else if (step === 2 && runFullValidationAndSetErrors(2)) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await signUp(
        formData.email.toLowerCase(),
        formData.password,
        {
          name: formData.name.trim(),
          salonName: formData.salonName.trim(),
        }
      );
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setErrors({ submit: 'Este email ya está registrado. Intenta iniciar sesión.' });
        } else if (error.message.includes('Password should be at least')) {
          setErrors({ submit: 'La contraseña debe tener al menos 6 caracteres.' });
        } else {
          setErrors({ submit: error.message || 'Error al crear la cuenta. Por favor intenta de nuevo.' });
        }
      } else {
        // Show success step
        setStep(3);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({ submit: 'Error al crear la cuenta. Por favor intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'login' });
  };

  const handleGoToLogin = () => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'login' });
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Cuenta Creada!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu cuenta y salón "{formData.salonName}" han sido creados exitosamente. 
            Hemos enviado un email de confirmación a tu dirección de correo. 
            Por favor confirma tu email antes de iniciar sesión.
          </p>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="text-sm font-medium text-gray-900">{formData.email}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Salón:</span>
              <span className="text-sm font-medium text-gray-900">{formData.salonName}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Rol:</span>
              <span className="text-sm font-medium text-gray-900">Administrador</span>
            </div>
          </div>
          
          <button
            onClick={handleGoToLogin}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 max-w-md w-full">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Crear Cuenta
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 1 ? 'Información personal' : 'Información del salón'}
          </p>
        </header>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Salón *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.salonName}
                    onChange={(e) => handleFieldChange('salonName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.salonName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre de tu salón"
                  />
                </div>
                {errors.salonName && (
                  <p className="text-red-600 text-xs mt-1">{errors.salonName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Salón *
                </label>
                <select
                  required
                  value={formData.salonType}
                  onChange={(e) => handleFieldChange('salonType', e.target.value)}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.salonType ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona el tipo de salón</option>
                  {salonTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
                {errors.salonType && (
                  <p className="text-red-600 text-xs mt-1">{errors.salonType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Dirección completa del salón"
                  />
                </div>
                {errors.address && (
                  <p className="text-red-600 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+34 912 345 678"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email del Salón *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={formData.salonEmail}
                    onChange={(e) => handleFieldChange('salonEmail', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.salonEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="contacto@tusalon.com"
                  />
                </div>
                {errors.salonEmail && (
                  <p className="text-red-600 text-xs mt-1">{errors.salonEmail}</p>
                )}
              </div>
            </>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex space-x-4">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 flex items-center justify-center bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Anterior
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || loading || (step === 1 ? !checkStep1Validity() : !checkStep2Validity())}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creando...
                </div>
              ) : (
                step === 1 ? 'Siguiente' : 'Crear Cuenta'
              )}
            </button>
          </div>
        </form>

        <footer className="mt-8 text-center">
          <button
            onClick={handleBackToLogin}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </footer>
      </div>
    </div>
  );
}