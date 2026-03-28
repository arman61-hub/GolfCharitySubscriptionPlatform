import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Edit2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ role: '', subscription_status: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if(!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({ role: user.role || 'user', subscription_status: user.subscription_status || 'inactive' });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if(!editingUser) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(editFormData)
      });
      if(!res.ok) throw new Error('Failed to update user');
      
      setIsEditModalOpen(false);
      fetchUsers();
    } catch(err) {
      toast.error(err.message);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Users</h2>
          <p className="text-slate-400 text-sm font-light">Manage all registered users</p>
        </div>
        <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(59,130,246,0.1)]">
          {users.length} users
        </div>
      </div>

      <div className="relative max-w-md group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600 text-sm"
        />
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl mt-6 relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-500" />
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const displayName = (user.first_name || user.last_name) 
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
                    : 'Unknown User';
                  const initial = displayName !== 'Unknown User' ? displayName.charAt(0).toUpperCase() : '?';
                  const isEven = idx % 2 === 0;
                  
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={user.id} 
                      className={`${isEven ? 'bg-transparent' : 'bg-slate-900/30'} hover:bg-slate-800/50 transition-colors group`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-inner shrink-0 ${
                            user.role === 'admin' 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          }`}>
                            {initial}
                          </div>
                          <span className="font-bold text-white whitespace-nowrap">{displayName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 text-sm">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          user.role === 'admin' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          user.subscription_status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                        }`}>
                          {user.subscription_status || 'inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-indigo-500 hover:text-white transition-colors border border-slate-700 hover:border-indigo-400 focus:outline-none"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-800/50 bg-slate-900/50">
                <h3 className="text-xl font-bold text-white">Edit User</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div className="mb-4">
                  <p className="text-slate-400 text-sm">Editing: <strong className="text-white">{editingUser?.email}</strong></p>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Role</label>
                   <select 
                     value={editFormData.role} 
                     onChange={e=>setEditFormData({...editFormData, role: e.target.value})} 
                     className="w-full rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-3 px-4 outline-none transition-colors"
                   >
                     <option value="user">User</option>
                     <option value="admin">Admin</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Subscription</label>
                   <select 
                     value={editFormData.subscription_status} 
                     onChange={e=>setEditFormData({...editFormData, subscription_status: e.target.value})} 
                     className="w-full rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-3 px-4 outline-none transition-colors"
                   >
                     <option value="active">Active</option>
                     <option value="inactive">Inactive</option>
                     <option value="past_due">Past Due</option>
                     <option value="canceled">Canceled</option>
                   </select>
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
