import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function CalendarView() {
 const { data, scoreData } = useAppContext();
 const navigate = useNavigate();
 const [currentDate] = useState(new Date());

 const monthStart = startOfMonth(currentDate);
 const monthEnd = endOfMonth(currentDate);
 const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

 // Get padding days for first week
 const startDayOfWeek = monthStart.getDay(); 
 const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

 return (
 <div 
 
 initial="initial"
 animate="animate"
 className="space-y-8"
 >
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
 <div>
 <h1 className="text-3xl font-bold text-white tracking-tight">Timeline</h1>
 <p className="text-gray-400 font-light mt-1 text-xl">{format(currentDate, 'MMMM yyyy')}</p>
 </div>
 </div>

 <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
 <div key={day} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">
 {day}
 </div>
 ))}
 
 {paddingDays.map(pd => (
 <div key={`pad-${pd}`} className="h-24 md:h-32 rounded-xl bg-transparent border border-transparent"></div>
 ))}

 {monthDays.map(day => {
 const dateStr = format(day, 'yyyy-MM-dd');
 const entry = data.entries[dateStr];
 const score = scoreData.dateScores[dateStr];
 const hasData = entry && entry.status !== 'EMPTY';
 
 let bgClass = "glass-panel border-white/5";
 let borderClass = "";
 let dotClass = "bg-gray-600";
 let scoreText = "";

 if (hasData && score) {
 scoreText = score.total.toString();
 if (score.total >= 80) { bgClass = "bg-green-950/20"; borderClass="border-green-500/20"; dotClass="bg-green-500"; }
 else if (score.total >= 50) { bgClass = "bg-amber-950/20"; borderClass="border-amber-500/20"; dotClass="bg-amber-500"; }
 else { bgClass = "bg-red-950/20"; borderClass="border-red-500/20"; dotClass="bg-red-500"; }
 }
 
 const todayBorder = isToday(day) ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-[#0A0A0A]" : "";

 return (
 <div 
 key={dateStr}
 onClick={() => navigate(`/check-in?date=${dateStr}`)}
 className={`min-h-[80px] sm:min-h-[96px] md:min-h-[128px] rounded-xl border p-1.5 sm:p-2 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] ${bgClass} ${borderClass} ${todayBorder}`}
 >
 <div className="flex justify-between items-start">
 <span className={`text-[10px] sm:text-sm md:text-lg font-medium ${isToday(day) ? 'text-violet-400' : 'text-gray-400'}`}>
 {format(day, 'd')}
 </span>
 {hasData && (
 <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1 ${dotClass}`}></div>
 )}
 </div>
 
 <div className="flex flex-col w-full text-right mt-auto">
 {hasData && score ? (
 <div className={`text-[10px] sm:text-xs md:text-sm font-mono font-bold tracking-tight rounded px-1.5 py-0.5 w-fit ml-auto ${
 score.total >= 80 ? 'text-green-300 bg-green-500/10' : 
 score.total >= 50 ? 'text-amber-300 bg-amber-500/10' : 
 'text-red-300 bg-red-500/10'
 }`}>
 {scoreText}
 </div>
 ) : null}
 </div>
 </div>
 );
 })}
 </div>

 <div className="flex justify-center gap-6 text-sm text-gray-400 pt-8 border-t border-white/10">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-green-500/50 outline outline-1 outline-green-500"></div>
 80+ Score
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-amber-500/50 outline outline-1 outline-amber-500"></div>
 50-79 Score
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-red-500/50 outline outline-1 outline-red-500"></div>
 &lt;50 Score
 </div>
 </div>
 </div>
 );
}
