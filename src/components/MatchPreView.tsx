import { ClubBadge } from './ClubBadge';
import { CLUBS } from '../data/clubs';
import { calculateLineupStrength } from '../services/matchEngine';
import { getRivalRecentForm } from '../services/seasonService';
import type { Career, Match } from '../types';

export const MatchPreView = ({ career, match }: { career: Career; match: Match }) => {
  const club = CLUBS.find((item) => item.id === career.clubId);
  const userIsHome = match.homeClubId === career.clubId;
  const rivalId = userIsHome ? match.awayClubId : match.homeClubId;
  const rival = CLUBS.find((item) => item.id === rivalId);
  const squad = career.players.filter((player) => player.clubeId === career.clubId);
  const strength = calculateLineupStrength(career.tactic, squad);
  const form = getRivalRecentForm(career, rivalId);

  return (
    <section className="mb-5 rounded-2xl border border-turf/25 bg-turf/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-turf">Pré-jogo</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <ClubBadge club={rival} size="md" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-black text-white">{rival?.nome}</p>
          <p className="text-sm text-slate-300">
            Força estimada do adversário: {rival?.forcaElenco} • Você joga {userIsHome ? 'em casa' : 'fora'}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Seu time: ataque {Math.round(strength.attack)} • defesa {Math.round(strength.defense)} • energia{' '}
            {Math.round(strength.energy)}%
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] font-bold uppercase text-slate-400">Forma rival</p>
          <div className="mt-1 flex gap-1">
            {(form.length ? form : ['-', '-', '-']).map((item, index) => (
              <span
                key={`${item}-${index}`}
                className={`grid h-7 w-7 place-items-center rounded text-xs font-black ${
                  item === 'V' ? 'bg-turf text-slate-950' : item === 'E' ? 'bg-gold text-slate-950' : item === 'D' ? 'bg-rose-500 text-white' : 'bg-white/10'
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Meta da diretoria: {career.boardObjective.label} ({club?.expectativa})
      </p>
    </section>
  );
};
