import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Heart, Globe, ShieldCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CharitySelector({ selectedId, onSelect }) {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('charities').select('*').eq('is_active', true).order('name');
      if (data) setCharities(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelect = async (id) => {
    if (id === selectedId) return;
    setUpdating(id);
    await onSelect(id);
    setUpdating(null);
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-64 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse shadow-xl"></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Charity Impact</h2>
          <p className="text-slate-500 mt-2 font-medium">Choose your partner organization for this month's contributions.</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/50 px-4 py-2 rounded-xl flex items-center gap-3">
          <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
          <span className="text-sm font-bold text-slate-400">10% of every sub donated</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {charities.map((charity, i) => {
          const isSelected = charity.id === selectedId;
          const isUpdating = updating === charity.id;

          return (
            <motion.div
              key={charity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => !updating && handleSelect(charity.id)}
              className={`relative cursor-pointer group p-6 rounded-2xl border transition-all duration-300 flex flex-col shadow-xl min-h-[280px] ${isSelected
                ? 'bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
            >
              {/* Header: Logo and Title */}
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 relative transition-all duration-300 ${isSelected ? 'bg-white border-emerald-400 ring-4 ring-emerald-500/20' : 'bg-white border-slate-200'
                  }`}>
                  {charity.image_url ? (
                    <img src={charity.image_url} alt="" className="object-contain w-full h-full p-1" />
                  ) : (
                    <Heart className="w-5 h-5 text-slate-400 fill-slate-200" />
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-emerald-500/10 blur-[8px]"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg leading-tight line-clamp-2 transition-colors duration-300 ${isSelected ? 'text-emerald-400' : 'text-white'
                    }`}>
                    {charity.name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm font-light leading-relaxed mb-6 flex-1 line-clamp-4">
                {charity.description}
              </p>

              {/* Status Footer */}
              <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Impact</span>
                </div>
                {isSelected ? (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold">Selected</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-400 transition-colors">Select Charity</span>
                )}
              </div>

              {/* Selection Ripple/Glow Effect */}
              {isSelected && (
                <div className="absolute -bottom-1 -left-1 -right-1 h-0.5 bg-emerald-500 rounded-full opacity-50 blur-[2px]"></div>
              )}

              {isUpdating && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8 flex items-start gap-5 max-w-4xl mx-auto shadow-inner">
        <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Direct Donation Compliance</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Your selection contributes directly to the designated charity's mission. The 10% donation is calculated from your total subscription amount and tracked monthly. You can change your selection once per month before the subscription renewal date.
          </p>
        </div>
      </div>
    </div>
  );
}
