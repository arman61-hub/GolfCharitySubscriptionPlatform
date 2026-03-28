import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Activity, ShieldCheck, Heart, CircleDollarSign, Target, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
   const { user } = useAuth();
   const [loading, setLoading] = useState(false);
   const location = useLocation();
   const navigate = useNavigate();

   useEffect(() => {
      if (location.hash) {
         const element = document.getElementById(location.hash.substring(1));
         if (element) {
            setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
         }
      } else {
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }
   }, [location]);

   const handleSubscribe = async (planType) => {
      if (!user) {
         navigate('/login');
         return;
      }

      setLoading(true);
      try {
         const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ planType, userId: user.id })
         });

         const { url } = await response.json();
         if (url) {
            window.location.href = url;
         }
      } catch (error) {
         console.error("Error creating checkout session", error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="bg-slate-950 text-slate-100 min-h-screen pt-16 relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">

         {/* Background Ambience */}
         <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

         {/* 1. HERO SECTION */}
         <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 text-center z-10 flex flex-col items-center">
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-sm font-medium text-emerald-400 mb-8 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            >
               <Sparkles className="w-4 h-4" /> G-Club Network
            </motion.div>

            <motion.h1
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg leading-tight"
            >
               Turn Your Golf Scores <br className="hidden sm:block" />
               Into Returns & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Real Impact</span>
            </motion.h1>

            <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl font-light leading-relaxed"
            >
               Play the game you love, match your scores to the monthly draw, and automatically donate to charities you care about. Elevate your game today.
            </motion.p>

            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               className="mt-10"
            >
               <a
                  href="#pricing"
                  className="inline-block rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:bg-emerald-400 hover:scale-105 transition-all"
               >
                  Get Started Now
               </a>
            </motion.div>
         </section>

         {/* 2. BENTO GRID FEATURES */}
         <section className="relative max-w-6xl mx-auto px-6 py-16 z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

               {/* Box 1 - Score Tracking (col 1) */}
               <motion.div whileHover={{ y: -5 }} className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col items-start justify-between min-h-[250px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full group-hover:bg-emerald-500/20 transition-all"></div>
                  <div>
                     <Activity className="w-8 h-8 text-emerald-400 mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">Score Tracking</h3>
                     <p className="text-sm text-slate-400 font-light">Log your best Stableford rounds. We keep your latest 5 active for precision drawing.</p>
                  </div>
                  <div className="w-full mt-6 space-y-3">
                     <div className="flex items-center gap-3"><span className="text-xs text-slate-500 w-4">#1</span><div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div></div><span className="text-xs font-bold text-white">41</span></div>
                     <div className="flex items-center gap-3"><span className="text-xs text-slate-500 w-4">#2</span><div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[72%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div></div><span className="text-xs font-bold text-white">36</span></div>
                     <div className="flex items-center gap-3"><span className="text-xs text-slate-500 w-4">#3</span><div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[60%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div></div><span className="text-xs font-bold text-white">30</span></div>
                  </div>
               </motion.div>

               {/* Box 2 - Monthly Random Draws (col 2-3) */}
               <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col justify-between min-h-[250px] relative overflow-hidden group">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-teal-500/10 blur-[60px] rounded-full group-hover:bg-teal-500/20 transition-all"></div>
                  <div>
                     <Target className="w-8 h-8 text-emerald-400 mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">Monthly Random Draws</h3>
                     <p className="text-sm text-slate-400 font-light max-w-sm">An algorithmic, highly-secure draw engine checks your scores against the monthly winning numbers. Match numbers to claim your share.</p>
                  </div>
                  <div className="flex justify-center gap-3 sm:gap-6 mt-8 relative z-10">
                     {['34', '18', '52', '28', '07'].map((num, i) => (
                        <motion.div
                           initial={{ y: 0 }}
                           whileHover={{ y: -10 }}
                           key={i}
                           className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-950 border border-emerald-500/30 flex items-center justify-center font-black text-xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-default"
                        >
                           {num}
                        </motion.div>
                     ))}
                  </div>
               </motion.div>

               {/* Box 3 - Charity Impact (col 1) */}
               <motion.div whileHover={{ y: -5 }} className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col justify-between min-h-[200px] group">
                  <div>
                     <Heart className="w-8 h-8 text-rose-400 mb-4 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                     <h3 className="text-xl font-bold text-white mb-2">Charity Impact</h3>
                     <p className="text-sm text-slate-400 font-light mb-4">Direct 10% of your subscription to a charity of your choice automatically.</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Cancer Research</span>
                     <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">+ 12 More</span>
                  </div>
               </motion.div>

               {/* Box 4 - Guaranteed Verified (col 2) */}
               <motion.div whileHover={{ y: -5 }} className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center min-h-[200px] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent"></div>
                  <ShieldCheck className="w-12 h-12 text-blue-400 mb-4 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)] group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-2">Guaranteed Verified</h3>
                  <p className="text-sm text-slate-400 font-light">All winners are manually verified by uploading screenshot proof. True fairness.</p>
               </motion.div>

               {/* Box 5 - Fast Payouts (col 3) */}
               <motion.div whileHover={{ y: -5 }} className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col justify-between min-h-[200px] group relative overflow-hidden">
                  <div className="absolute top-0 right-0 -m-4 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full group-hover:bg-amber-500/20 transition-all"></div>
                  <div>
                     <CircleDollarSign className="w-8 h-8 text-amber-400 mb-4 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                     <h3 className="text-xl font-bold text-white mb-2">Fast, Direct Payouts</h3>
                     <p className="text-sm text-slate-400 font-light">Once verified, your prize winnings are transferred straight to your bank account securely.</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border border-slate-800 bg-slate-950 rounded-xl px-4 py-3">
                     <span className="text-xs text-slate-400">Total Paid Out</span>
                     <span className="text-sm font-bold text-amber-400">$24,195.00</span>
                  </div>
               </motion.div>
            </div>
         </section>

         {/* 3. HOW IT WORKS */}
         <section id="how-it-works" className="py-32 max-w-7xl mx-auto px-6 text-center relative z-10 scroll-mt-24">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">How It Works</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light mb-20">Three simple steps to enter the draws and start making a real impact.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
               <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-[2rem] shadow-xl relative z-10 hover:border-slate-700 transition-colors flex flex-col items-center text-center overflow-hidden">
                  <div className="absolute top-6 right-8 text-7xl font-black text-slate-800/50 select-none">01</div>
                  <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center mb-8 shadow-inner relative z-10">
                     <ShieldCheck className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Subscribe & Connect</h3>
                  <p className="text-slate-400 font-light leading-relaxed relative z-10">Join the platform and select your preferred charity. A minimum 10% of your subscription goes directly to them.</p>
               </div>

               <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-[2rem] shadow-xl relative z-10 hover:border-slate-700 transition-colors flex flex-col items-center text-center overflow-hidden">
                  <div className="absolute top-6 right-8 text-7xl font-black text-slate-800/50 select-none">02</div>
                  <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center mb-8 shadow-inner relative z-10">
                     <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Log 5 Scores</h3>
                  <p className="text-slate-400 font-light leading-relaxed relative z-10">Enter 5 Stableford scores (1-45) via the dashboard. We automatically use your most recent 5 scores for every draw.</p>
               </div>

               <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-[2rem] shadow-xl relative z-10 hover:border-slate-700 transition-colors flex flex-col items-center text-center overflow-hidden">
                  <div className="absolute top-6 right-8 text-7xl font-black text-slate-800/50 select-none">03</div>
                  <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center mb-8 shadow-inner relative z-10">
                     <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Win Monthly</h3>
                  <p className="text-slate-400 font-light leading-relaxed relative z-10">Match your scores against our provably fair monthly draw. Match 3, 4, or 5 numbers to claim your share of the pool.</p>
               </div>
            </div>
         </section>

         {/* 4. PRIZE POOL TIERS */}
         <section className="py-32 bg-transparent relative z-10">
            <div className="max-w-7xl mx-auto px-6 text-center">
               <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Prize Pool Tiers</h2>
               <p className="text-slate-400 text-lg font-light mb-20 max-w-2xl mx-auto">The total prize pool is divided fairly based on how many numbers you match.</p>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div whileHover={{ y: -5 }} className="bg-slate-900/50 border border-slate-800 p-14 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                     <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                     <h3 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-600 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">40%</h3>
                     <p className="text-white text-xl font-bold mb-2">5-Number Match</p>
                     <p className="text-slate-400 font-light">Jackpot (Rollover if no winner)</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -5 }} className="bg-slate-900/50 border border-slate-800 p-14 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                     <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                     <h3 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">35%</h3>
                     <p className="text-white text-xl font-bold mb-2">4-Number Match</p>
                     <p className="text-slate-400 font-light">Second Tier</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -5 }} className="bg-slate-900/50 border border-slate-800 p-14 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                     <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                     <h3 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-purple-600 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">25%</h3>
                     <p className="text-white text-xl font-bold mb-2">3-Number Match</p>
                     <p className="text-slate-400 font-light">Third Tier</p>
                  </motion.div>
               </div>
            </div>
         </section>

         {/* 5. TRANSPARENT CHARITABLE IMPACT */}
         <section className="py-24 max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
               <div>
                  <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                     Transparent <br className="hidden sm:block" />
                     <span className="text-emerald-400">Charitable Impact</span>
                  </h2>
                  <p className="text-slate-400 font-light leading-relaxed mb-6">
                     We believe in tracking the exact flow of every penny. Our charities are heavily vetted, and 10% of our entire platform revenue is instantly sent directly via our integration.
                  </p>
                  <p className="text-slate-400 font-light leading-relaxed mb-10">
                     Watch the bars fill up as our community grows. Let's make a real difference, stroke by stroke.
                  </p>
                  <Link to="/charities" className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-slate-800">
                     Join the Mission <Sparkles className="w-4 h-4 text-emerald-400" />
                  </Link>
               </div>

               <div className="space-y-6">
                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                     <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-white">Health Care for All</span>
                        <span className="text-emerald-400 text-sm font-bold font-mono">$14,792</span>
                     </div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[75%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                     </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                     <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-white">Cancer Research</span>
                        <span className="text-blue-400 text-sm font-bold font-mono">$9,420</span>
                     </div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[55%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                     </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                     <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-white">Free Education</span>
                        <span className="text-purple-400 text-sm font-bold font-mono">$5,610</span>
                     </div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[40%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* 6. SIMPLE PRICING */}
         <section id="pricing" className="py-32 bg-slate-950 border-t border-slate-900 relative z-10 scroll-mt-24">
            <div className="max-w-4xl mx-auto px-6 text-center">
               <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Simple Pricing</h2>
               <p className="text-slate-400 text-lg font-light mb-20 max-w-2xl mx-auto">No hidden fees. Every tier contributes 10% directly to our charity partners.</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center max-w-3xl mx-auto">
                  <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-900 border border-slate-800 p-10 rounded-3xl text-left shadow-xl hover:border-slate-700 transition-colors flex flex-col justify-between min-h-[400px]">
                     <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Monthly Plan</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                           <span className="text-5xl font-extrabold text-emerald-100">$9.99</span><span className="text-sm text-slate-500 font-bold">/mo</span>
                        </div>
                        <p className="text-sm text-slate-400 font-light mb-8">Perfect for getting started and experiencing the draws.</p>
                        <ul className="space-y-4 mb-8 text-sm text-slate-300 font-light">
                           <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" /> Enter 5 rolling scores</li>
                           <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" /> Monthly draw entry</li>
                           <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" /> 10% Charity Donation</li>
                        </ul>
                     </div>
                     <button
                        onClick={() => handleSubscribe('monthly')}
                        disabled={loading}
                        className="w-full mt-4 text-center bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-700 transition disabled:opacity-50"
                     >
                        {loading ? 'Processing...' : 'Subscribe Monthly'}
                     </button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-900 border border-emerald-500/50 p-10 rounded-3xl text-left shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden flex flex-col justify-between min-h-[440px]">
                     <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">Most Popular</div>
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[30px] rounded-full pointer-events-none"></div>
                     <div>
                        <h3 className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] mb-2">Yearly Plan</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                           <span className="text-5xl font-extrabold text-white">$99.99</span><span className="text-sm text-emerald-500/70 font-bold">/yr</span>
                        </div>
                        <p className="text-sm text-slate-400 font-light mb-8">Maximum impact, lowest price per month. Save ~15%.</p>
                        <ul className="space-y-4 mb-8 text-sm text-slate-300 font-light">
                           <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" /> Enter 5 rolling scores</li>
                           <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" /> Priority draw processing</li>
                           <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" /> Built-in ~15% discount</li>
                        </ul>
                     </div>
                     <button
                        onClick={() => handleSubscribe('yearly')}
                        disabled={loading}
                        className="w-full mt-4 text-center bg-emerald-500 text-slate-950 font-bold py-4 rounded-xl hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition disabled:opacity-50 relative z-10"
                     >
                        {loading ? 'Processing...' : 'Subscribe Yearly'}
                     </button>
                  </motion.div>
               </div>
            </div>
         </section>

         {/* 7. FOOTER CTA */}
         <section className="py-32 relative z-10 px-6">
            <div className="max-w-5xl mx-auto bg-[#0B1120] border border-slate-800 p-16 sm:p-24 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
               {/* Subtle glow behind the box */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>

               <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 relative z-10">Ready to hit the green?</h2>
               <p className="text-slate-400 text-lg mb-10 font-light max-w-xl mx-auto relative z-10">Join the platform that adds incredible value to your game and the causes you care about.</p>
               <Link to="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-slate-950 font-bold px-8 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 transition-all relative z-10">
                  Subscribe Now
                  {/* <span className="text-lg">↗</span> */}
               </Link>
            </div>

            <div className="mt-20 flex flex-col items-center justify-center text-sm font-medium text-slate-700">
               <p>© 2026 Golf Charity Subscription Platform - Built by Digital Heroes</p>
            </div>
         </section>

      </div>
   );
}
