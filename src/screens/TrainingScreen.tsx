import { CalendarDays, Dumbbell, FastForward, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AnimatedButton } from '../components/AnimatedButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { useGameStore } from '../stores/gameStore';
import type { TrainingFocus, TrainingIntensity } from '../services/trainingService';
import { getCurrentScheduleContext } from '../services/seasonService';
import { formatDate } from '../utils/format';

const focuses: TrainingFocus[] = ['Ataque', 'Defesa', 'Físico', 'Velocidade', 'Técnica', 'Goleiros', 'Jovens'];
const intensities: TrainingIntensity[] = ['Leve', 'Normal', 'Pesado'];

export const TrainingScreen = () => {
  const [focus, setFocus] = useState<TrainingFocus>('Técnica');
  const [intensity, setIntensity] = useState<TrainingIntensity>('Normal');
  const trainWeek = useGameStore((state) => state.trainWeek);
  const trainUntilMatch = useGameStore((state) => state.trainUntilMatch);
  const autoTrainUntilMatch = useGameStore((state) => state.autoTrainUntilMatch);
  const restUntilMatch = useGameStore((state) => state.restUntilMatch);
  const advanceDay = useGameStore((state) => state.advanceDay);
  const reports = useGameStore((state) => state.lastTrainingReport);
  const career = useGameStore((state) => state.career);
  if (!career) return null;
  const context = getCurrentScheduleContext(career);
  const canTrain = Boolean(context.nextMatch && !context.isMatchDay);

  return (
    <>
      <ScreenHeader
        title="Treinamento"
        subtitle={
          context.nextMatch
            ? `Hoje: ${formatDate(career.currentDate)}. ${context.isMatchDay ? 'Dia de jogo.' : `Treino ${context.trainingDay}/${context.maxTrainingDays} antes da rodada ${context.nextMatch.round}.`}`
            : 'Temporada concluida.'
        }
      />
      <div className="layout-two-col">
        <section className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <h2 className="font-display text-2xl font-black text-white">Foco do dia</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {focuses.map((item) => (
              <button key={item} type="button" onClick={() => setFocus(item)} className={`rounded-xl border p-5 text-left font-display text-2xl font-black ${focus === item ? 'border-turf bg-turf text-slate-950' : 'border-white/10 bg-slate-950/60 text-white hover:bg-white/10'}`}>
                {item}
              </button>
            ))}
          </div>
          <h2 className="mt-6 font-display text-2xl font-black text-white">Intensidade</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {intensities.map((item) => (
              <button key={item} type="button" onClick={() => setIntensity(item)} className={`rounded-lg border px-4 py-3 font-bold ${intensity === item ? 'border-gold bg-gold text-slate-950' : 'border-white/10 bg-slate-950 text-slate-300'}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="mt-5">
            <div className="btn-stack-mobile">
              <AnimatedButton icon={<Dumbbell size={18} />} onClick={() => trainWeek(focus, intensity)} disabled={!canTrain}>
                Aplicar treino do dia
              </AnimatedButton>
              {canTrain ? (
                <AnimatedButton variant="secondary" onClick={advanceDay}>
                  Descansar dia
                </AnimatedButton>
              ) : null}
            </div>
            {!canTrain ? (
              <p className="mt-3 rounded-lg border border-gold/25 bg-gold/10 p-3 text-sm text-amber-100">
                {context.nextMatch ? 'Hoje e dia de jogo. Va para a tela Jogo.' : 'Nao ha partida restante nesta temporada.'}
              </p>
            ) : null}
          </div>
          {canTrain && context.nextMatch ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/45 p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Avanco ate o jogo</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Rodada {context.nextMatch.round} - {formatDate(context.nextMatch.date)}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-turf/30 bg-turf/10 px-3 py-1 text-xs font-black uppercase text-turf">
                  {context.daysUntilMatch} dia(s)
                </span>
              </div>
              <div className="btn-stack-mobile mt-4">
                <AnimatedButton variant="secondary" icon={<FastForward size={18} />} onClick={() => trainUntilMatch(focus, intensity)}>
                  Treinar ate o jogo
                </AnimatedButton>
                <AnimatedButton variant="gold" icon={<Sparkles size={18} />} onClick={autoTrainUntilMatch}>
                  Treino automatico
                </AnimatedButton>
                <AnimatedButton variant="secondary" icon={<CalendarDays size={18} />} onClick={restUntilMatch}>
                  Descansar ate o jogo
                </AnimatedButton>
              </div>
            </div>
          ) : null}
        </section>
        <aside className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <h2 className="font-display text-2xl font-black text-white">Evolução</h2>
          <div className="mt-4 space-y-3">
            {(reports.length ? reports : ['Nenhum treino aplicado nesta sessão.']).map((report) => (
              <p key={report} className="rounded-lg bg-slate-950/55 p-3 text-sm text-slate-300">
                {report}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
};
