export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  csrfToken: string | null;
  sessionExpiry: Date | null;
}

export interface LoginAttempt {
  identifier: string;
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  csrfToken?: string;
  expiresAt?: Date;
  error?: string;
}

export interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
  rememberMeDuration: number; // in days
  passwordMinLength: number;
  requireSpecialChars: boolean;
}