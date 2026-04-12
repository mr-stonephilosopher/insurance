'use client';

import React from 'react';
import { Search, Bell, User, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="h-20 glass-card bg-background/50 border-b border-glass-border flex items-center justify-between px-8 sticky top-0 z-50 rounded-none border-x-0 border-t-0">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Activity className="text-primary w-6 h-6" />
          </div>
          <span className="font-black text-xl tracking-tighter gradient-text">BITWIZARD</span>
        </Link>
        <div className="h-6 w-px bg-glass-border" />
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
          <span>Systems Health:</span>
          <span className="flex items-center gap-1.5 text-accent">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            Operational
          </span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4 flex-1 max-w-xl mx-12">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search claim DNA, transactions, or entities..." 
            className="w-full bg-slate-900/50 border border-glass-border rounded-xl py-2.5 pl-12 pr-4 text-sm focus:border-primary/50 focus:bg-slate-900 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-4 ring-background" />
        </button>
        
        <div className="flex items-center gap-4 pl-4 border-l border-glass-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-none">Adjuster</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">LEVEL 3</p>
          </div>
          <div className="w-11 h-11 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-black text-sm p-[1px]">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
