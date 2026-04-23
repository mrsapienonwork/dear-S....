import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { getDaysInMonth, format, startOfMonth, addDays } from 'date-fns';
import { CheckCircle2, Target } from 'lucide-react';
import { calculateDailyScore } from '../lib/disciplineScore';
import { getTodayString } from '../lib/utils';

export function Habits() {
 const { data } = useAppContext();
 const [currentDate] = useState(new Date());

 const daysInMonth = getDaysInMonth(currentDate);
 const monthStart = startOfMonth(currentDate);

 const days = useMemo(() => {
 return Array.from({ length: daysInMonth }, (_, i) => addDays(monthStart, i));
 }, [daysInMonth, monthStart]);

 const habitStats = useMemo(() => {
 const stats: Record<string, { total: number, percent: number }> = {};
 data.habits.forEach(habit => {
 let completed = 0;
 days.forEach(day => {
 const dStr = format(day, 'yyyy-MM-dd');
 if (data.entries[dStr]?.habits?.[habit.id]) {
 completed++;
 }
 });
 stats[habit.id] = {
 total: completed,
 percent: Math.round((completed / daysInMonth) * 100)
 };
 });
 return stats;
 }, [data.habits, data.entries, days, daysInMonth]);

 const todayStr = getTodayString();
 const todayEntry = data.entries[todayStr];
 const { habits: todayHabitsScore } = useMemo(() => calculateDailyScore(todayStr, todayEntry, data.habits, data.chapters), [todayStr, todayEntry, data.habits, data.chapters]);

 return (
 <div 
 
 initial="initial"
 animate="animate"
 className="space-y-6 md:space-y-8 pb-10"
 >
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
 <div>
 <h1 className="text-3xl font-bold text-white tracking-tight">Discipline Grid</h1>
 <p className="text-gray-400 font-light mt-1">{format(currentDate, 'MMMM yyyy')} - The price of excellence.</p>
 </div>
 <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5">
 <Target className="w-5 h-5 text-emerald-400" />
 <div className="flex flex-col">
 <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Today's Habits Score</span>
 <span className="text-lg font-bold text-white leading-none">{todayHabitsScore}/40</span>
 </div>
 </div>
 </div>

 <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-sm relative pt-2">
 <div className="overflow-x-auto pb-4 custom-scrollbar">
 <table className="w-full text-sm text-left border-collapse">
 <thead>
 <tr className="border-b border-white/5">
 <th className="px-5 py-4 font-semibold text-gray-400 sticky left-0 glass-panel z-20 backdrop-blur-xl min-w-[140px] md:min-w-[200px] border-r border-white/5 shadow-[5px_0_15px_-5px_rgba(0,0,0,0.5)]">Habit / Discipline</th>
 {days.map(day => (
 <th key={day.toISOString()} className="px-1.5 py-4 font-medium text-gray-500 text-center min-w-[36px] md:min-w-[40px]">
 <div className="flex flex-col items-center">
 <span className="text-[9px] md:text-[10px] uppercase tracking-wider">{format(day, 'Eee')}</span>
 <span className={`text-xs md:text-sm mt-1.5 ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'text-violet-400 font-bold bg-violet-500/10 w-6 h-6 rounded flex items-center justify-center border border-violet-500/20' : ''}`}>
 {format(day, 'd')}
 </span>
 </div>
 </th>
 ))}
 <th className="px-4 py-4 font-semibold text-gray-400 text-center sticky right-0 glass-panel z-20 backdrop-blur-xl min-w-[60px] md:min-w-[80px] border-l border-white/5 shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.5)]">%</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/5">
 {data.habits.map(habit => (
 <tr 
 key={habit.id} 
 className="hover:bg-white/[0.02] group"
 >
 <td className="px-5 py-4 font-medium text-gray-300 sticky left-0 glass-panel z-20 backdrop-blur-xl group-hover:bg-[#151515] border-r border-white/5 text-xs md:text-sm shadow-[5px_0_15px_-5px_rgba(0,0,0,0.5)]">
 {habit.name}
 </td>
 {days.map(day => {
 const dateStr = format(day, 'yyyy-MM-dd');
 const isDone = data.entries[dateStr]?.habits?.[habit.id];
 return (
 <td key={dateStr} className="px-1.5 py-3 relative group/cell">
 <div className="absolute inset-x-0 inset-y-1 bg-white/5 opacity-0 group-hover/cell:opacity-100 rounded" />
 <div className="flex justify-center relative z-10">
 <div
 className={`w-5 h-5 md:w-6 md:h-6 rounded border flex items-center justify-center ${
 isDone 
 ? 'bg-violet-500/20 border-violet-500/30 text-violet-400' 
 : 'bg-white/[0.02] border-white/5 text-transparent'
 }`}
 >
 {isDone && <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-violet-400" />}
 </div>
 </div>
 </td>
 )
 })}
 <td className="px-4 py-4 font-bold text-center text-white sticky right-0 glass-panel z-20 backdrop-blur-xl group-hover:bg-[#151515] border-l border-white/5 text-xs md:text-sm shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.5)]">
 {habitStats[habit.id].percent}%
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 <p className="text-[10px] md:text-xs text-gray-500 text-center mt-6 font-medium uppercase tracking-widest">Note: Edit habits on the daily Check-In page.</p>
 </div>
 );
}
