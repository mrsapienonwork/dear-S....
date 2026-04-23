import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, AlertTriangle, Lightbulb } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { StudyError, ErrorType, ErrorSeverity } from '../../types';
import { generateId } from '../../lib/utils';

export function CapturePanel({ onClose }: { onClose: () => void }) {
  const { data, addStudyError } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(data.subjects[0]?.id || '');
  const [chapterId, setChapterId] = useState('');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<ErrorType>('Conceptual');
  const [severity, setSeverity] = useState<ErrorSeverity>('Medium');
  const [wrong, setWrong] = useState('');
  const [why, setWhy] = useState('');
  const [correction, setCorrection] = useState('');

  const relevantChapters = data.chapters.filter(c => c.subjectId === subjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const newError: StudyError = {
      id: generateId(),
      subjectId,
      chapterId,
      topic,
      title,
      errorType: type,
      severity,
      whatWentWrong: wrong,
      whyItHappened: why,
      correction,
      status: 'Unresolved',
      reviewCount: 0,
      isRepeated: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    addStudyError(newError);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Log Error</h2>
          <p className="text-sm text-gray-400 mt-1">Capture a weak point for revision.</p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <form id="capture-form" onSubmit={handleSubmit} className="space-y-8">
          
          {/* Step 1: Context */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-400 tracking-wider uppercase mb-2">
              <span className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-xs">1</span>
              Context
            </div>
            
            <div className="space-y-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Subject</label>
                <select 
                  value={subjectId} 
                  onChange={e => { setSubjectId(e.target.value); setChapterId(''); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  required
                >
                  <option value="" disabled className="bg-gray-900">Select Subject</option>
                  {data.subjects.map(s => (
                    <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Chapter (Optional)</label>
                  <select 
                    value={chapterId} 
                    onChange={e => setChapterId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-violet-500 transition-all"
                  >
                    <option value="" className="bg-gray-900">None</option>
                    {relevantChapters.map(c => (
                      <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Topic (Optional)</label>
                  <input 
                    type="text" 
                    value={topic}
                    placeholder="e.g. Kinematics"
                    onChange={e => setTopic(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: The Issue */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-rose-400 tracking-wider uppercase mb-2">
              <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-xs">2</span>
              The Issue
            </div>

            <div className="space-y-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Error Summary</label>
                <input 
                  type="text" 
                  value={title}
                  placeholder="What was the mistake?"
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Type</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value as ErrorType)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 transition-all"
                  >
                    {['Conceptual', 'Formula', 'Careless', 'Memory', 'Interpretation'].map(t => (
                      <option key={t} value={t} className="bg-gray-900">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Severity</label>
                  <select 
                    value={severity} 
                    onChange={e => setSeverity(e.target.value as ErrorSeverity)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 transition-all"
                  >
                    {['Low', 'Medium', 'High'].map(t => (
                      <option key={t} value={t} className="bg-gray-900">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Detailed Breakdown</label>
                <textarea 
                  value={wrong}
                  placeholder="Explain exactly what went wrong..."
                  onChange={e => setWrong(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 transition-all min-h-[80px]"
                />
              </div>
            </div>
          </section>

          {/* Step 3: Recovery */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 tracking-wider uppercase mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
              Recovery
            </div>

            <div className="space-y-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Root Cause</label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <textarea 
                    value={why}
                    placeholder="Why did this happen?"
                    onChange={e => setWhy(e.target.value)}
                    className="w-full pl-10 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-all min-h-[80px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Correction / Prevention</label>
                <div className="relative">
                  <Lightbulb className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <textarea 
                    value={correction}
                    placeholder="How will you prevent this in the future?"
                    onChange={e => setCorrection(e.target.value)}
                    className="w-full pl-10 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-all min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </section>

        </form>
      </div>

      <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/40">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="capture-form"
          disabled={!title.trim() || !subjectId}
          className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        >
          <Save className="w-4 h-4" />
          Save Error
        </button>
      </div>
    </motion.div>
  );
}
