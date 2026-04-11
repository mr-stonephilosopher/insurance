'use client';

import React from 'react';
import { SearchIcon, CheckCircle, XCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="h-20 bg-white border-t border-slate-200 flex items-center justify-between px-8 fixed bottom-0 left-64 right-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3">
        <div className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100 uppercase tracking-wider">
          Critical Case
        </div>
        <span className="text-slate-500 text-sm font-medium">Pending final decision</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-all text-sm border border-slate-200">
          <SearchIcon className="w-4 h-4" />
          Investigate Further
        </button>
        
        <button className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all text-sm shadow-sm">
          <CheckCircle className="w-4 h-4" />
          Approve (Override)
        </button>
        
        <button className="flex items-center gap-2 px-8 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all text-sm shadow-md ring-4 ring-red-50">
          <XCircle className="w-4 h-4" />
          Reject Claim
        </button>
      </div>
    </footer>
  );
};

export default Footer;
