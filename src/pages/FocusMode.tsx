import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Plus, Minus, CheckCircle, Mail } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLetters } from '../hooks/useLetters';
import { Letter } from '../types';

type Phase = 'deep_focus' | 'short_break' | 'long_break';

interface SessionLog {
  task: string;
  duration: number; // in minutes
  timestamp: number;
  phase: string;
}

interface FocusState {
  deepFocusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  autoStartNext: boolean;
  
  activePhase: Phase;
  remainingTime: number; // in seconds
  isRunning: boolean;
  expectedEndTime: number | null;
  
  currentTask: string;
  sessionsCompletedToday: number;
  lastSessionDate: string;
  sessionLog: SessionLog[];
  
  cycleCount: number;
}

const DEFAULT_STATE: FocusState = {
  deepFocusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  autoStartNext: false,
  
  activePhase: 'deep_focus',
  remainingTime: 25 * 60,
  isRunning: false,
  expectedEndTime: null,
  
  currentTask: '',
  sessionsCompletedToday: 0,
  lastSessionDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD local
  sessionLog: [],
  
  cycleCount: 0,
};

const STORAGE_KEY = 'dearS_focusMode';

export function FocusMode() {
  const [state, setState] = useState<FocusState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Date check for daily reset
        const today = new Date().toLocaleDateString('en-CA');
        if (parsed.lastSessionDate !== today) {
          parsed.sessionsCompletedToday = 0;
          parsed.lastSessionDate = today;
        }
        
        // Handle resume calculation
        if (parsed.isRunning && parsed.expectedEndTime) {
          const now = Date.now();
          if (now >= parsed.expectedEndTime) {
            // Timer expired while closed
            parsed.remainingTime = 0;
            parsed.isRunning = false;
            // Phase transition will be handled by the effect
          } else {
            parsed.remainingTime = Math.ceil((parsed.expectedEndTime - now) / 1000);
          }
        }
        
        // Clean up legacy ambience state if it exists
        const validParsed = { ...parsed };
        delete validParsed.activeAmbience;
        delete validParsed.volume;

        return { ...DEFAULT_STATE, ...validParsed }; // Merge to ensure all keys exist
      } catch (e) {
        return DEFAULT_STATE;
      }
    }
    return DEFAULT_STATE;
  });

  const [localTaskInput, setLocalTaskInput] = useState(state.currentTask);

  const { letters } = useLetters();
  const [randomLetter, setRandomLetter] = useState<Letter | null>(null);

  useEffect(() => {
    if (letters.length > 0) {
      const random = letters[Math.floor(Math.random() * letters.length)];
      setRandomLetter(random);
    }
  }, [letters]);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Main timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isRunning && state.expectedEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const left = Math.ceil((state.expectedEndTime! - now) / 1000);
        
        if (left <= 0) {
          handlePhaseComplete();
        } else {
          setState(prev => ({ ...prev, remainingTime: left }));
        }
      }, 500);
    }
    
    return () => clearInterval(interval);
  }, [state.isRunning, state.expectedEndTime, state.activePhase]);

  const handlePhaseComplete = () => {
    // Current phase is done
    const isFocus = state.activePhase === 'deep_focus';
    
    setState(prev => {
      let nextPhase: Phase = 'short_break';
      let nextDuration = prev.shortBreakMinutes;
      let newCycleCount = prev.cycleCount;
      let newSessions = prev.sessionsCompletedToday;
      let newLog = [...prev.sessionLog];

      if (isFocus) {
        newSessions += 1;
        newCycleCount += 1;
        newLog.unshift({
          task: prev.currentTask || 'Deep Focus',
          duration: prev.deepFocusMinutes,
          timestamp: Date.now(),
          phase: 'Focus'
        });
        
        // Keep log size manageable
        if (newLog.length > 50) newLog = newLog.slice(0, 50);

        if (newCycleCount >= 4) {
          nextPhase = 'long_break';
          nextDuration = prev.longBreakMinutes;
          newCycleCount = 0; // Reset cycle after long break
        }
      } else {
        nextPhase = 'deep_focus';
        nextDuration = prev.deepFocusMinutes;
      }

      const nextRemaining = nextDuration * 60;

      return {
        ...prev,
        activePhase: nextPhase,
        cycleCount: newCycleCount,
        sessionsCompletedToday: newSessions,
        sessionLog: newLog,
        remainingTime: nextRemaining,
        isRunning: prev.autoStartNext,
        expectedEndTime: prev.autoStartNext ? Date.now() + nextRemaining * 1000 : null,
      };
    });
  };

  const toggleTimer = () => {
    setState(prev => {
      if (prev.isRunning) {
        // Pause
        return {
          ...prev,
          isRunning: false,
          expectedEndTime: null,
          // remainingTime is already accurate
        };
      } else {
        // Play
        if (prev.remainingTime <= 0) {
           // Should not happen, but safeguard
           const duration = prev.activePhase === 'deep_focus' ? prev.deepFocusMinutes : prev.activePhase === 'short_break' ? prev.shortBreakMinutes : prev.longBreakMinutes;
           const newRem = duration * 60;
           return {
             ...prev,
             remainingTime: newRem,
             isRunning: true,
             expectedEndTime: Date.now() + newRem * 1000,
           }
        }
        return {
          ...prev,
          isRunning: true,
          expectedEndTime: Date.now() + prev.remainingTime * 1000,
        };
      }
    });
  };

  const resetTimer = () => {
    setState(prev => {
      const duration = prev.activePhase === 'deep_focus' ? prev.deepFocusMinutes : prev.activePhase === 'short_break' ? prev.shortBreakMinutes : prev.longBreakMinutes;
      const newRemaining = duration * 60;
      return {
        ...prev,
        remainingTime: newRemaining,
        isRunning: false,
        expectedEndTime: null,
      };
    });
  };

  const skipPhase = () => {
    handlePhaseComplete();
  };

  const addTime = (minutes: number) => {
    setState(prev => {
      const addedSeconds = minutes * 60;
      const newRemaining = prev.remainingTime + addedSeconds;
      return {
        ...prev,
        remainingTime: newRemaining,
        expectedEndTime: prev.expectedEndTime ? prev.expectedEndTime + addedSeconds * 1000 : null
      };
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const updateConfig = (key: keyof FocusState, value: any) => {
    setState(prev => {
      const next = { ...prev, [key]: value };
      
      // If we are currently in that phase and NOT running, and remainingTime equals the old total, we should update remaining time
      let oldDuration = 0;
      if (key === 'deepFocusMinutes') oldDuration = prev.deepFocusMinutes * 60;
      if (key === 'shortBreakMinutes') oldDuration = prev.shortBreakMinutes * 60;
      if (key === 'longBreakMinutes') oldDuration = prev.longBreakMinutes * 60;

      if (!prev.isRunning && prev.remainingTime === oldDuration) {
        if (prev.activePhase === 'deep_focus' && key === 'deepFocusMinutes') next.remainingTime = value * 60;
        if (prev.activePhase === 'short_break' && key === 'shortBreakMinutes') next.remainingTime = value * 60;
        if (prev.activePhase === 'long_break' && key === 'longBreakMinutes') next.remainingTime = value * 60;
      }
      return next;
    });
  };

  const handleTaskBlur = () => {
    setState(prev => ({ ...prev, currentTask: localTaskInput }));
  };

  const getPhaseLabel = (phase: Phase) => {
    switch (phase) {
      case 'deep_focus': return 'DEEP FOCUS';
      case 'short_break': return 'REFRESH';
      case 'long_break': return 'RECHARGE';
    }
  };

  const glassCardClasses = "bg-[rgba(255,255,255,0.08)] backdrop-blur-[20px] rounded-[20px] border border-[rgba(255,255,255,0.15)] shadow-[0_8px_40px_rgba(0,0,0,0.5)]";
  const glassButtonClasses = "bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(120,80,255,0.3)] transition-all duration-300 text-white";

  return (
    <>
      <div 
        style={{
          background: 'rgba(0,0,0,0.45)',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1
        }} 
      />
      <div className="flex flex-col h-full space-y-6 pb-20 md:pb-safe text-white relative z-0">
        
        {/* Top Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Focus Mode</h1>
            <p className="text-[rgba(255,255,255,0.7)] mt-1">Deep work command center</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("px-4 py-2 flex items-center gap-2", glassCardClasses, "!rounded-xl !p-2 !px-4")}>
              <CheckCircle className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-white">{state.sessionsCompletedToday} Sessions Today</span>
            </div>
            <div className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold tracking-wider border",
              state.isRunning 
                ? "bg-[rgba(16,185,129,0.1)] text-emerald-400 border-[rgba(16,185,129,0.2)]" 
                : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.7)] border-[rgba(255,255,255,0.1)]"
            )}>
              {state.isRunning ? 'RUNNING' : 'PAUSED'}
            </div>
          </div>
        </div>

        {randomLetter && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center p-8 md:p-12 rounded-[24px] border border-white/[0.08] bg-[rgba(255,255,255,0.03)] backdrop-blur-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center relative overflow-hidden group mb-2"
          >
            {/* Subtle glow layer behind the letter */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.05] via-transparent to-transparent opacity-60 blur-[40px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.3em] text-white/40 uppercase mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-white/20"></span>
                A MESSAGE TO YOURSELF
                <span className="w-8 h-[1px] bg-white/20"></span>
              </span>
              
              <p className="text-xl md:text-3xl font-light text-white/90 leading-relaxed md:leading-loose italic mb-8 drop-shadow-md">
                "{randomLetter.text}"
              </p>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-white/50 tracking-[0.15em] uppercase">— Dear S.</span>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                <NavLink 
                  to="/letters" 
                  className="text-xs font-medium text-white/40 hover:text-white transition-all flex items-center gap-1.5 opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5"
                >
                  <Mail size={12} />
                  View all
                </NavLink>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1">
          
          {/* Left: Timer Panel */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <motion.div 
              layout
              className="flex flex-col items-center justify-center relative overflow-hidden flex-1 min-h-[400px] text-white"
              style={{
                background: 'linear-gradient(135deg, rgba(120, 80, 255, 0.15), rgba(0, 0, 0, 0.4))',
                boxShadow: 'inset 0 0 30px rgba(120,80,255,0.2), 0 8px 40px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '20px',
                padding: '3rem'
              }}
            >
              {/* Subtle glow behind timer based on phase */}
              <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] opacity-20 transition-colors duration-1000",
                state.activePhase === 'deep_focus' ? 'bg-violet-600' :
                state.activePhase === 'short_break' ? 'bg-blue-500' : 'bg-emerald-500'
              )} />

              <div className="relative z-10 flex flex-col items-center w-full">
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold tracking-widest mb-8 border backdrop-blur-[10px]",
                  state.activePhase === 'deep_focus' ? 'bg-[rgba(139,92,246,0.2)] text-violet-300 border-[rgba(139,92,246,0.3)]' :
                  state.activePhase === 'short_break' ? 'bg-[rgba(59,130,246,0.2)] text-blue-300 border-[rgba(59,130,246,0.3)]' :
                  'bg-[rgba(16,185,129,0.2)] text-emerald-300 border-[rgba(16,185,129,0.3)]'
                )}>
                  {getPhaseLabel(state.activePhase)}
                </span>

                <div className="font-mono text-7xl sm:text-9xl font-bold tracking-tighter text-white drop-shadow-2xl mb-12">
                  {formatTime(state.remainingTime)}
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <button 
                    onClick={resetTimer}
                    className={cn("w-14 h-14 rounded-full flex items-center justify-center group active:scale-95", glassButtonClasses)}
                  >
                    <RotateCcw className="w-6 h-6 group-hover:-rotate-180 transition-transform duration-500" />
                  </button>

                  <button 
                    onClick={toggleTimer}
                    className="w-20 h-20 rounded-full flex items-center justify-center bg-white text-black hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  >
                    {state.isRunning ? <Pause className="w-8 h-8 fill-black" /> : <Play className="w-8 h-8 fill-black translate-x-0.5" />}
                  </button>

                  <button
                    onClick={skipPhase}
                    className={cn("w-14 h-14 rounded-full flex items-center justify-center active:scale-95 hover:scale-105", glassButtonClasses)}
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => addTime(1)}
                    className={cn("px-4 py-2 rounded-xl text-sm font-medium", glassButtonClasses)}
                  >
                    +1 MIN
                  </button>
                  <button 
                    onClick={() => addTime(5)}
                    className={cn("px-4 py-2 rounded-xl text-sm font-medium", glassButtonClasses)}
                  >
                    +5 MIN
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Current Task */}
            <div className={cn("p-6", glassCardClasses)}>
              <h3 className="text-sm font-semibold text-[rgba(255,255,255,0.7)] mb-3 tracking-wider uppercase">Current Task</h3>
              <input 
                type="text"
                value={localTaskInput}
                onChange={(e) => setLocalTaskInput(e.target.value)}
                onBlur={handleTaskBlur}
                placeholder="What are you focusing on?"
                className="w-full bg-transparent border-none outline-none text-xl md:text-2xl font-medium text-white placeholder-white/30 focus:ring-0"
              />
            </div>
          </div>

          {/* Right: Config & Logs */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            
            {/* Configurations */}
            <div className={cn("p-6", glassCardClasses)}>
              <h3 className="text-sm font-semibold text-[rgba(255,255,255,0.7)] mb-5 tracking-wider uppercase">Session Setup</h3>
              
              <div className="space-y-6">
                <ConfigRow 
                  label="Deep Focus" 
                  desc="Stay productive"
                  value={state.deepFocusMinutes} 
                  min={5} max={180} 
                  onChange={(v) => updateConfig('deepFocusMinutes', v)} 
                  glassButtonClasses={glassButtonClasses}
                />
                <ConfigRow 
                  label="Refresh" 
                  desc="Short break"
                  value={state.shortBreakMinutes} 
                  min={1} max={60} 
                  onChange={(v) => updateConfig('shortBreakMinutes', v)} 
                  glassButtonClasses={glassButtonClasses}
                />
                <ConfigRow 
                  label="Recharge" 
                  desc="Long break"
                  value={state.longBreakMinutes} 
                  min={5} max={120} 
                  onChange={(v) => updateConfig('longBreakMinutes', v)} 
                  glassButtonClasses={glassButtonClasses}
                />
                
                <div className="pt-4 border-t border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Auto-start next phase</div>
                    <div className="text-xs text-[rgba(255,255,255,0.7)] mt-0.5">Flow seamlessly</div>
                  </div>
                  <button 
                    onClick={() => updateConfig('autoStartNext', !state.autoStartNext)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      state.autoStartNext ? "bg-[rgba(120,80,255,0.8)]" : "bg-[rgba(255,255,255,0.2)]"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                      state.autoStartNext ? "translate-x-6" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
              </div>
            </div>

            {/* Session Log */}
            <div className={cn("p-6 flex-1 min-h-[200px] flex flex-col", glassCardClasses)}>
              <h3 className="text-sm font-semibold text-[rgba(255,255,255,0.7)] mb-4 tracking-wider uppercase">Recent Sessions</h3>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {state.sessionLog.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[rgba(255,255,255,0.5)] py-6">
                    <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-3">
                      <CheckCircle className="w-5 h-5 opacity-50 text-[rgba(255,255,255,0.7)]" />
                    </div>
                    <p className="text-sm">No sessions completed today.<br/>Ready to focus?</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {state.sessionLog.slice(0, 2).map((log, i) => (
                      <motion.div 
                        key={log.timestamp}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)]"
                      >
                        <div className="flex flex-col truncate pr-4">
                          <span className="text-sm font-medium text-white truncate">{log.task}</span>
                          <span className="text-xs text-[rgba(255,255,255,0.6)]">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[rgba(200,180,255,1)] bg-[rgba(139,92,246,0.2)] px-2 py-1 rounded-md whitespace-nowrap">
                          {log.duration}m
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

function ConfigRow({ label, desc, value, min, max, onChange, glassButtonClasses }: { label: string, desc: string, value: number, min: number, max: number, onChange: (v: number) => void, glassButtonClasses: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-white font-medium">{label}</div>
        <div className="text-xs text-[rgba(255,255,255,0.7)] mt-0.5">{desc}</div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onChange(Math.max(min, value - 1))}
          className={cn("w-8 h-8 rounded-lg flex items-center justify-center", glassButtonClasses)}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-6 text-center font-mono font-medium text-white">{value}</span>
        <button 
          onClick={() => onChange(Math.min(max, value + 1))}
          className={cn("w-8 h-8 rounded-lg flex items-center justify-center", glassButtonClasses)}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
