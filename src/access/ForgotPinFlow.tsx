import React, { useState } from 'react';
import { useAccess } from './AccessContext';
import { Lock, Shield } from 'lucide-react';
import { PinInput } from './PinInput';

export function ForgotPinFlow({ onBack }: { onBack: () => void }) {
 const { unlockSession, changePin } = useAccess();
 const [step, setStep] = useState(1);
 const [answer, setAnswer] = useState('');
 const [error, setError] = useState(false);
 const [newPin, setNewPin] = useState('');
 const [confirmPin, setConfirmPin] = useState('');

 const savedQuestion = localStorage.getItem('dearS_recoveryQuestion');
 const savedAnswer = localStorage.getItem('dearS_recoveryAnswer');

 const handleVerify = () => {
 if (!savedAnswer) {
 setError(true);
 return;
 }
 if (answer.trim().toLowerCase() === savedAnswer.trim().toLowerCase()) {
 setError(false);
 setStep(2);
 } else {
 setError(true);
 }
 };

 const handleReset = () => {
 if (newPin.length === 6 && newPin === confirmPin) {
 changePin(newPin);
 unlockSession();
 }
 };

 if (!savedQuestion) {
 return (
 <div className="fixed inset-0 z-[100] bg-transparent flex flex-col items-center justify-center selection:bg-violet-500/30">
 <p className="text-white mb-4 text-center">Recovery data not found or corrupted.</p>
 <button onClick={() => window.location.reload()} className="px-4 py-2 border border-white/20 text-white rounded">Reload</button>
 </div>
 );
 }

 return (
 <div className="fixed inset-0 z-[100] bg-transparent flex flex-col items-center justify-center selection:bg-violet-500/30">
 <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
 <div className="w-[40vw] h-[40vw] bg-violet-600/10 rounded-full blur-[120px] opacity-50" />
 </div>
 
 {step === 1 && (
 <div 
 key="verify"
 
 
 
 className="z-10 w-full max-w-sm px-6"
 >
 <div className="glass-panel border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
 <div className="flex flex-col items-center text-center mb-8">
 <div className="w-12 h-12 bg-violet-950/40 rounded-2xl flex items-center justify-center mb-4 border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
 <Lock className="w-6 h-6 text-violet-400" />
 </div>
 <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Recover Access</h2>
 <p className="text-gray-400 text-sm">Answer your security question</p>
 </div>

 <div className="space-y-4 mb-8 text-left">
 <div className="p-4 bg-white/5 rounded-xl border border-white/5">
 <p className="text-sm text-gray-300 font-medium">{savedQuestion}</p>
 </div>
 <div className="space-y-1">
 <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest pl-1">Answer</label>
 <input 
 type="text" value={answer} onChange={e => {setError(false); setAnswer(e.target.value)}}
 placeholder="Your answer"
 className={`w-full glass-input border ${error ? 'border-red-500' : 'border-white/5'} rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-violet-500 `}
 />
 {error && <p className="text-xs text-red-500 pl-1 mt-1">Incorrect answer.</p>}
 </div>
 </div>
 
 <div className="flex gap-4">
 <button 
 onClick={onBack}
 className="w-1/3 px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm font-medium tracking-wide"
 >
 Cancel
 </button>
 <button 
 onClick={handleVerify}
 disabled={!answer.trim()}
 className="flex-1 py-3 rounded-xl font-semibold glass-button text-white border-transparent hover:border-violet-500/50 disabled:bg-white/5 disabled:text-gray-500 "
 >
 Verify
 </button>
 </div>
 </div>
 </div>
 )}
 {step === 2 && (
 <div 
 key="reset"
 
 
 className="z-10 w-full max-w-sm px-6"
 >
 <div className="glass-panel border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
 <div className="flex flex-col items-center text-center mb-8">
 <div className="w-12 h-12 bg-violet-950/40 rounded-2xl flex items-center justify-center mb-4 border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
 <Shield className="w-6 h-6 text-violet-400" />
 </div>
 <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Reset PIN</h2>
 <p className="text-gray-400 text-sm">Create a new 6-digit PIN</p>
 </div>

 <div className="space-y-6">
 <div>
 <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-3">New PIN</p>
 <PinInput value={newPin} onChange={setNewPin} autoFocus />
 </div>
 
 <div className={` ${newPin.length === 6 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
 <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-3">Confirm New PIN</p>
 <PinInput value={confirmPin} onChange={setConfirmPin} />
 </div>

 <button 
 disabled={newPin.length !== 6 || confirmPin !== newPin}
 onClick={handleReset}
 className="w-full py-3 mt-4 rounded-xl font-semibold glass-button text-white border-transparent hover:border-violet-500/50 disabled:bg-white/5 disabled:text-gray-500 "
 >
 Reset & Enter
 </button>
 </div>
 </div>
 </div>
 )}
 
 </div>
 );
}
