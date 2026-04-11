'use client';

import React from 'react';
import { Search, Bell, User, ChevronRight } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 text-sm font-medium">
        <span className="text-slate-400">Queue</span>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-800">Claim #1042X</span>
      </div>

      <div className="flex-1 max-w-xl mx-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search claims, hospital IDs, or doctor names..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2" />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800 leading-none">Sarah Jenkins</p>
            <p className="text-xs text-slate-500 mt-1">Senior Adjuster</p>
          </div>
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-slate-100">
            SJ
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
