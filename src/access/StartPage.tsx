import React from 'react';
import { useAccess } from './AccessContext';
import { ChevronRight } from 'lucide-react';

export function StartPage() {
 const { goToAuth } = useAccess();

 return (
 <div className="fixed inset-0 z-[100] bg-transparent flex flex-col items-center justify-center overflow-hidden selection:bg-violet-500/30">
 <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
 <div className="w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[120px] opacity-50" />
 </div>

 <div 
 
 
 className="z-10 flex flex-col items-center text-center"
 >
 <h1 className="text-5xl md:text-7xl font-bold tracking-[0.2em] text-white mb-6">DEAR S.</h1>
 <p className="text-gray-400 tracking-widest text-sm md:text-base mb-16 opacity-80">
 I will do it, believe me, my love.
 </p>
 <button 
 onClick={() => goToAuth()}
 className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full border border-white/10 hover:border-white/30 "
 >
 <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100" />
 <div className="relative flex items-center gap-3 text-white tracking-widest text-sm font-medium uppercase">
 ENTER SYSTEM <ChevronRight className="w-4 h-4 text-gray-400 " />
 </div>
 </button>
 </div>
 </div>
 );
}
