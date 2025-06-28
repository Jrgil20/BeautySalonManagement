import React, { createContext, useContext, ReactNode } from 'react';
import { useDataProvider } from './DataProviderContext';
import { User } from '../types';

interface AuthContextType {
  signUp: (email: string, password: string, metadata?: { name?: string; salonName?: string }) => Promise<{ error?: { message: string } }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { dataProvider } = useDataProvider();
  const [loading, setLoading] = React.useState(false);

  const signUp = async (email: string, password: string, metadata?: { name?: string; salonName?: string }) => {
    setLoading(true);
    
    try {
      // Check if user already exists
      const existingUsers = await dataProvider.users.getAll('');
      const userExists = existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (userExists) {
        return { error: { message: 'User already registered' } };
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

  const value: AuthContextType = {
    signUp,
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