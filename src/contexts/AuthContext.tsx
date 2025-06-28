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
        const result = await dataProvider.users.authenticate(email, password);
        if (result.user) {
          return { user: result.user };
        } else {
          return { error: { message: result.error?.message || 'Error al iniciar sesión' } };
        }
      } else {
        // Use Supabase authentication for normal mode
        const result = await dataProvider.users.authenticate(email, password);
        if (result.user) {
          return { user: result.user };
        } else {
          return { error: { message: result.error?.message || 'Error al iniciar sesión' } };
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

      // Use Supabase authentication for user registration
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
        return { error: { message: error.message } };
      }

      // If signup successful, create user profile in our database
      if (data.user) {
        const newUser: Omit<User, 'createdAt'> = {
          id: data.user.id,
          email: email.toLowerCase(),
          name: metadata?.name || 'New User',
          role: 'admin',
          isActive: true,
          salonId: `salon-${Date.now()}`,
          salonName: metadata?.salonName || 'New Salon',
        };

        try {
          await dataProvider.users.create(newUser);
        } catch (dbError) {
          console.error('Error creating user profile:', dbError);
          // User was created in auth but profile creation failed
          // This is not a critical error for the signup flow
        }
      }

      return {};
    } catch (error) {
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