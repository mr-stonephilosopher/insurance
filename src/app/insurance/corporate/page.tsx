'use client';

import React, { useState } from 'react';
import { Building2, Users, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CorporateInsurance() {
  const [formData, setFormData] = useState({
    companyName: '',
    policyNumber: '',
    claimAmount: '',
    propertyType: 'commercial',
    incidentDate: '',
    location: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      claim_id: `CORP-Rs.{Date.now()}`,
      patient_name: formData.companyName,
      total_amount: parseFloat(formData.claimAmount),
      diagnosis_code: 'Y90.0', // Default for property claims
      hospital_id: `CORP-Rs.{formData.location.replace(/\s+/g, '').toUpperCase()}`,
      attending_doctor_id: `ADJUSTER-Rs.{Date.now()}`,
      policyholder_id: formData.policyNumber,
      service_date: formData.incidentDate,
      submission_type: 'b2b' as const
    };
    
    // Store in localStorage for claim submission page
    localStorage.setItem('corporate_claim_data', JSON.stringify(claimData));
    window.location.href = '/submit';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Building2 className="text-orange-600 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Corporate/Property Insurance</h1>
              <p className="text-lg text-gray-600">Business Claims & Fraud Detection</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Claim Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Submit Corporate Claim</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Acme Corporation"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="CORP-123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="commercial">Commercial Property</option>
                    <option value="industrial">Industrial Facility</option>
                    <option value="office">Office Building</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="retail">Retail Space</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="123 Business Ave, City, State"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="50000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Date
                  </label>
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Describe the property damage, business interruption, or loss..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  Analyze Corporate Claim
                </button>
              </div>
            </form>
          </div>

          {/* Features & Benefits */}
          <div className="space-y-8">
            {/* Key Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Corporate Insurance Features</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="text-orange-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Business Risk Assessment</h4>
                    <p className="text-gray-600 text-sm">Analyze company financial health and claim patterns</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="text-orange-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Employee Fraud Detection</h4>
                    <p className="text-gray-600 text-sm">Identify internal fraud and collusion schemes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="text-orange-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Document Verification</h4>
                    <p className="text-gray-600 text-sm">AI-powered document authenticity checking</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fraud Indicators */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-red-900 mb-4">Common Corporate Fraud Indicators</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Business interruption fraud</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Property value inflation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Phantom vendor schemes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Employee collusion</span>
                </li>
              </ul>
            </div>

            {/* Industry-Specific Questions */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-orange-900 mb-4">Corporate Insurance Questions</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 mb-2">1. Business Type</p>
                  <p className="text-sm text-gray-600">What type of business is insured?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-orange-300 rounded text-sm">Manufacturing</button>
                    <button className="px-3 py-1 bg-white border border-orange-300 rounded text-sm">Services</button>
                    <button className="px-3 py-1 bg-white border border-orange-300 rounded text-sm">Retail</button>
                    <button className="px-3 py-1 bg-white border border-orange-300 rounded text-sm">IT</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">2. GST Registration</p>
                  <p className="text-sm text-gray-600">Is the business GST registered?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-orange-300 rounded text-sm">Yes</button>
                    <button className="px-3 py-1 bg-white border border-orange-300 rounded text-sm">No</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">3. Financial Records</p>
                  <p className="text-sm text-gray-600">Are financial records audited?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-orange-300 rounded text-sm">Audited</button>
                    <button className="px-3 py-1 bg-white border border-orange-300 rounded text-sm">Unaudited</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">4. Business Continuity</p>
                  <p className="text-sm text-gray-600">Business interruption coverage?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-orange-300 rounded text-sm">Yes</button>
                    <button className="px-3 py-1 bg-white border border-orange-300 rounded text-sm">No</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Indian Industry Statistics */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-orange-900 mb-4">Indian Corporate Insurance Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Average Corporate Claim</span>
                  <span className="text-orange-600 font-bold">Rs. 450,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Fraud Detection Rate</span>
                  <span className="text-orange-600 font-bold">24.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Processing Time</span>
                  <span className="text-orange-600 font-bold">&lt; 2 seconds</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">MSME Covered</span>
                  <span className="text-orange-600 font-bold">Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center gap-4">
          <Link 
            href="/insurance/health" 
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Health Insurance →
          </Link>
          <Link 
            href="/insurance/auto" 
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Auto Insurance →
          </Link>
          <Link 
            href="/insurance/life" 
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Life Insurance →
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
