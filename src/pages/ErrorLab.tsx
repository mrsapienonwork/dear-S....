import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pageTransition, SYSTEM_EASE } from '../lib/motion';
import { useAppContext } from '../context/AppContext';
import { Microscope, Plus, Search, Filter, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { StudyError } from '../types';
import { CapturePanel } from '../components/error-lab/CapturePanel';
import { DetailPanel } from '../components/error-lab/DetailPanel';
import { SeverityBadge, StatusBadge, TypeBadge } from '../components/error-lab/Badges';

type GroupMode = 'Subject' | 'Status' | 'Severity';

export function ErrorLab() {
  const { data } = useAppContext();
  const errors = data.studyErrors || [];
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [groupMode, setGroupMode] = useState<GroupMode>('Status');

  const filteredErrors = useMemo(() => {
    return errors.filter(e => 
      e.title.toLowerCase().includes(search.toLowerCase()) || 
      e.topic?.toLowerCase().includes(search.toLowerCase()) ||
      e.whatWentWrong.toLowerCase().includes(search.toLowerCase())
    );
  }, [errors, search]);

  const groupedErrors = useMemo(() => {
    const groups: Record<string, StudyError[]> = {};
    if (groupMode === 'Status') {
      groups['Unresolved'] = [];
      groups['Resolved'] = [];
      filteredErrors.forEach(e => groups[e.status].push(e));
    } else if (groupMode === 'Severity') {
      groups['High'] = [];
      groups['Medium'] = [];
      groups['Low'] = [];
      filteredErrors.forEach(e => groups[e.severity].push(e));
    } else if (groupMode === 'Subject') {
      data.subjects.forEach(s => { groups[s.name] = []; });
      groups['Unknown'] = [];
      filteredErrors.forEach(e => {
        const sub = data.subjects.find(s => s.id === e.subjectId);
        if (sub && groups[sub.name]) groups[sub.name].push(e);
        else groups['Unknown'].push(e);
      });
    }
    
    // Clean empty groups for some modes
    const cleanGroups: { name: string; items: StudyError[] }[] = [];
    Object.keys(groups).forEach(key => {
      // always show Unresolved/Resolved even if empty, for UX clarity
      if (groupMode === 'Status' || groups[key].length > 0) {
        cleanGroups.push({ name: key, items: groups[key] });
      }
    });

    return cleanGroups;
  }, [filteredErrors, groupMode, data.subjects]);

  const unresolvedCount = errors.filter(e => e.status === 'Unresolved').length;

  return (
    <div className="h-full flex flex-col font-sans">
      {/* Top Command Strip */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Microscope className="w-8 h-8 text-violet-400" />
            Error Lab
          </h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            Recover weak points. You have <span className="text-rose-400 font-semibold">{unresolvedCount} unresolved</span> issues.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search errors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-black/40 border border-white/5 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors w-full md:w-64"
            />
          </div>
          <button
            onClick={() => { setIsCapturing(true); setSelectedErrorId(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
          >
            <Plus className="w-4 h-4" />
            Log Error
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: List Grouping */}
        <div className="w-full lg:w-1/3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400">Group by:</span>
              <select
                value={groupMode}
                onChange={(e) => setGroupMode(e.target.value as GroupMode)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="Status" className="bg-gray-900">Status</option>
                <option value="Subject" className="bg-gray-900">Subject</option>
                <option value="Severity" className="bg-gray-900">Severity</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
            {errors.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-xl bg-black/20">
                <AlertOctagon className="w-8 h-8 text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm">No weak points logged yet.</p>
                <p className="text-gray-500 text-xs mt-1">Capture your first error to begin.</p>
              </div>
            ) : groupedErrors.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No errors match your search.
              </div>
            ) : (
              groupedErrors.map((group) => (
                <div key={group.name} className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    {group.name} <span className="text-gray-600 ml-1">({group.items.length})</span>
                  </h3>
                  {group.items.length === 0 ? (
                    <div className="py-4 pl-4 text-sm text-gray-600 border-l border-white/5">
                      No errors here.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {group.items.map(error => (
                        <button
                          key={error.id}
                          onClick={() => { setSelectedErrorId(error.id); setIsCapturing(false); }}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            selectedErrorId === error.id 
                            ? 'bg-violet-500/10 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                            : 'bg-black/40 border-white/5 hover:border-white/10 hover:bg-black/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="text-white font-medium leading-snug line-clamp-2">{error.title}</h4>
                            <div className="shrink-0 flex gap-1">
                               {error.status === 'Resolved' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                               {error.status === 'Unresolved' && <AlertOctagon className="w-4 h-4 text-rose-500" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                             <p className="text-xs text-gray-400 truncate">
                               {data.subjects.find(s => s.id === error.subjectId)?.name || 'Subject'}
                             </p>
                             <span className="w-1 h-1 rounded-full bg-gray-600 truncate"></span>
                             <p className="text-xs text-gray-500 truncate">{error.errorType}</p>
                          </div>
                          {error.status === 'Unresolved' && error.severity === 'High' && (
                             <div className="w-full h-0.5 rounded-full bg-rose-500/50 mt-1"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detail or Capture */}
        <div className="w-full lg:w-2/3 h-full min-h-[500px] lg:min-h-0 relative">
           <AnimatePresence mode="wait">
             {isCapturing ? (
               <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                 <CapturePanel onClose={() => setIsCapturing(false)} />
               </motion.div>
             ) : selectedErrorId ? (
               <motion.div key={selectedErrorId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                 <DetailPanel errorId={selectedErrorId} onClose={() => setSelectedErrorId(null)} />
               </motion.div>
             ) : (
               <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center bg-black/20 border border-white/5 rounded-2xl p-6 text-center">
                 <div className="max-w-sm">
                   <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                     <Microscope className="w-8 h-8 text-violet-400 opacity-50" />
                   </div>
                   <h2 className="text-xl font-bold text-white mb-2">Error Lab Active</h2>
                   <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                     Select a weak point from the left to review its root cause and correction, or log a new error to track your recovery.
                   </p>
                   {errors.length > 0 && (
                     <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-left">
                       <h3 className="text-sm font-semibold text-gray-300 mb-3">Pattern Summary</h3>
                       <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Most common type:</span>
                            <span className="text-rose-300 font-medium">
                              {getMostCommon(errors.map(e => e.errorType)) || '--'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Unresolved issues:</span>
                            <span className="text-white font-medium">{unresolvedCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Resolved issues:</span>
                            <span className="text-emerald-400 font-medium">{errors.length - unresolvedCount}</span>
                          </div>
                       </div>
                     </div>
                   )}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

// Simple helper for pattern dashboard
function getMostCommon(arr: string[]): string | null {
  if (!arr.length) return null;
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}
