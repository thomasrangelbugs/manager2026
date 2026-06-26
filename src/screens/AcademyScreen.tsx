import { Sprout } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { PlayerCard } from '../components/PlayerCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { useGameStore } from '../stores/gameStore';
import { currency } from '../utils/format';

export const AcademyScreen = () => {
  const career = useGameStore((state) => state.career);
  const generateYouth = useGameStore((state) => state.generateYouth);
  const promoteYouth = useGameStore((state) => state.promoteYouth);
  if (!career) return null;

  return (
    <>
      <ScreenHeader
        title="Academia de base"
        subtitle={`Busque promessas da base e promova ao elenco principal. Custo por observação: ${currency(240000)}.`}
        action={
          <AnimatedButton icon={<Sprout size={18} />} onClick={generateYouth}>
            Buscar jovem
          </AnimatedButton>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {career.academy.length ? (
          career.academy.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              action={
                <AnimatedButton className="w-full" onClick={() => promoteYouth(player.id)}>
                  Promover
                </AnimatedButton>
              }
            />
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-6 text-slate-300">
            Nenhum jovem na base. Acione o olheiro para gerar promessas.
          </div>
        )}
      </div>
    </>
  );
};
