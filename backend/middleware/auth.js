const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Admin for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware to protect routes that require authentication
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Middleware to protect routes that require Admin privileges
const requireAdmin = async (req, res, next) => {
  // Must be called AFTER requireAuth, so req.user exists
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: User not found attached to request.' });
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    
    next();
  } catch (err) {
    console.error('Admin Check Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Middleware to check for active subscription before allowing access to premium features (e.g. draws, scores)
const requireActiveSubscription = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', req.user.id)
      .single();

    if (error || !profile || profile.subscription_status !== 'active') {
      return res.status(403).json({ error: 'Forbidden. Active subscription required to access this feature.' });
    }
    
    next();
  } catch (err) {
    console.error('Subscription Check Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { requireAuth, requireAdmin, requireActiveSubscription, supabase };
