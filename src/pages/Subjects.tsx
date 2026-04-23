import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Chapter, Priority } from '../types';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export function Subjects() {
 const { data, addChapter, updateChapter, deleteChapter } = useAppContext();
 const [activeTab, setActiveTab] = useState(data.subjects[0]?.id || '');
 const [showAddForm, setShowAddForm] = useState(false);
 const [newChapName, setNewChapName] = useState('');
 const [newChapPriority, setNewChapPriority] = useState<Priority>('Medium');

 const activeSubjectChapters = useMemo(() => {
 return data.chapters.filter(c => c.subjectId === activeTab);
 }, [data.chapters, activeTab]);

 const stats = useMemo(() => {
 const total = activeSubjectChapters.length;
 const completed = activeSubjectChapters.filter(c => c.status === 'Completed').length;
 const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
 return { total, completed, progress };
 }, [activeSubjectChapters]);

 const handleAddChapter = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newChapName.trim()) return;
 
 addChapter({
 id: crypto.randomUUID(),
 subjectId: activeTab,
 name: newChapName.trim(),
 status: 'Not Started',
 priority: newChapPriority,
 remarks: '',
 lectureDone: false,
 notesDone: false,
 questionsDone: false,
 testDone: false,
 rev1Done: false,
 rev2Done: false,
 rev3Done: false,
 awardedBonusDate: undefined
 });
 setNewChapName('');
 setShowAddForm(false);
 };

 const [scoreToast, setScoreToast] = useState(false);

 const toggleTask = (chapter: Chapter, task: keyof Chapter) => {
 const prevAllDone = chapter.lectureDone && chapter.notesDone && chapter.questionsDone;
 const newChap = { ...chapter, [task]: !chapter[task] };
 const newAllDone = newChap.lectureDone && newChap.notesDone && newChap.questionsDone;
 
 if (!prevAllDone && newAllDone && !chapter.awardedBonusDate && data.settings.enableScoreFeedback !== false) {
 setScoreToast(true);
 setTimeout(() => setScoreToast(false), 2500);
 }

 updateChapter(newChap);
 };

 if (!data.subjects.length) {
 return <div className="text-white">No subjects configured. Go to Settings to add subjects.</div>;
 }

 // Set active tab if current is deleted
 if (!data.subjects.find(s => s.id === activeTab) && data.subjects.length > 0) {
 setActiveTab(data.subjects[0].id);
 }

 return (
 <div 
 
 initial="initial"
 animate="animate"
 className="space-y-6 md:space-y-8"
 >
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative">
 <div>
 <h1 className="text-3xl font-bold text-white tracking-tight">Subject Vault</h1>
 <p className="text-gray-400 font-light mt-1">Conquer one chapter at a time.</p>
 </div>
 
 
 {scoreToast && (
 <div 
 
 
 
 className="absolute right-0 top-0 px-4 py-2 glass-panel border border-violet-500/30 bg-violet-500/10 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.2)] flex items-center gap-2 z-50 text-violet-300 font-bold text-sm tracking-widest"
 >
 +15 Discipline Score
 </div>
 )}
 
 </div>

 {/* Tabs */}
 <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide snap-x relative">
 {data.subjects.map(subject => {
 const isActive = activeTab === subject.id;
 return (
 <button
 key={subject.id}
 onClick={() => setActiveTab(subject.id)}
 className={`relative snap-start px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold border ${
 isActive 
 ? 'text-white border-transparent' 
 : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
 }`}
 >
 <span className="relative z-10">{subject.name}</span>
 {isActive && (
 <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm z-0" />
 )}
 </button>
 );
 })}
 </div>

 {/* Stats Bar */}
 <div className="glass-panel border border-white/5 rounded-2xl p-5 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 shadow-sm relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 -translate-y-1/2 translate-x-1/3 rounded-full blur-3xl pointer-events-none" />
 <div className="flex gap-10 w-full md:w-auto justify-between md:justify-start z-10">
 <div className="text-left">
 <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Total Chapters</p>
 <p key={stats.total} className="text-3xl md:text-4xl font-bold text-white">{stats.total}</p>
 </div>
 <div className="text-right md:text-left">
 <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Completed</p>
 <p key={stats.completed} className="text-3xl md:text-4xl font-bold text-green-400">{stats.completed}</p>
 </div>
 </div>
 <div className="flex-1 w-full space-y-3 z-10">
 <div className="flex justify-between items-end text-xs text-gray-400 font-medium">
 <span className="uppercase tracking-widest">Progress</span>
 <span className="text-lg font-bold text-white">{stats.progress}%</span>
 </div>
 <div className="h-3 glass-panel border border-white/5 rounded-full overflow-hidden">
 <div 
 style={{ width: `${stats.progress}%` }}
 className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)] relative " 
 />
 </div>
 </div>
 </div>

 {/* Chapter List */}
 <div className="space-y-4">
 <div className="flex justify-between items-center px-1 mb-4 md:mb-6 mt-4">
 <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">Syllabus</h2>
 <button 
 
 
 onClick={() => setShowAddForm(!showAddForm)}
 className="flex items-center flex-shrink-0 gap-2 text-sm font-semibold text-black bg-white hover:bg-gray-200 px-4 py-2.5 rounded-xl shadow-sm"
 >
 <div >
 <Plus className="w-4 h-4" />
 </div> 
 <span className="hidden sm:inline">{showAddForm ? 'Cancel' : 'Add Chapter'}</span>
 <span className="sm:hidden">{showAddForm ? 'Cancel' : 'Add'}</span>
 </button>
 </div>

 
 {showAddForm && (
 <form 
 
 
 
 
 onSubmit={handleAddChapter} 
 className="glass-panel border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-5 items-end shadow-sm mb-6 overflow-hidden"
 >
 <div className="flex-1 w-full space-y-2 min-w-0">
 <label className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Chapter Name</label>
 <input 
 type="text" autoFocus
 value={newChapName} onChange={e => setNewChapName(e.target.value)}
 className="w-full glass-input border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 hover:bg-white/[0.02] focus:bg-white/[0.03] placeholder-gray-600"
 placeholder="e.g. Thermodynamics"
 />
 </div>
 <div className="w-full md:w-48 space-y-2 flex-shrink-0">
 <label className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Priority</label>
 <select 
 value={newChapPriority} onChange={e => setNewChapPriority(e.target.value as Priority)}
 className="w-full glass-input border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 hover:bg-white/[0.02] focus:bg-white/[0.03] appearance-none "
 >
 <option value="High">🔴 High</option>
 <option value="Medium">🟡 Medium</option>
 <option value="Low">🔵 Low</option>
 </select>
 </div>
 <button 
 
 
 type="submit" 
 className="w-full md:w-auto px-8 py-3 flex-shrink-0 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-500 shadow-lg shadow-violet-500/20"
 >
 Save
 </button>
 </form>
 )}
 

 {activeSubjectChapters.length === 0 ? (
 <div 
 
 
 className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]"
 >
 <p className="text-gray-500 font-medium tracking-wide">No chapters added yet.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-4">
 {activeSubjectChapters.map(chapter => (
 <div 
 key={chapter.id} 
 className={`group glass-panel border ${chapter.status === 'Completed' ? 'border-green-500/30 bg-green-950/5' : 'border-white/5 hover:border-white/10'} rounded-2xl p-5 md:p-6 shadow-sm`}
 >
 <div className="flex justify-between items-start">
 <div className="flex-1 pr-4">
 <h3 className={`text-lg md:text-xl font-bold tracking-tight ${chapter.status === 'Completed' ? 'text-gray-500 line-through decoration-gray-500/50' : 'text-white'}`}>{chapter.name}</h3>
 <div className="flex flex-wrap items-center gap-2 mt-3">
 <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold tracking-widest uppercase 
 ${chapter.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
 chapter.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
 {chapter.priority}
 </span>
 {chapter.status === 'Completed' && (
 <span className="text-[10px] px-2.5 py-1 rounded-md font-bold tracking-widest uppercase bg-green-500/10 text-green-400 border border-green-500/20">
 Completed
 </span>
 )}
 </div>
 </div>
 <button onClick={() => deleteChapter(chapter.id)} className="p-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 md:opacity-0 md:group-hover:opacity-100 flex-shrink-0 border border-transparent hover:border-red-500/20">
 <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
 </button>
 </div>
 
 <div className="mt-6 pt-5 border-t border-white/5">
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3 select-none">
 <TaskToggle label="Lecture" done={chapter.lectureDone} onClick={() => toggleTask(chapter, 'lectureDone')} />
 <TaskToggle label="Notes" done={chapter.notesDone} onClick={() => toggleTask(chapter, 'notesDone')} />
 <TaskToggle label="Questions" done={chapter.questionsDone} onClick={() => toggleTask(chapter, 'questionsDone')} />
 <TaskToggle label="Test" done={chapter.testDone} onClick={() => toggleTask(chapter, 'testDone')} />
 <div className="w-px bg-white/10 mx-1 hidden lg:block self-stretch"></div>
 <TaskToggle label="Rev 1" done={chapter.rev1Done} onClick={() => toggleTask(chapter, 'rev1Done')} />
 <TaskToggle label="Rev 2" done={chapter.rev2Done} onClick={() => toggleTask(chapter, 'rev2Done')} />
 <TaskToggle label="Rev 3" done={chapter.rev3Done} onClick={() => toggleTask(chapter, 'rev3Done')} />
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 </div>
 );
}

function TaskToggle({ label, done, onClick }: { label: string, done: boolean, onClick: () => void }) {
 return (
 <button 
 onClick={onClick}
 className={`w-full flex w-100 items-center justify-start gap-2.5 px-3 py-3 md:py-2.5 rounded-xl text-xs font-semibold border ${
 done ? 'bg-violet-900/30 text-white border-violet-500/30 shadow-inner' : 'glass-panel text-gray-400 border-white/5 hover:border-white/15 hover:text-white'
 }`}
 >
 <div>
 {done ? <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" /> : <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />}
 </div>
 <span className="truncate">{label}</span>
 </button>
 )
}
