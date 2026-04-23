import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mistake } from '../types';
import { Plus, Trash2, Edit2, CheckCircle2, Circle, AlertOctagon, ListFilter, Search, ChevronDown, ChevronUp, Clock, AlertTriangle, ArrowRight, Activity, Filter, AlignLeft } from 'lucide-react';
import { cn } from '../lib/utils';

type SortOption = 'newest' | 'oldest' | 'unresolved' | 'updated';
type StatusFilter = 'all' | 'resolved' | 'unresolved';

export function Mistakes() {
 const { data, addMistake, updateMistake, deleteMistake } = useAppContext();
 const [activeTab, setActiveTab] = useState<string>('all');
 
 // Filters
 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
 const [sortOption, setSortOption] = useState<SortOption>('unresolved');

 // Modal
 const [showModal, setShowModal] = useState(false);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [mistakeToDelete, setMistakeToDelete] = useState<string | null>(null);

 // Form State
 const [formSubjectId, setFormSubjectId] = useState('');
 const [formChapter, setFormChapter] = useState('');
 const [formTopic, setFormTopic] = useState('');
 const [formTitle, setFormTitle] = useState('');
 const [formDesc, setFormDesc] = useState('');
 const [formReason, setFormReason] = useState('');
 const [formFix, setFormFix] = useState('');

 const subjects = data.subjects;
 const mistakes = data.mistakes || [];

 // Filtered mistakes
 const filteredMistakes = useMemo(() => {
 let result = mistakes;
 if (activeTab !== 'all') {
 result = result.filter(m => m.subjectId === activeTab);
 }
 
 if (statusFilter !== 'all') {
 result = result.filter(m => m.status === statusFilter);
 }

 if (searchQuery.trim()) {
 const q = searchQuery.toLowerCase();
 result = result.filter(m => 
 m.mistakeTitle.toLowerCase().includes(q) ||
 m.chapter.toLowerCase().includes(q) ||
 (m.topic && m.topic.toLowerCase().includes(q)) ||
 m.reason.toLowerCase().includes(q)
 );
 }

 // Sort
 return result.sort((a, b) => {
 if (sortOption === 'newest') return b.createdAt - a.createdAt;
 if (sortOption === 'oldest') return a.createdAt - b.createdAt;
 if (sortOption === 'updated') return b.updatedAt - a.updatedAt;
 if (sortOption === 'unresolved') {
 if (a.status === b.status) return b.createdAt - a.createdAt;
 return a.status === 'unresolved' ? -1 : 1;
 }
 return 0;
 });
 }, [mistakes, activeTab, statusFilter, searchQuery, sortOption]);

 const stats = useMemo(() => {
 let source = mistakes;
 if (activeTab !== 'all') {
 source = mistakes.filter(m => m.subjectId === activeTab);
 }
 const total = source.length;
 const resolved = source.filter(m => m.status === 'resolved').length;
 const unresolved = total - resolved;
 const progress = total === 0 ? 0 : Math.round((resolved / total) * 100);
 return { total, resolved, unresolved, progress };
 }, [mistakes, activeTab]);

 const insights = useMemo(() => {
 const unresolved = mistakes.filter(m => m.status === 'unresolved');
 
 const subjectCounts: Record<string, number> = {};
 unresolved.forEach(m => {
 subjectCounts[m.subjectId] = (subjectCounts[m.subjectId] || 0) + 1;
 });
 
 let topSubjectId = '';
 let topCount = 0;
 Object.entries(subjectCounts).forEach(([id, count]) => {
 if (count > topCount) {
 topCount = count;
 topSubjectId = id;
 }
 });

 const topSubjectName = subjects.find(s => s.id === topSubjectId)?.name || 'None';

 return {
 unresolvedCount: unresolved.length,
 topSubjectName,
 topSubjectCount: topCount,
 recentCount: unresolved.filter(m => Date.now() - m.createdAt < 7 * 24 * 60 * 60 * 1000).length // Last 7 days
 };
 }, [mistakes, subjects]);

 const openAddModal = () => {
 setEditingId(null);
 setFormSubjectId(activeTab !== 'all' ? activeTab : (subjects[0]?.id || ''));
 setFormChapter('');
 setFormTopic('');
 setFormTitle('');
 setFormDesc('');
 setFormReason('');
 setFormFix('');
 setShowModal(true);
 };

 const openEditModal = (mistake: Mistake) => {
 setEditingId(mistake.id);
 setFormSubjectId(mistake.subjectId);
 setFormChapter(mistake.chapter);
 setFormTopic(mistake.topic || '');
 setFormTitle(mistake.mistakeTitle);
 setFormDesc(mistake.mistakeDescription);
 setFormReason(mistake.reason);
 setFormFix(mistake.fixOrCorrection);
 setShowModal(true);
 };

 const saveMistake = (e: React.FormEvent) => {
 e.preventDefault();
 if (!formSubjectId || !formChapter.trim() || !formTitle.trim() || !formDesc.trim() || !formReason.trim() || !formFix.trim()) return;

 if (editingId) {
 const existing = mistakes.find(m => m.id === editingId);
 if (existing) {
 updateMistake({
 ...existing,
 subjectId: formSubjectId,
 chapter: formChapter.trim(),
 topic: formTopic.trim(),
 mistakeTitle: formTitle.trim(),
 mistakeDescription: formDesc.trim(),
 reason: formReason.trim(),
 fixOrCorrection: formFix.trim(),
 updatedAt: Date.now()
 });
 }
 } else {
 addMistake({
 id: crypto.randomUUID(),
 subjectId: formSubjectId,
 chapter: formChapter.trim(),
 topic: formTopic.trim(),
 mistakeTitle: formTitle.trim(),
 mistakeDescription: formDesc.trim(),
 reason: formReason.trim(),
 fixOrCorrection: formFix.trim(),
 status: 'unresolved',
 createdAt: Date.now(),
 updatedAt: Date.now()
 });
 }
 setShowModal(false);
 };

 const toggleResolve = (id: string, currentStatus: string) => {
 const mistake = mistakes.find(m => m.id === id);
 if (!mistake) return;
 updateMistake({ ...mistake, status: currentStatus === 'resolved' ? 'unresolved' : 'resolved', updatedAt: Date.now() });
 };

 const confirmDelete = () => {
 if (mistakeToDelete) {
 deleteMistake(mistakeToDelete);
 setMistakeToDelete(null);
 }
 };

 return (
 <div 
 
 initial="initial"
 animate="animate"
 className="space-y-8 pb-safe max-w-7xl mx-auto"
 >
 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
 <div className="space-y-1.5">
 <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
 Mistake Vault
 {insights.unresolvedCount > 0 && (
 <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
 {insights.unresolvedCount} remaining
 </span>
 )}
 </h1>
 <p className="text-gray-400 font-medium text-base">Track errors. Fix weak points. Revise smarter.</p>
 </div>
 <button 
 
 
 onClick={openAddModal}
 className="flex items-center justify-center gap-2 text-sm font-semibold text-black bg-white hover:bg-gray-100 px-5 py-2.5 rounded-xl shadow-lg shadow-white/5 whitespace-nowrap"
 >
 <Plus className="w-4 h-4 shadow-sm" />
 <span>Add Mistake</span>
 </button>
 </div>

 {/* Tabs */}
 <div className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-hide snap-x relative border-b border-white/5">
 <button
 onClick={() => setActiveTab('all')}
 className={`relative snap-start px-5 py-2.5 rounded-lg whitespace-nowrap text-sm font-medium ${
 activeTab === 'all' 
 ? 'text-white' 
 : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
 }`}
 >
 <span className="relative z-10">All Subjects</span>
 {activeTab === 'all' && (
 <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white z-0" />
 )}
 </button>
 {subjects.map(subject => {
 const isActive = activeTab === subject.id;
 return (
 <button
 key={subject.id}
 onClick={() => setActiveTab(subject.id)}
 className={`relative snap-start px-5 py-2.5 rounded-lg whitespace-nowrap text-sm font-medium ${
 isActive 
 ? 'text-white' 
 : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
 }`}
 >
 <span className="relative z-10">{subject.name}</span>
 {isActive && (
 <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white z-0" />
 )}
 </button>
 );
 })}
 </div>

 {/* Layout Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 
 {/* Main Content Column */}
 <div className="lg:col-span-8 xl:col-span-9 space-y-6">
 
 {/* Utility Row */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div className="relative flex-1 min-w-0 w-full sm:max-w-md">
 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
 <input 
 type="text" 
 placeholder="Search entries, chapters, reasons..." 
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 className="w-full bg-body-dark border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-violet-500/50 focus:bg-white/[0.02] outline-none shadow-sm"
 />
 </div>
 <div className="flex gap-2 w-full sm:w-auto">
 <div className="relative flex-1 sm:flex-none">
 <select 
 value={statusFilter}
 onChange={e => setStatusFilter(e.target.value as StatusFilter)}
 className="w-full sm:w-auto bg-body-dark border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-gray-300 font-medium appearance-none cursor-pointer hover:text-white hover:border-white/20 outline-none"
 >
 <option value="all">All Status</option>
 <option value="unresolved">Unresolved</option>
 <option value="resolved">Resolved</option>
 </select>
 <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
 </div>
 <div className="relative flex-1 sm:flex-none">
 <select 
 value={sortOption}
 onChange={e => setSortOption(e.target.value as SortOption)}
 className="w-full sm:w-auto bg-body-dark border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-gray-300 font-medium appearance-none cursor-pointer hover:text-white hover:border-white/20 outline-none"
 >
 <option value="unresolved">Urgent First</option>
 <option value="newest">Newest First</option>
 <option value="oldest">Oldest First</option>
 <option value="updated">Recently Updated</option>
 </select>
 <ListFilter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
 </div>
 </div>
 </div>

 {/* Mistake List */}
 <div className="space-y-4">
 {mistakes.length === 0 ? (
 // Pure empty state (no mistakes created ever)
 <div 
 
 
 className="flex flex-col items-center justify-center py-20 text-center px-4 glass-panel border border-dashed border-white/10 rounded-2xl"
 >
 <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center mb-5 border border-white/5">
 <AlertOctagon className="w-8 h-8 text-gray-500" />
 </div>
 <h3 className="text-xl font-bold tracking-tight text-white mb-2">Vault is empty</h3>
 <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-6">
 Every mistake is a learning opportunity. Start tracking your errors, understand the root causes, and master your subjects.
 </p>
 <button onClick={openAddModal} className="flex items-center gap-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/15 px-5 py-2.5 rounded-xl border border-white/10">
 <Plus size={16} /> Add First Mistake
 </button>
 </div>
 ) : filteredMistakes.length === 0 ? (
 // No results empty state
 <div 
 
 
 className="flex flex-col items-center justify-center py-16 text-center px-4"
 >
 <Search className="w-12 h-12 text-gray-600 mb-4" />
 <h3 className="text-lg font-semibold text-white mb-1">No matches found</h3>
 <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-3">
 {filteredMistakes.map(mistake => (
 <MistakeCard 
 key={mistake.id} 
 mistake={mistake} 
 subjectName={subjects.find(s => s.id === mistake.subjectId)?.name || 'Unknown'} 
 onEdit={() => openEditModal(mistake)}
 onDelete={() => setMistakeToDelete(mistake.id)}
 onToggleResolve={() => toggleResolve(mistake.id, mistake.status)}
 />
 ))}
 </div>
 )}
 </div>

 </div>

 {/* Right Insights Column (Desktop only really, stacks on mobile) */}
 <div className="lg:col-span-4 xl:col-span-3 space-y-6">
 
 {/* Top Stats Compact */}
 <div className="glass-panel border border-white/5 rounded-2xl p-5 shadow-sm space-y-6">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
 <Activity className="w-4 h-4 text-violet-400" />
 </div>
 <h3 className="text-sm font-bold text-white tracking-wide">Summary</h3>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1">
 <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Total</p>
 <p className="text-2xl font-bold text-white">{stats.total}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Resolved</p>
 <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
 </div>
 </div>

 <div className="pt-2">
 <div className="flex justify-between items-end mb-2">
 <span className="text-xs font-semibold text-gray-400">Progress</span>
 <span className="text-sm font-bold text-white">{stats.progress}%</span>
 </div>
 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
 <div
 style={{ width: `${stats.progress}%` }}
 className="h-full bg-violet-500/80 rounded-full " 
 />
 </div>
 </div>
 </div>

 {/* Helpful Insights Card */}
 {stats.total > 0 && (
 <div className="glass-panel border border-white/5 bg-white/[0.01] rounded-2xl p-5 shadow-sm space-y-5">
 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
 <AlertTriangle size={14} className="text-amber-500/70" /> Needs Attention
 </h3>
 
 <div className="space-y-4">
 {insights.unresolvedCount > 0 ? (
 <>
 <div className="flex items-start gap-3">
 <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
 <div className="text-sm text-gray-300 leading-tight">
 You have <span className="font-bold text-white">{insights.unresolvedCount}</span> unresolved mistakes pending revision.
 </div>
 </div>
 {insights.topSubjectCount > 0 && (
 <div className="flex items-start gap-3">
 <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
 <div className="text-sm text-gray-300 leading-tight">
 <span className="font-bold text-white">{insights.topSubjectName}</span> has the highest number of unresolved errors ({insights.topSubjectCount}).
 </div>
 </div>
 )}
 </>
 ) : (
 <div className="flex items-start gap-3">
 <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
 <div className="text-sm text-gray-300 leading-tight">
 Perfect! All logged mistakes are resolved. Keep up the good momentum.
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 </div>
 </div>

 {/* Add / Edit Modal */}
 
 {showModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
 <div 
 
 
 
 onClick={() => setShowModal(false)}
 className="absolute inset-0 bg-black/80 backdrop-blur-sm"
 />
 <div 
 
 
 
 
 className="relative w-full max-w-2xl bg-body-dark border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
 >
 <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
 <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
 {editingId ? <Edit2 size={18} className="text-violet-400" /> : <Plus size={18} className="text-violet-400" />}
 {editingId ? 'Edit Mistake' : 'Log New Mistake'}
 </h2>
 </div>
 
 <form onSubmit={saveMistake} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
 {/* Context Section */}
 <div className="space-y-4">
 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">1. Context</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.01] p-4 rounded-xl border border-white/5">
 <div className="space-y-1.5">
 <label className="text-[11px] font-medium text-gray-400 pl-1">Subject</label>
 <select 
 required value={formSubjectId} onChange={e => setFormSubjectId(e.target.value)}
 className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 "
 >
 <option value="" disabled hidden>Select Subject</option>
 {subjects.map(s => <option key={s.id} value={s.id} className="bg-body-dark">{s.name}</option>)}
 </select>
 </div>
 <div className="space-y-1.5">
 <label className="text-[11px] font-medium text-gray-400 pl-1">Chapter</label>
 <input 
 required type="text" placeholder="e.g. Current Electricity"
 value={formChapter} onChange={e => setFormChapter(e.target.value)}
 className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 placeholder-gray-600 "
 />
 </div>
 <div className="space-y-1.5 sm:col-span-2">
 <label className="text-[11px] font-medium text-gray-400 pl-1">Topic (Optional)</label>
 <input 
 type="text" placeholder="e.g. Parallel Circuits"
 value={formTopic} onChange={e => setFormTopic(e.target.value)}
 className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50 placeholder-gray-600 "
 />
 </div>
 </div>
 </div>

 {/* Analysis Section */}
 <div className="space-y-4">
 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">2. Analysis</h3>
 
 <div className="space-y-1.5">
 <label className="text-[11px] font-medium text-gray-400 pl-1">Mistake Title (Summarize the error)</label>
 <input 
 required type="text" placeholder="e.g. Used wrong Resistance relation"
 value={formTitle} onChange={e => setFormTitle(e.target.value)}
 className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 font-semibold text-white text-base outline-none focus:border-violet-500/50 placeholder-gray-600 shadow-sm"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-[11px] font-medium text-gray-400 pl-1">Mistake Description (What went wrong?)</label>
 <textarea 
 required rows={2} placeholder="Describe the specific calculation, concept, or step that failed..."
 value={formDesc} onChange={e => setFormDesc(e.target.value)}
 className="w-full bg-white/[0.01] border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 outline-none focus:border-violet-500/50 resize-none placeholder-gray-600 "
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-[11px] font-medium text-red-400/80 pl-1">Root Cause</label>
 <textarea 
 required rows={3} placeholder="Why did you make this mistake?"
 value={formReason} onChange={e => setFormReason(e.target.value)}
 className="w-full bg-red-950/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-200/90 outline-none focus:border-red-500/50 resize-none placeholder-red-900/40 "
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-[11px] font-medium text-green-400/80 pl-1">Fix / Prevent</label>
 <textarea 
 required rows={3} placeholder="How will you ensure it doesn't happen again?"
 value={formFix} onChange={e => setFormFix(e.target.value)}
 className="w-full bg-green-950/10 border border-green-500/20 rounded-lg px-4 py-3 text-sm text-green-200/90 outline-none focus:border-green-500/50 resize-none placeholder-green-900/40 "
 />
 </div>
 </div>
 </div>

 <div className="pt-6 pb-2 flex justify-end gap-3 flex-shrink-0">
 <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-semibold text-gray-400 hover:text-white ">Cancel</button>
 <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-violet-500/20 flex items-center gap-2">
 {editingId ? 'Save Update' : 'Log Mistake'} <ArrowRight size={16} />
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 

 {/* Delete Confirmation Modal */}
 
 {mistakeToDelete && (
 <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
 <div 
 
 
 
 onClick={() => setMistakeToDelete(null)}
 className="absolute inset-0 bg-black/80 backdrop-blur-sm"
 />
 <div 
 
 
 
 
 className="relative w-full max-w-sm bg-body-dark border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col"
 >
 <div className="flex items-center gap-4 mb-4">
 <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
 <Trash2 className="w-5 h-5 text-red-500" />
 </div>
 <h2 className="text-xl font-bold text-white tracking-wide">Delete Mistake?</h2>
 </div>
 <p className="text-sm text-gray-400 mb-8 font-medium leading-relaxed">This action cannot be undone. Removes this context permanently from your vault.</p>
 <div className="flex justify-end gap-3 flex-shrink-0">
 <button onClick={() => setMistakeToDelete(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-white rounded-lg">Cancel</button>
 <button onClick={confirmDelete} className="px-6 py-2.5 bg-red-500/90 text-white text-sm font-bold rounded-lg hover:bg-red-500 shadow-sm">Delete</button>
 </div>
 </div>
 </div>
 )}
 
 </div>
 );
}

function MistakeCard({ mistake, subjectName, onEdit, onDelete, onToggleResolve }: { key?: React.Key, mistake: Mistake, subjectName: string, onEdit: () => void, onDelete: () => void, onToggleResolve: () => void }) {
 const [expanded, setExpanded] = useState(false);
 const isResolved = mistake.status === 'resolved';

 return (
 <div 
 className={cn(
 "group relative bg-white/[0.015] border rounded-xl overflow-hidden",
 isResolved ? "border-green-500/10" : "border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
 )}
 >
 <div 
 className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl", 
 isResolved ? "bg-green-500/30" : "bg-violet-500/40"
 )} 
 />
 
 <div className="p-4 md:px-5 cursor-pointer pl-6" onClick={() => setExpanded(!expanded)}>
 <div className="flex justify-between items-start gap-4">
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-2 mb-1.5">
 <span className={cn(
 "text-[10px] px-2 py-0.5 rounded font-bold tracking-widest uppercase border",
 isResolved ? "bg-green-500/10 text-green-400 border-green-500/10" : "bg-red-500/10 text-red-400 border-red-500/10"
 )}>
 {isResolved ? 'Resolved' : 'Urgent'}
 </span>
 <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300 font-medium">{subjectName}</span>
 <span className="text-[10px] text-gray-500 flex items-center gap-1">
 <Clock size={10} /> {new Date(mistake.createdAt).toLocaleDateString()}
 </span>
 </div>
 
 <h3 className={cn(
 "text-base md:text-lg font-bold tracking-tight mb-1 leading-tight",
 isResolved ? "text-gray-400" : "text-white"
 )}>
 {mistake.mistakeTitle}
 </h3>
 
 <div className="text-xs text-gray-500 font-medium truncate flex items-center gap-2">
 <span className="text-gray-400">{mistake.chapter}</span>
 {mistake.topic && <><span className="w-1 h-1 rounded-full bg-white/10" /> <span>{mistake.topic}</span></>}
 </div>
 </div>
 
 <div className="flex gap-1.5 isolate" onClick={e => e.stopPropagation()}>
 <div className="hidden sm:flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 mr-2">
 <button onClick={onEdit} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 " title="Edit">
 <Edit2 className="w-4 h-4" />
 </button>
 <button onClick={onDelete} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 " title="Delete">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 <button 
 onClick={onToggleResolve} 
 className={cn(
 "p-2 rounded-lg shadow-sm flex items-center justify-center border",
 isResolved 
 ? "bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/30" 
 : "bg-green-600/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50"
 )}
 title={isResolved ? "Mark Unresolved" : "Mark Resolved"}
 >
 {isResolved ? <Circle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
 </button>
 </div>
 </div>
 </div>

 {expanded && (
 <div className="pl-6 pr-4 md:pr-5 pb-5 pt-2">
 <div className="bg-black/30 border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5 shadow-inner">
 
 {/* Context & Description */}
 <div className="p-4 bg-white/[0.01]">
 <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
 <AlignLeft size={12} /> Description
 </h4>
 <p className="text-sm text-gray-300 leading-relaxed">
 {mistake.mistakeDescription}
 </p>
 </div>

 {/* Diagnosis Row */}
 <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
 <div className="p-4 bg-red-950/5">
 <h4 className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest mb-1.5">Root Cause</h4>
 <p className="text-sm text-red-200/90 leading-relaxed font-medium">
 {mistake.reason}
 </p>
 </div>
 <div className="p-4 bg-green-950/5">
 <h4 className="text-[10px] font-bold text-green-500/70 uppercase tracking-widest mb-1.5">Fix / Prevent</h4>
 <p className="text-sm text-green-200/90 leading-relaxed font-medium">
 {mistake.fixOrCorrection}
 </p>
 </div>
 </div>

 </div>

 {/* Mobile actions (visible since they are hidden on hover for mobile) */}
 <div className="flex sm:hidden justify-end gap-3 mt-4 pt-4 border-t border-white/5">
 <button onClick={onEdit} className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1.5">
 <Edit2 size={12} /> Edit
 </button>
 <button onClick={onDelete} className="text-xs font-semibold text-red-400/80 hover:text-red-400 flex items-center gap-1.5">
 <Trash2 size={12} /> Delete
 </button>
 </div>
 </div>
 )}
 </div>
 );
}
