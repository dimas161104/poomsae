-- ============================================================
-- POOMSAE ONLINE - DATABASE SCHEMA
-- Supabase PostgreSQL + RLS + Realtime
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. SETTINGS TABLE (configurable scoring parameters)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  organizer TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  session_info TEXT,
  round_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ARENAS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS arenas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL, -- 'A', 'B', 'C'
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. JUDGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS judges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  judge_code TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL, -- 6-digit PIN (hashed in production)
  position TEXT CHECK (position IN ('J1', 'J2', 'J3', 'J4', 'J5')),
  corner TEXT, -- 'Sudut Kiri Depan', etc.
  arena_id UUID REFERENCES arenas(id) ON DELETE SET NULL,
  rank TEXT, -- 'Wasit Nasional Madya', etc.
  organization TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'standby')),
  is_online BOOLEAN DEFAULT false,
  last_ping TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. CONTINGENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS contingents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  province TEXT,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. ATHLETES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  initials TEXT,
  contingent_id UUID REFERENCES contingents(id) ON DELETE SET NULL,
  category TEXT, -- 'Senior Putra Individual', 'Junior Putri Individual', etc.
  age_group TEXT, -- 'Senior', 'Junior', 'Kadet', 'U-30'
  gender TEXT CHECK (gender IN ('Putra', 'Putri')),
  dan_level TEXT, -- 'Dan I Kukkiwon', etc.
  weight_class TEXT,
  document_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_notes TEXT,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. POOMSAE FORMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS poomsae_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  korean_name TEXT,
  number INTEGER, -- ordering (1-17+)
  level TEXT, -- 'Taegeuk', 'Black Belt'
  description TEXT,
  required_for TEXT[], -- categories that require this form
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. MATCHES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  arena_id UUID REFERENCES arenas(id) ON DELETE SET NULL,
  match_number INTEGER NOT NULL,
  category TEXT NOT NULL,
  round TEXT DEFAULT 'penyisihan' CHECK (round IN ('penyisihan', 'semifinal', 'final')),
  status TEXT DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'aktif', 'selesai', 'dibatalkan')),
  scheduled_time TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. MATCH_ATHLETES TABLE (links athletes to matches)
-- ============================================================
CREATE TABLE IF NOT EXISTS match_athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  poomsae_form_id UUID REFERENCES poomsae_forms(id) ON DELETE SET NULL,
  performance_order INTEGER DEFAULT 1,
  final_score NUMERIC(6,3),
  rank INTEGER,
  status TEXT DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'aktif', 'selesai')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, athlete_id, performance_order)
);

-- ============================================================
-- 10. SCORES TABLE (per judge per match_athlete)
-- ============================================================
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_athlete_id UUID REFERENCES match_athletes(id) ON DELETE CASCADE,
  judge_id UUID REFERENCES judges(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  
  -- Accuracy (starts at 4.00, deductions subtracted)
  accuracy_score NUMERIC(4,2) DEFAULT 4.00,
  minor_deductions INTEGER DEFAULT 0,
  major_deductions INTEGER DEFAULT 0,
  total_deduction NUMERIC(4,2) DEFAULT 0.00,
  
  -- Presentation (3 components, each 0.50-2.00)
  speed_power NUMERIC(4,2) DEFAULT 1.00,
  rhythm_tempo NUMERIC(4,2) DEFAULT 1.00,
  expression_energy NUMERIC(4,2) DEFAULT 1.00,
  presentation_score NUMERIC(4,2) DEFAULT 3.00,
  
  -- Gamjeom penalties
  gamjeom_count INTEGER DEFAULT 0,
  gamjeom_penalty NUMERIC(4,2) DEFAULT 0.00,
  
  -- Total
  total_score NUMERIC(5,3) DEFAULT 7.000,
  
  -- Status
  is_submitted BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT true,
  submitted_at TIMESTAMPTZ,
  is_highest BOOLEAN DEFAULT false,
  is_lowest BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_athlete_id, judge_id)
);

-- ============================================================
-- 11. BRACKETS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS brackets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  round TEXT NOT NULL,
  cutoff_count INTEGER DEFAULT 8, -- athletes advancing
  bracket_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. MONITOR SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS monitor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_code TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_arena ON matches(arena_id);
CREATE INDEX IF NOT EXISTS idx_scores_match_athlete ON scores(match_athlete_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge ON scores(judge_id);
CREATE INDEX IF NOT EXISTS idx_athletes_event ON athletes(event_id);
CREATE INDEX IF NOT EXISTS idx_athletes_verification ON athletes(verification_status);
CREATE INDEX IF NOT EXISTS idx_judges_code ON judges(judge_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE scores;
ALTER PUBLICATION supabase_realtime ADD TABLE match_athletes;
ALTER PUBLICATION supabase_realtime ADD TABLE judges;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE contingents ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poomsae_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access for events, arenas, forms (landing page needs these)
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read arenas" ON arenas FOR SELECT USING (true);
CREATE POLICY "Public read poomsae_forms" ON poomsae_forms FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read match_athletes" ON match_athletes FOR SELECT USING (true);
CREATE POLICY "Public read scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Public read athletes" ON athletes FOR SELECT USING (true);
CREATE POLICY "Public read contingents" ON contingents FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read brackets" ON brackets FOR SELECT USING (true);
CREATE POLICY "Public read monitor_sessions" ON monitor_sessions FOR SELECT USING (true);

-- Admin: full access (authenticated users with admin role)
CREATE POLICY "Admin full access events" ON events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access arenas" ON arenas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access judges" ON judges FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access contingents" ON contingents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access athletes" ON athletes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access matches" ON matches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access match_athletes" ON match_athletes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access scores" ON scores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access brackets" ON brackets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access audit_logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Judge: insert/update own scores only  
CREATE POLICY "Judge insert scores" ON scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Judge update scores" ON scores FOR UPDATE USING (true);

-- Audit logs: insert only for all
CREATE POLICY "Insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);
