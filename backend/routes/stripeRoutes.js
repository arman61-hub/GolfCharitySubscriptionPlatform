const express = require('express');
const Stripe = require('stripe');
const { supabase } = require('../middleware/auth');
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PRICING = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
};

router.post('/create-checkout-session', async (req, res) => {
  const { planType, userId } = req.body;
  if (!userId) return res.status(401).json({ error: 'User ID is required' });
  if (!PRICING[planType]) return res.status(400).json({ error: 'Missing price ID in environment variables' });

  try {
     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
     const session = await stripe.checkout.sessions.create({
       payment_method_types: ['card'],
       line_items: [
         {
           price: PRICING[planType],
           quantity: 1,
         },
       ],
       mode: 'subscription',
       success_url: `${frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: `${frontendUrl}/dashboard?canceled=true`,
       client_reference_id: userId,
     });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/verify-session', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(`[verify-session] status: ${session.status}, payment_status: ${session.payment_status}, userId: ${session.client_reference_id}`);
    
    if (session.payment_status === 'paid' || session.status === 'complete') {
      const userId = session.client_reference_id;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      if (userId) {
        const { error: dbError } = await supabase.from('profiles').upsert({
          id: userId,
          role: 'subscriber',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active'
        }, { onConflict: 'id' });
        
        if (dbError) {
           console.error('[verify-session] Supabase Upsert Error:', dbError);
        } else {
           console.log('[verify-session] Successfully upserted Supabase profile.');
        }
        
        return res.json({ success: true, status: 'active' });
      }
    }
    res.json({ success: false, status: session.status, payment_status: session.payment_status });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Notice we use express.raw({type: 'application/json'}) in index.js for this specific route!
// So req.body is a Buffer here.
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      
      if (userId) {
         await supabase.from('profiles').update({
           stripe_customer_id: customerId,
           stripe_subscription_id: subscriptionId,
           subscription_status: 'active'
         }).eq('id', userId);
      }
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const status = subscription.status; // e.g. active, past_due, canceled
      const customerId = subscription.customer;
      
      await supabase.from('profiles').update({
        subscription_status: status === 'active' || status === 'trialing' ? 'active' : status
      }).eq('stripe_customer_id', customerId);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      
      await supabase.from('profiles').update({
        subscription_status: 'canceled'
      }).eq('stripe_customer_id', customerId);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
});

module.exports = router;
