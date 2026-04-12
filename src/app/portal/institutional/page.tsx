'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { FileDown, Send, CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react';

const InstitutionalPortal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [payload, setPayload] = useState(JSON.stringify({
    resourceType: "Bundle",
    type: "collection",
    entry: [
      {
        resource: {
          resourceType: "Claim",
          id: "claim-88219",
          status: "active",
          use: "claim",
          patient: { display: "John Doe" },
          billablePeriod: { start: "2026-04-01", end: "2026-04-05" },
          total: { value: 450000, currency: "INR" },
          diagnosis: [{ code: "A10" }]
        }
      }
    ],
    hospital_id: "HOSP-MAX-001",
    doctor_id: "DOC-SIM-404",
    agent_id: "AGT-772"
  }, null, 2));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/claims/institutional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
      if (response.ok) {
        setIsSuccess(true);
      } else {
        alert("Gateway Error: Please check payload format.");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Network Error: Backend is unreachable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto p-8 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Side: Information */}
          <div className="md:w-1/3">
            <h1 className="text-4xl font-black mb-6 gradient-text tracking-tighter">B2B Institutional<br />Gateway</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Submit claims directly via the NHCX interoperability layer. Our system validates FHIR R4 resources against insurance-specific trust schemas in real-time.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 glass-card bg-white/5 border-none">
                <div className="p-2 bg-primary/20 rounded-lg"><Database className="text-primary w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold">Protocol</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">NHCX / FHIR R4</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 glass-card bg-white/5 border-none">
                <div className="p-2 bg-accent/20 rounded-lg"><AlertCircle className="text-accent w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold">Validation</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Structural & Semantic</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Code Editor / Submission */}
          <div className="md:w-2/3">
            <div className="glass-card overflow-hidden">
              <div className="bg-slate-900 px-6 py-4 border-b border-glass-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500/50 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500/50 rounded-full" />
                  <div className="w-3 h-3 bg-green-500/50 rounded-full" />
                  <span className="ml-4 text-xs font-mono text-slate-500 uppercase tracking-widest">fhir_claim_payload.json</span>
                </div>
                <button className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <FileDown className="w-4 h-4" /> Download Schema
                </button>
              </div>
              
              <div className="relative">
                <textarea 
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  className="w-full h-[500px] bg-black/60 font-mono text-sm p-8 text-primary/80 ring-0 focus:ring-0 rounded-none border-none resize-none"
                />
                
                {isSubmitting && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="font-bold tracking-widest uppercase text-sm">Validating Ingestion...</p>
                    <p className="text-xs text-slate-500 mt-2">Checking NHCX Gateway Signature</p>
                  </div>
                )}

                {isSuccess && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center p-8">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Ingestion Successful</h3>
                    <p className="text-slate-400 mb-8">Claim ID: <span className="text-white font-mono">#INST-44092-A</span> has been queued for AI detection.</p>
                    <button 
                      onClick={() => setIsSuccess(false)}
                      className="bg-accent text-black px-8 py-3 rounded-xl font-black uppercase tracking-tighter hover:bg-white transition-all"
                    >
                      Process Another Claim
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 p-6 border-t border-glass-border flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded text-[10px] font-bold text-primary uppercase tracking-widest">
                    Signature: Valid
                  </div>
                  <div className="px-3 py-1 bg-accent/10 border border-accent/30 rounded text-[10px] font-bold text-accent uppercase tracking-widest">
                    Status: Verified
                  </div>
                </div>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSuccess}
                  className="bg-primary hover:bg-white hover:text-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-tighter transition-all flex items-center gap-3 shadow-lg shadow-primary/20"
                >
                  <Send className="w-5 h-5" /> Inject Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstitutionalPortal;
