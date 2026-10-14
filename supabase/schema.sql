-- ============================================================
-- POOMSAE ONLINE v2 - RESTRUCTURED DATABASE SCHEMA
-- 4 Roles: Admin, Operator, Wasit/Juri, Media
-- Supports: Poomsae (Prestasi/Pemula) + Speed Kicking
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TOURNAMENT SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS tournament_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Kejuaraan Nasional Taekwondo Poomsae 2025',
  arena_count INTEGER NOT NULL DEFAULT 3,
  arena_format TEXT NOT NULL DEFAULT 'huruf' CHECK (arena_format IN ('angka', 'huruf')),
  judges_per_session INTEGER NOT NULL DEFAULT 3 CHECK (judges_per_session IN (3, 5)),
  has_backup_judge BOOLEAN NOT NULL DEFAULT true,
  forms_count INTEGER NOT NULL DEFAULT 2 CHECK (forms_count IN (1, 2)),
  -- Speed kicking parameters
  speed_kick_body_point NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  speed_kick_head_point NUMERIC(3,1) NOT NULL DEFAULT 3.0,
  speed_kick_spin_head_point NUMERIC(3,1) NOT NULL DEFAULT 4.0,
  -- Scoring parameters
  minor_deduction NUMERIC(3,2) NOT NULL DEFAULT 0.10,
  major_deduction NUMERIC(3,2) NOT NULL DEFAULT 0.30,
  gamjeom_penalty NUMERIC(3,2) NOT NULL DEFAULT 0.30,
  accuracy_base NUMERIC(4,2) NOT NULL DEFAULT 4.00,
  presentation_max NUMERIC(4,2) NOT NULL DEFAULT 6.00,
  presentation_component_min NUMERIC(4,2) NOT NULL DEFAULT 0.50,
  presentation_component_max NUMERIC(4,2) NOT NULL DEFAULT 2.00,
  presentation_step NUMERIC(4,2) NOT NULL DEFAULT 0.05,
  max_total_score NUMERIC(4,2) NOT NULL DEFAULT 10.00,
  -- Cut-off settings
  cutoff_high_low BOOLEAN NOT NULL DEFAULT true,
  tiebreak_method TEXT NOT NULL DEFAULT 'presentation',
  -- Event info
  location TEXT DEFAULT 'GOR Cakrawala Ciracas, Jakarta Timur',
  start_date DATE DEFAULT '2025-10-18',
  end_date DATE DEFAULT '2025-10-20',
  organizer TEXT DEFAULT 'Federasi Taekwondo Indonesia (PBTI)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. USERS (Master User with roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID, -- links to supabase auth.users
  name TEXT NOT NULL,
  email TEXT,
  username TEXT UNIQUE,
  pin TEXT, -- for non-admin login
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'juri', 'media')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ARENAS (auto-generated from tournament_settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS arenas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  display_name TEXT NOT NULL, -- 'Lapangan A' or 'Lapangan 1'
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. JUDGES (Master Juri)
-- ============================================================
CREATE TABLE IF NOT EXISTS judges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  judge_code TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL DEFAULT '000000',
  rank TEXT,
  organization TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_online BOOLEAN DEFAULT false,
  last_ping TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. JUDGE ASSIGNMENTS (per session/schedule)
-- ============================================================
CREATE TABLE IF NOT EXISTS judge_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID, -- FK to schedules
  judge_id UUID REFERENCES judges(id) ON DELETE CASCADE,
  arena_id UUID REFERENCES arenas(id) ON DELETE CASCADE,
  position TEXT CHECK (position IN ('J1', 'J2', 'J3', 'J4', 'J5', 'cadangan')),
  is_backup BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true, -- false if replaced by backup
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('prestasi', 'festival', 'speed_kick')),
  level TEXT DEFAULT 'prestasi' CHECK (level IN ('pemula', 'prestasi')),
  participation_type TEXT DEFAULT 'individu' CHECK (participation_type IN ('individu', 'pair')),
  age_group TEXT,
  gender TEXT CHECK (gender IN ('Putra', 'Putri', 'Campuran')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. ATHLETES
-- ============================================================
CREATE TABLE IF NOT EXISTS athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  athlete2_name TEXT, -- 1 Pair = 1 team entry with 2 athlete names
  initials TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'prestasi' CHECK (type IN ('prestasi', 'festival', 'speed_kick')),
  level TEXT NOT NULL DEFAULT 'prestasi' CHECK (level IN ('pemula', 'prestasi')),
  participation_type TEXT NOT NULL DEFAULT 'individu' CHECK (participation_type IN ('individu', 'pair')),
  contingent TEXT,
  province TEXT,
  age_group TEXT,
  gender TEXT CHECK (gender IN ('Putra', 'Putri', 'Campuran')),
  dan_level TEXT,
  youtube_url TEXT,
  verification_status TEXT DEFAULT 'menunggu' CHECK (verification_status IN ('menunggu', 'terverifikasi', 'ditolak')),
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. POOMSAE FORMS
-- ============================================================
CREATE TABLE IF NOT EXISTS poomsae_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  korean_name TEXT,
  number INTEGER,
  level TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. BRACKETS / GROUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS brackets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('eliminasi', 'grup')),
  round TEXT DEFAULT 'penyisihan' CHECK (round IN ('penyisihan', 'final')),
  group_name TEXT, -- for pemula: 'Grup A', 'Grup B', etc.
  group_size INTEGER DEFAULT 3, -- pemula: 3 per group
  cutoff_count INTEGER DEFAULT 8, -- prestasi: top 8 to final
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. BRACKET ATHLETES (athletes in a bracket/group)
-- ============================================================
CREATE TABLE IF NOT EXISTS bracket_athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bracket_id UUID REFERENCES brackets(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  seed_order INTEGER,
  final_score NUMERIC(6,3),
  rank INTEGER,
  advanced BOOLEAN DEFAULT false, -- did they advance to final?
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. SCHEDULES (assigns brackets/groups to date+arena+judges)
-- ============================================================
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bracket_id UUID REFERENCES brackets(id) ON DELETE CASCADE,
  arena_id UUID REFERENCES arenas(id) ON DELETE SET NULL,
  match_date DATE,
  start_time TIME,
  session_name TEXT,
  status TEXT DEFAULT 'dijadwalkan' CHECK (status IN ('dijadwalkan', 'berlangsung', 'selesai')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. MATCHES (individual match/partai within a schedule)
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  bracket_id UUID REFERENCES brackets(id) ON DELETE CASCADE,
  arena_id UUID REFERENCES arenas(id) ON DELETE SET NULL,
  match_number INTEGER NOT NULL,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  poomsae_form_id UUID REFERENCES poomsae_forms(id) ON DELETE SET NULL,
  form_number INTEGER DEFAULT 1, -- 1st or 2nd form (if forms_count=2)
  category TEXT,
  round TEXT DEFAULT 'penyisihan',
  status TEXT DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'aktif', 'selesai', 'dibatalkan')),
  -- Operator controls
  is_current BOOLEAN DEFAULT false, -- operator marks this as current
  operator_notes TEXT,
  -- Computed scores
  final_score NUMERIC(6,3),
  -- For speed kicking
  speed_kick_total_points INTEGER DEFAULT 0,
  speed_kick_score NUMERIC(6,2) DEFAULT 0,
  --
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. SCORES (per judge per match - poomsae)
-- ============================================================
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  judge_id UUID REFERENCES judges(id) ON DELETE CASCADE,
  judge_assignment_id UUID REFERENCES judge_assignments(id) ON DELETE SET NULL,
  -- Accuracy
  accuracy_score NUMERIC(4,2) DEFAULT 4.00,
  minor_deductions INTEGER DEFAULT 0,
  major_deductions INTEGER DEFAULT 0,
  total_deduction NUMERIC(4,2) DEFAULT 0.00,
  -- Presentation (3 components)
  speed_power NUMERIC(4,2) DEFAULT 1.00,
  rhythm_tempo NUMERIC(4,2) DEFAULT 1.00,
  expression_energy NUMERIC(4,2) DEFAULT 1.00,
  presentation_score NUMERIC(4,2) DEFAULT 3.00,
  -- Gamjeom
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
  is_counted BOOLEAN DEFAULT true, -- false if cut-off
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, judge_id)
);

