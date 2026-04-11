'use client';

import React from 'react';
import { LayoutDashboard, ClipboardList, Share2, Settings, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Active Queue', icon: ClipboardList, href: '/queue' },
    { name: 'Suspicious Rings', icon: Share2, href: '/rings' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="bg-red-50 p-2 rounded-lg">
          <ShieldAlert className="w-6 h-6 text-red-600" />
        </div>
        <span className="font-bold text-slate-800 text-lg tracking-tight">Sentinel Guard</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                isActive 
                  ? 'bg-slate-50 text-slate-900 border border-slate-200 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">System Status</p>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Analysis Active
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
