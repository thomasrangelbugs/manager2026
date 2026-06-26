import { CLUBS } from '../data/clubs';
import type {
  Club,
  Difficulty,
  Formation,
  FormationSlot,
  Match,
  MatchEvent,
  MatchStats,
  Player,
  SimulatedMatch,
  TacticalStyle,
  Tactic,
} from '../types';
import { difficultyAttackBoost } from './difficultyService';
import {
  legendLineupAura,
  legendMatchOverallBonus,
  legendPostMatchFatigue,
  legendPostMatchMorale,
  legendPickScore,
} from './legendService';
import { clamp, uid } from '../utils/random';

export const FORMATION_SLOTS: Record<Formation, FormationSlot[]> = {
  '4-4-2': [
    { id: 'GOL', label: 'GOL', posicao: 'GOL', x: 50, y: 91 },
    { id: 'LD', label: 'LD', posicao: 'LD', x: 82, y: 73 },
    { id: 'ZAG1', label: 'ZAG', posicao: 'ZAG', x: 61, y: 75 },
    { id: 'ZAG2', label: 'ZAG', posicao: 'ZAG', x: 39, y: 75 },
    { id: 'LE', label: 'LE', posicao: 'LE', x: 18, y: 73 },
    { id: 'MD', label: 'PD', posicao: 'PD', x: 80, y: 48 },
    { id: 'MC1', label: 'MC', posicao: 'MC', x: 60, y: 51 },
    { id: 'MC2', label: 'MC', posicao: 'MC', x: 40, y: 51 },
    { id: 'ME', label: 'PE', posicao: 'PE', x: 20, y: 48 },
    { id: 'ATA1', label: 'ATA', posicao: 'ATA', x: 58, y: 22 },
    { id: 'ATA2', label: 'ATA', posicao: 'ATA', x: 42, y: 22 },
  ],
  '4-3-3': [
    { id: 'GOL', label: 'GOL', posicao: 'GOL', x: 50, y: 91 },
    { id: 'LD', label: 'LD', posicao: 'LD', x: 82, y: 73 },
    { id: 'ZAG1', label: 'ZAG', posicao: 'ZAG', x: 61, y: 75 },
    { id: 'ZAG2', label: 'ZAG', posicao: 'ZAG', x: 39, y: 75 },
    { id: 'LE', label: 'LE', posicao: 'LE', x: 18, y: 73 },
    { id: 'VOL', label: 'VOL', posicao: 'VOL', x: 50, y: 58 },
    { id: 'MC1', label: 'MC', posicao: 'MC', x: 65, y: 46 },
    { id: 'MC2', label: 'MC', posicao: 'MC', x: 35, y: 46 },
    { id: 'PD', label: 'PD', posicao: 'PD', x: 80, y: 23 },
    { id: 'ATA', label: 'ATA', posicao: 'ATA', x: 50, y: 18 },
    { id: 'PE', label: 'PE', posicao: 'PE', x: 20, y: 23 },
  ],
  '3-5-2': [
    { id: 'GOL', label: 'GOL', posicao: 'GOL', x: 50, y: 91 },
    { id: 'ZAG1', label: 'ZAG', posicao: 'ZAG', x: 66, y: 75 },
    { id: 'ZAG2', label: 'ZAG', posicao: 'ZAG', x: 50, y: 77 },
    { id: 'ZAG3', label: 'ZAG', posicao: 'ZAG', x: 34, y: 75 },
    { id: 'ALA-D', label: 'LD', posicao: 'LD', x: 84, y: 50 },
    { id: 'VOL', label: 'VOL', posicao: 'VOL', x: 50, y: 58 },
    { id: 'MC1', label: 'MC', posicao: 'MC', x: 65, y: 43 },
    { id: 'MC2', label: 'MC', posicao: 'MC', x: 35, y: 43 },
    { id: 'ALA-E', label: 'LE', posicao: 'LE', x: 16, y: 50 },
    { id: 'ATA1', label: 'ATA', posicao: 'ATA', x: 58, y: 20 },
    { id: 'ATA2', label: 'ATA', posicao: 'ATA', x: 42, y: 20 },
  ],
  '4-2-3-1': [
    { id: 'GOL', label: 'GOL', posicao: 'GOL', x: 50, y: 91 },
    { id: 'LD', label: 'LD', posicao: 'LD', x: 82, y: 73 },
    { id: 'ZAG1', label: 'ZAG', posicao: 'ZAG', x: 61, y: 75 },
    { id: 'ZAG2', label: 'ZAG', posicao: 'ZAG', x: 39, y: 75 },
    { id: 'LE', label: 'LE', posicao: 'LE', x: 18, y: 73 },
    { id: 'VOL1', label: 'VOL', posicao: 'VOL', x: 60, y: 58 },
    { id: 'VOL2', label: 'VOL', posicao: 'VOL', x: 40, y: 58 },
    { id: 'PD', label: 'PD', posicao: 'PD', x: 78, y: 35 },
    { id: 'MEI', label: 'MEI', posicao: 'MEI', x: 50, y: 34 },
    { id: 'PE', label: 'PE', posicao: 'PE', x: 22, y: 35 },
    { id: 'ATA', label: 'ATA', posicao: 'ATA', x: 50, y: 17 },
  ],
  '5-3-2': [
    { id: 'GOL', label: 'GOL', posicao: 'GOL', x: 50, y: 91 },
    { id: 'LD', label: 'LD', posicao: 'LD', x: 86, y: 70 },
    { id: 'ZAG1', label: 'ZAG', posicao: 'ZAG', x: 66, y: 75 },
    { id: 'ZAG2', label: 'ZAG', posicao: 'ZAG', x: 50, y: 77 },
    { id: 'ZAG3', label: 'ZAG', posicao: 'ZAG', x: 34, y: 75 },
    { id: 'LE', label: 'LE', posicao: 'LE', x: 14, y: 70 },
    { id: 'VOL', label: 'VOL', posicao: 'VOL', x: 50, y: 56 },
    { id: 'MC1', label: 'MC', posicao: 'MC', x: 65, y: 42 },
    { id: 'MC2', label: 'MC', posicao: 'MC', x: 35, y: 42 },
    { id: 'ATA1', label: 'ATA', posicao: 'ATA', x: 58, y: 20 },
    { id: 'ATA2', label: 'ATA', posicao: 'ATA', x: 42, y: 20 },
  ],
};

