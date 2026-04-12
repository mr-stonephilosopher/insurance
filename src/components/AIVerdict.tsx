'use client';

import React from 'react';
import { ShieldAlert, TrendingUp, Info, Activity } from 'lucide-react';

const AIVerdict = () => {
  const score = 88;
  const isHighRisk = score > 75;

  return (
    <div className="glass-card p-8 h-full flex flex-col relative overflow-hidden">
      {/* Background Score Glow */}
      <div className={`absolute top-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full blur-[80px] ${isHighRisk ? 'bg-red-500/10' : 'bg-primary/10'}`} />
      
      <div className="flex items-center justify-between mb-10 z-10">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <ShieldAlert className={`${isHighRisk ? 'text-red-500' : 'text-primary'} w-5 h-5 animate-pulse`} />
          AI Risk Verdict
        </h3>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isHighRisk ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
          {isHighRisk ? 'Critical Risk Detected' : 'Standard Evaluation'}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <div className="relative">
          {/* Progress Ring */}
          <svg className="w-56 h-56 transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="100"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-800"
            />
            <circle
              cx="112"
              cy="112"
              r="100"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={628}
              strokeDashoffset={628 - (628 * score) / 100}
              className={`${isHighRisk ? 'text-red-500' : 'text-primary'} transition-all duration-1000 ease-out`}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black gradient-text tracking-tighter">{score}</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">BITWIZARD SCORE</span>
          </div>
        </div>

        <div className="mt-12 w-full grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-glass-border">
            <div className="flex items-center gap-2 text-primary mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Confidence</span>
            </div>
            <p className="text-lg font-black text-white">99.42%</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-glass-border">
            <div className="flex items-center gap-2 text-accent mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Latency</span>
            </div>
            <p className="text-lg font-black text-white">420ms</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex gap-4 items-start z-10">
        <Info className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          The engine has triggered an <span className="text-red-500 font-bold">XAI Report</span> due to high variance in itemized billing compared to national hospital averages for ICD-10 A10.1.
        </p>
      </div>
    </div>
  );
};

export default AIVerdict;
