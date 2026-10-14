'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, CheckCircle, SkipForward, 
  Video, Shield, Award, AlertCircle, Users, RefreshCw
} from 'lucide-react';
import { AdminLayout } from '@/components/shared/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Match, TournamentSettings } from '@/types/database';
import { getYouTubeEmbedUrl } from '@/lib/utils';
import { dbService } from '@/lib/db-service';
import { processCutoffAndGenerateFinals } from '@/lib/bracket-logic';

export default function OperatorPage() {
  const [selectedArena, setSelectedArena] = useState<'A' | 'B' | 'C'>('A');
  const [matches, setMatches] = useState<Match[]>([]);
  const [settings, setSettings] = useState<TournamentSettings>(dbService.getSettings());
  const [alertMsg, setAlertMsg] = useState<string>('');

  // Subscribe to real-time updates from dbService
  useEffect(() => {
    const updateLocalState = () => {
      setMatches(dbService.getMatches(selectedArena));
      setSettings(dbService.getSettings());
    };

    updateLocalState();
    const unsubscribe = dbService.subscribe(updateLocalState);
    return () => unsubscribe();
  }, [selectedArena]);

  const currentMatch = matches.find(m => m.is_current) || matches[0];

  // Set match active
  const handleSelectMatch = (id: string) => {
    dbService.setActiveMatch(id, selectedArena);
    setAlertMsg(`Partai terpilih telah disiarkan ke Stasiun Juri & Layar Media Lapangan ${selectedArena}!`);
  };

  // Mark match finished and advance to next
  const handleFinishAndNext = () => {
    if (!currentMatch) return;
    dbService.updateMatchStatus(currentMatch.id, 'selesai');

    const currentIndex = matches.findIndex(m => m.id === currentMatch.id);
    if (currentIndex >= 0 && currentIndex + 1 < matches.length) {
      const nextMatch = matches[currentIndex + 1];
      dbService.setActiveMatch(nextMatch.id, selectedArena);
      setAlertMsg(`Partai #${currentMatch.match_number} selesai! Otomatis melanjutkan ke partai #${nextMatch.match_number}.`);
    } else {
      setAlertMsg(`Partai #${currentMatch.match_number} selesai! Semua antrean partai di Lapangan ${selectedArena} telah tuntas.`);
    }
  };

  // Trigger 8 besar final bracket generation
  const handleGenerateFinalBracket = () => {
    const arenaMatches = dbService.getMatches(selectedArena);
    const result = processCutoffAndGenerateFinals(arenaMatches, 200);

    if (result.advancedMatches.length === 0) {
      setAlertMsg('Belum ada partai penyisihan dengan skor selesai untuk menghasilkan 8 besar.');
      return;
    }

    dbService.addMatches(result.advancedMatches);
    setAlertMsg(`Babak Penyisihan Selesai! Berhasil menetapkan ${result.advancedMatches.length} atlet ke Babak Final dengan urutan nilai terkecil ke terbesar.`);
  };

  // Check judge submissions for current match
  const requiredJudgeCount = settings.judges_per_session || 3;
  const currentScores = currentMatch?.scores?.form1_scores || {};
  const judgesPositions = Array.from({ length: requiredJudgeCount }, (_, i) => `J${i + 1}`);

  return (
    <AdminLayout role="operator" title={`Konsol Operator: Lapangan ${selectedArena} • Kendali Alur Partai`}>
      <div className="space-y-6">
        {/* Arena Selector & Session Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase">Pilih Lapangan Operasi:</span>
            {(['A', 'B', 'C'] as const).map(code => (
              <button
                key={code}
                onClick={() => setSelectedArena(code)}
                className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  selectedArena === code ? 'bg-[#C8102E] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              onClick={handleGenerateFinalBracket}
              className="text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-50"
            >
              <Award className="h-4 w-4 text-amber-600 mr-1" /> Tetapkan 8 Besar & Bentuk Final
            </Button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {alertMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
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
                  <CardDescription className="text-xs">
                    Stasiun Juri dan Layar Proyektor tersinkronisasi otomatis dengan partai ini
                  </CardDescription>
                </div>
                {currentMatch && (
                  <Badge variant="default" className="text-sm px-3 py-1 bg-[#C8102E]">
                    PARTAI #{currentMatch.match_number}
                  </Badge>
                )}
              </CardHeader>

              {currentMatch ? (
                <CardContent className="space-y-6">
                  {/* Athlete Info Banner */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="sm:col-span-2 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{currentMatch.category_name}</Badge>
                        <Badge variant="warning" className="text-xs uppercase">{currentMatch.round}</Badge>
                        <Badge variant="outline" className="text-xs uppercase">{currentMatch.level}</Badge>
                        {currentMatch.participation_type === 'pair' && (
                          <Badge variant="default" className="bg-rose-600 text-xs uppercase">PAIR (BERPASANGAN)</Badge>
                        )}
                      </div>

                      <h3 className="text-2xl font-black text-gray-900 mt-1">
                        {currentMatch.athlete?.name}
                      </h3>
                      {currentMatch.athlete?.athlete2_name && (
                        <p className="text-lg font-bold text-rose-700">
                          & {currentMatch.athlete.athlete2_name}
                        </p>
                      )}

                      <p className="text-xs text-gray-600 font-semibold">
                        {currentMatch.athlete?.contingent} • {currentMatch.athlete?.province} ({currentMatch.athlete?.dan_level})
                      </p>

                      <div className="pt-2 text-xs text-[#C8102E] font-bold">
                        Wajib Gerakan: {currentMatch.poomsae_1} {currentMatch.poomsae_2 ? `& ${currentMatch.poomsae_2}` : ''}
                      </div>
                    </div>

                    <div className="text-center bg-white p-4 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status Partai</span>
                      <p className={`text-lg font-black uppercase mt-1 ${
                        currentMatch.status === 'aktif' ? 'text-emerald-600' : 'text-gray-600'
                      }`}>
                        {currentMatch.status}
                      </p>
                      {currentMatch.final_score !== null && currentMatch.final_score !== undefined && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Skor Sementara</span>
                          <p className="text-xl font-mono font-black text-[#C8102E]">
                            {currentMatch.final_score.toFixed(3)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Embedded YouTube Video for Referee & Operator Checking */}
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 mb-2 flex items-center gap-2">
                      <Video className="h-4 w-4 text-red-600" />
                      Video Rekaman Gerakan Atlet (YouTube)
                    </h4>
                    <div className="w-full h-72 bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                      {currentMatch.athlete?.youtube_url ? (
                        <iframe 
                          className="w-full h-full"
                          src={getYouTubeEmbedUrl(currentMatch.athlete.youtube_url) || ''}
                          title={`Video Atlet ${currentMatch.athlete.name}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        />
                      ) : (
                        <div className="text-center p-6 text-gray-400">
                          <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Tautan YouTube peserta belum dimasukkan oleh Admin</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operator Match Control Buttons */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="default" 
                        className="bg-emerald-600 hover:bg-emerald-700 h-10 px-4 text-xs font-bold"
                        onClick={() => {
                          dbService.updateMatchStatus(currentMatch.id, 'aktif');
                          setAlertMsg(`Pertandingan partai #${currentMatch.match_number} dimulai!`);
                        }}
                      >
                        <Play className="h-3.5 w-3.5 mr-1" /> Mulai Partai
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="h-10 px-4 text-xs font-bold"
                        onClick={() => {
                          dbService.updateMatchStatus(currentMatch.id, 'menunggu');
                          setAlertMsg(`Pertandingan partai #${currentMatch.match_number} dijeda.`);
                        }}
                      >
                        <Pause className="h-3.5 w-3.5 mr-1" /> Jeda
                      </Button>
                    </div>

                    <Button 
                      variant="default" 
                      className="bg-[#C8102E] hover:bg-[#9B0C23] h-10 px-5 text-xs font-bold"
                      onClick={handleFinishAndNext}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Selesai & Lanjut Partai Berikutnya <SkipForward className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="p-12 text-center text-gray-400 text-xs">
                  Tidak ada partai yang tersedia di Lapangan {selectedArena}.
                </CardContent>
              )}
            </Card>
          </div>

          {/* Match Queue in this Arena (Right / 1 col) */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Antrean Partai: Lapangan {selectedArena}</CardTitle>
                <CardDescription className="text-xs">Klik partai untuk memajukannya ke arena pertandingan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 max-h-[360px] overflow-y-auto">
                {matches.length === 0 ? (
                  <div className="text-xs text-gray-400 py-6 text-center">Belum ada partai di arena ini.</div>
                ) : (
                  matches.map((m) => (
                    <div 
                      key={m.id}
                      onClick={() => handleSelectMatch(m.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        m.is_current 
                          ? 'bg-red-50/80 border-[#C8102E] shadow-xs' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                          #{m.match_number}
                        </span>
                        <Badge variant={m.status === 'aktif' ? 'default' : m.status === 'selesai' ? 'success' : 'secondary'} className="text-[10px]">
                          {m.status.toUpperCase()}
                        </Badge>
                      </div>
                      <h5 className="font-black text-xs text-gray-900">
                        {m.athlete?.name}
                        {m.athlete?.athlete2_name && (
                          <span className="text-rose-600 block text-[11px] font-normal">& {m.athlete.athlete2_name}</span>
                        )}
                      </h5>
                      <p className="text-[11px] text-gray-500 mt-0.5">{m.athlete?.contingent}</p>
                      {m.final_score !== null && m.final_score !== undefined && (
                        <p className="text-[11px] font-mono font-bold text-[#C8102E] mt-1">
                          Skor: {m.final_score.toFixed(3)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Live Judges Input Monitor for Current Match */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#C8102E]" />
                  Status Live Input Juri (Partai #{currentMatch?.match_number || '-'})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {judgesPositions.map((pos) => {
                  const score = currentScores[pos];
                  const hasSubmitted = !!score;
                  return (
                    <div key={pos} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100">
                      <span className="font-semibold text-gray-700">
                        Meja {pos} {score ? `(${score.judge_name})` : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        {score && (
                          <span className="font-mono font-bold text-[#C8102E] text-xs">
                            {score.total_score.toFixed(3)}
                          </span>
                        )}
                        <Badge variant={hasSubmitted ? 'success' : 'warning'} className="text-[10px]">
                          {hasSubmitted ? 'Nilai Masuk' : 'Menunggu...'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
