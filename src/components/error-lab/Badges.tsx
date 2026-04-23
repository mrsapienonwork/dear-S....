import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ErrorStatus, ErrorType, ErrorSeverity } from '../../types';

interface StatusBadgeProps {
  status: ErrorStatus;
}
export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'Resolved') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Resolved</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
      <AlertCircle className="w-3.5 h-3.5" />
      <span>Unresolved</span>
    </div>
  );
}

const severityColors = {
  Low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  High: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export function SeverityBadge({ severity }: { severity: ErrorSeverity }) {
  return (
    <div className={`px-2 py-1 text-xs font-medium rounded-md border ${severityColors[severity]}`}>
      {severity} Impact
    </div>
  );
}

export function TypeBadge({ type }: { type: ErrorType }) {
  return (
    <div className="px-2 py-1 text-xs font-medium rounded-md bg-white/5 text-gray-300 border border-white/10">
      {type}
    </div>
  );
}
