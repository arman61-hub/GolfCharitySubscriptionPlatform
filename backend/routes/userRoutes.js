const express = require('express');
const { requireAuth, requireAdmin, supabase } = require('../middleware/auth');
const router = express.Router();

// Get user statistics (Admin Only) - bypasses RLS
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    res.json({ totalUsers: count || 0 });
  } catch (err) {
    console.error('Fetch stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all profiles (Admin Only)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user profile (Admin Only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { role, subscription_status } = req.body;
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, subscription_status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
