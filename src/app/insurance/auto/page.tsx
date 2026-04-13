'use client';

import React, { useState } from 'react';
import { Car, Wrench, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AutoInsurance() {
  const [formData, setFormData] = useState({
    vehicleOwner: '',
    policyNumber: '',
    claimAmount: '',
    accidentDate: '',
    vehicleType: 'car',
    damageType: '',
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
      claim_id: `AUTO-Rs.{Date.now()}`,
      patient_name: formData.vehicleOwner,
      total_amount: parseFloat(formData.claimAmount),
      diagnosis_code: 'M54.5', // Default for auto accidents
      hospital_id: `AUTO-Rs.{formData.location.replace(/\s+/g, '').toUpperCase()}`,
      attending_doctor_id: `MECHANIC-Rs.{Date.now()}`,
      policyholder_id: formData.policyNumber,
      service_date: formData.accidentDate,
      submission_type: 'b2b' as const
    };
    
    // Store in localStorage for claim submission page
    localStorage.setItem('auto_claim_data', JSON.stringify(claimData));
    window.location.href = '/submit';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Car className="text-green-600 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Car/Auto Insurance</h1>
              <p className="text-lg text-gray-600">Vehicle Claims & Fraud Detection</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Claim Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Submit Auto Claim</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Owner Name
                  </label>
                  <input
                    type="text"
                    name="vehicleOwner"
                    value={formData.vehicleOwner}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="AUTO-123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="car">Car</option>
                    <option value="truck">Truck</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damage Type
                  </label>
                  <select
                    name="damageType"
                    value={formData.damageType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select damage type</option>
                    <option value="collision">Collision</option>
                    <option value="comprehensive">Comprehensive</option>
                    <option value="theft">Theft</option>
                    <option value="vandalism">Vandalism</option>
                    <option value="natural">Natural Disaster</option>
                    <option value="fire">Fire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accident Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="City, State"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="5000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accident Date
                  </label>
                  <input
                    type="date"
                    name="accidentDate"
                    value={formData.accidentDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damage Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Describe the damage and circumstances..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  Analyze Auto Claim
                </button>
              </div>
            </form>
          </div>

          {/* Features & Benefits */}
          <div className="space-y-8">
            {/* Key Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Auto Insurance Features</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Car className="text-green-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Accident Pattern Analysis</h4>
                    <p className="text-gray-600 text-sm">Detect staged accidents and suspicious claim patterns</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Wrench className="text-green-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Repair Shop Monitoring</h4>
                    <p className="text-gray-600 text-sm">Identify inflated repair costs and phantom services</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-green-500 w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Vehicle History Verification</h4>
                    <p className="text-gray-600 text-sm">Check for odometer rollback and title washing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fraud Indicators */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-red-900 mb-4">Common Auto Fraud Indicators</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Staged accidents</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Inflated repair costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Phantom damage claims</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 text-sm">Odometer rollback</span>
                </li>
              </ul>
            </div>

            {/* Industry-Specific Questions */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-green-900 mb-4">Auto Insurance Questions</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 mb-2">1. Vehicle Type</p>
                  <p className="text-sm text-gray-600">What type of vehicle is insured?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-green-300 rounded text-sm">Car</button>
                    <button className="px-3 py-1 bg-white border border-green-300 rounded text-sm">Bike</button>
                    <button className="px-3 py-1 bg-white border border-green-300 rounded text-sm">SUV</button>
                    <button className="px-3 py-1 bg-white border border-green-300 rounded text-sm">Truck</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">2. Accident Location</p>
                  <p className="text-sm text-gray-600">Where did the accident occur?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-green-300 rounded text-sm">City</button>
                    <button className="px-3 py-1 bg-white border border-green-300 rounded text-sm">Highway</button>
                    <button className="px-3 py-1 bg-white border border-green-300 rounded text-sm">Rural</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">3. Police Report</p>
                  <p className="text-sm text-gray-600">Was a police report filed?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-green-300 rounded text-sm">Yes</button>
                    <button className="px-3 py-1 bg-white border border-green-300 rounded text-sm">No</button>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 mb-2">4. Third Party Involvement</p>
                  <p className="text-sm text-gray-600">Was there third party involvement?</p>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1 bg-white border border-green-300 rounded text-sm">Yes</button>
                    <button className="px-3 py-1 bg-white border border-green-300 rounded text-sm">No</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Indian Industry Statistics */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-green-900 mb-4">Indian Auto Insurance Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Average Auto Claim</span>
                  <span className="text-green-600 font-bold">Rs. 125,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Fraud Detection Rate</span>
                  <span className="text-green-600 font-bold">22.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Processing Time</span>
                  <span className="text-green-600 font-bold">&lt; 2 seconds</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">RTO Verified</span>
                  <span className="text-green-600 font-bold">Yes</span>
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
