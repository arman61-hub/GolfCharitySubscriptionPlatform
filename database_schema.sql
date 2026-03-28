-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Charities Table
create table charities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  website_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users extension table (links to Supabase auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  first_name text,
  last_name text,
  role text default 'subscriber' check (role in ('admin', 'subscriber')),
  charity_id uuid references charities(id) on delete set null,
  charity_contribution_percentage decimal default 10.0,
  subscription_status text default 'inactive' check (subscription_status in ('active', 'inactive', 'past_due', 'canceled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Scores Table
create table scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  score_value integer check (score_value >= 1 and score_value <= 45) not null,
  date_played date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to ensure only 5 most recent scores are kept per user
CREATE OR REPLACE FUNCTION keep_latest_five_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete older scores beyond the 5th most recent
  DELETE FROM scores
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id 
      FROM scores 
      WHERE user_id = NEW.user_id 
      ORDER BY date_played DESC, created_at DESC 
      LIMIT 5
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the function after every insert
CREATE TRIGGER enforce_five_scores_limit
AFTER INSERT ON scores
FOR EACH ROW
EXECUTE FUNCTION keep_latest_five_scores();

-- Draws Table
create table draws (
  id uuid default uuid_generate_v4() primary key,
  month text not null, -- e.g. 'March 2026'
  status text default 'pending' check (status in ('pending', 'simulated', 'published')),
  winning_numbers integer[] default '{}',
  total_prize_pool decimal default 0,
  jackpot_rollover decimal default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Winners Table
create table winners (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references draws(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  match_tier integer check (match_tier in (3, 4, 5)) not null,
  prize_amount decimal not null,
  proof_url text,
  verification_status text default 'pending_proof' check (verification_status in ('pending_proof', 'pending_review', 'verified', 'rejected')),
  payout_status text default 'pending' check (payout_status in ('pending', 'paid')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) policies
-- Profiles: Users can read their own profile. Admins can read all.
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Scores: Users can read and insert their own scores.
alter table scores enable row level security;
create policy "Users can view own scores" on scores for select using (auth.uid() = user_id);
create policy "Users can insert own scores" on scores for insert with check (auth.uid() = user_id);
create policy "Users can update own scores" on scores for update using (auth.uid() = user_id);
create policy "Users can delete own scores" on scores for delete using (auth.uid() = user_id);

-- Charities: Everyone can view active charities.
alter table charities enable row level security;
create policy "Public view active charities" on charities for select using (is_active = true);

-- Draws: Everyone can view published draws.
alter table draws enable row level security;
create policy "Public can view published draws" on draws for select using (status = 'published');

-- Winners: Public can view verified winners, users can view own wins.
alter table winners enable row level security;
create policy "Public view verified winners" on winners for select using (verification_status = 'verified');
create policy "Users view own winnings" on winners for select using (auth.uid() = user_id);
create policy "Users update own proof" on winners for update using (auth.uid() = user_id);
