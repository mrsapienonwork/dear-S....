import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useBackground } from '../context/BackgroundContext';
import { Save, Download, Upload, Trash2, Plus, AlertTriangle, CheckCircle, Image as ImageIcon, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import { SecuritySection } from '../access/SecuritySection';
import { motion, AnimatePresence } from 'motion/react';
import { staggerContainer, slideUpItem, buttonHover, buttonTap, SYSTEM_EASE } from '../lib/motion';

export function Settings() {
  const { data, updateSettings, addSubject, deleteSubject, addHabit, deleteHabit, resetData, importData } = useAppContext();
  const { desktopBg, mobileBg, setDesktopBg, setMobileBg, resetBackgrounds } = useBackground();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  
  const [minHours, setMinHours] = useState(data.settings.minStudyHours.toString());
  const [subtitle, setSubtitle] = useState(data.settings.subtitle);
  const [newSubj, setNewSubj] = useState('');
  const [newHabit, setNewHabit] = useState('');
  
  const [saveToast, setSaveToast] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveConfig = () => {
    updateSettings({
        minStudyHours: Number(minHours),
        subtitle
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dear_s_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target?.result as string);
            if (imported.settings && imported.entries) {
                importData(imported);
                alert("Data imported successfully!");
                window.location.reload();
            } else {
                alert("Invalid format.");
            }
        } catch (err) {
            alert("Error parsing JSON");
        }
    };
    reader.readAsText(file);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please use an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'desktop') {
        setDesktopBg(base64);
      } else {
        setMobileBg(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-3xl mx-auto space-y-8 pb-10"
    >
      <motion.div variants={slideUpItem}>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-gray-400 font-light mt-1">Configure your environment.</p>
      </motion.div>

      <div className="space-y-6">

          <Section title="Rules of Engagement">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 min-w-0">
                      <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Min. Hours for WIN</label>
                      <input 
                          type="number" value={minHours} onChange={e => setMinHours(e.target.value)}
                          className="w-full min-w-0 glass-input border border-white/5 rounded-xl px-4 py-3.5 text-white text-lg outline-none focus:border-violet-500 hover:bg-white/[0.02] focus:bg-white/[0.03] transition-colors"
                      />
                  </div>
                  <div className="space-y-2 min-w-0">
                      <label className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Dashboard Subtitle</label>
                      <input 
                          type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
                          className="w-full min-w-0 glass-input border border-white/5 rounded-xl px-4 py-3.5 text-white text-lg outline-none focus:border-violet-500 hover:bg-white/[0.02] focus:bg-white/[0.03] transition-colors"
                      />
                  </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                  <motion.button 
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    onClick={handleSaveConfig} 
                    className="w-full md:w-auto px-10 py-3 glass-button text-white border-transparent hover:border-violet-500/50 font-bold rounded-xl transition-all flex items-center justify-center gap-2 overflow-hidden relative"
                  >
                      <AnimatePresence mode="wait">
                        {saveToast ? (
                            <motion.div key="saved" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2 text-green-400">
                              <CheckCircle className="w-4 h-4" /> Saved!
                            </motion.div>
                        ) : (
                            <motion.div key="save" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="flex items-center gap-2">
                              <Save className="w-4 h-4"/> Save Configuration
                            </motion.div>
                        )}
                      </AnimatePresence>
                  </motion.button>
              </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Section title="Subjects">
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {data.subjects.map(s => (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            key={s.id} 
                            className="flex justify-between items-center glass-panel p-3 md:p-4 rounded-xl border border-white/5 group overflow-hidden"
                          >
                              <span className="text-gray-300 font-medium truncate pr-2">{s.name}</span>
                              <button onClick={() => deleteSubject(s.id)} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 md:opacity-0 md:group-hover:opacity-100 transition-all flex-shrink-0"><Trash2 className="w-4 h-4"/></button>
                          </motion.div>
                      ))}
                    </AnimatePresence>
                      <div className="flex gap-2 mt-6">
                          <input type="text" value={newSubj} onChange={e => setNewSubj(e.target.value)} placeholder="New Subject" className="flex-1 min-w-0 glass-input border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 hover:bg-white/[0.02] focus:bg-white/[0.03] transition-colors" />
                          <motion.button 
                            whileHover={buttonHover}
                            whileTap={buttonTap}
                            onClick={() => { if(newSubj) { addSubject({id: crypto.randomUUID(), name: newSubj}); setNewSubj(''); } }} 
                            className="flex-shrink-0 w-[52px] flex items-center justify-center bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20"
                          >
                            <Plus className="w-5 h-5"/>
                          </motion.button>
                      </div>
                  </div>
              </Section>

              <Section title="Habits">
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {data.habits.map(h => (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            key={h.id} 
                            className="flex justify-between items-center glass-panel p-3 md:p-4 rounded-xl border border-white/5 group overflow-hidden"
                          >
                              <span className="text-gray-300 font-medium truncate pr-2">{h.name}</span>
                              <button onClick={() => deleteHabit(h.id)} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 md:opacity-0 md:group-hover:opacity-100 transition-all flex-shrink-0"><Trash2 className="w-4 h-4"/></button>
                          </motion.div>
                      ))}
                    </AnimatePresence>
                      <div className="flex gap-2 mt-6">
                          <input type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder="New Habit" className="flex-1 min-w-0 glass-input border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 hover:bg-white/[0.02] focus:bg-white/[0.03] transition-colors" />
                          <motion.button 
                            whileHover={buttonHover}
                            whileTap={buttonTap}
                            onClick={() => { if(newHabit) { addHabit({id: crypto.randomUUID(), name: newHabit}); setNewHabit(''); } }} 
                            className="flex-shrink-0 w-[52px] flex items-center justify-center bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20"
                          >
                            <Plus className="w-5 h-5"/>
                          </motion.button>
                      </div>
                  </div>
              </Section>
          </div>

          <Section title="Preferences">
              <div className="space-y-6">
                 <label className="flex items-center justify-between glass-panel p-4 rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                     <div>
                         <div className="font-medium text-white mb-1">Score Feedback</div>
                         <div className="text-xs text-gray-400">Show subtle score updates when completing habits or chapters.</div>
                     </div>
                     <input 
                         type="checkbox" 
                         checked={data.settings.enableScoreFeedback ?? true} 
                         onChange={(e) => updateSettings({ enableScoreFeedback: e.target.checked })} 
                         className="w-5 h-5 rounded border-gray-600 bg-black/50 text-violet-500 focus:ring-violet-500 focus:ring-offset-0 disabled:opacity-50"
                     />
                 </label>
                 <label className="flex items-center justify-between glass-panel p-4 rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                     <div>
                         <div className="font-medium text-white mb-1">Reduced Motion</div>
                         <div className="text-xs text-gray-400">Minimize heavy animations across the application (requires reload).</div>
                     </div>
                     <input 
                         type="checkbox" 
                         checked={data.settings.reducedMotion ?? false} 
                         onChange={(e) => updateSettings({ reducedMotion: e.target.checked })} 
                         className="w-5 h-5 rounded border-gray-600 bg-black/50 text-violet-500 focus:ring-violet-500 focus:ring-offset-0 disabled:opacity-50"
                     />
                 </label>
              </div>
          </Section>

          <Section title="Background Settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Desktop Background */}
                <div className="glass-panel border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 text-center">
                  <Monitor className="w-8 h-8 text-gray-400" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white">Desktop Background</h3>
                    <p className="text-[10px] text-gray-500">For screens wider than 768px</p>
                  </div>
                  <motion.button 
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    onClick={() => desktopInputRef.current?.click()}
                    className="mt-2 w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 font-medium transition-colors"
                  >
                    Upload Image
                  </motion.button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={desktopInputRef} 
                    onChange={(e) => handleBackgroundUpload(e, 'desktop')} 
                    className="hidden" 
                  />
                  {desktopBg && <p className="text-xs text-green-400">Custom background applied</p>}
                </div>

                {/* Mobile Background */}
                <div className="glass-panel border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 text-center">
                  <Smartphone className="w-8 h-8 text-gray-400" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white">Mobile Background</h3>
                    <p className="text-[10px] text-gray-500">For vertical screens (phones)</p>
                  </div>
                  <motion.button 
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    onClick={() => mobileInputRef.current?.click()}
                    className="mt-2 w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 font-medium transition-colors"
                  >
                    Upload Image
                  </motion.button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={mobileInputRef} 
                    onChange={(e) => handleBackgroundUpload(e, 'mobile')} 
                    className="hidden" 
                  />
                  {mobileBg && <p className="text-xs text-green-400">Custom background applied</p>}
                </div>

              </div>

              {(desktopBg || mobileBg) && (
                <div className="mt-6 flex justify-end">
                  <motion.button 
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    onClick={resetBackgrounds}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm font-medium border border-red-500/20"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset to Default Background
                  </motion.button>
                </div>
              )}
          </Section>

          <Section title="Data Management">
              <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button whileHover={buttonHover} whileTap={buttonTap} onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 glass-panel border border-white/5 rounded-xl text-gray-300 hover:text-white hover:border-white/20 transition-colors font-medium">
                      <Download className="w-4 h-4" /> Export Data
                  </motion.button>
                  <motion.button whileHover={buttonHover} whileTap={buttonTap} onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 glass-panel border border-white/5 rounded-xl text-gray-300 hover:text-white hover:border-white/20 transition-colors font-medium">
                      <Upload className="w-4 h-4" /> Import Data
                  </motion.button>
                  <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
              </div>

              <div className="mt-8 pt-8 border-t border-red-500/10">
                <AnimatePresence mode="wait">
                  {confirmReset ? (
                      <motion.div 
                        key="confirm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="bg-red-950/20 border border-red-500/30 rounded-xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                      >
                          <div className="flex items-center gap-3 text-red-400 font-medium">
                              <AlertTriangle className="w-5 h-5 flex-shrink-0"/>
                              <span>Are you absolutely sure? This will wipe all progress.</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                              <motion.button whileHover={buttonHover} whileTap={buttonTap} onClick={() => setConfirmReset(false)} className="px-6 py-2.5 bg-transparent border border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-lg transition-colors font-medium text-sm w-full sm:w-auto">Cancel</motion.button>
                              <motion.button whileHover={buttonHover} whileTap={buttonTap} onClick={() => {resetData(); setConfirmReset(false);}} className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all text-sm w-full sm:w-auto">Erase Everything</motion.button>
                          </div>
                      </motion.div>
                  ) : (
                      <motion.button 
                        key="init"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setConfirmReset(true)} 
                        className="text-red-500/70 hover:text-red-400 flex items-center gap-2 text-sm font-semibold tracking-wide transition-colors p-2 -ml-2 rounded-lg hover:bg-red-500/10"
                      >
                          <Trash2 className="w-4 h-4" /> INITIALIZE TOTAL RESET
                      </motion.button>
                  )}
                </AnimatePresence>
              </div>
          </Section>

          <motion.div variants={slideUpItem} className="mt-8">
            <SecuritySection />
          </motion.div>

      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <motion.div variants={slideUpItem} className="glass-panel border border-white/5 rounded-2xl p-5 md:p-8 shadow-sm">
            <h2 className="text-[10px] md:text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest pl-1">{title}</h2>
            {children}
        </motion.div>
    )
}
