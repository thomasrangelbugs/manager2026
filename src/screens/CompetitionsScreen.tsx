import { Trophy } from 'lucide-react';
import { ClubBadge } from '../components/ClubBadge';
import { LeagueTable } from '../components/LeagueTable';
import { ScreenHeader } from '../components/ScreenHeader';
import { CLUBS } from '../data/clubs';
import { COMPETITIONS, LEAGUES } from '../data/leagues';
import { sortTable } from '../services/seasonService';
import { useGameStore } from '../stores/gameStore';

export const CompetitionsScreen = () => {
  const career = useGameStore((state) => state.career);
  if (!career) return null;
  const league = LEAGUES.find((item) => item.clubIds.includes(career.clubId));

  return (
    <>
      <ScreenHeader
        title="Competicoes"
        subtitle="Formatos oficiais no cadastro: pontos corridos, copas em mata-mata e continentais com fase de grupos."
      />
      <div className="layout-two-col">
        <section className="grid gap-4 md:grid-cols-2">
          {COMPETITIONS.map((competition) => (
            <article key={competition.id} className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-gold/15 p-3 text-gold">
                  <Trophy size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{competition.tipo}</p>
                  <h2 className="break-words font-display text-2xl font-black text-white">{competition.nome}</h2>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{competition.descricao}</p>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <CompetitionMeta label="Clubes" value={String(competition.participantes)} />
                <CompetitionMeta label="Fases" value={competition.fases ?? competition.tipo} />
              </div>
              <p className="mt-3 rounded-lg border border-white/10 bg-slate-950/45 p-3 text-sm leading-relaxed text-slate-300">
                {competition.formato}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {competition.clubIds.slice(0, 5).map((clubId) => {
                  const club = CLUBS.find((item) => item.id === clubId);
                  return <ClubBadge key={clubId} club={club} size="sm" />;
                })}
                {competition.participantes > 5 ? (
                  <span className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-slate-950/60 px-3 text-xs font-black text-slate-300">
                    +{competition.participantes - 5}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </section>
        <aside className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <h2 className="mb-3 font-display text-2xl font-black text-white">{league?.nome}</h2>
          <LeagueTable table={sortTable(career.leagueTable)} selectedClubId={career.clubId} />
        </aside>
      </div>
    </>
  );
};

const CompetitionMeta = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-white/10 bg-slate-950/45 p-3">
    <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    <p className="mt-1 break-words font-display text-lg font-black leading-tight text-white">{value}</p>
  </div>
);
