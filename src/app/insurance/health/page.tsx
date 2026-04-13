'use client';

import React, { useState } from 'react';
import { ShieldCheck, Heart, Activity, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HealthInsurance() {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [formData, setFormData] = useState({
    patientName: '',
    policyNumber: '',
    claimAmount: '',
    diagnosisCode: '',
    hospitalName: '',
    treatmentDate: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to claim submission with pre-filled data
    const claimData = {
      claim_id: `HEALTH-Rs.{Date.now()}`,
      patient_name: formData.patientName,
      total_amount: parseFloat(formData.claimAmount),
      diagnosis_code: formData.diagnosisCode,
      hospital_id: `HOSP-Rs.{formData.hospitalName.replace(/\s+/g, '').toUpperCase()}`,
      attending_doctor_id: `DOC-Rs.{Date.now()}`,
      policyholder_id: formData.policyNumber,
      service_date: formData.treatmentDate,
      submission_type: 'b2b' as const
    };
    
    // Store in localStorage for claim submission page
    localStorage.setItem('health_claim_data', JSON.stringify(claimData));
    window.location.href = '/submit';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShieldCheck className="text-blue-600 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Health Insurance</h1>
              <p className="text-lg text-gray-600">Medical Claims & Fraud Detection</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Claim Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Submit Health Claim</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sara Sharma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="POL-123456"
                  />
                </div>
              </div>

              {/* Claim Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Claim Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claim Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    name="claimAmount"
                    value={formData.claimAmount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis Code (ICD-10)
                  </label>
                  <input
                    type="text"
                    name="diagnosisCode"
                    value={formData.diagnosisCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="M54.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital/Clinic Name
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City General Hospital"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Date
                  </label>
                  <input
                    type="date"
                    name="treatmentDate"
                    value={formData.treatmentDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the treatment and medical procedures..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  Analyze Health Claim
                </button>
              </div>
            </form>
          </div>

          {/* Features & Benefits */}
          <div className="space-y-8">
            {/* Key Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Health Insurance Features</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Heart className="text-red-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Medical Fraud Detection</h4>
                    <p className="text-gray-600 text-sm">AI-powered detection of billing fraud, phantom procedures, and upcoding</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Activity className="text-blue-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Hospital Network Analysis</h4>
                    <p className="text-gray-600 text-sm">Identify suspicious patterns across healthcare providers</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-green-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Prescription Monitoring</h4>
                    <p className="text-gray-600 text-sm">Detect unusual prescription patterns and doctor shopping</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fraud Indicators */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-red-900 mb-4">Common Health Fraud Indicators</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Billing for services not rendered</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Upcoding or phantom billing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Excessive medical procedures</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Duplicate claims for same treatment</span>
                </li>
              </ul>
            </div>

            {/* Industry-Specific Questions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Health Insurance Questions</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 mb-2">1. Pre-existing Conditions</p>
                  <p className="text-sm text-gray-600">Do you have any pre-existing medical conditions?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">Yes</button>
                    <button className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">No</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">2. Hospital Network</p>
                  <p className="text-sm text-gray-600">Is the treatment from a network hospital?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">Network</button>
                    <button className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">Non-Network</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">3. Cashless Treatment</p>
                  <p className="text-sm text-gray-600">Did you opt for cashless treatment?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">Cashless</button>
                    <button className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">Reimbursement</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">4. Previous Claims</p>
                  <p className="text-sm text-gray-600">How many claims in the last 3 years?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">0</button>
                    <button className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">1-2</button>
                    <button className="px-3 py-1 bg-white border border-blue-300 rounded text-sm">3+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Indian Industry Statistics */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Indian Health Insurance Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Average Health Claim</span>
                  <span className="text-blue-600 font-bold">Rs. 85,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Fraud Detection Rate</span>
                  <span className="text-blue-600 font-bold">15.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Processing Time</span>
                  <span className="text-blue-600 font-bold">&lt; 2 seconds</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">IRDA Approved</span>
                  <span className="text-blue-600 font-bold">Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center gap-4">
          <Link 
            href="/insurance/auto" 
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Car Insurance →
          </Link>
          <Link 
            href="/insurance/life" 
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Life Insurance →
          </Link>
          <Link 
            href="/insurance/corporate" 
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Corporate →
          </Link>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
