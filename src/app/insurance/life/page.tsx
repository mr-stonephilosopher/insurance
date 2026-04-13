'use client';

import React, { useState } from 'react';
import { UserCheck, Heart, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LifeInsurance() {
  const [formData, setFormData] = useState({
    policyholder: '',
    policyNumber: '',
    claimAmount: '',
    claimType: 'life',
    deathDate: '',
    beneficiary: '',
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
      claim_id: `LIFE-Rs.{Date.now()}`,
      patient_name: formData.policyholder,
      total_amount: parseFloat(formData.claimAmount),
      diagnosis_code: 'Z00.0', // Default for life claims
      hospital_id: `LIFE-Rs.{formData.beneficiary.replace(/\s+/g, '').toUpperCase()}`,
      attending_doctor_id: `MEDICAL-Rs.{Date.now()}`,
      policyholder_id: formData.policyNumber,
      service_date: formData.deathDate,
      submission_type: 'b2b' as const
    };
    
    // Store in localStorage for claim submission page
    localStorage.setItem('life_claim_data', JSON.stringify(claimData));
    window.location.href = '/submit';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <UserCheck className="text-purple-600 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Term/Life Insurance</h1>
              <p className="text-lg text-gray-600">Life Insurance Claims & Fraud Detection</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Claim Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Submit Life Insurance Claim</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Policy Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policyholder Name
                  </label>
                  <input
                    type="text"
                    name="policyholder"
                    value={formData.policyholder}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="LIFE-123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claim Type
                  </label>
                  <select
                    name="claimType"
                    value={formData.claimType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="life">Life Insurance</option>
                    <option value="term">Term Life</option>
                    <option value="whole">Whole Life</option>
                    <option value="accidental">Accidental Death</option>
                  </select>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="250000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Death
                  </label>
                  <input
                    type="date"
                    name="deathDate"
                    value={formData.deathDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Beneficiary
                  </label>
                  <input
                    type="text"
                    name="beneficiary"
                    value={formData.beneficiary}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claim Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe circumstances and claim details..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  Analyze Life Claim
                </button>
              </div>
            </form>
          </div>

          {/* Features & Benefits */}
          <div className="space-y-8">
            {/* Key Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Life Insurance Features</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Heart className="text-purple-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Policy Verification</h4>
                    <p className="text-gray-600 text-sm">Verify policy authenticity and beneficiary claims</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="text-purple-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Death Certificate Analysis</h4>
                    <p className="text-gray-600 text-sm">AI-powered document verification and validation</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserCheck className="text-purple-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Beneficiary Screening</h4>
                    <p className="text-gray-600 text-sm">Detect suspicious beneficiary patterns</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fraud Indicators */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-red-900 mb-4">Common Life Insurance Fraud</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Concealed medical conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Suicide misrepresentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Staged accidents</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">False beneficiary claims</span>
                </li>
              </ul>
            </div>

            {/* Industry-Specific Questions */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-purple-900 mb-4">Life Insurance Questions</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 mb-2">1. Policy Type</p>
                  <p className="text-sm text-gray-600">What type of life insurance policy?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-purple-300 rounded text-sm">Term</button>
                    <button className="px-3 py-1 bg-white border border-purple-300 rounded text-sm">Whole Life</button>
                    <button className="px-3 py-1 bg-white border border-purple-300 rounded text-sm">Endowment</button>
                    <button className="px-3 py-1 bg-white border border-purple-300 rounded text-sm">ULIP</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">2. Nominee Details</p>
                  <p className="text-sm text-gray-600">Is the nominee properly registered?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-purple-300 rounded text-sm">Yes</button>
                    <button className="px-3 py-1 bg-white border border-purple-300 rounded text-sm">No</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">3. Medical Examination</p>
                  <p className="text-sm text-gray-600">Was medical examination done?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-purple-300 rounded text-sm">Yes</button>
                    <button className="px-3 py-1 bg-white border border-purple-300 rounded text-sm">No</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">4. Premium Payment</p>
                  <p className="text-sm text-gray-600">Are premiums paid regularly?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-purple-300 rounded text-sm">Regular</button>
                    <button className="px-3 py-1 bg-white border border-purple-300 rounded text-sm">Irregular</button>
                    <button className="px-3 py-1 bg-white border border-purple-300 rounded text-sm">Lapsed</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Indian Industry Statistics */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-purple-900 mb-4">Indian Life Insurance Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Average Life Claim</span>
                  <span className="text-purple-600 font-bold">Rs. 25,00,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Fraud Detection Rate</span>
                  <span className="text-purple-600 font-bold">8.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Processing Time</span>
                  <span className="text-purple-600 font-bold">&lt; 2 seconds</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">IRDA Regulated</span>
                  <span className="text-purple-600 font-bold">Yes</span>
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
