const express = require('express');
const { requireAuth, requireAdmin, supabase } = require('../middleware/auth');
const router = express.Router();

router.get('/my-winnings', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('winners')
    .select(`
      *,
      draws (month, winning_numbers, total_prize_pool)
    `)
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/:id/proof', requireAuth, async (req, res) => {
  const { proof_url } = req.body;
  
  const { data: winner } = await supabase.from('winners').select('user_id').eq('id', req.params.id).single();
  if (!winner || winner.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('winners')
    .update({ proof_url, verification_status: 'pending' })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/pending', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('winners')
    .select(`
      *,
      profiles (email),
      draws (month, winning_numbers)
    `)
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/:id/verify', requireAdmin, async (req, res) => {
  const { status } = req.body; 
  
  const { data, error } = await supabase
    .from('winners')
    .update({ verification_status: status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
