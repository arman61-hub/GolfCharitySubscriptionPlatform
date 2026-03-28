const express = require('express');
const { requireAuth, requireAdmin, supabase } = require('../middleware/auth');
const router = express.Router();

// Get all charities
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Admin ONLY: Add new charity
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, description, image_url, website_url } = req.body;
  const { data, error } = await supabase
    .from('charities')
    .insert([{ name, description, image_url, website_url }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Admin ONLY: Update charity
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, description, image_url, website_url, is_active } = req.body;
  const { data, error } = await supabase
    .from('charities')
    .update({ name, description, image_url, website_url, is_active })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Admin ONLY: Delete charity
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from('charities')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Charity deleted successfully' });
});

module.exports = router;
