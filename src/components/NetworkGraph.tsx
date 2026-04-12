'use client';

import React from 'react';
import { Share2, Users, AlertCircle, Zap } from 'lucide-react';

const NetworkGraph = () => {
  return (
    <div className="glass-card p-8 h-full flex flex-col relative overflow-hidden">
      {/* Background Decorative Mesh */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="flex items-center justify-between mb-8 z-10">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Share2 className="text-primary w-5 h-5" />
          Entity Relationship Mapping
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Engine: Neo4j Louvain</span>
          <div className="w-2 h-2 rounded-full bg-accent animate-glow" />
        </div>
      </div>

      <div className="flex-1 relative z-10 flex items-center justify-center">
        {/* Simulated Graph Nodes */}
        <div className="relative w-full h-full max-h-[300px] flex items-center justify-center">
          {/* Central Nodes */}
          <div className="relative w-24 h-24 bg-red-500/20 rounded-full border-2 border-red-500 flex items-center justify-center animate-glow">
            <Zap className="text-red-500 w-8 h-8" />
            <div className="absolute -bottom-8 whitespace-nowrap text-xs font-bold text-white">Fraud Cluster #22</div>
          </div>

          {/* Connected Nodes (Positioned absolutely) */}
          <div className="absolute top-0 left-1/4 group cursor-help">
            <div className="w-12 h-12 glass-card border-primary/40 flex items-center justify-center hover:scale-110 transition-transform">
              <span className="text-[10px] font-bold">DR-404</span>
            </div>
            <div className="absolute hidden group-hover:block bg-slate-900 p-2 rounded text-[10px] border border-glass-border top-full mt-2 w-32">
              Dr. Smith (Linked to 45 flagged claims)
            </div>
          </div>

          <div className="absolute bottom-10 right-1/4 group cursor-help">
            <div className="w-12 h-12 glass-card border-accent/40 flex items-center justify-center hover:scale-110 transition-transform">
              <span className="text-[10px] font-bold">AGT-77</span>
            </div>
          </div>

          <div className="absolute top-1/2 -right-4 group cursor-help transition-all">
             <div className="w-10 h-10 glass-card border-slate-700 flex items-center justify-center opacity-40">
                <span className="text-[10px] font-bold text-slate-500">PT-A</span>
             </div>
          </div>

          {/* Connection Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full -z-10 opacity-30">
            <line x1="25%" y1="10%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="75%" y1="90%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-accent" />
            <line x1="95%" y1="50%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-slate-500" strokeDasharray="4" />
          </svg>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-glass-border z-10">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Density</p>
            <p className="text-lg font-black text-white">0.82</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Communities</p>
            <p className="text-lg font-black text-white">14</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Centrality</p>
            <p className="text-lg font-black text-red-500">HIGH</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20 z-10">
        <Users className="text-red-500 w-5 h-5 flex-shrink-0" />
        <p className="text-[10px] font-bold text-red-100 leading-normal tracking-wide">
          ALERT: Doctor and Agent exhibit mutually connected activity to 45 different claims this month. Statistical anomaly detected via Louvain isolation.
        </p>
      </div>
    </div>
  );
};

export default NetworkGraph;