export const styleModifiers: Record<TacticalStyle, { attack: number; defense: number; tempo: number; fatigue: number }> = {
  Equilibrado: { attack: 0, defense: 0, tempo: 0, fatigue: 0 },
  Ofensivo: { attack: 8, defense: -5, tempo: 5, fatigue: 2 },
  Defensivo: { attack: -7, defense: 9, tempo: -4, fatigue: -1 },
  'Contra-ataque': { attack: 4, defense: 3, tempo: -1, fatigue: 0 },
  'Posse de bola': { attack: 2, defense: 3, tempo: 2, fatigue: 1 },
  'Pressão alta': { attack: 6, defense: -1, tempo: 8, fatigue: 5 },
};

export const evaluatePositionFit = (slot: FormationSlot, player: Player) => {
  if (slot.posicao === player.posicao) {
    return { priority: 5, modifier: 0, label: 'Função primária' };
  }

  if (slot.posicao === 'GOL' || player.posicao === 'GOL') {
    return { priority: -1, modifier: -36, label: 'Fora da função' };
  }

  if ((slot.posicao === 'LD' && player.posicao === 'LE') || (slot.posicao === 'LE' && player.posicao === 'LD')) {
    return { priority: 4, modifier: -5, label: 'Lado invertido' };
  }

  if (['VOL', 'MC', 'MEI'].includes(slot.posicao) && ['VOL', 'MC', 'MEI'].includes(player.posicao)) {
    return { priority: 4, modifier: slot.posicao === 'MEI' || player.posicao === 'MEI' ? -7 : -4, label: 'Adaptado no meio' };
  }

  if ((slot.posicao === 'PD' && player.posicao === 'PE') || (slot.posicao === 'PE' && player.posicao === 'PD')) {
    return { priority: 4, modifier: -5, label: 'Ponta invertido' };
  }

  if (['PE', 'PD'].includes(slot.posicao) && ['ATA', 'MEI'].includes(player.posicao)) {
    return { priority: 3, modifier: -9, label: 'Adaptado no ataque' };
  }

  if (slot.posicao === 'ATA' && ['PE', 'PD', 'MEI'].includes(player.posicao)) {
    return { priority: 3, modifier: -8, label: 'Adaptado no ataque' };
  }

  if (['LD', 'LE'].includes(slot.posicao) && ['ZAG', 'VOL'].includes(player.posicao)) {
    return { priority: 2, modifier: -12, label: 'Improvisado na lateral' };
  }

  if (slot.posicao === 'ZAG' && ['LD', 'LE', 'VOL'].includes(player.posicao)) {
    return { priority: 2, modifier: -10, label: 'Improvisado na zaga' };
  }

  if (['LD', 'LE', 'ZAG', 'VOL'].includes(slot.posicao) && ['PE', 'PD', 'ATA', 'MEI'].includes(player.posicao)) {
    return { priority: 0, modifier: -24, label: 'Fora da função' };
  }

  return { priority: 1, modifier: -16, label: 'Improvisado' };
};

