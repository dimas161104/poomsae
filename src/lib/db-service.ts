import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, onSnapshot } from 'firebase/firestore';
import { 
  TournamentSettings, User, Judge, Athlete, Match, 
  ScoreDetail, SpeedKickScoreDetail, JudgeAssignment, AuditLog 
} from '@/types/database';
import { calculateMatchFinalScore } from './bracket-logic';

// Initial Default Tournament Settings
export const DEFAULT_SETTINGS: TournamentSettings = {
  id: 'tournament-settings-main',
  name: 'Kejuaraan Nasional Taekwondo Poomsae & Speed Kicking 2025',
  arena_count: 3,
  arena_names: ['Lapangan A', 'Lapangan B', 'Lapangan C'],
  judges_per_session: 3, // Default 3 judges (+1 backup)
  has_backup_judge: true,
  forms_count: 2, // Default 2 forms
  speed_kick_body_point: 1.0,
  speed_kick_head_point: 3.0,
  speed_kick_spin_head_point: 4.0,
  minor_deduction: 0.10,
  major_deduction: 0.30,
  gamjeom_penalty: 0.30,
  accuracy_base: 4.00,
  presentation_max: 6.00,
  presentation_component_min: 0.50,
  presentation_component_max: 2.00,
  presentation_step: 0.05,
  cutoff_high_low: true,
  location: 'GOR POPKI Cibubur, Jakarta Timur',
  start_date: '2025-11-20',
  end_date: '2025-11-22',
  organizer: 'Pengurus Besar Taekwondo Indonesia (PBTI)',
  updated_at: new Date().toISOString(),
};

// Initial Default Users
export const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'PBTI Super Admin', email: 'admin@pbti-poomsae.id', username: 'admin', pin: 'admin123', role: 'admin', status: 'active', created_at: '', updated_at: '' },
  { id: 'u2', name: 'Operator Lapangan A', email: 'op.a@pbti-poomsae.id', username: 'operator_a', pin: 'op1234', role: 'operator', assigned_arena: 'A', status: 'active', created_at: '', updated_at: '' },
  { id: 'u3', name: 'Operator Lapangan B', email: 'op.b@pbti-poomsae.id', username: 'operator_b', pin: 'op1234', role: 'operator', assigned_arena: 'B', status: 'active', created_at: '', updated_at: '' },
  { id: 'u4', name: 'Operator Lapangan C', email: 'op.c@pbti-poomsae.id', username: 'operator_c', pin: 'op1234', role: 'operator', assigned_arena: 'C', status: 'active', created_at: '', updated_at: '' },
  { id: 'u5', name: 'Display Proyektor Arena A', email: 'media.a@pbti-poomsae.id', username: 'media_a', pin: 'media123', role: 'media', assigned_arena: 'A', status: 'active', created_at: '', updated_at: '' },
];

// Initial Default Judges
export const DEFAULT_JUDGES: Judge[] = [
  { id: 'j1', name: 'Bambang Sudibyo', judge_code: 'J-2025-001', pin: '112233', rank: 'Wasit Nasional 1', organization: 'Pengprov DKI Jakarta', assigned_arena: 'A', position: 'J1', is_backup: false, status: 'active', is_online: true, last_ping: null, created_at: '', updated_at: '' },
  { id: 'j2', name: 'Liem Wen Hao', judge_code: 'J-2025-002', pin: '223344', rank: 'Wasit Nasional 1', organization: 'Pengprov Jawa Barat', assigned_arena: 'A', position: 'J2', is_backup: false, status: 'active', is_online: true, last_ping: null, created_at: '', updated_at: '' },
  { id: 'j3', name: 'Eko Prasetyo', judge_code: 'J-2025-003', pin: '364758', rank: 'Wasit Internasional (IR)', organization: 'Pengprov Jawa Tengah', assigned_arena: 'A', position: 'J3', is_backup: false, status: 'active', is_online: true, last_ping: null, created_at: '', updated_at: '' },
  { id: 'j4', name: 'Nuraini Rahmawati', judge_code: 'J-2025-004', pin: '445566', rank: 'Wasit Nasional 2', organization: 'Pengprov Jawa Timur', assigned_arena: 'A', position: 'J4', is_backup: false, status: 'active', is_online: true, last_ping: null, created_at: '', updated_at: '' },
  { id: 'j5', name: 'Hendra Gunawan', judge_code: 'J-2025-005', pin: '556677', rank: 'Wasit Nasional 2', organization: 'Pengprov Bali', assigned_arena: 'A', position: 'J5', is_backup: false, status: 'active', is_online: true, last_ping: null, created_at: '', updated_at: '' },
  { id: 'j6', name: 'Agus Salim (Cadangan)', judge_code: 'J-2025-006', pin: '667788', rank: 'Wasit Nasional 2', organization: 'Pengprov Banten', assigned_arena: 'A', position: 'cadangan', is_backup: true, status: 'active', is_online: false, last_ping: null, created_at: '', updated_at: '' },
];

