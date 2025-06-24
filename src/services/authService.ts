import Cookies from 'js-cookie';
import { User, LoginCredentials, AuthResponse } from '../types/auth';
import { 
  hashPassword, 
  verifyPassword, 
  generateTokens, 
  verifyToken,
  generateCSRFToken,
  rateLimiter,
  validateEmail,
  validatePassword,
  SECURITY_CONFIG
} from '../utils/security';

// Mock user database (in production, this would be a real database)
const mockUsers: (User & { hashedPassword: string })[] = [
  {
    id: '1',
    email: 'admin@beautysalon.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    hashedPassword: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5KS', // password: admin123!
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'manager@beautysalon.com',
    username: 'manager',
    firstName: 'Manager',
    lastName: 'User',
    role: 'manager',
    isActive: true,
    hashedPassword: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5KS', // password: manager123!
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
];

class AuthService {
  private csrfToken: string | null = null;

  constructor() {
    this.csrfToken = generateCSRFToken();
  }

  // Generate and store CSRF token
  generateCSRFToken(): string {
    this.csrfToken = generateCSRFToken();
    return this.csrfToken;
  }

  // Validate CSRF token
  validateCSRFToken(token: string): boolean {
    return this.csrfToken === token;
  }

  // Find user by email or username
  private findUser(emailOrUsername: string): (User & { hashedPassword: string }) | null {
    return mockUsers.find(user => 
      user.email.toLowerCase() === emailOrUsername.toLowerCase() ||
      user.username.toLowerCase() === emailOrUsername.toLowerCase()
    ) || null;
  }

  // Login method
  async login(credentials: LoginCredentials, ipAddress?: string): Promise<AuthResponse> {
    try {
      const { emailOrUsername, password, rememberMe } = credentials;

      // Input validation
      if (!emailOrUsername || !password) {
        return {
          success: false,
          error: 'Email/username y contraseña son requeridos',
        };
      }

      // Check rate limiting
      if (rateLimiter.isBlocked(emailOrUsername)) {
        const remainingTime = rateLimiter.getRemainingLockoutTime(emailOrUsername);
        const minutes = Math.ceil(remainingTime / (1000 * 60));
        return {
          success: false,
          error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutes} minutos.`,
        };
      }

      // Find user
      const user = this.findUser(emailOrUsername);
      if (!user) {
        rateLimiter.recordAttempt(emailOrUsername, false, ipAddress);
        return {
          success: false,
          error: 'Credenciales inválidas',
        };
      }

      // Check if user is active
      if (!user.isActive) {
        rateLimiter.recordAttempt(emailOrUsername, false, ipAddress);
        return {
          success: false,
          error: 'Cuenta desactivada. Contacta al administrador.',
        };
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.hashedPassword);
      if (!isPasswordValid) {
        rateLimiter.recordAttempt(emailOrUsername, false, ipAddress);
        return {
          success: false,
          error: 'Credenciales inválidas',
        };
      }

      // Successful login
      rateLimiter.recordAttempt(emailOrUsername, true, ipAddress);
      rateLimiter.reset(emailOrUsername); // Clear failed attempts

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user, rememberMe);

      // Update last login
      user.lastLogin = new Date();

      // Calculate expiry
      const expiresAt = new Date();
      if (rememberMe) {
        expiresAt.setDate(expiresAt.getDate() + SECURITY_CONFIG.rememberMeDuration);
      } else {
        expiresAt.setMinutes(expiresAt.getMinutes() + SECURITY_CONFIG.sessionTimeout);
      }

      // Store tokens in cookies
      const cookieOptions = {
        secure: true,
        sameSite: 'strict' as const,
        httpOnly: false, // We need to access this from JS
      };

      if (rememberMe) {
        cookieOptions.expires = SECURITY_CONFIG.rememberMeDuration;
      }

      Cookies.set('accessToken', accessToken, cookieOptions);
      Cookies.set('refreshToken', refreshToken, cookieOptions);

      // Remove sensitive data
      const { hashedPassword, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token: accessToken,
        refreshToken,
        csrfToken: this.csrfToken,
        expiresAt,
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Error interno del servidor',
      };
    }
  }

  // Logout method
  async logout(): Promise<{ success: boolean }> {
    try {
      // Clear all authentication cookies
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('sessionId');

      // Generate new CSRF token
      this.generateCSRFToken();

      // Log logout event (in production, this would be logged to a database)
      console.log('User logged out at:', new Date().toISOString());

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  }

  // Verify current session
  async verifySession(): Promise<{ isValid: boolean; user?: User }> {
    try {
      const token = Cookies.get('accessToken');
      if (!token) {
        return { isValid: false };
      }

      const decoded = verifyToken(token);
      const user = this.findUser(decoded.email);

      if (!user || !user.isActive) {
        return { isValid: false };
      }

      const { hashedPassword, ...userWithoutPassword } = user;
      return { isValid: true, user: userWithoutPassword };
    } catch (error) {
      return { isValid: false };
    }
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        return { success: false, error: 'No refresh token found' };
      }

      const decoded = verifyToken(refreshToken);
      const user = this.findUser(decoded.email);

      if (!user || !user.isActive) {
        return { success: false, error: 'Invalid user' };
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, false);

      // Update cookies
      Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'strict' });
      Cookies.set('refreshToken', newRefreshToken, { secure: true, sameSite: 'strict' });

      const { hashedPassword, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token: accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      return { success: false, error: 'Failed to refresh token' };
    }
  }

  // Register new user (for admin use)
  async register(userData: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'manager' | 'employee';
  }): Promise<AuthResponse> {
    try {
      // Validate email
      if (!validateEmail(userData.email)) {
        return { success: false, error: 'Email inválido' };
      }

      // Validate password
      const passwordValidation = validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          error: passwordValidation.errors.join(', ') 
        };
      }

      // Check if user already exists
      if (this.findUser(userData.email) || this.findUser(userData.username)) {
        return { success: false, error: 'Usuario ya existe' };
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create new user
      const newUser: User & { hashedPassword: string } = {
        id: Date.now().toString(),
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: true,
        hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to mock database
      mockUsers.push(newUser);

      const { hashedPassword: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  // Get CSRF token
  getCSRFToken(): string {
    return this.csrfToken || this.generateCSRFToken();
  }
}

export const authService = new AuthService();