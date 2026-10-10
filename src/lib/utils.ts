import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number | null | undefined, decimals: number = 3): string {
  if (score === null || score === undefined || isNaN(score)) return "0.000";
  return score.toFixed(decimals);
}

export function formatScore2(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) return "0.00";
  return score.toFixed(2);
}

export function calculatePoomsaeFinalScore(
  scores: { total_score: number; is_submitted?: boolean }[],
  cutoffHighLow: boolean = true
): {
  finalScore: number;
  highestIndex: number;
  lowestIndex: number;
  countedScores: number[];
} {
  const validScores = scores.map((s, idx) => ({ score: Number(s.total_score) || 0, originalIdx: idx }));
  
  if (validScores.length === 0) {
    return { finalScore: 0, highestIndex: -1, lowestIndex: -1, countedScores: [] };
  }

  if (validScores.length < 5 || !cutoffHighLow) {
    const sum = validScores.reduce((acc, curr) => acc + curr.score, 0);
    const avg = sum / validScores.length;
    return {
      finalScore: Math.round(avg * 1000) / 1000,
      highestIndex: -1,
      lowestIndex: -1,
      countedScores: validScores.map(v => v.score),
    };
  }

  // Find max and min
  let maxIdx = 0;
  let minIdx = 0;
  for (let i = 1; i < validScores.length; i++) {
    if (validScores[i].score > validScores[maxIdx].score) maxIdx = i;
    if (validScores[i].score < validScores[minIdx].score) minIdx = i;
  }

  // If min and max happen to be the same index (e.g. all equal scores), pick different indices
  if (maxIdx === minIdx && validScores.length >= 2) {
    minIdx = maxIdx === 0 ? 1 : 0;
  }

  const counted = validScores.filter((_, idx) => idx !== maxIdx && idx !== minIdx);
  const sum = counted.reduce((acc, curr) => acc + curr.score, 0);
  const avg = sum / counted.length;

  return {
    finalScore: Math.round(avg * 1000) / 1000,
    highestIndex: maxIdx,
    lowestIndex: minIdx,
    countedScores: counted.map(c => c.score),
  };
}

export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Standard full youtube.com url or youtu.be url
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1&enablejsapi=1&rel=0`;
  }

  // If it's already an embed url
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  return url;
}

export function getInitials(name: string): string {
  if (!name) return "AT";
  return name
    .trim()
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
