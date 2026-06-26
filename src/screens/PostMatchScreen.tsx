import { ArrowRight, Home } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { ClubBadge } from '../components/ClubBadge';
import { CLUBS } from '../data/clubs';
import { getCurrentScheduleContext, getNextMatch } from '../services/seasonService';
import { useGameStore } from '../stores/gameStore';
import { currency } from '../utils/format';

export const PostMatchScreen = () => {
  const career = useGameStore((state) => state.career);
  const summary = useGameStore((state) => state.postMatchSummary);
  const leavePostMatch = useGameStore((state) => state.leavePostMatch);
  const setScreen = useGameStore((state) => state.setScreen);

  if (!career || !summary) {
    return (
      <section className="mx-auto max-w-lg space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-center">
        <p className="text-slate-300">Resumo indisponível.</p>
        <AnimatedButton icon={<Home size={18} />} onClick={leavePostMatch}>
          Voltar ao painel
        </AnimatedButton>
      </section>
    );
  }

  const homeClub = CLUBS.find((club) => club.id === summary.homeClubId);
  const awayClub = CLUBS.find((club) => club.id === summary.awayClubId);
  const mvp = career.players.find((player) => player.id === summary.mvpPlayerId);
  const resultLabel = summary.won ? 'Vitória' : summary.draw ? 'Empate' : 'Derrota';
  const resultTone = summary.won ? 'text-turf' : summary.draw ? 'text-gold' : 'text-rose-400';
  const nextMatch = getNextMatch(career);
  const scheduleContext = getCurrentScheduleContext(career);

  const goNext = () => {
    leavePostMatch();
    if (nextMatch) {
      setScreen(scheduleContext.isMatchDay ? 'match' : 'training');
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-center shadow-2xl backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Resumo da partida</p>
        <p className={`mt-2 font-display text-4xl font-black ${resultTone}`}>{resultLabel}</p>
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-col items-center gap-2">
            <ClubBadge club={homeClub} size="lg" />
            <p className="max-w-[8rem] break-words text-center text-sm font-bold leading-tight text-white">{homeClub?.nome}</p>
          </div>
          <p className="inline-grid shrink-0 grid-cols-[minmax(1.8rem,auto)_auto_minmax(1.8rem,auto)] items-baseline gap-2 whitespace-nowrap font-display text-4xl font-black text-white sm:text-5xl">
            <span className="text-right">{summary.homeGoals}</span>
            <span className="text-slate-500">x</span>
            <span>{summary.awayGoals}</span>
          </p>
          <div className="flex min-w-0 flex-col items-center gap-2">
            <ClubBadge club={awayClub} size="lg" />
            <p className="max-w-[8rem] break-words text-center text-sm font-bold leading-tight text-white">{awayClub?.nome}</p>
          </div>
        </div>
        {mvp ? (
          <p className="mt-5 text-sm text-slate-300">
            Destaque: <strong className="text-white">{mvp.nome}</strong> ({mvp.posicao})
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Diretoria" value={`${summary.confidenceDelta >= 0 ? '+' : ''}${summary.confidenceDelta}%`} />
        <StatCard label="Torcida" value={`${summary.fanDelta >= 0 ? '+' : ''}${summary.fanDelta}%`} />
        <StatCard label="Caixa" value={currency(summary.financeDelta)} />
      </div>

      <p className="rounded-xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-relaxed text-slate-300">{summary.boardMessage}</p>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {nextMatch ? (
          <AnimatedButton className="w-full sm:flex-1" icon={<ArrowRight size={18} />} onClick={goNext}>
            {scheduleContext.isMatchDay ? 'Proxima partida' : 'Ir para treino'}
          </AnimatedButton>
        ) : null}
        <AnimatedButton
          className="w-full sm:flex-1"
          variant={nextMatch ? 'secondary' : 'primary'}
          icon={<Home size={18} />}
          onClick={leavePostMatch}
        >
          Voltar ao painel
        </AnimatedButton>
      </div>
    </section>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4 text-center">
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
    <p className="mt-1 font-display text-2xl font-black text-white">{value}</p>
  </div>
);
