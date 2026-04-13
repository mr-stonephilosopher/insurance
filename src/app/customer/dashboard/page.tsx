'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Upload, 
  Camera, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Video,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface Claim {
  claimId: string;
  claimType: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedDate: string;
  description: string;
  documents: string[];
  fraudScore?: number;
}

interface Customer {
  name: string;
  email: string;
  aadhaar: string;
  phone: string;
  totalClaims: number;
  approvedClaims: number;
  pendingClaims: number;
}

export default function CustomerDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    // Load customer data from localStorage
    const userData = localStorage.getItem('bitwizard_user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role === 'customer') {
        setCustomer({
          name: user.name || 'Sara Sharma',
          email: user.email,
          aadhaar: user.aadhaar || '1234 5678 9012',
          phone: '+91-9876543210',
          totalClaims: 12,
          approvedClaims: 8,
          pendingClaims: 4
        });

        // Load sample claims
        const sampleClaims: Claim[] = [
          {
            claimId: 'HEALTH-2024-001',
            claimType: 'Health Insurance',
            amount: 85000,
            status: 'approved',
            submittedDate: '2024-01-15',
            description: 'Hospitalization for appendicitis surgery at Apollo Hospitals, Delhi',
            documents: ['hospital_bill.pdf', 'discharge_summary.pdf', 'prescriptions.pdf'],
            fraudScore: 0.15
          },
          {
            claimId: 'AUTO-2024-002',
            claimType: 'Car Insurance',
            amount: 125000,
            status: 'under_review',
            submittedDate: '2024-01-20',
            description: 'Car accident damage repair - Maruti Swift DL-4C-AB-1234',
            documents: ['accident_report.pdf', 'repair_estimate.pdf', 'photos.zip'],
            fraudScore: 0.35
          },
          {
            claimId: 'LIFE-2024-003',
            claimType: 'Life Insurance',
            amount: 2500000,
            status: 'pending',
            submittedDate: '2024-01-22',
            description: 'Term life insurance claim - policy holder death',
            documents: ['death_certificate.pdf', 'policy_document.pdf'],
            fraudScore: null
          }
        ];
        setClaims(sampleClaims);
      }
    }
    setIsLoading(false);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleOCRScan = () => {
    setShowOCRScanner(true);
    // In a real app, this would access the camera and perform OCR
    setTimeout(() => {
      setShowOCRScanner(false);
      alert('Document scanned successfully! Text extracted: "Hospital Bill - Total Amount: Rs. 85,000"');
    }, 3000);
  };

  const initiateVideoCall = () => {
    // In a real app, this would integrate with Zoom API
    alert('Video call initiated! Joining meeting room: BITWIZARD-CALL-12345');
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

  if (!customer) {
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
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
                <p className="text-gray-600">Welcome back, {customer.name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={initiateVideoCall}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Video Call
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-blue-600 w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Profile</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Name: {customer.name}</p>
              <p className="text-sm text-gray-600">Aadhaar: {customer.aadhaar}</p>
              <p className="text-sm text-gray-600">Phone: {customer.phone}</p>
              <p className="text-sm text-gray-600">Email: {customer.email}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-green-600 w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Total Claims</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">{customer.totalClaims}</div>
            <p className="text-sm text-gray-600">All time claims</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-600 w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Approved</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">{customer.approvedClaims}</div>
            <p className="text-sm text-gray-600">Approved claims</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-yellow-600 w-5 h-5" />
              <h3 className="font-semibold text-gray-900">Pending</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-600">{customer.pendingClaims}</div>
            <p className="text-sm text-gray-600">Pending claims</p>
          </div>
        </div>

        {/* Document Upload & OCR */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Document Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Upload Documents</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Drop files here or click to upload</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors"
                >
                  Choose Files
                </label>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Files:</h4>
                  <ul className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-4">OCR Document Scanner</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Scan documents using your camera</p>
                <button
                  onClick={handleOCRScan}
                  disabled={showOCRScanner}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  {showOCRScanner ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    'Start OCR Scan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Claims</h2>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              New Claim
            </Link>
          </div>

          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim.claimId} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{claim.claimId}</h3>
                    <p className="text-sm text-gray-600">{claim.claimType}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border Rs.{getStatusColor(claim.status)}`}>
                      {claim.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {claim.fraudScore && (
                      <div className="text-right">
                        <div className={`text-sm font-bold Rs.{getFraudScoreColor(claim.fraudScore)}`}>
                          {(claim.fraudScore * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Risk Score</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold text-gray-900">Rs. {claim.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="font-semibold text-gray-900">{claim.submittedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Documents</p>
                    <p className="font-semibold text-gray-900">{claim.documents.length} files</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-900">{claim.description}</p>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                    Download Documents
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
