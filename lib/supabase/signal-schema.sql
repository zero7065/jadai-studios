-- =============================================================================
-- JADAI SIGNAL COMPLETE DATABASE SCHEMA
-- Vector extension + RLS policies + 6 core tables
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  source_url TEXT NOT NULL,
  author TEXT NOT NULL,
  author_handle TEXT,
  content TEXT NOT NULL,
  intent_score INT CHECK (intent_score >= 0 AND intent_score <= 100),
  status TEXT DEFAULT 'new' 
    CHECK (status IN ('new','contacted','replied','converted','ignored')),
  embedding vector(768),
  reason TEXT,
  suggested_angle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_user_status ON signals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_signals_intent ON signals(intent_score DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at DESC);

CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT,
  source_ref TEXT,
  status TEXT DEFAULT 'draft' 
    CHECK (status IN ('draft','approved','posted')),
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outreach_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  message TEXT NOT NULL,
  approach TEXT,
  status TEXT DEFAULT 'draft' 
    CHECK (status IN ('draft','approved','sent','replied','converted')),
  sent_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signal_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signal_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  provider_user_id TEXT,
  provider_username TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE TABLE IF NOT EXISTS signal_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  plan TEXT DEFAULT 'free' 
    CHECK (plan IN ('free','pro','business','agency')),
  signals_used_today INT DEFAULT 0,
  signals_used_this_month INT DEFAULT 0,
  daily_limit INT DEFAULT 10,
  monthly_limit INT DEFAULT 100,
  platforms_watched TEXT[] DEFAULT ARRAY['hackernews','github','reddit'],
  keywords TEXT[] DEFAULT '{}',
  excluded_keywords TEXT[] DEFAULT '{}',
  auto_draft_outreach BOOLEAN DEFAULT true,
  auto_draft_content BOOLEAN DEFAULT true,
  notification_email BOOLEAN DEFAULT true,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS short_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signal Trackers for persistent lead and repo monitoring
CREATE TABLE IF NOT EXISTS signal_trackers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('github', 'reddit', 'x')),
  query TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signal_trackers_user_active ON signal_trackers(user_id, active);
CREATE INDEX IF NOT EXISTS idx_signal_trackers_source ON signal_trackers(source);

ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_trackers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_signals') THEN
    CREATE POLICY "own_signals" ON signals FOR ALL USING (user_id = auth.uid() OR is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_trackers') THEN
    CREATE POLICY "own_trackers" ON signal_trackers FOR ALL USING (user_id = auth.uid() OR is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_content') THEN
    CREATE POLICY "own_content" ON generated_content FOR ALL USING (user_id = auth.uid() OR is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_outreach') THEN
    CREATE POLICY "own_outreach" ON outreach_drafts FOR ALL USING (user_id = auth.uid() OR is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_analytics') THEN
    CREATE POLICY "own_analytics" ON signal_analytics FOR ALL USING (user_id = auth.uid() OR is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_integrations') THEN
    CREATE POLICY "own_integrations" ON signal_integrations FOR ALL USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_settings') THEN
    CREATE POLICY "own_settings" ON signal_settings FOR ALL USING (user_id = auth.uid() OR is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_short_links') THEN
    CREATE POLICY "public_short_links" ON short_links FOR SELECT USING (true);
  END IF;
END $$;
