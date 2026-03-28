import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Upload, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Winnings() {
  const { user } = useAuth();
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  const fetchWinnings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/winners/my-winnings`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    const data = await res.json();
    if (!data.error) setWinnings(data);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchWinnings(); }, [user]);

  const stats = {
    totalWon: winnings.reduce((sum, win) => sum + parseFloat(win.prize_amount), 0),
    prizesCount: winnings.length,
    pendingPayout: winnings.filter(win => win.payout_status === 'pending' && win.verification_status === 'verified')
      .reduce((sum, win) => sum + parseFloat(win.prize_amount), 0)
  };

  const handleUpload = async (file, winnerId) => {
    if (!file) return;
    setUploading(winnerId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${winnerId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(fileName);

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/winners/${winnerId}/proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ proof_url: publicUrl })
      });

      if (!res.ok) throw new Error('Failed to save proof URL to database');

      toast.success('Proof uploaded successfully!');
      fetchWinnings();
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(null);
    }
  };

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-40 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="bg-slate-900 shadow-sm rounded-3xl border border-slate-800"></div>)}
      </div>
      <div className="h-64 bg-slate-900 shadow-sm rounded-3xl border border-slate-800"></div>
    </div>
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <header>
        <h2 className="text-3xl font-black text-white">My Winnings</h2>
        <p className="text-slate-500 mt-2 font-medium">Your prize history and payout status</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-slate-800/50 relative overflow-hidden group">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:bg-amber-500/20 transition-colors">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="text-3xl font-black text-white">${stats.totalWon.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-2">Total Won</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-slate-800/50 relative overflow-hidden group">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500/20 transition-colors">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="text-3xl font-black text-white">{stats.prizesCount}</p>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-2">Prizes Won</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-slate-800/50 relative overflow-hidden group">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500/20 transition-colors">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-3xl font-black text-white">${stats.pendingPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-2">Pending Payout</p>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-slate-800/50 shadow-xl overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-slate-800/50">
          <h3 className="text-xl font-bold text-white">Prize History</h3>
        </div>

        {winnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-slate-700 mb-6">
              <Trophy className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-400 mb-2">No winnings yet.</h4>
            <p className="text-slate-600 max-w-xs text-sm font-medium">Keep playing! Your winnings will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/30">
                  <th className="px-8 py-4 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Draw Month</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Match Type</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {winnings.map((win, i) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    key={win.id} className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-8 py-6 font-bold text-white">{win.draws?.month}</td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{win.match_tier} Layer Match</span>
                    </td>
                    <td className="px-8 py-6 font-black text-emerald-400">${parseFloat(win.prize_amount).toFixed(2)}</td>
                    <td className="px-8 py-6">
                      {win.verification_status === 'pending_proof' && (
                        <span className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase"><Clock className="w-3 h-3" /> Proof Required</span>
                      )}
                      {win.verification_status === 'pending_review' && (
                        <span className="flex items-center gap-2 text-amber-500 text-[10px] font-bold uppercase"><Clock className="w-3 h-3" /> Under Review</span>
                      )}
                      {win.verification_status === 'verified' && (
                        <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase"><CheckCircle className="w-3 h-3" /> {win.payout_status === 'paid' ? 'Paid' : 'Verified'}</span>
                      )}
                      {win.verification_status === 'rejected' && (
                        <span className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase"><XCircle className="w-3 h-3" /> Rejected</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {win.verification_status === 'pending_proof' && (
                        <div className="relative inline-block overflow-hidden">
                          <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files[0], win.id)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <button disabled={uploading === win.id} className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black hover:bg-emerald-400 transition shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            {uploading === win.id ? 'Uploading...' : 'Upload Proof'}
                          </button>
                        </div>
                      )}
                      {win.verification_status === 'verified' && win.payout_status === 'pending' && (
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Processing Payout</p>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
