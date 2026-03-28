import React, { useState } from 'react';
import { Shield, Users, Gift, LayoutDashboard, Heart } from 'lucide-react';
import AdminOverview from '../components/admin/AdminOverview';
import AdminUsers from '../components/admin/AdminUsers';
import AdminCharities from '../components/admin/AdminCharities';
import AdminDraws from '../components/admin/AdminDraws';
import AdminWinners from '../components/admin/AdminWinners';

import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'charities', label: 'Charities', icon: Heart },
    { id: 'draws', label: 'Draw Engine', icon: Gift },
    { id: 'winners', label: 'Winners', icon: Shield },
  ];

  return (
    <div className="bg-slate-950 flex-1 py-10 relative overflow-hidden min-h-screen text-slate-200">
      {/* Background glow styling */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            <div className="mb-6 px-4">
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Console</h1>
              <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest mt-1">Platform Control</p>
            </div>
            
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                    activeTab === tab.id 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                      : 'text-slate-400 hover:bg-slate-900 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-h-[600px]">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
               {activeTab === 'overview' && <AdminOverview onTabChange={setActiveTab} />}
               {activeTab === 'users' && <AdminUsers />}
               {activeTab === 'charities' && <AdminCharities />}
               {activeTab === 'draws' && <AdminDraws />}
               {activeTab === 'winners' && <AdminWinners />}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
