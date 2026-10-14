import { Match, Athlete, TournamentSettings, ScoreDetail } from '@/types/database';

/**
 * Calculate final score for a single form from multiple judges
 * If judges_per_session === 5 and cutoff_high_low === true:
 *   drop the highest and lowest scores, average the middle 3
 *   If all scores are equal, drop two distinct scores so exactly 3 remain counted!
 * Otherwise (e.g. 3 judges):
 *   calculate the straight arithmetic mean
 */
export function calculateFormScore(
  judgeScores: Record<string, ScoreDetail>,
  settings: TournamentSettings
): {
  averageScore: number;
  accuracyAvg: number;
  presentationAvg: number;
  gamjeomTotal: number;
  details: Record<string, ScoreDetail & { is_highest?: boolean; is_lowest?: boolean; is_counted?: boolean }>;
} {
  const scoreEntries = Object.entries(judgeScores).filter(([_, s]) => s && typeof s.total_score === 'number');
  
  if (scoreEntries.length === 0) {
    return {
      averageScore: 0,
      accuracyAvg: 0,
      presentationAvg: 0,
      gamjeomTotal: 0,
      details: {},
    };
  }

  const scoresWithKeys = scoreEntries.map(([key, s]) => ({
    key,
    ...s,
    is_highest: false,
    is_lowest: false,
    is_counted: true,
  }));

  // If 5 or more judges and cut-off high-low is enabled
  if (scoresWithKeys.length >= 5 && settings.cutoff_high_low) {
    let minIdx = 0;
    let maxIdx = 0;
    for (let i = 1; i < scoresWithKeys.length; i++) {
      if (scoresWithKeys[i].total_score < scoresWithKeys[minIdx].total_score) {
        minIdx = i;
      }
      if (scoresWithKeys[i].total_score > scoresWithKeys[maxIdx].total_score) {
        maxIdx = i;
      }
    }

    // Edge case: if all judges give identical scores, minIdx and maxIdx point to the same index
    // Force them to be two distinct indices so exactly 2 scores are dropped and 3 are counted!
    if (minIdx === maxIdx && scoresWithKeys.length >= 2) {
      minIdx = 0;
      maxIdx = 1;
    }

    scoresWithKeys[minIdx].is_lowest = true;
    scoresWithKeys[minIdx].is_counted = false;
    scoresWithKeys[maxIdx].is_highest = true;
    scoresWithKeys[maxIdx].is_counted = false;
  }

  const counted = scoresWithKeys.filter(s => s.is_counted);
  const sumTotal = counted.reduce((acc, s) => acc + s.total_score, 0);
  const sumAccuracy = counted.reduce((acc, s) => acc + s.accuracy, 0);
  const sumPresentation = counted.reduce((acc, s) => acc + s.presentation_total, 0);
  const sumGamjeom = scoresWithKeys.reduce((acc, s) => acc + (s.gamjeom_penalty || 0), 0);

  const averageScore = counted.length > 0 ? Math.round((sumTotal / counted.length) * 1000) / 1000 : 0;
  const accuracyAvg = counted.length > 0 ? Math.round((sumAccuracy / counted.length) * 1000) / 1000 : 0;
  const presentationAvg = counted.length > 0 ? Math.round((sumPresentation / counted.length) * 1000) / 1000 : 0;

  const resultDetails: Record<string, ScoreDetail & { is_highest?: boolean; is_lowest?: boolean; is_counted?: boolean }> = {};
  for (const s of scoresWithKeys) {
    resultDetails[s.key] = s;
  }

  return {
    averageScore,
    accuracyAvg,
    presentationAvg,
    gamjeomTotal: sumGamjeom,
    details: resultDetails,
  };
}

/**
 * Calculate final combined score for a match (supporting 1 or 2 forms)
 */
export function calculateMatchFinalScore(
  match: Match,
  settings: TournamentSettings
): {
  finalScore: number;
  form1Score: number;
  form2Score: number;
} {
  const form1Result = calculateFormScore(match.scores?.form1_scores || {}, settings);
  const form2Result = calculateFormScore(match.scores?.form2_scores || {}, settings);

  const form1Score = form1Result.averageScore;
  const form2Score = form2Result.averageScore;

  let finalScore = form1Score;
  if (match.forms_count === 2 && form2Score > 0) {
    finalScore = Math.round(((form1Score + form2Score) / 2) * 1000) / 1000;
  }

  return {
    finalScore,
    form1Score,
    form2Score,
  };
}

/**
 * World Taekwondo Tie-Breaker Logic:
 * When two or more athletes have the same final score:
 * 1. Highest Presentation average score (Total Presentasi lebih tinggi)
 * 2. Highest Accuracy average score (Total Akurasi lebih tinggi)
 * 3. Lowest Gamjeom count (Pelanggaran lebih sedikit)
 */
