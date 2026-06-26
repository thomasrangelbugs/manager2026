import { MouseEventHandler, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { audioService } from '../services/audioService';
import { useGameStore } from '../stores/gameStore';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';

type Props = {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
};

const variants: Record<Variant, string> = {
  primary:
    'bg-turf text-slate-950 hover:bg-emerald-300 shadow-glow focus-visible:ring-turf/70',
  secondary:
    'bg-white/10 text-slate-100 hover:bg-white/15 border border-white/10 focus-visible:ring-white/40',
  ghost:
    'bg-transparent text-slate-200 hover:bg-white/10 border border-transparent focus-visible:ring-white/30',
  danger:
    'bg-rose-500/90 text-white hover:bg-rose-400 focus-visible:ring-rose-300',
  gold:
    'bg-gold text-slate-950 hover:bg-amber-300 shadow-gold focus-visible:ring-gold/70',
};

export const AnimatedButton = ({ children, variant = 'primary', icon, className = '', onClick, disabled, type = 'button', title }: Props) => {
  const registerInteraction = useGameStore((state) => state.registerInteraction);
  const animations = useGameStore((state) => state.settings.animations);

  return (
    <motion.button
      whileHover={animations && !disabled ? { y: -1 } : undefined}
      whileTap={animations && !disabled ? { scale: 0.98 } : undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wide transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      disabled={disabled}
      type={type}
      title={title}
      onClick={(event) => {
        if (disabled) return;
        onClick?.(event);
        void registerInteraction()
          .then(() => audioService.playEffect('click'))
          .catch(() => undefined);
      }}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
};
