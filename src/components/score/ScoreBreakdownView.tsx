import React from 'react';
import { motion } from 'motion/react';
import { ScoreBreakdown } from '../../lib/disciplineScore';
import { Target, CheckCircle, BookOpen, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { slideUpItem } from '../../lib/motion';

interface Props {
  score: ScoreBreakdown;
}

export function ScoreBreakdownView({ score }: Props) {
  
  const items = [
    { icon: <Target className="w-4 h-4 text-emerald-400" />, label: 'Habits', value: score.habits, max: 40 },
    { icon: <CheckCircle className="w-4 h-4 text-blue-400" />, label: 'Check-in', value: score.checkIn, max: 20 },
    { icon: <BookOpen className="w-4 h-4 text-violet-400" />, label: 'Chapters', value: score.chapters, max: 30 },
    { icon: <Zap className="w-4 h-4 text-amber-400" />, label: 'Activity Bonus', value: score.activityBonus, max: 10 },
  ];

  return (
    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div 
          key={item.label}
          variants={slideUpItem}
          className="flex items-center justify-between p-3 rounded-xl border border-white/5 glass-panel"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/5">
              {item.icon}
            </div>
            <span className="text-sm font-medium text-gray-300">{item.label}</span>
          </div>
          <span className={cn(
            "text-base font-bold",
            item.value > 0 ? "text-white" : "text-gray-600"
          )}>
            {item.value}/{item.max}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
