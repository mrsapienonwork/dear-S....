import React, { useState } from 'react';
import { useAccess } from './AccessContext';
import { Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { PinInput } from './PinInput';
import { ForgotPinFlow } from './ForgotPinFlow';

export function LockScreen() {
  const { unlockSession } = useAccess();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleEnter = () => {
    const savedPin = localStorage.getItem('dearS_pin');
    if (pin === savedPin) {
      setError(false);
      unlockSession();
    } else {
      setError(true);
      setPin('');
    }
  };

  if (showForgot) {
    return <ForgotPinFlow onBack={() => setShowForgot(false)} />;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-transparent flex flex-col items-center justify-center selection:bg-violet-500/30">
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[40vw] h-[40vw] bg-violet-600/10 rounded-full blur-[120px] opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-sm px-6"
      >
        <div className="glass-panel border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-violet-950/40 rounded-2xl flex items-center justify-center mb-4 border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
              <Lock className="w-6 h-6 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Enter your 6-digit PIN to continue</p>
          </div>

          <div className="space-y-6">
            <div>
              <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
                 <div className="relative flex justify-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={pin}
                      onChange={(e) => {
                        setError(false);
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPin(val);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 text-transparent"
                    />
                    <div className="flex gap-3 justify-center mb-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full transition-all duration-300 ${
                            error 
                              ? 'bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                              : i < pin.length
                              ? 'bg-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.6)]'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                 </div>
              </motion.div>
              {error && <p className="text-red-500 text-xs text-center mt-2">Incorrect PIN</p>}
            </div>

            <button 
              disabled={pin.length !== 6}
              onClick={handleEnter}
              className="w-full py-3 mt-2 rounded-xl font-semibold glass-button text-white border-transparent hover:border-violet-500/50 disabled:bg-white/5 disabled:text-gray-500 transition-all"
            >
              Enter System
            </button>
            
            <div className="text-center mt-4">
              <button 
                onClick={() => setShowForgot(true)}
                className="text-xs text-gray-500 hover:text-violet-400 transition-colors tracking-widest uppercase"
              >
                Forgot PIN?
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
