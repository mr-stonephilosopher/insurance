import React from 'react';
import { Share2, Zap } from 'lucide-react';

const NetworkGraph = () => {
  return (
    <div className="card-container h-full flex flex-col bg-[#0f172a] text-white border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Neo4j Relational Graph</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] font-bold text-slate-300">GPU Accelerated</span>
          </div>
          <Share2 className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full" style={{ 
            backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }} />
        </div>

        {/* Mock Network Visualization */}
        <svg className="w-full h-full max-w-[300px]" viewBox="0 0 400 300">
          {/* Connections */}
          <line x1="200" y1="80" x2="100" y2="220" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="200" y1="80" x2="300" y2="220" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="100" y1="220" x2="300" y2="220" stroke="#ef4444" strokeWidth="2" />

          {/* Nodes */}
          {/* Main Node (Doctor) */}
          <circle cx="200" cy="80" r="18" fill="#ef4444" className="animate-pulse" />
          <text x="200" y="55" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">Dr. A. Verma</text>
          
          {/* Patient Node */}
          <circle cx="100" cy="220" r="14" fill="#64748b" />
          <text x="100" y="250" textAnchor="middle" fill="#94a3b8" fontSize="10">R. Sharma (Patient)</text>

          {/* Agent Node */}
          <circle cx="300" cy="220" r="14" fill="#64748b" />
          <text x="300" y="250" textAnchor="middle" fill="#94a3b8" fontSize="10">A. Khan (Agent)</text>

          {/* Connection Labels */}
          <rect x="130" y="140" width="40" height="12" rx="2" fill="#1e293b" />
          <text x="150" y="149" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">LINKED</text>
          
          <rect x="230" y="140" width="40" height="12" rx="2" fill="#1e293b" />
          <text x="250" y="149" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">LINKED</text>
        </svg>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Detection Engine</p>
            <p className="text-xs font-medium text-slate-300">Cluster ID: FR-091-XB</p>
          </div>
          <button className="px-3 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded border border-slate-700 hover:bg-slate-700 transition-all uppercase">
            Expand View
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;
