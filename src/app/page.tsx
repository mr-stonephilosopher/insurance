'use client';

import React, { useState, useEffect } from 'react';
import { Wand2, ShieldCheck, UserCheck, BarChart3, ArrowRight, TrendingUp, FileText, Users, Building2, Eye, AlertTriangle, CheckCircle, Clock, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '../lib/auth';

interface DashboardStats {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  fraudDetectionRate: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    amount?: number;
  }>;
}

export default function HomeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    fraudDetectionRate: 0,
    recentActivity: []
  });
  const router = useRouter();

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      // Load user-specific stats based on role
      if (storedUser.role === 'insurer') {
        setStats({
          totalClaims: 156,
          pendingClaims: 35,
          approvedClaims: 98,
          rejectedClaims: 23,
          fraudDetectionRate: 24.1,
          recentActivity: [
            { id: '1', type: 'fraud_detected', description: 'Suspicious claim pattern detected', timestamp: '2024-01-15T10:30:00Z', amount: 50000 },
            { id: '2', type: 'claim_approved', description: 'Auto claim approved', timestamp: '2024-01-15T09:15:00Z', amount: 25000 },
            { id: '3', type: 'claim_submitted', description: 'New health claim submitted', timestamp: '2024-01-15T08:45:00Z', amount: 15000 },
            { id: '4', type: 'document_uploaded', description: 'Medical documents uploaded', timestamp: '2024-01-15T07:30:00Z' }
          ]
        });
      } else if (storedUser.role === 'customer') {
        setStats({
          totalClaims: 12,
          pendingClaims: 4,
          approvedClaims: 8,
          rejectedClaims: 0,
          fraudDetectionRate: 0,
          recentActivity: [
            { id: '1', type: 'claim_approved', description: 'Health insurance claim approved', timestamp: '2024-01-15T14:20:00Z', amount: 15000 },
            { id: '2', type: 'claim_submitted', description: 'Car insurance claim submitted', timestamp: '2024-01-14T10:30:00Z', amount: 25000 },
            { id: '3', type: 'document_uploaded', description: 'Accident photos uploaded', timestamp: '2024-01-14T09:15:00Z' }
          ]
        });
      }
    } else {
      router.push('/login');
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = authService.getStoredToken();
      if (token) {
        await authService.logout(token);
      }
      setUser(null);
      authService.clearAuth();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 border-t-2 border-r-2 border-l-2"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isInsurer = user?.role === 'insurer';
  const isCustomer = user?.role === 'customer';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wand2 className="w-8 h-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">BitWizard Dashboard</h1>
              <span className="ml-2 text-sm text-gray-500">
                {isInsurer ? 'Insurance Provider Portal' : 'Customer Portal'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome back,</span>
              <span className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalClaims}</div>
                  <div className="text-sm text-gray-600">Total Claims</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats.pendingClaims}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.approvedClaims}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{stats.rejectedClaims}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
                {isInsurer && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.fraudDetectionRate}%</div>
                    <div className="text-sm text-gray-600">Fraud Detection Rate</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'fraud_detected' ? 'bg-red-100' :
                        activity.type === 'claim_approved' ? 'bg-green-100' :
                        activity.type === 'claim_submitted' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        {activity.type === 'fraud_detected' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        {activity.type === 'claim_approved' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {activity.type === 'claim_submitted' && <FileText className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'document_uploaded' && <Activity className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{activity.description}</div>
                        <div className="text-xs text-gray-500">{activity.timestamp}</div>
                        {activity.amount && (
                          <div className="text-sm text-gray-600">₹{activity.amount.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {isCustomer && (
                  <>
                    <Link
                      href="/customer/submit-claim"
                      className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Submit New Claim</div>
                          <div className="text-xs text-gray-500">File insurance claim</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </Link>

                    <Link
                      href="/customer/policies"
                      className="flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">View Policies</div>
                          <div className="text-xs text-gray-500">Manage insurance policies</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-green-600" />
                    </Link>

                    <Link
                      href="/customer/profile"
                      className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <UserCheck className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">My Profile</div>
                          <div className="text-xs text-gray-500">Update personal information</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-600" />
                    </Link>
                  </>
                )}

                {isInsurer && (
                  <>
                    <Link
                      href="/insurer/review-claims"
                      className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Eye className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Review Claims</div>
                          <div className="text-xs text-gray-500">Process and verify claims</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </Link>

                    <Link
                      href="/insurer/analytics"
                      className="flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Analytics</div>
                          <div className="text-xs text-gray-500">View fraud detection analytics</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-green-600" />
                    </Link>

                    <Link
                      href="/insurer/customers"
                      className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Manage Customers</div>
                          <div className="text-xs text-gray-500">View and manage customer accounts</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-600" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// New home page dashboard with role-based navigation
// TODO: Implement role-based navigation
// TODO: Add dashboard components (e.g. charts, tables, etc.)
