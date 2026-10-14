'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, Users, Calendar, Shield, Settings, 
  Database, PlaySquare, CheckCircle, XCircle, AlertTriangle, 
  RotateCcw, Download, Plus, Trash2, Edit, Save, RefreshCw,
  Video, Eye, Filter, ArrowRight, UserCheck, UserX, Award, Activity,
  GitBranch, Monitor, BarChart3, Search, Play, Pause, Clock, ExternalLink,
  Upload, FileSpreadsheet, Printer
} from 'lucide-react';
import { AdminLayout } from '@/components/shared/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { TournamentSettings, Athlete, Judge, Category, User, Match, CategoryType, AthleteLevel, ParticipationType } from '@/types/database';
import { formatScore, getYouTubeEmbedUrl } from '@/lib/utils';
import { dbService } from '@/lib/db-service';
import { processCutoffAndGenerateFinals, groupPemulaAthletes, determinePemulaMedal } from '@/lib/bracket-logic';
import { RecapModal } from '@/components/shared/recap-modal';
import { ImportAthletesModal } from '@/components/shared/import-athletes';

function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'console' | 'settings' | 'verifikasi' | 'wasit' | 'bracket' | 'rekap' | 'reset'>(
    tabParam === 'klasemen' ? 'rekap' : (tabParam as any) || 'console'
  );

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam === 'klasemen' ? 'rekap' : (tabParam as any));
    }
  }, [tabParam]);

  const [pemulaGroups, setPemulaGroups] = useState<{ groupName: string; athletes: Athlete[] }[]>([]);
  const [selectedQueueArena, setSelectedQueueArena] = useState<Record<string, 'A' | 'B' | 'C'>>({});

  const [alertMessage, setAlertMessage] = useState('');
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Real-time Database State
  const [settings, setSettings] = useState<TournamentSettings>(dbService.getSettings());
  const [athletes, setAthletes] = useState<Athlete[]>(dbService.getAthletes());
  const [judges, setJudges] = useState<Judge[]>(dbService.getJudges());
  const [users, setUsers] = useState<User[]>(dbService.getUsers());
  const [matches, setMatches] = useState<Match[]>(dbService.getMatches());

  // Subscribe to dbService
  useEffect(() => {
    const handleSync = () => {
      setSettings(dbService.getSettings());
      setAthletes(dbService.getAthletes());
      setJudges(dbService.getJudges());
      setUsers(dbService.getUsers());
      setMatches(dbService.getMatches());
    };

    handleSync();
    const unsub = dbService.subscribe(handleSync);
    return () => unsub();
  }, []);

  // Form states
  const [searchAthlete, setSearchAthlete] = useState('');
  const [searchJudge, setSearchJudge] = useState('');
  const [selectedArenaConsole, setSelectedArenaConsole] = useState<'A' | 'B' | 'C'>('A');

  // New Athlete state
  const [newAthlete, setNewAthlete] = useState({
    name: '',
    athlete2_name: '',
    category_type: 'prestasi' as CategoryType,
    level: 'prestasi' as AthleteLevel,
    participation_type: 'individu' as ParticipationType,
    contingent: '',
    province: 'DKI Jakarta',
    gender: 'Putra' as 'Putra' | 'Putri' | 'Campuran',
    dan_level: 'Dan I',
    youtube_url: '',
  });

  // New Judge state
  const [newJudge, setNewJudge] = useState({
    name: '',
    judge_code: '',
    pin: '',
    rank: 'Wasit Nasional Madya',
    organization: 'PBTI',
    assigned_arena: 'A',
    position: 'J1' as 'J1' | 'J2' | 'J3' | 'J4' | 'J5' | 'cadangan',
    is_backup: false,
  });

  // New User state
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    pin: '',
    email: '',
    role: 'operator' as User['role'],
    assigned_arena: 'A',
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<TournamentSettings>(settings);
  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Reset Input state
  const [resetInput, setResetInput] = useState('');

  // Athlete Actions
  const handleVerifyAthlete = (id: string, status: 'terverifikasi' | 'ditolak') => {
    const ath = athletes.find(a => a.id === id);
    if (!ath) return;
    const updated = { ...ath, verification_status: status };
    dbService.updateAthlete(updated);
    setAlertMessage(`Status atlet "${ath.name}" berhasil diubah menjadi ${status.toUpperCase()}`);
  };

  const handleUpdateYouTubeUrl = (id: string, url: string) => {
    const ath = athletes.find(a => a.id === id);
    if (!ath) return;
    const updated = { ...ath, youtube_url: url };
    dbService.updateAthlete(updated);
    setAlertMessage(`Tautan YouTube atlet "${ath.name}" berhasil diperbarui!`);
  };

  const handleCreateAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthlete.name) return;

    const athlete: Athlete = {
      id: `ath-${Date.now()}`,
      name: newAthlete.name,
      athlete2_name: newAthlete.participation_type === 'pair' ? newAthlete.athlete2_name : null,
      initials: newAthlete.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase(),
      category_id: `cat-${newAthlete.category_type}`,
      category_name: `${newAthlete.gender} ${newAthlete.category_type === 'festival' ? 'Festival' : newAthlete.category_type === 'speed_kick' ? 'Speed Kick' : 'Prestasi'} ${newAthlete.participation_type === 'pair' ? 'Pair' : 'Individu'}`,
      category_type: newAthlete.category_type,
      level: newAthlete.level,
      participation_type: newAthlete.participation_type,
      contingent: newAthlete.contingent || '-',
      province: newAthlete.province,
      age_group: 'Senior',
      gender: newAthlete.gender,
      dan_level: newAthlete.dan_level,
      youtube_url: newAthlete.youtube_url || null,
      verification_status: 'terverifikasi',
      verification_notes: 'Didaftarkan langsung oleh Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbService.addAthlete(athlete);
    setAlertMessage(`Atlet "${athlete.name}" berhasil ditambahkan.`);
    setNewAthlete({
      name: '',
      athlete2_name: '',
      category_type: 'prestasi',
      level: 'prestasi',
      participation_type: 'individu',
      contingent: '',
      province: 'DKI Jakarta',
      gender: 'Putra',
      dan_level: 'Dan I',
      youtube_url: '',
    });
  };

  // Judge Actions
  const handleCreateJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudge.name || !newJudge.judge_code) return;

    const j: Judge = {
      id: `j-${Date.now()}`,
      name: newJudge.name,
      judge_code: newJudge.judge_code,
      pin: newJudge.pin || '123456',
      rank: newJudge.rank,
      organization: newJudge.organization,
      assigned_arena: newJudge.assigned_arena,
      position: newJudge.position,
      is_backup: newJudge.position === 'cadangan',
      status: 'active',
      is_online: true,
      last_ping: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbService.addJudge(j);
    setAlertMessage(`Juri "${j.name}" (${j.judge_code}) berhasil ditambahkan ke Arena ${j.assigned_arena}.`);
    setNewJudge({
      name: '',
      judge_code: '',
      pin: '',
      rank: 'Wasit Nasional Madya',
      organization: 'PBTI',
      assigned_arena: 'A',
      position: 'J1',
      is_backup: false,
    });
  };

  // User Actions
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username) return;

    const u: User = {
      id: `u-${Date.now()}`,
      name: newUser.name,
      username: newUser.username,
      pin: newUser.pin || '1234',
      email: newUser.email || `${newUser.username}@pbti-poomsae.id`,
      role: newUser.role,
      assigned_arena: newUser.assigned_arena,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbService.addUser(u);
    setAlertMessage(`Petugas "${u.name}" (Role: ${u.role}) berhasil ditambahkan.`);
    setNewUser({
      name: '',
      username: '',
      pin: '',
      email: '',
      role: 'operator',
      assigned_arena: 'A',
    });
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.updateSettings(settingsForm);
    setAlertMessage('Pengaturan kejuaraan berhasil disimpan dan disinkronkan ke seluruh stasiun!');
  };

  // Cut-off & Bracket Generation
  const handleRunCutoff = () => {
    const arenaMatches = matches.filter(m => m.arena_code === selectedArenaConsole);
    const result = processCutoffAndGenerateFinals(arenaMatches, 300);
    if (result.advancedMatches.length === 0) {
      setAlertMessage('Belum ada partai penyisihan dengan skor selesai untuk diproses cut-off.');
      return;
    }
    dbService.addMatches(result.advancedMatches);
    setAlertMessage(`Berhasil memproses Cut-Off! ${result.advancedMatches.length} atlet lolos ke babak Final dengan urutan nilai terkecil ke terbesar.`);
  };

  // Queue Athlete to Arena Match
  const handleQueueAthlete = (athlete: Athlete, arena: 'A' | 'B' | 'C') => {
    const arenaMatches = matches.filter(m => m.arena_code === arena);
    const baseNumber = arena === 'A' ? 100 : arena === 'B' ? 200 : 300;
    const maxMatchNum = arenaMatches.reduce((max, m) => Math.max(max, m.match_number), baseNumber);
    const newMatchNum = maxMatchNum + 1;

    const newMatch: Match = {
      id: `match-${Date.now()}-${athlete.id}`,
      match_number: newMatchNum,
      arena_code: arena,
      athlete_id: athlete.id,
      athlete,
      category_name: athlete.category_name,
      category_type: athlete.category_type,
      level: athlete.level,
      participation_type: athlete.participation_type,
      round: athlete.level === 'pemula' ? 'final' : 'penyisihan',
      forms_count: athlete.category_type === 'speed_kick' ? 1 : settings.forms_count,
      poomsae_1: athlete.category_type === 'speed_kick' ? 'Speed Kicking 60 Detik' : 'Taegeuk 1 Jang',
      poomsae_2: (athlete.category_type === 'speed_kick' || settings.forms_count === 1) ? null : 'Taegeuk 2 Jang',
      active_form: 1,
      status: 'menunggu',
      is_current: false,
      operator_notes: `Dijadwalkan oleh Admin`,
      final_score: null,
      scores: { form1_scores: {}, form2_scores: {} },
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbService.addMatches([newMatch]);
    setAlertMessage(`Atlet "${athlete.name}" berhasil dimasukkan ke antrean Partai #${newMatchNum} Lapangan ${arena}!`);
  };

  // Group Pemula / Festival Athletes into Pools of 3
  const handleGeneratePemulaPools = () => {
    const pemulaAthletes = athletes.filter(a => a.level === 'pemula' || a.category_type === 'festival');
    if (pemulaAthletes.length === 0) {
      setAlertMessage('Tidak ditemukan atlet berkategori Festival atau tingkatan Pemula.');
      return;
    }
    const groups = groupPemulaAthletes(pemulaAthletes);
    setPemulaGroups(groups);
    setAlertMessage(`Berhasil membentuk ${groups.length} pool grup untuk ${pemulaAthletes.length} atlet Pemula/Festival!`);
  };

  // Schedule all Pemula groups into Arena matches
  const handleSchedulePemulaPools = (targetArena: 'A' | 'B' | 'C') => {
    if (pemulaGroups.length === 0) return;
    const baseNumber = targetArena === 'A' ? 100 : targetArena === 'B' ? 200 : 300;
    const arenaMatches = matches.filter(m => m.arena_code === targetArena);
    let currentNum = arenaMatches.reduce((max, m) => Math.max(max, m.match_number), baseNumber);

    const newMatches: Match[] = [];
    pemulaGroups.forEach(grp => {
      grp.athletes.forEach(ath => {
        currentNum++;
        newMatches.push({
          id: `match-pemula-${grp.groupName}-${ath.id}-${Date.now()}`,
          match_number: currentNum,
          arena_code: targetArena,
          athlete_id: ath.id,
          athlete: ath,
          category_name: ath.category_name,
          category_type: ath.category_type,
          level: ath.level,
          participation_type: ath.participation_type,
          round: 'final',
          forms_count: ath.category_type === 'speed_kick' ? 1 : settings.forms_count,
          poomsae_1: ath.category_type === 'speed_kick' ? 'Speed Kicking 60 Detik' : 'Taegeuk 1 Jang',
          poomsae_2: null,
          active_form: 1,
          status: 'menunggu',
          is_current: false,
          operator_notes: `${grp.groupName} - Perebutan Medali`,
          final_score: null,
          scores: { form1_scores: {}, form2_scores: {} },
          started_at: null,
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
    });

    dbService.addMatches(newMatches);
    setAlertMessage(`Berhasil menjadwalkan ${newMatches.length} partai untuk seluruh grup Pemula ke Lapangan ${targetArena}!`);
  };

  // Filtered queries
  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(searchAthlete.toLowerCase()) ||
    (a.contingent && a.contingent.toLowerCase().includes(searchAthlete.toLowerCase())) ||
    (a.athlete2_name && a.athlete2_name.toLowerCase().includes(searchAthlete.toLowerCase()))
  );

  const filteredJudges = judges.filter(j =>
    j.name.toLowerCase().includes(searchJudge.toLowerCase()) ||
    j.judge_code.toLowerCase().includes(searchJudge.toLowerCase())
  );

  // Active match for Match Console
  const currentArenaMatch = matches.find(m => m.arena_code === selectedArenaConsole && m.is_current) ||
                            matches.find(m => m.arena_code === selectedArenaConsole);

  return (
    <AdminLayout role="admin" title="Pusat Kendali Turnamen: PBTI Poomsae & Speed Kicking">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200">
          {[
            { id: 'console', label: '1. Match Console', icon: Activity },
            { id: 'settings', label: '2. Pengaturan Sistem', icon: Settings },
            { id: 'verifikasi', label: '3. Data & Verifikasi Atlet', icon: Shield },
            { id: 'wasit', label: '4. Master Wasit & User', icon: Database },
            { id: 'bracket', label: '5. Bagan, Cut-Off & Jadwal', icon: GitBranch },
            { id: 'rekap', label: '6. Klasemen & Rekapitulasi', icon: BarChart3 },
            { id: 'reset', label: '7. Reset Turnamen', icon: RotateCcw, danger: true },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? (item.danger ? 'bg-red-800 text-white shadow-sm' : 'bg-[#C8102E] text-white shadow-sm')
                    : (item.danger ? 'bg-white text-red-600 hover:bg-red-50 border border-red-200' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200')
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Notification */}
        {alertMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{alertMessage}</span>
            </div>
            <button onClick={() => setAlertMessage('')} className="text-emerald-700 hover:text-emerald-900 font-bold">Tutup</button>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: MATCH CONSOLE */}
        {/* ============================================================ */}
        {activeTab === 'console' && (
          <div className="space-y-6">
            {/* Arena Selector */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase">Pilih Arena Pemantauan:</span>
                {(['A', 'B', 'C'] as const).map(code => (
                  <button
                    key={code}
                    onClick={() => setSelectedArenaConsole(code)}
                    className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      selectedArenaConsole === code ? 'bg-[#C8102E] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Lapangan {code}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsRecapOpen(true)}
                  className="text-xs font-bold gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Buka Rekap Skor
                </Button>
                <Link href={`/media?arena=${selectedArenaConsole}`} target="_blank">
                  <Button variant="default" size="sm" className="text-xs font-bold gap-1.5 bg-[#C8102E] hover:bg-[#9B0C23]">
                    <Monitor className="w-4 h-4" /> Buka Layar Media Lap. {selectedArenaConsole}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Active Match Card */}
            {currentArenaMatch ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-t-4 border-t-[#C8102E]">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                        <CardTitle className="text-base">Partai Aktif: Lapangan {selectedArenaConsole}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">Partai #{currentArenaMatch.match_number} • {currentArenaMatch.category_name}</CardDescription>
                    </div>
                    <Badge variant={currentArenaMatch.status === 'aktif' ? 'default' : 'secondary'} className="text-xs">
                      STATUS: {currentArenaMatch.status.toUpperCase()}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-black text-gray-900">{currentArenaMatch.athlete?.name}</h4>
                        {currentArenaMatch.athlete?.athlete2_name && (
                          <p className="text-sm font-bold text-rose-700">& {currentArenaMatch.athlete.athlete2_name} (Pair)</p>
                        )}
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">
                          {currentArenaMatch.athlete?.contingent} • {currentArenaMatch.round.toUpperCase()} ({currentArenaMatch.level.toUpperCase()})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Skor Saat Ini</span>
                        <div className="text-3xl font-mono font-black text-[#C8102E]">
                          {currentArenaMatch.final_score !== null && currentArenaMatch.final_score !== undefined
                            ? currentArenaMatch.final_score.toFixed(3)
                            : (currentArenaMatch.speed_kick_total_points ? `${currentArenaMatch.speed_kick_total_points} Pts` : '-')}
                        </div>
                      </div>
                    </div>

                    {/* YouTube Video Preview */}
                    <div>
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                        <Video className="w-3.5 h-3.5 text-red-600" /> Video Rekaman YouTube
                      </span>
                      <div className="w-full h-56 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                        {currentArenaMatch.athlete?.youtube_url ? (
                          <iframe 
                            className="w-full h-full"
                            src={getYouTubeEmbedUrl(currentArenaMatch.athlete.youtube_url) || ''}
                            title="Video Atlet"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">Link YouTube belum tersedia</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Arena Match Queue */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Antrean Lapangan {selectedArenaConsole}</CardTitle>
                    <CardDescription className="text-xs">Klik untuk mengaktifkan partai</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[380px] overflow-y-auto">
                    {matches.filter(m => m.arena_code === selectedArenaConsole).map(m => (
                      <div
                        key={m.id}
                        onClick={() => dbService.setActiveMatch(m.id, selectedArenaConsole)}
                        className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          m.is_current 
                            ? 'bg-red-50/80 border-[#C8102E] shadow-xs' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">#{m.match_number}</span>
                          <Badge variant={m.status === 'selesai' ? 'success' : m.status === 'aktif' ? 'default' : 'secondary'} className="text-[9px]">
                            {m.status}
                          </Badge>
                        </div>
                        <p className="font-black text-gray-900">{m.athlete?.name}</p>
                        <p className="text-[10px] text-gray-500">{m.category_name}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 text-xs">
                Tidak ada data partai di Lapangan {selectedArenaConsole}.
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: PENGATURAN SISTEM (SETTINGS) */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <Card className="border-t-4 border-t-[#C8102E]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#C8102E]" />
                Pengaturan Konfigurasi Kejuaraan & Aturan Pertandingan
              </CardTitle>
              <CardDescription className="text-xs">
                Ubah parameter turnamen, konfigurasi juri 3+1 atau 5+1, jumlah gerakan, nama lapangan, dan poin speed kick.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama Resmi Kejuaraan</label>
                    <Input 
                      value={settingsForm.name} 
                      onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })} 
                      required 
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Lokasi Pertandingan / Venue</label>
                    <Input 
                      value={settingsForm.location || ''} 
                      onChange={e => setSettingsForm({ ...settingsForm, location: e.target.value })} 
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Konfigurasi Juri Per Sesi</label>
                    <select
                      value={settingsForm.judges_per_session}
                      onChange={e => setSettingsForm({ ...settingsForm, judges_per_session: parseInt(e.target.value) })}
                      className="w-full h-10 rounded-lg border border-gray-200 px-3 bg-white text-xs font-bold"
                    >
                      <option value={3}>3 Juri (+1 Cadangan) [Default Standar]</option>
                      <option value={5}>5 Juri (+1 Cadangan) [Cut-Off High/Low]</option>
                    </select>
                    <p className="text-[11px] text-gray-500 mt-1">Default resmi WT: 3+1 juri.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Gerakan Poomsae</label>
                    <select
                      value={settingsForm.forms_count}
                      onChange={e => setSettingsForm({ ...settingsForm, forms_count: parseInt(e.target.value) })}
                      className="w-full h-10 rounded-lg border border-gray-200 px-3 bg-white text-xs font-bold"
                    >
                      <option value={1}>1 Gerakan (Nilai Tunggal)</option>
                      <option value={2}>2 Gerakan (Rata-rata 2 Form) [Default]</option>
                    </select>
                    <p className="text-[11px] text-gray-500 mt-1">Penilaian babak resmi.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Lapangan Aktif</label>
                    <select
                      value={settingsForm.arena_count}
                      onChange={e => setSettingsForm({ ...settingsForm, arena_count: parseInt(e.target.value) })}
                      className="w-full h-10 rounded-lg border border-gray-200 px-3 bg-white text-xs font-bold"
                    >
                      <option value={2}>2 Lapangan (A, B)</option>
                      <option value={3}>3 Lapangan (A, B, C) [Default]</option>
                      <option value={4}>4 Lapangan (A, B, C, D)</option>
                    </select>
                    <p className="text-[11px] text-gray-500 mt-1">Jumlah arena tatami.</p>
                  </div>
                </div>

                {/* Speed Kick Parameters */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                  <h4 className="text-xs font-black text-amber-900 uppercase">Parameter Poin Speed Kicking On Target:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Poin Tendangan Badan (Momtong)</label>
                      <Input 
                        type="number" 
                        step="0.5" 
                        value={settingsForm.speed_kick_body_point} 
                        onChange={e => setSettingsForm({ ...settingsForm, speed_kick_body_point: parseFloat(e.target.value) })} 
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Poin Tendangan Kepala (Eolgul)</label>
                      <Input 
                        type="number" 
                        step="0.5" 
                        value={settingsForm.speed_kick_head_point} 
                        onChange={e => setSettingsForm({ ...settingsForm, speed_kick_head_point: parseFloat(e.target.value) })} 
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Poin Kepala Putar (Dwi Chagi)</label>
                      <Input 
                        type="number" 
                        step="0.5" 
                        value={settingsForm.speed_kick_spin_head_point} 
                        onChange={e => setSettingsForm({ ...settingsForm, speed_kick_spin_head_point: parseFloat(e.target.value) })} 
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="submit" className="text-xs font-bold bg-[#C8102E] hover:bg-[#9B0C23]">
                    <Save className="w-4 h-4 mr-1.5" /> Simpan Perubahan Pengaturan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ============================================================ */}
        {/* TAB 3: DATA & VERIFIKASI ATLET */}
        {/* ============================================================ */}
        {activeTab === 'verifikasi' && (
          <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
              <div className="relative flex-1 max-w-sm">
                <Input
                  icon={<Search className="w-4 h-4 text-gray-400" />}
                  placeholder="Cari atlet, partner pair, kontingen..."
                  value={searchAthlete}
                  onChange={e => setSearchAthlete(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsImportOpen(true)}
                  className="text-xs font-bold gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Upload className="w-4 h-4 text-blue-600" /> Import Atlet dari Excel / CSV
                </Button>
              </div>
            </div>

            {/* Athlete Registration Form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Registrasi Atlet Baru (Individu / Pair 2 Atlet)</CardTitle>
                <CardDescription className="text-xs">
                  Dukung kategori Prestasi, Festival (Pemula), Speed Kicking, serta format Pair (1 tim = 2 nama atlet).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAthlete} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Nama Atlet 1</label>
                    <Input 
                      placeholder="Contoh: Ahmad Zaki Kurniawan" 
                      value={newAthlete.name} 
                      onChange={e => setNewAthlete({ ...newAthlete, name: e.target.value })} 
                      required 
                      className="text-xs h-9"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Partisipasi</label>
                    <select
                      value={newAthlete.participation_type}
                      onChange={e => setNewAthlete({ ...newAthlete, participation_type: e.target.value as any })}
                      className="w-full h-9 rounded-lg border border-gray-200 px-2.5 bg-white text-xs font-bold"
                    >
                      <option value="individu">Individu (1 Orang)</option>
                      <option value="pair">Pair (Berpasangan 2 Orang)</option>
                    </select>
                  </div>

                  {newAthlete.participation_type === 'pair' && (
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-rose-700 mb-1">Nama Atlet 2 (Partner Pair)</label>
                      <Input 
                        placeholder="Contoh: Siti Aisyah" 
                        value={newAthlete.athlete2_name} 
                        onChange={e => setNewAthlete({ ...newAthlete, athlete2_name: e.target.value })} 
                        required 
                        className="text-xs h-9 border-rose-200 bg-rose-50/30"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                    <select
                      value={newAthlete.category_type}
                      onChange={e => setNewAthlete({ ...newAthlete, category_type: e.target.value as any })}
                      className="w-full h-9 rounded-lg border border-gray-200 px-2.5 bg-white text-xs font-bold"
                    >
                      <option value="prestasi">Prestasi</option>
                      <option value="festival">Festival</option>
                      <option value="speed_kick">Speed Kicking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tingkatan Atlet</label>
                    <select
                      value={newAthlete.level}
                      onChange={e => setNewAthlete({ ...newAthlete, level: e.target.value as any })}
                      className="w-full h-9 rounded-lg border border-gray-200 px-2.5 bg-white text-xs font-bold"
                    >
                      <option value="prestasi">Prestasi</option>
                      <option value="pemula">Pemula</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Kontingen / Dojang</label>
                    <Input 
                      placeholder="Pengprov DKI / Dojang Garuda" 
                      value={newAthlete.contingent} 
                      onChange={e => setNewAthlete({ ...newAthlete, contingent: e.target.value })} 
                      className="text-xs h-9"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Provinsi</label>
                    <Input 
                      placeholder="DKI Jakarta" 
                      value={newAthlete.province} 
                      onChange={e => setNewAthlete({ ...newAthlete, province: e.target.value })} 
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Tautan YouTube Peserta</label>
                    <Input 
                      placeholder="https://youtube.com/watch?v=..." 
                      value={newAthlete.youtube_url} 
                      onChange={e => setNewAthlete({ ...newAthlete, youtube_url: e.target.value })} 
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button type="submit" size="sm" className="w-full h-9 text-xs font-bold bg-[#C8102E] hover:bg-[#9B0C23]">
                      <Plus className="w-4 h-4 mr-1" /> Daftarkan Atlet
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Athletes Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-3">Nama Atlet</th>
                      <th className="py-3 px-3">Kategori</th>
                      <th className="py-3 px-3">Tingkatan</th>
                      <th className="py-3 px-3">Kontingen</th>
                      <th className="py-3 px-3">Tautan YouTube</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Aksi Verifikasi</th>
                      <th className="py-3 px-3 text-center">Antrean Lapangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAthletes.map((a, idx) => (
                      <tr key={a.id} className="hover:bg-gray-50/70">
                        <td className="py-3 px-3 font-semibold text-gray-500">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-900">{a.name}</div>
                          {a.athlete2_name && (
                            <div className="text-[11px] font-semibold text-rose-600">
                              & {a.athlete2_name} <span className="text-[9px] bg-rose-50 px-1 rounded">(Pair)</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-[10px] uppercase">{a.category_type}</Badge>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="secondary" className="text-[10px] uppercase">{a.level}</Badge>
                        </td>
                        <td className="py-3 px-3 text-gray-600">{a.contingent} ({a.province})</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Input 
                              defaultValue={a.youtube_url || ''} 
                              onBlur={e => {
                                if (e.target.value !== a.youtube_url) {
                                  handleUpdateYouTubeUrl(a.id, e.target.value);
                                }
                              }}
                              placeholder="Tempel link YouTube..."
                              className="text-[11px] h-7 w-48 font-mono"
                            />
                            {a.youtube_url && (
                              <a href={a.youtube_url} target="_blank" rel="noreferrer" className="text-red-600 hover:text-red-800">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={a.verification_status === 'terverifikasi' ? 'success' : a.verification_status === 'ditolak' ? 'destructive' : 'warning'} className="text-[10px]">
                            {a.verification_status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleVerifyAthlete(a.id, 'terverifikasi')}
                              className="h-7 text-[10px] text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                            >
                              Setujui
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleVerifyAthlete(a.id, 'ditolak')}
                              className="h-7 text-[10px] text-rose-700 hover:bg-rose-50 border-rose-300"
                            >
                              Tolak
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <select
                              value={selectedQueueArena[a.id] || 'A'}
                              onChange={(e) => setSelectedQueueArena({ ...selectedQueueArena, [a.id]: e.target.value as any })}
                              className="h-7 text-[11px] font-bold rounded border border-gray-200 px-1 bg-white"
                            >
                              <option value="A">Lap A</option>
                              <option value="B">Lap B</option>
                              <option value="C">Lap C</option>
                            </select>
                            <Button
                              size="sm"
                              disabled={a.verification_status === 'ditolak'}
                              onClick={() => handleQueueAthlete(a, selectedQueueArena[a.id] || 'A')}
                              className="h-7 text-[10px] font-bold bg-[#C8102E] hover:bg-[#9B0C23] text-white"
                            >
                              + Antrekan
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: MASTER WASIT & USER */}
        {/* ============================================================ */}
        {activeTab === 'wasit' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Judge Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Tambah Master Juri Baru</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateJudge} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Nama Lengkap Juri</label>
                      <Input 
                        placeholder="Contoh: Sabeum Eko Prasetyo" 
                        value={newJudge.name} 
                        onChange={e => setNewJudge({ ...newJudge, name: e.target.value })} 
                        required 
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Kode Juri</label>
                        <Input 
                          placeholder="J-2025-007" 
                          value={newJudge.judge_code} 
                          onChange={e => setNewJudge({ ...newJudge, judge_code: e.target.value })} 
                          required 
                          className="text-xs h-9 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">PIN 6 Digit</label>
                        <Input 
                          type="password"
                          maxLength={6}
                          placeholder="123456" 
                          value={newJudge.pin} 
                          onChange={e => setNewJudge({ ...newJudge, pin: e.target.value })} 
                          required 
                          className="text-xs h-9 font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Penugasan Arena</label>
                        <select
                          value={newJudge.assigned_arena}
                          onChange={e => setNewJudge({ ...newJudge, assigned_arena: e.target.value })}
                          className="w-full h-9 rounded-lg border border-gray-200 px-2.5 bg-white text-xs font-bold"
                        >
                          <option value="A">Lapangan A</option>
                          <option value="B">Lapangan B</option>
                          <option value="C">Lapangan C</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Posisi Meja</label>
                        <select
                          value={newJudge.position}
                          onChange={e => setNewJudge({ ...newJudge, position: e.target.value as any })}
                          className="w-full h-9 rounded-lg border border-gray-200 px-2.5 bg-white text-xs font-bold"
                        >
                          <option value="J1">Juri 1 (J1)</option>
                          <option value="J2">Juri 2 (J2)</option>
                          <option value="J3">Juri 3 (J3)</option>
                          <option value="J4">Juri 4 (J4)</option>
                          <option value="J5">Juri 5 (J5)</option>
                          <option value="cadangan">Juri Cadangan</option>
                        </select>
                      </div>
                    </div>
                    <Button type="submit" size="sm" className="w-full h-9 text-xs font-bold bg-[#C8102E] hover:bg-[#9B0C23]">
                      <Plus className="w-4 h-4 mr-1" /> Simpan Juri
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Add Master User Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Tambah Master Petugas / User</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Nama Petugas</label>
                      <Input 
                        placeholder="Contoh: Operator Arena B" 
                        value={newUser.name} 
                        onChange={e => setNewUser({ ...newUser, name: e.target.value })} 
                        required 
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Username</label>
                        <Input 
                          placeholder="operator_b" 
                          value={newUser.username} 
                          onChange={e => setNewUser({ ...newUser, username: e.target.value })} 
                          required 
                          className="text-xs h-9"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">PIN / Password</label>
                        <Input 
                          type="password"
                          placeholder="op1234" 
                          value={newUser.pin} 
                          onChange={e => setNewUser({ ...newUser, pin: e.target.value })} 
                          required 
                          className="text-xs h-9"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Hak Akses (Role)</label>
                        <select
                          value={newUser.role}
                          onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                          className="w-full h-9 rounded-lg border border-gray-200 px-2.5 bg-white text-xs font-bold"
                        >
                          <option value="operator">Operator Lapangan</option>
                          <option value="admin">Admin Kejuaraan</option>
                          <option value="media">Display Media / Proyektor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Arena Penugasan</label>
                        <select
                          value={newUser.assigned_arena}
                          onChange={e => setNewUser({ ...newUser, assigned_arena: e.target.value })}
                          className="w-full h-9 rounded-lg border border-gray-200 px-2.5 bg-white text-xs font-bold"
                        >
                          <option value="A">Lapangan A</option>
                          <option value="B">Lapangan B</option>
                          <option value="C">Lapangan C</option>
                        </select>
                      </div>
                    </div>
                    <Button type="submit" size="sm" className="w-full h-9 text-xs font-bold bg-gray-900 hover:bg-black">
                      <Plus className="w-4 h-4 mr-1" /> Simpan User
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Judges List Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daftar Wasit & Juri Terdaftar</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Kode</th>
                      <th className="py-2.5 px-3">Nama Wasit</th>
                      <th className="py-2.5 px-3">Sertifikasi & Lembaga</th>
                      <th className="py-2.5 px-3">Arena</th>
                      <th className="py-2.5 px-3">Posisi</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredJudges.map(j => (
                      <tr key={j.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{j.judge_code}</td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{j.name}</td>
                        <td className="py-2.5 px-3 text-gray-600">{j.rank} • {j.organization}</td>
                        <td className="py-2.5 px-3">Lapangan {j.assigned_arena}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={j.is_backup ? 'warning' : 'default'} className="text-[10px]">
                            {j.position}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ONLINE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: BAGAN, CUT-OFF & JADWAL */}
        {/* ============================================================ */}
        {activeTab === 'bracket' && (
          <div className="space-y-6">
            <Card className="border-t-4 border-t-amber-500">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-amber-500" />
                  Manajemen Bagan Turnamen, Logika Cut-Off & Pengelompokan Pemula
                </CardTitle>
                <CardDescription className="text-xs">
                  Sesuai spesifikasi WT: ≤8 atlet langsung babak final. &gt;8 atlet melalui penyisihan lalu top 8 masuk final dengan urutan nilai terkecil ke terbesar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="font-black text-sm text-amber-950">Jalankan Otomatisasi Cut-Off Babak Final</h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Sistem akan mengambil 8 atlet dengan nilai tertinggi dari babak penyisihan di Lapangan {selectedArenaConsole}, lalu membentuk partai final yang diurutkan dari nilai terkecil ke terbesar.
                    </p>
                  </div>
                  <Button 
                    onClick={handleRunCutoff} 
                    className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Award className="w-4 h-4 mr-1.5" /> Proses 8 Besar Final Lapangan {selectedArenaConsole}
                  </Button>
                </div>

                {/* Pemula Grouping Section */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-black text-sm text-emerald-950">Pengelompokan Otomatis Kategori Pemula (Pool 3 Orang)</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Sesuai spesifikasi, atlet Festival/Pemula dikelompokkan per 3 orang. Semua atlet dalam grup berhak memperoleh medali (Emas, Perak, Perunggu).
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleGeneratePemulaPools}
                        className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        <Users className="w-4 h-4 mr-1.5" /> Bentuk Pool Pemula
                      </Button>
                    </div>
                  </div>

                  {pemulaGroups.length > 0 && (
                    <div className="space-y-4 pt-2 border-t border-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900">
                          Terbentuk {pemulaGroups.length} Pool Grup:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-800 font-medium">Jadwalkan ke:</span>
                          {(['A', 'B', 'C'] as const).map(ar => (
                            <Button
                              key={ar}
                              size="sm"
                              variant="outline"
                              onClick={() => handleSchedulePemulaPools(ar)}
                              className="h-7 text-xs font-bold bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                            >
                              Lap {ar}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pemulaGroups.map((grp, gIdx) => (
                          <div key={gIdx} className="bg-white rounded-xl p-3 border border-emerald-100 shadow-xs space-y-2">
                            <div className="font-black text-xs text-emerald-900 pb-1 border-b border-gray-100 flex items-center justify-between">
                              <span>{grp.groupName}</span>
                              <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                {grp.athletes.length} Atlet
                              </Badge>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              {grp.athletes.map((ath, aIdx) => {
                                const medalInfo = determinePemulaMedal(aIdx + 1);
                                return (
                                  <div key={ath.id} className="flex items-center justify-between bg-gray-50 p-1.5 rounded-lg">
                                    <div className="min-w-0 pr-2">
                                      <div className="font-bold text-gray-900 truncate">{ath.name}</div>
                                      <div className="text-[10px] text-gray-500 truncate">{ath.contingent}</div>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border shrink-0 ${medalInfo.color}`}>
                                      {medalInfo.medal}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: KLASEMEN & REKAPITULASI */}
        {/* ============================================================ */}
        {activeTab === 'rekap' && (
          <div className="space-y-6">
            <Card className="border-t-4 border-t-emerald-600">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-600" />
                      Klasemen Live & Rekapitulasi Kejuaraan
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Peringkat atlet terkini, cetak lembar nilai resmi bertanda tangan, dan ekspor CSV/Excel.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setIsRecapOpen(true)}
                      className="text-xs font-bold bg-[#C8102E] hover:bg-[#9B0C23] gap-2 px-4 h-9 text-white"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Buka Modal Rekap & Ekspor
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Partai</th>
                        <th className="py-2.5 px-3">Nama Atlet</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3 text-center">Form 1</th>
                        <th className="py-2.5 px-3 text-center">Form 2</th>
                        <th className="py-2.5 px-3 text-center">Skor Akhir</th>
                        <th className="py-2.5 px-3 text-center">Medali</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...matches].filter(m => (m.final_score ?? 0) > 0).sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0)).map((m, idx) => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="py-3 px-3 font-black text-sm">
                            {idx === 0 && <span className="text-amber-500">🥇 1</span>}
                            {idx === 1 && <span className="text-slate-400">🥈 2</span>}
                            {idx === 2 && <span className="text-amber-700">🥉 3</span>}
                            {idx > 2 && idx + 1}
                          </td>
                          <td className="py-3 px-3 font-bold">#{m.match_number} (Lap {m.arena_code})</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-gray-900">{m.athlete?.name}</div>
                            {m.athlete?.athlete2_name && (
                              <div className="text-[11px] font-semibold text-rose-600">& {m.athlete.athlete2_name} (Pair)</div>
                            )}
                            <div className="text-[10px] text-gray-500">{m.athlete?.contingent}</div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-700">{m.category_name}</td>
                          <td className="py-3 px-3 text-center font-mono">
                            {m.form1_final_score !== null && m.form1_final_score !== undefined ? m.form1_final_score.toFixed(3) : '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {m.form2_final_score !== null && m.form2_final_score !== undefined ? m.form2_final_score.toFixed(3) : '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-black text-sm text-[#C8102E]">
                            {m.final_score !== null && m.final_score !== undefined ? m.final_score.toFixed(3) : '-'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {idx === 0 && <Badge variant="default" className="bg-amber-400 text-amber-950 font-bold text-[10px]">EMAS</Badge>}
                            {idx === 1 && <Badge variant="secondary" className="font-bold text-[10px]">PERAK</Badge>}
                            {idx === 2 && <Badge variant="outline" className="border-amber-700 text-amber-800 font-bold text-[10px]">PERUNGGU</Badge>}
                            {idx > 2 && <span className="text-gray-400 text-[10px]">-</span>}
                          </td>
                        </tr>
                      ))}
                      {[...matches].filter(m => (m.final_score ?? 0) > 0).length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-400 italic">
                            Belum ada skor pertandingan yang masuk.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 8: RESET TURNAMEN */}
        {/* ============================================================ */}
        {activeTab === 'reset' && (
          <Card className="border-red-300">
            <CardHeader className="bg-red-50/50 rounded-t-xl">
              <CardTitle className="text-base text-red-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Zona Berbahaya: Reset Data Turnamen
              </CardTitle>
              <CardDescription className="text-xs text-red-700">
                Tindakan ini akan mengembalikan seluruh status skor pertandingan ke nol.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-2">
                <p className="font-bold">Ketik teks konfirmasi berikut untuk mereset seluruh skor:</p>
                <p className="font-mono bg-white p-2 rounded border border-red-300 font-black">RESET TURNAMEN SEKARANG</p>
                <Input
                  value={resetInput}
                  onChange={(e) => setResetInput(e.target.value)}
                  placeholder="Ketik teks konfirmasi di sini..."
                  className="bg-white text-xs"
                />
              </div>

              <Button
                variant="destructive"
                disabled={resetInput !== 'RESET TURNAMEN SEKARANG'}
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full text-xs font-bold"
              >
                Reset Seluruh Skor Turnamen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recap Modal */}
      <RecapModal 
        isOpen={isRecapOpen} 
        onClose={() => setIsRecapOpen(false)} 
        matches={matches} 
        settings={settings} 
      />

      {/* Import Athletes Modal */}
      <ImportAthletesModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onSuccess={(count) => setAlertMessage(`Berhasil mengimpor ${count} atlet ke database!`)} 
      />
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-gray-500">Memuat Pusat Kendali Admin...</div>}>
      <AdminContent />
    </Suspense>
  );
}