export const adjustedPlayerOverall = (slot: FormationSlot, player: Player) =>
  clamp(
    player.overall + evaluatePositionFit(slot, player).modifier + legendMatchOverallBonus(player),
    30,
    99,
  );

export const createDefaultTactic = (squad: Player[], formation: Formation = '4-3-3'): Tactic => {
  const available = [...squad].sort((a, b) => b.overall - a.overall);
  const lineup: Record<string, string | null> = {};
  const used = new Set<string>();

  FORMATION_SLOTS[formation].forEach((slot) => {
    const candidate = available
      .filter((player) => !used.has(player.id) && player.status !== 'lesionado' && player.status !== 'suspenso')
      .sort((a, b) => {
        const fitA = evaluatePositionFit(slot, a);
        const fitB = evaluatePositionFit(slot, b);
        const scoreA =
          fitA.priority * 1000 +
          adjustedPlayerOverall(slot, a) +
          a.energia * 0.03 +
          a.moral * 0.02 +
          (a.isLegend ? 8 : 0);
        const scoreB =
          fitB.priority * 1000 +
          adjustedPlayerOverall(slot, b) +
          b.energia * 0.03 +
          b.moral * 0.02 +
          (b.isLegend ? 8 : 0);
        return scoreB - scoreA;
      })[0];

    lineup[slot.id] = candidate?.id ?? null;
    if (candidate) used.add(candidate.id);
  });

  const leaders = Object.values(lineup)
    .map((playerId) => squad.find((player) => player.id === playerId))
    .filter(Boolean) as Player[];
  const captain = [...leaders].sort((a, b) => b.atributos.lideranca - a.atributos.lideranca)[0] ?? null;
  const setPiece = [...leaders].sort((a, b) => b.atributos.tecnica + b.atributos.passe - (a.atributos.tecnica + a.atributos.passe))[0] ?? null;
  const penalty = [...leaders].sort((a, b) => b.atributos.finalizacao - a.atributos.finalizacao)[0] ?? null;

  return {
    formation,
    style: 'Equilibrado',
    lineup,
    captainId: captain?.id ?? null,
    freeKickTakerId: setPiece?.id ?? null,
    penaltyTakerId: penalty?.id ?? null,
  };
};

export const lineupPlayers = (tactic: Tactic, players: Player[]) =>
  Object.values(tactic.lineup)
    .map((playerId) => players.find((player) => player.id === playerId))
    .filter(Boolean) as Player[];

