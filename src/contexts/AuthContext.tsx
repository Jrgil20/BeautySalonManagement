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
        const user = await dataProvider.users.authenticate(email, password);
        if (user) {
          return { user };
        } else {
          return { error: { message: 'Email o contraseña incorrectos' } };
        }
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

      // Create new user
      const newUser: Omit<User, 'id' | 'createdAt'> = {
        email: email.toLowerCase(),
        password,
        name: metadata?.name || 'New User',
        role: 'admin',
        isActive: true,
        salonId: `salon-${Date.now()}`,
        salonName: metadata?.salonName || 'New Salon',
      };

      await dataProvider.users.create(newUser);
      return {};
    } catch (error) {
      console.error('Error creating user:', error);
      return { error: { message: 'Error creating user account' } };
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