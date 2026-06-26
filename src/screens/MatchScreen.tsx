import { AnimatedButton } from '../components/AnimatedButton';
import { MatchPreView } from '../components/MatchPreView';
import { MatchSimulator } from '../components/MatchSimulator';
import { ScreenHeader } from '../components/ScreenHeader';
import { getCurrentScheduleContext, getNextMatch } from '../services/seasonService';
import { useGameStore } from '../stores/gameStore';
import { formatDate } from '../utils/format';

export const MatchScreen = () => {
  const career = useGameStore((state) => state.career);
  const finishMatch = useGameStore((state) => state.finishMatch);
  const autoFillLineup = useGameStore((state) => state.autoFillLineup);
  const setScreen = useGameStore((state) => state.setScreen);
  const advanceDay = useGameStore((state) => state.advanceDay);
  const defaultSpeed = useGameStore((state) => state.settings.defaultSimulationSpeed);

  if (!career) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.055] p-6">
        <p className="text-slate-300">Nenhuma carreira ativa.</p>
        <div className="mt-4">
          <AnimatedButton onClick={() => setScreen('dashboard')}>Ir ao painel</AnimatedButton>
        </div>
      </section>
    );
  }

  const match = getNextMatch(career);
  const scheduleContext = getCurrentScheduleContext(career);

  if (!match) {
    return (
      <>
        <ScreenHeader title="Partida" subtitle="Não há partidas restantes nesta temporada." />
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-6">
          <p className="text-slate-300">Finalize a temporada no painel para gerar o novo calendário.</p>
          <div className="mt-4">
            <AnimatedButton onClick={() => setScreen('dashboard')}>Voltar ao painel</AnimatedButton>
          </div>
        </div>
      </>
    );
  }

  if (!scheduleContext.isMatchDay) {
    return (
      <>
        <ScreenHeader title="Cronograma do jogo" subtitle="A partida ainda nao chegou no calendario. Avance os dias com treino ou descanso." />
        <section className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-turf">
            Treino {scheduleContext.trainingDay}/{scheduleContext.maxTrainingDays}
          </p>
          <h2 className="mt-2 break-words font-display text-2xl font-black text-white">
            Rodada {match.round} em {formatDate(match.date)}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Hoje e {formatDate(career.currentDate)}. Faltam {scheduleContext.daysUntilMatch} dia(s) para liberar a partida.
          </p>
          <div className="btn-stack-mobile mt-4">
            <AnimatedButton onClick={() => setScreen('training')}>Treinar hoje</AnimatedButton>
            <AnimatedButton variant="secondary" onClick={advanceDay}>Descansar dia</AnimatedButton>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <ScreenHeader
        title="Simulação de partida"
        subtitle="Placar em tempo real, eventos narrados, estatísticas e impacto na tabela."
        action={<AnimatedButton variant="secondary" onClick={autoFillLineup}>Auto escalar</AnimatedButton>}
      />
      <MatchPreView career={career} match={match} />
      <MatchSimulator
        key={match.id}
        match={match}
        players={career.players}
        clubId={career.clubId}
        tactic={career.tactic}
        difficulty={career.manager.dificuldade}
        onFinish={finishMatch}
        defaultSpeed={defaultSpeed}
      />
    </>
  );
};
