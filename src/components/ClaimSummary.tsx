import React from 'react';
import { User, Hospital, FileText, CreditCard, Calendar } from 'lucide-react';

const ClaimSummary = () => {
  return (
    <div className="card-container h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Claim Summary</h3>
        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">Active Case</span>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 flex-shrink-0">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Patient Name</p>
            <p className="text-base font-bold text-slate-800">Rohan Sharma</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 flex-shrink-0">
              <Hospital className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Hospital ID</p>
              <p className="text-sm font-bold text-slate-800">HOSP-9921-BLR</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 flex-shrink-0">
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Diagnosis Code</p>
              <p className="text-sm font-bold text-slate-800 mono">FHIR: ICD-10 J45.901</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 flex-shrink-0">
              <CreditCard className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Claim Amount</p>
              <p className="text-xl font-black text-slate-900">₹4,82,450.00</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 flex-shrink-0">
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Date</p>
              <p className="text-sm font-bold text-slate-800">Oct 24, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimSummary;
