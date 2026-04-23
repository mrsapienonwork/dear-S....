import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { getTodayString } from '../lib/utils';
import { DisciplineScoreCard } from '../components/score/DisciplineScoreCard';
import { ScoreBreakdownView } from '../components/score/ScoreBreakdownView';

export function Dashboard() {
 const { data, scoreData } = useAppContext();
 const today = getTodayString();
 const todayEntry = data.entries[today];

 const { todayScore, yesterdayScore } = useMemo(() => {
 let checkDate = new Date();
 checkDate.setDate(checkDate.getDate() - 1);
 const yesterday = checkDate.toISOString().split('T')[0];
 
 const tScore = scoreData.dateScores[today] || null;
 const yScore = scoreData.dateScores[yesterday];

 return { todayScore: tScore, yesterdayScore: yScore };
 }, [scoreData.dateScores, today]);

 const stats = useMemo(() => {
 let currentStreak = 0;
 let longestStreak = 0;
 let totalWins = 0;
 let totalLoses = 0;
 let totalPartial = 0;
 let totalHours = 0;
 
 const entriesArr = Object.values(data.entries).sort((a: any, b: any) => a.date.localeCompare(b.date));
 
 // Streaks
 let tempStreak = 0;
 for (const entry of entriesArr as any[]) {
 if (entry.status === 'WIN') {
 tempStreak++;
 longestStreak = Math.max(longestStreak, tempStreak);
 } else {
 tempStreak = 0;
 }
 
 if (entry.status === 'WIN') totalWins++;
 if (entry.status === 'LOSE') totalLoses++;
 if (entry.status === 'PARTIAL') totalPartial++;
 totalHours += entry.studyHours || 0;
 }

 // Current streak (working backwards from today or yesterday)
 let checkDate = new Date();
 // if today is empty, we don't break streak yet if yesterday was win
 if (!data.entries[today] || data.entries[today].status !== 'WIN') {
 checkDate.setDate(checkDate.getDate() - 1);
 }
 
 let countingCurrentStreak = 0;
 while(true) {
 let dStr = checkDate.toISOString().split('T')[0];
 if (data.entries[dStr] && data.entries[dStr].status === 'WIN') {
 countingCurrentStreak++;
 checkDate.setDate(checkDate.getDate() - 1);
 } else {
 break;
 }
 }
 currentStreak = countingCurrentStreak;
 if (data.entries[today] && data.entries[today].status === 'WIN' && currentStreak === 0) {
 currentStreak = 1;
 }

 const totalChapters = data.chapters.length;
 const completedChapters = data.chapters.filter(c => c.status === 'Completed').length;
 
 // Mission Status
 let missionStatus = "Stable";
 const recent = entriesArr.slice(-5) as any[];
 const recentWins = recent.filter(e => e.status === 'WIN').length;
 if (recentWins === 5) missionStatus = "Unstoppable";
 else if (recentWins >= 3) missionStatus = "Locked In";
 else if (recent.every(e => e.status === 'LOSE') && recent.length >= 3) missionStatus = "Falling Behind";
 else if (recent.length >= 2 && recent[recent.length-1].status === 'WIN' && recent[recent.length-2].status === 'LOSE') missionStatus = "Recovering";

 return {
 currentStreak, longestStreak, totalWins, totalLoses, totalPartial, totalHours,
 totalChapters, completedChapters, missionStatus
 };
 }, [data.entries, data.chapters]);

 return (
 <div 
 
 initial="initial"
 animate="animate"
 className="space-y-6 md:space-y-10"
 >
 <header className="space-y-2">
 <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">DEAR S.</h1>
 <p className="text-gray-400 text-base md:text-lg font-light tracking-wide">{data.settings.subtitle}</p>
 </header>

 {/* Hero Stats */}
 {todayScore ? (
 <React.Fragment>
 <div >
 <DisciplineScoreCard todayScore={todayScore} totalXP={scoreData.totalXP} />
 </div>
 <div className="mt-4">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest pl-1">Daily Score Breakdown</h2>
 </div>
 <ScoreBreakdownView score={todayScore} />
 </div>
 </React.Fragment>
 ) : (
 <div className="p-6 md:p-8 rounded-3xl glass-panel border border-white/5 bg-black/20 flex flex-col items-center justify-center text-center gap-4">
 <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
 <span className="text-2xl opacity-50">?</span>
 </div>
 <div className="space-y-1">
 <h3 className="text-lg font-bold text-white">No Score Yet</h3>
 <p className="text-sm text-gray-400 max-w-sm font-medium">Complete tasks, study sessions, and daily check-ins to build your discipline score.</p>
 </div>
 </div>
 )}

 {/* Stats Grid */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
 <StatCard title="Current Streak" value={`${stats.currentStreak} Days`} highlight />
 <StatCard title="Longest Streak" value={`${stats.longestStreak} Days`} />
 <StatCard title="Total XP" value={scoreData.totalXP} colorize />
 <StatCard title="Total Study Hours" value={`${stats.totalHours}h`} />
 </div>

 {/* Today's Overview */}
 <section className="glass-panel border border-white/5 rounded-2xl p-5 md:p-8 shadow-sm">
 <div className="flex justify-between items-start mb-6">
 <h2 className="text-base md:text-xl font-semibold text-white">Today's Protocol</h2>
 <p className="text-[10px] md:text-xs font-semibold text-gray-400 glass-panel px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest">{today}</p>
 </div>
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
 <div className="space-y-5 flex-1 w-full relative">
 <div className="flex items-center gap-3 glass-panel w-fit px-4 py-2.5 rounded-xl border border-white/5">
 <span className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-widest font-semibold">Status:</span>
 <span className={`px-2 py-0.5 rounded text-xs font-bold tracking-wider uppercase
 ${todayEntry?.status === 'WIN' ? 'text-green-400' : 
 todayEntry?.status === 'PARTIAL' ? 'text-amber-400' : 
 todayEntry?.status === 'LOSE' ? 'text-red-400' : 
 'text-gray-500'}`}>
 {todayEntry?.status || 'EMPTY'}
 </span>
 </div>
 {todayEntry?.targetText && (
 <div className="glass-panel p-4 md:p-5 rounded-xl border border-white/5 w-full md:max-w-lg">
 <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">Daily Target</p>
 <p className="text-sm md:text-base text-gray-200 leading-relaxed font-medium break-words">{todayEntry.targetText}</p>
 </div>
 )}
 </div>
 <p className="hidden md:block text-sm text-gray-500 italic max-w-[200px] text-right border-l border-white/5 pl-6 py-2 font-light">
 "Consistency is remembered."
 </p>
 </div>
 </section>

 {/* Secondary Stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <MiniStat title="Wins" value={stats.totalWins} color="text-green-400" />
 <MiniStat title="Partials" value={stats.totalPartial} color="text-amber-400" />
 <MiniStat title="Loses" value={stats.totalLoses} color="text-red-400" />
 <MiniStat title="Chapters" value={`${stats.completedChapters}/${stats.totalChapters}`} color="text-violet-400" />
 </div>
 
 </div>
 );
}

function StatCard({ title, value, highlight, colorize }: { title: string, value: string | number, highlight?: boolean, colorize?: boolean }) {
 let valColor = "text-white";
 if (colorize) {
 if (value === "Unstoppable" || value === "Locked In") valColor = "text-violet-400";
 else if (value === "Falling Behind") valColor = "text-red-400";
 else if (value === "Recovering") valColor = "text-amber-400";
 else if (typeof value === 'number') valColor = "text-emerald-400";
 }

 return (
 <div 
 
 className={`p-5 md:p-6 rounded-2xl ${highlight ? 'glass-panel bg-violet-900/20 border border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]' : 'glass-panel border border-white/5'} flex flex-col justify-center`}
 >
 <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{title}</h3>
 <p className={`text-xl sm:text-2xl md:text-3xl font-bold truncate ${valColor}`}>{value}</p>
 </div>
 );
}

function MiniStat({ title, value, color }: { title: string, value: string | number, color: string }) {
 return (
 <div 
 
 className="p-3 sm:p-4 rounded-xl border border-white/5 glass-panel flex gap-2 sm:gap-3 items-center justify-between shadow-sm"
 >
 <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</span>
 <span className={`text-sm sm:text-lg font-bold ${color}`}>{value}</span>
 </div>
 )
}
