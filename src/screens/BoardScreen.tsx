import { Building2, ShieldAlert } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { ClubBadge } from '../components/ClubBadge';
import { ScreenHeader } from '../components/ScreenHeader';
import { CLUBS } from '../data/clubs';
import { sortTable } from '../services/seasonService';
import { useGameStore } from '../stores/gameStore';

export const BoardScreen = () => {
  const career = useGameStore((state) => state.career);
  const assumeClub = useGameStore((state) => state.assumeClub);
  if (!career) return null;
  const club = CLUBS.find((item) => item.id === career.clubId);
  const position = sortTable(career.leagueTable).findIndex((entry) => entry.clubId === career.clubId) + 1;
  const alternatives = CLUBS.filter((item) => item.id !== career.clubId && item.forcaElenco <= (club?.forcaElenco ?? 70) + 4).slice(0, 8);

  return (
    <>
      <ScreenHeader title="Diretoria" subtitle="Expectativas, confiança, pressão e risco de demissão." />
      <div className="layout-two-col">
        <section className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          {career.isFired ? (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-5">
              <div className="flex items-center gap-3 text-rose-100">
                <ShieldAlert size={24} />
                <h2 className="font-display text-3xl font-black">Você foi demitido</h2>
              </div>
              <p className="mt-2 text-sm text-rose-100/85">
                A confiança chegou a zero. Escolha outro clube para seguir a carreira.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4">
                <ClubBadge club={club} size="lg" />
                <div>
                  <h2 className="font-display text-3xl font-black text-white">{club?.nome}</h2>
                  <p className="text-slate-400">Expectativa: {club?.expectativa}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <BoardMetric label="Confiança" value={`${career.boardConfidence}%`} />
                <BoardMetric label="Torcida" value={`${career.fanMorale}%`} />
                <BoardMetric label="Pressão" value={`${career.pressPressure}%`} />
              </div>
              <div className="mt-6">
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Confiança da diretoria</p>
                <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                  <div className={`h-full ${career.boardConfidence > 45 ? 'bg-turf' : 'bg-rose-500'}`} style={{ width: `${career.boardConfidence}%` }} />
                </div>
              </div>
            </div>
          )}
        </section>
        <aside className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <h2 className="font-display text-2xl font-black text-white">Relatório</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p className="rounded-lg bg-slate-950/55 p-3">Posição atual na liga: <strong>{position || '-'}º</strong>.</p>
            <p className="rounded-lg bg-slate-950/55 p-3">Perder muitas partidas reduz confiança; vitórias e boas coletivas recuperam apoio.</p>
          </div>
        </aside>
      </div>
      {career.isFired ? (
        <section className="mt-5">
          <h2 className="mb-3 font-display text-2xl font-black text-white">Clubes disponíveis</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {alternatives.map((item) => (
              <button key={item.id} type="button" onClick={() => assumeClub(item.id)} className="rounded-xl border border-white/10 bg-white/[0.055] p-4 text-left hover:border-turf">
                <div className="flex items-center gap-3">
                  <ClubBadge club={item} />
                  <div>
                    <p className="font-bold text-white">{item.nome}</p>
                    <p className="text-sm text-slate-400">{item.pais}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
};

const BoardMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-slate-950/55 p-4">
    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className="mt-1 font-display text-3xl font-black text-white">{value}</p>
  </div>
);
