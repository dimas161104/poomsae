'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, Users, Calendar, Shield, Settings, 
  Database, PlaySquare, CheckCircle, XCircle, AlertTriangle, 
  RotateCcw, Download, Plus, Trash2, Edit, Save, RefreshCw,
  Video, Eye, Filter, ArrowRight, UserCheck, UserX, Award, Activity,
  GitBranch, Monitor, BarChart3, Search, Play, Pause, Clock, ExternalLink
} from 'lucide-react';
import { AdminLayout } from '@/components/shared/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { TournamentSettings, Athlete, Judge, Category, User, Arena, Match, Schedule } from '@/types/database';
import { formatScore, getInitials } from '@/lib/utils';

function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as any;

  const [activeTab, setActiveTab] = useState<'console' | 'wasit' | 'jadwal' | 'verifikasi' | 'bracket' | 'lcd' | 'klasemen' | 'reset'>(
    tabParam || 'console'
  );

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 1. Settings State
  const [settings, setSettings] = useState<TournamentSettings>({
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Kejuaraan Nasional Taekwondo Poomsae 2025',
    arena_count: 3,
    arena_format: 'huruf',
    judges_per_session: 5,
    has_backup_judge: true,
    forms_count: 2,
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
    max_total_score: 10.00,
    cutoff_high_low: true,
    tiebreak_method: 'presentation',
    location: 'GOR Cakrawala Ciracas, Jakarta Timur',
    start_date: '2025-10-18',
    end_date: '2025-10-20',
    organizer: 'Federasi Taekwondo Indonesia (PBTI)',
    created_at: '',
    updated_at: ''
  });

  // 2. Master Wasit / Juri State
  const [judges, setJudges] = useState<Judge[]>([
    { id: '1', name: 'Master Bambang Suryanto', judge_code: 'J-2025-001', pin: '142536', rank: 'Wasit Nasional Utama', organization: 'PBTI Pusat', status: 'active', is_online: true, last_ping: null, created_at: '', updated_at: '' },
    { id: '2', name: 'Sabeum Liem Wen', judge_code: 'J-2025-002', pin: '253647', rank: 'Wasit Nasional Madya', organization: 'Pengprov DKI', status: 'active', is_online: true, last_ping: null, created_at: '', updated_at: '' },
    { id: '3', name: 'Master Eko Prasetyo', judge_code: 'J-2025-003', pin: '364758', rank: 'Wasit Nasional Madya', organization: 'Pengprov DKI', status: 'active', is_online: true, last_ping: null, created_at: '', updated_at: '' },
    { id: '4', name: 'Sabeum Nuraini Dewi', judge_code: 'J-2025-004', pin: '475869', rank: 'Wasit Nasional Muda', organization: 'Pengcab Jabar', status: 'active', is_online: true, last_ping: null, created_at: '', updated_at: '' },
    { id: '5', name: 'Sabeumnim Hendra Cahyadi', judge_code: 'J-2025-005', pin: '586970', rank: 'Wasit Nasional Madya', organization: 'Pengprov Jateng', status: 'active', is_online: true, last_ping: null, created_at: '', updated_at: '' },
  ]);
  const [searchJudge, setSearchJudge] = useState('');
  const [newJudge, setNewJudge] = useState({ name: '', judge_code: '', pin: '', rank: 'Wasit Nasional Madya', organization: '' });

  // 3. Poomsae Forms & Schedules
  const [forms] = useState([
    { id: '1', name: 'Taegeuk 1 Jang', level: 'Dasar (Geup 8)', desc: 'Keon (Langit)' },
    { id: '2', name: 'Taegeuk 2 Jang', level: 'Dasar (Geup 7)', desc: 'Tae (Danau)' },
    { id: '3', name: 'Taegeuk 3 Jang', level: 'Dasar (Geup 6)', desc: 'Ri (Api)' },
    { id: '4', name: 'Taegeuk 4 Jang', level: 'Dasar (Geup 5)', desc: 'Jin (Guntur)' },
    { id: '5', name: 'Taegeuk 5 Jang', level: 'Menengah (Geup 4)', desc: 'Son (Angin)' },
    { id: '6', name: 'Taegeuk 6 Jang', level: 'Menengah (Geup 3)', desc: 'Gam (Air)' },
    { id: '7', name: 'Taegeuk 7 Jang', level: 'Lanjutan (Geup 2)', desc: 'Gan (Gunung)' },
    { id: '8', name: 'Taegeuk 8 Jang', level: 'Lanjutan (Geup 1)', desc: 'Gon (Bumi)' },
    { id: '9', name: 'Koryo', level: 'Dan I', desc: 'Poomsae Dan I' },
    { id: '10', name: 'Keumgang', level: 'Dan II', desc: 'Poomsae Dan II' },
    { id: '11', name: 'Taebaek', level: 'Dan III', desc: 'Poomsae Dan III' },
    { id: '12', name: 'Pyongwon', level: 'Dan IV', desc: 'Poomsae Dan IV' },
  ]);

  // 4. Athletes State
  const [athletes, setAthletes] = useState<Athlete[]>([
    { id: '1', name: 'Ahmad Zaki Kurniawan', initials: 'AZK', category_id: '1', type: 'prestasi', contingent: 'Pengprov DKI Jakarta', province: 'DKI Jakarta', age_group: 'Senior', gender: 'Putra', dan_level: 'Dan III', youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', verification_status: 'terverifikasi', verification_notes: '', created_at: '', updated_at: '' },
    { id: '2', name: 'Rayhan Bagus Pratama', initials: 'RBP', category_id: '1', type: 'prestasi', contingent: 'Pengcab Jawa Barat', province: 'Jawa Barat', age_group: 'Senior', gender: 'Putra', dan_level: 'Dan II', youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', verification_status: 'terverifikasi', verification_notes: '', created_at: '', updated_at: '' },
    { id: '3', name: 'Muhammad Dimas Satria', initials: 'MDS', category_id: '1', type: 'prestasi', contingent: 'Pengprov Jawa Tengah', province: 'Jawa Tengah', age_group: 'Senior', gender: 'Putra', dan_level: 'Dan II', youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', verification_status: 'terverifikasi', verification_notes: '', created_at: '', updated_at: '' },
    { id: '4', name: 'Rian Faturrahman', initials: 'RF', category_id: '2', type: 'pemula', contingent: 'Pengprov Jawa Timur', province: 'Jawa Timur', age_group: 'Junior', gender: 'Putra', dan_level: 'Dan I', youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', verification_status: 'menunggu', verification_notes: '', created_at: '', updated_at: '' },
    { id: '5', name: 'Maya Anggraini', initials: 'MA', category_id: '1', type: 'prestasi', contingent: 'Pengprov Bali', province: 'Bali', age_group: 'Senior', gender: 'Putri', dan_level: 'Dan II', youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', verification_status: 'menunggu', verification_notes: '', created_at: '', updated_at: '' },
    { id: '6', name: 'Dimas Hendrawan', initials: 'DH', category_id: '1', type: 'prestasi', contingent: 'Pengprov Sumut', province: 'Sumatera Utara', age_group: 'U-30', gender: 'Putra', dan_level: 'Dan III', youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', verification_status: 'menunggu', verification_notes: '', created_at: '', updated_at: '' },
  ]);
  const [newAthlete, setNewAthlete] = useState({ name: '', type: 'prestasi' as 'prestasi' | 'pemula' | 'speed_kick', contingent: '', province: '', gender: 'Putra' as 'Putra' | 'Putri', dan_level: 'Dan I', youtube_url: '' });

  // Reset Input
  const [resetInput, setResetInput] = useState('');

  // Actions
  const handleVerifyAthlete = (id: string, status: 'terverifikasi' | 'ditolak') => {
    setAthletes(prev => prev.map(a => a.id === id ? { ...a, verification_status: status } : a));
    setAlertMessage(`Status atlet berhasil diubah menjadi ${status.toUpperCase()}`);
  };

  const handleAddJudge = () => {
    if (!newJudge.name || !newJudge.judge_code) return;
    const j: Judge = {
      id: Date.now().toString(),
      name: newJudge.name,
      judge_code: newJudge.judge_code,
      pin: newJudge.pin || '123456',
      rank: newJudge.rank,
      organization: newJudge.organization || 'PBTI',
      status: 'active',
      is_online: true,
      last_ping: null,
      created_at: '',
      updated_at: ''
    };
    setJudges(prev => [...prev, j]);
    setNewJudge({ name: '', judge_code: '', pin: '', rank: 'Wasit Nasional Madya', organization: '' });
    setAlertMessage('Wasit baru berhasil ditambahkan ke database!');
  };

  const handleAddAthlete = () => {
    if (!newAthlete.name) return;
    const a: Athlete = {
      id: Date.now().toString(),
      name: newAthlete.name,
      initials: getInitials(newAthlete.name),
      category_id: '1',
      type: newAthlete.type,
      contingent: newAthlete.contingent,
      province: newAthlete.province,
      age_group: 'Senior',
      gender: newAthlete.gender,
      dan_level: newAthlete.dan_level,
      youtube_url: newAthlete.youtube_url,
      verification_status: 'menunggu',
      verification_notes: '',
      created_at: '',
      updated_at: ''
    };
    setAthletes(prev => [a, ...prev]);
    setNewAthlete({ name: '', type: 'prestasi', contingent: '', province: '', gender: 'Putra', dan_level: 'Dan I', youtube_url: '' });
    setAlertMessage('Pendaftaran atlet berhasil ditambahkan!');
  };

  const handleResetTournament = () => {
    if (resetInput !== 'RESET') return;
    setResetInput('');
    setAlertMessage('Turnamen berhasil di-reset ke kondisi awal!');
  };

  const filteredJudges = judges.filter(j => 
    j.name.toLowerCase().includes(searchJudge.toLowerCase()) || 
    j.judge_code.toLowerCase().includes(searchJudge.toLowerCase()) ||
    (j.organization && j.organization.toLowerCase().includes(searchJudge.toLowerCase()))
  );

  return (
    <AdminLayout role="admin" title="Pusat Kendali Turnamen: Kejurnas Poomsae 2025">
      <div className="space-y-6">
        {/* Navigation Tabs (8 Menus from Section 5 of Brief) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200">
          {[
            { id: 'console', label: '1. Match Console', icon: Activity },
            { id: 'wasit', label: '2. Database Wasit', icon: Database },
            { id: 'jadwal', label: '3. Jadwal & Gerakan', icon: Calendar },
            { id: 'verifikasi', label: '4. Verifikasi Atlet', icon: Shield },
            { id: 'bracket', label: '5. Cut-Off Bracket', icon: GitBranch },
            { id: 'lcd', label: '6. LCD Proyektor', icon: Monitor },
            { id: 'klasemen', label: '7. Klasemen Live', icon: BarChart3 },
            { id: 'reset', label: '8. Reset Turnamen', icon: RotateCcw, danger: true },
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
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{alertMessage}</span>
            </div>
            <button onClick={() => setAlertMessage('')} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer">Tutup</button>
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. MATCH CONSOLE (DASHBOARD) */}
        {/* ============================================================ */}
        {activeTab === 'console' && (
          <div className="space-y-6">
            {/* Top Bar Banner matching Screenshot 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="destructive" className="bg-[#C8102E] text-[10px] uppercase font-bold">
                    TURNAMEN TINGKAT NASIONAL
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Koneksi Stabil (Ping 18ms)
                  </span>
                </div>
                <h2 className="text-2xl font-black text-gray-900">Pusat Kendali Turnamen: Kejurnas Poomsae 2025</h2>
                <p className="text-xs text-gray-500 font-medium">Federasi Taekwondo Indonesia • Gelanggang Olahraga Remaja Senayan • Sesi 02 - Babak Eliminasi Utama</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setAlertMessage('Laporan Kejuaraan siap diunduh dalam format PDF.')} className="font-bold">
                  <Download className="h-4 w-4" /> Unduh Laporan Lengkap
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setAlertMessage('Semua partai di seluruh arena telah dijeda oleh Admin.')} className="font-bold bg-[#C8102E]">
                  Jeda Semua Partai
                </Button>
              </div>
            </div>

            {/* 4 Statistics Cards matching Screenshot 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase">TOTAL ATLET BERTANDING</p>
                      <h3 className="text-3xl font-black text-gray-900 mt-1">248 <span className="text-xs font-normal text-gray-500">Atlet</span></h3>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">✓ 14 Kategori Terdaftar Lengkap</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase">PARTAI SELESAI / TOTAL</p>
                      <h3 className="text-3xl font-black text-gray-900 mt-1">86 <span className="text-sm font-normal text-gray-400">/ 120</span></h3>
                      <p className="text-xs text-gray-500 font-semibold mt-1">Progress: 71.6% Sisa 34 Partai</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase">ARENA AKTIF</p>
                      <h3 className="text-3xl font-black text-gray-900 mt-1">3 <span className="text-xs font-normal text-gray-500">Ring Berjalan</span></h3>
                      <div className="flex gap-1.5 mt-2">
                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">Ring A</span>
                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">Ring B</span>
                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700">Ring C</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <PlaySquare className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase">JURI BERTUGAS</p>
                      <h3 className="text-3xl font-black text-gray-900 mt-1">15 <span className="text-xs font-normal text-gray-500">Juri Aktif</span></h3>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">● Semua Perangkat Tablet Online</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#C8102E]">
                      <Shield className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Match Control per Arena */}
            <Card className="border-t-4 border-t-[#C8102E]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                    Live Match Control
                  </CardTitle>
                  <CardDescription>Partai yang Sedang Berlangsung & Pemantauan Input Nilai Real-time</CardDescription>
                </div>
                <span className="text-xs text-gray-400 font-semibold">Update Otomatis Tiap 1 Detik</span>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Arena A */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="flex items-center gap-4 md:col-span-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#C8102E] text-white flex items-center justify-center font-black text-lg shadow-md flex-shrink-0">
                      A
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-[10px] bg-red-600 font-bold">PARTAI #42</Badge>
                        <span className="text-xs font-bold text-gray-700">Senior Putra Individual</span>
                        <Badge variant="success" className="text-[10px]">SEDANG DINILAI (LIVE)</Badge>
                      </div>
                      <h4 className="text-lg font-black text-gray-900 mt-1">Ahmad Zaki <span className="text-xs font-normal text-gray-500">• Pengprov DKI Jakarta</span></h4>
                      <p className="text-xs text-[#C8102E] font-bold">Wajib Poomsae: Koryo (Poomsae 9)</p>
                    </div>
                  </div>

                  <div className="text-center bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-500 flex justify-between font-bold px-2">
                      <span>AKURASI: 3.60</span>
                      <span>+</span>
                      <span>PRESENTASI: 4.85</span>
                    </div>
                    <div className="text-2xl font-black text-[#C8102E] mt-1">= 8.450</div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Link href="/juri">
                      <Button variant="outline" size="sm" className="font-bold">
                        Lihat Stasiun
                      </Button>
                    </Link>
                    <Button variant="default" size="sm" className="font-bold bg-[#C8102E]" onClick={() => setAlertMessage('Atlet berikutnya telah dipanggil ke tatami Arena A.')}>
                      Panggil Atlet Berikutnya
                    </Button>
                  </div>
                </div>

                {/* Arena B */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="flex items-center gap-4 md:col-span-2">
                    <div className="w-12 h-12 rounded-2xl bg-gray-700 text-white flex items-center justify-center font-black text-lg shadow-md flex-shrink-0">
                      B
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-bold">PARTAI #38</Badge>
                        <span className="text-xs font-bold text-gray-700">Junior Putri Individual</span>
                        <Badge variant="warning" className="text-[10px]">MENUNGGU SINYAL JURI</Badge>
                      </div>
                      <h4 className="text-lg font-black text-gray-900 mt-1">Siti Nurhaliza <span className="text-xs font-normal text-gray-500">• Pengcab Jawa Barat</span></h4>
                      <p className="text-xs text-[#C8102E] font-bold">Wajib Poomsae: Keumgang (Poomsae 10)</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200 italic">
                    Atlet telah di tatami, wasit tengah menyiapkan kesiapan 5 juri sudut.
                  </div>

                  <div className="flex items-center justify-end">
                    <Button variant="default" size="sm" className="font-bold bg-emerald-600 hover:bg-emerald-700" onClick={() => setAlertMessage('Waktu tampil Arena B telah dimulai!')}>
                      <Play className="h-4 w-4 mr-1" /> Mulai Waktu
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Row: Verifikasi Cepat & Status Wasit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Verifikasi Cepat */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#C8102E]" />
                      Verifikasi Cepat Atlet & Dokumen
                    </CardTitle>
                    <CardDescription>{athletes.filter(a => a.verification_status === 'menunggu').length} Atlet Menunggu Pemeriksaan Berkas</CardDescription>
                  </div>
                  <button onClick={() => setActiveTab('verifikasi')} className="text-xs font-bold text-[#C8102E] hover:underline cursor-pointer">
                    Lihat Semua ({athletes.length})
                  </button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {athletes.slice(0, 3).map((a) => (
                    <div key={a.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#C8102E] text-white flex items-center justify-center font-bold text-xs">
                          {a.initials}
                        </div>
                        <div>
                          <p className="font-black text-sm text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-500">{a.dan_level} • {a.contingent}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => handleVerifyAthlete(a.id, 'ditolak')}>Tolak</Button>
                        <Button size="sm" variant="default" className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleVerifyAthlete(a.id, 'terverifikasi')}>Setujui</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Status Wasit Arena A */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#C8102E]" />
                      Status Wasit: Arena A
                    </CardTitle>
                    <CardDescription>5 Stasiun Penilai Aktif Real-time</CardDescription>
                  </div>
                  <Badge variant="success" className="text-xs">100% SIAP</Badge>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {judges.slice(0, 5).map((j, idx) => (
                    <div key={j.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold bg-white px-2 py-0.5 rounded border text-gray-800">J{idx + 1}</span>
                        <span className="font-bold text-gray-900">{j.name}</span>
                        <span className="text-gray-400">({j.organization})</span>
                      </div>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> 14ms
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. MANAJEMEN DATABASE WASIT/JURI */}
        {/* ============================================================ */}
        {activeTab === 'wasit' && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Manajemen Database Wasit & Juri</CardTitle>
                <CardDescription>Data seluruh wasit nasional yang bertugas, kode akses, PIN, dan posisi sudut</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Cari nama wasit / kode..." 
                  value={searchJudge} 
                  onChange={(e) => setSearchJudge(e.target.value)}
                  className="w-64 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Judge Form */}
              <div className="bg-red-50/40 p-4 rounded-2xl border border-red-100 space-y-3">
                <h4 className="font-bold text-sm text-[#C8102E]">Tambah Wasit / Juri Baru</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <Input placeholder="Nama Wasit" value={newJudge.name} onChange={(e) => setNewJudge({ ...newJudge, name: e.target.value })} />
                  <Input placeholder="Kode Juri (J-2025-006)" value={newJudge.judge_code} onChange={(e) => setNewJudge({ ...newJudge, judge_code: e.target.value })} />
                  <Input placeholder="PIN (6 Digit)" value={newJudge.pin} onChange={(e) => setNewJudge({ ...newJudge, pin: e.target.value })} />
                  <Input placeholder="Organisasi / Pengprov" value={newJudge.organization} onChange={(e) => setNewJudge({ ...newJudge, organization: e.target.value })} />
                  <Button onClick={handleAddJudge} className="font-bold bg-[#C8102E]"><Plus className="h-4 w-4" /> Simpan Wasit</Button>
                </div>
              </div>

              {/* Judges Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                    <tr>
                      <th className="px-4 py-3">Nama Wasit</th>
                      <th className="px-4 py-3">Kode Juri</th>
                      <th className="px-4 py-3">PIN</th>
                      <th className="px-4 py-3">Pangkat / Tingkat</th>
                      <th className="px-4 py-3">Pengprov / Pengcab</th>
                      <th className="px-4 py-3">Status Tablet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredJudges.map((j) => (
                      <tr key={j.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-gray-900">{j.name}</td>
                        <td className="px-4 py-3 font-mono font-bold text-[#C8102E]">{j.judge_code}</td>
                        <td className="px-4 py-3 font-mono">{j.pin}</td>
                        <td className="px-4 py-3 text-gray-600">{j.rank}</td>
                        <td className="px-4 py-3 text-gray-600">{j.organization}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================================ */}
        {/* 3. JADWAL & FORMAT GERAKAN */}
        {/* ============================================================ */}
        {activeTab === 'jadwal' && (
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Pertandingan & Format Poomsae Wajib</CardTitle>
              <CardDescription>Pilihan bentuk poomsae resmi (Taegeuk 1-8, Koryo, Keumgang, Taebaek, dll.) per babak pertandingan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forms.map((f) => (
                  <div key={f.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#C8102E] transition-all">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-xs font-bold text-[#C8102E]">#{f.id}</span>
                      <Badge variant="secondary" className="text-[10px]">{f.level}</Badge>
                    </div>
                    <h4 className="font-black text-base text-gray-900">{f.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================================ */}
        {/* 4. VERIFIKASI ATLET */}
        {/* ============================================================ */}
        {activeTab === 'verifikasi' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Verifikasi Atlet & Dokumen Video YouTube</CardTitle>
                <CardDescription>Hanya atlet yang terverifikasi yang akan otomatis diikutsertakan ke dalam bagan pertandingan</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Athlete Form */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-sm text-gray-900">Input Data Atlet Manual</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <Input placeholder="Nama Atlet" value={newAthlete.name} onChange={(e) => setNewAthlete({ ...newAthlete, name: e.target.value })} />
                  <Input placeholder="Kontingen / Pengprov" value={newAthlete.contingent} onChange={(e) => setNewAthlete({ ...newAthlete, contingent: e.target.value })} />
                  <Input placeholder="Tingkat Dan (Dan I, II, III)" value={newAthlete.dan_level} onChange={(e) => setNewAthlete({ ...newAthlete, dan_level: e.target.value })} />
                  <Input placeholder="Link Video YouTube" value={newAthlete.youtube_url} onChange={(e) => setNewAthlete({ ...newAthlete, youtube_url: e.target.value })} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddAthlete} className="bg-[#C8102E] font-bold"><Plus className="h-4 w-4" /> Daftarkan Atlet</Button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                    <tr>
                      <th className="px-4 py-3">Nama Atlet</th>
                      <th className="px-4 py-3">Kontingen</th>
                      <th className="px-4 py-3">Dan Level</th>
                      <th className="px-4 py-3">Video Gerakan</th>
                      <th className="px-4 py-3">Status Verifikasi</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {athletes.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-gray-900">{a.name}</td>
                        <td className="px-4 py-3 text-gray-600">{a.contingent}</td>
                        <td className="px-4 py-3 text-gray-600">{a.dan_level}</td>
                        <td className="px-4 py-3">
                          <a href={a.youtube_url || '#'} target="_blank" rel="noreferrer" className="text-red-600 hover:underline flex items-center gap-1 font-bold text-xs">
                            <Video className="h-3.5 w-3.5" /> Tonton YouTube
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={a.verification_status === 'terverifikasi' ? 'success' : a.verification_status === 'ditolak' ? 'destructive' : 'warning'}>
                            {a.verification_status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button size="sm" variant="success" className="h-8 px-2.5 text-xs font-bold" onClick={() => handleVerifyAthlete(a.id, 'terverifikasi')}>Setujui</Button>
                          <Button size="sm" variant="destructive" className="h-8 px-2.5 text-xs font-bold" onClick={() => handleVerifyAthlete(a.id, 'ditolak')}>Tolak</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================================ */}
        {/* 5. KONFIGURASI CUT-OFF BRACKET */}
        {/* ============================================================ */}
        {activeTab === 'bracket' && (
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi Cut-Off & Bagan Eliminasi</CardTitle>
              <CardDescription>Aturan kelolosan atlet per babak dan pembagian bagan kejuaraan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <Badge variant="default" className="bg-[#C8102E]">ATURAN CUT-OFF PRESTASI</Badge>
                  <h4 className="text-lg font-black text-gray-900">Babak Penyisihan $\rightarrow$ Final 8 Besar</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Jika jumlah peserta dalam 1 kategori &gt; 8 atlet, maka diselenggarakan babak penyisihan. Nilai diurutkan dari yang tertinggi, 8 atlet terbaik lolos ke babak Final.
                  </p>
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Lolos Final (Cut-off)</label>
                    <Input defaultValue="8 Atlet (Perempat Final s/d Final)" disabled className="bg-white font-bold" />
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <Badge variant="secondary">ATURAN GRUP PEMULA</Badge>
                  <h4 className="text-lg font-black text-gray-900">Grup 3 Atlet (Semua Juara)</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Peserta kategori Pemula dibagi rata ke dalam grup berisi 3 atlet. Seluruh peserta mendapatkan medali (Juara 1 Emas, Juara 2 Perak, Juara 3 Perunggu).
                  </p>
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ukuran Grup Pemula</label>
                    <Input defaultValue="3 Atlet per Grup" disabled className="bg-white font-bold" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setAlertMessage('Bagan pertandingan berhasil di-generate ulang!')} className="bg-[#C8102E] font-bold">
                  <RefreshCw className="h-4 w-4" /> Generate Bagan Pertandingan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================================ */}
        {/* 6. LCD PROYEKTOR LINK */}
        {/* ============================================================ */}
        {activeTab === 'lcd' && (
          <Card>
            <CardHeader>
              <CardTitle>Tampilan Layar LCD Proyektor Venue</CardTitle>
              <CardDescription>Buka tampilan proyektor untuk masing-masing lapangan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['A', 'B', 'C'].map((code) => (
                  <div key={code} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-3">
                    <h4 className="text-xl font-black text-gray-900">Lapangan {code}</h4>
                    <p className="text-xs text-gray-500">Layar LCD Proyektor PSS Arena {code}</p>
                    <Link href={`/media?arena=${code}`}>
                      <Button className="w-full bg-[#C8102E] font-bold">
                        <Monitor className="h-4 w-4" /> Buka Layar Penuh (F11)
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================================ */}
        {/* 7. KLASEMEN LIVE */}
        {/* ============================================================ */}
        {activeTab === 'klasemen' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Klasemen Sementara Real-Time</CardTitle>
                <CardDescription>Urutan ranking resmi per kategori pertandingan</CardDescription>
              </div>
              <Link href="/monitor">
                <Button variant="outline" size="sm" className="font-bold">
                  Buka Halaman Monitor Lengkap <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                    <tr>
                      <th className="px-4 py-3">Peringkat</th>
                      <th className="px-4 py-3">Nama Atlet</th>
                      <th className="px-4 py-3">Kontingen</th>
                      <th className="px-4 py-3">Akurasi</th>
                      <th className="px-4 py-3">Presentasi</th>
                      <th className="px-4 py-3">Total Skor</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-amber-50/40 font-semibold">
                      <td className="px-4 py-3 font-black text-[#C8102E]">#1</td>
                      <td className="px-4 py-3 font-bold text-gray-900">Ahmad Zaki Kurniawan</td>
                      <td className="px-4 py-3 text-gray-600">DKI Jakarta</td>
                      <td className="px-4 py-3 font-mono">3.700</td>
                      <td className="px-4 py-3 font-mono">4.783</td>
                      <td className="px-4 py-3 font-black text-[#C8102E]">8.483</td>
                      <td className="px-4 py-3"><Badge variant="gold">🥇 EMAS (LEADER)</Badge></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-black text-gray-700">#2</td>
                      <td className="px-4 py-3 font-bold text-gray-900">Rayhan Bagus Pratama</td>
                      <td className="px-4 py-3 text-gray-600">Jawa Barat</td>
                      <td className="px-4 py-3 font-mono">3.650</td>
                      <td className="px-4 py-3 font-mono">4.700</td>
                      <td className="px-4 py-3 font-black text-gray-900">8.350</td>
                      <td className="px-4 py-3"><Badge variant="silver">🥈 PERAK</Badge></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-black text-gray-700">#3</td>
                      <td className="px-4 py-3 font-bold text-gray-900">Muhammad Dimas Satria</td>
                      <td className="px-4 py-3 text-gray-600">Jawa Tengah</td>
                      <td className="px-4 py-3 font-mono">3.617</td>
                      <td className="px-4 py-3 font-mono">4.666</td>
                      <td className="px-4 py-3 font-black text-gray-900">8.283</td>
                      <td className="px-4 py-3"><Badge variant="bronze">🥉 PERUNGGU</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================================ */}
        {/* 8. RESET TURNAMEN */}
        {/* ============================================================ */}
        {activeTab === 'reset' && (
          <Card className="border-red-300 bg-red-50/30">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> ZONA BAHAYA: RESET TURNAMEN & HAPUS SEMUA NILAI
              </CardTitle>
              <CardDescription className="text-red-600">
                Tindakan ini akan mengosongkan seluruh log skor juri, mengembalikan bagan cut-off ke posisi awal, dan memutuskan seluruh stasiun wasit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">
                Ketik kata <strong>RESET</strong> pada kotak di bawah untuk mengonfirmasi tindakan ini:
              </p>
              <div className="max-w-xs space-y-3">
                <Input 
                  placeholder="Ketik RESET" 
                  value={resetInput} 
                  onChange={(e) => setResetInput(e.target.value)} 
                  className="font-black text-red-700 uppercase"
                />
                <Button 
                  variant="destructive" 
                  disabled={resetInput !== 'RESET'} 
                  onClick={handleResetTournament}
                  className="w-full font-bold bg-red-700 hover:bg-red-800"
                >
                  Konfirmasi & Reset Turnamen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 font-bold">Memuat Pusat Kendali Admin...</div>}>
      <AdminContent />
    </Suspense>
  );
}
