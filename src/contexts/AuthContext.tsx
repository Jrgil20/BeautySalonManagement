import React, { createContext, useContext, ReactNode } from 'react';
import { useDataProvider } from './DataProviderContext';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<{ user?: User; error?: { message: string } }>;
  signUp: (email: string, password: string, metadata?: { name?: string; salonName?: string }) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { dataProvider, isMock } = useDataProvider();
  const [loading, setLoading] = React.useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      if (isMock) {
        // Use mock authentication for demo mode
        const user = await dataProvider.users.authenticate(email, password);
        if (user) {
          return { user };
        } else {
          return { error: { message: 'Email o contraseña incorrectos' } };
        }
      } else {
        // Use Supabase authentication for normal mode
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        });

        if (error) {
          // Handle specific authentication errors
          if (error.message === 'Invalid login credentials') {
            return { error: { message: 'Email o contraseña incorrectos' } };
          }
          if (error.message.includes('Email not confirmed')) {
            return { error: { message: 'Por favor confirma tu email antes de iniciar sesión' } };
          }
          return { error: { message: error.message || 'Error al iniciar sesión' } };
        }

        if (!data.user) {
          return { error: { message: 'Error al iniciar sesión' } };
        }

        // Get user profile from our database
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return { error: { message: 'Error al obtener el perfil del usuario' } };
        }

        if (!userProfile) {
          // User exists in auth but not in our users table or is inactive
          // This can happen if profile creation failed during registration
          return { error: { message: 'Perfil de usuario no encontrado. Por favor contacta al soporte.' } };
        }

        // Convert database user to our User type
        const user: User = {
          id: userProfile.id,
          email: userProfile.email,
          password: '', // Don't return password
          name: userProfile.name,
          role: userProfile.role,
          avatar: userProfile.avatar,
          isActive: userProfile.is_active,
          salonId: userProfile.salon_id,
          salonName: userProfile.salon_name,
          lastLogin: userProfile.last_login ? new Date(userProfile.last_login) : undefined,
          createdAt: new Date(userProfile.created_at),
        };

        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);

        return { user };
      }
    } catch (error: any) {
      console.error('Error during sign in:', error);
      return { error: { message: error.message || 'Error al iniciar sesión' } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: { name?: string; salonName?: string }) => {
    setLoading(true);
    
    try {
      if (isMock) {
        return { error: { message: 'El registro no está disponible en modo demo' } };
      }

      // First, check if user already exists in our database
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (existingUser) {
        return { error: { message: 'Este email ya está registrado. Intenta iniciar sesión.' } };
      }

      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            name: metadata?.name || 'New User',
            salon_name: metadata?.salonName || 'New Salon',
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
          return { error: { message: 'Este email ya está registrado. Intenta iniciar sesión.' } };
        }
        if (error.message.includes('Password should be at least')) {
          return { error: { message: 'La contraseña debe tener al menos 6 caracteres.' } };
        }
        return { error: { message: error.message } };
      }

      if (!data.user) {
        return { error: { message: 'Error al crear la cuenta de usuario' } };
      }

      // Create user profile in our database
      const salonId = `salon-${Date.now()}`;
      
      // First create the salon
      const { error: salonError } = await supabase
        .from('salons')
        .insert({
          id_salon: salonId,
          name: metadata?.salonName || 'New Salon',
        });

      if (salonError) {
        console.error('Error creating salon:', salonError);
        return { error: { message: `Error al crear el salón: ${salonError.message}` } };
      }
      
      // Then create the user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email.toLowerCase(),
          name: metadata?.name || 'New User',
          role: 'admin',
          is_active: true,
          salon_id: salonId,
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        
        return { error: { message: `Error al crear el perfil de usuario: ${profileError.message}` } };
      }

      // If email confirmation is required, inform the user but profile is already created
      if (!data.user.email_confirmed_at && !data.user.confirmed_at) {
        // Profile was created successfully, just need email confirmation for login
        return {};
      }

      return {};
    } catch (error: any) {
      console.error('Error creating user:', error);
      return { error: { message: 'Error al crear la cuenta. Por favor intenta de nuevo.' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (!isMock) {
        await supabase.auth.signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    signIn,
    signUp,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}