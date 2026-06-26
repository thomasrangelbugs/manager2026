import { MessageCircle } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { NewsFeed } from '../components/NewsFeed';
import { ScreenHeader } from '../components/ScreenHeader';
import { useGameStore } from '../stores/gameStore';

export const NewsScreen = () => {
  const career = useGameStore((state) => state.career);
  const answerPress = useGameStore((state) => state.answerPress);
  if (!career) return null;

  return (
    <>
      <ScreenHeader title="Notícias" subtitle="Notícias influenciam moral, pressão, torcida e confiança da diretoria." />
      <div className="layout-two-col">
        <div className="min-w-0">
          <NewsFeed news={career.news} />
        </div>
        <aside className="card-surface xl:sticky xl:top-24 xl:self-start">
          <h2 className="font-display text-xl font-black text-white sm:text-2xl">Coletiva de imprensa</h2>
          <p className="mt-2 text-sm text-slate-400">Escolha um tom para afetar a pressão pública e a moral interna.</p>
          <div className="mt-4 grid gap-2">
            <AnimatedButton variant="secondary" icon={<MessageCircle size={18} />} onClick={() => answerPress('calm')}>
              Manter calma
            </AnimatedButton>
            <AnimatedButton variant="gold" icon={<MessageCircle size={18} />} onClick={() => answerPress('bold')}>
              Prometer ataque
            </AnimatedButton>
            <AnimatedButton variant="secondary" icon={<MessageCircle size={18} />} onClick={() => answerPress('protect')}>
              Proteger elenco
            </AnimatedButton>
          </div>
        </aside>
      </div>
    </>
  );
};
