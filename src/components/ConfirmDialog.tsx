import { ReactNode } from 'react';
import { AnimatedButton } from './AnimatedButton';
import { Modal } from './Modal';

type Props = {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirmar', danger, onConfirm, onClose }: Props) => (
  <Modal open={open} title={title} onClose={onClose}>
    <div className="space-y-4">
      <div className="text-sm leading-relaxed text-slate-300">{message}</div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <AnimatedButton variant="secondary" onClick={onClose}>
          Cancelar
        </AnimatedButton>
        <AnimatedButton
          variant={danger ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </AnimatedButton>
      </div>
    </div>
  </Modal>
);
