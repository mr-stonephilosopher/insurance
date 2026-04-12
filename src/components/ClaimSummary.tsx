'use client';

import React from 'react';
import { User, Calendar, MapPin, Hash, Activity, IndianRupee, FileText } from 'lucide-react';

const ClaimSummary = ({ claim }: { claim: any }) => {
  // Default claim data for demo purposes
  const defaultClaim = {
    id: "INST-44092-A",
    patient_name: "John Doe",
    total_amount: 450000,
    diagnosis_code: "A10",
    timestamp: new Date().toISOString(),
    hospital_id: "HOSP-MAX-001",
    doctor_id: "DOC-SIM-404",
    agent_id: "AGT-772"
  };
  
  const claimData = claim || defaultClaim;
  
  return (
    <div className="glass-card p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FileText className="text-primary w-5 h-5" />
          Claim Metadata
        </h3>
        <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] font-black text-primary uppercase tracking-widest">
          FHIR Source: Internal
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-8 gap-x-12 flex-1">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-3 h-3" /> Policyholder
          </p>
          <p className="text-sm font-black text-white">{claimData.patient_name || 'Anonymous'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Hash className="w-3 h-3" /> Claim ID
          </p>
          <p className="text-sm font-black text-white">#{claimData.id}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <IndianRupee className="w-3 h-3" /> Total Amount
          </p>
          <p className="text-xl font-black text-white">₹{claimData.total_amount?.toLocaleString()}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Diagnosis
          </p>
          <p className="text-sm font-black text-accent">{claimData.diagnosis_code || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Admission Date
          </p>
          <p className="text-sm font-black text-white">{new Date(claimData.timestamp).toLocaleDateString()}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Location
          </p>
          <p className="text-sm font-black text-white">Max Healthcare, New Delhi</p>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-glass-border">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
          <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400">
            FHIR
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource Payload</p>
            <p className="text-xs text-slate-300 truncate">Bundle/Collection :: itemized_billing_v2.json</p>
          </div>
          <button className="text-[10px] font-bold text-primary hover:underline">VIEW RAW</button>
        </div>
      </div>
    </div>
  );
};

export default ClaimSummary;
