'use client';

import React from 'react';
import { LayoutDashboard, ClipboardList, Share2, Settings, ShieldAlert, Activity } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Analytics Hub', icon: LayoutDashboard, href: '/adjuster/dashboard' },
    { name: 'Active Queue', icon: ClipboardList, href: '/queue' },
    { name: 'Fraud Rings', icon: Share2, href: '/rings' },
    { name: 'Security Config', icon: Settings, href: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen glass-card bg-background/50 border-r border-glass-border flex flex-col sticky top-0 rounded-none border-y-0 border-l-0">
      <div className="p-8 flex items-center gap-3 mb-4">
        <div className="bg-primary/20 p-2.5 rounded-xl">
          <ShieldAlert className="w-6 h-6 text-primary" />
        </div>
        <div>
          <span className="font-black text-white text-lg tracking-tighter block leading-none">BITWIZARD</span>
          <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">AI Engine</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mb-4 mt-8">Primary Ops</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
              <span className="font-bold text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="p-5 glass-card bg-primary/5 border-primary/20 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-12 h-12 text-primary" />
          </div>
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1.5">Engine Status</p>
          <div className="flex items-center gap-2 text-xs text-white font-bold">
            <div className="w-2 h-2 rounded-full bg-accent animate-glow" />
            XGBoost/Neo4j Active
          </div>
          <p className="text-[9px] text-slate-500 mt-3 leading-relaxed">Latency: <span className="text-slate-300">12ms</span> <br /> Confidence: <span className="text-slate-300">99.4%</span></p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