export function compareMatchesWithTieBreaker(a: Match, b: Match, settings: TournamentSettings): number {
  const scoreA = a.final_score ?? 0;
  const scoreB = b.final_score ?? 0;

  if (scoreB !== scoreA) {
    return scoreB - scoreA;
  }

  // Tie-breaker 1: Total Presentation
  const form1A = calculateFormScore(a.scores?.form1_scores || {}, settings);
  const form2A = calculateFormScore(a.scores?.form2_scores || {}, settings);
  const presA = (form1A.presentationAvg + form2A.presentationAvg) / (a.forms_count === 2 ? 2 : 1);

  const form1B = calculateFormScore(b.scores?.form1_scores || {}, settings);
  const form2B = calculateFormScore(b.scores?.form2_scores || {}, settings);
  const presB = (form1B.presentationAvg + form2B.presentationAvg) / (b.forms_count === 2 ? 2 : 1);

  if (Math.abs(presB - presA) > 0.0001) {
    return presB - presA;
  }

  // Tie-breaker 2: Total Accuracy
  const accA = (form1A.accuracyAvg + form2A.accuracyAvg) / (a.forms_count === 2 ? 2 : 1);
  const accB = (form1B.accuracyAvg + form2B.accuracyAvg) / (b.forms_count === 2 ? 2 : 1);
  if (Math.abs(accB - accA) > 0.0001) {
    return accB - accA;
  }

  // Tie-breaker 3: Gamjeom Penalty (less deduction is better)
  const gamjeomA = form1A.gamjeomTotal + form2A.gamjeomTotal;
  const gamjeomB = form1B.gamjeomTotal + form2B.gamjeomTotal;
  return gamjeomA - gamjeomB;
}

/**
 * Cut-off Logic:
 * - If athlete count <= 8: Directly enter Final round.
 * - If athlete count > 8: Preliminary (penyisihan) round -> Top 8 advance to Final.
 * - Final start order: Inverted ranking based on preliminary scores (lowest score plays first, highest score plays last).
 */
export function processCutoffAndGenerateFinals(
  preliminaryMatches: Match[],
  settings: TournamentSettings,
  startingMatchNumber: number = 100
): {
  advancedMatches: Match[];
  rankings: { rank: number; match: Match; score: number; tieBroken: boolean }[];
  isDirectFinal: boolean;
} {
  // Check if direct final (total participants <= 8)
  const isDirectFinal = preliminaryMatches.length <= 8;

  // Filter completed matches
  const completedMatches = [...preliminaryMatches].filter(m => m.status === 'selesai' && (m.final_score ?? 0) > 0);
  
  // Sort with WT Tie-Breaker
  completedMatches.sort((a, b) => compareMatchesWithTieBreaker(a, b, settings));

  const rankings = completedMatches.map((match, idx) => {
    const isTiedWithPrevious = idx > 0 && match.final_score === completedMatches[idx - 1].final_score;
    return {
      rank: idx + 1,
      match,
      score: match.final_score || 0,
      tieBroken: isTiedWithPrevious,
    };
  });

  // Top 8 advance (or all if direct final)
  const top8 = rankings.slice(0, 8);

  // Inverted order for Final: lowest score (Rank 8) plays first, highest (Rank 1) plays last
  const finalOrder = [...top8].reverse();

  const advancedMatches: Match[] = finalOrder.map((item, idx) => ({
    id: `final-${item.match.id}-${Date.now()}-${idx}`,
    match_number: startingMatchNumber + idx + 1,
    arena_code: item.match.arena_code,
    athlete_id: item.match.athlete_id,
    athlete: item.match.athlete,
    category_name: item.match.category_name,
    category_type: item.match.category_type,
    level: item.match.level,
    participation_type: item.match.participation_type,
    round: 'final',
    forms_count: item.match.forms_count,
    poomsae_1: item.match.poomsae_1,
    poomsae_2: item.match.poomsae_2,
    active_form: 1,
    status: 'menunggu',
    is_current: false,
    operator_notes: `Lolos Final (Seed Rank #${item.rank} Penyisihan dgn skor ${item.score.toFixed(3)})`,
    final_score: null,
    scores: { form1_scores: {}, form2_scores: {} },
    started_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return {
    advancedMatches,
    rankings,
    isDirectFinal,
  };
}

/**
 * Pemula / Festival Grouping Logic:
 * Divides pemula athletes into groups of 3 (or 4 if remainder).
 * In each group:
 *   Rank 1: Emas (Gold)
 *   Rank 2: Perak (Silver)
 *   Rank 3: Perunggu (Bronze)
 * All participants receive a medal!
 */
export function groupPemulaAthletes(athletes: Athlete[]): {
  groupName: string;
  athletes: Athlete[];
}[] {
  const groups: { groupName: string; athletes: Athlete[] }[] = [];
  const chunkSize = 3;

  for (let i = 0; i < athletes.length; i += chunkSize) {
    const groupAthletes = athletes.slice(i, i + chunkSize);
    if (groupAthletes.length === 1 && groups.length > 0) {
      groups[groups.length - 1].athletes.push(...groupAthletes);
    } else {
      const groupLetter = String.fromCharCode(65 + groups.length);
      groups.push({
        groupName: `Grup ${groupLetter} (Festival Pemula)`,
        athletes: groupAthletes,
      });
    }
  }

  return groups;
}

export function determinePemulaMedal(rank: number): {
  medal: 'Emas' | 'Perak' | 'Perunggu';
  color: string;
} {
  if (rank === 1) return { medal: 'Emas', color: 'bg-amber-400 text-amber-950 border-amber-300' };
  if (rank === 2) return { medal: 'Perak', color: 'bg-slate-300 text-slate-800 border-slate-400' };
  return { medal: 'Perunggu', color: 'bg-amber-700/80 text-white border-amber-600' };
}