export const calculateLineupStrength = (tactic: Tactic, players: Player[]) => {
  const entries = FORMATION_SLOTS[tactic.formation]
    .map((slot) => {
      const player = players.find((item) => item.id === tactic.lineup[slot.id]);
      return player ? { slot, player, adjustedOverall: adjustedPlayerOverall(slot, player) } : null;
    })
    .filter(Boolean) as { slot: FormationSlot; player: Player; adjustedOverall: number }[];

  if (entries.length === 0) return { overall: 0, attack: 0, defense: 0, energy: 0, morale: 0 };

  const style = styleModifiers[tactic.style];
  const attackPositions = ['ATA', 'PE', 'PD', 'MEI'];
  const defensePositions = ['GOL', 'ZAG', 'LD', 'LE', 'VOL'];
  const average = (items: number[]) => items.reduce((sum, item) => sum + item, 0) / Math.max(items.length, 1);
  const energy = average(entries.map(({ player }) => player.energia));
  const morale = average(entries.map(({ player }) => player.moral));
  const modifier = (energy - 70) * 0.08 + (morale - 65) * 0.07;
  const attackRatings = entries.filter(({ slot }) => attackPositions.includes(slot.posicao)).map(({ adjustedOverall }) => adjustedOverall);
  const defenseRatings = entries.filter(({ slot }) => defensePositions.includes(slot.posicao)).map(({ adjustedOverall }) => adjustedOverall);
  const aura = legendLineupAura(entries.map(({ player }) => player));

  return {
    overall: average(entries.map(({ adjustedOverall }) => adjustedOverall)) + modifier,
    attack:
      average(attackRatings.length ? attackRatings : entries.map(({ adjustedOverall }) => adjustedOverall)) +
      modifier +
      style.attack +
      aura.attack,
    defense:
      average(defenseRatings.length ? defenseRatings : entries.map(({ adjustedOverall }) => adjustedOverall)) +
      modifier +
      style.defense +
      aura.defense,
    energy,
    morale,
  };
};

const clubSquadStrength = (clubId: string, players: Player[]) => {
  const squad = players
    .filter((player) => player.clubeId === clubId)
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 11);
  const average = squad.reduce((sum, player) => sum + player.overall + (player.moral - 60) * 0.05, 0) / 11;
  return Number.isFinite(average) ? average : CLUBS.find((club) => club.id === clubId)?.forcaElenco ?? 66;
};

const pickPlayer = (clubId: string, players: Player[], preferred: string[]) => {
  const squad = players.filter((player) => player.clubeId === clubId);
  const pool = squad.filter((player) => preferred.includes(player.posicao));
  const candidates = pool.length ? pool : squad;
  const ranked = [...candidates].sort((a, b) => legendPickScore(b) - legendPickScore(a));
  const top = ranked.slice(0, Math.max(1, Math.min(4, ranked.length)));
  const weights = top.map((player) => legendPickScore(player));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  let chosen = top[0];
  for (let i = 0; i < top.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      chosen = top[i];
      break;
    }
  }
  return chosen;
};

const makeEvent = (
  minute: number,
  type: MatchEvent['type'],
  clubId: string,
  title: string,
  description: string,
  playerId?: string,
): MatchEvent => ({
  id: uid('event'),
  minute,
  type,
  clubId,
  playerId,
  title,
  description,
});

export const simulateCpuScore = (homeClubId: string, awayClubId: string, players: Player[]) => {
  const home = clubSquadStrength(homeClubId, players) + 3;
  const away = clubSquadStrength(awayClubId, players);
  const diff = clamp((home - away) / 16, -1.5, 1.5);
  const homeGoals = Math.max(0, Math.round(Math.random() * 2 + Math.random() * 1.5 + diff));
  const awayGoals = Math.max(0, Math.round(Math.random() * 2 + Math.random() * 1.3 - diff * 0.8));
  return { homeGoals, awayGoals };
};

export type LiveMatchModifiers = {
  attackBoost?: number;
  defenseBoost?: number;
  tempoBoost?: number;
};

