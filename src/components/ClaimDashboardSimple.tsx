'use client'

import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  TrendingUp,
  Users,
  Shield,
  FileText,
  Wand2
} from 'lucide-react'

interface Claim {
  claim_id: string
  patient_name: string
  total_amount: number
  fraud_score: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'pending' | 'approved' | 'rejected' | 'under_investigation'
  submission_date: string
  shap_summary: string
  requires_review: boolean
}

interface FraudRing {
  cluster_id: string
  entity_ids: string[]
  detection_date: string
  risk_score: number
  active_claims_count: number
  total_suspicious_amount: number
}

const ClaimDashboard: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([])
  const [fraudRings, setFraudRings] = useState<FraudRing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [claimsResponse, fraudRingsResponse] = await Promise.all([
        fetch('/api/v1/claims/'),
        fetch('/api/v1/claims/fraud-rings/')
      ])

      if (claimsResponse.ok && fraudRingsResponse.ok) {
        const claimsData = await claimsResponse.json()
        const fraudRingsData = await fraudRingsResponse.json()
        
        setClaims(claimsData)
        setFraudRings(fraudRingsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />
      case 'under_investigation': return <Eye className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getFraudScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const updateClaimStatus = async (claimId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/claims/${claimId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_status: newStatus }),
      })

      if (response.ok) {
        fetchDashboardData()
        setSelectedClaim(null)
      }
    } catch (error) {
      console.error('Error updating claim status:', error)
    }
  }

  const highRiskClaims = claims.filter(c => c.fraud_score >= 75)
  const pendingClaims = claims.filter(c => c.status === 'pending')
  const totalSuspiciousAmount = fraudRings.reduce((sum, ring) => sum + ring.total_suspicious_amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">BitWizard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Fraud Detection Dashboard</span>
              <button 
                onClick={fetchDashboardData}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <h1 className="text-2xl font-light text-gray-900 mb-8">Insurance Fraud Detection</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Claims</span>
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-light text-gray-900">{claims.length}</div>
            <div className="text-xs text-gray-500 mt-1">{pendingClaims.length} pending review</div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">High Risk Claims</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-light text-red-600">{highRiskClaims.length}</div>
            <div className="text-xs text-gray-500 mt-1">Score &gt;= 75</div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Fraud Rings</span>
              <Users className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-light text-orange-600">{fraudRings.length}</div>
            <div className="text-xs text-gray-500 mt-1">Active networks</div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Suspicious Amount</span>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-light text-red-600">
              ${totalSuspiciousAmount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Under investigation</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {['overview', 'claims', 'fraud-rings', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent High Risk Claims */}
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Recent High Risk Claims
                </h3>
                <p className="text-sm text-gray-600 mt-1">Claims requiring immediate attention</p>
              </div>
              <div className="p-6 space-y-4">
                {highRiskClaims.slice(0, 5).map((claim) => (
                  <div key={claim.claim_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{claim.patient_name}</p>
                      <p className="text-sm text-gray-600">{claim.claim_id}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(claim.severity)}`}>
                          {claim.severity}
                        </span>
                        <span className={`text-sm font-medium ${getFraudScoreColor(claim.fraud_score)}`}>
                          Score: {claim.fraud_score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedClaim(claim)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Fraud Rings Summary */}
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  Active Fraud Rings
                </h3>
                <p className="text-sm text-gray-600 mt-1">Detected networks requiring investigation</p>
              </div>
              <div className="p-6 space-y-4">
                {fraudRings.slice(0, 5).map((ring) => (
                  <div key={ring.cluster_id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">Cluster {ring.cluster_id}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-orange-200 bg-orange-50 text-orange-800">
                        Risk: {ring.risk_score.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{ring.active_claims_count} active claims</p>
                    <p className="text-sm text-gray-600">${ring.total_suspicious_amount.toLocaleString()} suspicious amount</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(ring.risk_score, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Claims</h3>
              <p className="text-sm text-gray-600 mt-1">Review and manage all insurance claims</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fraud Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {claims.map((claim) => (
                    <tr key={claim.claim_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.claim_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.patient_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${claim.total_amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${getFraudScoreColor(claim.fraud_score)}`}>
                          {claim.fraud_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(claim.severity)}`}>
                          {claim.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(claim.status)}
                          <span className="capitalize">{claim.status.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => setSelectedClaim(claim)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Claim Review: {selectedClaim.claim_id}</h3>
              <button 
                onClick={() => setSelectedClaim(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Patient Name</p>
                  <p className="font-medium text-gray-900">{selectedClaim.patient_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claim Amount</p>
                  <p className="font-medium text-gray-900">${selectedClaim.total_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fraud Score</p>
                  <p className={`font-medium text-lg ${getFraudScoreColor(selectedClaim.fraud_score)}`}>
                    {selectedClaim.fraud_score.toFixed(1)}/100
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Severity</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(selectedClaim.severity)}`}>
                    {selectedClaim.severity}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">SHAP Explanation</p>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Risk Analysis</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {selectedClaim.shap_summary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Recommended Action</p>
                <div className="flex gap-2">
                  {selectedClaim.fraud_score >= 75 && (
                    <button 
                      onClick={() => updateClaimStatus(selectedClaim.claim_id, 'under_investigation')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
                    >
                      Start Investigation
                    </button>
                  )}
                  <button 
                    onClick={() => updateClaimStatus(selectedClaim.claim_id, 'approved')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => updateClaimStatus(selectedClaim.claim_id, 'rejected')}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClaimDashboard
