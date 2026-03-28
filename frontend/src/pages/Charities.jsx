import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharities() {
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (!error && data) {
        setCharities(data);
      }
      setLoading(false);
    }
    fetchCharities();
  }, []);

  const filtered = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.description ? c.description.toLowerCase().includes(search.toLowerCase()) : false));

  return (
    <div className="bg-slate-950 min-h-screen py-24 flex-1 relative overflow-hidden">
      <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">Our Charity Partners</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">Discover the amazing organizations your subscription supports. Select your favorite to direct your contributions.</p>
        </div>

        <div className="max-w-xl mx-auto mb-16 relative">
           <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
           <input 
             type="text" 
             placeholder="Search charities..." 
             className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur-md text-white shadow-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder-slate-500 transition"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((charity, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={charity.id} 
                className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col hover:border-emerald-500/30 transition-colors group"
              >
                <div className="h-48 bg-slate-800/50 flex items-center justify-center relative overflow-hidden border-b border-slate-800">
                  {charity.image_url ? (
                    <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <Heart className="h-16 w-16 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{charity.name}</h3>
                  <p className="text-slate-400 text-sm flex-1 mb-6 line-clamp-3 font-light leading-relaxed">{charity.description}</p>
                  
                  {charity.website_url && (
                    <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                      Visit Website <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && <div className="col-span-full py-20 text-center text-slate-500 font-light">No charities found matching your search.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
