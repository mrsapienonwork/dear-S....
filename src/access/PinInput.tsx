import React from 'react';

export function PinInput({ value, onChange, autoFocus }: { value: string, onChange: (v: string) => void, autoFocus?: boolean }) {
 return (
 <div className="relative flex justify-center">
 <input
 type="text"
 inputMode="numeric"
 pattern="[0-9]*"
 maxLength={6}
 autoFocus={autoFocus}
 value={value}
 onChange={(e) => {
 const val = e.target.value.replace(/\D/g, '').slice(0, 6);
 onChange(val);
 }}
 className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 text-transparent"
 />
 <div className="flex gap-3 justify-center">
 {Array.from({ length: 6 }).map((_, i) => (
 <div
 key={i}
 className={`w-4 h-4 rounded-full ${
 i < value.length
 ? 'bg-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.6)]'
 : 'bg-white/10'
 }`}
 />
 ))}
 </div>
 </div>
 );
}
