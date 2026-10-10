'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Video, Undo2, RotateCcw, Send, CheckCircle, 
  AlertTriangle, Clock, Zap, Target, Award, Wifi, Play, Pause, ChevronRight
} from 'lucide-react';
import { AdminSidebar, AdminTopbar } from '@/components/shared/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { formatScore, formatScore2, getYouTubeEmbedUrl } from '@/lib/utils';

export default function JudgeStationPage() {
  const [selectedArena, setSelectedArena] = useState<'A' | 'B' | 'C'>('A');
  const [judgePosition, setJudgePosition] = useState<string>('J3');
  const [activeFormTab, setActiveFormTab] = useState<1 | 2>(1); // Form 1 or Form 2 (for 2-form matches)
  const [mode, setMode] = useState<'poomsae' | 'speed_kick'>('poomsae');

  // Match State
  const [currentMatch, setCurrentMatch] = useState({
    match_number: 42,
    athlete_name: 'Ahmad Zaki Kurniawan',
    contingent: 'Pengprov DKI Jakarta',
    dan_level: 'Dan III',
    category: 'Senior Putra Individual Prestasi',
    round: 'Final',
    poomsae_1: 'Koryo',
    poomsae_2: 'Taegeuk 8 Jang',
    youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    timer: '01:14',
    is_active: true
  });

  // Poomsae Scoring State (Form 1)
  const [accuracy1, setAccuracy1] = useState<number>(3.90);
  const [minorCount1, setMinorCount1] = useState<number>(1);
  const [majorCount1, setMajorCount1] = useState<number>(0);
  const [speedPower1, setSpeedPower1] = useState<number>(1.60);
  const [rhythmTempo1, setRhythmTempo1] = useState<number>(1.65);
  const [expression1, setExpression1] = useState<number>(1.55);
  const [gamjeomCount1, setGamjeomCount1] = useState<number>(0);
  const [history1, setHistory1] = useState<string[]>(['minor']);

  // Poomsae Scoring State (Form 2)
  const [accuracy2, setAccuracy2] = useState<number>(3.80);
  const [minorCount2, setMinorCount2] = useState<number>(2);
  const [majorCount2, setMajorCount2] = useState<number>(0);
  const [speedPower2, setSpeedPower2] = useState<number>(1.55);
  const [rhythmTempo2, setRhythmTempo2] = useState<number>(1.60);
  const [expression2, setExpression2] = useState<number>(1.50);
  const [gamjeomCount2, setGamjeomCount2] = useState<number>(0);
  const [history2, setHistory2] = useState<string[]>(['minor', 'minor']);

  // Speed Kick State
  const [bodyKicks, setBodyKicks] = useState<number>(12); // +1 pt
  const [headKicks, setHeadKicks] = useState<number>(4);  // +3 pt
  const [spinHeadKicks, setSpinHeadKicks] = useState<number>(1); // +4 pt
  const [speedKickHistory, setSpeedKickHistory] = useState<string[]>([]);

  // Submission State
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [draftSaved, setDraftSaved] = useState<boolean>(true);

  // Active form getters/setters
  const isForm1 = activeFormTab === 1;
  const accuracy = isForm1 ? accuracy1 : accuracy2;
  const setAccuracy = isForm1 ? setAccuracy1 : setAccuracy2;
  const minorCount = isForm1 ? minorCount1 : minorCount2;
  const setMinorCount = isForm1 ? setMinorCount1 : setMinorCount2;
  const majorCount = isForm1 ? majorCount1 : majorCount2;
  const setMajorCount = isForm1 ? setMajorCount1 : setMajorCount2;
  const speedPower = isForm1 ? speedPower1 : speedPower2;
  const setSpeedPower = isForm1 ? setSpeedPower1 : setSpeedPower2;
  const rhythmTempo = isForm1 ? rhythmTempo1 : rhythmTempo2;
  const setRhythmTempo = isForm1 ? setRhythmTempo1 : setRhythmTempo2;
  const expression = isForm1 ? expression1 : expression2;
  const setExpression = isForm1 ? setExpression1 : setExpression2;
  const gamjeomCount = isForm1 ? gamjeomCount1 : gamjeomCount2;
  const setGamjeomCount = isForm1 ? setGamjeomCount1 : setGamjeomCount2;
  const history = isForm1 ? history1 : history2;
  const setHistory = isForm1 ? setHistory1 : setHistory2;

  // Presentation total for active form
  const presentationTotal = Math.min(6.00, Math.round((speedPower + rhythmTempo + expression) * 100) / 100);
  const gamjeomDeduction = gamjeomCount * 0.30;
  const totalScoreCurrentForm = Math.max(0, Math.min(10.00, Math.round((accuracy + presentationTotal - gamjeomDeduction) * 1000) / 1000));

  // 2-form combined average
  const form1Score = Math.max(0, Math.min(10.00, (accuracy1 + speedPower1 + rhythmTempo1 + expression1 - gamjeomCount1 * 0.3)));
  const form2Score = Math.max(0, Math.min(10.00, (accuracy2 + speedPower2 + rhythmTempo2 + expression2 - gamjeomCount2 * 0.3)));
  const finalTwoFormAverage = Math.round(((form1Score + form2Score) / 2) * 1000) / 1000;

  // Speed Kick calculation
  const speedKickTotal = (bodyKicks * 1.0) + (headKicks * 3.0) + (spinHeadKicks * 4.0);

  // Deduction handlers
  const handleMinorDeduction = () => {
    if (accuracy >= 0.10) {
      setAccuracy(prev => Math.round((prev - 0.10) * 100) / 100);
      setMinorCount(prev => prev + 1);
      setHistory(prev => [...prev, 'minor']);
      setDraftSaved(false);
    }
  };

  const handleMajorDeduction = () => {
    if (accuracy >= 0.30) {
      setAccuracy(prev => Math.round((prev - 0.30) * 100) / 100);
      setMajorCount(prev => prev + 1);
      setHistory(prev => [...prev, 'major']);
      setDraftSaved(false);
    }
  };

  const handleUndoDeduction = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    if (last === 'minor') {
      setAccuracy(prev => Math.min(4.00, Math.round((prev + 0.10) * 100) / 100));
      setMinorCount(prev => Math.max(0, prev - 1));
    } else if (last === 'major') {
      setAccuracy(prev => Math.min(4.00, Math.round((prev + 0.30) * 100) / 100));
      setMajorCount(prev => Math.max(0, prev - 1));
    }
    setHistory(prev => prev.slice(0, -1));
  };

  const handleGamjeom = () => {
    setGamjeomCount(prev => prev + 1);
    setDraftSaved(false);
  };

  const handleResetGamjeom = () => {
    setGamjeomCount(0);
  };

  // Keyboard shortcut listener for Speed Kicking & Rapid Poomsae scoring
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'speed_kick') {
        if (e.key === '1') {
          setBodyKicks(prev => prev + 1);
          setSpeedKickHistory(prev => [...prev, 'body']);
        } else if (e.key === '2') {
          setHeadKicks(prev => prev + 1);
          setSpeedKickHistory(prev => [...prev, 'head']);
        } else if (e.key === '3') {
          setSpinHeadKicks(prev => prev + 1);
          setSpeedKickHistory(prev => [...prev, 'spin']);
        } else if (e.key === 'Backspace') {
          // Undo speed kick
          if (speedKickHistory.length > 0) {
            const last = speedKickHistory[speedKickHistory.length - 1];
            if (last === 'body') setBodyKicks(p => Math.max(0, p - 1));
            if (last === 'head') setHeadKicks(p => Math.max(0, p - 1));
            if (last === 'spin') setSpinHeadKicks(p => Math.max(0, p - 1));
            setSpeedKickHistory(p => p.slice(0, -1));
          }
        }
      } else {
        // Poomsae shortcuts
        if (e.key === '1' || e.key === 'q') handleMinorDeduction();
        if (e.key === '2' || e.key === 'w') handleMajorDeduction();
        if (e.key === 'z' && (e.ctrlKey || e.metaKey)) handleUndoDeduction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, speedKickHistory, history]);

  // Submit Final Score
  const handleSubmitScore = () => {
    setIsSubmitted(true);
    setConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <AdminSidebar role="juri" />
      <div className="ml-60">
        <AdminTopbar title="Stasiun Penjurian: Penilaian Presisi Touch & Keyboard" />

        <main className="p-6 pb-40 space-y-6">
          {/* Header Info Banner */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-sm px-3 py-1 bg-[#C8102E]">
                ARENA {selectedArena} - LAPANGAN UTAMA
              </Badge>
              <Badge variant="secondary" className="font-bold">
                PARTAI #{currentMatch.match_number}
              </Badge>
              <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                <Shield className="h-4 w-4 text-[#C8102E]" />
                <span className="font-bold text-sm text-gray-900">{judgePosition}: Master Hendra Wijaya</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setMode('poomsae')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'poomsae' ? 'bg-white text-[#C8102E] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Poomsae Form
                </button>
                <button
                  onClick={() => setMode('speed_kick')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'speed_kick' ? 'bg-white text-[#C8102E] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Speed Kicking
                </button>
              </div>

              <div className="bg-red-50 text-[#C8102E] px-4 py-2 rounded-xl font-black text-lg border border-red-100 flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{currentMatch.timer}</span>
              </div>
            </div>
          </div>

          {/* Athlete Profile & YouTube Embedded Video Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Athlete Info */}
            <Card className="lg:col-span-1">
              <CardContent className="p-5 space-y-4">
                <div>
                  <Badge variant="warning" className="text-[10px] mb-2">LIVE PENILAIAN BERJALAN</Badge>
                  <h3 className="text-2xl font-black text-gray-900">{currentMatch.athlete_name}</h3>
                  <p className="text-sm font-semibold text-gray-600">{currentMatch.contingent} • {currentMatch.dan_level}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Kategori:</span>
                    <span className="font-bold text-gray-900">{currentMatch.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Babak:</span>
                    <span className="font-bold text-[#C8102E]">{currentMatch.round}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Gerakan 1:</span>
                    <span className="font-bold text-gray-900">{currentMatch.poomsae_1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Gerakan 2:</span>
                    <span className="font-bold text-gray-900">{currentMatch.poomsae_2}</span>
                  </div>
                </div>

                {/* 2-Form Tabs Toggle if 2 forms */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Pilih Gerakan Dinilai:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveFormTab(1)}
                      className={`p-3 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                        activeFormTab === 1 
                          ? 'bg-[#C8102E] text-white border-[#C8102E] shadow-sm' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Gerakan 1 ({currentMatch.poomsae_1})
                    </button>
                    <button
                      onClick={() => setActiveFormTab(2)}
                      className={`p-3 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                        activeFormTab === 2 
                          ? 'bg-[#C8102E] text-white border-[#C8102E] shadow-sm' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Gerakan 2 ({currentMatch.poomsae_2})
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Embedded YouTube Video for live watching by referee */}
            <Card className="lg:col-span-2">
              <CardHeader className="py-3 px-5 border-b border-gray-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Video className="h-4 w-4 text-red-600" />
                  Video Gerakan Atlet (Tonton & Berikan Penilaian Langsung)
                </CardTitle>
                <span className="text-xs text-gray-400 font-semibold">Terkoneksi ke Server YouTube</span>
              </CardHeader>
              <CardContent className="p-0 h-64 bg-black rounded-b-2xl overflow-hidden">
                <iframe 
                  className="w-full h-full"
                  src={getYouTubeEmbedUrl(currentMatch.youtube_url) || ''}
                  title="Video Atlet"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </CardContent>
            </Card>
          </div>

          {/* ============================================================ */}
          {/* MODE 1: POOMSAE SCORING */}
          {/* ============================================================ */}
          {mode === 'poomsae' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Akurasi (Accuracy) */}
              <Card className="border-t-4 border-t-[#C8102E]">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">01. AKURASI / ACCURACY</CardTitle>
                    <CardDescription>Skor awal 4.00 dikurangi deduksi</CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-bold uppercase">Deduksi</span>
                    <p className="text-sm font-black text-red-600">-{(minorCount * 0.1 + majorCount * 0.3).toFixed(2)}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <span className="text-xs text-gray-500 font-bold uppercase">Nilai Akurasi Saat Ini</span>
                    <div className="text-5xl font-black text-gray-900 my-1">{formatScore2(accuracy)}</div>
                    <span className="text-xs text-gray-400">dari 4.00 maksimal</span>
                  </div>

                  {/* Deduction Buttons (>= 64px for touch) */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleMinorDeduction}
                      className="h-20 p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-900 border-2 border-red-200 flex flex-col justify-between items-center transition-all cursor-pointer active:scale-95 shadow-xs"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black bg-[#C8102E] text-white px-2 py-0.5 rounded">-0.1</span>
                        <span className="text-[10px] font-bold text-gray-500">{minorCount}x</span>
                      </div>
                      <span className="font-black text-xs">DEDUKSI MINOR</span>
                      <span className="text-[9px] text-gray-500">Shortcut: [1]</span>
                    </button>

                    <button
                      onClick={handleMajorDeduction}
                      className="h-20 p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-950 border-2 border-red-300 flex flex-col justify-between items-center transition-all cursor-pointer active:scale-95 shadow-xs"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black bg-red-900 text-white px-2 py-0.5 rounded">-0.3</span>
                        <span className="text-[10px] font-bold text-gray-500">{majorCount}x</span>
                      </div>
                      <span className="font-black text-xs">DEDUKSI MAYOR</span>
                      <span className="text-[9px] text-gray-500">Shortcut: [2]</span>
                    </button>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs font-bold" 
                    onClick={handleUndoDeduction}
                    disabled={history.length === 0}
                  >
                    <Undo2 className="h-3.5 w-3.5" /> Undo Deduksi Terakhir (Ctrl+Z)
                  </Button>
                </CardContent>
              </Card>

              {/* Column 2: Presentasi (Presentation) */}
              <Card className="border-t-4 border-t-amber-500">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">02. PRESENTASI</CardTitle>
                    <CardDescription>3 komponen (0.50 s/d 2.00, langkah 0.05)</CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-bold uppercase">Total</span>
                    <p className="text-sm font-black text-amber-600">{formatScore2(presentationTotal)} / 6.00</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {/* Komponen 1: Kecepatan & Kekuatan */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800">Kecepatan & Kekuatan</span>
                      <span className="font-black text-[#C8102E] text-sm">{formatScore2(speedPower)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 text-sm font-bold" onClick={() => setSpeedPower(p => Math.max(0.50, Math.round((p - 0.05) * 100) / 100))}>-</Button>
                      <input 
                        type="range" 
                        min="0.50" 
                        max="2.00" 
                        step="0.05" 
                        value={speedPower} 
                        onChange={(e) => setSpeedPower(Number(e.target.value))} 
                        className="w-full"
                      />
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 text-sm font-bold" onClick={() => setSpeedPower(p => Math.min(2.00, Math.round((p + 0.05) * 100) / 100))}>+</Button>
                    </div>
                  </div>

                  {/* Komponen 2: Ritme & Tempo */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800">Ritme & Tempo</span>
                      <span className="font-black text-[#C8102E] text-sm">{formatScore2(rhythmTempo)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 text-sm font-bold" onClick={() => setRhythmTempo(p => Math.max(0.50, Math.round((p - 0.05) * 100) / 100))}>-</Button>
                      <input 
                        type="range" 
                        min="0.50" 
                        max="2.00" 
                        step="0.05" 
                        value={rhythmTempo} 
                        onChange={(e) => setRhythmTempo(Number(e.target.value))} 
                        className="w-full"
                      />
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 text-sm font-bold" onClick={() => setRhythmTempo(p => Math.min(2.00, Math.round((p + 0.05) * 100) / 100))}>+</Button>
                    </div>
                  </div>

                  {/* Komponen 3: Ekspresi Energi */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800">Ekspresi Energi</span>
                      <span className="font-black text-[#C8102E] text-sm">{formatScore2(expression)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 text-sm font-bold" onClick={() => setExpression(p => Math.max(0.50, Math.round((p - 0.05) * 100) / 100))}>-</Button>
                      <input 
                        type="range" 
                        min="0.50" 
                        max="2.00" 
                        step="0.05" 
                        value={expression} 
                        onChange={(e) => setExpression(Number(e.target.value))} 
                        className="w-full"
                      />
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 text-sm font-bold" onClick={() => setExpression(p => Math.min(2.00, Math.round((p + 0.05) * 100) / 100))}>+</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Column 3: Penalti Gamjeom & Status Juri */}
              <Card className="border-t-4 border-t-red-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    PENALTI GAM-JEOM
                  </CardTitle>
                  <CardDescription>Keluar garis / lewat batas waktu (-0.30 per pelanggaran)</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
                    <span className="text-xs font-bold text-red-700 uppercase">Pelanggaran Gamjeom</span>
                    <div className="text-4xl font-black text-red-800 my-1">{gamjeomCount}</div>
                    <span className="text-xs text-red-600 font-bold">Total Deduksi: -{gamjeomDeduction.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleGamjeom}
                    className="w-full h-16 rounded-xl bg-[#C8102E] hover:bg-[#9B0C23] text-white font-black text-base transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    + GAMJEOM (-0.30)
                  </button>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs text-gray-500 hover:text-red-700"
                    onClick={handleResetGamjeom}
                  >
                    Batalkan Semua Gamjeom (Reset)
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE 2: SPEED KICKING SCORING */}
          {/* ============================================================ */}
          {mode === 'speed_kick' && (
            <Card className="border-t-4 border-t-amber-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Penjurian Speed Kicking (Pencatatan Tendangan Cepat)
                </CardTitle>
                <CardDescription>Gunakan tombol sentuh atau keyboard shortcut [1], [2], [3] untuk kecepatan maksimal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Body Kick (+1) */}
                  <button
                    onClick={() => { setBodyKicks(p => p + 1); setSpeedKickHistory(p => [...p, 'body']); }}
                    className="h-32 bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Badge variant="default" className="bg-blue-600">+1.0 POIN [Key 1]</Badge>
                    <span className="text-4xl font-black text-blue-900">{bodyKicks}</span>
                    <span className="text-xs font-black text-blue-800 uppercase">Tendangan Badan (Momtong)</span>
                  </button>

                  {/* Head Kick (+3) */}
                  <button
                    onClick={() => { setHeadKicks(p => p + 1); setSpeedKickHistory(p => [...p, 'head']); }}
                    className="h-32 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Badge variant="default" className="bg-amber-600">+3.0 POIN [Key 2]</Badge>
                    <span className="text-4xl font-black text-amber-900">{headKicks}</span>
                    <span className="text-xs font-black text-amber-800 uppercase">Tendangan Kepala (Eolgul)</span>
                  </button>

                  {/* Spin Head Kick (+4) */}
                  <button
                    onClick={() => { setSpinHeadKicks(p => p + 1); setSpeedKickHistory(p => [...p, 'spin']); }}
                    className="h-32 bg-red-50 hover:bg-red-100 border-2 border-red-300 rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Badge variant="default" className="bg-[#C8102E]">+4.0 POIN [Key 3]</Badge>
                    <span className="text-4xl font-black text-red-900">{spinHeadKicks}</span>
                    <span className="text-xs font-black text-red-800 uppercase">Kepala Putar (Dwi Chagi / Dollyo)</span>
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase">Total Skor Speed Kick</span>
                    <h3 className="text-3xl font-black text-gray-900">{speedKickTotal.toFixed(1)} Poin</h3>
                    <p className="text-xs text-gray-500">Total Tendangan: {bodyKicks + headKicks + spinHeadKicks} Tendangan</p>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (speedKickHistory.length > 0) {
                        const last = speedKickHistory[speedKickHistory.length - 1];
                        if (last === 'body') setBodyKicks(p => Math.max(0, p - 1));
                        if (last === 'head') setHeadKicks(p => Math.max(0, p - 1));
                        if (last === 'spin') setSpinHeadKicks(p => Math.max(0, p - 1));
                        setSpeedKickHistory(p => p.slice(0, -1));
                      }
                    }}
                    disabled={speedKickHistory.length === 0}
                  >
                    <Undo2 className="h-4 w-4" /> Undo Tendangan Terakhir (Backspace)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>

        {/* ============================================================ */}
        {/* STICKY BOTTOM SCORE & SUBMIT PANEL */}
        {/* ============================================================ */}
        <div className="fixed bottom-0 left-60 right-0 bg-[#2A2F3A] text-white p-4 shadow-2xl border-t border-gray-700 z-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {mode === 'poomsae' ? `Skor Gerakan ${activeFormTab}` : 'Total Poin Speed Kick'}
              </span>
              <div className="text-3xl font-black text-white leading-none mt-1">
                {mode === 'poomsae' ? formatScore(totalScoreCurrentForm) : speedKickTotal.toFixed(1)}
                <span className="text-sm font-normal text-gray-400 ml-1">/ {mode === 'poomsae' ? '10.000' : 'Poin'}</span>
              </div>
            </div>

            {mode === 'poomsae' && (
              <div className="hidden sm:block border-l border-gray-700 pl-6 text-xs text-gray-300 space-y-0.5">
                <p>Akurasi: <span className="font-bold text-white">{formatScore2(accuracy)}</span></p>
                <p>Presentasi: <span className="font-bold text-white">{formatScore2(presentationTotal)}</span></p>
                <p>Rata-rata 2 Gerakan: <span className="font-bold text-[#E8384F]">{formatScore(finalTwoFormAverage)}</span></p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 font-semibold hidden md:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Draft Tersimpan Otomatis
            </span>

            {isSubmitted ? (
              <Badge variant="success" className="h-12 px-6 text-sm font-black flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> NILAI TERKIRIM & TERKUNCI
              </Badge>
            ) : (
              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogTrigger asChild>
                  <button className="h-14 px-8 rounded-xl bg-[#C8102E] hover:bg-[#9B0C23] text-white font-black text-base shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-2">
                    <Send className="h-5 w-5" /> KIRIM NILAI AKHIR (SUBMIT)
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Konfirmasi Kirim Nilai</DialogTitle>
                    <DialogDescription>
                      Apakah Anda yakin ingin mengirim nilai resmi ini ke sistem pusat? Nilai akan terkunci setelah dikirim.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center my-3">
                    <span className="text-xs text-gray-500 font-bold uppercase">Nilai Akhir Anda</span>
                    <div className="text-4xl font-black text-[#C8102E] my-1">
                      {mode === 'poomsae' ? formatScore(finalTwoFormAverage) : speedKickTotal.toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-600">{currentMatch.athlete_name} ({currentMatch.contingent})</p>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Periksa Kembali</Button>
                    <Button variant="default" onClick={handleSubmitScore}>Ya, Kirim Nilai Resmi</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
