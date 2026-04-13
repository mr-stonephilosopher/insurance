'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';

interface DigiLockerData {
  aadhaar: string;
  name: string;
  dob: string;
  gender: string;
  address: string;
  phone: string;
  email: string;
}

interface DigiLockerAuthProps {
  onSuccess: (data: DigiLockerData) => void;
  onError: (error: string) => void;
}

export default function DigiLockerAuth({ onSuccess, onError }: DigiLockerAuthProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'redirecting' | 'authenticating' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleDigiLockerAuth = async () => {
    setIsAuthenticating(true);
    setAuthStep('redirecting');
    setError(null);

    try {
      // In a real implementation, this would redirect to DigiLocker OAuth
      // For demo purposes, we'll simulate the flow
      
      // Step 1: Redirect to DigiLocker
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAuthStep('authenticating');
      
      // Step 2: Simulate user authentication in DigiLocker
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Step 3: Get user data from DigiLocker API
      const mockDigiLockerData: DigiLockerData = {
        aadhaar: '1234 5678 9012',
        name: 'Rahul Kumar Sharma',
        dob: '15/01/1990',
        gender: 'Male',
        address: 'Plot No. 123, Sector 45, Gurgaon, Haryana - 122001',
        phone: '+91-9876543210',
        email: 'rahul.sharma@example.com'
      };
      
      setAuthStep('success');
      onSuccess(mockDigiLockerData);
      
    } catch (err) {
      setAuthStep('error');
      const errorMessage = err instanceof Error ? err.message : 'DigiLocker authentication failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getStatusMessage = () => {
    switch (authStep) {
      case 'redirecting':
        return 'Redirecting to DigiLocker...';
      case 'authenticating':
        return 'Authenticating with DigiLocker...';
      case 'success':
        return 'Successfully authenticated with DigiLocker!';
      case 'error':
        return error || 'Authentication failed';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (authStep) {
      case 'redirecting':
      case 'authenticating':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="text-blue-600 w-6 h-6" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">DigiLocker Authentication</h3>
          <p className="text-sm text-gray-600">Secure government-verified identity verification</p>
        </div>
      </div>

      {/* Authentication Status */}
      {authStep !== 'idle' && (
        <div className={`mb-6 p-4 rounded-lg border ${
          authStep === 'success' ? 'bg-green-50 border-green-200' :
          authStep === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${
              authStep === 'success' ? 'text-green-700' :
              authStep === 'error' ? 'text-red-700' :
              'text-blue-700'
            }`}>
              {getStatusMessage()}
            </span>
          </div>
        </div>
      )}

      {/* Authentication Button */}
      <div className="space-y-4">
        <button
          onClick={handleDigiLockerAuth}
          disabled={isAuthenticating || authStep === 'success'}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {authStep === 'redirecting' ? 'Redirecting...' : 'Authenticating...'}
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Authenticate with DigiLocker
            </>
          )}
        </button>

        {/* DigiLocker Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExternalLink className="text-gray-500 w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-2">About DigiLocker:</p>
              <ul className="space-y-1">
                <li>Government of India's official digital document wallet</li>
                <li>Secure access to your Aadhaar, PAN, and other documents</li>
                <li>Verified by UIDAI and Ministry of Electronics & IT</li>
                <li>256-bit SSL encryption for secure data transmission</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-900">Instant KYC</p>
            <p className="text-xs text-gray-600">Skip manual verification</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-900">Secure</p>
            <p className="text-xs text-gray-600">Government verified</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <ExternalLink className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-900">Paperless</p>
            <p className="text-xs text-gray-600">Digital documents only</p>
          </div>
        </div>
      </div>

      {/* Success Data Display */}
      {authStep === 'success' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">Verified Information:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium text-gray-900">Rahul Kumar Sharma</span>
            </div>
            <div>
              <span className="text-gray-600">Aadhaar:</span>
              <span className="ml-2 font-medium text-gray-900">1234 5678 9012</span>
            </div>
            <div>
              <span className="text-gray-600">DOB:</span>
              <span className="ml-2 font-medium text-gray-900">15/01/1990</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2 font-medium text-gray-900">+91-9876543210</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
