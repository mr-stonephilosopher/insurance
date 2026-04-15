'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  BarChart3,
  Activity,
  Eye,
  Video,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '../../../lib/auth';

interface Claim {
  claimId: string;
  customerId: string;
  customerName: string;
  claimType: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedDate: string;
  fraudScore: number;
  severity: 'low' | 'medium' | 'high';
  riskFactors: string[];
  aiSummary: string;
  documents: string[];
}

interface Insurer {
  companyName: string;
  licenseNumber: string;
  totalClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  pendingClaims: number;
  fraudDetectionRate: number;
}

export default function InsurerDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [insurer, setInsurer] = useState<Insurer | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showAIDetails, setShowAIDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication and load insurer data
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = authService.getStoredUser();
    if (user && user.role === 'insurer') {
      setInsurer({
        companyName: user.first_name ? `${user.first_name} ${user.last_name} Insurance` : 'LIC of India',
        licenseNumber: 'IRDA-123456',
        totalClaims: 156,
        approvedClaims: 98,
        rejectedClaims: 23,
        pendingClaims: 35,
        fraudDetectionRate: 24.1
      });

      // Load sample claims with AI analysis
      const sampleClaims: Claim[] = [
          {
            claimId: 'HEALTH-2024-001',
            customerId: 'CUST-001',
            customerName: 'Rahul Kumar Sharma',
            claimType: 'Health Insurance',
            amount: 85000,
            status: 'under_review',
            submittedDate: '2024-01-15',
            fraudScore: 0.35,
            severity: 'medium',
            riskFactors: ['Unusual billing pattern', 'High claim amount', 'First-time claimant'],
            aiSummary: 'AI analysis indicates medium risk due to billing anomalies and first-time claim status. Recommend manual review of medical documents.',
            documents: ['hospital_bill.pdf', 'discharge_summary.pdf', 'prescriptions.pdf']
          },
          {
            claimId: 'AUTO-2024-002',
            customerId: 'CUST-002',
            customerName: 'Priya Kumari Patel',
            claimType: 'Car Insurance',
            amount: 125000,
            status: 'pending',
            submittedDate: '2024-01-20',
            fraudScore: 0.78,
            severity: 'high',
            riskFactors: ['Staged accident indicators', 'Inflated repair costs', 'Multiple recent claims'],
            aiSummary: 'High fraud probability detected. Pattern suggests potential staged accident with inflated repair estimates. Immediate investigation recommended.',
            documents: ['accident_report.pdf', 'repair_estimate.pdf', 'photos.zip']
          },
          {
            claimId: 'LIFE-2024-003',
            customerId: 'CUST-003',
            customerName: 'Amit Kumar Singh',
            claimType: 'Life Insurance',
            amount: 2500000,
            status: 'approved',
            submittedDate: '2024-01-10',
            fraudScore: 0.12,
            severity: 'low',
            riskFactors: ['Standard claim pattern', 'Valid documentation'],
            aiSummary: 'Low risk claim with proper documentation. All required documents verified successfully.',
            documents: ['death_certificate.pdf', 'policy_document.pdf', 'medical_records.pdf']
          },
          {
            claimId: 'CORP-2024-004',
            customerId: 'CUST-004',
            customerName: 'Vikram Prasad Gupta',
            claimType: 'Corporate Insurance',
            amount: 450000,
            status: 'under_review',
            submittedDate: '2024-01-22',
            fraudScore: 0.65,
            severity: 'medium',
            riskFactors: ['Business interruption timing', 'Document inconsistencies'],
            aiSummary: 'Medium risk detected due to timing of business interruption claim and some document inconsistencies. Recommend verification with business records.',
            documents: ['business_records.pdf', 'financial_statements.pdf', 'incident_report.pdf']
          }
        ];
        setClaims(sampleClaims);
      }
    setIsLoading(false);
  }, []);

  const handleClaimAction = (action: 'approve' | 'reject' | 'investigate', claimId: string) => {
    setClaims(prev => prev.map(claim => 
      claim.claimId === claimId 
        ? { ...claim, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'under_review' }
        : claim
    ));
  };

  const handleLogout = async () => {
    try {
      const token = authService.getStoredToken();
      if (token) {
        await authService.logout(token);
      }
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if logout fails
      router.push('/login');
    }
  };

  const initiateVideoCall = (customerId: string) => {
    // In a real app, this would integrate with Zoom API
    alert(`Video call initiated with customer ${customerId}! Meeting room: BITWIZARD-${customerId.toUpperCase()}-12345`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'under_review': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getFraudScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!insurer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access your dashboard</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Building2 className="text-green-600 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Insurer Dashboard</h1>
                <p className="text-gray-600">{insurer.companyName} - License: {insurer.licenseNumber}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-blue-600 w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Total Claims</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">{insurer.totalClaims}</div>
            <p className="text-sm text-gray-600">All claims processed</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-600 w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Approved</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">{insurer.approvedClaims}</div>
            <p className="text-sm text-gray-600">Approved claims</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-600 w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Rejected</h3>
            </div>
            <div className="text-3xl font-bold text-red-600">{insurer.rejectedClaims}</div>
            <p className="text-sm text-gray-600">Rejected claims</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-yellow-600 w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Pending</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-600">{insurer.pendingClaims}</div>
            <p className="text-sm text-gray-600">Pending review</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="text-purple-600 w-5 h-5" />
              <h3 className="font-semibold text-gray-900">AI Detection</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600">{insurer.fraudDetectionRate}%</div>
            <p className="text-sm text-gray-600">Fraud detection rate</p>
          </div>
        </div>

        {/* Claims Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Claims List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Claims Analysis</h2>
                <div className="flex items-center gap-2">
                  <Brain className="text-purple-600 w-5 h-5" />
                  <span className="text-sm text-purple-600 font-medium">AI-Powered</span>
                </div>
              </div>

              <div className="space-y-4">
                {claims.map((claim) => (
                  <div key={claim.claimId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{claim.claimId}</h3>
                        <p className="text-sm text-gray-600">{claim.customerName} - {claim.claimType}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border Rs.{getStatusColor(claim.status)}`}>
                          {claim.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border Rs.{getSeverityColor(claim.severity)}`}>
                          {claim.severity.toUpperCase()} RISK
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-semibold text-gray-900">Rs. {claim.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fraud Score</p>
                        <p className={`font-bold Rs.{getFraudScoreColor(claim.fraudScore)}`}>
                          {(claim.fraudScore * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Submitted</p>
                        <p className="font-semibold text-gray-900">{claim.submittedDate}</p>
                      </div>
                    </div>

                    {/* AI Summary */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="text-purple-600 w-4 h-4" />
                        <span className="font-medium text-purple-900">AI Analysis Summary</span>
                      </div>
                      <p className="text-sm text-purple-700">{claim.aiSummary}</p>
                    </div>

                    {/* Risk Factors */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Risk Factors:</p>
                      <div className="flex flex-wrap gap-2">
                        {claim.riskFactors.map((factor, index) => (
                          <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleClaimAction('approve', claim.claimId)}
                        disabled={claim.status === 'approved'}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleClaimAction('reject', claim.claimId)}
                        disabled={claim.status === 'rejected'}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => initiateVideoCall(claim.customerId)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Video Call
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Analysis Panel */}
          <div className="space-y-6">
            {/* AI Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="text-purple-600 w-5 h-5" />
                <h3 className="font-semibold text-gray-900">AI Performance</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accuracy</span>
                  <span className="text-purple-600 font-bold">94.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Processing Speed</span>
                  <span className="text-purple-600 font-bold">&lt; 2s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">False Positives</span>
                  <span className="text-purple-600 font-bold">3.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Model Version</span>
                  <span className="text-purple-600 font-bold">v2.1.0</span>
                </div>
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="text-blue-600 w-5 h-5" />
                <h3 className="font-semibold text-gray-900">Risk Distribution</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">High Risk</span>
                    <span className="text-red-600 font-bold">12</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{width: '30%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Medium Risk</span>
                    <span className="text-yellow-600 font-bold">18</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Low Risk</span>
                    <span className="text-green-600 font-bold">10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-green-600 w-5 h-5" />
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
              </div>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  Export Claims Report
                </button>
                <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                  Retrain AI Model
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
