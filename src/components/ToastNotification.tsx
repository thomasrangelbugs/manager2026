import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const tone = {
  success: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
  error: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
  info: 'border-sky-400/30 bg-sky-500/15 text-sky-100',
  warning: 'border-amber-400/30 bg-amber-500/15 text-amber-100',
};

export const ToastNotification = () => {
  const toasts = useGameStore((state) => state.toasts);

  return (
    <div className="fixed right-3 top-3 z-[60] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur ${tone[toast.type]}`}
            >
              <Icon className="mt-0.5 shrink-0" size={18} />
              <p className="text-sm font-semibold leading-snug">{toast.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
