'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { dbService } from '@/lib/db-service';
import { Match, TournamentSettings } from '@/types/database';

export default function JudgeStationPage() {
  const [selectedArena, setSelectedArena] = useState<'A' | 'B' | 'C'>('A');
  const [judgePosition, setJudgePosition] = useState<string>('J1');
  const [judgeName, setJudgeName] = useState<string>('Bambang Sudibyo');
  const [activeFormTab, setActiveFormTab] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'poomsae' | 'speed_kick'>('poomsae');
  
  const [settings, setSettings] = useState<TournamentSettings>(dbService.getSettings());
  const [activeMatch, setActiveMatch] = useState<Match | undefined>(dbService.getCurrentMatch('A'));
  const prevMatchIdRef = useRef<string | undefined>(undefined);

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
  const [bodyKicks, setBodyKicks] = useState<number>(12);
  const [headKicks, setHeadKicks] = useState<number>(4);
  const [spinHeadKicks, setSpinHeadKicks] = useState<number>(1);
  const [speedKickHistory, setSpeedKickHistory] = useState<string[]>([]);

  // Submission State
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [draftSaved, setDraftSaved] = useState<boolean>(true);

  // Sync with cookie session on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/judge_session=([^;]+)/);
      if (match) {
        try {
          const sess = JSON.parse(decodeURIComponent(match[1]));
          if (sess.arena) setSelectedArena(sess.arena);
          if (sess.position) setJudgePosition(sess.position);
          if (sess.judge_code) setJudgeName(`Juri (${sess.judge_code})`);
        } catch {}
      }
    }
  }, []);

  // Subscribe to real-time database
  useEffect(() => {
    const handleSync = () => {
      const current = dbService.getCurrentMatch(selectedArena);
      const currentSettings = dbService.getSettings();
      setSettings(currentSettings);
      setActiveMatch(current);

      if (current) {
        // Auto-switch mode based on category
        if (current.category_type === 'speed_kick') {
          setMode('speed_kick');
        } else {
          setMode('poomsae');
        }

        // If match changed, reset or load this judge's score
        if (prevMatchIdRef.current !== current.id) {
          prevMatchIdRef.current = current.id;
          
          const existingForm1 = current.scores?.form1_scores?.[judgePosition];
          const existingSpeedKick = current.scores?.speed_kick_scores?.[judgePosition];

          if (existingForm1) {
            setIsSubmitted(true);
            setAccuracy1(existingForm1.accuracy);
            setMinorCount1(existingForm1.minor_deductions);
            setMajorCount1(existingForm1.major_deductions);
            setSpeedPower1(existingForm1.speed_power);
            setRhythmTempo1(existingForm1.rhythm_tempo);
            setExpression1(existingForm1.expression_energy);
            setGamjeomCount1(existingForm1.gamjeom_count);
          } else if (existingSpeedKick) {
            setIsSubmitted(true);
            setBodyKicks(existingSpeedKick.body_kicks);
            setHeadKicks(existingSpeedKick.head_kicks);
            setSpinHeadKicks(existingSpeedKick.spin_head_kicks);
          } else {
            // Fresh score state for new match
            setIsSubmitted(false);
            setAccuracy1(4.00);
            setMinorCount1(0);
            setMajorCount1(0);
            setSpeedPower1(1.50);
            setRhythmTempo1(1.50);
            setExpression1(1.50);
            setGamjeomCount1(0);
            setHistory1([]);

            setAccuracy2(4.00);
            setMinorCount2(0);
            setMajorCount2(0);
            setSpeedPower2(1.50);
            setRhythmTempo2(1.50);
            setExpression2(1.50);
            setGamjeomCount2(0);
            setHistory2([]);

            setBodyKicks(0);
            setHeadKicks(0);
            setSpinHeadKicks(0);
            setSpeedKickHistory([]);
            setHasEvaluatedForm2(false);

            // Check draft recovery from localStorage
            try {
              const draftKey = `poomsae_draft_${match.id}_${judgePosition}`;
              const savedDraft = localStorage.getItem(draftKey);
              if (savedDraft) {
                const parsed = JSON.parse(savedDraft);
                if (parsed.form1) {
                  setAccuracy1(parsed.form1.accuracy ?? 4.00);
                  setMinorCount1(parsed.form1.minorCount ?? 0);
                  setMajorCount1(parsed.form1.majorCount ?? 0);
                  setSpeedPower1(parsed.form1.speedPower ?? 1.50);
                  setRhythmTempo1(parsed.form1.rhythmTempo ?? 1.50);
                  setExpression1(parsed.form1.expression ?? 1.50);
                  setGamjeomCount1(parsed.form1.gamjeomCount ?? 0);
                }
                if (parsed.form2) {
                  setAccuracy2(parsed.form2.accuracy ?? 4.00);
                  setMinorCount2(parsed.form2.minorCount ?? 0);
                  setMajorCount2(parsed.form2.majorCount ?? 0);
                  setSpeedPower2(parsed.form2.speedPower ?? 1.50);
                  setRhythmTempo2(parsed.form2.rhythmTempo ?? 1.50);
                  setExpression2(parsed.form2.expression ?? 1.50);
                  setGamjeomCount2(parsed.form2.gamjeomCount ?? 0);
                  setHasEvaluatedForm2(Boolean(parsed.hasEvaluatedForm2));
                }
                if (parsed.speedKick) {
                  setBodyKicks(parsed.speedKick.bodyKicks ?? 0);
                  setHeadKicks(parsed.speedKick.headKicks ?? 0);
                  setSpinHeadKicks(parsed.speedKick.spinHeadKicks ?? 0);
                }
                setDraftSaved(true);
              }
            } catch (err) {
              console.warn('Gagal membaca draf lokal:', err);
            }
          }
        }
      }
    };

    handleSync();
    const unsub = dbService.subscribe(handleSync);
    return () => unsub();
  }, [selectedArena, judgePosition]);

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

  // 2-form combined average with strict 6.00 presentation cap and 3-decimal precision
  const pres1 = Math.min(6.00, Math.round((speedPower1 + rhythmTempo1 + expression1) * 100) / 100);
  const form1Score = Math.max(0, Math.min(10.00, Math.round((accuracy1 + pres1 - gamjeomCount1 * 0.3) * 1000) / 1000));

  const pres2 = Math.min(6.00, Math.round((speedPower2 + rhythmTempo2 + expression2) * 100) / 100);
  const form2Score = Math.max(0, Math.min(10.00, Math.round((accuracy2 + pres2 - gamjeomCount2 * 0.3) * 1000) / 1000));
  
  const formsCount = activeMatch?.forms_count || settings.forms_count || 2;
  const finalScoreResult = formsCount === 1 ? form1Score : Math.round(((form1Score + form2Score) / 2) * 1000) / 1000;

  // Track if Form 2 has been evaluated
  const [hasEvaluatedForm2, setHasEvaluatedForm2] = useState<boolean>(false);

  // Speed Kick calculation from settings
  const bodyPoint = settings.speed_kick_body_point || 1.0;
  const headPoint = settings.speed_kick_head_point || 3.0;
  const spinHeadPoint = settings.speed_kick_spin_head_point || 4.0;
  const speedKickTotal = Math.round(((bodyKicks * bodyPoint) + (headKicks * headPoint) + (spinHeadKicks * spinHeadPoint)) * 10) / 10;

  // Deduction handlers
  const handleMinorDeduction = useCallback(() => {
    if (isSubmitted) return;
    if (accuracy >= 0.10) {
      setAccuracy(prev => Math.round((prev - 0.10) * 100) / 100);
      setMinorCount(prev => prev + 1);
      setHistory(prev => [...prev, 'minor']);
      setDraftSaved(false);
    }
  }, [accuracy, isSubmitted, setAccuracy, setMinorCount, setHistory]);

  const handleMajorDeduction = useCallback(() => {
    if (isSubmitted) return;
    if (accuracy >= 0.30) {
      setAccuracy(prev => Math.round((prev - 0.30) * 100) / 100);
      setMajorCount(prev => prev + 1);
      setHistory(prev => [...prev, 'major']);
      setDraftSaved(false);
    }
  }, [accuracy, isSubmitted, setAccuracy, setMajorCount, setHistory]);

  const handleUndoDeduction = useCallback(() => {
    if (isSubmitted || history.length === 0) return;
    const last = history[history.length - 1];
    if (last === 'minor') {
      setAccuracy(prev => Math.min(4.00, Math.round((prev + 0.10) * 100) / 100));
      setMinorCount(prev => Math.max(0, prev - 1));
    } else if (last === 'major') {
      setAccuracy(prev => Math.min(4.00, Math.round((prev + 0.30) * 100) / 100));
      setMajorCount(prev => Math.max(0, prev - 1));
    }
    setHistory(prev => prev.slice(0, -1));
  }, [isSubmitted, history, setAccuracy, setMinorCount, setMajorCount, setHistory]);

  const handleGamjeom = () => {
    if (isSubmitted) return;
    setGamjeomCount(prev => prev + 1);
    setDraftSaved(false);
  };

  const handleResetGamjeom = () => {
    if (isSubmitted) return;
    setGamjeomCount(0);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted) return;

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
          if (speedKickHistory.length > 0) {
            const last = speedKickHistory[speedKickHistory.length - 1];
            if (last === 'body') setBodyKicks(p => Math.max(0, p - 1));
            if (last === 'head') setHeadKicks(p => Math.max(0, p - 1));
            if (last === 'spin') setSpinHeadKicks(p => Math.max(0, p - 1));
            setSpeedKickHistory(p => p.slice(0, -1));
          }
        }
      } else {
        if (e.key === '1' || e.key === 'q') handleMinorDeduction();
        if (e.key === '2' || e.key === 'w') handleMajorDeduction();
        if (e.key === 'z' && (e.ctrlKey || e.metaKey)) handleUndoDeduction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, speedKickHistory, history, isSubmitted, handleMinorDeduction, handleMajorDeduction, handleUndoDeduction]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (isSubmitted || !activeMatch) return;
    const timeout = setTimeout(() => {
      try {
        const draftKey = `poomsae_draft_${activeMatch.id}_${judgePosition}`;
        const draft = {
          form1: { accuracy: accuracy1, minorCount: minorCount1, majorCount: majorCount1, speedPower: speedPower1, rhythmTempo: rhythmTempo1, expression: expression1, gamjeomCount: gamjeomCount1 },
          form2: { accuracy: accuracy2, minorCount: minorCount2, majorCount: majorCount2, speedPower: speedPower2, rhythmTempo: rhythmTempo2, expression: expression2, gamjeomCount: gamjeomCount2 },
          hasEvaluatedForm2,
          speedKick: { bodyKicks, headKicks, spinHeadKicks },
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setDraftSaved(true);
      } catch {}
    }, 500);
    return () => clearTimeout(timeout);
  }, [accuracy1, minorCount1, majorCount1, speedPower1, rhythmTempo1, expression1, gamjeomCount1,
      accuracy2, minorCount2, majorCount2, speedPower2, rhythmTempo2, expression2, gamjeomCount2,
      bodyKicks, headKicks, spinHeadKicks, hasEvaluatedForm2,
      isSubmitted, activeMatch, judgePosition]);

  // Submit Final Score to Database
  const handleSubmitScore = () => {
    if (!activeMatch) return;

    if (mode === 'poomsae') {
      // Submit Form 1
      dbService.submitJudgeScore(
        activeMatch.id,
        judgePosition,
        {
          judge_id: judgePosition,
          judge_position: judgePosition,
          judge_name: judgeName,
          accuracy: accuracy1,
          minor_deductions: minorCount1,
          major_deductions: majorCount1,
          speed_power: speedPower1,
          rhythm_tempo: rhythmTempo1,
          expression_energy: expression1,
          presentation_total: Math.min(6.0, speedPower1 + rhythmTempo1 + expression1),
          gamjeom_count: gamjeomCount1,
          gamjeom_penalty: gamjeomCount1 * 0.30,
          total_score: form1Score,
          submitted_at: new Date().toISOString(),
        },
        1
      );

      // Submit Form 2 if match has 2 forms
      if (formsCount === 2) {
        dbService.submitJudgeScore(
          activeMatch.id,
          judgePosition,
          {
            judge_id: judgePosition,
            judge_position: judgePosition,
            judge_name: judgeName,
            accuracy: accuracy2,
            minor_deductions: minorCount2,
            major_deductions: majorCount2,
            speed_power: speedPower2,
            rhythm_tempo: rhythmTempo2,
            expression_energy: expression2,
            presentation_total: Math.min(6.0, speedPower2 + rhythmTempo2 + expression2),
            gamjeom_count: gamjeomCount2,
            gamjeom_penalty: gamjeomCount2 * 0.30,
            total_score: form2Score,
            submitted_at: new Date().toISOString(),
          },
          2
        );
      }
    } else {
      // Speed Kick Submit
      dbService.submitSpeedKickScore(
        activeMatch.id,
        judgePosition,
        {
          judge_id: judgePosition,
          judge_position: judgePosition,
          judge_name: judgeName,
          body_kicks: bodyKicks,
          head_kicks: headKicks,
          spin_head_kicks: spinHeadKicks,
          total_points: speedKickTotal,
          submitted_at: new Date().toISOString(),
        }
      );
    }

    // Clear draft from localStorage on successful submit
    try {
      const draftKey = `poomsae_draft_${activeMatch.id}_${judgePosition}`;
      localStorage.removeItem(draftKey);
    } catch {}

    setIsSubmitted(true);
    setConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <AdminSidebar role="juri" />
      <div className="md:ml-60">
        <AdminTopbar title="Stasiun Penjurian: Penilaian Presisi Touch & Keyboard" />

        <main className="p-4 md:p-6 pb-40 space-y-6">
          {/* Header Info Banner */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <Badge variant="default" className="text-xs md:text-sm px-3 py-1 bg-[#C8102E]">
                ARENA {selectedArena}
              </Badge>
              <Badge variant="secondary" className="font-bold text-xs md:text-sm">
                PARTAI #{activeMatch?.match_number || '-'}
              </Badge>
              <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                <Shield className="h-4 w-4 text-[#C8102E]" />
                <span className="font-bold text-xs md:text-sm text-gray-900">
                  Meja {judgePosition} • {judgeName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setMode('poomsae')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'poomsae' ? 'bg-white text-[#C8102E] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Poomsae Form
                </button>
                <button
                  onClick={() => setMode('speed_kick')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'speed_kick' ? 'bg-white text-[#C8102E] shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Speed Kicking
                </button>
              </div>

              <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl font-bold text-xs border border-emerald-200 flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span>ONLINE REALTIME</span>
              </div>
            </div>
          </div>

          {/* Athlete Profile & YouTube Embedded Video Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Athlete Info */}
            <Card className="lg:col-span-1">
              <CardContent className="p-5 space-y-4">
                {activeMatch ? (
                  <>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <Badge variant="warning" className="text-[10px]">LIVE PENILAIAN</Badge>
                        <Badge variant="outline" className="text-[10px] uppercase">{activeMatch.level}</Badge>
                        {activeMatch.participation_type === 'pair' && (
                          <Badge variant="default" className="text-[10px] bg-rose-600">PAIR (2 ATLET)</Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-black text-gray-900">
                        {activeMatch.athlete?.name}
                      </h3>
                      {activeMatch.athlete?.athlete2_name && (
                        <p className="text-base font-bold text-rose-700">
                          & {activeMatch.athlete.athlete2_name}
                        </p>
                      )}

                      <p className="text-xs font-semibold text-gray-600 mt-1">
                        {activeMatch.athlete?.contingent} • {activeMatch.athlete?.dan_level}
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Kategori:</span>
                        <span className="font-bold text-gray-900">{activeMatch.category_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Babak:</span>
                        <span className="font-bold text-[#C8102E] uppercase">{activeMatch.round}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Gerakan 1:</span>
                        <span className="font-bold text-gray-900">{activeMatch.poomsae_1}</span>
                      </div>
                      {activeMatch.poomsae_2 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Gerakan 2:</span>
                          <span className="font-bold text-gray-900">{activeMatch.poomsae_2}</span>
                        </div>
                      )}
                    </div>

                    {/* Form Toggle if 2 forms */}
                    {formsCount === 2 && mode === 'poomsae' && (
                      <div className="pt-2">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Pilih Tab Gerakan Dinilai:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setActiveFormTab(1)}
                            className={`p-2.5 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                              activeFormTab === 1 
                                ? 'bg-[#C8102E] text-white border-[#C8102E] shadow-sm' 
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            Form 1 ({activeMatch.poomsae_1})
                          </button>
                          <button
                            onClick={() => { setActiveFormTab(2); setHasEvaluatedForm2(true); }}
                            className={`p-2.5 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                              activeFormTab === 2 
                                ? 'bg-[#C8102E] text-white border-[#C8102E] shadow-sm' 
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            Form 2 ({activeMatch.poomsae_2 || 'Jang 2'})
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    Menunggu operator memilih partai aktif di Lapangan {selectedArena}...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Embedded YouTube Video */}
            <Card className="lg:col-span-2">
              <CardHeader className="py-2.5 px-4 border-b border-gray-100 flex flex-row items-center justify-between">
                <CardTitle className="text-xs md:text-sm flex items-center gap-2">
                  <Video className="h-4 w-4 text-red-600" />
                  Video YouTube Peserta (Otomatis Tersinkronisasi dengan Operator)
                </CardTitle>
                <span className="text-[11px] text-gray-400 font-semibold hidden sm:inline">Stream Resmi</span>
              </CardHeader>
              <CardContent className="p-0 h-64 md:h-72 bg-black rounded-b-2xl overflow-hidden flex items-center justify-center">
                {activeMatch?.athlete?.youtube_url ? (
                  <iframe 
                    className="w-full h-full"
                    src={getYouTubeEmbedUrl(activeMatch.athlete.youtube_url) || ''}
                    title="Video Atlet"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center p-6 text-gray-400">
                    <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Tautan YouTube peserta belum tersedia untuk partai ini</p>
                  </div>
                )}
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
                    <CardTitle className="text-sm md:text-base">01. AKURASI (ACCURACY)</CardTitle>
                    <CardDescription className="text-xs">Maksimal 4.00 dikurangi deduksi</CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Deduksi</span>
                    <p className="text-xs font-black text-red-600">-{(minorCount * 0.1 + majorCount * 0.3).toFixed(2)}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <span className="text-[11px] text-gray-500 font-bold uppercase">Nilai Akurasi Saat Ini</span>
                    <div className="text-4xl md:text-5xl font-black text-gray-900 my-1">{formatScore2(accuracy)}</div>
                    <span className="text-xs text-gray-400">dari 4.00 maksimal</span>
                  </div>

                  {/* Deduction Buttons (>= 48px for touch) */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={isSubmitted}
                      onClick={handleMinorDeduction}
                      className="h-20 p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-900 border-2 border-red-200 flex flex-col justify-between items-center transition-all cursor-pointer active:scale-95 shadow-xs disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black bg-[#C8102E] text-white px-2 py-0.5 rounded">-0.10</span>
                        <span className="text-[10px] font-bold text-gray-500">{minorCount}x</span>
                      </div>
                      <span className="font-black text-xs">DEDUKSI MINOR</span>
                      <span className="text-[9px] text-gray-500">Shortcut: [1] / [Q]</span>
                    </button>

                    <button
                      disabled={isSubmitted}
                      onClick={handleMajorDeduction}
                      className="h-20 p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-950 border-2 border-red-300 flex flex-col justify-between items-center transition-all cursor-pointer active:scale-95 shadow-xs disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black bg-[#9B0C23] text-white px-2 py-0.5 rounded">-0.30</span>
                        <span className="text-[10px] font-bold text-gray-500">{majorCount}x</span>
                      </div>
                      <span className="font-black text-xs">DEDUKSI MAYOR</span>
                      <span className="text-[9px] text-gray-500">Shortcut: [2] / [W]</span>
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSubmitted || history.length === 0}
                    onClick={handleUndoDeduction}
                    className="w-full text-xs font-bold gap-1 h-9"
                  >
                    <Undo2 className="h-3.5 w-3.5" /> Undo Deduksi Terakhir (Ctrl+Z)
                  </Button>
                </CardContent>
              </Card>

              {/* Column 2: Presentasi (Presentation) */}
              <Card className="border-t-4 border-t-amber-500">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm md:text-base">02. PRESENTASI (PRESENTATION)</CardTitle>
                    <CardDescription className="text-xs">3 komponen (0.50 - 2.00, step 0.05)</CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
                    <p className="text-xs font-black text-amber-600">{presentationTotal.toFixed(2)} / 6.00</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {/* Komponen 1: Kecepatan & Kekuatan */}
                  <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700">Kecepatan & Kekuatan (Speed & Power)</span>
                      <span className="font-mono font-black text-[#C8102E] text-sm">{speedPower.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.50}
                      max={2.00}
                      step={0.05}
                      value={speedPower}
                      disabled={isSubmitted}
                      onChange={(e) => setSpeedPower(parseFloat(e.target.value))}
                      className="w-full accent-[#C8102E] cursor-pointer"
                    />
                  </div>

                  {/* Komponen 2: Ritme & Tempo */}
                  <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700">Ritme & Tempo (Rhythm & Tempo)</span>
                      <span className="font-mono font-black text-[#C8102E] text-sm">{rhythmTempo.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.50}
                      max={2.00}
                      step={0.05}
                      value={rhythmTempo}
                      disabled={isSubmitted}
                      onChange={(e) => setRhythmTempo(parseFloat(e.target.value))}
                      className="w-full accent-[#C8102E] cursor-pointer"
                    />
                  </div>

                  {/* Komponen 3: Ekspresi Energi */}
                  <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700">Ekspresi Energi (Expression & Energy)</span>
                      <span className="font-mono font-black text-[#C8102E] text-sm">{expression.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.50}
                      max={2.00}
                      step={0.05}
                      value={expression}
                      disabled={isSubmitted}
                      onChange={(e) => setExpression(parseFloat(e.target.value))}
                      className="w-full accent-[#C8102E] cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Column 3: Gamjeom Penalty */}
              <Card className="border-t-4 border-t-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm md:text-base">03. PENALTI GAMJEOM</CardTitle>
                  <CardDescription className="text-xs">Deduksi pelanggaran tata tertib (-0.30/kali)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <span className="text-[11px] text-gray-500 font-bold uppercase">Total Penalti Gamjeom</span>
                    <div className="text-3xl md:text-4xl font-black text-rose-600 my-1">
                      -{(gamjeomCount * 0.30).toFixed(2)}
                    </div>
                    <span className="text-xs text-gray-400">{gamjeomCount} pelanggaran</span>
                  </div>

                  <button
                    disabled={isSubmitted}
                    onClick={handleGamjeom}
                    className="w-full h-14 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-400" /> + Tambah Gamjeom (-0.30)
                  </button>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSubmitted || gamjeomCount === 0}
                    onClick={handleResetGamjeom}
                    className="w-full text-xs text-gray-500 hover:text-red-700"
                  >
                    Reset Gamjeom
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
                <CardTitle className="text-sm md:text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Penjurian Speed Kicking On Target
                </CardTitle>
                <CardDescription className="text-xs">
                  Gunakan tombol sentuh atau keyboard shortcut [1], [2], [3] (Parameter dinamis dari pengaturan)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Body Kick */}
                  <button
                    disabled={isSubmitted}
                    onClick={() => { setBodyKicks(p => p + 1); setSpeedKickHistory(p => [...p, 'body']); }}
                    className="h-28 bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-2xl p-3 flex flex-col items-center justify-between cursor-pointer active:scale-95 shadow-sm disabled:opacity-50"
                  >
                    <Badge variant="default" className="bg-blue-600 text-[10px]">+{bodyPoint.toFixed(1)} POIN [Key 1]</Badge>
                    <span className="text-3xl font-black text-blue-900">{bodyKicks}</span>
                    <span className="text-[11px] font-black text-blue-800 uppercase">Tendangan Badan (Momtong)</span>
                  </button>

                  {/* Head Kick */}
                  <button
                    disabled={isSubmitted}
                    onClick={() => { setHeadKicks(p => p + 1); setSpeedKickHistory(p => [...p, 'head']); }}
                    className="h-28 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-2xl p-3 flex flex-col items-center justify-between cursor-pointer active:scale-95 shadow-sm disabled:opacity-50"
                  >
                    <Badge variant="default" className="bg-amber-600 text-[10px]">+{headPoint.toFixed(1)} POIN [Key 2]</Badge>
                    <span className="text-3xl font-black text-amber-900">{headKicks}</span>
                    <span className="text-[11px] font-black text-amber-800 uppercase">Tendangan Kepala (Eolgul)</span>
                  </button>

                  {/* Spin Head Kick */}
                  <button
                    disabled={isSubmitted}
                    onClick={() => { setSpinHeadKicks(p => p + 1); setSpeedKickHistory(p => [...p, 'spin']); }}
                    className="h-28 bg-red-50 hover:bg-red-100 border-2 border-red-300 rounded-2xl p-3 flex flex-col items-center justify-between cursor-pointer active:scale-95 shadow-sm disabled:opacity-50"
                  >
                    <Badge variant="default" className="bg-[#C8102E] text-[10px]">+{spinHeadPoint.toFixed(1)} POIN [Key 3]</Badge>
                    <span className="text-3xl font-black text-red-900">{spinHeadKicks}</span>
                    <span className="text-[11px] font-black text-red-800 uppercase">Kepala Putar (Dwi Chagi)</span>
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Total Skor Speed Kick</span>
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900">{speedKickTotal.toFixed(1)} Poin</h3>
                    <p className="text-xs text-gray-500">Total Tendangan: {bodyKicks + headKicks + spinHeadKicks}</p>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={isSubmitted || speedKickHistory.length === 0}
                    onClick={() => {
                      if (speedKickHistory.length > 0) {
                        const last = speedKickHistory[speedKickHistory.length - 1];
                        if (last === 'body') setBodyKicks(p => Math.max(0, p - 1));
                        if (last === 'head') setHeadKicks(p => Math.max(0, p - 1));
                        if (last === 'spin') setSpinHeadKicks(p => Math.max(0, p - 1));
                        setSpeedKickHistory(p => p.slice(0, -1));
                      }
                    }}
                    className="text-xs font-bold gap-1"
                  >
                    <Undo2 className="h-3.5 w-3.5" /> Undo Tendangan (Backspace)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>

        {/* ============================================================ */}
        {/* STICKY BOTTOM SCORE & SUBMIT PANEL */}
        {/* ============================================================ */}
        <div className="fixed bottom-0 left-0 md:left-60 right-0 bg-[#2A2F3A] text-white p-3 md:p-4 shadow-2xl border-t border-gray-700 z-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 md:gap-6">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {mode === 'poomsae' ? `Skor Form ${activeFormTab}` : 'Total Poin Speed Kick'}
              </span>
              <div className="text-2xl md:text-3xl font-black text-white leading-none mt-1">
                {mode === 'poomsae' ? formatScore(totalScoreCurrentForm) : speedKickTotal.toFixed(1)}
                <span className="text-xs font-normal text-gray-400 ml-1">/ {mode === 'poomsae' ? '10.000' : 'Pts'}</span>
              </div>
            </div>

            {mode === 'poomsae' && (
              <div className="hidden sm:block border-l border-gray-700 pl-4 md:pl-6 text-xs text-gray-300 space-y-0.5">
                <p>Akurasi: <span className="font-bold text-white">{formatScore2(accuracy)}</span></p>
                <p>Presentasi: <span className="font-bold text-white">{formatScore2(presentationTotal)}</span></p>
                {formsCount === 2 && (
                  <p>Rata-rata 2 Form: <span className="font-bold text-[#E8384F]">{formatScore(finalScoreResult)}</span></p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isSubmitted ? (
              <Badge variant="success" className="h-11 px-4 md:px-6 text-xs md:text-sm font-black flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> NILAI RESMI TERKIRIM
              </Badge>
            ) : (
              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogTrigger asChild>
                  <button className="h-11 md:h-12 px-5 md:px-7 rounded-xl bg-[#C8102E] hover:bg-[#9B0C23] text-white font-black text-xs md:text-sm shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-2">
                    <Send className="h-4 w-4" /> KIRIM NILAI RESMI
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Konfirmasi Kirim Nilai Resmi</DialogTitle>
                    <DialogDescription className="text-xs">
                      Apakah Anda yakin ingin mengirim nilai resmi ini ke sistem pusat? Nilai akan otomatis disiarkan ke operator dan layar proyektor.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Warning: Form 2 belum dievaluasi */}
                  {mode === 'poomsae' && formsCount === 2 && !hasEvaluatedForm2 && (
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800">
                        <p className="font-bold">Peringatan: Form 2 belum dievaluasi!</p>
                        <p>Partai ini memerlukan penilaian 2 gerakan, tapi Anda belum membuka tab Form 2. Nilai Form 2 masih default. Apakah Anda yakin ingin melanjutkan?</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center my-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Nilai Akhir Yang Akan Dikirim</span>
                    <div className="text-3xl md:text-4xl font-black text-[#C8102E] my-1">
                      {mode === 'poomsae' ? formatScore(finalScoreResult) : speedKickTotal.toFixed(1)}
                    </div>
                    {mode === 'poomsae' && formsCount === 2 && (
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        <p>Form 1: <span className="font-bold text-gray-700">{formatScore(form1Score)}</span></p>
                        <p>Form 2: <span className="font-bold text-gray-700">{formatScore(form2Score)}</span></p>
                      </div>
                    )}
                    <p className="text-xs font-bold text-gray-700 mt-1">{activeMatch?.athlete?.name}</p>
                    <p className="text-[11px] text-gray-500">{activeMatch?.category_name} • Arena {selectedArena}</p>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>Periksa Lagi</Button>
                    <Button variant="default" size="sm" onClick={handleSubmitScore} className="bg-[#C8102E] hover:bg-[#9B0C23]">
                      Ya, Kirim Sekarang
                    </Button>
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
