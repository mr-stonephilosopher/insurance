'use client';

import React, { useState, useEffect } from 'react';
import { Wand2, Eye, EyeOff, Mail, Lock, User, Building2, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService, { LoginRequest, SignupRequest } from '../../lib/auth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'insurer'>('customer');
  const [formData, setFormData] = useState<LoginRequest | SignupRequest>({
    username: '',
    password: '',
    remember_me: false,
    email: '',
    confirm_password: '',
    role: 'customer',
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    aadhaar: '',
    license_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getStoredUser();
      if (user) {
        const redirectUrl = user.role === 'insurer' ? '/insurer/dashboard' : '/customer/dashboard';
        router.push(redirectUrl);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const loginData: LoginRequest = {
        username: formData.username,
        password: formData.password,
        remember_me: (formData as LoginRequest).remember_me || false
      };

      const response = await authService.login(loginData);
      
      if (response.success) {
        setSuccess('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          const redirectUrl = response.user?.role === 'insurer' ? '/insurer/dashboard' : '/customer/dashboard';
          router.push(redirectUrl);
        }, 1500);
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const signupData: SignupRequest = {
        username: formData.username,
        email: (formData as SignupRequest).email,
        password: formData.password,
        confirm_password: (formData as SignupRequest).confirm_password,
        role: selectedRole,
        first_name: (formData as SignupRequest).first_name,
        middle_name: (formData as SignupRequest).middle_name,
        last_name: (formData as SignupRequest).last_name,
        phone: (formData as SignupRequest).phone,
        aadhaar: (formData as SignupRequest).aadhaar,
        license_number: (formData as SignupRequest).license_number
      };

      const response = await authService.signup(signupData);
      
      if (response.success) {
        setSuccess('Account created successfully! Please login with your credentials.');
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            username: '',
            password: '',
            remember_me: false,
            email: '',
            confirm_password: '',
            role: 'customer',
            first_name: '',
            middle_name: '',
            last_name: '',
            phone: '',
            aadhaar: '',
            license_number: ''
          });
        }, 2000);
      } else {
        setError(response.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wand2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">BitWizard</h1>
          </div>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
                  className={`flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                    (formData as SignupRequest).role === 'customer'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'insurer' }))}
                  className={`flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                    (formData as SignupRequest).role === 'insurer'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Insurer
                </button>
              </div>
            </div>
          )}
          <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}>
            {/* Username Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="sara.sharma"
              />
            </div>

            {/* Email Field (Signup only) */}
          {!isLogin && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required={!isLogin}
                  value={(formData as SignupRequest).email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="sara.sharma@example.com"
                />
              </div>
            </div>
          )}

          {/* Name Fields (Signup only) */}
          {!isLogin && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required={!isLogin}
                  value={(formData as SignupRequest).first_name}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sara"
                />
              </div>
              <div>
                <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name (Optional)
                </label>
                <input
                  id="middle_name"
                  name="middle_name"
                  type="text"
                  value={(formData as SignupRequest).middle_name}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Kumari"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required={!isLogin}
                  value={(formData as SignupRequest).last_name}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sharma"
                />
              </div>
            </div>
          )}

          {/* Phone Field (Signup only) */}
          {!isLogin && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required={!isLogin}
                value={(formData as SignupRequest).phone}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+91-9876543210"
              />
            </div>
          )}

          {/* Role-specific Fields */}
          {!isLogin && (formData as SignupRequest).role === 'customer' && (
            <div>
              <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Number
              </label>
              <input
                id="aadhaar"
                name="aadhaar"
                type="text"
                required={(formData as SignupRequest).role === 'customer'}
                value={(formData as SignupRequest).aadhaar}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234 5678 9012"
              />
            </div>
          )}

          {!isLogin && (formData as SignupRequest).role === 'insurer' && (
            <div>
              <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-2">
                IRDA License Number
              </label>
              <input
                id="license_number"
                name="license_number"
                type="text"
                required={(formData as SignupRequest).role === 'insurer'}
                value={(formData as SignupRequest).license_number}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="IRDA-123456"
              />
            </div>
          )}

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Signup only) */}
          {!isLogin && (
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required={!isLogin}
                  value={(formData as SignupRequest).confirm_password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me (Login only) */}
          {isLogin && (
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                checked={(formData as LoginRequest).remember_me}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                Remember me for 30 days
              </label>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white border-t-2 border-transparent mr-2"></div>
              ) : null}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-600">
            <div className="font-medium text-gray-900 mb-2">Demo Accounts:</div>
            <div className="space-y-1">
              <div><strong>Customer:</strong> sara.sharma / password123</div>
              <div><strong>Customer:</strong> amit.patel / password123</div>
              <div><strong>Customer:</strong> priya.gupta / password123</div>
              <div><strong>Insurer:</strong> lic.agent / password123</div>
              <div><strong>Insurer:</strong> icici.agent / password123</div>
            </div>
          </div>
        </div>

      {/* Toggle Login/Signup */}
      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </span>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="font-medium text-blue-600 hover:text-blue-500 text-sm ml-1"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </div>
    </div>
      </div>
    </div>
  );
}
