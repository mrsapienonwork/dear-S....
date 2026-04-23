import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StudyError, ErrorType, ErrorSeverity } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { X, Save, Trash2, Edit2, Play, CheckCircle2, History } from 'lucide-react';
import { StatusBadge, TypeBadge, SeverityBadge } from './Badges';

interface DetailPanelProps {
  errorId: string;
  onClose: () => void;
}

export function DetailPanel({ errorId, onClose }: DetailPanelProps) {
  const { data, updateStudyError, deleteStudyError } = useAppContext();
  
  const originalError = data.studyErrors?.find(e => e.id === errorId);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorLocal, setErrorLocal] = useState<StudyError | null>(originalError || null);

  React.useEffect(() => {
    if (!isEditing && originalError) {
      setErrorLocal(originalError);
    }
  }, [originalError, isEditing]);

  if (!originalError || !errorLocal) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-black/40 border border-white/5 rounded-2xl">
        Select an issue to view details.
      </div>
    );
  }

  const subject = data.subjects.find(s => s.id === errorLocal.subjectId)?.name || 'Unknown Subject';
  const chapter = data.chapters.find(c => c.id === errorLocal.chapterId)?.name;

  const handleSave = () => {
    updateStudyError({ ...errorLocal, updatedAt: Date.now() });
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    const newStatus = errorLocal.status === 'Resolved' ? 'Unresolved' : 'Resolved';
    const updated = { ...errorLocal, status: newStatus, updatedAt: Date.now() };
    setErrorLocal(updated);
    updateStudyError(updated);
  };

  const handleDelete = () => {
    deleteStudyError(errorLocal.id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <StatusBadge status={errorLocal.status} />
          {errorLocal.status === 'Resolved' ? (
            <button
              onClick={handleToggleStatus}
              className="px-3 py-1 text-xs border border-white/10 rounded-md hover:bg-white/5 text-gray-400 transition-colors"
            >
              Mark Unresolved
            </button>
          ) : (
            <button
              onClick={handleToggleStatus}
              className="px-3 py-1 text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolve
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
              <Edit2 className="w-5 h-5" />
            </button>
          )}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
              <span className="text-xs text-rose-300 font-medium">Delete?</span>
              <button onClick={handleDelete} className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded hover:bg-rose-400">Yes</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-xs text-gray-400 hover:text-white px-2 py-0.5">No</button>
            </div>
          ) : (
            <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-rose-400 hover:text-rose-300 rounded-md hover:bg-rose-500/10 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-sm">
        
        {/* Header Section */}
        <div>
          {isEditing ? (
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xl font-bold text-white mb-2 focus:border-violet-500 focus:outline-none"
              value={errorLocal.title}
              onChange={e => setErrorLocal({...errorLocal, title: e.target.value})}
            />
          ) : (
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">{errorLocal.title}</h2>
          )}

          {isEditing ? (
            <div className="grid grid-cols-3 gap-3 mt-2">
              <select 
                value={errorLocal.subjectId} 
                onChange={e => setErrorLocal({...errorLocal, subjectId: e.target.value, chapterId: ''})}
                className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-gray-300 outline-none"
              >
                {data.subjects.map(s => <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>)}
              </select>
              <select 
                value={errorLocal.chapterId} 
                onChange={e => setErrorLocal({...errorLocal, chapterId: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-gray-300 outline-none"
              >
                <option value="" className="bg-gray-900">No Chapter</option>
                {data.chapters.filter(c => c.subjectId === errorLocal.subjectId).map(c => (
                  <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
                ))}
              </select>
              <input 
                value={errorLocal.topic || ''}
                placeholder="Topic..."
                onChange={e => setErrorLocal({...errorLocal, topic: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-gray-300 outline-none"
              />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-gray-400">
              <span>{subject}</span>
              {chapter && (
                <>
                  <span className="text-gray-600">•</span>
                  <span>{chapter}</span>
                </>
              )}
              {errorLocal.topic && (
                <>
                  <span className="text-gray-600">•</span>
                  <span>{errorLocal.topic}</span>
                </>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 mt-4">
            <TypeBadge type={errorLocal.errorType} />
            <SeverityBadge severity={errorLocal.severity} />
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-white/5 text-gray-400">
              <History className="w-3.5 h-3.5" />
              Reviewed: {errorLocal.reviewCount} times
            </div>
            {errorLocal.isRepeated && (
              <div className="px-2 py-1 text-xs font-medium rounded-md bg-rose-500/20 text-rose-300">
                Repeated
              </div>
            )}
          </div>
        </div>

        {/* Editing Selectors */}
        {isEditing && (
          <div className="space-y-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select 
                  value={errorLocal.errorType} 
                  onChange={e => setErrorLocal({...errorLocal, errorType: e.target.value as ErrorType})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none"
                >
                  {['Conceptual', 'Formula', 'Careless', 'Memory', 'Interpretation'].map(t => (
                    <option key={t} value={t} className="bg-gray-900">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Severity</label>
                <select 
                  value={errorLocal.severity} 
                  onChange={e => setErrorLocal({...errorLocal, severity: e.target.value as ErrorSeverity})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none"
                >
                  {['Low', 'Medium', 'High'].map(t => (
                    <option key={t} value={t} className="bg-gray-900">{t}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-6 pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input 
                  type="checkbox" 
                  checked={errorLocal.isRepeated}
                  onChange={e => setErrorLocal({...errorLocal, isRepeated: e.target.checked})}
                  className="w-4 h-4 rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-500/50"
                />
                Mark as Repeated Weakpoint
              </label>
              
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-gray-500">Reviews:</span>
                <button 
                  onClick={() => setErrorLocal({...errorLocal, reviewCount: Math.max(0, errorLocal.reviewCount - 1)})}
                  className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center font-medium"
                >-</button>
                <span className="w-4 text-center font-medium">{errorLocal.reviewCount}</span>
                <button 
                  onClick={() => setErrorLocal({...errorLocal, reviewCount: errorLocal.reviewCount + 1})}
                  className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center font-medium"
                >+</button>
              </div>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-6">
          <section>
            <h3 className="text-rose-400 font-medium uppercase tracking-wider text-xs mb-2">What Went Wrong</h3>
            {isEditing ? (
              <textarea 
                value={errorLocal.whatWentWrong}
                onChange={e => setErrorLocal({...errorLocal, whatWentWrong: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none min-h-[80px]"
              />
            ) : (
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{errorLocal.whatWentWrong || 'No details provided.'}</p>
            )}
          </section>

          <section>
            <h3 className="text-amber-400 font-medium uppercase tracking-wider text-xs mb-2">Root Cause</h3>
            {isEditing ? (
              <textarea 
                value={errorLocal.whyItHappened}
                onChange={e => setErrorLocal({...errorLocal, whyItHappened: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none min-h-[80px]"
              />
            ) : (
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{errorLocal.whyItHappened || 'No root cause provided.'}</p>
            )}
          </section>

          <section>
            <h3 className="text-emerald-400 font-medium uppercase tracking-wider text-xs mb-2">Correction & Prevention</h3>
            {isEditing ? (
              <textarea 
                value={errorLocal.correction}
                onChange={e => setErrorLocal({...errorLocal, correction: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none min-h-[80px]"
              />
            ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{errorLocal.correction || 'No correction provided.'}</p>
              </div>
            )}
          </section>
        </div>

      </div>

      {isEditing && (
        <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-black/40">
          <button
            onClick={() => { setIsEditing(false); setErrorLocal(originalError); }}
            className="px-4 py-2 rounded-lg font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      )}
    </motion.div>
  );
}
