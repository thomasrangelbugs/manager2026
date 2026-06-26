import { create } from 'zustand';
import { CLUBS } from '../data/clubs';
import { LEAGUES } from '../data/leagues';
import { MANAGER_NATIONALITIES } from '../data/countries';
import { INITIAL_PLAYERS, createFreeAgentPool, createYouthName } from '../data/players';
import { POSITION_ORDER } from '../data/names';
import { audioService } from '../services/audioService';
import { createInitialFinance, applyMatchFinance, refreshFinance } from '../services/financeService';
import { createDefaultTactic, FORMATION_SLOTS, simulateMatch } from '../services/matchEngine';
import { createBoardObjective, evaluateObjective } from '../services/boardService';
import { appendCupMatches } from '../services/cupService';
import { applyDisciplineAfterMatch, tickDisciplineRound, warnExpiringContracts } from '../services/disciplineService';
import { difficultyBoardStart, difficultyBudgetFactor } from '../services/difficultyService';
import { clearCareer, exportCareerJson, importCareerJson, loadCareer, loadSettings, saveCareer, saveSettings } from '../services/saveService';
import {
  buildInitialTable,
  canPlayNextMatch,
  canTrainToday,
  currentLeagueClubs,
  endSeason,
  generateSchedule,
  getCurrentScheduleContext,
  getNextCalendarDate,
  getNextMatch,
  getPostMatchCalendarDate,
  isLeagueMatch,
  repairCareerSchedule,
  simulateOtherRoundResults,
  sortTable,
  updateTableWithResult,
} from '../services/seasonService';
import { canBuyPlayer, canSellPlayer, negotiateTransfer, sellValue, squadWageTotal } from '../services/transferService';
import { runTrainingDay, type TrainingFocus, type TrainingIntensity } from '../services/trainingService';
import type {
  Achievement,
  Career,
  Continent,
  Difficulty,
  Formation,
  GameSettings,
  Match,
  News,
  Player,
  Screen,
  PostMatchSummary,
  SimulatedMatch,
  TacticalStyle,
  Toast,
} from '../types';
import { clamp, randomInt, uid } from '../utils/random';

type CareerInput = {
  managerName: string;
  nationality: string;
  difficulty: Difficulty;
  continent: Continent;
  clubId: string;
};

type Store = {
  career: Career | null;
  settings: GameSettings;
  screen: Screen;
  toasts: Toast[];
  lastTrainingReport: string[];
  bootstrapped: boolean;
  postMatchSummary: PostMatchSummary | null;
  setScreen: (screen: Screen) => void;
  registerInteraction: () => Promise<void>;
  createCareer: (input: CareerInput) => void;
  continueCareer: () => void;
  deleteCareer: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setFormation: (formation: Formation) => void;
  setTacticalStyle: (style: TacticalStyle) => void;
  assignPlayerToSlot: (slotId: string, playerId: string | null) => void;
  autoFillLineup: () => void;
  setSpecialRole: (role: 'captainId' | 'freeKickTakerId' | 'penaltyTakerId', playerId: string) => void;
  finishMatch: (result: SimulatedMatch, options?: { returnToDashboard?: boolean }) => void;
  leavePostMatch: () => void;
  dismissAchievement: () => void;
  exportSave: () => void;
  importSave: (file: File) => Promise<void>;
  simulateRound: () => void;
  buyPlayer: (playerId: string) => void;
  loanPlayer: (playerId: string) => void;
  sellPlayer: (playerId: string) => void;
  trainWeek: (focus: TrainingFocus, intensity: TrainingIntensity) => void;
  trainUntilMatch: (focus: TrainingFocus, intensity: TrainingIntensity) => void;
  autoTrainUntilMatch: () => void;
  restUntilMatch: () => void;
  advanceDay: () => void;
  generateYouth: () => void;
  promoteYouth: (playerId: string) => void;
  answerPress: (tone: 'calm' | 'bold' | 'protect') => void;
  advanceSeason: () => void;
  assumeClub: (clubId: string) => void;
};

const initialSettings = loadSettings();
audioService.setSettings(initialSettings);

const rawLoadedCareer = loadCareer();

const persistCareer = (career: Career | null) => {
  saveCareer(career);
  return career;
};

const makeNews = (title: string, body: string, tone: News['tone'] = 'neutral'): News => ({
  id: uid('news'),
  title,
  body,
  date: new Date().toISOString(),
  tone,
});

const addAchievement = (career: Career, achievement: Omit<Achievement, 'id' | 'unlockedAt'>) => {
  if (career.achievements.some((item) => item.title === achievement.title)) return career.achievements;
  return [
    {
      id: uid('achievement'),
      unlockedAt: new Date().toISOString(),
      ...achievement,
    },
    ...career.achievements,
  ];
};

const clonePlayers = () => [...INITIAL_PLAYERS, ...createFreeAgentPool()].map((player) => ({ ...player, atributos: { ...player.atributos } }));

const syncPlayerCatalog = (players: Player[]) => {
  const catalog = clonePlayers();
  const catalogById = new Map(catalog.map((player) => [player.id, player]));
  const updatedPlayers = players.map((player) => {
    const source = catalogById.get(player.id);
    if (!source) return player;
    return {
      ...player,
      isLegend: player.isLegend || source.isLegend,
      portraitUrl: source.portraitUrl ?? player.portraitUrl,
    };
  });
  const existingIds = new Set(updatedPlayers.map((player) => player.id));
  const missingPlayers = catalog.filter((player) => !existingIds.has(player.id));
  return [...updatedPlayers, ...missingPlayers];
};

