import React from 'react';
import { AlertCircle, TrendingUp, Users } from 'lucide-react';

const ExplainableAI = () => {
  const flags = [
    {
      icon: TrendingUp,
      text: 'Billing amount is 3x higher than historical average for this diagnosis.',
      impact: 'High Impact'
    },
    {
      icon: Users,
      text: 'Attending Doctor is flagged in a high-risk cluster (Neo4j Community ID: 4022).',
      impact: 'Critical Alert'
    },
    {
      icon: AlertCircle,
      text: 'Timestamp mismatch: Diagnostic report generated 4 hours before hospital admission.',
      impact: 'Anomalous Loop'
    }
  ];

  return (
    <div className="card-container h-full border-l-4 border-l-red-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Red Flag Report</h3>
        <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase">SHAP Analysis</span>
      </div>

      <div className="space-y-4">
        {flags.map((flag, index) => (
          <div key={index} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-all hover:shadow-sm">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 animate-pulse">
              <flag.icon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observation {index + 1}</span>
                <span className="text-[10px] font-bold text-red-500 uppercase">{flag.impact}</span>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                {flag.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Technical Confidence</p>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-slate-800 h-full w-[94%]" />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] font-black text-slate-800">94.2%</span>
          <span className="text-[10px] font-medium text-slate-500 uppercase">Confidence Score</span>
        </div>
      </div>
    </div>
  );
};

export default ExplainableAI;
