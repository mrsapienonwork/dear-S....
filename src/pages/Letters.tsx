import React, { useState, useMemo } from 'react';
import { Mail, Plus, X, ArrowLeft, Trash2, Edit3 } from 'lucide-react';
import { useLetters } from '../hooks/useLetters';
import { Letter } from '../types';
import { cn } from '../lib/utils';

type ViewState = 'list' | 'create' | 'read' | 'edit';
type FilterType = 'all' | Letter['type'];

const glassCardClasses = "bg-[rgba(255,255,255,0.06)] backdrop-blur-[24px] border border-[rgba(255,255,255,0.1)] shadow-[0_8px_40px_rgba(0,0,0,0.5)] rounded-2xl md:rounded-3xl";
const glassButtonClasses = "bg-[rgba(255,255,255,0.08)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)] text-white rounded-xl";

export function Letters() {
 const { letters, addLetter, deleteLetter, updateLetter } = useLetters();
 
 const [view, setView] = useState<ViewState>('list');
 const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
 const [filter, setFilter] = useState<FilterType>('all');
 
 // Form State
 const [newText, setNewText] = useState('');
 const [newType, setNewType] = useState<Letter['type']>('future');

 const activeLetter = useMemo(() => 
 letters.find(l => l.id === activeLetterId), 
 [letters, activeLetterId]);

 const filteredLetters = useMemo(() => 
 filter === 'all' ? letters : letters.filter(l => l.type === filter),
 [letters, filter]);

 const handleSave = () => {
 if (!newText.trim()) return;
 
 if (view === 'edit' && activeLetterId) {
 updateLetter(activeLetterId, newText.trim(), newType);
 setView('read');
 } else {
 addLetter(newText.trim(), newType);
 setNewText('');
 setNewType('future');
 setView('list');
 }
 };

 const handleEdit = (letter: Letter) => {
 setActiveLetterId(letter.id);
 setNewText(letter.text);
 setNewType(letter.type);
 setView('edit');
 };

 const handleDelete = (id: string) => {
 deleteLetter(id);
 setView('list');
 setActiveLetterId(null);
 };

 const openLetter = (id: string) => {
 setActiveLetterId(id);
 setView('read');
 };

 const getBadgeColor = (type: Letter['type']) => {
 switch (type) {
 case 'future': return 'bg-violet-500/10 text-violet-300 border-violet-500/20';
 case 'reality': return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
 case 'support': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
 }
 };

 const getTypeLabel = (type: Letter['type']) => {
 switch (type) {
 case 'future': return 'Future Me';
 case 'reality': return 'Reality Check';
 case 'support': return 'Support';
 }
 };

 return (
 <div className="max-w-4xl mx-auto flex flex-col h-full min-h-[80vh] relative z-0">
 
 
 {/* ========================================================= */}
 {/* LIST VIEW */}
 {/* ========================================================= */}
 {view === 'list' && (
 <div 
 key="list"
 
 
 
 
 className="flex flex-col h-full"
 >
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pt-4 px-2">
 <div>
 <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Dear S. Letters</h1>
 <p className="text-lg text-white/50 tracking-wide font-light">Messages from you, for you.</p>
 </div>
 <button
 onClick={() => {
 setNewText('');
 setNewType('future');
 setView('create');
 }}
 className={cn(glassButtonClasses, "flex items-center justify-center gap-2 px-6 py-3.5 font-medium shadow-[0_0_20px_rgba(255,255,255,0.05)]")}
 >
 <Plus size={18} />
 New Letter
 </button>
 </div>

 {/* Filters */}
 {letters.length > 0 && (
 <div className="flex items-center gap-2 md:gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide px-2">
 {(['all', 'future', 'reality', 'support'] as const).map((t) => (
 <button
 key={t}
 onClick={() => setFilter(t)}
 className={cn(
 "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border",
 filter === t 
 ? "bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
 : "bg-transparent text-white/40 border-transparent hover:text-white/70 hover:bg-white/5"
 )}
 >
 {t === 'all' ? 'All Letters' : getTypeLabel(t)}
 </button>
 ))}
 </div>
 )}

 {/* List */}
 {letters.length === 0 ? (
 <div className={cn(glassCardClasses, "flex-1 flex flex-col items-center justify-center p-12 text-center mt-4 border-dashed border-white/20")}>
 <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-inner">
 <Mail size={32} className="text-white/30" />
 </div>
 <h3 className="text-2xl font-semibold text-white/90 mb-2 tracking-tight">No letters yet</h3>
 <p className="text-white/50">Write your first true message to yourself.</p>
 </div>
 ) : filteredLetters.length === 0 ? (
 <div className={cn(glassCardClasses, "flex-1 flex flex-col items-center justify-center p-12 text-center mt-4")}>
 <h3 className="text-xl font-medium text-white/70 mb-2">No letters found</h3>
 <p className="text-white/40">Try changing your filter.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-2 pb-12">
 {filteredLetters.map((letter) => (
 <div 
 key={letter.id} 
 onClick={() => openLetter(letter.id)}
 className={cn(
 glassCardClasses,
 "p-6 cursor-pointer group hover:shadow-lg hover:border-white/20 hover:bg-white/[0.08]"
 )}
 >
 <div className="flex items-center justify-between mb-5">
 <span className={cn("text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md border", getBadgeColor(letter.type))}>
 {getTypeLabel(letter.type)}
 </span>
 <span className="text-xs font-medium text-white/30">
 {new Date(letter.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
 </span>
 </div>
 <p className="text-white/70 text-base leading-relaxed line-clamp-2 font-light group-hover:text-white/90 ">
 "{letter.text}"
 </p>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* ========================================================= */}
 {/* CREATE / EDIT VIEW */}
 {/* ========================================================= */}
 {(view === 'create' || view === 'edit') && (
 <div 
 key="compose"
 
 
 
 
 className="flex flex-col h-full max-w-3xl mx-auto w-full pt-4 px-2"
 >
 <button 
 onClick={() => setView('list')}
 className="flex items-center gap-2 text-white/50 hover:text-white mb-8 w-fit text-sm font-medium"
 >
 <ArrowLeft size={16} /> Back to Letters
 </button>

 <div className="mb-8">
 <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
 {view === 'create' ? 'Write a Letter' : 'Edit Letter'}
 </h1>
 <p className="text-white/50 font-light">Say something honest to yourself.</p>
 </div>

 <div className={cn(glassCardClasses, "p-6 md:p-10 space-y-8")}>
 
 <div className="space-y-4">
 <label className="text-xs tracking-widest text-white/40 font-semibold uppercase">Category</label>
 <div className="grid grid-cols-3 gap-3">
 {(['future', 'reality', 'support'] as const).map((type) => (
 <button
 key={type}
 onClick={() => setNewType(type)}
 className={cn(
 "py-3 px-2 rounded-xl text-sm font-medium border flex items-center justify-center text-center",
 newType === type 
 ? getBadgeColor(type) 
 : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
 )}
 >
 {getTypeLabel(type)}
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-4">
 <label className="text-xs tracking-widest text-white/40 font-semibold uppercase">Your Message</label>
 <textarea
 value={newText}
 onChange={(e) => setNewText(e.target.value)}
 placeholder="Dear S., what do you want to say to yourself?"
 className="w-full h-64 bg-black/20 border border-white/5 rounded-2xl p-6 text-lg text-white/90 leading-relaxed placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 resize-none "
 />
 </div>

 <button
 onClick={handleSave}
 disabled={!newText.trim()}
 className={cn(
 "w-full py-4 rounded-xl font-semibold tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)]",
 newText.trim() 
 ? "bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
 : "bg-white/10 text-white/30 cursor-not-allowed"
 )}
 >
 {view === 'create' ? 'Seal Letter' : 'Save Changes'}
 </button>
 </div>
 </div>
 )}

 {/* ========================================================= */}
 {/* READ VIEW */}
 {/* ========================================================= */}
 {view === 'read' && activeLetter && (
 <div 
 key="read"
 
 
 
 
 className="flex flex-col h-full max-w-3xl mx-auto w-full pt-4 px-2"
 >
 <div className="flex items-center justify-between mb-8">
 <button 
 onClick={() => setView('list')}
 className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium"
 >
 <ArrowLeft size={16} /> Back
 </button>
 
 <div className="flex items-center gap-3">
 <button
 onClick={() => handleEdit(activeLetter)}
 className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 "
 >
 <Edit3 size={16} />
 </button>
 <button
 onClick={() => handleDelete(activeLetter.id)}
 className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 "
 >
 <Trash2 size={16} />
 </button>
 </div>
 </div>

 <div className={cn(glassCardClasses, "p-8 md:p-14 relative overflow-hidden flex-1 flex flex-col")}>
 {/* Subtle decorative gradient corresponding to type */}
 <div className={cn(
 "absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full opacity-20 pointer-events-none -translate-y-1/2 translate-x-1/3",
 activeLetter.type === 'future' ? 'bg-violet-500' :
 activeLetter.type === 'reality' ? 'bg-rose-500' : 'bg-emerald-500'
 )} />

 <div className="flex items-center gap-4 mb-10 relative z-10">
 <span className={cn("text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-md border", getBadgeColor(activeLetter.type))}>
 {getTypeLabel(activeLetter.type)}
 </span>
 <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
 <span className="text-sm font-medium text-white/40 tracking-wide">
 {new Date(activeLetter.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
 </span>
 </div>

 <div className="flex-1 relative z-10">
 <p className="text-xl md:text-2xl font-light text-white/90 leading-relaxed md:leading-loose whitespace-pre-wrap">
 {activeLetter.text}
 </p>
 </div>

 <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-end relative z-10">
 <span className="text-lg italic text-white/40 font-serif">— Dear S.</span>
 </div>
 </div>
 </div>
 )}
 
 </div>
 );
}
