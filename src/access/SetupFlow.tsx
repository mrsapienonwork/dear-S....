import React, { useState } from 'react';
import { useAccess } from './AccessContext';
import { Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PinInput } from './PinInput';

export function SetupFlow() {
  const { pinEnabled } = useAccess();
  const step = pinEnabled ? 2 : 1;

  return (
    <div className="fixed inset-0 z-[100] bg-transparent flex flex-col items-center justify-center selection:bg-violet-500/30">
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[40vw] h-[40vw] bg-violet-600/10 rounded-full blur-[120px] opacity-50" />
      </div>
      <AnimatePresence mode="wait">
        {step === 1 && <PinSetupCard key="pin" />}
        {step === 2 && <RecoverySetupCard key="recovery" />}
      </AnimatePresence>
    </div>
  );
}

function PinSetupCard() {
  const { completePinSetup } = useAccess();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const isValid = pin.length === 6 && pin === confirmPin && /^\d{6}$/.test(pin);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="z-10 w-full max-w-sm px-6"
    >
      <div className="glass-panel border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-violet-950/40 rounded-2xl flex items-center justify-center mb-4 border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <Shield className="w-6 h-6 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Secure Your Workspace</h2>
          <p className="text-gray-400 text-sm">Create a 6-digit PIN to protect your data</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-3">Enter PIN</p>
            <PinInput value={pin} onChange={setPin} autoFocus />
          </div>
          
          <div className={`transition-opacity duration-300 ${pin.length === 6 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-3">Confirm PIN</p>
            <PinInput value={confirmPin} onChange={setConfirmPin} />
          </div>

          <button 
            disabled={!isValid}
            onClick={() => completePinSetup(pin)}
            className="w-full py-3 mt-4 rounded-xl font-semibold glass-button text-white border-transparent hover:border-violet-500/50 disabled:bg-white/5 disabled:text-gray-500 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function RecoverySetupCard() {
  const { completeRecoverySetup } = useAccess();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const isValid = question.trim().length > 0 && answer.trim().length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="z-10 w-full max-w-sm px-6"
    >
      <div className="glass-panel border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-violet-950/40 rounded-2xl flex items-center justify-center mb-4 border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <Shield className="w-6 h-6 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Recovery Options</h2>
          <p className="text-gray-400 text-sm">Set a security question in case you forget your PIN</p>
        </div>

        <div className="space-y-4 mb-8 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest pl-1">Security Question</label>
            <input 
              type="text" value={question} onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. What is your primary focus?"
              className="w-full glass-input rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-gray-600"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest pl-1">Answer</label>
            <input 
              type="text" value={answer} onChange={e => setAnswer(e.target.value)}
              placeholder="Answer"
              className="w-full glass-input rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-gray-600"
            />
          </div>
        </div>

        <button 
          disabled={!isValid}
          onClick={() => completeRecoverySetup(question, answer)}
          className="w-full py-3 mt-4 rounded-xl font-semibold glass-button text-white border-transparent hover:border-violet-500/50 disabled:bg-white/5 disabled:text-gray-500 transition-all"
        >
          Complete Setup
        </button>
      </div>
    </motion.div>
  );
}
