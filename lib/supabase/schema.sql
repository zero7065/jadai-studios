-- =============================================================================
-- JADAI STUDIOS DATABASE SCHEMA (PostgreSQL / Supabase)
-- Version: 1.0 (Platform Master Specification v1.1)
-- Founder: Jehu Nanpan (Jadai / Hudson) | Jos, Nigeria | Tagline: BUILD DIFFERENT
-- =============================================================================

BEGIN;

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- UPDATED_AT TRIGGER FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. USER PROFILES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    email TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'hub_member', 'prime_subscriber')),
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'foundation', 'voice', 'architecture', 'prime')),
    subscription_status TEXT DEFAULT 'inactive',
    paystack_customer_code TEXT,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    prime_memory JSONB DEFAULT '{}'::jsonb,
    prime_persona TEXT DEFAULT 'standard',
    prime_questions_answered JSONB DEFAULT '[]'::jsonb,
    notification_prefs JSONB DEFAULT '{"email": true, "push": true, "riddles": true}'::jsonb,
    country_code TEXT DEFAULT 'NG',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- HELPER FUNCTIONS FOR RLS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_country()
RETURNS TEXT AS $$
DECLARE
    c_code TEXT;
BEGIN
    SELECT country_code INTO c_code FROM user_profiles WHERE id = auth.uid();
    RETURN COALESCE(c_code, 'NG');
END;
$$ LANGUAGE plpgsql STABLE;

-- -----------------------------------------------------------------------------
-- 2. MODULES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'beta', 'coming_soon', 'disabled')),
    required_tier TEXT NOT NULL DEFAULT 'free' CHECK (required_tier IN ('free', 'foundation', 'voice', 'architecture', 'prime')),
    config JSONB DEFAULT '{}'::jsonb,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. MODULE USAGE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS module_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    module_slug TEXT NOT NULL,
    input JSONB DEFAULT '{}'::jsonb,
    output JSONB DEFAULT '{}'::jsonb,
    ai_provider TEXT,
    tokens_used INT DEFAULT 0,
    duration_ms INT DEFAULT 0,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. SUBSCRIPTIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    paystack_subscription_code TEXT UNIQUE,
    paystack_plan_code TEXT,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'foundation', 'voice', 'architecture', 'prime')),
    status TEXT NOT NULL DEFAULT 'active',
    amount INT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    interval TEXT NOT NULL DEFAULT 'monthly',
    next_payment_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- -----------------------------------------------------------------------------
-- 5. CONTENT BANK
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('wisdom', 'riddle', 'book_of_lies', 'motivation', 'philosophy', 'lesson', 'puzzle', 'story', 'video_link')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    answer TEXT,
    difficulty TEXT DEFAULT 'medium',
    act INT DEFAULT 1,
    sin_category TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    media_url TEXT,
    published BOOLEAN DEFAULT FALSE,
    publish_at TIMESTAMPTZ,
    sort_order INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 6. CONTENT DELIVERY
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_delivery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content_bank(id) ON DELETE CASCADE,
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    opened BOOLEAN DEFAULT FALSE,
    liked BOOLEAN DEFAULT FALSE,
    answered TEXT,
    answer_correct BOOLEAN,
    feedback TEXT
);