-- ============================================================
-- 14. SPEED KICK SCORES (per judge per match - speed kicking)
-- ============================================================
CREATE TABLE IF NOT EXISTS speed_kick_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  judge_id UUID REFERENCES judges(id) ON DELETE CASCADE,
  body_kicks INTEGER DEFAULT 0,
  head_kicks INTEGER DEFAULT 0,
  spin_head_kicks INTEGER DEFAULT 0,
  total_points NUMERIC(6,2) DEFAULT 0,
  is_submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, judge_id)
);

-- ============================================================
-- 15. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_arena ON matches(arena_id);
CREATE INDEX IF NOT EXISTS idx_matches_current ON matches(is_current);
CREATE INDEX IF NOT EXISTS idx_scores_match ON scores(match_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge ON scores(judge_id);
CREATE INDEX IF NOT EXISTS idx_athletes_type ON athletes(type);
CREATE INDEX IF NOT EXISTS idx_athletes_verification ON athletes(verification_status);
CREATE INDEX IF NOT EXISTS idx_athletes_category ON athletes(category_id);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_schedule ON judge_assignments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_bracket_athletes_bracket ON bracket_athletes(bracket_id);
CREATE INDEX IF NOT EXISTS idx_schedules_arena ON schedules(arena_id);

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE scores;
ALTER PUBLICATION supabase_realtime ADD TABLE speed_kick_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE judge_assignments;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poomsae_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bracket_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_kick_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read for display
CREATE POLICY "public_read_all" ON tournament_settings FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON arenas FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON judges FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON judge_assignments FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON athletes FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON poomsae_forms FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON brackets FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON bracket_athletes FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON schedules FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON matches FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON scores FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON speed_kick_scores FOR SELECT USING (true);
CREATE POLICY "public_read_all" ON users FOR SELECT USING (true);

-- Write policies (authenticated)
CREATE POLICY "auth_write" ON tournament_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON arenas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON judges FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON judge_assignments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON athletes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON poomsae_forms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON brackets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON bracket_athletes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON schedules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON matches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON scores FOR INSERT WITH CHECK (true);
CREATE POLICY "auth_write_update" ON scores FOR UPDATE USING (true);
CREATE POLICY "auth_write" ON speed_kick_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "auth_write_update" ON speed_kick_scores FOR UPDATE USING (true);
CREATE POLICY "auth_write" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "auth_read" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');
