import {
  ArrowRight,
  CalendarDays,
  Coins,
  Dumbbell,
  HeartPulse,
  Newspaper,
  ShieldAlert,
  Trophy,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { ClubBadge } from '../components/ClubBadge';
import { LeagueTable } from '../components/LeagueTable';
import { NewsFeed } from '../components/NewsFeed';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatCard } from '../components/StatCard';
import { CLUBS } from '../data/clubs';
import { LEAGUES } from '../data/leagues';
import { evaluateObjective } from '../services/boardService';
import { warnExpiringContracts } from '../services/disciplineService';
import { getCurrentScheduleContext, getNextMatch, sortTable } from '../services/seasonService';
import { useGameStore } from '../stores/gameStore';
import { currency, formatDate } from '../utils/format';

export const DashboardScreen = () => {
  const career = useGameStore((state) => state.career);
  const setScreen = useGameStore((state) => state.setScreen);
  const advanceSeason = useGameStore((state) => state.advanceSeason);
  const simulateRound = useGameStore((state) => state.simulateRound);
  const advanceDay = useGameStore((state) => state.advanceDay);
  if (!career) return null;

  const club = CLUBS.find((item) => item.id === career.clubId);
  const nextMatch = getNextMatch(career);
  const scheduleContext = getCurrentScheduleContext(career);
  const isMatchDay = scheduleContext.isMatchDay;
  const homeClub = nextMatch ? CLUBS.find((item) => item.id === nextMatch.homeClubId) : null;
  const awayClub = nextMatch ? CLUBS.find((item) => item.id === nextMatch.awayClubId) : null;
  const rival = nextMatch ? CLUBS.find((item) => item.id === (nextMatch.homeClubId === career.clubId ? nextMatch.awayClubId : nextMatch.homeClubId)) : null;
  const table = sortTable(career.leagueTable);
  const position = table.findIndex((entry) => entry.clubId === career.clubId) + 1;
  const league = LEAGUES.find((item) => item.id === club?.ligaId);
  const squad = career.players.filter((player) => player.clubeId === career.clubId);
  const averageMorale = Math.round(squad.reduce((sum, player) => sum + player.moral, 0) / Math.max(1, squad.length));
  const averageEnergy = Math.round(squad.reduce((sum, player) => sum + player.energia, 0) / Math.max(1, squad.length));
  const objectiveStatus = evaluateObjective(position, career.boardObjective);
  const expiringContracts = warnExpiringContracts(career.players, career.clubId);
  const lastResults = career.matchHistory
    .filter((match) => match.homeClubId === career.clubId || match.awayClubId === career.clubId)
    .slice(0, 5)
    .map((match) => {
      const userHome = match.homeClubId === career.clubId;
      const userGoals = userHome ? match.homeGoals ?? 0 : match.awayGoals ?? 0;
      const rivalGoals = userHome ? match.awayGoals ?? 0 : match.homeGoals ?? 0;
      return userGoals > rivalGoals ? 'V' : userGoals === rivalGoals ? 'E' : 'D';
    });

  return (
    <>
      <ScreenHeader
        title="Central do clube"
        subtitle={`${career.manager.nome} comanda o ${club?.nome} na temporada ${career.season}.`}
        action={
          nextMatch ? (
            <AnimatedButton icon={isMatchDay ? <Trophy size={18} /> : <Dumbbell size={18} />} onClick={() => setScreen(isMatchDay ? 'match' : 'training')}>
              {isMatchDay ? 'Entrar no jogo' : 'Treinar hoje'}
            </AnimatedButton>
          ) : (
            <AnimatedButton icon={<Trophy size={18} />} onClick={advanceSeason}>
              Encerrar temporada
            </AnimatedButton>
          )
        }
      />

      {nextMatch ? (
        <section className="mb-5 rounded-2xl border-2 border-turf/40 bg-gradient-to-br from-turf/15 to-slate-950/80 p-4 shadow-glow sm:p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-turf">Próximo jogo</p>
          <h2 className="mt-2 break-words font-display text-2xl font-black text-white sm:text-3xl lg:text-4xl">
            {club?.nome} x {rival?.nome}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {league?.nome} • Rodada {nextMatch.round} • {formatDate(nextMatch.date)}
          </p>
          <p className="mt-2 text-sm font-bold text-white">
            Hoje: {formatDate(career.currentDate)} •{' '}
            {isMatchDay
              ? 'dia de jogo'
              : `treino ${scheduleContext.trainingDay}/${scheduleContext.maxTrainingDays} (${scheduleContext.daysUntilMatch} dia(s) para jogar)`}
          </p>
          <div className="btn-stack-mobile mt-4">
            {isMatchDay ? (
              <>
                <AnimatedButton icon={<Trophy size={18} />} onClick={() => setScreen('match')}>
                  Jogar agora
                </AnimatedButton>
                <AnimatedButton variant="secondary" icon={<Zap size={18} />} onClick={simulateRound}>
                  Simular rodada
                </AnimatedButton>
              </>
            ) : (
              <>
                <AnimatedButton icon={<Dumbbell size={18} />} onClick={() => setScreen('training')}>
                  Treinar hoje
                </AnimatedButton>
                <AnimatedButton variant="secondary" icon={<CalendarDays size={18} />} onClick={advanceDay}>
                  Descansar dia
                </AnimatedButton>
              </>
            )}
          </div>
        </section>
      ) : null}

      <section className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Meta da diretoria</p>
        <p className="mt-1 font-bold text-white">{career.boardObjective.label}</p>
        <p className="mt-1 text-sm text-slate-400">{objectiveStatus.message}</p>
        {expiringContracts.length ? (
          <p className="mt-2 text-sm text-amber-200">
            {expiringContracts.length} contrato(s) vencem em breve — revise o elenco.
          </p>
        ) : null}
      </section>

      <section className="dashboard-hero relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-2xl sm:p-6">
        <div className="stadium-strip absolute inset-0 opacity-60" />
        <div className="absolute inset-x-6 top-4 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">matchday room</p>
            <h2 className="mt-2 max-w-3xl break-words font-display text-2xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              {nextMatch ? `${club?.nome} contra ${rival?.nome}` : 'Temporada concluída'}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {nextMatch
                ? `${league?.nome} • Rodada ${nextMatch.round} • ${formatDate(nextMatch.date)}`
                : 'A diretoria aguarda o relatório final e a nova pré-temporada.'}
            </p>
            <div className="btn-stack-mobile mt-5">
              <AnimatedButton icon={nextMatch && !isMatchDay ? <Dumbbell size={18} /> : <Zap size={18} />} onClick={() => (nextMatch ? setScreen(isMatchDay ? 'match' : 'training') : advanceSeason())}>
                {nextMatch ? (isMatchDay ? 'Simular partida' : 'Treino do dia') : 'Nova temporada'}
              </AnimatedButton>
              <AnimatedButton variant="secondary" icon={<Users size={18} />} onClick={() => setScreen('tactics')}>
                Plano de jogo
              </AnimatedButton>
              <AnimatedButton variant="secondary" icon={<Wallet size={18} />} onClick={() => setScreen('transfers')}>
                Mercado
              </AnimatedButton>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/72 p-4 shadow-xl backdrop-blur">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
              <MiniClub club={homeClub ?? club} label="Casa" />
              <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2 py-2 text-center sm:px-4 sm:py-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-400">prévia</p>
                <p className="font-display text-2xl font-black text-white sm:text-4xl">VS</p>
              </div>
              <MiniClub club={awayClub ?? rival ?? club} label="Fora" right />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <Pulse label="Moral" value={averageMorale} tone={averageMorale >= 65 ? 'green' : 'rose'} />
              <Pulse label="Energia" value={averageEnergy} tone={averageEnergy >= 68 ? 'green' : 'gold'} />
              <Pulse label="Diretoria" value={career.boardConfidence} tone={career.boardConfidence >= 45 ? 'blue' : 'rose'} />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Posição na liga" value={`${position || '-'}º`} detail={league?.nome} icon={<Trophy size={20} />} tone="gold" />
        <StatCard title="Moral do elenco" value={`${averageMorale}%`} detail="Média do plantel" icon={<HeartPulse size={20} />} tone={averageMorale >= 65 ? 'green' : 'rose'} />
        <StatCard title="Caixa" value={currency(career.finance.orcamento)} detail="Saldo disponível" icon={<Coins size={20} />} tone="green" />
        <StatCard title="Confiança" value={`${career.boardConfidence}%`} detail={club?.expectativa} icon={<ShieldAlert size={20} />} tone={career.boardConfidence > 45 ? 'blue' : 'rose'} />
      </div>

      <div className="layout-two-col mt-5">
        <section className="min-w-0 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-surface">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Forma recente</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(lastResults.length ? lastResults : ['-', '-', '-', '-', '-']).map((result, index) => (
                      <span
                        key={`${result}-${index}`}
                        className={`grid h-10 w-10 place-items-center rounded-lg font-black ${
                          result === 'V'
                            ? 'bg-turf text-slate-950'
                            : result === 'E'
                              ? 'bg-gold text-slate-950'
                              : result === 'D'
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </div>
                <AnimatedButton variant="ghost" icon={<ArrowRight size={18} />} onClick={() => setScreen('calendar')}>
                  Agenda
                </AnimatedButton>
              </div>
            </div>
            <div className="card-surface">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Alertas</p>
              <p className="mt-2 text-sm text-slate-300">
                {career.pressPressure > 65
                  ? 'A imprensa está aumentando a pressão antes da próxima coletiva.'
                  : career.finance.orcamento < 0
                    ? 'Caixa negativo pode travar contratações.'
                    : 'Ambiente controlado. O próximo jogo define o tom da semana.'}
              </p>
            </div>
          </div>
          <LeagueTable table={table} selectedClubId={career.clubId} />
        </section>
        <aside className="min-w-0 space-y-5">
          <div className="card-surface">
            <h2 className="font-display text-xl font-black text-white sm:text-2xl">Ações rápidas</h2>
            <div className="mt-4 grid gap-2">
              <QuickAction icon={<Users size={18} />} label="Ver elenco" onClick={() => setScreen('squad')} />
              <QuickAction icon={<CalendarDays size={18} />} label="Calendário" onClick={() => setScreen('calendar')} />
              <QuickAction icon={<Zap size={18} />} label="Treinar semana" onClick={() => setScreen('training')} />
              <QuickAction icon={<Newspaper size={18} />} label="Coletiva e notícias" onClick={() => setScreen('news')} />
            </div>
          </div>
          <div className="card-surface">
            <h2 className="mb-4 font-display text-xl font-black text-white sm:text-2xl">Notícias</h2>
            <NewsFeed news={career.news} limit={3} />
          </div>
        </aside>
      </div>
    </>
  );
};

const MiniClub = ({ club, label, right }: { club?: (typeof CLUBS)[number]; label: string; right?: boolean }) => (
  <div className={`min-w-0 ${right ? 'text-right' : ''}`}>
    <div className={`mb-2 flex ${right ? 'justify-end' : ''}`}>
      <ClubBadge club={club} size="md" />
    </div>
    <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-gold">{label}</p>
    <p className="break-words font-display text-base font-black leading-tight text-white sm:text-xl">{club?.nome}</p>
    <p className="break-words text-xs leading-tight text-slate-400">{club?.pais}</p>
  </div>
);

const Pulse = ({ label, value, tone }: { label: string; value: number; tone: 'green' | 'gold' | 'blue' | 'rose' }) => {
  const colors = {
    green: 'bg-turf',
    gold: 'bg-gold',
    blue: 'bg-sky-400',
    rose: 'bg-rose-500',
  };

  return (
    <div className="rounded-xl bg-white/[0.06] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-black text-white">{value}%</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

const QuickAction = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-12 items-center justify-between rounded-lg border border-white/10 bg-slate-950/55 px-3 text-left font-bold text-slate-200 transition hover:border-turf/40 hover:bg-turf/10 hover:text-white"
  >
    <span className="flex items-center gap-2">
      <span className="text-turf">{icon}</span>
      {label}
    </span>
    <ArrowRight size={16} className="text-slate-500" />
  </button>
);