const loadedCareer = rawLoadedCareer
  ? persistCareer(
      repairCareerSchedule({ ...rawLoadedCareer, players: syncPlayerCatalog(rawLoadedCareer.players) }),
    )
  : null;

const getClub = (clubId: string) => CLUBS.find((club) => club.id === clubId);

const commit = (set: (state: Partial<Store>) => void, career: Career, toast?: Omit<Toast, 'id'>) => {
  const saved = persistCareer({ ...career, finance: refreshFinance(career) });
  set({ career: saved });
  if (toast) {
    const id = uid('toast');
    setTimeout(() => useGameStore.getState().removeToast(id), 4200);
    set({ toasts: [{ id, ...toast }, ...useGameStore.getState().toasts].slice(0, 4) });
  }
};

const getUserSquad = (career: Career) =>
  career.players.filter((player) => player.clubeId === career.clubId).sort((a, b) => b.overall - a.overall);

const cleanLineupAfterPlayerLeaves = (career: Career, playerId: string) => ({
  ...career.tactic,
  lineup: Object.fromEntries(
    Object.entries(career.tactic.lineup).map(([slotId, selectedId]) => [slotId, selectedId === playerId ? null : selectedId]),
  ),
  captainId: career.tactic.captainId === playerId ? null : career.tactic.captainId,
  freeKickTakerId: career.tactic.freeKickTakerId === playerId ? null : career.tactic.freeKickTakerId,
  penaltyTakerId: career.tactic.penaltyTakerId === playerId ? null : career.tactic.penaltyTakerId,
});

const createYouthPlayer = (clubId: string): Player => {
  const posicao = POSITION_ORDER[randomInt(0, POSITION_ORDER.length - 1)];
  const overall = randomInt(48, 66);
  const potencial = clamp(overall + randomInt(8, 24), 62, 94);
  const attribute = (bonus = 0) => clamp(overall + bonus + randomInt(-7, 7), 35, 88);

  return {
    id: uid('youth'),
    nome: createYouthName(),
    idade: randomInt(15, 18),
    nacionalidade: MANAGER_NATIONALITIES[randomInt(0, MANAGER_NATIONALITIES.length - 1)],
    posicao,
    overall,
    potencial,
    valorDeMercado: Math.round(overall ** 2.8 * 45),
    salario: Math.round(overall ** 1.9 * 25),
    energia: 100,
    moral: 68,
    contratoAnos: 3,
    clubeId: null,
    status: 'jovem promessa',
    minutosJogos: 0,
    atributos: {
      finalizacao: attribute(['ATA', 'PE', 'PD'].includes(posicao) ? 8 : -4),
      passe: attribute(['MC', 'MEI', 'VOL'].includes(posicao) ? 6 : 0),
      marcacao: attribute(['ZAG', 'LD', 'LE', 'VOL'].includes(posicao) ? 8 : -5),
      velocidade: attribute(['LD', 'LE', 'PE', 'PD', 'ATA'].includes(posicao) ? 8 : 0),
      fisico: attribute(['ZAG', 'VOL', 'ATA'].includes(posicao) ? 4 : 0),
      tecnica: attribute(['MEI', 'PE', 'PD', 'MC'].includes(posicao) ? 7 : 0),
      goleiro: posicao === 'GOL' ? attribute(12) : randomInt(22, 38),
      lideranca: attribute(randomInt(-4, 8)),
    },
  };
};

const autoTrainingFocuses: TrainingFocus[] = ['Ataque', 'Defesa', 'Velocidade', 'Jovens'];

const getSquadAverageEnergy = (career: Career) => {
  const squad = career.players.filter((player) => player.clubeId === career.clubId);
  return Math.round(squad.reduce((sum, player) => sum + player.energia, 0) / Math.max(1, squad.length));
};

const runCalendarToMatch = (
  career: Career,
  mode: 'fixed-training' | 'auto-training' | 'rest',
  focus?: TrainingFocus,
  intensity?: TrainingIntensity,
) => {
  let current = career;
  let days = 0;
  let trainingDays = 0;
  let restDays = 0;
  const reports: string[] = [];
  const focusCount: Partial<Record<TrainingFocus, number>> = {};

  while (days < 45) {
    const context = getCurrentScheduleContext(current);
    if (!context.nextMatch || context.isMatchDay) break;

    const nextDate = getNextCalendarDate(current);
    if (nextDate === current.currentDate) break;

    if (mode === 'rest') {
      restDays += 1;
      current = {
        ...current,
        currentDate: nextDate,
        players: current.players.map((player) =>
          player.clubeId === current.clubId && player.status !== 'lesionado'
            ? { ...player, energia: clamp(player.energia + 6, 0, 100), moral: clamp(player.moral + 1, 0, 100) }
            : player,
        ),
      };
    } else {
      const averageEnergy = getSquadAverageEnergy(current);
      const selectedFocus =
        mode === 'auto-training'
          ? context.daysUntilMatch <= 1
            ? 'Defesa'
            : autoTrainingFocuses[days % autoTrainingFocuses.length]
          : focus ?? 'Ataque';
      const selectedIntensity =
        mode === 'auto-training'
          ? context.daysUntilMatch <= 1 || averageEnergy < 70
            ? 'Leve'
            : 'Normal'
          : intensity ?? 'Normal';
      const result = runTrainingDay(current.players, current.clubId, selectedFocus, selectedIntensity);

      trainingDays += 1;
      focusCount[selectedFocus] = (focusCount[selectedFocus] ?? 0) + 1;
      reports.push(...result.reports.map((report) => `${selectedFocus}: ${report}`));
      current = {
        ...current,
        currentDate: nextDate,
        players: result.players,
        fanMorale: clamp(current.fanMorale + (selectedIntensity === 'Pesado' ? -1 : 1), 0, 100),
      };
    }

    days += 1;
  }

  const focusSummary = Object.entries(focusCount)
    .map(([name, count]) => `${name} ${count}x`)
    .join(', ');

  return { career: current, days, trainingDays, restDays, reports, focusSummary };
};

