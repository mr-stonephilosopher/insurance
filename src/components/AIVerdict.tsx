import React from 'react';
import { ShieldCheck, UserCheck, Activity } from 'lucide-react';

const AIVerdict = () => {
  return (
    <div className="card-container h-full flex flex-col items-center justify-center relative bg-white">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">The AI Verdict</h3>
      </div>

      <div className="relative flex items-center justify-center mt-4">
        {/* Risk Score Dial SVG */}
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={502.4}
            strokeDashoffset={502.4 * (1 - 88 / 100)}
            strokeLinecap="round"
            className="text-red-500 transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-black text-red-600">88</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Score</span>
        </div>
      </div>

      <div className="mt-8 w-full space-y-3">
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold text-slate-700">Device</span>
          </div>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase">Verified</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold text-slate-700">DigiLocker KYC</span>
          </div>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase">Match</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg group animate-pulse">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-500" />
            <span className="text-xs font-semibold text-red-700">MediaPipe Liveness</span>
          </div>
          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded border border-red-200 uppercase">Bypassed (Institutional)</span>
        </div>
      </div>
    </div>
  );
};

export default AIVerdict;