-- -----------------------------------------------------------------------------
-- 7. BOOK OF LIES ENTRIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_of_lies_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_number INT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT,
    act INT NOT NULL DEFAULT 1,
    sin_category TEXT,
    full_text TEXT NOT NULL,
    teaser TEXT,
    cover_image_url TEXT,
    audio_url TEXT,
    published BOOLEAN DEFAULT FALSE,
    publish_at TIMESTAMPTZ,
    views_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    scheduled_for TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. TEMPLATES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    lore TEXT,
    description TEXT NOT NULL,
    preview_url TEXT,
    demo_url TEXT,
    price_ngn INT DEFAULT 0,
    price_usd FLOAT DEFAULT 0.0,
    stack TEXT[] DEFAULT ARRAY[]::TEXT[],
    category TEXT,
    github_template_url TEXT,
    download_count INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    includes JSONB DEFAULT '[]'::jsonb,
    post_purchase_guide TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. HUB LISTINGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hub_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('service', 'product', 'collab', 'job')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    stack TEXT[] DEFAULT ARRAY[]::TEXT[],
    price_type TEXT DEFAULT 'fixed',
    price INT DEFAULT 0,
    currency TEXT DEFAULT 'NGN',
    portfolio_links TEXT[] DEFAULT ARRAY[]::TEXT[],
    contact_method TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'rejected')),
    views_count INT DEFAULT 0,
    enquiries_count INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. PORTFOLIO ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Live' CHECK (status IN ('Live', 'In Build', 'Concept', 'Prototype', 'Sold', 'Archived')),
    tagline TEXT,
    description TEXT NOT NULL,
    long_description TEXT,
    stack TEXT[] DEFAULT ARRAY[]::TEXT[],
    live_url TEXT,
    github_url TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    video_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. NEWSLETTER
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    source TEXT DEFAULT 'homepage',
    confirmed BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{"updates": true, "releases": true}'::jsonb,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- 12. FEEDBACK
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    source TEXT DEFAULT 'web',
    rating INT CHECK (rating >= 1 AND rating <= 5),
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'module', 'template', 'oracle', 'hub')),
    approved BOOLEAN DEFAULT FALSE,
    featured_as_testimonial BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 13. TESTIMONIALS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    avatar_url TEXT,
    quote TEXT NOT NULL,
    project_reference TEXT,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    display_order INT DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 14. ADMIN AUDIT
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 15. ADMIN SETTINGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON admin_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 16. AI DRAFTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    draft_content TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'discarded')),
    ai_provider TEXT,
    published_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 17. USER MEMORIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_id TEXT,
    memory_type TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    confidence FLOAT DEFAULT 1.0,
    source TEXT DEFAULT 'oracle',
    last_reinforced TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 18. NOTIFICATION QUEUE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    action_url TEXT,
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    read BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 19. LEGAL ACCEPTANCE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_acceptance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    version TEXT NOT NULL,
    ip_address TEXT,
    accepted_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 20. SELF DIAGNOSTICS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS self_diagnostics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_at TIMESTAMPTZ DEFAULT NOW(),
    ok BOOLEAN NOT NULL DEFAULT TRUE,
    summary TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    run_by TEXT DEFAULT 'system'
);

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_modules_slug ON modules(slug);
CREATE INDEX IF NOT EXISTS idx_module_usage_slug ON module_usage(module_slug);
CREATE INDEX IF NOT EXISTS idx_module_usage_user ON module_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_bank_type_pub ON content_bank(type, published);
CREATE INDEX IF NOT EXISTS idx_book_of_lies_episode ON book_of_lies_entries(episode_number);
CREATE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug);
CREATE INDEX IF NOT EXISTS idx_hub_listings_status ON hub_listings(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_status ON portfolio_items(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);
CREATE INDEX IF NOT EXISTS idx_user_memories_user ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_sent ON notification_queue(user_id, sent);
CREATE INDEX IF NOT EXISTS idx_self_diagnostics_run_at ON self_diagnostics(run_at DESC);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_of_lies_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_diagnostics ENABLE ROW LEVEL SECURITY;

-- 1. user_profiles policies
CREATE POLICY user_profiles_select ON user_profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY user_profiles_update ON user_profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

-- 2. modules policies (public read, admin write)
CREATE POLICY modules_read_public ON modules FOR SELECT USING (true);
CREATE POLICY modules_admin_write ON modules FOR ALL USING (is_admin());

-- 3. module_usage policies (user sees own, admin sees all, authenticated insert)
CREATE POLICY module_usage_select ON module_usage FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY module_usage_insert ON module_usage FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin() OR user_id IS NULL);

-- 4. subscriptions policies
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY subscriptions_admin ON subscriptions FOR ALL USING (is_admin());

-- 5. content_bank policies (published public, admin all)
CREATE POLICY content_bank_public ON content_bank FOR SELECT USING (published = true OR is_admin());
CREATE POLICY content_bank_admin ON content_bank FOR ALL USING (is_admin());

