'use client';

import React, { useState } from 'react';
import { 
  PlaySquare, Play, Pause, CheckCircle, SkipForward, 
  Users, Video, Shield, Award, RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';
import { AdminLayout } from '@/components/shared/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Match } from '@/types/database';
import { formatScore, getYouTubeEmbedUrl } from '@/lib/utils';

export default function OperatorPage() {
  const [selectedArena, setSelectedArena] = useState<'A' | 'B' | 'C'>('A');
  const [activeMatchId, setActiveMatchId] = useState<string>('m1');
  const [alertMsg, setAlertMsg] = useState<string>('');

  // Sample match queue for the operator
  const [matches, setMatches] = useState<Match[]>([
    {
      id: 'm1',
      schedule_id: 's1',
      bracket_id: 'b1',
      arena_id: 'a1',
      match_number: 42,
      athlete_id: '1',
      poomsae_form_id: 'p1',
      form_number: 1,
      category: 'Senior Putra Individual Prestasi',
      round: 'penyisihan',
      status: 'aktif',
      is_current: true,
      operator_notes: 'Partai ke-1 sedang berjalan',
      final_score: 8.450,
      speed_kick_total_points: 0,
      speed_kick_score: 0,
      started_at: '09:15',
      completed_at: null,
      created_at: '',
      updated_at: '',
      athlete: {
        id: '1',
        name: 'Ahmad Zaki Kurniawan',
        initials: 'AZK',
        category_id: '1',
        type: 'prestasi',
        contingent: 'Pengprov DKI Jakarta',
        province: 'DKI Jakarta',
        age_group: 'Senior',
        gender: 'Putra',
        dan_level: 'Dan III',
        youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        verification_status: 'terverifikasi',
        verification_notes: '',
        created_at: '',
        updated_at: ''
      }
    },
    {
      id: 'm2',
      schedule_id: 's1',
      bracket_id: 'b1',
      arena_id: 'a1',
      match_number: 43,
      athlete_id: '2',
      poomsae_form_id: 'p1',
      form_number: 1,
      category: 'Senior Putra Individual Prestasi',
      round: 'penyisihan',
      status: 'menunggu',
      is_current: false,
      operator_notes: 'Menunggu giliran',
      final_score: null,
      speed_kick_total_points: 0,
      speed_kick_score: 0,
      started_at: null,
      completed_at: null,
      created_at: '',
      updated_at: '',
      athlete: {
        id: '2',
        name: 'Rayhan Bagus Pratama',
        initials: 'RBP',
        category_id: '1',
        type: 'prestasi',
        contingent: 'Pengcab Jawa Barat',
        province: 'Jawa Barat',
        age_group: 'Senior',
        gender: 'Putra',
        dan_level: 'Dan II',
        youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        verification_status: 'terverifikasi',
        verification_notes: '',
        created_at: '',
        updated_at: ''
      }
    },
    {
      id: 'm3',
      schedule_id: 's1',
      bracket_id: 'b1',
      arena_id: 'a1',
      match_number: 44,
      athlete_id: '3',
      poomsae_form_id: 'p1',
      form_number: 1,
      category: 'Senior Putra Individual Prestasi',
      round: 'penyisihan',
      status: 'menunggu',
      is_current: false,
      operator_notes: 'Menunggu giliran',
      final_score: null,
      speed_kick_total_points: 0,
      speed_kick_score: 0,
      started_at: null,
      completed_at: null,
      created_at: '',
      updated_at: '',
      athlete: {
        id: '3',
        name: 'Muhammad Dimas Satria',
        initials: 'MDS',
        category_id: '1',
        type: 'prestasi',
        contingent: 'Pengprov Jawa Tengah',
        province: 'Jawa Tengah',
        age_group: 'Senior',
        gender: 'Putra',
        dan_level: 'Dan II',
        youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        verification_status: 'terverifikasi',
        verification_notes: '',
        created_at: '',
        updated_at: ''
      }
    }
  ]);

  const currentMatch = matches.find(m => m.id === activeMatchId) || matches[0];

  // Set match active
  const handleSelectMatch = (id: string) => {
    setActiveMatchId(id);
    setMatches(prev => prev.map(m => ({
      ...m,
      is_current: m.id === id,
      status: m.id === id ? 'aktif' : (m.status === 'selesai' ? 'selesai' : 'menunggu')
    })));
    setAlertMsg('Partai terpilih telah disiarkan ke Stasiun Juri & Layar Media!');
  };

  // Mark match finished and advance to next
  const handleFinishAndNext = () => {
    const currentIndex = matches.findIndex(m => m.id === activeMatchId);
    if (currentIndex >= 0) {
      const updated = [...matches];
      updated[currentIndex].status = 'selesai';
      updated[currentIndex].is_current = false;
      
      const nextIndex = currentIndex + 1;
      if (nextIndex < matches.length) {
        updated[nextIndex].status = 'aktif';
        updated[nextIndex].is_current = true;
        setActiveMatchId(updated[nextIndex].id);
        setAlertMsg('Partai selesai! Otomatis melanjutkan ke partai berikutnya.');
      } else {
        setAlertMsg('Semua partai dalam sesi ini telah selesai.');
      }
      setMatches(updated);
    }
  };

  // Trigger 8 besar final generation
  const handleGenerateFinalBracket = () => {
    setAlertMsg('Babak Penyisihan Selesai! Sistem berhasil menetapkan 8 Besar dan mengurutkan partai Final dari nilai terkecil ke terbesar.');
  };

  return (
    <AdminLayout role="operator" title="Konsol Operator Lapangan: Penentuan Partai & Alur Tanding">
      <div className="space-y-6">
        {/* Arena Selector & Session Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700">Pilih Lapangan Operasi:</span>
            {(['A', 'B', 'C'] as const).map(code => (
              <button
                key={code}
                onClick={() => setSelectedArena(code)}
                className={`px-4 py-2 rounded-xl font-black text-sm transition-all cursor-pointer ${
                  selectedArena === code ? 'bg-[#C8102E] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lapangan {code}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleGenerateFinalBracket}>
              <Award className="h-4 w-4 text-amber-600" /> Tetapkan 8 Besar & Bentuk Final
            </Button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {alertMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{alertMsg}</span>
            </div>
            <button onClick={() => setAlertMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">Tutup</button>
          </div>
        )}

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Match Console (Left / 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-t-4 border-t-[#C8102E]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                    <CardTitle className="text-lg">Partai Sedang Tampil: Lapangan {selectedArena}</CardTitle>
                  </div>
                  <CardDescription>Juri dan Proyektor tersinkronisasi otomatis dengan partai ini</CardDescription>
                </div>
                <Badge variant="default" className="text-sm px-3 py-1">
                  PARTAI #{currentMatch.match_number}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Athlete Info Banner */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{currentMatch.category}</Badge>
                      <Badge variant="warning">{currentMatch.round.toUpperCase()}</Badge>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">{currentMatch.athlete?.name}</h3>
                    <p className="text-sm text-gray-600 font-semibold">{currentMatch.athlete?.contingent} • {currentMatch.athlete?.dan_level}</p>
                    <p className="text-xs text-[#C8102E] font-bold">Wajib Poomsae: Koryo & Taegeuk 8 Jang</p>
                  </div>
                  <div className="text-center bg-white p-4 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-400 font-bold uppercase">Status Partai</span>
                    <p className="text-lg font-black text-emerald-600 uppercase mt-1">{currentMatch.status}</p>
                  </div>
                </div>

                {/* Embedded YouTube Video for Referee & Operator Checking */}
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-red-600" />
                    Video Rekaman Gerakan Atlet (YouTube)
                  </h4>
                  <div className="w-full h-64 bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                    {currentMatch.athlete?.youtube_url ? (
                      <iframe 
                        className="w-full h-full"
                        src={getYouTubeEmbedUrl(currentMatch.athlete.youtube_url) || ''}
                        title="Video Atlet"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Link YouTube belum tersedia</span>
                    )}
                  </div>
                </div>

                {/* Operator Match Control Buttons */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="default" 
                      className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 font-bold"
                      onClick={() => setAlertMsg('Pertandingan dimulai! Timer berjalan.')}
                    >
                      <Play className="h-4 w-4" /> Mulai Pertandingan
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="h-11 px-4 font-bold"
                      onClick={() => setAlertMsg('Pertandingan dijeda sementara.')}
                    >
                      <Pause className="h-4 w-4" /> Jeda
                    </Button>
                  </div>

                  <Button 
                    variant="default" 
                    className="bg-[#C8102E] hover:bg-[#9B0C23] h-11 px-6 font-bold"
                    onClick={handleFinishAndNext}
                  >
                    <CheckCircle className="h-4 w-4" /> Selesai & Lanjut Partai Berikutnya <SkipForward className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Match Queue in this Arena (Right / 1 col) */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Antrean Partai: Lapangan {selectedArena}</CardTitle>
                <CardDescription>Pilih partai untuk memajukannya ke tatami</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {matches.map((m, idx) => (
                  <div 
                    key={m.id}
                    onClick={() => handleSelectMatch(m.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      m.id === activeMatchId 
                        ? 'bg-red-50/80 border-[#C8102E] shadow-xs' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                        #{m.match_number}
                      </span>
                      <Badge variant={m.status === 'aktif' ? 'default' : m.status === 'selesai' ? 'success' : 'secondary'}>
                        {m.status.toUpperCase()}
                      </Badge>
                    </div>
                    <h5 className="font-black text-sm text-gray-900">{m.athlete?.name}</h5>
                    <p className="text-xs text-gray-500">{m.athlete?.contingent}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Judges Input Monitor */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#C8102E]" />
                  Status Live Input Juri (Arena {selectedArena})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['Juri 1 (Bambang)', 'Juri 2 (Liem Wen)', 'Juri 3 (Eko)', 'Juri 4 (Nuraini)', 'Juri 5 (Hendra)'].map((j, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100">
                    <span className="font-semibold text-gray-700">{j}</span>
                    <Badge variant={i === 2 ? 'warning' : 'success'} className="text-[10px]">
                      {i === 2 ? 'Sedang Menilai...' : 'Nilai Masuk'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
