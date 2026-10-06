import React from 'react';
import type { DangerLevel } from '@shared/api.interface';

interface DangerBadgeProps {
  level: DangerLevel;
}

const levelConfig: Record<
  DangerLevel,
  { label: string; bg: string; text: string }
> = {
  S: { label: 'S级 毁灭级', bg: 'bg-[var(--danger-s)]', text: 'text-white' },
  A: { label: 'A级 灾难级', bg: 'bg-[var(--danger-a)]', text: 'text-white' },
  B: { label: 'B级 危险级', bg: 'bg-[var(--danger-b)]', text: 'text-black' },
  C: { label: 'C级 限制级', bg: 'bg-[var(--danger-c)]', text: 'text-white' },
};

const DangerBadge: React.FC<DangerBadgeProps> = ({ level }) => {
  const config = levelConfig[level];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold tracking-wide rounded-sm ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

export default DangerBadge;