-- 6. content_delivery policies
CREATE POLICY content_delivery_user ON content_delivery FOR ALL USING (auth.uid() = user_id OR is_admin());

-- 7. book_of_lies_entries policies
CREATE POLICY book_of_lies_public ON book_of_lies_entries FOR SELECT USING (published = true OR is_admin());
CREATE POLICY book_of_lies_admin ON book_of_lies_entries FOR ALL USING (is_admin());

-- 8. templates policies
CREATE POLICY templates_public ON templates FOR SELECT USING (status = 'active' OR is_admin());
CREATE POLICY templates_admin ON templates FOR ALL USING (is_admin());

-- 9. hub_listings policies
CREATE POLICY hub_listings_public ON hub_listings FOR SELECT USING (status = 'active' OR auth.uid() = user_id OR is_admin());
CREATE POLICY hub_listings_user_write ON hub_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY hub_listings_user_update ON hub_listings FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY hub_listings_admin ON hub_listings FOR ALL USING (is_admin());

-- 10. portfolio_items policies
CREATE POLICY portfolio_public ON portfolio_items FOR SELECT USING (true);
CREATE POLICY portfolio_admin ON portfolio_items FOR ALL USING (is_admin());

-- 11. newsletter policies (anon insert only, admin read/write)
CREATE POLICY newsletter_anon_insert ON newsletter FOR INSERT WITH CHECK (true);
CREATE POLICY newsletter_admin ON newsletter FOR ALL USING (is_admin());

-- 12. feedback policies
CREATE POLICY feedback_insert ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY feedback_select ON feedback FOR SELECT USING (auth.uid() = user_id OR is_admin() OR approved = true);
CREATE POLICY feedback_admin ON feedback FOR ALL USING (is_admin());

-- 13. testimonials policies
CREATE POLICY testimonials_public ON testimonials FOR SELECT USING (visible = true OR is_admin());
CREATE POLICY testimonials_admin ON testimonials FOR ALL USING (is_admin());

-- 14. admin_audit policies
CREATE POLICY admin_audit_admin ON admin_audit FOR ALL USING (is_admin());

-- 15. admin_settings policies
CREATE POLICY admin_settings_admin ON admin_settings FOR ALL USING (is_admin());

-- 16. ai_drafts policies
CREATE POLICY ai_drafts_admin ON ai_drafts FOR ALL USING (is_admin());

-- 17. user_memories policies
CREATE POLICY user_memories_user ON user_memories FOR ALL USING (auth.uid() = user_id OR is_admin());

-- 18. notification_queue policies
CREATE POLICY notification_queue_user ON notification_queue FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY notification_queue_admin ON notification_queue FOR ALL USING (is_admin());

-- 19. legal_acceptance policies
CREATE POLICY legal_acceptance_user ON legal_acceptance FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY legal_acceptance_insert ON legal_acceptance FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 20. self_diagnostics policies
CREATE POLICY self_diagnostics_admin ON self_diagnostics FOR ALL USING (is_admin());

-- -----------------------------------------------------------------------------
-- 21. JADAI SIGNAL ENGINE (SUPPLEMENT A TABLES)
-- -----------------------------------------------------------------------------

-- Table 1: signals
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,        -- 'hackernews' | 'github' | 'reddit' | 'x' | 'threads'
  source_url TEXT NOT NULL,
  author TEXT NOT NULL,
  author_handle TEXT,
  content TEXT NOT NULL,
  intent_score INT CHECK (intent_score >= 0 AND intent_score <= 100),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'replied', 'converted', 'ignored')),
  embedding vector(1536),        -- pgvector for semantic search
  reason TEXT,                   -- LLM explanation of score
  suggested_angle TEXT,          -- how the product could solve this
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_user_status ON signals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_signals_intent ON signals(intent_score DESC);
CREATE INDEX IF NOT EXISTS idx_signals_platform ON signals(platform);

-- Table 2: generated_content
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,        -- 'x' | 'linkedin' | 'reddit' | 'threads'
  content TEXT NOT NULL,
  source_type TEXT,              -- 'commit' | 'deployment' | 'milestone' | 'release'
  source_ref TEXT,               -- commit hash or deployment URL
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'posted')),
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_user ON generated_content(user_id, status);

