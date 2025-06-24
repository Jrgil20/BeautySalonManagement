import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types/auth';
import { authService } from '../services/authService';

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; csrfToken: string; sessionExpiry: Date } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_CSRF_TOKEN'; payload: string };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  csrfToken: null,
  sessionExpiry: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        csrfToken: action.payload.csrfToken,
        sessionExpiry: action.payload.sessionExpiry,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        csrfToken: null,
        sessionExpiry: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
        csrfToken: authService.getCSRFToken(),
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_CSRF_TOKEN':
      return {
        ...state,
        csrfToken: action.payload,
      };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (emailOrUsername: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { isValid, user } = await authService.verifySession();
        
        if (isValid && user) {
          const csrfToken = authService.getCSRFToken();
          const sessionExpiry = new Date();
          sessionExpiry.setMinutes(sessionExpiry.getMinutes() + 30); // 30 minutes from now
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, csrfToken, sessionExpiry },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_CSRF_TOKEN', payload: authService.getCSRFToken() });
        }
      } catch (error) {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_CSRF_TOKEN', payload: authService.getCSRFToken() });
      }
    };

    checkSession();
  }, []);

  // Auto-logout on session expiry
  useEffect(() => {
    if (state.sessionExpiry && state.isAuthenticated) {
      const timeUntilExpiry = state.sessionExpiry.getTime() - Date.now();
      
      if (timeUntilExpiry > 0) {
        const timeoutId = setTimeout(() => {
          logout();
        }, timeUntilExpiry);

        return () => clearTimeout(timeoutId);
      } else {
        logout();
      }
    }
  }, [state.sessionExpiry, state.isAuthenticated]);

  const login = async (emailOrUsername: string, password: string, rememberMe: boolean): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await authService.login(
        { emailOrUsername, password, rememberMe },
        // In a real app, you'd get the IP address from the request
        '127.0.0.1'
      );

      if (response.success && response.user && response.csrfToken && response.expiresAt) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            csrfToken: response.csrfToken,
            sessionExpiry: response.expiresAt,
          },
        });
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: response.error || 'Login failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Network error occurred' });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      
      // Prevent back button access by replacing history
      window.history.replaceState(null, '', '/login');
      
      // Clear any cached data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if service call fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, clearError }}>
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