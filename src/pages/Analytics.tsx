import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { format, subDays, differenceInDays } from 'date-fns';
import { getTodayString, cn } from '../lib/utils';
import { getRank } from '../lib/disciplineScore';
import { Activity, Flame, TrendingUp, TrendingDown, Target, Brain, Award, Zap } from 'lucide-react';

export function Analytics() {
 const { data, scoreData } = useAppContext();
 const todayStr = getTodayString();

 const last14Days = useMemo(() => {
 return Array.from({length: 14}, (_, i) => {
 const d = subDays(new Date(), 13 - i);
 return format(d, 'yyyy-MM-dd');
 });
 }, []);

 const chartData = useMemo(() => {
 return last14Days.map(dStr => {
 const d = new Date(dStr);
 const sc = scoreData.dateScores[dStr];
 const entry = data.entries[dStr];
 return {
 dateStr: dStr,
 name: format(d, 'dd MMM'),
 shortDay: format(d, 'EEE'),
 score: sc ? sc.total : 0,
 hours: entry?.studyHours || 0,
 }
 });
 }, [last14Days, scoreData.dateScores, data.entries]);

 const todayScore = scoreData.dateScores[todayStr]?.total || 0;
 const currentRank = getRank(todayScore);
 
 const last7Days = chartData.slice(-7);
 const prev7Days = chartData.slice(-14, -7);

 const avg7 = Math.round(last7Days.reduce((sum, d) => sum + d.score, 0) / 7);
 const avgPrev7 = Math.round(prev7Days.reduce((sum, d) => sum + d.score, 0) / 7);
 const trend = avg7 - avgPrev7;

 const todayBreakdown = scoreData.dateScores[todayStr] || { habits: 0, checkIn: 0, chapters: 0, activityBonus: 0, total: 0 };

 const currentStreak = useMemo(() => {
 let streak = 0;
 const sortedDates = Object.keys(scoreData.dateScores).sort((a,b) => b.localeCompare(a));
 if (sortedDates.length === 0) return 0;
 
 let startIndex = 0;
 if (sortedDates[0] === todayStr && scoreData.dateScores[todayStr].total === 0) {
 startIndex = 1;
 }
 
 for (let i = startIndex; i < sortedDates.length; i++) {
 const date = sortedDates[i];
 if (i > startIndex) {
 const prevD = new Date(sortedDates[i-1]);
 const currD = new Date(date);
 if (differenceInDays(prevD, currD) > 1) {
 break;
 }
 }
 if (scoreData.dateScores[date].total > 0) {
 streak++;
 } else {
 break;
 }
 }
 return streak;
 }, [scoreData.dateScores, todayStr]);

 const insight = useMemo(() => {
 let hab = 0, chk = 0;
 last7Days.forEach(d => {
 const b = scoreData.dateScores[d.dateStr];
 if (b) {
 hab += b.habits;
 chk += b.checkIn;
 }
 });
 hab /= 7;
 chk /= 7;

 if (hab < 20 && chk > 10) return "Your weakest area right now is habits consistency.";
 if (chk < 10) return "You need to increase your daily study sessions.";
 if (avg7 >= 80) return "You are pushing hard. Maintain this momentum.";
 if (avg7 >= 60) return "Good consistency. Finish more chapters to push your score higher.";
 return "Focus on building a daily rhythm. Consistency beats intensity.";
 }, [last7Days, scoreData.dateScores, avg7]);

 const bestDay = useMemo(() => {
 return [...chartData].sort((a,b) => b.score - a.score)[0];
 }, [chartData]);
 
 const worstDay = useMemo(() => {
 return [...chartData].sort((a,b) => a.score - b.score)[0];
 }, [chartData]);

 return (
 <div 
 
 initial="initial"
 animate="animate"
 className="space-y-6 md:space-y-8 pb-safe"
 >
 {/* A) TOP HERO SECTION */}
 <div className="flex flex-col xl:flex-row gap-6 justify-between xl:items-end pb-2">
 <div>
 <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
 <p className="text-gray-400 font-light mt-1 text-lg">The measure of your resolve.</p>
 </div>
 
 <div className="flex bg-[#111] border border-white/5 rounded-2xl p-4 gap-4 md:gap-8 items-center shadow-lg w-full xl:w-auto justify-between md:justify-start">
 <div className="flex flex-col px-2 md:px-4 items-center">
 <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Score</span>
 <span className="text-3xl font-bold text-white leading-none">{todayScore}</span>
 </div>
 <div className="w-px h-10 bg-white/10"></div>
 <div className="flex flex-col px-2 md:px-4 items-center md:items-start">
 <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Rank</span>
 <span className={cn("text-lg font-bold leading-none", currentRank.color)}>{currentRank.title}</span>
 </div>
 <div className="w-px h-10 bg-white/10 hidden md:block"></div>
 <div className="flex flex-col px-2 md:px-4 items-center md:items-start">
 <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">7D Avg</span>
 <div className="flex items-center gap-2">
 <span className="text-xl font-bold text-white leading-none">{avg7}</span>
 {trend !== 0 && (
 <span className={cn("text-xs font-bold flex items-center", trend > 0 ? "text-green-400" : "text-red-400")}>
 {trend > 0 ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
 {Math.abs(trend)}
 </span>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* B) FIRST ROW CARDS */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div className="glass-panel border border-white/5 rounded-2xl p-5 shadow-sm flex flex-col">
 <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Discipline Score (Last 14 Days)</h3>
 <div className="h-48 sm:h-56 w-full flex-1">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
 <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} minTickGap={15} />
 <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} domain={[0, 100]} />
 <Tooltip 
 contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255, 255, 255, 0.05)', color: '#fff', borderRadius: '8px', padding: '12px' }}
 itemStyle={{ color: '#8b5cf6', fontWeight: 600, fontSize: '14px' }}
 labelStyle={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
 />
 <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#111', strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} />
 </LineChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="glass-panel border border-white/5 rounded-2xl p-5 shadow-sm flex flex-col">
 <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Study Hours (Last 14 Days)</h3>
 <div className="h-48 sm:h-56 w-full flex-1">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
 <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} minTickGap={15} />
 <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
 <Tooltip 
 cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
 contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255, 255, 255, 0.05)', color: '#fff', borderRadius: '8px', padding: '12px' }}
 itemStyle={{ color: '#c4b5fd', fontWeight: 600, fontSize: '14px' }}
 labelStyle={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
 />
 <Bar dataKey="hours" fill="#a78bfa" radius={[2, 2, 0, 0]} maxBarSize={28} isAnimationActive={false} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* C, D, E, F, G row */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {/* C) SCORE BREAKDOWN */}
 <div className="glass-panel border border-white/5 rounded-2xl p-5 flex flex-col shadow-sm">
 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center"><Target size={14} className="mr-2"/> Today's Breakdown</h3>
 <div className="space-y-3 mt-auto">
 <div className="flex justify-between items-center text-sm">
 <span className="text-gray-400">Habits</span>
 <span className="text-white font-medium">+{todayBreakdown.habits}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-gray-400">Study Sessions</span>
 <span className="text-white font-medium">+{todayBreakdown.checkIn}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-gray-400">Chapters</span>
 <span className="text-white font-medium">+{todayBreakdown.chapters}</span>
 </div>
 <div className="flex justify-between items-center text-sm pt-3 border-t border-white/10 mt-1">
 <span className="text-gray-400">Bonus</span>
 <span className="text-violet-400 font-medium">+{todayBreakdown.activityBonus}</span>
 </div>
 </div>
 </div>

 {/* D) CONSISTENCY */}
 <div className="glass-panel border border-white/5 rounded-2xl p-5 flex flex-col shadow-sm">
 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center"><Flame size={14} className="mr-2"/> Consistency</h3>
 <div className="flex flex-col justify-end flex-1 space-y-4">
 <div className="flex items-end justify-between border-b border-white/10 pb-3">
 <div className="flex flex-col">
 <span className="text-xs text-gray-500 font-medium">7-Day Avg</span>
 <span className="text-2xl font-bold text-white mt-1 leading-none">{avg7}</span>
 </div>
 <Activity size={20} className="text-blue-400 opacity-80 mb-0.5" />
 </div>
 <div className="flex items-end justify-between pt-1">
 <div className="flex flex-col">
 <span className="text-xs text-gray-500 font-medium">Current Streak</span>
 <div className="mt-1 flex items-baseline gap-1">
 <span className="text-2xl font-bold text-white leading-none">{currentStreak}</span>
 <span className="text-xs text-gray-400">days</span>
 </div>
 </div>
 <Flame size={20} className="text-orange-400 opacity-80 mb-0.5" />
 </div>
 </div>
 </div>

 {/* F & G) BEST/WORST & HEATMAP */}
 <div className="glass-panel border border-white/5 rounded-2xl p-5 flex flex-col shadow-sm">
 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center"><Award size={14} className="mr-2"/> Last 14 Days</h3>
 <div className="flex justify-between text-sm mb-5">
 <div className="flex flex-col">
 <span className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Best Day</span>
 <div className="flex items-baseline gap-1.5">
 <span className="text-green-400 font-bold text-lg leading-none">{bestDay?.score || 0}</span> 
 <span className="text-gray-500 text-[10px] uppercase">{bestDay?.shortDay || '-'}</span>
 </div>
 </div>
 <div className="flex flex-col items-end">
 <span className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Worst Day</span>
 <div className="flex items-baseline gap-1.5">
 <span className="text-red-400 font-bold text-lg leading-none">{worstDay?.score || 0}</span> 
 <span className="text-gray-500 text-[10px] uppercase">{worstDay?.shortDay || '-'}</span>
 </div>
 </div>
 </div>
 
 <div className="flex gap-1 flex-wrap mt-auto pt-4 border-t border-white/10">
 {chartData.map((d, i) => (
 <div 
 key={i} 
 title={`${d.name}: ${d.score}`}
 className={cn(
 "w-[12.5%] aspect-square rounded-[2px] ",
 d.score >= 80 ? "bg-green-500/80" : 
 d.score >= 50 ? "bg-green-500/40" : 
 d.score >= 20 ? "bg-amber-500/40" : 
 "bg-white/5"
 )}
 />
 ))}
 </div>
 </div>

 {/* E) PERFORMANCE INSIGHT */}
 <div className="glass-panel border border-white/5 rounded-2xl p-5 flex flex-col shadow-sm">
 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center"><Brain size={14} className="mr-2"/> Performance Insight</h3>
 <div className="flex-1 flex flex-col justify-center items-center text-center p-4 bg-black/40 rounded-xl border border-white/5">
 <Zap size={20} className="text-amber-400 mb-3 opacity-90" />
 <p className="text-sm text-gray-300 leading-relaxed font-medium">
 {insight}
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}

