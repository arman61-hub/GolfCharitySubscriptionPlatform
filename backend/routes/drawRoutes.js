const express = require('express');
const { requireAuth, requireAdmin, supabase } = require('../middleware/auth');
const router = express.Router();

const generateRandomDraw = () => {
  const nums = new Set();
  while(nums.size < 5) {
     nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(nums).sort((a,b) => a - b);
};

router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');
      
    const activeSubscribers = count || 0;
    const currentPool = activeSubscribers * 1.0;
    
    const { data: previousDraw } = await supabase
      .from('draws')
      .select('jackpot_rollover')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    const rollover = previousDraw ? parseFloat(previousDraw.jackpot_rollover) : 0;
    
    res.json({
      activeSubscribers,
      currentPool,
      rollover,
      totalPrizePool: currentPool + rollover
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/execute', requireAuth, requireAdmin, async (req, res) => {
  const { month, isSimulation, logicType } = req.body;

  try {
    if(!isSimulation) {
      const { data: existing } = await supabase.from('draws').select('id').eq('month', month).single();
      if(existing) return res.status(400).json({ error: `Draw for ${month} already published!` });
    }
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');
      
    const activeSubscribersCount = count || 0;
    const currentPool = activeSubscribersCount * 1.0;
    
    const { data: previousDraw } = await supabase
      .from('draws')
      .select('jackpot_rollover')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    const rollover = previousDraw ? parseFloat(previousDraw.jackpot_rollover) : 0;
    const totalPrizePool = currentPool + rollover;

    let winningNumbers;
    if (logicType === 'manual' && req.body.manualNumbers && req.body.manualNumbers.length === 5) {
      winningNumbers = req.body.manualNumbers.map(n => parseInt(n)).sort((a,b) => a - b);
    } else if (logicType === 'logic') {
      // Logic mode: pseudorandom based on current timestamp for variation, or just random
      winningNumbers = generateRandomDraw();
    } else {
      winningNumbers = generateRandomDraw();
    }

    const { data: activeUsers } = await supabase.from('profiles').select('id, email').eq('subscription_status', 'active');
    
    let match5 = [];
    let match4 = [];
    let match3 = [];

    for (const u of (activeUsers || [])) {
       const { data: scores } = await supabase.from('scores').select('score_value').eq('user_id', u.id).order('date_played', { ascending: false }).limit(5);
       const userScoreVals = (scores || []).map(s => s.score_value);
       
       let matches = 0;
       winningNumbers.forEach(wn => {
          if (userScoreVals.includes(wn)) matches++;
       });

       if (matches === 5) match5.push(u.id);
       if (matches === 4) match4.push(u.id);
       if (matches === 3) match3.push(u.id);
    }

    const pool5 = totalPrizePool * 0.40;
    const pool4 = totalPrizePool * 0.35;
    const pool3 = totalPrizePool * 0.25;

    const prize5 = match5.length > 0 ? (pool5 / match5.length) : 0;
    const prize4 = match4.length > 0 ? (pool4 / match4.length) : 0;
    const prize3 = match3.length > 0 ? (pool3 / match3.length) : 0;
    
    const newRollover = match5.length === 0 ? pool5 : 0; 

    const drawResult = {
      month,
      isSimulation,
      winningNumbers,
      totalPrizePool,
      activeSubscribersCount,
      prizeDistribution: {
        match5: { count: match5.length, totalPool: pool5, prizePerWinner: prize5 },
        match4: { count: match4.length, totalPool: pool4, prizePerWinner: prize4 },
        match3: { count: match3.length, totalPool: pool3, prizePerWinner: prize3 },
      },
      newRollover
    };

    if (isSimulation) {
      return res.json(drawResult);
    } else {
      const { data: insertedDraw, error: drawErr } = await supabase.from('draws').insert([{
         month, 
         status: 'published',
         winning_numbers: winningNumbers,
         total_prize_pool: totalPrizePool,
         jackpot_rollover: newRollover,
         logic_type: logicType
      }]).select().single();

      if (drawErr) throw drawErr;

      const insertWinners = async (userIds, tier, prize) => {
         for (const uid of userIds) {
           await supabase.from('winners').insert([{
             draw_id: insertedDraw.id,
             user_id: uid,
             match_tier: tier,
             prize_amount: prize
           }]);
         }
      };

      if(match5.length > 0) await insertWinners(match5, 5, prize5);
      if(match4.length > 0) await insertWinners(match4, 4, prize4);
      if(match3.length > 0) await insertWinners(match3, 3, prize3);

      return res.status(201).json({ ...drawResult, db_draw: insertedDraw });
    }

  } catch (error) {
    console.error('Execute draw error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('draws').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
