import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
        setIsAdmin(data?.role === 'admin');
      });
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  const getLinkStyle = (linkPath, exact = false) => {
    const [path, hashPart] = linkPath.split('#');
    const hash = hashPart ? `#${hashPart}` : '';
    const currentPath = location.pathname;
    const currentHash = location.hash;
    
    let isActive = false;
    if (hash) {
      isActive = currentPath === path && currentHash === hash;
    } else {
      isActive = exact ? currentPath === path && !currentHash : currentPath.startsWith(path) && !currentHash;
    }
    
    return isActive
      ? "text-emerald-400 font-bold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] transition-all text-sm tracking-wide relative"
      : "text-slate-400 hover:text-emerald-400 font-medium transition-all text-sm tracking-wide";
  };

  return (
    <nav className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 fixed w-full z-50 top-0 left-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-extrabold tracking-widest text-white flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.8)] transition-all">
                <span className="font-black text-lg">G</span>
              </div>
              <span className="group-hover:text-emerald-50 transition-colors">CLUB</span>
            </Link>
          </div>
          
          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-8 bg-slate-900/50 px-8 py-2.5 rounded-full border border-slate-800/50">
            <Link to="/" className={getLinkStyle('/', true)}>Home</Link>
            <Link to="/#how-it-works" className={getLinkStyle('/#how-it-works')}>How It Works</Link>
            <Link to="/#pricing" className={getLinkStyle('/#pricing')}>Pricing</Link>
            <Link to="/charities" className={getLinkStyle('/charities')}>Charities</Link>
            {user && <Link to={dashboardPath} className={getLinkStyle(dashboardPath)}>Dashboard</Link>}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-xs font-medium text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
                  {user.email}
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-slate-800/50 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 border border-transparent hover:border-rose-500/30 px-5 py-2 rounded-full text-sm font-bold transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className={`${getLinkStyle('/login')} px-2`}>
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
