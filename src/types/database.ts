export type RoleType = 'admin' | 'operator' | 'juri' | 'media';
export type CategoryType = 'prestasi' | 'festival' | 'speed_kick';
export type AthleteLevel = 'pemula' | 'prestasi';
export type ParticipationType = 'individu' | 'pair';
export type VerificationStatus = 'menunggu' | 'terverifikasi' | 'ditolak';
export type MatchStatus = 'menunggu' | 'aktif' | 'selesai' | 'dibatalkan';
export type RoundType = 'penyisihan' | 'final' | 'grup';

export interface TournamentSettings {
  id: string;
  name: string;
  arena_count: number; // default 3
  arena_names: string[]; // e.g. ['Lapangan A', 'Lapangan B', 'Lapangan C']
  judges_per_session: number; // 3 or 5 (default 3)
  has_backup_judge: boolean; // default true (+1)
  forms_count: number; // 1 or 2 (default 2)
  speed_kick_body_point: number; // default 1.0
  speed_kick_head_point: number; // default 3.0
  speed_kick_spin_head_point: number; // default 4.0
  minor_deduction: number; // default 0.10
  major_deduction: number; // default 0.30
  gamjeom_penalty: number; // default 0.30
  accuracy_base: number; // default 4.00
  presentation_max: number; // default 6.00
  presentation_component_min: number; // default 0.50
  presentation_component_max: number; // default 2.00
  presentation_step: number; // default 0.05
  cutoff_high_low: boolean; // true if 5 judges
  location?: string;
  start_date?: string;
  end_date?: string;
  organizer?: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  username: string | null;
  pin: string | null;
  role: RoleType;
  assigned_arena?: string; // 'A' | 'B' | 'C'
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Arena {
  id: string;
  name: string;
  code: string; // 'A', 'B', 'C'
  display_name: string;
  status: 'active' | 'inactive';
}

export interface Judge {
  id: string;
  name: string;
  judge_code: string;
  pin: string;
  rank: string | null;
  organization: string | null;
  assigned_arena: string; // 'A' | 'B' | 'C'
  position: 'J1' | 'J2' | 'J3' | 'J4' | 'J5' | 'cadangan';
  is_backup: boolean;
  status: 'active' | 'inactive';
  is_online: boolean;
  last_ping: string | null;
  created_at: string;
  updated_at: string;
}

export interface JudgeAssignment {
  id: string;
  judge_id: string;
  judge_name: string;
  arena_code: string; // 'A' | 'B' | 'C'
  position: 'J1' | 'J2' | 'J3' | 'J4' | 'J5' | 'cadangan';
  is_backup: boolean;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType; // 'prestasi' | 'festival' | 'speed_kick'
  age_group: string | null; // Pra-Cadet, Cadet, Junior, Senior
  gender: 'Putra' | 'Putri' | 'Campuran' | null;
  participation_type: ParticipationType; // 'individu' | 'pair'
  description?: string;
}

export interface Athlete {
  id: string;
  name: string; // Athlete 1 name (or pair title)
  athlete2_name?: string | null; // Athlete 2 name (for pair entry)
  initials: string | null;
  category_id: string | null;
  category_name?: string;
  category_type: CategoryType; // 'prestasi' | 'festival' | 'speed_kick'
  level: AthleteLevel; // 'pemula' | 'prestasi'
  participation_type: ParticipationType; // 'individu' | 'pair'
  contingent: string | null;
  province: string | null;
  age_group: string | null;
  gender: 'Putra' | 'Putri' | 'Campuran' | null;
  dan_level: string | null;
  youtube_url: string | null;
  verification_status: VerificationStatus;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScoreDetail {
  judge_id: string;
  judge_position: string; // 'J1', 'J2', 'J3', 'J4', 'J5'
  judge_name: string;
  accuracy: number;
  minor_deductions: number;
  major_deductions: number;
  speed_power: number;
  rhythm_tempo: number;
  expression_energy: number;
  presentation_total: number;
  gamjeom_count: number;
  gamjeom_penalty: number;
  total_score: number;
  is_highest?: boolean;
  is_lowest?: boolean;
  is_counted?: boolean;
  submitted_at: string;
}

export interface SpeedKickScoreDetail {
  judge_id: string;
  judge_position: string;
  judge_name: string;
  body_kicks: number;
  head_kicks: number;
  spin_head_kicks: number;
  total_points: number;
  submitted_at: string;
}

export interface MatchScoreState {
  form1_scores: Record<string, ScoreDetail>; // keyed by judge position
  form2_scores: Record<string, ScoreDetail>;
  speed_kick_scores?: Record<string, SpeedKickScoreDetail>;
}

export interface Match {
  id: string;
  match_number: number;
  schedule_id?: string;
  bracket_id?: string;
  arena_code: string; // 'A', 'B', 'C'
  athlete_id: string;
  athlete?: Athlete;
  category_name: string;
  category_type: CategoryType;
  level: AthleteLevel;
  participation_type: ParticipationType;
  round: RoundType;
  group_name?: string; // For pemula grup 3 (e.g. "Grup A", "Grup B")
  forms_count: number; // 1 or 2
  poomsae_1: string;
  poomsae_2?: string;
  active_form: 1 | 2;
  status: MatchStatus;
  is_current: boolean;
  operator_notes: string | null;
  scores?: MatchScoreState;
  final_score: number | null;
  form1_final_score?: number | null;
  form2_final_score?: number | null;
  speed_kick_total_points?: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BracketGroup {
  id: string;
  name: string; // "Grup 1", "Penyisihan Pool A", "8 Besar Final"
  category_name: string;
  category_type: CategoryType;
  level: AthleteLevel;
  participation_type: ParticipationType;
  round: RoundType;
  matches: Match[];
  status: 'pending' | 'active' | 'completed';
}

export interface ScheduleItem {
  id: string;
  date: string;
  session_name: string;
  arena_code: string;
  match_ids: string[];
  assigned_judges: JudgeAssignment[];
  status: 'dijadwalkan' | 'berlangsung' | 'selesai';
}

export interface AuditLog {
  id: string;
  user_name: string;
  user_role: RoleType;
  action: string;
  details: string;
  timestamp: string;
}
