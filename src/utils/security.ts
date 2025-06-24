import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import validator from 'validator';
import { User, LoginAttempt, SecurityConfig } from '../types/auth';

// Security configuration
export const SECURITY_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 15, // 15 minutes
  sessionTimeout: 30, // 30 minutes
  rememberMeDuration: 30, // 30 days
  passwordMinLength: 8,
  requireSpecialChars: true,
};

// JWT secrets (in production, these should be environment variables)
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = 'your-super-secret-refresh-key-change-in-production';
const ENCRYPTION_KEY = 'your-encryption-key-change-in-production';

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// JWT token management
export const generateTokens = (user: User, rememberMe: boolean = false) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessTokenExpiry = rememberMe 
    ? `${SECURITY_CONFIG.rememberMeDuration}d` 
    : `${SECURITY_CONFIG.sessionTimeout}m`;

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: accessTokenExpiry,
    issuer: 'beauty-salon-app',
    audience: 'beauty-salon-users',
  });

  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// CSRF token generation
export const generateCSRFToken = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

// Data encryption/decryption
export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Input validation
export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < SECURITY_CONFIG.passwordMinLength) {
    errors.push(`La contraseña debe tener al menos ${SECURITY_CONFIG.passwordMinLength} caracteres`);
  }

  if (SECURITY_CONFIG.requireSpecialChars) {
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial (@$!%*?&)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Rate limiting for login attempts
class RateLimiter {
  private attempts: Map<string, LoginAttempt[]> = new Map();

  isBlocked(identifier: string): boolean {
    const userAttempts = this.attempts.get(identifier) || [];
    const recentAttempts = userAttempts.filter(
      attempt => Date.now() - attempt.timestamp.getTime() < SECURITY_CONFIG.lockoutDuration * 60 * 1000
    );

    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    return failedAttempts.length >= SECURITY_CONFIG.maxLoginAttempts;
  }

  recordAttempt(identifier: string, success: boolean, ipAddress?: string): void {
    const userAttempts = this.attempts.get(identifier) || [];
    userAttempts.push({
      identifier,
      timestamp: new Date(),
      success,
      ipAddress,
    });

    // Keep only recent attempts to prevent memory leaks
    const recentAttempts = userAttempts.filter(
      attempt => Date.now() - attempt.timestamp.getTime() < 24 * 60 * 60 * 1000 // 24 hours
    );

    this.attempts.set(identifier, recentAttempts);
  }

  getRemainingLockoutTime(identifier: string): number {
    const userAttempts = this.attempts.get(identifier) || [];
    const recentFailedAttempts = userAttempts.filter(
      attempt => !attempt.success && Date.now() - attempt.timestamp.getTime() < SECURITY_CONFIG.lockoutDuration * 60 * 1000
    );

    if (recentFailedAttempts.length >= SECURITY_CONFIG.maxLoginAttempts) {
      const oldestFailedAttempt = recentFailedAttempts[0];
      const lockoutEndTime = oldestFailedAttempt.timestamp.getTime() + (SECURITY_CONFIG.lockoutDuration * 60 * 1000);
      return Math.max(0, lockoutEndTime - Date.now());
    }

    return 0;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter();

// Session management
export const generateSessionId = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

// Security headers helper
export const getSecurityHeaders = () => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  };
};