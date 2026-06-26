import { Medal, Star } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { useGameStore } from '../stores/gameStore';

export const HallScreen = () => {
  const career = useGameStore((state) => state.career);
  if (!career) return null;

  return (
    <>
      <ScreenHeader title="Hall da Fama" subtitle="Conquistas, ranking histórico e memória das temporadas." />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-black text-white"><Star className="text-gold" /> Conquistas</h2>
          <div className="space-y-3">
            {career.achievements.length ? career.achievements.map((achievement) => (
              <div key={achievement.id} className="rounded-lg bg-slate-950/55 p-4">
                <p className="font-bold text-white">{achievement.title}</p>
                <p className="text-sm text-slate-400">{achievement.description}</p>
              </div>
            )) : <p className="text-slate-400">Conquistas aparecem ao vencer, contratar e fazer campanhas marcantes.</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-black text-white"><Medal className="text-turf" /> Temporadas</h2>
          <div className="space-y-3">
            {career.hallOfFame.length ? career.hallOfFame.map((entry) => (
              <div key={entry.id} className="rounded-lg bg-slate-950/55 p-4">
                <p className="font-bold text-white">{entry.season} • {entry.clubName}</p>
                <p className="text-sm text-slate-400">{entry.title} ({entry.leaguePosition}º)</p>
              </div>
            )) : <p className="text-slate-400">Finalize uma temporada para registrar seu histórico.</p>}
          </div>
        </section>
      </div>
    </>
  );
};
