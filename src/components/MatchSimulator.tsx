import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bandage,
  Flag,
  Gauge,
  Pause,
  Play,
  Rabbit,
  RotateCcw,
  Shuffle,
  Shield,
  SlidersHorizontal,
  Swords,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { CLUBS } from '../data/clubs';
import { audioService } from '../services/audioService';
import { FORMATION_SLOTS, lineupPlayers, simulateMatch, styleModifiers } from '../services/matchEngine';
import type { Club, Difficulty, Match, MatchEvent, MatchStats, Player, SimulatedMatch, TacticalStyle, Tactic } from '../types';
import { Modal } from './Modal';
import { AnimatedButton } from './AnimatedButton';
import { ClubBadge } from './ClubBadge';

type Props = {
  match: Match;
  players: Player[];
  clubId: string;
  tactic: Tactic;
  difficulty: Difficulty;
  onFinish: (result: SimulatedMatch) => void;
  defaultSpeed: 1 | 2;
};

const TACTIC_STYLES: TacticalStyle[] = ['Equilibrado', 'Ofensivo', 'Defensivo', 'Contra-ataque', 'Posse de bola', 'Pressão alta'];

const emptyStats: MatchStats = {
  posseCasa: 50,
  finalizacoesCasa: 0,
  finalizacoesFora: 0,
  noGolCasa: 0,
  noGolFora: 0,
  faltasCasa: 0,
  faltasFora: 0,
  amarelosCasa: 0,
  amarelosFora: 0,
  vermelhosCasa: 0,
  vermelhosFora: 0,
  escanteiosCasa: 0,
  escanteiosFora: 0,
};

