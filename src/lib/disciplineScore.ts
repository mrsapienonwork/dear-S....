import { DailyEntry, Chapter, Habit } from '../types';
import { getTodayString } from './utils';

export interface ScoreBreakdown {
  habits: number;
  checkIn: number;
  chapters: number;
  activityBonus: number;
  total: number;
  xp: number;
}

export const RANK_BANDS = [
  { max: 30, title: 'Unstable', color: 'text-gray-500', badge: 'bg-gray-500/10 border-gray-500/20' },
  { max: 50, title: 'Starting', color: 'text-amber-500', badge: 'bg-amber-500/10 border-amber-500/20' },
  { max: 70, title: 'Grinding', color: 'text-blue-400', badge: 'bg-blue-500/10 border-blue-500/20' },
  { max: 85, title: 'Focused', color: 'text-violet-400', badge: 'bg-violet-500/10 border-violet-500/20' },
  { max: 100, title: 'Ruthless', color: 'text-red-500', badge: 'bg-red-500/10 border-red-500/20' }
];

export function getRank(score: number) {
  return RANK_BANDS.find(b => score <= b.max) || RANK_BANDS[RANK_BANDS.length - 1];
}

export function calculateDailyScore(
  date: string,
  entry: DailyEntry | undefined,
  allHabits: Habit[],
  allChapters: Chapter[],
): ScoreBreakdown {
  if (!entry) {
    return { habits: 0, checkIn: 0, chapters: 0, activityBonus: 0, total: 0, xp: 0 };
  }

  // 1. Habits Score (max 40)
  const totalHabits = allHabits.length;
  const completedHabits = Object.values(entry.habits || {}).filter(Boolean).length;
  // Make sure not to exceed totalHabits (in case of rogue data)
  const safeCompletedHabits = Math.min(completedHabits, totalHabits);
  const habitsScore = totalHabits > 0 ? Math.round((safeCompletedHabits / totalHabits) * 40) : 0;
  const clampedHabitsScore = Math.min(40, Math.max(0, habitsScore));

  // 2. Daily Check-in Score (max 20)
  const hasCheckedIn = (entry.studyHours && entry.studyHours > 0) || 
                       !!entry.targetText || 
                       !!entry.notes || 
                       !!entry.moodBefore || 
                       !!entry.moodAfter || 
                       entry.status !== 'EMPTY' ||
                       clampedHabitsScore > 0;
  const checkInScore = hasCheckedIn ? 20 : 0;

  // 3. Chapter Completion Score (max 30)
  const chaptersToday = allChapters.filter(c => c.awardedBonusDate === date).length;
  let chaptersScore = 0;
  if (chaptersToday === 1) chaptersScore = 15;
  if (chaptersToday >= 2) chaptersScore = 30;

  // 4. Consistency / Activity Bonus (max 10)
  let activityBonus = 0;
  if (clampedHabitsScore > 0 || hasCheckedIn || chaptersScore > 0) {
    activityBonus = 10;
  }

  let total = clampedHabitsScore + checkInScore + chaptersScore + activityBonus;
  total = Math.max(0, Math.min(100, total));

  const xp = total * 10;

  return { 
    habits: clampedHabitsScore, 
    checkIn: checkInScore, 
    chapters: chaptersScore, 
    activityBonus, 
    total, 
    xp 
  };
}

export function computeAllScores(entries: Record<string, DailyEntry>, chapters: Chapter[], habits: Habit[]) {
  const dateSet = new Set<string>();
  
  // Add all dates from entries
  Object.keys(entries).forEach(d => dateSet.add(d));
  
  // Add all dates from chapter completions
  chapters.forEach(c => {
    if (c.awardedBonusDate) dateSet.add(c.awardedBonusDate);
  });
  
  // Always include today so we can see today's live projected score in dashboard
  dateSet.add(getTodayString());

  const dates = Array.from(dateSet).sort();
  const dateScores: Record<string, ScoreBreakdown> = {};
  let totalXP = 0;

  for (const date of dates) {
    const entry = entries[date]; // might be undefined, calculateDailyScore handles it
    const finalScore = calculateDailyScore(date, entry, habits, chapters);

    dateScores[date] = finalScore;
    totalXP += finalScore.xp;
  }

  return { dateScores, totalXP };
}

