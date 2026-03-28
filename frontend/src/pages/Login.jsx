import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const { data, error } = await signIn(email, password);
      if (error) throw error;

      if (data?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (profile && profile.role === 'admin') {
          navigate('/admin');
          return;
        }
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl relative z-10"
      >
        <div>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-slate-950 mx-auto font-black text-2xl shadow-[0_0_15px_rgba(16,185,129,0.5)]">G</div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Welcome back</h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Or <Link to="/signup" className="font-medium text-emerald-400 hover:text-emerald-300">create a new account</Link>
          </p>
        </div>
        
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email address</label>
              <input
                type="email" required
                className="w-full rounded-xl border-slate-700 bg-slate-950 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3 px-4 placeholder-slate-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password" required
                className="w-full rounded-xl border-slate-700 bg-slate-950 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-3 px-4 placeholder-slate-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50"
            >
              {loading ? 'Entering club...' : 'Sign In'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
