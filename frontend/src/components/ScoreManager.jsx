import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Activity, Plus, Trophy, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ScoreManager({ subscriptionStatus }) {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreValue, setScoreValue] = useState('');
  const [datePlayed, setDatePlayed] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchScores = async () => {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('date_played', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) setScores(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchScores();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (subscriptionStatus !== 'active') return;

    setSubmitting(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ score_value: parseInt(scoreValue), date_played: datePlayed })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit score.');
      } else {
        setScoreValue('');
        toast.success('Score added successfully!');
        fetchScores();
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="h-64 bg-slate-900/50 rounded-3xl animate-pulse border border-slate-800"></div>
      <div className="lg:col-span-2 h-96 bg-slate-900/50 rounded-3xl animate-pulse border border-slate-800"></div>
    </div>
  );

  const isActive = subscriptionStatus === 'active';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">My Scores</h2>
          <p className="text-slate-500 mt-2 font-medium">Track your Stableford scores — latest 5 retained for monthly draws</p>
        </div>
      </header>

      {/* Subscription Required Banner */}
      {!isActive && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-2xl rounded-full -mr-10 -mt-10"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-400 flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Active Subscription Required</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-lg">You need an active subscription to log scores and participate in draws. Choose a plan below to get started.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/#pricing" className="px-6 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition">$9.99 / Month</Link>
              <Link to="/#pricing" className="px-6 py-3 bg-emerald-500 text-slate-950 rounded-xl text-sm font-black hover:bg-emerald-400 transition shadow-[0_0_20px_rgba(16,185,129,0.3)]">$99.99 / Year (Save 25%)</Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add Score Form */}
        <div>
          <div className={`bg-slate-900/40 backdrop-blur-xl p-6 rounded-[1.5rem] border border-slate-800/50 shadow-xl ${!isActive && 'opacity-50 pointer-events-none'}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-emerald-400">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Add Score</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 ml-1">Stableford Score (1-45)</label>
                <input
                  type="number" min="1" max="45" required
                  placeholder="e.g. 35"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 ml-1">Date Played</label>
                <input
                  type="date" required
                  value={datePlayed}
                  onChange={(e) => setDatePlayed(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all [color-scheme:dark]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !isActive}
                className="w-full py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Add Score'}
              </button>

              <p className="text-[10px] text-slate-600 text-center font-bold uppercase tracking-widest px-4">Only the latest 5 scores are kept. Oldest auto-removed.</p>
            </form>
            {error && <p className="text-red-400 text-xs mt-4 text-center font-bold">{error}</p>}
          </div>
        </div>

        {/* Right: Score History */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[1.5rem] border border-slate-800/50 shadow-xl min-h-[450px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl -z-10"></div>

            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-emerald-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Score History</h3>
              </div>

              {scores.length > 0 && (
                <div className="flex gap-2">
                  <span className="bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full">{scores.length}/5 scores</span>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${scores.length >= 5 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    {scores.length >= 5 ? 'Draw eligible ✓' : 'Need 5 scores'}
                  </span>
                </div>
              )}
            </div>

            {scores.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border border-dashed border-slate-800 rounded-[2rem]">
                <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-slate-700 mb-6">
                  <Activity className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-400 mb-2">No scores recorded yet.</h4>
                <p className="text-slate-600 max-w-xs text-sm font-medium">Add your first score to start participating in draws.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scores.map((score, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    key={score.id}
                    className="bg-slate-950/50 p-4.5 rounded-xl border border-slate-800/50 relative group overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 font-black border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          {score.score_value}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{score.score_value} Stableford Points</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(score.date_played).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            {i === 0 && <span className="text-[10px] font-black uppercase text-emerald-400 tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded-md">Latest</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    {/* <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(score.score_value / 45) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 + (i * 0.1) }}
                        className="h-full bg-gradient-to-r from-emerald-500/30 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      />
                    </div> */}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
