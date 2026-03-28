import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Dices, Brain, HandIcon, Play, Eye, FileText, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [drawType, setDrawType] = useState('random');
  const [manualNumbers, setManualNumbers] = useState(['', '', '', '', '']);
  const [stats, setStats] = useState({ activeSubscribers: 0, totalPrizePool: 0, rollover: 0 });

  const fetchDraws = async () => {
    const { data } = await supabase.from('draws').select('*').order('created_at', { ascending: false });
    if(data) setDraws(data);
  };
  
  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/draws/stats`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if(res.ok) setStats(await res.json());
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => { 
    fetchDraws(); 
    fetchStats();
  }, []);

  const executeDraw = async (mode) => {
    // Validate manual numbers if selected
    if (drawType === 'manual') {
      const parsed = manualNumbers.map(n => parseInt(n));
      if (parsed.some(isNaN) || parsed.some(n => n < 1 || n > 45)) {
        return toast.error('Please enter 5 valid numbers between 1 and 45.');
      }
      const unique = new Set(parsed);
      if (unique.size !== 5) {
        return toast.error('All 5 numbers must be unique.');
      }
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const runMonth = new Date().toISOString().slice(0, 7);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/draws/execute`, {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
           month: runMonth, 
           isSimulation: mode === 'simulate',
           logicType: drawType,
           manualNumbers: drawType === 'manual' ? manualNumbers : undefined
        })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error);
      
      if(mode === 'simulate') {
        setSimulationResult({
           draw_numbers: data.winningNumbers,
           prize_pool_generated: data.totalPrizePool,
           new_rollover: data.newRollover
        });
        toast.success('Simulation completed securely.');
      } else {
        setSimulationResult(null);
        toast.success('Official Draw Published Successfully!');
        fetchDraws();
        fetchStats();
      }
    } catch(err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualNumChange = (index, val) => {
    const newArr = [...manualNumbers];
    newArr[index] = val;
    setManualNumbers(newArr);
  };

  const currentDraw = draws.length > 0 ? draws[0] : null;
  const simOrCur = simulationResult 
    ? {
        month: new Date().toISOString().slice(0, 7),
        status: 'simulated',
        winning_numbers: simulationResult.draw_numbers,
        prize_pool: simulationResult.prize_pool_generated,
        jackpot_rollover_amount: simulationResult.new_rollover,
        subscribers: stats.activeSubscribers
      }
    : currentDraw || {
        month: new Date().toISOString().slice(0, 7),
        status: 'draft',
        winning_numbers: [0,0,0,0,0],
        prize_pool: 0,
        jackpot_rollover_amount: 0,
        subscribers: 0
      };

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Draw Engine</h2>
        <p className="text-slate-400 text-sm font-light">Create, simulate, and publish monthly prize draws</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative z-10">
        
        {/* Left Panel: Create Draw */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 shadow-2xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Create Draw</h3>
          
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Draw Type</label>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 relative z-10 w-full overflow-x-auto">
              {[
                { id: 'random', label: 'Random', icon: Dices },
                { id: 'logic', label: 'Logic', icon: Brain },
                { id: 'manual', label: 'Manual', icon: HandIcon }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setDrawType(type.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all relative ${
                    drawType === type.id 
                      ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <type.icon className={`w-4 h-4 ${drawType === type.id ? 'text-purple-400' : 'text-slate-500'}`} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {drawType === 'manual' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Winning Numbers (1-45)</label>
                <div className="flex gap-2">
                  {manualNumbers.map((num, idx) => (
                    <input 
                      key={idx}
                      type="number"
                      min="1" max="45"
                      value={num}
                      onChange={(e) => handleManualNumChange(idx, e.target.value)}
                      className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 text-center text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3 pt-4">
            <button 
              disabled={loading}
              onClick={() => executeDraw('publish')}
              className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 px-4 py-3.5 rounded-xl flex items-center justify-center relative shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50"
            >
              <Zap className="w-5 h-5 text-white absolute left-4" />
              <span className="font-bold text-white tracking-wide">
                {loading ? 'Executing...' : 'Quick Run (Draft + Publish)'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Panel: Current Draw */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 shadow-2xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Current Draw</h3>
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Month</p>
              <h4 className="text-2xl font-black text-white">{simOrCur.month}</h4>
            </div>
            {simOrCur.status === 'published' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Published
              </span>
            ) : simOrCur.status === 'simulated' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <FileText className="w-3.5 h-3.5" /> Simulated Draft
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                Pending
              </span>
            )}
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Draw Numbers</p>
            <div className="flex flex-wrap gap-2">
              {(simOrCur.winning_numbers || [0,0,0,0,0]).map((num, i) => (
                <div key={i} className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-700/50 flex items-center justify-center text-lg font-black text-white shadow-inner">
                  {num > 0 ? num : '-'}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
             <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
               <p className="text-xs font-bold text-slate-500 mb-1">Prize Pool</p>
               <p className="font-bold text-amber-500 text-lg">${parseFloat(simOrCur.total_prize_pool || simOrCur.prize_pool || stats.totalPrizePool || 0).toFixed(2)}</p>
             </div>
             <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
               <p className="text-xs font-bold text-slate-500 mb-1">Subscribers</p>
               <p className="font-bold text-blue-400 text-lg">{simOrCur.subscribers !== undefined ? simOrCur.subscribers : stats.activeSubscribers}</p>
             </div>
             <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
               <p className="text-xs font-bold text-slate-500 mb-1">Jackpot C/F</p>
               <p className="font-bold text-purple-400 text-lg">${parseFloat(simOrCur.jackpot_rollover || simOrCur.jackpot_rollover_amount || stats.rollover || 0).toFixed(2)}</p>
             </div>
             <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
               <p className="text-xs font-bold text-slate-500 mb-1">Type</p>
               <p className="font-bold text-emerald-400 text-lg capitalize">{simOrCur.logic_type || drawType}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Draw History Table */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Draw History</h3>
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">Numbers</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Pool</th>
                  <th className="px-6 py-4">Subscribers</th>
                  <th className="px-6 py-4 text-right">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {draws.map((draw, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={draw.id} 
                      className={`${isEven ? 'bg-transparent' : 'bg-slate-900/30'} hover:bg-slate-800/50 transition-colors group`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-white">{draw.month}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          {(draw.winning_numbers || []).map((n, i) => (
                            <span key={i} className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                              {n}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          draw.status === 'published' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        } capitalize`}>
                          {draw.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-amber-500">${parseFloat(draw.total_prize_pool || draw.prize_pool || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400">{stats.activeSubscribers}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-400 capitalize">
                          {draw.logic_type || 'random'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
                {draws.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No draws have been executed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
