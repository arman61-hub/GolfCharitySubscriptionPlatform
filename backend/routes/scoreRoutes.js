const express = require('express');
const { requireAuth, requireActiveSubscription, supabase } = require('../middleware/auth');
const router = express.Router();

// Get user scores
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', req.user.id)
    .order('date_played', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add new score
router.post('/', requireAuth, requireActiveSubscription, async (req, res) => {
  const { score_value, date_played } = req.body;
  
  if (score_value < 1 || score_value > 45) {
    return res.status(400).json({ error: 'Score must be between 1 and 45' });
  }

  // The database trigger `enforce_five_scores_limit` handles keeping only 5 rolling scores.
  const { data, error } = await supabase
    .from('scores')
    .insert([{ 
      user_id: req.user.id, 
      score_value, 
      date_played 
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;
