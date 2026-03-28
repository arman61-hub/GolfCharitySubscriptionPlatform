import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CircleDollarSign, Heart, Trophy, Activity, ArrowRight, ShieldCheck, FileText, BarChart3, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminOverview({ onTabChange }) {
  const [stats, setStats] = useState({
    users: 0,
    prizePool: 0,
    charityRaised: 0,
    pendingWinners: 0,
    grossVolume: 0,
    activeAlgorithm: '—',
    latestNumbers: [0, 0, 0, 0, 0],
    latestMonth: '—'
  });
  const [activeDraw, setActiveDraw] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // 1. Fetch total users via backend stats (bypasses RLS)
        const resUserStats = await fetch(`${import.meta.env.VITE_API_URL}/api/users/stats`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const userStats = resUserStats.ok ? await resUserStats.json() : { totalUsers: 0 };
        const usersCount = userStats.totalUsers;

        // 2. Fetch current active draw stats
        const resStats = await fetch(`${import.meta.env.VITE_API_URL}/api/draws/stats`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const statsData = resStats.ok ? await resStats.json() : { prizePool: 0, charityRaised: 0 };

        // 3. Fetch historical draws for algorithm & numbers
        const { data: pastDraws } = await supabase
          .from('draws')
          .select('total_prize_pool, logic_type, winning_numbers, month')
          .order('created_at', { ascending: false });

        let totalHistoricalPot = 0;
        let recentLogic = 'random';
        let latestNums = [0, 0, 0, 0, 0];
        let lastMonth = '—';

        if (pastDraws && pastDraws.length > 0) {
          totalHistoricalPot = pastDraws.reduce((sum, d) => sum + parseFloat(d.total_prize_pool || 0), 0);
          recentLogic = pastDraws[0].logic_type || 'random';
          latestNums = pastDraws[0].winning_numbers || [0, 0, 0, 0, 0];
          lastMonth = pastDraws[0].month || '—';
        }

        // 4. Fetch pending winners count
        const { count: pendingWinnersCount } = await supabase
          .from('winners')
          .select('*', { count: 'exact', head: true })
          .eq('verification_status', 'pending');

        setStats({
          users: usersCount || 0,
          prizePool: parseFloat(statsData.prizePool) || 0,
          charityRaised: parseFloat(statsData.charityRaised) || 0,
          grossVolume: totalHistoricalPot * 1.25, // Assuming 20% margin for simple stat
          pendingWinners: pendingWinnersCount || 0,
          activeAlgorithm: recentLogic,
          latestNumbers: latestNums,
          latestMonth: lastMonth
        });

        // 5. Fetch the next scheduled draw
        const { data: drawData } = await supabase
          .from('draws')
          .select('*')
          .eq('status', 'scheduled')
          .order('draw_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        setActiveDraw(drawData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading overview data:', err);
        setLoading(false);
      }
    };

    loadOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Administrative Overview</h2>
          <p className="text-slate-400 text-sm font-light">System vitals and real-time platform metrics.</p>
        </div>
        <button 
          onClick={() => onTabChange?.('draws')} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Execute Draw Engine
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <motion.div whileHover={{ y: -4 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-black text-white">{stats.users}</h3>
          <p className="text-slate-400 text-sm font-medium mt-1">Total Users</p>
          <p className="text-slate-500 text-xs mt-1">Platform accounts</p>
        </motion.div>

        {/* Current Prize Pool */}
        <motion.div whileHover={{ y: -4 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none"></div>
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-black text-white">${stats.prizePool.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <p className="text-slate-400 text-sm font-medium mt-1">Current Prize Pool</p>
          <p className="text-slate-500 text-xs mt-1">Accumulated pot</p>
        </motion.div>

        {/* Charity Raised */}
        <motion.div whileHover={{ y: -4 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none"></div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-black text-white">${stats.charityRaised.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <p className="text-slate-400 text-sm font-medium mt-1">Charity Raised</p>
          <p className="text-slate-500 text-xs mt-1">Total worldwide impact</p>
        </motion.div>

        {/* Pending Winners */}
        <motion.div whileHover={{ y: -4 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] rounded-full pointer-events-none"></div>
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-black text-white">{stats.pendingWinners}</h3>
          <p className="text-slate-400 text-sm font-medium mt-1">Pending Winners</p>
          <p className="text-slate-500 text-xs mt-1">Awaiting your verification</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Engine Interface */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-8 rounded-[1.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48 group-hover:bg-blue-600/10 transition-colors duration-1000"></div>
          
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <p className="text-blue-400 text-xs font-black tracking-[0.2em] uppercase mb-2">Live Draw Engine Status</p>
              <h3 className="text-3xl font-black text-white">Active Monthly Pool</h3>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              {stats.latestNumbers.some(n => n > 0) ? `Published (${stats.latestMonth})` : 'Standby'}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start relative z-10">
            <div>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-4">Latest Draw Numbers</p>
              <div className="flex gap-3">
                {stats.latestNumbers.map((num, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-black text-xl text-slate-200 shadow-inner">
                    {num > 0 ? num : '-'}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-4">Algorithm Basis</p>
              <div className="px-6 py-3 rounded-xl bg-slate-950 border border-slate-800 font-black text-xl text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)] capitalize">
                {stats.activeAlgorithm}
              </div>
            </div>
          </div>
        </div>

        {/* Control Protocols */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-8 rounded-[1.5rem] shadow-xl relative z-10">
          <h3 className="text-xl font-bold text-white mb-6">Control Protocols</h3>

          <div className="space-y-3">
            <button onClick={() => onTabChange?.('users')} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 hover:bg-slate-800 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="text-blue-400 group-hover:text-blue-300">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-slate-300 font-medium group-hover:text-white transition-colors">Manage Accounts</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </button>

            <button onClick={() => onTabChange?.('charities')} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-800 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="text-emerald-400 group-hover:text-emerald-300">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-slate-300 font-medium group-hover:text-white transition-colors">Verify Charities</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>

            <button onClick={() => onTabChange?.('winners')} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 hover:bg-slate-800 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="text-amber-400 group-hover:text-amber-300">
                  <CircleDollarSign className="w-5 h-5" />
                </div>
                <span className="text-slate-300 font-medium group-hover:text-white transition-colors">Process Payouts</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
