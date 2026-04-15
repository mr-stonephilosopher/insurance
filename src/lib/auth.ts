// Authentication service for BitWizard Insurance System

export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  role: 'customer' | 'insurer';
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone: string;
  aadhaar?: string;
  license_number?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message: string;
  redirect_url?: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api/v1'
  : 'http://localhost:8000/api/v1';

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    if (data.success && data.token) {
      // Store session token and user data
      localStorage.setItem('bitwizard_token', data.token);
      localStorage.setItem('bitwizard_user', JSON.stringify(data.user));
    }

    return data;
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }

    const data: AuthResponse = await response.json();
    
    if (data.success && data.token) {
      // Store session token and user data
      localStorage.setItem('bitwizard_token', data.token);
      localStorage.setItem('bitwizard_user', JSON.stringify(data.user));
    }

    return data;
  }

  async logout(token: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Logout failed');
    }

    // Clear local storage
    localStorage.removeItem('bitwizard_token');
    localStorage.removeItem('bitwizard_user');

    const data = await response.json();
    return data;
  }

  async validateSession(token: string): Promise<User | null> {
    const response = await fetch(`${this.baseUrl}/auth/validate?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  }

  async getCurrentUser(token: string): Promise<User | null> {
    return this.validateSession(token);
  }

  async checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
    const response = await fetch(`${this.baseUrl}/auth/check-username/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Username check failed');
    }

    const data = await response.json();
    return data;
  }

  // Get stored user from localStorage
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('bitwizard_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Get stored token from localStorage
  getStoredToken(): string | null {
    return localStorage.getItem('bitwizard_token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  // Clear stored authentication data
  clearAuth(): void {
    localStorage.removeItem('bitwizard_token');
    localStorage.removeItem('bitwizard_user');
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getStoredUser();
    return user?.role || null;
  }

  // Check if user is customer
  isCustomer(): boolean {
    return this.getUserRole() === 'customer';
  }

  // Check if user is insurer
  isInsurer(): boolean {
    return this.getUserRole() === 'insurer';
  }
}

export const authService = new AuthService();
export default authService;