// Initial Default Athletes
export const DEFAULT_ATHLETES: Athlete[] = [
  {
    id: 'ath-1',
    name: 'Ahmad Zaki Kurniawan',
    athlete2_name: null,
    initials: 'AZK',
    category_id: 'cat-1',
    category_name: 'Senior Putra Individual Prestasi',
    category_type: 'prestasi',
    level: 'prestasi',
    participation_type: 'individu',
    contingent: 'Pengprov DKI Jakarta',
    province: 'DKI Jakarta',
    age_group: 'Senior',
    gender: 'Putra',
    dan_level: 'Dan III',
    youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    verification_status: 'terverifikasi',
    verification_notes: 'Berkas KTA & sertifikat Dan valid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ath-2',
    name: 'Rayhan Bagus Pratama',
    athlete2_name: null,
    initials: 'RBP',
    category_id: 'cat-1',
    category_name: 'Senior Putra Individual Prestasi',
    category_type: 'prestasi',
    level: 'prestasi',
    participation_type: 'individu',
    contingent: 'Pengcab Jawa Barat',
    province: 'Jawa Barat',
    age_group: 'Senior',
    gender: 'Putra',
    dan_level: 'Dan II',
    youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    verification_status: 'terverifikasi',
    verification_notes: 'Lolos verifikasi berkas',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ath-3',
    name: 'Muhammad Dimas Satria',
    athlete2_name: null,
    initials: 'MDS',
    category_id: 'cat-1',
    category_name: 'Senior Putra Individual Prestasi',
    category_type: 'prestasi',
    level: 'prestasi',
    participation_type: 'individu',
    contingent: 'Pengprov Jawa Tengah',
    province: 'Jawa Tengah',
    age_group: 'Senior',
    gender: 'Putra',
    dan_level: 'Dan II',
    youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    verification_status: 'terverifikasi',
    verification_notes: 'Lolos timbang badan dan berkas',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ath-4',
    name: 'Siti Aisyah',
    athlete2_name: 'Budi Darmawan', // 1 Pair = 1 team entry with 2 names!
    initials: 'SA-BD',
    category_id: 'cat-2',
    category_name: 'Junior Campuran Festival Pair',
    category_type: 'festival',
    level: 'pemula',
    participation_type: 'pair',
    contingent: 'Dojang Garuda Putera',
    province: 'DI Yogyakarta',
    age_group: 'Junior',
    gender: 'Campuran',
    dan_level: 'Geup 1 & Geup 2',
    youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    verification_status: 'terverifikasi',
    verification_notes: 'Pair Festival terverifikasi lengkap',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ath-5',
    name: 'Kevin Pratama Sanjaya',
    athlete2_name: null,
    initials: 'KPS',
    category_id: 'cat-3',
    category_name: 'Cadet Putra Festival Pemula Individu',
    category_type: 'festival',
    level: 'pemula',
    participation_type: 'individu',
    contingent: 'Klub Taekwondo Mahameru',
    province: 'Bali',
    age_group: 'Cadet',
    gender: 'Putra',
    dan_level: 'Geup 3',
    youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    verification_status: 'terverifikasi',
    verification_notes: 'Kategori Festival Pemula',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ath-6',
    name: 'Fajar Alfian',
    athlete2_name: null,
    initials: 'FA',
    category_id: 'cat-4',
    category_name: 'Senior Putra Speed Kicking On Target',
    category_type: 'speed_kick',
    level: 'prestasi',
    participation_type: 'individu',
    contingent: 'Pengcab Jakarta Selatan',
    province: 'DKI Jakarta',
    age_group: 'Senior',
    gender: 'Putra',
    dan_level: 'Dan I',
    youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    verification_status: 'terverifikasi',
    verification_notes: 'Speed Kick On Target terverifikasi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Initial Default Matches
export const DEFAULT_MATCHES: Match[] = [
  {
    id: 'match-101',
    match_number: 42,
    arena_code: 'A',
    athlete_id: 'ath-1',
    athlete: DEFAULT_ATHLETES[0],
    category_name: 'Senior Putra Individual Prestasi',
    category_type: 'prestasi',
    level: 'prestasi',
    participation_type: 'individu',
    round: 'final',
    forms_count: 2,
    poomsae_1: 'Koryo',
    poomsae_2: 'Taegeuk 8 Jang',
    active_form: 1,
    status: 'aktif',
    is_current: true,
    operator_notes: 'Partai ke-42 sedang berlangsung di Arena A',
    final_score: 8.416,
    form1_final_score: 8.433,
    form2_final_score: 8.400,
    scores: {
      form1_scores: {
        J1: { judge_id: 'j1', judge_position: 'J1', judge_name: 'Bambang Sudibyo', accuracy: 3.90, minor_deductions: 1, major_deductions: 0, speed_power: 1.60, rhythm_tempo: 1.65, expression_energy: 1.55, presentation_total: 4.80, gamjeom_count: 0, gamjeom_penalty: 0, total_score: 8.70, submitted_at: new Date().toISOString() },
        J2: { judge_id: 'j2', judge_position: 'J2', judge_name: 'Liem Wen Hao', accuracy: 3.80, minor_deductions: 2, major_deductions: 0, speed_power: 1.55, rhythm_tempo: 1.60, expression_energy: 1.50, presentation_total: 4.65, gamjeom_count: 0, gamjeom_penalty: 0, total_score: 8.45, submitted_at: new Date().toISOString() },
        J3: { judge_id: 'j3', judge_position: 'J3', judge_name: 'Eko Prasetyo', accuracy: 3.70, minor_deductions: 3, major_deductions: 0, speed_power: 1.50, rhythm_tempo: 1.55, expression_energy: 1.40, presentation_total: 4.45, gamjeom_count: 0, gamjeom_penalty: 0, total_score: 8.15, submitted_at: new Date().toISOString() },
      },
      form2_scores: {
        J1: { judge_id: 'j1', judge_position: 'J1', judge_name: 'Bambang Sudibyo', accuracy: 3.80, minor_deductions: 2, major_deductions: 0, speed_power: 1.60, rhythm_tempo: 1.60, expression_energy: 1.50, presentation_total: 4.70, gamjeom_count: 0, gamjeom_penalty: 0, total_score: 8.50, submitted_at: new Date().toISOString() },
        J2: { judge_id: 'j2', judge_position: 'J2', judge_name: 'Liem Wen Hao', accuracy: 3.80, minor_deductions: 2, major_deductions: 0, speed_power: 1.55, rhythm_tempo: 1.55, expression_energy: 1.50, presentation_total: 4.60, gamjeom_count: 0, gamjeom_penalty: 0, total_score: 8.40, submitted_at: new Date().toISOString() },
        J3: { judge_id: 'j3', judge_position: 'J3', judge_name: 'Eko Prasetyo', accuracy: 3.70, minor_deductions: 3, major_deductions: 0, speed_power: 1.50, rhythm_tempo: 1.60, expression_energy: 1.50, presentation_total: 4.60, gamjeom_count: 0, gamjeom_penalty: 0, total_score: 8.30, submitted_at: new Date().toISOString() },
      }
    },
    started_at: '09:15',
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'match-102',
    match_number: 43,
    arena_code: 'A',
    athlete_id: 'ath-2',
    athlete: DEFAULT_ATHLETES[1],
    category_name: 'Senior Putra Individual Prestasi',
    category_type: 'prestasi',
    level: 'prestasi',
    participation_type: 'individu',
    round: 'final',
    forms_count: 2,
    poomsae_1: 'Koryo',
    poomsae_2: 'Taegeuk 8 Jang',
    active_form: 1,
    status: 'menunggu',
    is_current: false,
    operator_notes: 'Menunggu giliran di Arena A',
    final_score: null,
    scores: { form1_scores: {}, form2_scores: {} },
    started_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'match-103',
    match_number: 44,
    arena_code: 'A',
    athlete_id: 'ath-3',
    athlete: DEFAULT_ATHLETES[2],
    category_name: 'Senior Putra Individual Prestasi',
    category_type: 'prestasi',
    level: 'prestasi',
    participation_type: 'individu',
    round: 'final',
    forms_count: 2,
    poomsae_1: 'Koryo',
    poomsae_2: 'Taegeuk 8 Jang',
    active_form: 1,
    status: 'menunggu',
    is_current: false,
    operator_notes: 'Menunggu giliran di Arena A',
    final_score: null,
    scores: { form1_scores: {}, form2_scores: {} },
    started_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'match-201',
    match_number: 15,
    arena_code: 'B',
    athlete_id: 'ath-4',
    athlete: DEFAULT_ATHLETES[3],
    category_name: 'Junior Campuran Festival Pair',
    category_type: 'festival',
    level: 'pemula',
    participation_type: 'pair',
    round: 'grup',
    group_name: 'Grup A (Pemula)',
    forms_count: 1,
    poomsae_1: 'Taegeuk 4 Jang',
    active_form: 1,
    status: 'aktif',
    is_current: true,
    operator_notes: 'Festival Pair di Arena B',
    final_score: 8.150,
    form1_final_score: 8.150,
    scores: {
      form1_scores: {
        J1: { judge_id: 'j1', judge_position: 'J1', judge_name: 'Bambang Sudibyo', accuracy: 3.70, minor_deductions: 3, major_deductions: 0, speed_power: 1.50, rhythm_tempo: 1.50, expression_energy: 1.45, presentation_total: 4.45, gamjeom_count: 0, gamjeom_penalty: 0, total_score: 8.15, submitted_at: new Date().toISOString() },
      },
      form2_scores: {}
    },
    started_at: '09:30',
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'match-301',
    match_number: 8,
    arena_code: 'C',
    athlete_id: 'ath-6',
    athlete: DEFAULT_ATHLETES[5],
    category_name: 'Senior Putra Speed Kicking On Target',
    category_type: 'speed_kick',
    level: 'prestasi',
    participation_type: 'individu',
    round: 'final',
    forms_count: 1,
    poomsae_1: 'Speed Kick On Target (30 Detik)',
    active_form: 1,
    status: 'aktif',
    is_current: true,
    operator_notes: 'Speed Kicking di Arena C',
    final_score: null,
    speed_kick_total_points: 28,
    scores: { form1_scores: {}, form2_scores: {} },
    started_at: '09:40',
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// In-Memory Global State (synchronizes cross-tab and mirrors Firestore)
class DataService {
  private settings: TournamentSettings = DEFAULT_SETTINGS;
  private users: User[] = DEFAULT_USERS;
  private judges: Judge[] = DEFAULT_JUDGES;
  private athletes: Athlete[] = DEFAULT_ATHLETES;
  private matches: Match[] = DEFAULT_MATCHES;
  private channel: BroadcastChannel | null = null;
  private subscribers: Set<() => void> = new Set();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('poomsae_sync_bus');
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_STATE') {
            if (event.data.settings) this.settings = event.data.settings;
            if (event.data.matches) this.matches = event.data.matches;
            if (event.data.athletes) this.athletes = event.data.athletes;
            if (event.data.judges) this.judges = event.data.judges;
            if (event.data.users) this.users = event.data.users;
            this.notify();
          }
        };

        // Load local cache if available
        const localSettings = localStorage.getItem('poomsae_settings');
        if (localSettings) this.settings = JSON.parse(localSettings);

        const localMatches = localStorage.getItem('poomsae_matches');
        if (localMatches) this.matches = JSON.parse(localMatches);

        const localAthletes = localStorage.getItem('poomsae_athletes');
        if (localAthletes) this.athletes = JSON.parse(localAthletes);

        const localJudges = localStorage.getItem('poomsae_judges');
        if (localJudges) this.judges = JSON.parse(localJudges);

        const localUsers = localStorage.getItem('poomsae_users');
        if (localUsers) this.users = JSON.parse(localUsers);

        this.initFirestoreRealtime();
      } catch (err) {
        console.warn('Sync channel init error:', err);
      }
    }
  }

  private async initFirestoreRealtime() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    try {
      // Setup Firestore Realtime listeners if reachable
      const settingsRef = doc(db, 'tournaments', 'settings');
      onSnapshot(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
          this.settings = snapshot.data() as TournamentSettings;
          this.broadcast('SYNC_STATE');
          this.notify();
        }
      }, (err) => console.log('Firestore offline / demo mode:', err.message));

      const matchesCol = collection(db, 'matches');
      onSnapshot(matchesCol, (snapshot) => {
        if (!snapshot.empty) {
          const list: Match[] = [];
          snapshot.forEach(d => list.push(d.data() as Match));
          if (list.length > 0) {
            this.matches = list;
            this.broadcast('SYNC_STATE');
            this.notify();
          }
        }
      }, (err) => console.log('Firestore matches listener offline / demo mode:', err.message));
    } catch {
      // Non-blocking fallback for local demo
    }
  }

  private broadcast(type: string) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('poomsae_settings', JSON.stringify(this.settings));
        localStorage.setItem('poomsae_matches', JSON.stringify(this.matches));
        localStorage.setItem('poomsae_athletes', JSON.stringify(this.athletes));
        localStorage.setItem('poomsae_judges', JSON.stringify(this.judges));
        localStorage.setItem('poomsae_users', JSON.stringify(this.users));

        if (this.channel) {
          this.channel.postMessage({
            type,
            settings: this.settings,
            matches: this.matches,
            athletes: this.athletes,
            judges: this.judges,
            users: this.users,
          });
        }
      } catch (err) {
        console.warn('Broadcast failed:', err);
      }
    }
    this.notify();
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  public subscribe(cb: () => void) {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  // --- SETTINGS ---
  public getSettings(): TournamentSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<TournamentSettings>) {
    this.settings = { ...this.settings, ...newSettings, updated_at: new Date().toISOString() };
    this.broadcast('SYNC_STATE');

    try {
      setDoc(doc(db, 'tournaments', 'settings'), this.settings, { merge: true }).catch(() => {});
    } catch {}
    return this.settings;
  }

  // --- MATCHES ---
  public getMatches(arenaCode?: string): Match[] {
    if (!arenaCode || arenaCode === 'ALL') return [...this.matches];
    return this.matches.filter(m => m.arena_code === arenaCode);
  }

  public getMatch(id: string): Match | undefined {
    return this.matches.find(m => m.id === id);
  }

  public getCurrentMatch(arenaCode: string): Match | undefined {
    return this.matches.find(m => m.arena_code === arenaCode && m.is_current) || 
           this.matches.find(m => m.arena_code === arenaCode);
  }

  public setActiveMatch(matchId: string, arenaCode: string) {
    this.matches = this.matches.map(m => {
      if (m.arena_code === arenaCode) {
        return {
          ...m,
          is_current: m.id === matchId,
          status: m.id === matchId ? 'aktif' : (m.status === 'selesai' ? 'selesai' : 'menunggu'),
          updated_at: new Date().toISOString(),
        };
      }
      return m;
    });

    this.broadcast('SYNC_STATE');

    try {
      this.matches.filter(m => m.arena_code === arenaCode).forEach(m => {
        setDoc(doc(db, 'matches', m.id), m, { merge: true }).catch(() => {});
      });
    } catch {}
  }

  public updateMatchStatus(matchId: string, status: Match['status']) {
    this.matches = this.matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status,
          is_current: status === 'aktif',
          completed_at: status === 'selesai' ? new Date().toISOString() : m.completed_at,
          updated_at: new Date().toISOString(),
        };
      }
      return m;
    });

    this.broadcast('SYNC_STATE');

    try {
      const match = this.matches.find(m => m.id === matchId);
      if (match) setDoc(doc(db, 'matches', match.id), match, { merge: true }).catch(() => {});
    } catch {}
  }

  // --- SUBMIT JUDGE SCORE ---
  public submitJudgeScore(
    matchId: string,
    judgePosition: string, // 'J1', 'J2', 'J3', etc.
    scoreDetail: ScoreDetail,
    formNumber: 1 | 2
  ) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    const currentScores = match.scores || { form1_scores: {}, form2_scores: {} };
    if (formNumber === 1) {
      currentScores.form1_scores = {
        ...currentScores.form1_scores,
        [judgePosition]: scoreDetail,
      };
    } else {
      currentScores.form2_scores = {
        ...currentScores.form2_scores,
        [judgePosition]: scoreDetail,
      };
    }

    match.scores = currentScores;

    // Recalculate match final score
    const calculation = calculateMatchFinalScore(match, this.settings);
    match.form1_final_score = calculation.form1Score;
    match.form2_final_score = calculation.form2Score;
    match.final_score = calculation.finalScore;
    match.updated_at = new Date().toISOString();

    this.matches = this.matches.map(m => m.id === matchId ? { ...match } : m);
    this.broadcast('SYNC_STATE');

    try {
      setDoc(doc(db, 'matches', match.id), match, { merge: true }).catch(() => {});
    } catch {}
  }

  // --- SUBMIT SPEED KICK SCORE ---
  public submitSpeedKickScore(
    matchId: string,
    judgePosition: string,
    scoreDetail: SpeedKickScoreDetail
  ) {
    const match = this.matches.find(m => m.id === matchId);
    if (!match) return;

    const currentScores = match.scores || { form1_scores: {}, form2_scores: {} };
    currentScores.speed_kick_scores = {
      ...(currentScores.speed_kick_scores || {}),
      [judgePosition]: scoreDetail,
    };

    match.scores = currentScores;
    // Calculate average across all submitting judges for this match
    const speedScores = Object.values(currentScores.speed_kick_scores || {});
    const totalPts = speedScores.reduce((acc, s) => acc + s.total_points, 0);
    const avgPts = speedScores.length > 0 ? Math.round((totalPts / speedScores.length) * 10) / 10 : 0;

    match.speed_kick_total_points = avgPts;
    match.final_score = avgPts;
    match.updated_at = new Date().toISOString();

    this.matches = this.matches.map(m => m.id === matchId ? { ...match } : m);
    this.broadcast('SYNC_STATE');

    try {
      setDoc(doc(db, 'matches', match.id), match, { merge: true }).catch(() => {});
    } catch {}
  }

  // --- SWAP ABSENT JUDGE WITH BACKUP JUDGE ---
  public swapJudgeWithBackup(arenaCode: string, targetPosition: string, backupJudgeId?: string) {
    const backup = this.judges.find(j => (backupJudgeId ? j.id === backupJudgeId : j.is_backup));
    if (!backup) return;

    this.judges = this.judges.map(j => {
      if (j.assigned_arena === arenaCode && j.position === targetPosition) {
        return { ...j, position: 'cadangan', is_backup: true, status: 'inactive' as const };
      }
      if (j.id === backup.id) {
        return { ...j, position: targetPosition as any, is_backup: false, status: 'active' as const, assigned_arena: arenaCode };
      }
      return j;
    });

    this.broadcast('SYNC_STATE');
  }

  // --- QUEUE VERIFIED ATHLETE INTO ARENA MATCHES ---
  public queueAthleteToArena(athleteId: string, arenaCode: string, round: 'penyisihan' | 'final' = 'penyisihan') {
    const athlete = this.athletes.find(a => a.id === athleteId);
    if (!athlete) return null;

    const exists = this.matches.some(m => m.athlete_id === athleteId && m.status !== 'selesai');
    if (exists) return null;

    const maxMatchNumber = this.matches.reduce((max, m) => Math.max(max, m.match_number), 0);
    const formsCount = this.settings.forms_count || (athlete.category_type === 'speed_kick' ? 1 : 2);

    const newMatch: Match = {
      id: `match-queue-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      match_number: maxMatchNumber + 1,
      arena_code: arenaCode,
      athlete_id: athlete.id,
      athlete: athlete,
      category_name: athlete.category_name || athlete.name,
      category_type: athlete.category_type,
      level: athlete.level,
      participation_type: athlete.participation_type,
      round: round,
      forms_count: formsCount,
      poomsae_1: athlete.category_type === 'speed_kick' ? 'Speed Kick On Target' : (athlete.level === 'pemula' ? 'Taegeuk 4 Jang' : 'Koryo'),
      poomsae_2: formsCount === 2 ? 'Taegeuk 8 Jang' : undefined,
      active_form: 1,
      status: 'menunggu',
      is_current: false,
      operator_notes: `Antrean ${athlete.category_type.toUpperCase()} Lapangan ${arenaCode}`,
      final_score: null,
      scores: { form1_scores: {}, form2_scores: {} },
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.matches = [...this.matches, newMatch];
    this.broadcast('SYNC_STATE');
    return newMatch;
  }

  // --- ATHLETES ---
  public getAthletes(): Athlete[] {
    return [...this.athletes];
  }

  public addAthlete(athlete: Athlete) {
    this.athletes = [athlete, ...this.athletes];
    this.broadcast('SYNC_STATE');

    try {
      setDoc(doc(db, 'athletes', athlete.id), athlete).catch(() => {});
    } catch {}
  }

  public updateAthlete(athlete: Athlete) {
    this.athletes = this.athletes.map(a => a.id === athlete.id ? athlete : a);
    
    // Also update any matching match references
    this.matches = this.matches.map(m => {
      if (m.athlete_id === athlete.id) {
        return { ...m, athlete };
      }
      return m;
    });

    this.broadcast('SYNC_STATE');

    try {
      setDoc(doc(db, 'athletes', athlete.id), athlete, { merge: true }).catch(() => {});
    } catch {}
  }

  public bulkAddAthletes(newAthletes: Athlete[]) {
    this.athletes = [...newAthletes, ...this.athletes];
    this.broadcast('SYNC_STATE');

    try {
      newAthletes.forEach(a => {
        setDoc(doc(db, 'athletes', a.id), a).catch(() => {});
      });
    } catch {}
  }

  // --- JUDGES & USERS ---
  public getJudges(): Judge[] {
    return [...this.judges];
  }

  public updateJudge(judge: Judge) {
    this.judges = this.judges.map(j => j.id === judge.id ? judge : j);
    this.broadcast('SYNC_STATE');

    try {
      setDoc(doc(db, 'judges', judge.id), judge, { merge: true }).catch(() => {});
    } catch {}
  }

  public addJudge(judge: Judge) {
    this.judges = [...this.judges, judge];
    this.broadcast('SYNC_STATE');

    try {
      setDoc(doc(db, 'judges', judge.id), judge).catch(() => {});
    } catch {}
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public addUser(user: User) {
    this.users = [...this.users, user];
    this.broadcast('SYNC_STATE');

    try {
      setDoc(doc(db, 'users', user.id), user).catch(() => {});
    } catch {}
  }

  public updateUser(user: User) {
    this.users = this.users.map(u => u.id === user.id ? user : u);
    this.broadcast('SYNC_STATE');

    try {
      setDoc(doc(db, 'users', user.id), user, { merge: true }).catch(() => {});
    } catch {}
  }

  // Add final matches to schedule
  public addMatches(newMatches: Match[]) {
    this.matches = [...this.matches, ...newMatches];
    this.broadcast('SYNC_STATE');

    try {
      newMatches.forEach(m => {
        setDoc(doc(db, 'matches', m.id), m).catch(() => {});
      });
    } catch {}
  }
}

export const dbService = new DataService();
