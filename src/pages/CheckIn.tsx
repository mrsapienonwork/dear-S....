import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getTodayString } from '../lib/utils';
import { DailyEntry } from '../types';
import { Save, CheckCircle, Target } from 'lucide-react';
import { calculateDailyScore } from '../lib/disciplineScore';
import { ScoreBreakdownView } from '../components/score/ScoreBreakdownView';

export function CheckIn() {
 const { data, saveEntry, calculateDayStatus } = useAppContext();
 const [searchParams, setSearchParams] = useSearchParams();
 const dateParam = searchParams.get('date');
 const [selectedDate, setSelectedDate] = useState(dateParam || getTodayString());
 const [savedToast, setSavedToast] = useState(false);

 // Form State
 const [entry, setEntry] = useState<Partial<DailyEntry>>({
 date: selectedDate,
 studyHours: 0,
 moodBefore: '',
 moodAfter: '',
 notes: '',
 targetText: '',
 targetCompleted: false,
 habits: {},
 status: 'EMPTY'
 });

 const projectedScore = useMemo(() => {
 return calculateDailyScore(
 selectedDate, 
 { ...entry, studyHours: Number(entry.studyHours) || 0 } as DailyEntry, 
 data.habits, 
 data.chapters
 );
 }, [entry, selectedDate, data.habits, data.chapters]);

 const handleDateChange = (newDate: string) => {
 setSelectedDate(newDate);
 setSearchParams({ date: newDate });
 };

 // Load entry when date changes
 useEffect(() => {
 const existing = data.entries[selectedDate];
 if (existing) {
 setEntry(existing);
 } else {
 setEntry({
 date: selectedDate,
 studyHours: '', // empty or 0
 moodBefore: '',
 moodAfter: '',
 notes: '',
 targetText: '',
 targetCompleted: false,
 habits: {},
 status: 'EMPTY'
 } as any); // allow empty string temporarily
 }
 }, [selectedDate, data.entries]);

 const handleSave = () => {
 const finalEntry: DailyEntry = {
 ...entry,
 studyHours: Number(entry.studyHours) || 0,
 date: selectedDate,
 status: 'EMPTY' // recalculate
 } as DailyEntry;
 
 finalEntry.status = calculateDayStatus(finalEntry);
 
 saveEntry(finalEntry);
 setEntry(finalEntry);
 
 setSavedToast(true);
 setTimeout(() => setSavedToast(false), 2000);
 };

 const handleHabitToggle = (habitId: string) => {
 setEntry(prev => ({
 ...prev,
 habits: {
 ...prev.habits,
 [habitId]: !prev.habits?.[habitId]
 }
 }));
 };

 const currentStatus = calculateDayStatus({ ...entry, studyHours: Number(entry.studyHours) || 0 });

 return (
 <div 
 
 initial="initial"
 animate="animate"
 className="max-w-2xl mx-auto space-y-6"
 >
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-3xl font-bold text-white tracking-tight">Daily Protocol</h1>
 <p className="text-gray-400 font-light">Log your progress. Be honest.</p>
 </div>
 <div className="relative w-full md:w-auto">
 <input 
 type="date" 
 value={selectedDate}
 onChange={(e) => handleDateChange(e.target.value)}
 className="w-full md:w-auto glass-panel border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-medium outline-none focus:border-violet-500 shadow-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
 />
 </div>
 </div>

 <div className="glass-panel border border-white/5 rounded-2xl p-5 sm:p-6 md:p-8 space-y-6 sm:space-y-8 shadow-sm">
 
 {/* Core Stats */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2 min-w-0">
 <label className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Study Hours</label>
 <input 
 type="number" 
 step="0.5"
 min="0"
 value={entry.studyHours}
 onChange={(e) => setEntry({...entry, studyHours: e.target.value as any})}
 className="w-full glass-input border border-white/5 rounded-xl px-4 py-3.5 text-white text-lg outline-none focus:border-violet-500 focus:bg-white/[0.03] "
 placeholder="0.0"
 />
 </div>
 <div className="space-y-2 min-w-0">
 <label className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Daily Target</label>
 <div className="relative">
 <input 
 type="text" 
 value={entry.targetText || ''}
 onChange={(e) => setEntry({...entry, targetText: e.target.value})}
 className="w-full glass-input border border-white/5 rounded-xl pl-4 pr-12 py-3.5 text-white text-lg outline-none focus:border-violet-500 focus:bg-white/[0.03] "
 placeholder="Finish chapter 4..."
 />
 <button 
 onClick={() => setEntry({...entry, targetCompleted: !entry.targetCompleted})}
 className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg ${entry.targetCompleted ? 'text-green-500 bg-green-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
 >
 <CheckCircle className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>

 {/* Habits Checklist */}
 <div className="space-y-4">
 <label className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Habits & Discipline</label>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
 {data.habits.map(habit => {
 const isChecked = entry.habits?.[habit.id] || false;
 return (
 <button
 key={habit.id}
 onClick={() => handleHabitToggle(habit.id)}
 className={`relative overflow-hidden flex items-center gap-4 p-4 rounded-xl border text-left ${
 isChecked 
 ? 'bg-violet-900/20 border-violet-500/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
 : 'glass-panel border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'
 }`}
 >
 <div 
 className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border ${
 isChecked ? 'bg-violet-500 border-violet-500' : 'bg-transparent border-white/20'
 }`}
 >
 {isChecked && (
 <CheckCircle className="w-4 h-4 text-white" />
 )}
 </div>
 <span className="text-sm md:text-base font-medium relative z-10">{habit.name}</span>
 </button>
 );
 })}
 </div>
 </div>

 {/* Notes & Mood */}
 <div className="space-y-4">
 <label className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Debriefing</label>
 <textarea 
 value={entry.notes || ''}
 onChange={(e) => setEntry({...entry, notes: e.target.value})}
 className="w-full h-32 glass-panel border border-white/5 rounded-xl px-4 py-4 text-white outline-none focus:border-violet-500 focus:bg-white/[0.03] resize-none mb-2"
 placeholder="What went well? Where did you fail? No excuses."
 />
 <div className="flex flex-col sm:flex-row gap-4">
 <input 
 type="text" 
 value={entry.moodBefore || ''}
 onChange={(e) => setEntry({...entry, moodBefore: e.target.value})}
 placeholder="Mood before..."
 className="flex-1 min-w-0 glass-input border border-white/5 rounded-xl px-4 py-3.5 text-sm md:text-base text-white outline-none focus:border-violet-500 focus:bg-white/[0.03] "
 />
 <input 
 type="text" 
 value={entry.moodAfter || ''}
 onChange={(e) => setEntry({...entry, moodAfter: e.target.value})}
 placeholder="Mood after..."
 className="flex-1 min-w-0 glass-input border border-white/5 rounded-xl px-4 py-3.5 text-sm md:text-base text-white outline-none focus:border-violet-500 focus:bg-white/[0.03] "
 />
 </div>
 </div>

 {/* Projected Score Preview */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <label className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Projected Discipline Score</label>
 <span className="text-xl font-bold text-white tracking-tighter">{projectedScore.total}</span>
 </div>
 <ScoreBreakdownView score={projectedScore} />
 </div>

 {/* Footer actions & Status preview */}
 <div className="pt-8 mt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
 <div className="flex items-center gap-3 w-full md:w-auto glass-panel px-4 py-3 rounded-xl border border-white/5">
 <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">Preview:</span>
 <span 
 key={currentStatus}
 
 
 
 className={`px-3 py-1 rounded text-xs font-bold tracking-wider uppercase
 ${currentStatus === 'WIN' ? 'bg-green-500/10 text-green-400' : 
 currentStatus === 'PARTIAL' ? 'bg-amber-500/10 text-amber-400' : 
 currentStatus === 'LOSE' ? 'bg-red-500/10 text-red-400' : 
 'bg-gray-800/50 text-gray-400'}`}
 >
 {currentStatus}
 </span>
 </div>

 <button
 
 
 onClick={handleSave}
 className="w-full md:w-auto px-10 py-3.5 glass-button text-white border-transparent bg-white/5 hover:bg-white/10 hover:border-violet-500/50 font-bold rounded-xl flex items-center justify-center gap-2 overflow-hidden relative"
 >
 
 {savedToast ? (
 <div 
 key="saved"
 
 
 
 
 className="flex items-center gap-2"
 >
 <CheckCircle className="w-5 h-5 text-green-400" />
 <span className="text-green-400">Daily Check-in completed: +20 Discipline Score</span>
 </div>
 ) : (
 <div 
 key="save"
 
 
 
 
 className="flex items-center gap-2"
 >
 <Save className="w-5 h-5" />
 <span>Save Protocol</span>
 </div>
 )}
 
 </button>
 </div>

 </div>
 </div>
 );
}