export const simulateMatch = (
  match: Match,
  players: Player[],
  userClubId: string,
  tactic: Tactic,
  difficulty: Difficulty = 'Normal',
  liveModifiers: LiveMatchModifiers = {},
): SimulatedMatch => {
  const homeClub = CLUBS.find((club) => club.id === match.homeClubId) as Club;
  const awayClub = CLUBS.find((club) => club.id === match.awayClubId) as Club;
  const userIsHome = match.homeClubId === userClubId;
  const userStrength = calculateLineupStrength(tactic, players.filter((player) => player.clubeId === userClubId));
  const opponentId = userIsHome ? match.awayClubId : match.homeClubId;
  const opponentStrength = clubSquadStrength(opponentId, players);
  const userHomeBoost = userIsHome ? 4 : -1;
  const opponentHomeBoost = userIsHome ? 0 : 4;
  const diffBoost = difficultyAttackBoost(difficulty);
  const userAttack =
    (userStrength.attack + userHomeBoost + (liveModifiers.attackBoost ?? 0)) * diffBoost;
  const userDefense = userStrength.defense + userHomeBoost * 0.5 + (liveModifiers.defenseBoost ?? 0);
  const opponentAttack = opponentStrength + opponentHomeBoost + Math.random() * 4 - 2;
  const opponentDefense = opponentStrength + opponentHomeBoost * 0.5 + Math.random() * 4 - 2;
  const style = styleModifiers[tactic.style];
  const tempoLive = liveModifiers.tempoBoost ?? 0;
  const events: MatchEvent[] = [
    makeEvent(0, 'kickoff', match.homeClubId, 'Apito inicial', `${homeClub.nome} x ${awayClub.nome} começou.`),
  ];
  const stats: MatchStats = {
    posseCasa: clamp(
      50 +
        (userIsHome ? userStrength.overall - opponentStrength : opponentStrength - userStrength.overall) * 0.75 +
        (userIsHome ? style.tempo + tempoLive : 0),
      34,
      66,
    ),
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
  let homeGoals = 0;
  let awayGoals = 0;

  const recordShot = (side: 'home' | 'away', onTarget: boolean) => {
    if (side === 'home') {
      stats.finalizacoesCasa += 1;
      if (onTarget) stats.noGolCasa += 1;
    } else {
      stats.finalizacoesFora += 1;
      if (onTarget) stats.noGolFora += 1;
    }
  };

  for (let minute = 1; minute <= 90; minute += 1) {
    const fatiguePenalty = minute > 72 && userStrength.energy < 64 ? (72 - userStrength.energy) * 0.025 : 0;
    const homeControl = match.homeClubId === userClubId ? userAttack - opponentDefense : opponentAttack - userDefense;
    const awayControl = match.awayClubId === userClubId ? userAttack - opponentDefense : opponentAttack - userDefense;
    const eventChance = clamp(0.055 + Math.abs(homeControl - awayControl) / 650 + (style.tempo + tempoLive) / 900, 0.04, 0.14);
    if (Math.random() > eventChance) continue;

    const homeBias = clamp(0.5 + (homeControl - awayControl) / 90, 0.25, 0.75);
    const side: 'home' | 'away' = Math.random() < homeBias ? 'home' : 'away';
    const clubId = side === 'home' ? match.homeClubId : match.awayClubId;
    const sideIsUser = clubId === userClubId;
    const attack = sideIsUser ? userAttack - fatiguePenalty * 9 : opponentAttack;
    const defense = sideIsUser ? opponentDefense : userDefense - fatiguePenalty * 8;
    const player = pickPlayer(clubId, players, ['ATA', 'PE', 'PD', 'MEI', 'MC']);
    const defender = pickPlayer(clubId, players, ['ZAG', 'VOL', 'GOL']);
    const danger = clamp(36 + (attack - defense) * 1.3 + Math.random() * 35, 8, 82);
    const isGoal = Math.random() * 100 < danger * 0.13;
    const onTarget = isGoal || Math.random() * 100 < danger * 0.52;
    const hitWoodwork = !isGoal && Math.random() * 100 < danger * 0.08;

    if (isGoal) {
      recordShot(side, true);
      if (side === 'home') homeGoals += 1;
      if (side === 'away') awayGoals += 1;
      events.push(
        makeEvent(
          minute,
          'goal',
          clubId,
          'GOOOL!',
          `${player?.nome ?? 'Um atacante'} aparece no momento certo e muda o placar.`,
          player?.id,
        ),
      );
      continue;
    }

    if (hitWoodwork) {
      recordShot(side, false);
      events.push(
        makeEvent(
          minute,
          'woodwork',
          clubId,
          'Na trave!',
          `${player?.nome ?? 'O atacante'} solta a bomba e carimba a trave.`,
          player?.id,
        ),
      );
      continue;
    }

    recordShot(side, onTarget);
    if (onTarget) {
      events.push(
        makeEvent(
          minute,
          'save',
          clubId,
          'Defesa importante',
          `${player?.nome ?? 'O ataque'} finaliza forte, mas o goleiro evita o gol.`,
          player?.id,
        ),
      );
    } else if (Math.random() < 0.25) {
      if (side === 'home') stats.escanteiosCasa += 1;
      if (side === 'away') stats.escanteiosFora += 1;
      events.push(
        makeEvent(
          minute,
          'pressure',
          clubId,
          'Pressão no campo de ataque',
          `${clubId === homeClub.id ? homeClub.nome : awayClub.nome} empurra o rival para trás.`,
        ),
      );
    } else {
      events.push(
        makeEvent(
          minute,
          'shot',
          clubId,
          'Chute perigoso',
          `${player?.nome ?? 'O atacante'} arrisca e a bola passa perto.`,
          player?.id,
        ),
      );
    }

    if (Math.random() < 0.09) {
      if (side === 'home') {
        stats.faltasCasa += 1;
        stats.amarelosCasa += Math.random() < 0.35 ? 1 : 0;
      } else {
        stats.faltasFora += 1;
        stats.amarelosFora += Math.random() < 0.35 ? 1 : 0;
      }
      events.push(
        makeEvent(
          minute,
          'yellow',
          clubId,
          'Cartão amarelo',
          `${defender?.nome ?? 'Um defensor'} chega atrasado e é advertido.`,
          defender?.id,
        ),
      );
    }

    if (Math.random() < 0.012) {
      events.push(
        makeEvent(
          minute,
          'injury',
          clubId,
          'Preocupação médica',
          `${player?.nome ?? 'Um jogador'} sente dores e pede atendimento.`,
          player?.id,
        ),
      );
    }
  }

  events.push(
    makeEvent(
      90,
      'fulltime',
      match.homeClubId,
      'Apito final',
      `Fim de jogo: ${homeClub.nome} ${homeGoals} x ${awayGoals} ${awayClub.nome}.`,
    ),
  );

  const selected = lineupPlayers(tactic, players.filter((player) => player.clubeId === userClubId));
  const userWon = (userIsHome && homeGoals > awayGoals) || (!userIsHome && awayGoals > homeGoals);
  const userLost = (userIsHome && homeGoals < awayGoals) || (!userIsHome && awayGoals < homeGoals);
  const playerImpacts = selected.reduce<SimulatedMatch['playerImpacts']>((acc, player) => {
    const fatigue = tacticalFatigue(tactic.style) * -1 - (player.energia < 55 ? 1 : 0);
    const moraleBase = userWon ? 5 : userLost ? -5 : 1;
    acc[player.id] = {
      energia: legendPostMatchFatigue(player, fatigue),
      moral: legendPostMatchMorale(player, moraleBase),
      minutos: 90,
    };
    return acc;
  }, {});

  return {
    matchId: match.id,
    homeClubId: match.homeClubId,
    awayClubId: match.awayClubId,
    homeGoals,
    awayGoals,
    stats,
    events,
    playerImpacts,
  };
};

const tacticalFatigue = (style: TacticalStyle) => {
  if (style === 'Pressão alta') return 18;
  if (style === 'Ofensivo') return 14;
  if (style === 'Defensivo') return 9;
  return 11;
};
