import { Trophy } from 'lucide-react';
import { Modal } from './Modal';
import { useGameStore } from '../stores/gameStore';

export const AchievementModal = () => {
  const achievement = useGameStore((state) => state.career?.pendingAchievement);
  const dismiss = useGameStore((state) => state.dismissAchievement);
  if (!achievement) return null;

  return (
    <Modal open title="Nova conquista" onClose={dismiss}>
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/20 text-gold">
          <Trophy size={28} />
        </div>
        <h3 className="mt-4 font-display text-2xl font-black text-white">{achievement.title}</h3>
        <p className="mt-2 text-sm text-slate-300">{achievement.description}</p>
      </div>
    </Modal>
  );
};
