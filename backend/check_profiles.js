require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function check() {
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  if (error) console.error('Error fetching from profiles. Does it exist?', error);
  else console.log('Profiles table exists.');
}
check();
