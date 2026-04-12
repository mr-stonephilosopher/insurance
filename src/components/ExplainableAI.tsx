'use client';

import React from 'react';
import { BrainCircuit, Info, MessageSquareQuote, Check } from 'lucide-react';

const ExplainableAI = () => {
  const shapFeatures = [
    { label: "Itemized Billing Variance", value: +24, desc: "3.2x higher than standard deviation" },
    { label: "Doctor Cluster Trust", value: +18, desc: "Linked to high-risk community" },
    { label: "Admission Frequency", value: -5, desc: "Patient has clean 5-year history" },
    { label: "Diagnosis/Procedure Match", value: +12, desc: "Atypical treatment for A10.1" },
  ];

  return (
    <div className="glass-card p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <BrainCircuit className="text-primary w-5 h-5" />
          Explainable AI (SHAP)
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model: XGBoost + KernelExplainer</span>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {shapFeatures.map((f, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-bold text-white mb-0.5">{f.label}</p>
                <p className="text-[10px] text-slate-500 font-medium">{f.desc}</p>
              </div>
              <span className={`text-xs font-black ${f.value > 0 ? 'text-red-500' : 'text-accent'}`}>
                {f.value > 0 ? '+' : ''}{f.value}% Impact
              </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${f.value > 0 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-accent shadow-[0_0_10px_rgba(16,185,129,0.4)]'}`}
                style={{ width: `${Math.abs(f.value)}%`, marginLeft: f.value < 0 ? '0' : '0' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-glass-border">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 relative">
          <MessageSquareQuote className="absolute top-4 right-6 w-8 h-8 text-primary/10" />
          <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> Human-Readable Synthesis
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            "The system flagged this claim because <span className="text-white font-bold">Billing is 3x the standard deviation</span> for the diagnosed condition. Additionally, the <span className="text-white font-bold">Doctor ID</span> is mapped to a high-risk cluster identified by the Louvain Algorithm."
          </p>
          <div className="mt-4 flex items-center gap-2">
              <div className="px-2 py-1 bg-accent/20 rounded text-[9px] font-black text-accent uppercase tracking-widest flex items-center gap-1">
                <Check className="w-3 h-3" /> Verdict Reliable
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainableAI;