-- Table 3: outreach_drafts
CREATE TABLE IF NOT EXISTS outreach_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  message TEXT NOT NULL,
  approach TEXT,                 -- 'conversational' | 'helpful' | 'curious'
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'sent', 'replied', 'converted')),
  sent_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_user ON outreach_drafts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_outreach_signal ON outreach_drafts(signal_id);

-- Table 4: signal_analytics
CREATE TABLE IF NOT EXISTS signal_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,      -- 'signal_found', 'message_drafted', 'message_sent', 'reply_received', 'conversion'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_type ON signal_analytics(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON signal_analytics(created_at DESC);

-- Table 5: signal_integrations
CREATE TABLE IF NOT EXISTS signal_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,        -- 'github' | 'vercel' | 'gitlab'
  access_token TEXT NOT NULL,    -- encrypted at application layer
  refresh_token TEXT,            -- encrypted at application layer
  provider_user_id TEXT,
  provider_username TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Table 6: signal_settings
CREATE TABLE IF NOT EXISTS signal_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business', 'agency')),
  signals_used_today INT DEFAULT 0,
  signals_used_this_month INT DEFAULT 0,
  daily_limit INT DEFAULT 10,
  monthly_limit INT DEFAULT 100,
  platforms_watched TEXT[] DEFAULT ARRAY['hackernews', 'github', 'reddit'],
  keywords TEXT[] DEFAULT '{}',
  excluded_keywords TEXT[] DEFAULT '{}',
  auto_draft_outreach BOOLEAN DEFAULT true,
  auto_draft_content BOOLEAN DEFAULT true,
  notification_email BOOLEAN DEFAULT true,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 7: short_links (Sentinel link services)
CREATE TABLE IF NOT EXISTS short_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  clicks INT DEFAULT 0,
  cloaked BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_short_links_slug ON short_links(slug);

-- RLS POLICIES FOR SIGNAL & LINK TABLES
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signals: own only" ON signals
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Signals: admin all" ON signals
  FOR ALL USING (is_admin());

CREATE POLICY "Content: own only" ON generated_content
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Content: admin all" ON generated_content
  FOR ALL USING (is_admin());

CREATE POLICY "Outreach: own only" ON outreach_drafts
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Outreach: admin all" ON outreach_drafts
  FOR ALL USING (is_admin());

CREATE POLICY "Analytics: own only" ON signal_analytics
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Analytics: admin all" ON signal_analytics
  FOR ALL USING (is_admin());

CREATE POLICY "Integrations: own only" ON signal_integrations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Settings: own only" ON signal_settings
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Settings: admin all" ON signal_settings
  FOR ALL USING (is_admin());

CREATE POLICY "Short links: own or anon read" ON short_links
  FOR SELECT USING (true);
CREATE POLICY "Short links: manage own" ON short_links
  FOR ALL USING (user_id = auth.uid() OR is_admin());

-- -----------------------------------------------------------------------------
-- 20. SIGNAL TRACKERS
-- -----------------------------------------------------------------------------
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

ALTER TABLE signal_trackers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signal trackers: manage own" ON signal_trackers
  FOR ALL USING (user_id = auth.uid() OR is_admin());

-- -----------------------------------------------------------------------------
-- SEED DATA: 10 MODULES
-- -----------------------------------------------------------------------------
INSERT INTO modules (slug, name, description, icon, status, required_tier, config, sort_order) VALUES
('forge', 'FORGE Media & Doc Editor', 'Canva-style document & media editor, OCR layout reconstruction, multi-format export, and draft state.', 'FileCode', 'active', 'free', '{"max_upload_mb": 50}', 1),
('oracle', 'PRIME Oracle', 'High-bandwidth AI intelligence advisor trained on architectural strategy, logic, and existential reasoning.', 'Eye', 'active', 'free', '{"max_free_queries": 50}', 2),
('mirage', 'MIRAGE Visual Studio', 'Visual synthesis engine: text-to-image fallback chain, brand kit generator, blueprint sketching, and 3D preview.', 'Sparkles', 'active', 'free', '{}', 3),
('sentinel', 'SENTINEL Diagnostic & Links', 'Lighthouse diagnostics, domain conflict audits, link cloaking, shortener, and QR codes.', 'Activity', 'active', 'free', '{}', 4),
('template-market', 'Elite Template Market', 'Production-grade boilerplates, luxury design systems, and resilient infrastructure starter kits.', 'ShoppingBag', 'active', 'free', '{}', 5),
('hub', 'JadaiHub Collaborative', 'Decentralized talent, freelance missions, peer code reviews, and tactical collaborations.', 'Users', 'active', 'free', '{}', 6),
('book-of-lies', 'The Book of Lies', 'Philosophical fiction, daily wisdom transmissions, and moral puzzles delivered at 9:47 PM.', 'BookOpen', 'active', 'free', '{"daily_hour": 21, "daily_minute": 47}', 7),
('dream-forge', 'Dream Forge', 'Turn concepts and vision documents into actionable architectural blueprints and technical roadmaps.', 'Layers', 'active', 'foundation', '{"steps": 5}', 8)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    required_tier = EXCLUDED.required_tier;

-- -----------------------------------------------------------------------------
-- SEED DATA: ADMIN SETTINGS
-- -----------------------------------------------------------------------------
INSERT INTO admin_settings (key, value, category, description, updated_by) VALUES
('groq_api_key', '[SET_IN_ADMIN_SETTINGS]', 'ai', 'Primary AI provider API key for llama-3.3-70b-versatile', 'system_seed'),
('gemini_api_key', '[SET_IN_ADMIN_SETTINGS]', 'ai', 'Secondary AI fallback API key for Gemini', 'system_seed'),
('paystack_secret_key', 'sk_test_mock_paystack_secret_key', 'payments', 'Paystack secret key for processing subscriptions', 'system_seed'),
('paystack_public_key', 'pk_test_mock_paystack_public_key', 'payments', 'Paystack public key for frontend checkout', 'system_seed'),
('site_status', 'live', 'system', 'Global platform status: live, maintenance, soft_launch', 'system_seed'),
('oracle_daily_limit', '50', 'ai', 'Maximum free Oracle conversations per user per day', 'system_seed'),
('watermark_text', 'JADAI STUDIOS • BUILD DIFFERENT', 'branding', 'Watermark text applied to exported blueprints and documents', 'system_seed'),
('admin_email', 'jadaistudiosoffcl@gmail.com', 'admin', 'Primary admin and founder contact email', 'system_seed'),
('founder_country', 'NG', 'founder', 'Founder headquarters country code (ISO 3166-1 alpha-2)', 'system_seed'),
('founding_year', '2024', 'branding', 'Year Jadai Studios was inaugurated', 'system_seed'),
('default_currency_ngn', 'NGN', 'finance', 'Domestic pricing currency', 'system_seed'),
('default_currency_usd', 'USD', 'finance', 'International pricing currency', 'system_seed'),
('contact_whatsapp', '+2348000000000', 'contact', 'Direct business line for high-ticket consultations', 'system_seed'),
('contact_email', 'jadaistudiosoffcl@gmail.com', 'contact', 'Public facing inquiries address', 'system_seed'),
('contact_twitter', '@hudsonstylez', 'social', 'Founder Twitter / X handle', 'system_seed'),
('contact_instagram', '@jadaistudios', 'social', 'Studio official Instagram handle', 'system_seed'),
('admin_password_hash', '$2a$12$K8wG..placeholder_bcrypt_hash_admin', 'security', 'Hashed administrative password', 'system_seed'),
('signal_free_tier_limit', '10', 'config', 'Daily signals for free tier', 'system_seed'),
('signal_pro_tier_price_ngn', '2500000', 'payment', 'Pro tier price in kobo (₦25,000/mo)', 'system_seed'),
('signal_pro_tier_price_usd', '2900', 'payment', 'Pro tier price in cents ($29/mo)', 'system_seed')
ON CONFLICT (key) DO UPDATE SET 
    description = EXCLUDED.description;

COMMIT;
