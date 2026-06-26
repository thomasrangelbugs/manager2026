import { CalendarDays, Dumbbell, PlayCircle, Trophy } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { CLUBS } from '../data/clubs';
import { COMPETITIONS } from '../data/leagues';
import {
  addDaysToDateString,
  daysBetweenDates,
  getCurrentScheduleContext,
  getNextMatch,
  getRivalRecentForm,
} from '../services/seasonService';
import { useGameStore } from '../stores/gameStore';
import { formatDate } from '../utils/format';

export const CalendarScreen = () => {
  const career = useGameStore((state) => state.career);
  const setScreen = useGameStore((state) => state.setScreen);
  const advanceDay = useGameStore((state) => state.advanceDay);
  if (!career) return null;

  const next = getNextMatch(career);
  const context = getCurrentScheduleContext(career);
  const currentRound = next?.round ?? career.schedule.filter((match) => match.played).length + 1;
  const rivalId = next ? (next.homeClubId === career.clubId ? next.awayClubId : next.homeClubId) : null;
  const rivalForm = rivalId ? getRivalRecentForm(career, rivalId) : [];
  const agendaDays = buildAgendaDays(career.currentDate, next?.date);

  return (
    <>
      <ScreenHeader
        title="Calendario"
        subtitle="O cronograma avanca dia por dia: treinos, descanso e jogo so no dia marcado."
        action={
          next ? (
            <AnimatedButton
              icon={context.isMatchDay ? <PlayCircle size={18} /> : <Dumbbell size={18} />}
              onClick={() => setScreen(context.isMatchDay ? 'match' : 'training')}
            >
              {context.isMatchDay ? 'Ir para o jogo' : 'Treino de hoje'}
            </AnimatedButton>
          ) : null
        }
      />

      {next ? (
        <div className="mb-5 rounded-xl border border-turf/30 bg-turf/10 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-turf">
            Rodada {next.round} - {context.isMatchDay ? 'dia de jogo' : `treino ${context.trainingDay}/${context.maxTrainingDays}`}
          </p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="break-words font-display text-2xl font-black leading-tight text-white">
                {CLUBS.find((club) => club.id === next.homeClubId)?.nome} x {CLUBS.find((club) => club.id === next.awayClubId)?.nome}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Hoje: {formatDate(career.currentDate)} - Jogo: {formatDate(next.date)}
              </p>
              {rivalForm.length ? (
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <span className="text-xs font-bold uppercase text-slate-400">Forma rival:</span>
                  {rivalForm.map((result, index) => (
                    <FormBadge key={`${result}-${index}`} result={result} />
                  ))}
                </div>
              ) : (
                <span className="mt-2 block text-sm text-slate-400">Sem historico recente do adversario.</span>
              )}
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
              {context.isMatchDay ? (
                <AnimatedButton icon={<PlayCircle size={18} />} onClick={() => setScreen('match')}>
                  Jogar
                </AnimatedButton>
              ) : (
                <>
                  <AnimatedButton icon={<Dumbbell size={18} />} onClick={() => setScreen('training')}>
                    Treinar
                  </AnimatedButton>
                  <AnimatedButton variant="secondary" icon={<CalendarDays size={18} />} onClick={advanceDay}>
                    Descansar
                  </AnimatedButton>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {agendaDays.length ? (
        <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {agendaDays.map((day) => {
            const isGame = next ? day === next.date || (context.isMatchDay && day === career.currentDate) : false;
            return (
              <div
                key={day}
                className={`rounded-lg border p-3 ${
                  isGame ? 'border-gold/40 bg-gold/10 text-amber-50' : 'border-white/10 bg-white/[0.05] text-slate-300'
                }`}
              >
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{formatDate(day)}</p>
                <p className="mt-1 font-bold text-white">{isGame ? 'Jogo oficial' : 'Dia de treino'}</p>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="layout-two-col">
        <section className="space-y-3">
          {career.schedule.map((match) => {
            const home = CLUBS.find((club) => club.id === match.homeClubId);
            const away = CLUBS.find((club) => club.id === match.awayClubId);
            const competition = COMPETITIONS.find((item) => item.id === match.competitionId);
            const isNext = next?.id === match.id;
            const isCurrentRound = match.round === currentRound;
            const involvesUser = match.homeClubId === career.clubId || match.awayClubId === career.clubId;
            const isCup = competition?.tipo === 'Copa';

            return (
              <article
                key={match.id}
                className={`rounded-xl border p-4 ${
                  isNext
                    ? 'border-turf bg-turf/10'
                    : isCurrentRound && involvesUser
                      ? 'border-gold/35 bg-gold/5'
                      : 'border-white/10 bg-white/[0.05]'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Rodada {match.round} - {formatDate(match.date)}
                      </p>
                      {isCup ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[0.65rem] font-black uppercase text-gold">
                          <Trophy size={12} />
                          Copa
                        </span>
                      ) : null}
                      {involvesUser ? (
                        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[0.65rem] font-black uppercase text-slate-300">
                          Seu clube
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-1 break-words font-display text-2xl font-black leading-tight text-white">
                      {home?.nome} x {away?.nome}
                    </h2>
                    <p className="break-words text-sm text-slate-400">{competition?.nome}</p>
                  </div>
                  <MatchStatus match={match} isNext={isNext} isMatchDay={context.isMatchDay} daysUntilMatch={context.daysUntilMatch} />
                </div>
              </article>
            );
          })}
        </section>
        <aside className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <h2 className="font-display text-2xl font-black text-white">Competicoes ativas</h2>
          <div className="mt-4 space-y-3">
            {COMPETITIONS.slice(0, 6).map((competition) => (
              <div key={competition.id} className="rounded-lg bg-slate-950/55 p-3">
                <p className="break-words font-bold text-white">{competition.nome}</p>
                <p className="text-sm text-slate-400">
                  {competition.tipo} - {competition.participantes} clubes
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
};

const buildAgendaDays = (currentDate: string, matchDate?: string) => {
  if (!matchDate) return [];
  const days = Math.min(6, Math.max(0, daysBetweenDates(currentDate, matchDate)));
  return Array.from({ length: days + 1 }, (_, index) => addDaysToDateString(currentDate, index));
};

const MatchStatus = ({
  match,
  isNext,
  isMatchDay,
  daysUntilMatch,
}: {
  match: { played: boolean; homeGoals?: number; awayGoals?: number };
  isNext: boolean;
  isMatchDay: boolean;
  daysUntilMatch: number;
}) => {
  if (match.played) {
    return (
      <div className="inline-grid shrink-0 grid-cols-[minmax(1.8rem,auto)_auto_minmax(1.8rem,auto)] items-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 font-display text-3xl font-black text-white">
        <span className="text-right">{match.homeGoals}</span>
        <span className="text-slate-500">x</span>
        <span>{match.awayGoals}</span>
      </div>
    );
  }

  return (
    <div className="shrink-0 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-left sm:text-right">
      <p className="whitespace-nowrap font-display text-xl font-black text-white">
        {isNext ? (isMatchDay ? 'Hoje' : `${daysUntilMatch}d`) : 'Agendado'}
      </p>
      {isNext && !isMatchDay ? <p className="text-xs text-slate-400">ate o jogo</p> : null}
    </div>
  );
};

const FormBadge = ({ result }: { result: 'V' | 'E' | 'D' }) => {
  const tone =
    result === 'V' ? 'border-turf/40 bg-turf/15 text-turf' : result === 'E' ? 'border-gold/40 bg-gold/10 text-gold' : 'border-rose-400/40 bg-rose-500/10 text-rose-300';
  return <span className={`grid h-7 w-7 place-items-center rounded-md border text-xs font-black ${tone}`}>{result}</span>;
};
