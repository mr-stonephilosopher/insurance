import ClaimSummary from "@/components/ClaimSummary";
import AIVerdict from "@/components/AIVerdict";
import ExplainableAI from "@/components/ExplainableAI";
import NetworkGraph from "@/components/NetworkGraph";

export default function Home() {
  return (
    <div className="h-full flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Claim Evaluation Detail</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Reviewing high-risk anomaly detected by Sentinel-4 Engine</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case ID</span>
            <span className="text-sm font-black text-slate-800">#44092-2025</span>
          </div>
          <div className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Immediate Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1">
        <div className="min-h-[400px]">
          <ClaimSummary />
        </div>
        <div className="min-h-[400px]">
          <AIVerdict />
        </div>
        <div className="min-h-[500px]">
          <ExplainableAI />
        </div>
        <div className="min-h-[500px]">
          <NetworkGraph />
        </div>
      </div>
    </div>
  );
}
