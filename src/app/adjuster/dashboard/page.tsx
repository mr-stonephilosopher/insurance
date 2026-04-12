'use client';

import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ClaimSummary from '@/components/ClaimSummary';
import AIVerdict from '@/components/AIVerdict';
import ExplainableAI from '@/components/ExplainableAI';
import NetworkGraph from '@/components/NetworkGraph';
import { ChevronRight, ShieldAlert, History, Filter } from 'lucide-react';

export default function AdjusterDashboard() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="p-8 flex-1 flex flex-col gap-8 max-w-[1600px] mx-auto w-full">
          {/* Dashboard Header/Breadcrumbs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                <span>Claims Queue</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary">High Risk Evaluation</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">Case Analysis: #88219-X</h1>
              <p className="text-slate-400 font-medium max-w-xl">
                Reviewing critical pricing anomaly and network risk cluster detected by the BitWizard AI engine.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button className="px-6 py-2.5 glass-card bg-white/5 border-glass-border rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 hover:bg-white/10 transition-colors">
                <History className="w-4 h-4" /> Case History
              </button>
              <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/80 transition-all">
                <ShieldAlert className="w-4 h-4" /> Mark for Investigation
              </button>
            </div>
          </div>

          {/* Core Grid Analysis */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1">
            <div className="min-h-[450px]">
              <ClaimSummary />
            </div>
            <div className="min-h-[450px]">
              <AIVerdict />
            </div>
            <div className="min-h-[500px]">
              <ExplainableAI />
            </div>
            <div className="min-h-[500px]">
              <NetworkGraph />
            </div>
          </div>

          {/* Bottom Action Bar */}
          <footer className="mt-4 p-6 glass-card border-none bg-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assigned Adjuster</span>
                <span className="text-sm font-bold text-white">Adjuster (Level 3)</span>
              </div>
              <div className="h-8 w-px bg-glass-border" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Time in Queue</span>
                <span className="text-sm font-bold text-accent">12m 44s</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <button className="px-8 py-3 rounded-xl border border-glass-border text-sm font-bold text-white hover:bg-white/5 transition-all">
                Dismiss Case
              </button>
              <button className="px-8 py-3 rounded-xl bg-accent text-black text-sm font-black uppercase tracking-tighter hover:bg-white transition-all">
                Authorize Settlement
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
