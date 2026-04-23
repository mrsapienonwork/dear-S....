import React, { useState } from 'react';
import { useAccess } from './AccessContext';
import { Shield, Lock, Key, Trash2 } from 'lucide-react';
import { PinInput } from './PinInput';

export function SecuritySection() {
 const { lockAppNow, removePinProtection, changePin, changeRecovery, pinExists, pinEnabled } = useAccess();
 
 const [mode, setMode] = useState<'idle' | 'change_pin' | 'change_recovery' | 'remove_pin'>('idle');
 
 const [currentPinInput, setCurrentPinInput] = useState('');
 const [newPinInput, setNewPinInput] = useState('');
 const [confirmPinInput, setConfirmPinInput] = useState('');
 
 const [questionInput, setQuestionInput] = useState('');
 const [answerInput, setAnswerInput] = useState('');
 
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 const verifyPin = () => {
 return currentPinInput === localStorage.getItem('dearS_pin');
 };

 const clearState = () => {
 setCurrentPinInput('');
 setNewPinInput('');
 setConfirmPinInput('');
 setQuestionInput('');
 setAnswerInput('');
 setError('');
 setSuccess('');
 setMode('idle');
 }

 const handleAction = (action: () => void) => {
 setError('');
 setSuccess('');
 if (!verifyPin()) {
 setError('Incorrect current PIN');
 return;
 }
 action();
 };

 const handleChangePin = () => {
 handleAction(() => {
 if (newPinInput.length !== 6 || newPinInput !== confirmPinInput) {
 setError('New PIN must be 6 digits and match confirmation');
 return;
 }
 changePin(newPinInput);
 clearState();
 setSuccess('PIN changed successfully');
 });
 };

 const handleChangeRecovery = () => {
 handleAction(() => {
 if (!questionInput.trim() || !answerInput.trim()) {
 setError('Question and answer required');
 return;
 }
 changeRecovery(questionInput, answerInput);
 clearState();
 setSuccess('Recovery options updated');
 });
 };

 const handleRemove = () => {
 handleAction(() => {
 removePinProtection();
 clearState();
 });
 };

 if (!pinEnabled || !pinExists) {
 return (
 <div className="glass-panel border border-white/5 rounded-2xl p-5 md:p-8 shadow-sm text-center">
 <Shield className="w-8 h-8 text-gray-600 mx-auto mb-4" />
 <h3 className="text-lg font-bold text-white mb-2">Workspace Unlocked</h3>
 <p className="text-gray-400 text-sm mb-6">Your workspace is currently unprotected. Reload to setup PIN.</p>
 <button 
 onClick={() => window.location.reload()} 
 className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium"
 >
 Reload App
 </button>
 </div>
 );
 }

 if (mode !== 'idle') {
 return (
 <div className="glass-panel border border-white/5 rounded-2xl p-5 md:p-8 shadow-sm">
 <div className="mb-6">
 <h3 className="text-lg font-bold text-white mb-1">
 {mode === 'change_pin' && 'Change PIN'}
 {mode === 'change_recovery' && 'Update Recovery Options'}
 {mode === 'remove_pin' && 'Remove Protection'}
 </h3>
 <p className="text-gray-400 text-sm">Please enter your current 6-digit PIN to verify</p>
 </div>

 <div className="space-y-6">
 <div>
 <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-3">Current PIN</p>
 <PinInput value={currentPinInput} onChange={(v) => { setError(''); setCurrentPinInput(v); }} autoFocus />
 </div>

 {mode === 'change_pin' && currentPinInput.length === 6 && (
 <>
 <div>
 <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-3">New PIN</p>
 <PinInput value={newPinInput} onChange={(v) => { setError(''); setNewPinInput(v); }} />
 </div>
 {newPinInput.length === 6 && (
 <div>
 <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-3">Confirm New PIN</p>
 <PinInput value={confirmPinInput} onChange={(v) => { setError(''); setConfirmPinInput(v); }} />
 </div>
 )}
 </>
 )}

 {mode === 'change_recovery' && currentPinInput.length === 6 && (
 <div className="space-y-4">
 <div className="space-y-1">
 <label className="text-xs font-medium tracking-wide text-gray-400">New Recovery Question</label>
 <input 
 type="text" value={questionInput} onChange={e => {setError(''); setQuestionInput(e.target.value);}}
 className="w-full glass-input rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500 "
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-medium tracking-wide text-gray-400">New Answer</label>
 <input 
 type="text" value={answerInput} onChange={e => {setError(''); setAnswerInput(e.target.value);}}
 className="w-full glass-input rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500 "
 />
 </div>
 </div>
 )}

 {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}

 <div className="flex gap-4 pt-4">
 <button 
 onClick={clearState}
 className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 text-sm font-semibold"
 >
 Cancel
 </button>
 <button 
 onClick={() => {
 if (mode === 'change_pin') handleChangePin();
 if (mode === 'change_recovery') handleChangeRecovery();
 if (mode === 'remove_pin') handleRemove();
 }}
 disabled={currentPinInput.length !== 6}
 className="flex-1 py-3 rounded-xl glass-button text-white border-transparent hover:border-violet-500/50 disabled:bg-white/10 disabled:text-gray-500 text-sm font-semibold"
 >
 Confirm
 </button>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="glass-panel border border-white/5 rounded-2xl shadow-sm overflow-hidden">
 <div className="p-5 md:p-8 border-b border-white/5 flex items-center justify-between">
 <div>
 <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
 <Shield className="w-5 h-5 text-violet-400" /> Security
 </h3>
 <p className="text-gray-400 text-sm">Your workspace is protected by a PIN.</p>
 </div>
 {success && <span className="text-green-400 text-xs font-medium px-3 py-1 bg-green-400/10 rounded-full">{success}</span>}
 </div>

 <div className="divide-y divide-white/5">
 <button 
 onClick={lockAppNow}
 className="w-full flex items-center gap-4 p-5 md:px-8 hover:bg-white/5 text-left group"
 >
 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group- ">
 <Lock className="w-5 h-5 text-gray-300" />
 </div>
 <div>
 <h4 className="text-white font-medium text-sm">Lock App Now</h4>
 <p className="text-gray-500 text-xs mt-0.5">Require PIN to access workspace</p>
 </div>
 </button>

 <button 
 onClick={() => setMode('change_pin')}
 className="w-full flex items-center gap-4 p-5 md:px-8 hover:bg-white/5 text-left group"
 >
 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group- ">
 <Key className="w-5 h-5 text-gray-300" />
 </div>
 <div>
 <h4 className="text-white font-medium text-sm">Change PIN</h4>
 <p className="text-gray-500 text-xs mt-0.5">Update your 6-digit access code</p>
 </div>
 </button>

 <button 
 onClick={() => setMode('change_recovery')}
 className="w-full flex items-center gap-4 p-5 md:px-8 hover:bg-white/5 text-left group"
 >
 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group- ">
 <Shield className="w-5 h-5 text-gray-300" />
 </div>
 <div>
 <h4 className="text-white font-medium text-sm">Recovery Options</h4>
 <p className="text-gray-500 text-xs mt-0.5">Update your security question</p>
 </div>
 </button>

 <button 
 onClick={() => setMode('remove_pin')}
 className="w-full flex items-center gap-4 p-5 md:px-8 hover:bg-red-500/5 text-left group"
 >
 <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group- ">
 <Trash2 className="w-5 h-5 text-red-500" />
 </div>
 <div>
 <h4 className="text-red-500 font-medium text-sm">Remove Protection</h4>
 <p className="text-red-500/70 text-xs mt-0.5">Disable PIN and remove stored security data</p>
 </div>
 </button>
 </div>
 </div>
 );
}
