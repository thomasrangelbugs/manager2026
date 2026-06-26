import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export const Modal = ({ open, title, children, onClose }: Props) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-lg rounded-xl border border-white/10 bg-slate-900 p-5 shadow-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-black text-white">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
