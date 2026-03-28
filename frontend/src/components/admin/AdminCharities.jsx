import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Heart, Edit2, Trash2, Plus, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [charityToDelete, setCharityToDelete] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', image_url: '' });

  const fetchCharities = async () => {
    const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false });
    if(data) setCharities(data);
  };
  
  useEffect(() => { fetchCharities(); }, []);

  const openAddModal = () => {
    setEditingCharity(null);
    setFormData({ name: '', description: '', image_url: '' });
    setIsFormModalOpen(true);
  };

  const openEditModal = (charity) => {
    setEditingCharity(charity);
    setFormData({ name: charity.name, description: charity.description, image_url: charity.image_url || '' });
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (charity) => {
    setCharityToDelete(charity);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setEditingCharity(null);
    setCharityToDelete(null);
  };

  const handleSaveCharity = async (e) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (editingCharity) {
      await fetch(`${import.meta.env.VITE_API_URL}/api/charities/${editingCharity.id}`, {
        method: 'PUT',
        headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });
    } else {
      await fetch(`${import.meta.env.VITE_API_URL}/api/charities`, {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });
    }
    
    closeModals();
    fetchCharities();
  };

  const handleDelete = async () => {
    if (!charityToDelete) return;
    const { data: { session } } = await supabase.auth.getSession();
    
    await fetch(`${import.meta.env.VITE_API_URL}/api/charities/${charityToDelete.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    
    closeModals();
    fetchCharities();
  };

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Charities</h2>
          <p className="text-slate-400 text-sm font-light">Manage charity listings and spotlight features.</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Charity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6 relative z-10">
        {charities.map(charity => (
          <motion.div 
            whileHover={{ y: -4 }}
            key={charity.id} 
            className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl flex flex-col hover:border-slate-700 transition-colors group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner shrink-0 relative">
                 {charity.image_url ? (
                   <img src={charity.image_url} alt="" className="object-cover w-full h-full opacity-90" />
                 ) : (
                   <>
                     <div className="absolute inset-0 bg-red-500/10 blur-[10px]"></div>
                     <Heart className="text-red-400 w-5 h-5 relative z-10 fill-red-400/20" />
                   </>
                 )}
              </div>
              <div>
                 <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">{charity.name}</h3>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm font-light flex-1 mb-6 line-clamp-3 leading-relaxed">
              {charity.description}
            </p>
            
            <div className="flex items-center gap-3 w-full mt-auto">
               <button 
                 onClick={() => openEditModal(charity)}
                 className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 px-3 py-2 rounded-xl font-bold text-sm transition-all shadow-[0_0_10px_rgba(59,130,246,0.05)]"
               >
                 <Edit2 className="w-4 h-4" /> Edit
               </button>
               <button 
                 onClick={() => openDeleteModal(charity)}
                 className="flex-1 flex items-center justify-center gap-2 bg-rose-500/5 text-rose-400 border border-rose-500/10 hover:bg-rose-500/10 hover:border-rose-500/20 px-3 py-2 rounded-xl font-bold text-sm transition-all shadow-[0_0_10px_rgba(244,63,94,0.05)]"
               >
                 <Trash2 className="w-4 h-4" /> Delete
               </button>
            </div>
          </motion.div>
        ))}
        {charities.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 font-light border-2 border-dashed border-slate-800 rounded-2xl">
             No charities added yet. Click 'Add Charity' to begin.
          </div>
        )}
      </div>

      {/* Form Modal (Add/Edit) */}
      <AnimatePresence>
        {isFormModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-800/50 bg-slate-900/50">
                <h3 className="text-xl font-bold text-white">
                  {editingCharity ? 'Edit Charity' : 'Add New Charity'}
                </h3>
                <button onClick={closeModals} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveCharity} className="p-6 space-y-5">
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Name</label>
                   <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border border-slate-700 bg-slate-950 text-white shadow-inner focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-3 px-4 placeholder-slate-600 outline-none transition-colors" placeholder="Charity Name" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Description</label>
                   <textarea required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full rounded-xl border border-slate-700 bg-slate-950 text-white shadow-inner focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-3 px-4 placeholder-slate-600 outline-none transition-colors" placeholder="Brief description of the charity's mission..." rows="4" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Image URL (Optional)</label>
                   <input type="url" value={formData.image_url} onChange={e=>setFormData({...formData, image_url: e.target.value})} className="w-full rounded-xl border border-slate-700 bg-slate-950 text-white shadow-inner focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-3 px-4 placeholder-slate-600 outline-none transition-colors" placeholder="https://example.com/logo.png" />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-emerald-500 text-slate-950 px-6 py-3.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-all">
                    {editingCharity ? 'Save Changes' : 'Create Charity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 text-center"
            >
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Delete Charity?</h3>
              <p className="text-slate-400 mb-8 font-light">
                Are you sure you want to delete <span className="font-bold text-slate-200">{charityToDelete?.name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={closeModals} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete} 
                  className="flex-1 bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