export const MatchSimulator = ({ match, players, clubId, tactic, difficulty, onFinish, defaultSpeed }: Props) => {
  const [plan, setPlan] = useState<SimulatedMatch | null>(null);
  const [liveTactic, setLiveTactic] = useState<Tactic>(tactic);
  const [liveModifiers, setLiveModifiers] = useState({ attackBoost: 0, defenseBoost: 0, tempoBoost: 0 });
  const [minute, setMinute] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(defaultSpeed);
  const [flashGoal, setFlashGoal] = useState(false);
  const [benchMessage, setBenchMessage] = useState<string | null>(null);
  const [subOpen, setSubOpen] = useState(false);
  const [outgoingSlotId, setOutgoingSlotId] = useState('');
  const [incomingPlayerId, setIncomingPlayerId] = useState('');
  const [tacticOpen, setTacticOpen] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const homeClub = CLUBS.find((club) => club.id === match.homeClubId);
  const awayClub = CLUBS.find((club) => club.id === match.awayClubId);
  const selectedPlayers = useMemo(
    () => lineupPlayers(liveTactic, players.filter((player) => player.clubeId === clubId)),
    [clubId, liveTactic, players],
  );
  const reserves = useMemo(
    () =>
      players
        .filter((player) => player.clubeId === clubId && player.status !== 'lesionado' && player.status !== 'suspenso')
        .filter((player) => !Object.values(liveTactic.lineup).includes(player.id))
        .sort((a, b) => b.overall - a.overall),
    [clubId, liveTactic.lineup, players],
  );
  const selectedSlots = useMemo(
    () =>
      FORMATION_SLOTS[liveTactic.formation]
        .map((slot) => {
          const player = players.find((item) => item.id === liveTactic.lineup[slot.id]);
          return player ? { slot, player } : null;
        })
        .filter(Boolean) as { slot: (typeof FORMATION_SLOTS)['4-3-3'][number]; player: Player }[],
    [liveTactic.formation, liveTactic.lineup, players],
  );
  const canPlay = selectedPlayers.length >= 11;
  const revealedEvents = plan?.events.filter((event) => event.minute <= minute) ?? [];
  const lastEvent = revealedEvents[revealedEvents.length - 1];
  const homeScore = revealedEvents.filter((event) => event.type === 'goal' && event.clubId === match.homeClubId).length;
  const awayScore = revealedEvents.filter((event) => event.type === 'goal' && event.clubId === match.awayClubId).length;
  const finished = Boolean(plan && minute >= 90);
  const displayStats = plan ? buildLiveStats(plan.stats, revealedEvents, minute, match) : emptyStats;
  const progress = Math.round((minute / 90) * 100);

  useEffect(() => {
    if (!finished || !plan || autoSubmitted) return;
    const timer = window.setTimeout(() => {
      setAutoSubmitted(true);
      onFinish(plan);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [autoSubmitted, finished, onFinish, plan]);

  useEffect(() => {
    if (!running || !plan) return;
    const interval = window.setInterval(() => {
      setMinute((current) => {
        const next = Math.min(90, current + 1);
        const minuteEvents = plan.events.filter((event) => event.minute === next);
        if (minuteEvents.some((event) => event.type === 'goal')) {
          setFlashGoal(true);
          window.setTimeout(() => setFlashGoal(false), 1400);
        }
        if (next >= 90) {
          setRunning(false);
          audioService.playEffect('whistle');
        }
        return next;
      });
    }, speed === 2 ? 105 : 210);

    return () => window.clearInterval(interval);
  }, [plan, running, speed]);

  useEffect(() => {
    if (!subOpen) return;
    setOutgoingSlotId((current) => (current && liveTactic.lineup[current] ? current : selectedSlots[0]?.slot.id ?? ''));
    setIncomingPlayerId((current) => (current && reserves.some((player) => player.id === current) ? current : reserves[0]?.id ?? ''));
  }, [liveTactic.lineup, reserves, selectedSlots, subOpen]);

  const start = () => {
    if (!canPlay) return;
    const nextPlan = simulateMatch(match, players, clubId, liveTactic, difficulty, liveModifiers);
    setPlan(nextPlan);
    setMinute(0);
    setRunning(true);
    setBenchMessage(null);
    audioService.playEffect('whistle');
  };

  const reset = () => {
    setPlan(null);
    setLiveTactic(tactic);
    setLiveModifiers({ attackBoost: 0, defenseBoost: 0, tempoBoost: 0 });
    setMinute(0);
    setRunning(false);
    setBenchMessage(null);
    setAutoSubmitted(false);
  };

  const applySubstitution = (selectedIncomingId = incomingPlayerId) => {
    const benchPlayer = players.find((player) => player.id === selectedIncomingId);
    const outgoingPlayer = players.find((player) => player.id === liveTactic.lineup[outgoingSlotId]);
    if (!benchPlayer || !outgoingPlayer || !outgoingSlotId || !plan) return;
    const slotId = outgoingSlotId;
    const outgoingId = liveTactic.lineup[slotId];
    const nextLineup = { ...liveTactic.lineup, [outgoingSlotId]: selectedIncomingId };
    setLiveTactic({ ...liveTactic, lineup: nextLineup });
    setLiveModifiers((current) => ({ ...current, attackBoost: current.attackBoost + 3, tempoBoost: current.tempoBoost + 2 }));
    setPlan({
      ...plan,
      events: [
        ...plan.events,
        {
          id: `sub-${minute}-${selectedIncomingId}`,
          minute,
          type: 'substitution',
          clubId,
          playerId: selectedIncomingId,
          title: 'Substituição',
          description: `${benchPlayer.nome} entra no lugar do jogador ${outgoingId ? '#' : ''} da posição ${slotId}.`,
        },
      ],
    });
    setBenchMessage(`${benchPlayer.nome} entrou com energia renovada.`);
    setSubOpen(false);
  };

  const applyLiveTactic = (style: TacticalStyle) => {
    const mod = styleModifiers[style];
    setLiveTactic({ ...liveTactic, style });
    setLiveModifiers({ attackBoost: mod.attack, defenseBoost: mod.defense, tempoBoost: mod.tempo });
    if (plan) {
      setPlan({
        ...plan,
        events: [
          ...plan.events,
          {
            id: `tactic-${minute}-${style}`,
            minute,
            type: 'tactic',
            clubId,
            title: 'Mudança tática',
            description: `Equipe reorganizada no estilo ${style}.`,
          },
        ],
      });
    }
    setBenchMessage(`Estilo alterado para ${style}.`);
    setTacticOpen(false);
  };

  return (
    <section className="space-y-5">
      <div className="match-arena relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl sm:p-5">
        <div className="stadium-strip absolute inset-0 opacity-70" />
        <div className="absolute inset-x-6 top-3 h-px bg-gradient-to-r from-transparent via-turf/70 to-transparent" />
        {flashGoal ? (
          <motion.div
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-emerald-400/15 backdrop-blur-sm"
          >
            <div className="rounded-2xl border border-gold/50 bg-slate-950/80 px-8 py-5 text-center shadow-gold">
              <div className="font-display text-6xl font-black text-gold drop-shadow-xl sm:text-7xl">GOOOL!</div>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] text-amber-100">o estádio explode</p>
            </div>
          </motion.div>
        ) : null}
        <div className="relative z-10 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
          <ScoreClub club={homeClub} align="left" label="Casa" className="min-w-0" compact />
          <div className="rounded-xl border border-white/10 bg-slate-950/78 px-2 py-2 text-center shadow-xl backdrop-blur sm:rounded-2xl sm:p-4">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-turf sm:text-[0.68rem]">min {minute}</p>
            <div className="mt-0.5 inline-grid grid-cols-[minmax(1.6rem,auto)_auto_minmax(1.6rem,auto)] items-baseline gap-1.5 whitespace-nowrap font-display text-3xl font-black leading-none text-white sm:mt-1 sm:gap-2 sm:text-5xl lg:text-6xl">
              <span className="text-right">{homeScore}</span>
              <span className="text-slate-500">x</span>
              <span>{awayScore}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800 sm:mt-4 sm:h-2">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-turf to-gold" animate={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1.5 hidden items-center justify-center gap-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-slate-400 sm:mt-3 sm:flex sm:gap-2 sm:text-xs">
              <Gauge size={14} className="text-gold" />
              {running ? 'ao vivo' : finished ? 'encerrado' : plan ? 'pausado' : 'pré-jogo'}
            </div>
          </div>
          <ScoreClub club={awayClub} align="right" label="Fora" className="min-w-0" compact />
        </div>
      </div>

      {!canPlay ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          Escalação incompleta. Preencha 11 posições em Tática antes de começar.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {!plan ? (
          <AnimatedButton className="col-span-2 sm:col-span-1" icon={<Play size={18} />} onClick={start} disabled={!canPlay}>
            Começar partida
          </AnimatedButton>
        ) : (
          <>
            <AnimatedButton
              variant="secondary"
              icon={running ? <Pause size={18} /> : <Play size={18} />}
              onClick={() => setRunning((value) => !value)}
              disabled={finished}
            >
              {running ? 'Pausar' : 'Continuar'}
            </AnimatedButton>
            <AnimatedButton variant={speed === 2 ? 'gold' : 'secondary'} icon={<Rabbit size={18} />} onClick={() => setSpeed(speed === 1 ? 2 : 1)}>
              {speed}x
            </AnimatedButton>
            <AnimatedButton variant="secondary" icon={<Shuffle size={18} />} onClick={() => setSubOpen(true)} disabled={!plan || finished || !reserves.length}>
              Substituir
            </AnimatedButton>
            <AnimatedButton variant="secondary" icon={<SlidersHorizontal size={18} />} onClick={() => setTacticOpen(true)} disabled={!plan || finished}>
              Tática
            </AnimatedButton>
            <AnimatedButton variant="ghost" icon={<RotateCcw size={18} />} onClick={reset} disabled={running}>
              Reiniciar
            </AnimatedButton>
            <AnimatedButton
              variant="gold"
              className={finished ? 'col-span-2 sm:col-span-1' : ''}
              icon={<Trophy size={18} />}
              onClick={() => plan && onFinish(plan)}
              disabled={!finished}
            >
              {finished ? 'Ver resumo' : 'Encerrar'}
            </AnimatedButton>
          </>
        )}
      </div>

      {benchMessage ? (
        <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 p-3 text-sm text-sky-100">{benchMessage}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.05] p-3 shadow-xl sm:p-4">
          <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <h3 className="font-display text-xl font-black text-white sm:text-2xl">Central da partida</h3>
            <span className="w-fit rounded-full border border-turf/30 bg-turf/10 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-turf sm:px-3 sm:text-xs">
              {liveTactic.formation} • {liveTactic.style}
            </span>
          </div>
          <LivePitch
            match={match}
            players={players}
            clubId={clubId}
            tactic={liveTactic}
            homeClub={homeClub}
            awayClub={awayClub}
            lastEvent={lastEvent}
            minute={minute}
          />
          <p className="mb-2 mt-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Comentários da partida</p>
          <div className="max-h-[9rem] space-y-2 overflow-y-auto overscroll-contain pr-1 sm:max-h-[14rem] lg:max-h-[18rem]">
            {revealedEvents.length ? (
              [...revealedEvents].reverse().map((event) => (
                <div
                  key={event.id}
                  className={`flex gap-2 rounded-lg border px-3 py-2 text-sm ${
                    event.type === 'goal'
                      ? 'border-gold/40 bg-gold/10 text-amber-50'
                      : event.type === 'woodwork'
                        ? 'border-amber-300/40 bg-amber-500/10 text-amber-50'
                      : 'border-white/10 bg-slate-950/50 text-slate-300'
                  }`}
                >
                  <MatchEventIcon type={event.type} />
                  <div className="min-w-0">
                    <p className="font-black text-white">
                      {event.minute}' • {event.title}
                    </p>
                    <p className="break-words leading-snug">{event.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-slate-950/50 p-4 text-sm text-slate-400">Aperte começar para iniciar a simulação.</p>
            )}
          </div>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.05] p-3 shadow-xl sm:p-4 lg:sticky lg:top-20 lg:self-start">
          <h3 className="font-display text-xl font-black text-white sm:text-2xl">Estatísticas ao vivo</h3>
          <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
            <Possession home={displayStats.posseCasa} />
            <StatLine label="Finalizações" home={displayStats.finalizacoesCasa} away={displayStats.finalizacoesFora} />
            <StatLine label="No gol" home={displayStats.noGolCasa} away={displayStats.noGolFora} />
            <StatLine label="Faltas" home={displayStats.faltasCasa} away={displayStats.faltasFora} />
            <StatLine label="Amarelos" home={displayStats.amarelosCasa} away={displayStats.amarelosFora} />
            <StatLine label="Vermelhos" home={displayStats.vermelhosCasa} away={displayStats.vermelhosFora} />
            <StatLine label="Escanteios" home={displayStats.escanteiosCasa} away={displayStats.escanteiosFora} />
          </div>
        </div>
      </div>

      <Modal open={subOpen} title="Substituição" onClose={() => setSubOpen(false)}>
        <div className="grid gap-3">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Sai</span>
            <select
              value={outgoingSlotId}
              onChange={(event) => setOutgoingSlotId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-turf"
            >
              {selectedSlots.map(({ slot, player }) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label} - {player.nome} ({player.overall})
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Entra</p>
          {reserves.slice(0, 8).map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => applySubstitution(player.id)}
              className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-left hover:border-turf/40"
            >
              <span className="font-bold text-white">{player.nome}</span>
              <span className="text-sm text-slate-400">
                {player.posicao} • {player.overall} OVR
              </span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={tacticOpen} title="Mudança tática" onClose={() => setTacticOpen(false)}>
        <div className="grid gap-2">
          {TACTIC_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => applyLiveTactic(style)}
              className={`rounded-lg border px-3 py-2 text-left font-bold ${
                liveTactic.style === style ? 'border-turf bg-turf text-slate-950' : 'border-white/10 bg-slate-950 text-slate-200'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </Modal>
    </section>
  );
};

const ScoreClub = ({
  club,
  align,
  label,
  className = '',
  compact = false,
}: {
  club?: Club;
  align: 'left' | 'right';
  label: string;
  className?: string;
  compact?: boolean;
}) => (
  <div
    className={`flex min-w-0 items-center gap-1.5 sm:gap-3 ${
      align === 'right' ? 'flex-row-reverse text-right' : 'text-left'
    } ${className}`}
  >
    <ClubBadge club={club} size={compact ? 'sm' : 'lg'} />
    <div className="min-w-0">
      <p className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-gold sm:text-[0.68rem]">{label}</p>
      <p className={`break-words font-display font-black leading-tight text-white ${compact ? 'text-[0.7rem] sm:text-base' : 'text-lg sm:text-2xl'}`}>
        {club?.nome}
      </p>
      {!compact ? <p className="hidden text-sm text-slate-400 sm:block">{club?.pais}</p> : null}
    </div>
  </div>
);

const LivePitch = ({
  match,
  players,
  clubId,
  tactic,
  homeClub,
  awayClub,
  lastEvent,
  minute,
}: {
  match: Match;
  players: Player[];
  clubId: string;
  tactic: Tactic;
  homeClub?: Club;
  awayClub?: Club;
  lastEvent?: MatchEvent;
  minute: number;
}) => {
  const userIsHome = match.homeClubId === clubId;
  const opponentClubId = userIsHome ? match.awayClubId : match.homeClubId;
  const userSquad = players.filter((player) => player.clubeId === clubId);
  const opponentSquad = players.filter((player) => player.clubeId === opponentClubId).sort((a, b) => b.overall - a.overall);
  const userColor = userIsHome ? homeClub?.cores.primaria : awayClub?.cores.primaria;
  const opponentColor = userIsHome ? awayClub?.cores.primaria : homeClub?.cores.primaria;
  const userDots = FORMATION_SLOTS[tactic.formation].map((slot, index) => {
    const player = userSquad.find((item) => item.id === tactic.lineup[slot.id]);
    return makeLiveDot(slot, userIsHome ? 'home' : 'away', player, index);
  });
  const opponentDots = FORMATION_SLOTS['4-3-3'].map((slot, index) =>
    makeLiveDot(slot, userIsHome ? 'away' : 'home', opponentSquad[index], index),
  );
  const ball = liveBallPosition(lastEvent, minute, match);

  return (
    <div className="mb-3 space-y-2 sm:mb-4">
      <div className="match-pitch-live relative mx-auto w-full max-w-md overflow-hidden rounded-xl border border-white/10 p-2 sm:max-w-none sm:p-3">
        <div className="relative aspect-[3/4] w-full max-h-[min(42vh,15.5rem)] min-h-[11rem] sm:aspect-[16/10] sm:max-h-[min(48vh,20rem)] sm:min-h-[14rem]">
          <div className="absolute inset-2 rounded-lg border border-white/25 sm:inset-3" />
          <div className="absolute inset-x-2 top-1/2 h-px bg-white/25 sm:inset-x-3" />
          <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 sm:h-24 sm:w-24" />
          <div className="absolute inset-x-[28%] top-2 h-[14%] rounded-b-2xl border border-t-0 border-white/25 sm:inset-x-[30%] sm:top-3 sm:h-[16%]" />
          <div className="absolute inset-x-[28%] bottom-2 h-[14%] rounded-t-2xl border border-b-0 border-white/25 sm:inset-x-[30%] sm:bottom-3 sm:h-[16%]" />
          {[...opponentDots, ...userDots].map((dot) => (
            <LivePlayerDot
              key={dot.id}
              dot={dot}
              color={dot.side === (userIsHome ? 'home' : 'away') ? userColor : opponentColor}
              minute={minute}
            />
          ))}
          <motion.div
            className="absolute z-20 grid h-4 w-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-slate-950 bg-white shadow-gold sm:h-5 sm:w-5"
            animate={{ left: `${ball.x}%`, top: `${ball.y}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          >
        <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
          </motion.div>
        </div>
      </div>
      <div className="rounded-lg border border-white/10 bg-slate-950/80 p-3 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Último lance</p>
        <p className="mt-1 break-words font-bold text-white">{lastEvent?.title ?? 'Aguardando apito inicial'}</p>
        <p className="mt-1 break-words text-sm leading-relaxed text-slate-300">
          {lastEvent?.description ?? 'O plano de jogo está definido. A torcida já empurra o time.'}
        </p>
      </div>
    </div>
  );
};

type LiveDot = {
  id: string;
  side: 'home' | 'away';
  x: number;
  y: number;
  label: string;
  name: string;
};

const makeLiveDot = (
  slot: (typeof FORMATION_SLOTS)['4-3-3'][number],
  side: 'home' | 'away',
  player: Player | undefined,
  index: number,
): LiveDot => ({
  id: `${side}-${slot.id}-${player?.id ?? index}`,
  side,
  x: slot.x,
  y: side === 'home' ? slot.y : 100 - slot.y,
  label: String(index + 1),
  name: player ? `${player.posicao} ${player.nome}` : slot.label,
});

const LivePlayerDot = ({ dot, color, minute }: { dot: LiveDot; color?: string; minute: number }) => {
  const driftX = Math.sin((minute + dot.x) / 7) * 1.2;
  const driftY = Math.cos((minute + dot.y) / 8) * 1.1;
  const background = color ?? (dot.side === 'home' ? '#23d38d' : '#38bdf8');

  return (
    <motion.div
      className="absolute z-20 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white/80 text-[0.62rem] font-black shadow-lg"
      title={dot.name}
      style={{ backgroundColor: background, color: readableText(background) }}
      animate={{ left: `${limit(dot.x + driftX, 6, 94)}%`, top: `${limit(dot.y + driftY, 6, 94)}%` }}
      transition={{ type: 'spring', stiffness: 70, damping: 20 }}
    >
      {dot.label}
    </motion.div>
  );
};

const liveBallPosition = (event: MatchEvent | undefined, minute: number, match: Match) => {
  if (!event?.clubId || event.type === 'kickoff' || event.type === 'fulltime' || event.type === 'tactic' || event.type === 'substitution') {
    return { x: 50, y: 50 };
  }

  const homeAction = event.clubId === match.homeClubId;
  const x = limit(50 + Math.sin((minute + event.id.length) / 4) * 32, 10, 90);
  if (event.type === 'goal') return { x: limit(50 + Math.cos(minute / 3) * 18, 20, 80), y: homeAction ? 7 : 93 };
  if (event.type === 'woodwork') return { x: limit(50 + Math.cos(minute / 2) * 26, 22, 78), y: homeAction ? 8 : 92 };
  if (event.type === 'shot' || event.type === 'save') return { x, y: homeAction ? 18 : 82 };
  if (event.type === 'pressure') return { x, y: homeAction ? 34 : 66 };
  if (event.type === 'yellow' || event.type === 'red' || event.type === 'injury') return { x, y: homeAction ? 58 : 42 };
  return { x, y: homeAction ? 38 : 62 };
};

const limit = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const readableText = (hexColor: string) => {
  const normalized = hexColor.replace('#', '');
  if (normalized.length !== 6) return '#ffffff';
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return (red * 299 + green * 587 + blue * 114) / 1000 > 150 ? '#0f172a' : '#ffffff';
};

const Possession = ({ home }: { home: number }) => (
  <div>
    <div className="mb-2 flex justify-between text-sm font-bold text-slate-300">
      <span>Posse</span>
      <span>
        {Math.round(home)}% • {Math.round(100 - home)}%
      </span>
    </div>
    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
      <div className="h-full rounded-full bg-gradient-to-r from-turf to-gold" style={{ width: `${home}%` }} />
    </div>
  </div>
);

const StatLine = ({ label, home, away }: { label: string; home: number; away: number }) => (
  <div className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 rounded-lg bg-slate-950/45 px-3 py-2 text-sm">
    <span className="text-right font-black text-white">{home}</span>
    <div className="text-center text-slate-400">{label}</div>
    <span className="font-black text-white">{away}</span>
  </div>
);

const MatchEventIcon = ({ type }: { type: MatchEvent['type'] }) => {
  const iconClass = 'mt-0.5 shrink-0';
  const size = 16;
  switch (type) {
    case 'goal':
      return <Trophy size={size} className={`${iconClass} text-gold`} />;
    case 'shot':
      return <Target size={size} className={`${iconClass} text-sky-300`} />;
    case 'save':
      return <Shield size={size} className={`${iconClass} text-sky-300`} />;
    case 'woodwork':
      return <AlertTriangle size={size} className={`${iconClass} text-amber-300`} />;
    case 'yellow':
    case 'red':
      return <Flag size={size} className={`${iconClass} ${type === 'red' ? 'text-rose-400' : 'text-yellow-300'}`} />;
    case 'injury':
      return <Bandage size={size} className={`${iconClass} text-rose-300`} />;
    case 'substitution':
      return <Users size={size} className={`${iconClass} text-turf`} />;
    case 'pressure':
      return <Swords size={size} className={`${iconClass} text-slate-300`} />;
    case 'tactic':
      return <SlidersHorizontal size={size} className={`${iconClass} text-turf`} />;
    default:
      return <Flag size={size} className={`${iconClass} text-slate-400`} />;
  }
};

const buildLiveStats = (stats: MatchStats, events: MatchEvent[], minute: number, match: Match): MatchStats => {
  if (minute >= 90) return stats;
  const progress = Math.max(0.08, minute / 90);
  const bySide = (side: 'home' | 'away', types: MatchEvent['type'][]) =>
    events.filter((event) => event.clubId === (side === 'home' ? match.homeClubId : match.awayClubId) && types.includes(event.type)).length;
  const scale = (value: number) => Math.round(value * progress);

  return {
    posseCasa: clampPercent(stats.posseCasa + Math.sin(minute / 7) * 2),
    finalizacoesCasa: Math.max(scale(stats.finalizacoesCasa), bySide('home', ['shot', 'save', 'goal', 'woodwork'])),
    finalizacoesFora: Math.max(scale(stats.finalizacoesFora), bySide('away', ['shot', 'save', 'goal', 'woodwork'])),
    noGolCasa: Math.max(scale(stats.noGolCasa), bySide('home', ['save', 'goal'])),
    noGolFora: Math.max(scale(stats.noGolFora), bySide('away', ['save', 'goal'])),
    faltasCasa: Math.max(scale(stats.faltasCasa), bySide('home', ['yellow', 'red'])),
    faltasFora: Math.max(scale(stats.faltasFora), bySide('away', ['yellow', 'red'])),
    amarelosCasa: Math.max(scale(stats.amarelosCasa), bySide('home', ['yellow'])),
    amarelosFora: Math.max(scale(stats.amarelosFora), bySide('away', ['yellow'])),
    vermelhosCasa: Math.max(scale(stats.vermelhosCasa), bySide('home', ['red'])),
    vermelhosFora: Math.max(scale(stats.vermelhosFora), bySide('away', ['red'])),
    escanteiosCasa: scale(stats.escanteiosCasa),
    escanteiosFora: scale(stats.escanteiosFora),
  };
};

const clampPercent = (value: number) => Math.min(75, Math.max(25, Math.round(value)));
