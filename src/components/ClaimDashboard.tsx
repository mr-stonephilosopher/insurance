'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
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
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      case 'under_investigation': return <Eye className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Insurance Fraud Detection Dashboard</h1>
        <Button onClick={fetchDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingClaims.length} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Claims</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highRiskClaims.length}</div>
            <p className="text-xs text-muted-foreground">
              Score >= 75
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Rings</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{fraudRings.length}</div>
            <p className="text-xs text-muted-foreground">
              Active networks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalSuspiciousAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Under investigation
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="claims">Claims Review</TabsTrigger>
          <TabsTrigger value="fraud-rings">Fraud Rings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent High Risk Claims */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Recent High Risk Claims
                </CardTitle>
                <CardDescription>
                  Claims requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {highRiskClaims.slice(0, 5).map((claim) => (
                    <div key={claim.claim_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{claim.patient_name}</p>
                        <p className="text-sm text-gray-600">{claim.claim_id}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getSeverityColor(claim.severity)}>
                            {claim.severity}
                          </Badge>
                          <span className={`text-sm font-medium ${getFraudScoreColor(claim.fraud_score)}`}>
                            Score: {claim.fraud_score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedClaim(claim)}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fraud Rings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  Active Fraud Rings
                </CardTitle>
                <CardDescription>
                  Detected networks requiring investigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fraudRings.slice(0, 5).map((ring) => (
                    <div key={ring.cluster_id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Cluster {ring.cluster_id}</p>
                        <Badge variant="outline">
                          Risk: {ring.risk_score.toFixed(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {ring.active_claims_count} active claims
                      </p>
                      <p className="text-sm text-gray-600">
                        ${ring.total_suspicious_amount.toLocaleString()} suspicious amount
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(ring.risk_score, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Claims</CardTitle>
              <CardDescription>
                Review and manage all insurance claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fraud Score</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.claim_id}>
                      <TableCell className="font-medium">{claim.claim_id}</TableCell>
                      <TableCell>{claim.patient_name}</TableCell>
                      <TableCell>${claim.total_amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${getFraudScoreColor(claim.fraud_score)}`}>
                          {claim.fraud_score.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(claim.severity)}>
                          {claim.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(claim.status)}
                          <span className="capitalize">{claim.status.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedClaim(claim)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud-rings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Ring Analysis</CardTitle>
              <CardDescription>
                Detailed view of detected fraud networks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {fraudRings.map((ring) => (
                  <div key={ring.cluster_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Fraud Ring {ring.cluster_id}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">
                          {ring.active_claims_count} claims
                        </Badge>
                        <Badge variant="outline">
                          Risk: {ring.risk_score.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Detection Date</p>
                        <p className="font-medium">{new Date(ring.detection_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Connected Entities</p>
                        <p className="font-medium">{ring.entity_ids.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Suspicious Amount</p>
                        <p className="font-medium text-red-600">
                          ${ring.total_suspicious_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Entity IDs:</p>
                      <div className="flex flex-wrap gap-2">
                        {ring.entity_ids.map((entityId) => (
                          <Badge key={entityId} variant="secondary" className="text-xs">
                            {entityId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fraud Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => {
                    const count = claims.filter(c => c.severity === severity).length
                    const percentage = claims.length > 0 ? (count / claims.length) * 100 : 0
                    
                    return (
                      <div key={severity} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{severity}</span>
                          <span className="text-sm text-gray-600">{count} claims ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Claim Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['pending', 'under_investigation', 'approved', 'rejected'].map((status) => {
                    const count = claims.filter(c => c.status === status).length
                    const percentage = claims.length > 0 ? (count / claims.length) * 100 : 0
                    
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium capitalize">{status.replace('_', ' ')}</span>
                          <span className="text-sm text-gray-600">{count} claims ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Claim Review: {selectedClaim.claim_id}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedClaim(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Patient Name</p>
                  <p className="font-medium">{selectedClaim.patient_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claim Amount</p>
                  <p className="font-medium">${selectedClaim.total_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fraud Score</p>
                  <p className={`font-medium text-lg ${getFraudScoreColor(selectedClaim.fraud_score)}`}>
                    {selectedClaim.fraud_score.toFixed(1)}/100
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Severity</p>
                  <Badge className={getSeverityColor(selectedClaim.severity)}>
                    {selectedClaim.severity}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">SHAP Explanation</p>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Risk Analysis</AlertTitle>
                  <AlertDescription>
                    {selectedClaim.shap_summary}
                  </AlertDescription>
                </Alert>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Recommended Action</p>
                <div className="flex gap-2">
                  {selectedClaim.fraud_score >= 75 && (
                    <Button 
                      variant="destructive"
                      onClick={() => updateClaimStatus(selectedClaim.claim_id, 'under_investigation')}
                    >
                      Start Investigation
                    </Button>
                  )}
                  <Button 
                    variant="default"
                    onClick={() => updateClaimStatus(selectedClaim.claim_id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => updateClaimStatus(selectedClaim.claim_id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ClaimDashboard
