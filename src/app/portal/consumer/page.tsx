'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Smartphone, ShieldCheck, Fingerprint, Camera, Loader2, CheckCircle2, UserCheck, CreditCard } from 'lucide-react';

const ConsumerPortal = () => {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Device Check, 3: Liveness, 4: Submission, 5: Success
  const [progress, setProgress] = useState(0);

  const nextStep = () => {
    setProgress(0);
    setStep(s => s + 1);
  };

  useEffect(() => {
    const handleSubmission = async () => {
      if (step === 4) {
        // First animate progress
        const interval = setInterval(() => {
          setProgress(p => {
            if (p >= 100) {
              clearInterval(interval);
              return 100;
            }
            return p + 5;
          });
        }, 50);

        // real API call
        try {
          const response = await fetch('http://localhost:8000/api/v1/claims/consumer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: "USER-DS-99",
              amount: 45000,
              diagnosis_code: "B20",
              liveness_status: true,
              device_integrity: true,
              digilocker_verified: true,
              hospital_id: "HOSP-MAX-001",
              doctor_id: "DOC-SIM-404",
              agent_id: "AGT-772"
            })
          });
          if (response.ok) {
            setTimeout(nextStep, 1000);
          } else {
            alert("Security Handshake Failed");
            setStep(1);
          }
        } catch (error) {
          console.error("Submission failed:", error);
          setTimeout(nextStep, 1000); // Fail gracefully for demo
        }
        return () => clearInterval(interval);
      }
    };

    if (step === 2) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(nextStep, 500);
            return 100;
          }
          return p + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    } else if (step === 4) {
      handleSubmission();
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto p-8 py-12 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4 gradient-text tracking-tighter">Direct Consumer SDK</h1>
          <p className="text-slate-400">Simulating the mobile claim submission experience with edge-security.</p>
        </div>

        {/* Mobile Mockup */}
        <div className="relative w-[360px] h-[720px] bg-black rounded-[60px] border-[8px] border-slate-800 shadow-2xl overflow-hidden p-4">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-3xl z-20" />
          
          <div className="h-full bg-[#0a0a0a] rounded-[42px] overflow-hidden flex flex-col relative text-white">
            
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-8">
                  <Smartphone className="text-primary w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black mb-4 tracking-tight">New Claim Request</h2>
                <p className="text-slate-500 text-sm mb-12">Please ensure you are in a well-lit environment for the biometric security check.</p>
                <button 
                  onClick={nextStep}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
                >
                  Start Secure Process
                </button>
              </div>
            )}

            {/* Step 2: Device Check (Google Play Integrity Mock) */}
            {step === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6 relative">
                  <ShieldCheck className="text-accent w-8 h-8" />
                  <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-lg font-bold mb-2">Verifying Device Trust</h2>
                <p className="text-slate-500 text-xs mb-8 uppercase tracking-widest">Checking Google Play Integrity...</p>
                
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-8 space-y-3 w-full">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Kernel Integrity</span>
                    <span className="text-accent">PASSED</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>No Emulator Found</span>
                    <span className="text-accent">PASSED</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Liveness Check (MediaPipe Mock) */}
            {step === 3 && (
              <div className="flex-1 flex flex-col items-center p-0 animate-in slide-in-from-bottom duration-500">
                <div className="relative w-full h-full">
                  {/* Fake Camera Feed */}
                  <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60" 
                      className="w-full h-full object-cover opacity-50 grayscale"
                    />
                  </div>
                  
                  {/* UI Overlays */}
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 aspect-square border-4 border-dashed border-primary/50 rounded-full animate-pulse z-20 flex flex-col items-center justify-center">
                    <Camera className="text-white w-12 h-12 mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest text-center">Position face <br />in circle</p>
                  </div>

                  <div className="absolute bottom-12 inset-x-8 z-30">
                    <div className="p-4 glass-card bg-black/40 border-primary/30 text-center">
                      <p className="text-sm font-bold mb-4">Slowly blink to verify liveness</p>
                      <button 
                        onClick={nextStep}
                        className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm"
                      >
                        Mock Blink Detected
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Final Submission */}
            {step === 4 && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                <h2 className="text-xl font-bold mb-2">Injecting Claim</h2>
                <p className="text-slate-500 text-sm mb-8">Encrypting payload and syncing DigiLocker hashes...</p>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="text-accent w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black mb-4 tracking-tight">Claim Submitted</h2>
                <p className="text-slate-500 text-sm mb-12">Your claim <span className="text-white font-mono">#CONS-XY-772</span> has been acknowledged and is undergoing AI risk scoring.</p>
                <button 
                  onClick={() => setStep(1)}
                  className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Legend / Info boxes on the right */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="glass-card p-6 bg-white/5 border-none">
            <Fingerprint className="text-primary mb-3 w-6 h-6" />
            <h4 className="font-bold text-sm mb-1">Device Trust</h4>
            <p className="text-xs text-slate-500">Google Play Integrity token ensures the app isn't running on rooted/emulated hardware.</p>
          </div>
          <div className="glass-card p-6 bg-white/5 border-none">
            <UserCheck className="text-accent mb-3 w-6 h-6" />
            <h4 className="font-bold text-sm mb-1">Liveness (AI)</h4>
            <p className="text-xs text-slate-500">MediaPipe face landmarks verify a real human user is present, preventing deepfake spoofing.</p>
          </div>
          <div className="glass-card p-6 bg-white/5 border-none">
            <CreditCard className="text-primary mb-3 w-6 h-6" />
            <h4 className="font-bold text-sm mb-1">DigiLocker</h4>
            <p className="text-xs text-slate-500">KYC verification anchor via government-linked immutable identity hashes.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsumerPortal;
