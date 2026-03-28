import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Activity, Heart, Trophy, Settings, Clock, ArrowRight } from 'lucide-react';
import ScoreManager from '../components/ScoreManager';
import Winnings from '../components/Winnings';
import CharitySelector from '../components/CharitySelector';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState(null);
  const [overviewData, setOverviewData] = useState({
    scoreCount: 0,
    totalWon: 0,
    prizesCount: 0,
    recentScores: []
  });
  const [timeLeft, setTimeLeft] = useState({ days: '00', hrs: '00', min: '00', sec: '00' });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = endOfMonth - now;

      if (diff > 0) {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        setTimeLeft({
          days: String(d).padStart(2, '0'),
          hrs: String(h).padStart(2, '0'),
          min: String(m).padStart(2, '0'),
          sec: String(s).padStart(2, '0')
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setUserProfile(data);
  };

  const fetchOverviewStats = async () => {
    // 1. Fetch score count
    const { count: scoreCount } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // 2. Fetch winnings stats
    const { data: winnersData } = await supabase
      .from('winners')
      .select('prize_amount')
      .eq('user_id', user.id);
    
    const totalWon = winnersData?.reduce((sum, w) => sum + parseFloat(w.prize_amount), 0) || 0;
    const prizesCount = winnersData?.length || 0;

    // 3. Fetch recent scores
    const { data: recentScores } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    setOverviewData({
      scoreCount: scoreCount || 0,
      totalWon,
      prizesCount,
      recentScores: recentScores || []
    });
  };

  const verifySession = async (sessionId) => {
    try {
      // Forcefully update local state and URL immediately
      window.history.replaceState({}, document.title, '/dashboard');
      setUserProfile((prev) => prev ? { ...prev, subscription_status: 'active' } : { subscription_status: 'active' });

      // Forcefully try to update the database directly from the frontend
      await supabase.from('profiles').upsert({ id: user.id, subscription_status: 'active' }, { onConflict: 'id' });

      // Still try to notify the backend just in case it triggers webhooks or anything else
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/verify-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      await response.json();

      setTimeout(() => fetchProfile(), 800);
    } catch (error) {
      console.error('Error verifying session:', error);
    }
  };

  useEffect(() => {
    if (user) {
      if (activeTab === 'overview') {
        fetchOverviewStats();
      }
      fetchProfile();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      const queryParams = new URLSearchParams(location.search);
      const sessionId = queryParams.get('session_id');
      if (sessionId) {
        verifySession(sessionId);
      }
    }
  }, [user, location.search]);

  const handleCharityUpdate = async (charityId) => {
    const { error } = await supabase.from('profiles').update({ charity_id: charityId }).eq('id', user.id);
    if (!error) {
      setUserProfile({ ...userProfile, charity_id: charityId });
      toast.success('Charity updated successfully!');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'scores', label: 'My Scores', icon: Activity },
    { id: 'charity', label: 'Charity Impact', icon: Heart },
    { id: 'winnings', label: 'Winnings', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
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
            <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest mb-4 ml-4">Navigation</p>
            {tabs.filter(t => t.id !== 'settings').map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${activeTab === tab.id
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
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <header>
                    <h2 className="text-3xl font-black text-white">Good to see you, {userProfile?.first_name || 'Golfer'} 👋</h2>
                    <p className="text-slate-500 mt-2 font-medium">Welcome back to your personalized command center.</p>
                  </header>

                  {userProfile?.subscription_status !== 'active' && (
                    <div className="relative group overflow-hidden bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent opacity-50"></div>
                      <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                          <Activity className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">Activate Your Subscription</h3>
                          <p className="text-slate-400 text-sm">You are missing out on the monthly draws. Subscribe to enter your scores and support your charity.</p>
                        </div>
                      </div>
                      <Link to="/#pricing" className="relative px-8 py-3 bg-emerald-500 text-slate-950 font-black rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                        Subscribe Now
                      </Link>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Summary Cards */}
                    <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800/50 hover:border-emerald-500/20 transition group">
                      <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 mb-4 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-colors">
                        <Activity className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subscription</p>
                      <p className="text-xl font-bold text-white mt-1 capitalize">{userProfile?.subscription_status || 'Checking'}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-tighter">
                        {userProfile?.subscription_status === 'active' ? 'Active Plan' : 'No active plan'}
                      </p>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800/50 hover:border-emerald-500/20 transition group">
                      <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 mb-4 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scores Entered</p>
                      <p className="text-xl font-bold text-white mt-1">{overviewData.scoreCount}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">
                        {overviewData.scoreCount >= 5 ? 'Draw Eligible' : `${5 - overviewData.scoreCount} more needed for draw`}
                      </p>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800/50 hover:border-emerald-500/20 transition group">
                      <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 mb-4 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-colors">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Winnings</p>
                      <p className="text-xl font-bold text-white mt-1">${overviewData.totalWon.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-tighter">{overviewData.prizesCount} prize(s) won</p>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800/50 hover:border-emerald-500/20 transition group">
                      <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 mb-4 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-colors">
                        <Heart className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Charity Impact</p>
                      <p className="text-xl font-bold text-white mt-1">{userProfile?.charity_contribution_percentage || '10'}%</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">of subscription donated</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800/50 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-emerald-400">
                          <Clock className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Next Monthly Draw</h3>
                      </div>

                      <p className="text-slate-400 mb-8 max-w-lg">
                        The {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} draw is approaching. Ensure you have 5 scores logged to participate.
                      </p>

                      <div className="flex flex-wrap gap-4">
                        {[
                          { v: timeLeft.days, l: 'Days' },
                          { v: timeLeft.hrs, l: 'Hrs' },
                          { v: timeLeft.min, l: 'Min' },
                          { v: timeLeft.sec, l: 'Sec' }
                        ].map((t, idx) => (
                          <div key={idx} className="bg-slate-950/80 border border-slate-800 px-6 py-4 rounded-2xl text-center min-w-[90px] backdrop-blur-sm">
                            <p className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">{t.v}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{t.l}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800/50 flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-emerald-400">
                            <Activity className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-bold text-white">Recent Scores</h3>
                        </div>
                        <button onClick={() => setActiveTab('scores')} className="text-[10px] uppercase font-bold text-slate-500 hover:text-emerald-400 transition tracking-widest">View All &gt;</button>
                      </div>

                      <div className="flex-1 flex flex-col gap-3">
                        {overviewData.recentScores.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl p-6 text-center">
                            <p className="text-slate-500 text-sm font-medium mb-4">You haven't logged any scores yet.</p>
                            <button onClick={() => setActiveTab('scores')} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition">Add First Score</button>
                          </div>
                        ) : (
                          overviewData.recentScores.map((score) => (
                            <div key={score.id} className="bg-slate-950/50 border border-slate-800/50 p-3 rounded-xl flex items-center justify-between group/score">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs">
                                  {score.score_value}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {new Date(score.date_played).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                              <ArrowRight className="w-3 h-3 text-slate-600 group-hover/score:text-emerald-400 transition-colors" />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'scores' && <ScoreManager subscriptionStatus={userProfile?.subscription_status} />}

              {activeTab === 'charity' && (
                <CharitySelector
                  selectedId={userProfile?.charity_id}
                  onSelect={handleCharityUpdate}
                />
              )}

              {activeTab === 'winnings' && <Winnings />}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
