import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ExternalLink, Check, X, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWinners = async () => {
    try {
      const { data } = await supabase
        .from('winners')
        .select('*, draws(month), profiles(email, first_name, last_name)')
        .in('verification_status', ['pending', 'verified'])
        .order('created_at', { ascending: false });
      if (data) setWinners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWinners(); }, []);

  const handleAction = async (id, action) => {
    const { data: { session } } = await supabase.auth.getSession();
    const endpoint = action === 'approve' ? 'verify' : action === 'reject' ? 'reject' : 'payout';

    await fetch(`${import.meta.env.VITE_API_URL}/api/winners/${id}/${endpoint}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    fetchWinners();
  };

  // Metrics calculation
  const totalWinners = winners.length;
  const pendingReview = winners.filter(w => w.verification_status === 'pending').length;
  const approved = winners.filter(w => w.verification_status === 'verified' && w.payout_status !== 'paid').length;
  const paidOut = winners.filter(w => w.payout_status === 'paid').length;

  return (
    <div className="space-y-6 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Winners</h2>
        <p className="text-slate-400 text-sm font-light">Verify winner submissions and manage payouts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
        <motion.div whileHover={{ y: -4 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-6 rounded-2xl shadow-xl flex flex-col justify-center text-center">
          <h3 className="text-4xl font-black text-blue-400 mb-2">{totalWinners}</h3>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Total Winners</p>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-6 rounded-2xl shadow-xl flex flex-col justify-center text-center">
          <h3 className="text-4xl font-black text-amber-500 mb-2">{pendingReview}</h3>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Pending Review</p>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-6 rounded-2xl shadow-xl flex flex-col justify-center text-center">
          <h3 className="text-4xl font-black text-emerald-400 mb-2">{approved}</h3>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Approved</p>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-6 rounded-2xl shadow-xl flex flex-col justify-center text-center">
          <h3 className="text-4xl font-black text-purple-400 mb-2">{paidOut}</h3>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Paid Out</p>
        </motion.div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Winner</th>
                <th className="px-6 py-4">Draw</th>
                <th className="px-6 py-4">Match</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Proof</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-500" />
                    Loading winners data...
                  </td>
                </tr>
              ) : winners.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No winners currently found matching this criteria.
                  </td>
                </tr>
              ) : (
                winners.map((w, idx) => {
                  const isEven = idx % 2 === 0;
                  const isPaid = w.payout_status === 'paid';
                  const isApproved = w.verification_status === 'verified';
                  const isPending = w.verification_status === 'pending';

                  return (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={w.id}
                      className={`${isEven ? 'bg-transparent' : 'bg-slate-900/30'} hover:bg-slate-800/50 transition-colors group`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white whitespace-nowrap">
                            {(w.profiles?.first_name || w.profiles?.last_name) 
                              ? `${w.profiles.first_name || ''} ${w.profiles.last_name || ''}`.trim() 
                              : (w.profiles?.email ? w.profiles.email.split('@')[0] : 'Unknown')}
                          </span>
                          <span className="text-slate-500 text-xs">{w.profiles?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 text-sm font-medium">{w.draws?.month || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 text-sm font-medium">{w.match_tier}-Match</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-emerald-400">${parseFloat(w.prize_amount).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${isPaid
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                            : isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                          {isPaid ? 'Paid' : isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {w.proof_url ? (
                          <a href={w.proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                            View <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-slate-600 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <button onClick={() => handleAction(w.id, 'approve')} className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors border border-emerald-500/30" title="Approve">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleAction(w.id, 'reject')} className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/30" title="Reject">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isApproved && !isPaid && (
                            <button onClick={() => handleAction(w.id, 'pay')} className="px-3 py-1.5 rounded-lg bg-blue-500 text-slate-950 text-xs font-bold hover:bg-blue-400 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                              Mark Paid
                            </button>
                          )}
                          {isPaid && (
                            <span className="text-slate-600 text-sm">—</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
