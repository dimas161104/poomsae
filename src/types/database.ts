export type RoleType = 'admin' | 'operator' | 'juri' | 'media';
export type AthleteType = 'prestasi' | 'pemula' | 'speed_kick';
export type VerificationStatus = 'menunggu' | 'terverifikasi' | 'ditolak';
export type MatchStatus = 'menunggu' | 'aktif' | 'selesai' | 'dibatalkan';
export type RoundType = 'penyisihan' | 'final';

export interface TournamentSettings {
  id: string;
  name: string;
  arena_count: number;
  arena_format: 'angka' | 'huruf';
  judges_per_session: number; // 3 or 5
  has_backup_judge: boolean;
  forms_count: number; // 1 or 2
  speed_kick_body_point: number; // default 1.0
  speed_kick_head_point: number; // default 3.0
  speed_kick_spin_head_point: number; // default 4.0
  minor_deduction: number;
  major_deduction: number;
  gamjeom_penalty: number;
  accuracy_base: number;
  presentation_max: number;
  presentation_component_min: number;
  presentation_component_max: number;
  presentation_step: number;
  max_total_score: number;
  cutoff_high_low: boolean;
  tiebreak_method: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  organizer: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  auth_id: string | null;
  name: string;
  email: string | null;
  username: string | null;
  pin: string | null;
  role: RoleType;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Arena {
  id: string;
  name: string;
  code: string;
  display_name: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Judge {
  id: string;
  name: string;
  judge_code: string;
  pin: string;
  rank: string | null;
  organization: string | null;
  status: 'active' | 'inactive';
  is_online: boolean;
  last_ping: string | null;
  created_at: string;
  updated_at: string;
}

export interface JudgeAssignment {
  id: string;
  schedule_id: string;
  judge_id: string;
  arena_id: string;
  position: 'J1' | 'J2' | 'J3' | 'J4' | 'J5' | 'cadangan';
  is_backup: boolean;
  is_active: boolean;
  judge?: Judge;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: AthleteType;
  age_group: string | null;
  gender: 'Putra' | 'Putri' | 'Campuran' | null;
  description: string | null;
  created_at: string;
}

export interface Athlete {
  id: string;
  name: string;
  initials: string | null;
  category_id: string | null;
  type: AthleteType;
  contingent: string | null;
  province: string | null;
  age_group: string | null;
  gender: 'Putra' | 'Putri' | null;
  dan_level: string | null;
  youtube_url: string | null;
  verification_status: VerificationStatus;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface PoomsaeForm {
  id: string;
  name: string;
  korean_name: string | null;
  number: number;
  level: string | null;
  description: string | null;
  created_at: string;
}

export interface Bracket {
  id: string;
  category_id: string;
  type: 'eliminasi' | 'grup';
  round: RoundType;
  group_name: string | null;
  group_size: number;
  cutoff_count: number;
  status: 'pending' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
  category?: Category;
  bracket_athletes?: BracketAthlete[];
}

export interface BracketAthlete {
  id: string;
  bracket_id: string;
  athlete_id: string;
  seed_order: number;
  final_score: number | null;
  rank: number | null;
  advanced: boolean;
  athlete?: Athlete;
  created_at: string;
}

export interface Schedule {
  id: string;
  bracket_id: string;
  arena_id: string | null;
  match_date: string | null;
  start_time: string | null;
  session_name: string | null;
  status: 'dijadwalkan' | 'berlangsung' | 'selesai';
  created_at: string;
  updated_at: string;
  bracket?: Bracket;
  arena?: Arena;
  judge_assignments?: JudgeAssignment[];
  matches?: Match[];
}

export interface Match {
  id: string;
  schedule_id: string;
  bracket_id: string;
  arena_id: string | null;
  match_number: number;
  athlete_id: string;
  poomsae_form_id: string | null;
  form_number: number; // 1 or 2
  category: string | null;
  round: string;
  status: MatchStatus;
  is_current: boolean;
  operator_notes: string | null;
  final_score: number | null;
  speed_kick_total_points: number;
  speed_kick_score: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  athlete?: Athlete;
  poomsae_form?: PoomsaeForm;
  arena?: Arena;
  scores?: Score[];
  speed_kick_scores?: SpeedKickScore[];
}

export interface Score {
  id: string;
  match_id: string;
  judge_id: string;
  judge_assignment_id: string | null;
  accuracy_score: number;
  minor_deductions: number;
  major_deductions: number;
  total_deduction: number;
  speed_power: number;
  rhythm_tempo: number;
  expression_energy: number;
  presentation_score: number;
  gamjeom_count: number;
  gamjeom_penalty: number;
  total_score: number;
  is_submitted: boolean;
  is_draft: boolean;
  submitted_at: string | null;
  is_highest: boolean;
  is_lowest: boolean;
  is_counted: boolean;
  judge?: Judge;
  created_at: string;
  updated_at: string;
}

export interface SpeedKickScore {
  id: string;
  match_id: string;
  judge_id: string;
  body_kicks: number;
  head_kicks: number;
  spin_head_kicks: number;
  total_points: number;
  is_submitted: boolean;
  submitted_at: string | null;
  judge?: Judge;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_role: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  details: string | null;
  created_at: string;
}
