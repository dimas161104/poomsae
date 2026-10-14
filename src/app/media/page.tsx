'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Trophy, Monitor, Maximize2, Download, Video, 
  Award, CheckCircle, Shield, Wifi, RefreshCw, Home, LogOut, ArrowLeft, Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatScore, formatScore2 } from '@/lib/utils';
import { dbService } from '@/lib/db-service';
import { Match, TournamentSettings, ScoreDetail } from '@/types/database';
import { calculateFormScore } from '@/lib/bracket-logic';
import { printRecapSheet } from '@/lib/export-utils';

export default function MediaProjectorPage() {
  const router = useRouter();
  const [selectedArena, setSelectedArena] = useState<'A' | 'B' | 'C'>('A');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settings, setSettings] = useState<TournamentSettings>(dbService.getSettings());
  const [currentMatch, setCurrentMatch] = useState<Match | undefined>(dbService.getCurrentMatch('A'));
  const [arenaMatches, setArenaMatches] = useState<Match[]>(dbService.getMatches('A'));

  // Sync with cookie session on mount if arena specified
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/monitor_session=([^;]+)/);
      if (match) {
        try {
          const sess = JSON.parse(decodeURIComponent(match[1]));
          if (sess.arena) setSelectedArena(sess.arena);
        } catch {}
      }
    }
  }, []);

  // Subscribe to real-time database updates
  useEffect(() => {
    const handleSync = () => {
      setSettings(dbService.getSettings());
      setCurrentMatch(dbService.getCurrentMatch(selectedArena));
      setArenaMatches(dbService.getMatches(selectedArena));
    };

    handleSync();
    const unsub = dbService.subscribe(handleSync);
    return () => unsub();
  }, [selectedArena]);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleLogout = () => {
    document.cookie = 'monitor_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  // Form score details calculation for active match
  const form1Result = calculateFormScore(currentMatch?.scores?.form1_scores || {}, settings);
  const form2Result = calculateFormScore(currentMatch?.scores?.form2_scores || {}, settings);

  // Judge panel items
  const judgesCount = settings.judges_per_session || 3;
  const positions = Array.from({ length: judgesCount }, (_, i) => `J${i + 1}`);

  // Top standings for this arena
  const completedStandings = arenaMatches
    .filter(m => (m.final_score ?? 0) > 0)
    .sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0))
    .slice(0, 5);

  const isSpeedKick = currentMatch?.category_type === 'speed_kick';

  // Check if all required judges have submitted
  const submittedJudges = !isSpeedKick
    ? Object.keys(currentMatch?.scores?.form1_scores || {})
    : Object.keys(currentMatch?.scores?.speed_kick_scores || {});
  const allJudgesSubmitted = submittedJudges.length >= judgesCount;
  const pendingJudgesCount = judgesCount - submittedJudges.length;

  // Speed Kick details per judge
  const speedKickScores = currentMatch?.scores?.speed_kick_scores || {};

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex flex-col justify-between">
      {/* Top Media Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs no-print">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#C8102E] bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Beranda</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C8102E] flex items-center justify-center text-white font-black">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-gray-900 leading-tight">
                LAYAR PROYEKTOR / LCD PSS ARENA
              </h1>
              <p className="text-xs text-gray-500 font-semibold">Tampilan Resmi Penonton & Tim Official (Real-time Live Sync)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['A', 'B', 'C'] as const).map(code => (
              <button
                key={code}
                onClick={() => setSelectedArena(code)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedArena === code ? 'bg-[#C8102E] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lapangan {code}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-2 font-bold cursor-pointer">
            <Maximize2 className="h-4 w-4" /> {isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (F11)'}
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            onClick={() => printRecapSheet(arenaMatches, settings, selectedArena)} 
            className="gap-2 font-bold bg-[#C8102E] cursor-pointer"
          >
            <Download className="h-4 w-4" /> Cetak Lembar Skor
          </Button>

          <button
            onClick={handleLogout}
            className="h-9 px-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer border border-red-200"
            title="Keluar"
          >
            <LogOut className="h-3.5 w-3.5 text-red-600" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Projector Content */}
      <div className="flex-1 p-4 md:p-6 w-full space-y-5">
        {/* Tournament & Arena Header */}
        <div className="bg-[#2A2F3A] text-white p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#C8102E]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#C8102E] flex items-center justify-center text-2xl font-black shadow-lg">
              {selectedArena}
            </div>
            <div>
              <Badge variant="default" className="bg-[#C8102E] text-xs uppercase px-3 py-1 font-black mb-1">
                LAPANGAN {selectedArena} • OFFICIAL WT PSS SCORING ENGINE
              </Badge>
              <h2 className="text-2xl font-black tracking-tight">{settings.name}</h2>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                {settings.location} • {settings.organizer}
              </p>
            </div>
          </div>

          <div className="text-right">
            <Badge variant="success" className="text-xs px-3 py-1 font-bold">
              ✓ VERIFIED OFFICIAL RESULT
            </Badge>
            <p className="text-[11px] text-gray-400 mt-1 font-mono">
              SESSION: ARENA{selectedArena}-MATCH#{currentMatch?.match_number || '00'}
            </p>
          </div>
        </div>

        {/* Current Performing Athlete & Official Score Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Athlete Profile (Left) */}
          <Card className="rounded-3xl border-2 border-gray-200 shadow-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="destructive" className="bg-[#C8102E]">PARTAI #{currentMatch?.match_number || '-'}</Badge>
                <Badge variant="secondary">{currentMatch?.athlete?.province || '-'}</Badge>
                {currentMatch?.participation_type === 'pair' && (
                  <Badge variant="default" className="bg-rose-600">PAIR (BERPASANGAN)</Badge>
                )}
              </div>

              <div>
                <h3 className="text-3xl font-black text-gray-900 leading-tight">
                  {currentMatch?.athlete?.name || 'Menunggu Partai...'}
                </h3>
                {currentMatch?.athlete?.athlete2_name && (
                  <p className="text-xl font-bold text-rose-700 mt-1">
                    & {currentMatch.athlete.athlete2_name}
                  </p>
                )}
                <p className="text-sm font-bold text-gray-600 mt-1">
                  {currentMatch?.category_name} • Babak {currentMatch?.round?.toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  {currentMatch?.athlete?.contingent} ({currentMatch?.athlete?.dan_level})
                </p>
              </div>

              {!isSpeedKick ? (
                <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100 space-y-1.5">
                  <p className="text-xs font-bold text-[#C8102E] uppercase">Bentuk Gerakan Wajib:</p>
                  <p className="text-sm font-black text-gray-900">1. {currentMatch?.poomsae_1 || '-'}</p>
                  {currentMatch?.poomsae_2 && (
                    <p className="text-sm font-black text-gray-900">2. {currentMatch?.poomsae_2}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5">
                  <p className="text-xs font-bold text-amber-800 uppercase">Kategori Speed Kicking:</p>
                  <p className="text-sm font-black text-gray-900">30 Detik On Target (Sensor Elektronik)</p>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 font-medium">
                {judgesCount >= 5 && settings.cutoff_high_low 
                  ? 'Metode WT Cut-Off: Skor tertinggi & terendah dicoret otomatis. Nilai dihitung dari rata-rata 3 skor tengah.'
                  : `Metode Penjurian: Rata-rata dari ${judgesCount} Meja Juri Elektronik resmi.`}
              </div>
            </CardContent>
          </Card>

          {/* Official Final Score Board (Center / Large) */}
          <div className="lg:col-span-2 bg-[#2A2F3A] text-white p-8 rounded-3xl shadow-2xl flex flex-col justify-between items-center text-center border-2 border-gray-700">
            <div className="w-full flex items-center justify-between border-b border-gray-700 pb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                NILAI AKHIR RESMI (OFFICIAL FINAL SCORE)
              </span>
              <Badge variant={currentMatch?.status === 'selesai' ? 'success' : 'warning'} className="text-xs font-black">
                {currentMatch?.status === 'selesai' ? 'SAH & TERKONFIRMASI' : 'LIVE SCORING BERJALAN'}
              </Badge>
            </div>

            <div className="my-6">
              <div className="text-7xl md:text-[7rem] lg:text-[9rem] font-black text-[#E8384F] tracking-tight drop-shadow-md font-mono leading-none">
                {!isSpeedKick ? (
                  currentMatch?.final_score !== null && currentMatch?.final_score !== undefined
                    ? currentMatch.final_score.toFixed(3)
                    : (form1Result.averageScore > 0 
                        ? (allJudgesSubmitted ? form1Result.averageScore.toFixed(3) : 'MENUNGGU PENILAIAN JURI...')
                        : 'MENUNGGU PENILAIAN JURI...')
                ) : (
                  allJudgesSubmitted
                    ? (currentMatch?.speed_kick_total_points || 0)
                    : 'MENUNGGU PENILAIAN JURI...'
                )}
              </div>
              
              {!isSpeedKick ? (
                <p className="text-sm text-gray-400 mt-2 font-medium">
                  {allJudgesSubmitted
                    ? (currentMatch?.forms_count === 2
                        ? `Rata-rata 2 Gerakan (Form 1: ${form1Result.averageScore.toFixed(3)} • Form 2: ${form2Result.averageScore.toFixed(3)})`
                        : `Nilai Form 1: ${form1Result.averageScore.toFixed(3)}`)
                    : `MENUNGGU SEMUA JURI (${submittedJudges.length}/${judgesCount})`}
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-2 font-medium">
                  {allJudgesSubmitted
                    ? `Total Poin Speed Kick — Total Tendangan: ${Object.values(speedKickScores).reduce((sum: number, s: any) => sum + (s?.body_kicks || 0) + (s?.head_kicks || 0) + (s?.spin_head_kicks || 0), 0)}`
                    : `MENUNGGU SEMUA JURI (${submittedJudges.length}/${judgesCount})`}
                </p>
              )}
            </div>

            <div className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-2xl font-black text-base flex items-center justify-center gap-2">
              <Award className="h-5 w-5" /> 
              {completedStandings.length > 0 && completedStandings[0].id === currentMatch?.id
                ? 'PERINGKAT 1 (KANDIDAT EMAS)'
                : `STATUS PARTAI: ${currentMatch?.status?.toUpperCase() || 'MENUNGGU'}`}
            </div>
          </div>
        </div>

        {/* Judges Decision Panel with Dynamic Cut-Off Strikethrough */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#C8102E]" />
              PANEL KEPUTUSAN {judgesCount} JURI ELEKTRONIK (WT PSS STANDARD)
            </h4>
            <span className="text-xs text-gray-500 font-semibold">
              {!isSpeedKick ? 'SKALA: AKURASI (4.00) + PRESENTASI (6.00) = 10.00' : 'SPEED KICKING TARGET POINTS'}
            </span>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${judgesCount === 5 ? 'md:grid-cols-5' : 'md:grid-cols-3'} gap-4`}>
            {positions.map((pos) => {
              const detail = form1Result.details[pos];
              const speedKickDetail = speedKickScores[pos];
              const hasSubmitted = !isSpeedKick ? !!detail : !!speedKickDetail;
              const scoreVal = detail ? detail.total_score : null;
              const isHighest = detail?.is_highest;
              const isLowest = detail?.is_lowest;
              const isCutoff = isHighest || isLowest;

              // Decide whether to reveal individual judge scores
              const revealScores = allJudgesSubmitted;

              return (
                <div 
                  key={pos}
                  className={`p-4 rounded-2xl border text-center shadow-xs space-y-2 relative overflow-hidden transition-all ${
                    isCutoff && revealScores
                      ? 'bg-red-50/40 border-2 border-red-200' 
                      : hasSubmitted
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-bold ${isCutoff && revealScores ? 'text-red-900' : 'text-gray-600'}`}>{pos}</span>
                    {!revealScores ? (
                      <Badge variant={hasSubmitted ? 'success' : 'outline'} className="text-[9px]">
                        {hasSubmitted ? '✓ TERKIRIM' : 'MENUNGGU...'}
                      </Badge>
                    ) : (
                      <>
                        {isHighest && <Badge variant="destructive" className="text-[9px] bg-red-600">TERTINGGI (CUT-OFF)</Badge>}
                        {isLowest && <Badge variant="destructive" className="text-[9px] bg-red-600">TERENDAH (CUT-OFF)</Badge>}
                        {!isCutoff && (
                          <Badge variant={scoreVal !== null || speedKickDetail ? 'secondary' : 'outline'} className="text-[9px]">
                            {(scoreVal !== null || speedKickDetail) ? 'TERHITUNG' : 'MENUNGGU'}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  {!revealScores ? (
                    <div className="text-lg font-bold text-gray-400 py-2">
                      {hasSubmitted ? '✓' : '⏳'}
                    </div>
                  ) : !isSpeedKick ? (
                    <>
                      <div className={`text-3xl font-black font-mono ${
                        isCutoff ? 'text-red-600 line-through opacity-70' : 'text-gray-900'
                      }`}>
                        {scoreVal !== null ? scoreVal.toFixed(2) : '-.--'}
                      </div>
                      <div className={`text-[10px] pt-1 border-t flex justify-between ${
                        isCutoff ? 'border-red-100 text-red-500' : 'border-gray-100 text-gray-500'
                      }`}>
                        <span>Akurasi: {detail ? detail.accuracy.toFixed(2) : '-'}</span>
                        <span>Presentasi: {detail ? detail.presentation_total.toFixed(2) : '-'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-black font-mono text-amber-700">
                        {speedKickDetail ? (speedKickDetail.total_points || 0) : '-.--'}
                      </div>
                      <div className="text-[10px] pt-1 border-t border-gray-100 text-gray-500 flex justify-between">
                        <span>Badan: {speedKickDetail?.body_kicks ?? '-'}</span>
                        <span>Kepala: {speedKickDetail?.head_kicks ?? '-'}</span>
                        <span>Putar: {speedKickDetail?.spin_head_kicks ?? '-'}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Top Standings Table */}
        <Card className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b border-gray-200">
            <h4 className="font-black text-base text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              KLASEMEN SEMENTARA TOP 5 (LAPANGAN {selectedArena})
            </h4>
            <span className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              REAL-TIME SYNC
            </span>
          </div>

          <div className="overflow-x-auto">
            {completedStandings.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                Belum ada partai selesai di Lapangan {selectedArena}. Skor akan muncul otomatis setelah juri selesai menilai.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Peringkat</th>
                    <th className="py-3 px-4">Partai</th>
                    <th className="py-3 px-4">Atlet / Tim</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-center">Form 1</th>
                    <th className="py-3 px-4 text-center">Form 2</th>
                    <th className="py-3 px-4 text-center">Nilai Akhir</th>
                    <th className="py-3 px-4 text-center">Medali</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completedStandings.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-gray-50/80">
                      <td className="py-3 px-4 font-black text-sm">
                        {idx === 0 && <span className="text-amber-500">🥇 1</span>}
                        {idx === 1 && <span className="text-slate-400">🥈 2</span>}
                        {idx === 2 && <span className="text-amber-700">🥉 3</span>}
                        {idx > 2 && idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold">#{m.match_number}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{m.athlete?.name}</div>
                        {m.athlete?.athlete2_name && (
                          <div className="text-[11px] font-semibold text-rose-600">& {m.athlete.athlete2_name} (Pair)</div>
                        )}
                        <div className="text-[10px] text-gray-500">{m.athlete?.contingent}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-700">{m.category_name}</td>
                      <td className="py-3 px-4 text-center font-mono">
                        {m.form1_final_score !== null && m.form1_final_score !== undefined ? m.form1_final_score.toFixed(3) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {m.form2_final_score !== null && m.form2_final_score !== undefined ? m.form2_final_score.toFixed(3) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-sm text-[#C8102E]">
                        {m.final_score !== null && m.final_score !== undefined ? m.final_score.toFixed(3) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {idx === 0 && <Badge variant="default" className="bg-amber-400 text-amber-950 font-bold text-[10px]">EMAS</Badge>}
                        {idx === 1 && <Badge variant="secondary" className="font-bold text-[10px]">PERAK</Badge>}
                        {idx === 2 && <Badge variant="outline" className="border-amber-700 text-amber-800 font-bold text-[10px]">PERUNGGU</Badge>}
                        {idx > 2 && <span className="text-gray-400 text-[10px]">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
