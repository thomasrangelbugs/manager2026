import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type Props = {
  title: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  tone?: 'green' | 'blue' | 'gold' | 'rose' | 'neutral';
};

const tones = {
  green: 'from-emerald-400/18 to-emerald-500/5 text-emerald-100',
  blue: 'from-sky-400/18 to-sky-500/5 text-sky-100',
  gold: 'from-amber-400/20 to-amber-500/5 text-amber-100',
  rose: 'from-rose-400/18 to-rose-500/5 text-rose-100',
  neutral: 'from-white/10 to-white/5 text-white',
};

export const StatCard = ({ title, value, detail, icon, tone = 'neutral' }: Props) => (
  <motion.div
    layout
    className={`rounded-xl border border-white/10 bg-gradient-to-br p-4 shadow-lg ${tones[tone]}`}
  >
    <div className="flex min-w-0 items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
        <div className="mt-2 break-words font-display text-2xl font-black leading-tight text-white sm:text-3xl">{value}</div>
      </div>
      {icon ? <div className="rounded-lg bg-white/10 p-2 text-white">{icon}</div> : null}
    </div>
    {detail ? <div className="mt-3 text-sm text-slate-300">{detail}</div> : null}
  </motion.div>
);
