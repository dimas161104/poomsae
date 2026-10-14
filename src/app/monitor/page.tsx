'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, BarChart3, Monitor, FileText, Maximize2, Download, 
  Wifi, Radio, CheckCircle, Award, Eye, RefreshCw, Filter, Calendar 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PublicNavbar, PublicFooter } from '@/components/shared/public-layout';
import { dbService } from '@/lib/db-service';
import { Match, TournamentSettings } from '@/types/database';
import { calculateFormScore } from '@/lib/bracket-logic';
import { RecapModal } from '@/components/shared/recap-modal';
import { printRecapSheet } from '@/lib/export-utils';

export default function MonitorPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedArena, setSelectedArena] = useState<'A' | 'B' | 'C'>('A');
  const [isRecapOpen, setIsRecapOpen] = useState(false);

  const [settings, setSettings] = useState<TournamentSettings>(dbService.getSettings());
  const [matches, setMatches] = useState<Match[]>(dbService.getMatches());

  // Subscribe to real-time updates
  useEffect(() => {
    const handleSync = () => {
      setSettings(dbService.getSettings());
      setMatches(dbService.getMatches());
    };

    handleSync();
    const unsub = dbService.subscribe(handleSync);
    return () => unsub();
  }, []);

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

  const currentMatch = matches.find(m => m.arena_code === selectedArena && m.is_current) ||
                       matches.find(m => m.arena_code === selectedArena);

  const arenaMatches = matches.filter(m => m.arena_code === selectedArena);
  const completedMatches = [...arenaMatches]
    .filter(m => (m.final_score ?? 0) > 0)
    .sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0));

  const form1Result = calculateFormScore(currentMatch?.scores?.form1_scores || {}, settings);
  const judgesCount = settings.judges_per_session || 3;
  const positions = Array.from({ length: judgesCount }, (_, i) => `J${i + 1}`);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-grow flex flex-col">
        {/* TOP STATUS BAR */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white p-3 flex flex-wrap items-center justify-between text-xs shadow-md z-10">
          <div className="flex items-center space-x-3">
            <Badge variant="destructive" className="animate-pulse bg-red-600 text-white px-3 py-1 flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 mr-1" /> LIVE BROADCAST FEED
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-red-100 font-medium">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>• Terhubung ke Server PSS (Real-time Sync Active)</span>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-gray-800 text-gray-200 border border-gray-600 px-3 py-1 flex items-center text-[10px]">
              <Eye className="w-3.5 h-3.5 mr-1.5" /> MODE MONITOR (READ-ONLY)
            </Badge>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-grow p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-6">
          <Tabs defaultValue="lcd" className="w-full">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
              <TabsList className="bg-white border shadow-xs p-1">
                <TabsTrigger value="klasemen" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:font-bold px-4 py-2 text-xs">
                  <BarChart3 className="w-4 h-4 mr-1.5" />
                  Papan Klasemen Real-Time
                </TabsTrigger>
                <TabsTrigger value="lcd" className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:font-bold px-4 py-2 text-xs">
                  <Monitor className="w-4 h-4 mr-1.5" />
                  Layar LCD Proyektor PSS
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                <div className="flex bg-white border rounded-lg p-0.5 shadow-xs">
                  {(['A', 'B', 'C'] as const).map(code => (
                    <button
                      key={code}
                      onClick={() => setSelectedArena(code)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        selectedArena === code ? 'bg-[#C8102E] text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Lapangan {code}
                    </button>
                  ))}
                </div>

                <Button variant="outline" size="sm" className="bg-white text-xs" onClick={toggleFullscreen}>
                  <Maximize2 className="w-3.5 h-3.5 mr-1" />
                  Layar Penuh
                </Button>

                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setIsRecapOpen(true)}
                  className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Rekap & Cetak Skor
                </Button>
              </div>
            </div>

            {/* TAB 1: KLASEMEN */}
            <TabsContent value="klasemen" className="space-y-4">
              <Card className="shadow-sm border border-gray-200">
                <CardHeader className="bg-gray-800 text-white pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Klasemen Resmi: Lapangan {selectedArena}
                    </CardTitle>
                    <p className="text-xs text-gray-400 mt-1">{settings.name}</p>
                  </div>
                  <Badge variant="outline" className="bg-gray-700 text-gray-200 border-gray-600 text-xs">
                    REALTIME SYNC
                  </Badge>
                </CardHeader>
                <div className="overflow-x-auto">
                  {completedMatches.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-400">
                      Belum ada partai selesai di Lapangan {selectedArena}.
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="px-4 py-3">Peringkat</th>
                          <th className="px-4 py-3">Partai</th>
                          <th className="px-4 py-3">Nama Atlet</th>
                          <th className="px-4 py-3">Kontingen</th>
                          <th className="px-4 py-3">Kategori</th>
                          <th className="px-4 py-3 text-center">Skor Form 1</th>
                          <th className="px-4 py-3 text-center">Skor Form 2</th>
                          <th className="px-4 py-3 text-center">Total Nilai</th>
                          <th className="px-4 py-3 text-center">Medali</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {completedMatches.map((m, idx) => (
                          <tr key={m.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-black text-sm">
                              {idx === 0 && <span className="text-amber-500">🥇 #1</span>}
                              {idx === 1 && <span className="text-slate-400">🥈 #2</span>}
                              {idx === 2 && <span className="text-amber-700">🥉 #3</span>}
                              {idx > 2 && `#${idx + 1}`}
                            </td>
                            <td className="px-4 py-3 font-bold">#{m.match_number}</td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-gray-900">{m.athlete?.name}</span>
                              {m.athlete?.athlete2_name && (
                                <span className="text-rose-600 block font-normal">& {m.athlete.athlete2_name}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{m.athlete?.contingent} ({m.athlete?.province})</td>
                            <td className="px-4 py-3 text-gray-700">{m.category_name}</td>
                            <td className="px-4 py-3 text-center font-mono">{m.form1_final_score?.toFixed(3) || '-'}</td>
                            <td className="px-4 py-3 text-center font-mono">{m.form2_final_score?.toFixed(3) || '-'}</td>
                            <td className="px-4 py-3 text-center font-mono font-black text-sm text-[#C8102E]">
                              {m.final_score?.toFixed(3) || '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {idx === 0 && <Badge variant="default" className="bg-amber-400 text-amber-950 text-[10px]">EMAS</Badge>}
                              {idx === 1 && <Badge variant="secondary" className="text-[10px]">PERAK</Badge>}
                              {idx === 2 && <Badge variant="outline" className="text-amber-800 border-amber-700 text-[10px]">PERUNGGU</Badge>}
                              {idx > 2 && '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* TAB 2: LCD DISPLAY */}
            <TabsContent value="lcd" className="space-y-6">
              {currentMatch ? (
                <>
                  <div className="bg-[#2A2F3A] text-white p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#C8102E]">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#C8102E] flex items-center justify-center text-2xl font-black">
                        {selectedArena}
                      </div>
                      <div>
                        <Badge variant="default" className="bg-[#C8102E] text-[10px] uppercase font-bold mb-1">
                          LAPANGAN {selectedArena} • PARTAI #{currentMatch.match_number}
                        </Badge>
                        <h2 className="text-xl md:text-2xl font-black">{currentMatch.athlete?.name}</h2>
                        {currentMatch.athlete?.athlete2_name && (
                          <p className="text-base font-bold text-rose-400">& {currentMatch.athlete.athlete2_name} (Pair)</p>
                        )}
                        <p className="text-xs text-gray-400">{currentMatch.athlete?.contingent} • {currentMatch.category_name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">NILAI AKHIR RESMI</span>
                      <div className="text-5xl font-mono font-black text-[#E8384F]">
                        {currentMatch.final_score !== null && currentMatch.final_score !== undefined
                          ? currentMatch.final_score.toFixed(3)
                          : (form1Result.averageScore > 0 ? form1Result.averageScore.toFixed(3) : '0.000')}
                      </div>
                    </div>
                  </div>

                  {/* Judges Score Panels */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${judgesCount === 5 ? 'md:grid-cols-5' : 'md:grid-cols-3'} gap-3`}>
                    {positions.map(pos => {
                      const detail = form1Result.details[pos];
                      const scoreVal = detail ? detail.total_score : null;
                      const isCutoff = detail?.is_highest || detail?.is_lowest;

                      return (
                        <div 
                          key={pos}
                          className={`p-4 rounded-2xl border text-center shadow-xs space-y-1.5 ${
                            isCutoff ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-700">{pos}</span>
                            {detail?.is_highest && <Badge variant="destructive" className="text-[9px]">MAX (CUT-OFF)</Badge>}
                            {detail?.is_lowest && <Badge variant="destructive" className="text-[9px]">MIN (CUT-OFF)</Badge>}
                          </div>
                          <div className={`text-3xl font-black font-mono ${isCutoff ? 'text-red-600 line-through' : 'text-gray-900'}`}>
                            {scoreVal !== null ? scoreVal.toFixed(2) : '-.--'}
                          </div>
                          <div className="text-[10px] text-gray-500 pt-1 border-t flex justify-between">
                            <span>Akurasi: {detail ? detail.accuracy.toFixed(2) : '-'}</span>
                            <span>Pres: {detail ? detail.presentation_total.toFixed(2) : '-'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-xs text-gray-400">
                  Belum ada partai aktif di Lapangan {selectedArena}.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <PublicFooter />

      {/* Recap Modal */}
      <RecapModal 
        isOpen={isRecapOpen} 
        onClose={() => setIsRecapOpen(false)} 
        matches={matches} 
        settings={settings} 
      />
    </div>
  );
}