const compactTrainingReports = (headline: string, reports: string[]) => {
  const highlights = reports.slice(0, 5);
  const remaining = reports.length - highlights.length;
  return [headline, ...highlights, ...(remaining > 0 ? [`Mais ${remaining} destaque(s) no periodo.`] : [])];
};

export const useGameStore = create<Store>((set, get) => ({
  career: loadedCareer,
  settings: initialSettings,
  screen: 'splash',
  toasts: [],
  lastTrainingReport: [],
  bootstrapped: Boolean(loadedCareer),
  postMatchSummary: null,

  setScreen: (screen) => {
    const current = get();
    if (current.screen === 'postMatch' && screen !== 'postMatch') {
      set({ screen, postMatchSummary: null });
      return;
    }
    set({ screen });
  },

  registerInteraction: async () => {
    await audioService.unlock();
    audioService.setSettings(get().settings);
    await audioService.playMenu();
  },

  addToast: (toast) => {
    const id = uid('toast');
    set({ toasts: [{ id, ...toast }, ...get().toasts].slice(0, 4) });
    setTimeout(() => get().removeToast(id), 4200);
  },

  removeToast: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),

  createCareer: (input) => {
    const club = getClub(input.clubId);
    if (!club) return;
    const leagueClubs = currentLeagueClubs(input.clubId);
    const players = clonePlayers();
    const squad = players.filter((player) => player.clubeId === input.clubId);
    const tactic = createDefaultTactic(squad, '4-3-3');
    const season = new Date().getFullYear();

    const career: Career = {
      id: uid('career'),
      calendarVersion: 2,
      manager: {
        nome: input.managerName.trim() || 'Manager Thor',
        nacionalidade: input.nationality,
        dificuldade: input.difficulty,
      },
      clubId: input.clubId,
      continent: input.continent,
      season,
      currentDate: `${season}-01-28`,
      players,
      academy: [],
      finance: (() => {
        const base = createInitialFinance(club, players);
        return { ...base, orcamento: Math.round(base.orcamento * difficultyBudgetFactor(input.difficulty)) };
      })(),
      tactic,
      schedule: appendCupMatches(generateSchedule(input.clubId, season), input.clubId, season),
      currentMatchIndex: 0,
      leagueTable: buildInitialTable(leagueClubs),
      boardObjective: createBoardObjective(club),
      discipline: {},
      pendingAchievement: null,
      news: [
        makeNews(
          `${club.nome} anuncia novo técnico`,
          `${input.managerName || 'O novo comandante'} assume com a missão de cumprir a expectativa: ${club.expectativa}.`,
          'positive',
        ),
        makeNews('Mercado aquecido', 'Empresários oferecem oportunidades antes da primeira rodada.', 'neutral'),
        makeNews('Torcida espera identidade', 'A arquibancada quer um time competitivo desde o início.', 'neutral'),
      ],
      matchHistory: [],
      boardConfidence: difficultyBoardStart(input.difficulty),
      fanMorale: 65,
      pressPressure: 40,
      achievements: [],
      hallOfFame: [],
      isFired: false,
    };

    persistCareer(career);
    set({ career, screen: 'dashboard', bootstrapped: true });
    get().addToast({ type: 'success', message: 'Carreira criada e salva automaticamente.' });
  },

  continueCareer: () => {
    const raw = loadCareer();
    if (!raw) {
      get().addToast({ type: 'error', message: 'Nenhuma carreira salva encontrada.' });
      return;
    }
    const career = persistCareer(repairCareerSchedule({ ...raw, players: syncPlayerCatalog(raw.players) }));
    set({ career, screen: 'dashboard', bootstrapped: true, postMatchSummary: null });
  },

  deleteCareer: () => {
    clearCareer();
    set({ career: null, screen: 'splash', bootstrapped: false, lastTrainingReport: [] });
    get().addToast({ type: 'warning', message: 'Carreira apagada.' });
  },

  updateSettings: (settings) => {
    const next = { ...get().settings, ...settings };
    saveSettings(next);
    audioService.setSettings(next);
    document.documentElement.dataset.theme = next.theme;
    set({ settings: next });
  },

  setFormation: (formation) => {
    const career = get().career;
    if (!career) return;
    const squad = getUserSquad(career);
    const tactic = createDefaultTactic(squad, formation);
    const next = { ...career, tactic: { ...tactic, style: career.tactic.style } };
    commit(set, next, { type: 'success', message: `Formação alterada para ${formation}.` });
  },

  setTacticalStyle: (style) => {
    const career = get().career;
    if (!career) return;
    commit(set, { ...career, tactic: { ...career.tactic, style } }, { type: 'info', message: `Estilo definido: ${style}.` });
  },

  assignPlayerToSlot: (slotId, playerId) => {
    const career = get().career;
    if (!career) return;
    if (playerId) {
      const player = career.players.find((item) => item.id === playerId);
      if (player && (player.status === 'lesionado' || player.status === 'suspenso')) {
        get().addToast({
          type: 'warning',
          message: player.status === 'lesionado' ? 'Jogador lesionado não pode entrar em campo.' : 'Jogador suspenso não pode entrar em campo.',
        });
        return;
      }
    }
    const lineup = Object.fromEntries(
      Object.entries(career.tactic.lineup).map(([slot, selected]) => [slot, selected === playerId ? null : selected]),
    ) as Record<string, string | null>;
    lineup[slotId] = playerId;
    commit(set, { ...career, tactic: { ...career.tactic, lineup } });
  },

  autoFillLineup: () => {
    const career = get().career;
    if (!career) return;
    const tactic = createDefaultTactic(getUserSquad(career), career.tactic.formation);
    commit(set, { ...career, tactic: { ...tactic, style: career.tactic.style } }, { type: 'success', message: 'Escalação preenchida automaticamente.' });
  },

  setSpecialRole: (role, playerId) => {
    const career = get().career;
    if (!career) return;
    commit(set, { ...career, tactic: { ...career.tactic, [role]: playerId } });
  },

  finishMatch: (result, options) => {
    const career = get().career;
    if (!career) return;

    try {
    const matchIndex = career.schedule.findIndex((match) => match.id === result.matchId);
    if (matchIndex < 0) {
      get().addToast({ type: 'error', message: 'Partida não encontrada no calendário.' });
      return;
    }

    const updatedSchedule = career.schedule.map((match) =>
      match.id === result.matchId
        ? {
            ...match,
            played: true,
            homeGoals: result.homeGoals,
            awayGoals: result.awayGoals,
            events: result.events,
          }
        : match,
    );
    const match = updatedSchedule[matchIndex];
    const userIsHome = result.homeClubId === career.clubId;
    const userGoals = userIsHome ? result.homeGoals : result.awayGoals;
    const rivalGoals = userIsHome ? result.awayGoals : result.homeGoals;
    const won = userGoals > rivalGoals;
    const draw = userGoals === rivalGoals;
    const club = getClub(career.clubId);
    const rival = getClub(userIsHome ? result.awayClubId : result.homeClubId);
    const leagueGame = isLeagueMatch(career.clubId, match.competitionId);
    let table = career.leagueTable;
    let otherRound: { table: Career['leagueTable']; history: Match[] } = {
      table: career.leagueTable,
      history: [],
    };

    if (leagueGame) {
      table = updateTableWithResult(table, result.homeClubId, result.awayClubId, result.homeGoals, result.awayGoals);
      otherRound = simulateOtherRoundResults({ ...career, leagueTable: table }, result, match);
      table = otherRound.table;
    }

    let impactedPlayers = career.players.map((player) => {
      const impact = result.playerImpacts[player.id];
      if (!impact) return player;
      return {
        ...player,
        energia: clamp(player.energia + impact.energia, 8, 100),
        moral: clamp(player.moral + impact.moral, 5, 100),
        minutosJogos: player.minutosJogos + impact.minutos,
      };
    });

    const financeBefore = career.finance.orcamento;
    const finance = applyMatchFinance(career.finance, club?.reputacao ?? 65, userIsHome, won);
    const financeDelta = finance.orcamento - financeBefore;
    const confidenceDelta = won ? 7 : draw ? 1 : -8;
    const fanDelta = won ? 8 : draw ? 1 : -7;
    const boardConfidence = clamp(career.boardConfidence + confidenceDelta, 0, 100);
    const fanMorale = clamp(career.fanMorale + fanDelta, 0, 100);
    const isFired = boardConfidence <= 0;
    const disciplineResult = applyDisciplineAfterMatch(impactedPlayers, career.clubId, result.events, career.discipline);
    const afterDiscipline = tickDisciplineRound(disciplineResult.players, disciplineResult.discipline);
    const nextIndex = updatedSchedule.findIndex((item) => !item.played);
    const headline = won
      ? 'Torcida comemora vitória'
      : draw
        ? 'Empate deixa sensação dividida'
        : 'Técnico pressionado após derrota';
    const body = `${club?.nome ?? 'Seu time'} ${userGoals} x ${rivalGoals} ${rival?.nome ?? 'adversário'}. ${
      won ? 'A moral do elenco subiu.' : draw ? 'A diretoria pede evolução.' : 'A cobrança interna aumentou.'
    }`;
    let newAchievement: Achievement | null = null;
    let achievements = career.achievements;
    if (won && career.matchHistory.length === 0) {
      achievements = addAchievement(career, { title: 'Primeira vitória', description: 'Venceu a primeira partida oficial da carreira.' });
      newAchievement = achievements[0] ?? null;
    } else if (userGoals >= 4) {
      achievements = addAchievement(career, { title: 'Show ofensivo', description: 'Marcou quatro ou mais gols em uma partida.' });
      newAchievement = achievements[0] ?? null;
    }

    const mvpPlayerId =
      Object.entries(result.playerImpacts)
        .sort(([, a], [, b]) => b.minutos - a.minutos)[0]?.[0] ??
      career.tactic.lineup.GOL ??
      null;
    const position = sortTable(table).findIndex((entry) => entry.clubId === career.clubId) + 1;
    const boardEval = evaluateObjective(position, career.boardObjective);

    const nextMatch = nextIndex >= 0 ? updatedSchedule[nextIndex] : null;
    const nextCareer = persistCareer({
      ...career,
      calendarVersion: 2,
      players: afterDiscipline.players,
      discipline: afterDiscipline.discipline,
      finance,
      schedule: updatedSchedule,
      currentMatchIndex: nextIndex < 0 ? updatedSchedule.length : nextIndex,
      currentDate: getPostMatchCalendarDate(match.date, nextMatch),
      leagueTable: table,
      matchHistory: [match, ...otherRound.history, ...career.matchHistory],
      boardConfidence,
      fanMorale,
      pressPressure: clamp(career.pressPressure + (won ? -4 : 8), 0, 100),
      isFired,
      achievements,
      pendingAchievement: newAchievement,
      news: [makeNews(headline, body, won ? 'positive' : draw ? 'neutral' : 'warning'), ...career.news].slice(0, 28),
    });

    const summary: PostMatchSummary = {
      matchId: result.matchId,
      homeClubId: result.homeClubId,
      awayClubId: result.awayClubId,
      homeGoals: result.homeGoals,
      awayGoals: result.awayGoals,
      userGoals,
      rivalGoals,
      won,
      draw,
      confidenceDelta,
      fanDelta,
      financeDelta,
      mvpPlayerId,
      boardMessage: boardEval.message,
    };

    audioService.stopCrowd();

    if (options?.returnToDashboard) {
      set({ career: nextCareer, postMatchSummary: null, screen: 'dashboard' });
      const resultLabel = won ? 'Vitória' : draw ? 'Empate' : 'Derrota';
      get().addToast({
        type: won ? 'success' : draw ? 'info' : 'warning',
        message: `Rodada simulada — ${resultLabel}: ${userGoals} x ${rivalGoals}.${
          nextMatch ? ` Proxima etapa: treino antes da rodada ${nextMatch.round}.` : ' Temporada encerrada.'
        }`,
      });
    } else {
      set({ career: nextCareer, postMatchSummary: summary, screen: 'postMatch' });
    }

    if (isFired) {
      get().addToast({ type: 'error', message: 'A diretoria perdeu a confiança. Seu cargo está em risco.' });
    }
    } catch {
      get().addToast({ type: 'error', message: 'Erro ao salvar o resultado. Tente novamente.' });
      set({ screen: 'dashboard', postMatchSummary: null });
    }
  },

  leavePostMatch: () => {
    const career = get().career;
    if (!career) {
      set({ screen: 'dashboard', postMatchSummary: null });
      return;
    }

    if (career.pendingAchievement) {
      get().addToast({
        type: 'success',
        message: `Conquista: ${career.pendingAchievement.title}`,
      });
    }

    const cleared = career.pendingAchievement ? { ...career, pendingAchievement: null } : career;
    if (cleared !== career) {
      persistCareer(cleared);
    }

    const next = getNextMatch(cleared);
    set({
      career: cleared,
      screen: career.isFired ? 'board' : 'dashboard',
      postMatchSummary: null,
    });

    if (next) {
      const context = getCurrentScheduleContext(cleared);
      get().addToast({
        type: 'info',
        message: context.isMatchDay
          ? `Dia de jogo: rodada ${next.round}.`
          : `Treino ${context.trainingDay}/${context.maxTrainingDays} antes da rodada ${next.round}.`,
      });
    } else {
      get().addToast({ type: 'warning', message: 'Temporada concluída. Encerre a temporada no painel.' });
    }
  },

  dismissAchievement: () => {
    const career = get().career;
    if (!career?.pendingAchievement) return;
    commit(set, { ...career, pendingAchievement: null });
  },

  exportSave: () => {
    const career = get().career;
    if (!career) {
      get().addToast({ type: 'error', message: 'Nenhuma carreira para exportar.' });
      return;
    }
    exportCareerJson(career);
    get().addToast({ type: 'success', message: 'Save exportado.' });
  },

  importSave: async (file) => {
    try {
      const career = repairCareerSchedule(await importCareerJson(file));
      persistCareer(career);
      set({ career, bootstrapped: true, screen: 'dashboard', postMatchSummary: null });
      get().addToast({ type: 'success', message: 'Carreira importada com sucesso.' });
    } catch {
      get().addToast({ type: 'error', message: 'Não foi possível importar o arquivo.' });
    }
  },

  simulateRound: () => {
    const career = get().career;
    if (!career) return;
    const next = getNextMatch(career);
    if (!next) {
      get().addToast({ type: 'warning', message: 'Não há rodada para simular.' });
      return;
    }
    if (!canPlayNextMatch(career)) {
      const context = getCurrentScheduleContext(career);
      get().addToast({
        type: 'info',
        message: `Ainda e dia de treino. Faltam ${context.daysUntilMatch} dia(s) para a rodada ${next.round}.`,
      });
      set({ screen: 'training' });
      return;
    }
    const emptySlots = Object.values(career.tactic.lineup).filter((id) => !id).length;
    const tactic =
      emptySlots > 0
        ? { ...createDefaultTactic(getUserSquad(career), career.tactic.formation), style: career.tactic.style }
        : career.tactic;
    const activeCareer = emptySlots > 0 ? { ...career, tactic } : career;
    if (emptySlots > 0) {
      commit(set, activeCareer, { type: 'info', message: 'Escalação preenchida automaticamente para a simulação.' });
    }

    const result = simulateMatch(
      next,
      get().career?.players ?? activeCareer.players,
      activeCareer.clubId,
      get().career?.tactic ?? tactic,
      activeCareer.manager.dificuldade,
    );

    get().finishMatch(result, { returnToDashboard: true });
  },

  buyPlayer: (playerId) => {
    const career = get().career;
    if (!career) return;
    const player = career.players.find((item) => item.id === playerId);
    const club = getClub(career.clubId);
    if (!player || !club) return;
    const currentWages = squadWageTotal(career.players, career.clubId);
    const approval = canBuyPlayer(career.finance, player, club.folhaSalarialLimite, currentWages);
    if (!approval.ok) {
      get().addToast({ type: 'error', message: approval.message });
      return;
    }
    const negotiation = negotiateTransfer(player, career.manager.dificuldade);
    if (!negotiation.success) {
      get().addToast({ type: 'warning', message: negotiation.message });
      return;
    }
    if (career.finance.orcamento < negotiation.price) {
      get().addToast({ type: 'error', message: 'O preço final passou do orçamento disponível.' });
      return;
    }

    const nextCareer = {
      ...career,
      finance: { ...career.finance, orcamento: career.finance.orcamento - negotiation.price },
      players: career.players.map((item) =>
        item.id === playerId
          ? { ...item, clubeId: career.clubId, moral: clamp(item.moral + 8, 0, 100), status: 'reserva' as const }
          : item,
      ),
      achievements: addAchievement(career, { title: 'Primeiro reforço', description: 'Fechou a primeira contratação da carreira.' }),
      news: [
        makeNews('Novo reforço chega ao clube', `${player.nome} assinou contrato por negociação de ${Math.round(negotiation.price / 100000) / 10} mi.`, 'positive'),
        ...career.news,
      ].slice(0, 28),
    };

    audioService.playEffect('transfer');
    commit(set, nextCareer, { type: 'success', message: negotiation.message });
  },

  loanPlayer: (playerId) => {
    const career = get().career;
    if (!career) return;
    const player = career.players.find((item) => item.id === playerId);
    if (!player) return;
    const fee = Math.round(player.valorDeMercado * 0.08);
    if (career.finance.orcamento < fee) {
      get().addToast({ type: 'error', message: 'Sem orçamento para taxa de empréstimo.' });
      return;
    }

    const nextCareer = {
      ...career,
      finance: { ...career.finance, orcamento: career.finance.orcamento - fee },
      players: career.players.map((item) =>
        item.id === playerId
          ? { ...item, clubeId: career.clubId, salario: Math.round(item.salario * 0.55), status: 'reserva' as const }
          : item,
      ),
      news: [makeNews('Empréstimo fechado', `${player.nome} chega por empréstimo até o fim da temporada.`, 'positive'), ...career.news].slice(0, 28),
    };

    audioService.playEffect('transfer');
    commit(set, nextCareer, { type: 'success', message: 'Empréstimo concluído.' });
  },

  sellPlayer: (playerId) => {
    const career = get().career;
    if (!career) return;
    const player = career.players.find((item) => item.id === playerId);
    if (!player || player.clubeId !== career.clubId) return;
    const approval = canSellPlayer(getUserSquad(career), player);
    if (!approval.ok) {
      get().addToast({ type: 'error', message: approval.message });
      return;
    }
    const value = sellValue(player);
    const nextCareer = {
      ...career,
      tactic: cleanLineupAfterPlayerLeaves(career, playerId),
      finance: { ...career.finance, orcamento: career.finance.orcamento + value },
      players: career.players.map((item) => (item.id === playerId ? { ...item, clubeId: null, status: 'reserva' as const } : item)),
      news: [makeNews('Venda confirmada', `${player.nome} deixa o clube e alivia o orçamento.`, 'neutral'), ...career.news].slice(0, 28),
    };
    commit(set, nextCareer, { type: 'success', message: `${player.nome} vendido.` });
  },

  trainWeek: (focus, intensity) => {
    const career = get().career;
    if (!career) return;
    const context = getCurrentScheduleContext(career);
    if (!canTrainToday(career)) {
      get().addToast({
        type: context.nextMatch ? 'warning' : 'info',
        message: context.nextMatch ? 'Hoje e dia de jogo. Va para a partida.' : 'Nao ha treino: temporada concluida.',
      });
      return;
    }
    const result = runTrainingDay(career.players, career.clubId, focus, intensity);
    const nextDate = getNextCalendarDate(career);
    const reachedMatchDay = context.nextMatch ? nextDate === context.nextMatch.date : false;
    const nextCareer = {
      ...career,
      currentDate: nextDate,
      players: result.players,
      fanMorale: clamp(career.fanMorale + (intensity === 'Pesado' ? -1 : 1), 0, 100),
      news: [makeNews('Treino do dia concluido', result.reports[0], result.reports.length > 1 ? 'positive' : 'neutral'), ...career.news].slice(0, 28),
    };
    set({ lastTrainingReport: result.reports });
    commit(set, nextCareer, {
      type: 'success',
      message: reachedMatchDay ? 'Treino aplicado. Agora e dia de jogo.' : `Treino aplicado. Calendario avancou para ${nextDate}.`,
    });
  },

  trainUntilMatch: (focus, intensity) => {
    const career = get().career;
    if (!career) return;
    const context = getCurrentScheduleContext(career);
    if (!canTrainToday(career)) {
      get().addToast({
        type: context.nextMatch ? 'warning' : 'info',
        message: context.nextMatch ? 'Hoje e dia de jogo. Va para a partida.' : 'Nao ha treino: temporada concluida.',
      });
      return;
    }

    const result = runCalendarToMatch(career, 'fixed-training', focus, intensity);
    const round = context.nextMatch?.round ?? 0;
    const headline = `Treino constante: ${result.trainingDays} dia(s) ate a rodada ${round}.`;
    const body = result.focusSummary
      ? `Plano aplicado ate o jogo: ${result.focusSummary}.`
      : result.reports[0] ?? 'Sequencia de treino concluida.';
    const nextCareer = {
      ...result.career,
      news: [makeNews('Treino ate o jogo', body, result.reports.length > 1 ? 'positive' : 'neutral'), ...result.career.news].slice(0, 28),
    };

    set({ lastTrainingReport: compactTrainingReports(headline, result.reports) });
    commit(set, nextCareer, {
      type: 'success',
      message: `Treino aplicado por ${result.trainingDays} dia(s). Agora e dia de jogo.`,
    });
  },

  autoTrainUntilMatch: () => {
    const career = get().career;
    if (!career) return;
    const context = getCurrentScheduleContext(career);
    if (!canTrainToday(career)) {
      get().addToast({
        type: context.nextMatch ? 'warning' : 'info',
        message: context.nextMatch ? 'Hoje e dia de jogo. Va para a partida.' : 'Nao ha treino: temporada concluida.',
      });
      return;
    }

    const result = runCalendarToMatch(career, 'auto-training');
    const round = context.nextMatch?.round ?? 0;
    const headline = `Treino automatico: ${result.trainingDays} dia(s) ate a rodada ${round}.`;
    const body = result.focusSummary
      ? `Comissao aplicou: ${result.focusSummary}.`
      : 'Comissao preparou o elenco ate o jogo.';
    const nextCareer = {
      ...result.career,
      news: [makeNews('Treino automatico concluido', body, result.reports.length > 1 ? 'positive' : 'neutral'), ...result.career.news].slice(0, 28),
    };

    set({ lastTrainingReport: compactTrainingReports(headline, result.reports) });
    commit(set, nextCareer, {
      type: 'success',
      message: `Treino automatico aplicado por ${result.trainingDays} dia(s). Agora e dia de jogo.`,
    });
  },

  restUntilMatch: () => {
    const career = get().career;
    if (!career) return;
    const context = getCurrentScheduleContext(career);
    if (!context.nextMatch) {
      get().addToast({ type: 'warning', message: 'Temporada concluida. Encerre a temporada no painel.' });
      return;
    }
    if (context.isMatchDay) {
      get().addToast({ type: 'info', message: 'Hoje e dia de jogo. Entre na partida pelo painel.' });
      return;
    }

    const result = runCalendarToMatch(career, 'rest');
    const averageEnergy = getSquadAverageEnergy(result.career);
    const nextCareer = {
      ...result.career,
      news: [
        makeNews('Descanso ate o jogo', `Elenco descansou ${result.restDays} dia(s) antes da rodada ${context.nextMatch.round}.`, 'neutral'),
        ...result.career.news,
      ].slice(0, 28),
    };

    set({
      lastTrainingReport: [
        `Descanso ate o jogo: ${result.restDays} dia(s).`,
        `Energia media atual: ${averageEnergy}%.`,
      ],
    });
    commit(set, nextCareer, {
      type: 'info',
      message: `Calendario avancou ${result.restDays} dia(s). Agora e dia de jogo.`,
    });
  },

  advanceDay: () => {
    const career = get().career;
    if (!career) return;
    const context = getCurrentScheduleContext(career);
    if (!context.nextMatch) {
      get().addToast({ type: 'warning', message: 'Temporada concluida. Encerre a temporada no painel.' });
      return;
    }
    if (context.isMatchDay) {
      get().addToast({ type: 'info', message: 'Hoje e dia de jogo. Entre na partida pelo painel.' });
      return;
    }
    const nextDate = getNextCalendarDate(career);
    const players = career.players.map((player) =>
      player.clubeId === career.clubId && player.status !== 'lesionado'
        ? { ...player, energia: clamp(player.energia + 6, 0, 100), moral: clamp(player.moral + 1, 0, 100) }
        : player,
    );
    const reachedMatchDay = nextDate === context.nextMatch.date;
    const nextCareer = {
      ...career,
      currentDate: nextDate,
      players,
      news: [makeNews('Dia de recuperacao', `Elenco descansou antes da rodada ${context.nextMatch.round}.`, 'neutral'), ...career.news].slice(0, 28),
    };
    commit(set, nextCareer, {
      type: 'info',
      message: reachedMatchDay ? 'Descanso concluido. Agora e dia de jogo.' : `Calendario avancou para ${nextDate}.`,
    });
  },

  generateYouth: () => {
    const career = get().career;
    if (!career) return;
    const cost = 240000;
    if (career.finance.orcamento < cost) {
      get().addToast({ type: 'error', message: 'A base precisa de investimento, mas o caixa está curto.' });
      return;
    }
    if (career.academy.length >= 8) {
      get().addToast({ type: 'warning', message: 'Academia cheia. Promova ou dispense jovens antes.' });
      return;
    }
    const youth = createYouthPlayer(career.clubId);
    const nextCareer = {
      ...career,
      finance: { ...career.finance, orcamento: career.finance.orcamento - cost },
      academy: [youth, ...career.academy],
      news: [makeNews('Olheiro encontra promessa', `${youth.nome}, ${youth.posicao}, entrou na academia.`, 'positive'), ...career.news].slice(0, 28),
    };
    commit(set, nextCareer, { type: 'success', message: `${youth.nome} chegou à base.` });
  },

  promoteYouth: (playerId) => {
    const career = get().career;
    if (!career) return;
    const youth = career.academy.find((player) => player.id === playerId);
    if (!youth) return;
    const promoted = { ...youth, clubeId: career.clubId, status: 'jovem promessa' as const, salario: Math.max(youth.salario, 14000) };
    const nextCareer = {
      ...career,
      academy: career.academy.filter((player) => player.id !== playerId),
      players: [promoted, ...career.players],
      news: [makeNews('Jovem promovido', `${youth.nome} subiu ao elenco principal.`, 'positive'), ...career.news].slice(0, 28),
    };
    commit(set, nextCareer, { type: 'success', message: `${youth.nome} promovido.` });
  },

  answerPress: (tone) => {
    const career = get().career;
    if (!career) return;
    const variants = {
      calm: {
        title: 'Coletiva equilibrada',
        body: 'O técnico reduz a pressão e pede trabalho diário.',
        fan: 1,
        board: 2,
        press: -8,
      },
      bold: {
        title: 'Técnico promete time agressivo',
        body: 'A declaração anima a torcida, mas aumenta a cobrança.',
        fan: 5,
        board: -1,
        press: 6,
      },
      protect: {
        title: 'Elenco protegido publicamente',
        body: 'Os jogadores reagem bem ao apoio do treinador.',
        fan: 0,
        board: 0,
        press: -2,
      },
    }[tone];
    const nextCareer = {
      ...career,
      fanMorale: clamp(career.fanMorale + variants.fan, 0, 100),
      boardConfidence: clamp(career.boardConfidence + variants.board, 0, 100),
      pressPressure: clamp(career.pressPressure + variants.press, 0, 100),
      players: career.players.map((player) =>
        player.clubeId === career.clubId && tone === 'protect' ? { ...player, moral: clamp(player.moral + 2, 0, 100) } : player,
      ),
      news: [makeNews(variants.title, variants.body, tone === 'bold' ? 'positive' : 'neutral'), ...career.news].slice(0, 28),
    };
    commit(set, nextCareer, { type: 'info', message: 'Coletiva encerrada.' });
  },

  advanceSeason: () => {
    const career = get().career;
    if (!career) return;
    if (career.schedule.some((match) => !match.played)) {
      get().addToast({ type: 'warning', message: 'Ainda existem partidas no calendário.' });
      return;
    }
    const nextCareer = endSeason(career);
    commit(set, nextCareer, { type: 'success', message: `Temporada ${career.season + 1} iniciada.` });
  },

  assumeClub: (clubId) => {
    const career = get().career;
    const club = getClub(clubId);
    if (!career || !club) return;
    const leagueClubs = currentLeagueClubs(clubId);
    const squad = career.players.filter((player) => player.clubeId === clubId);
    const nextCareer = {
      ...career,
      calendarVersion: 2,
      clubId,
      continent: club.continente,
      currentDate: `${career.season}-01-28`,
      tactic: createDefaultTactic(squad, '4-3-3'),
      finance: createInitialFinance(club, career.players),
      schedule: appendCupMatches(generateSchedule(clubId, career.season), clubId, career.season),
      leagueTable: buildInitialTable(leagueClubs),
      boardObjective: createBoardObjective(club),
      discipline: {},
      currentMatchIndex: 0,
      boardConfidence: difficultyBoardStart(career.manager.dificuldade),
      fanMorale: 50,
      pressPressure: 55,
      isFired: false,
      news: [makeNews('Novo desafio aceito', `${career.manager.nome} assume o ${club.nome}.`, 'positive'), ...career.news].slice(0, 28),
    };
    commit(set, nextCareer, { type: 'success', message: `Você assumiu o ${club.nome}.` });
    set({ screen: 'dashboard' });
  },
}));

export const getFormationSlots = (formation: Formation) => FORMATION_SLOTS[formation];
