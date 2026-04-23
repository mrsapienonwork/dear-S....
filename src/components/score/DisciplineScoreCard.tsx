import React from 'react';
import { motion } from 'motion/react';
import { ScoreBreakdown, getRank } from '../../lib/disciplineScore';
import { glassCardHover, slideUpItem } from '../../lib/motion';
import { Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface Props {
  todayScore: ScoreBreakdown;
  totalXP: number;
}

export function DisciplineScoreCard({ todayScore, totalXP }: Props) {
  const navigate = useNavigate();
  const rank = getRank(todayScore.total);
  
  return (
    <motion.div 
      variants={slideUpItem}
      whileHover={glassCardHover}
      onClick={() => navigate('/analytics')}
      className={cn(
        "relative overflow-hidden cursor-pointer",
        "glass-panel border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between",
        "bg-gradient-to-br from-black/40 to-black/10 backdrop-blur-2xl",
        rank.badge.split(' ')[0] // adding a very subtle background tint based on rank
      )}
    >
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none -translate-y-1/2 translate-x-1/3 blur-3xl rounded-full bg-current" style={{ color: rank.color.replace('text-', '') }} />

      <div className="flex items-center gap-6 md:gap-10 w-full md:w-auto relative z-10">
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/5 bg-black/40 shadow-inner">
             {/* Score Ring */}
             <svg className="absolute inset-0 w-full h-full -rotate-90">
               <circle cx="50%" cy="50%" r="46%" fill="transparent" strokeWidth="6" className="stroke-white/5" />
               <motion.circle 
                 cx="50%" cy="50%" r="46%" fill="transparent" strokeWidth="6" strokeLinecap="round"
                 className={rank.color.replace('text', 'stroke')}
                 strokeDasharray="290"
                 initial={{ strokeDashoffset: 290 }}
                 animate={{ strokeDashoffset: 290 - (290 * todayScore.total) / 100 }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
               />
             </svg>
             <span className="text-3xl sm:text-4xl font-bold text-white tracking-tighter">{todayScore.total}</span>
          </div>
        </div>

        <div className="space-y-1.5 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Daily Discipline</p>
          <div className="flex items-center gap-3">
             <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-0.5">{rank.title}</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-300 font-medium">+{todayScore.xp} <span className="text-gray-500 font-normal">XP gained today</span></p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row md:flex-col gap-4 mt-6 md:mt-0 w-full md:w-auto relative z-10">
        <div className="glass-panel px-4 py-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1 min-w-[120px]">
           <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Total XP</span>
           <span className="text-xl font-bold text-white tracking-tight">{totalXP.toLocaleString()}</span>
        </div>

        {todayScore.total < 50 && (
          <div className="px-4 py-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-3">
             <Shield className="w-4 h-4 text-amber-500" />
             <span className="text-xs font-medium text-amber-400 uppercase tracking-widest">Build Momentum</span>
          </div>
        )}
      </div>

    </motion.div>
  );
}
