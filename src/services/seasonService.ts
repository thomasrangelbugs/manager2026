import { CLUBS } from '../data/clubs';
import { LEAGUES } from '../data/leagues';
import type { Career, Club, LeagueStanding, Match, News, SimulatedMatch } from '../types';
import { clamp, uid } from '../utils/random';
import { applySeasonPrize } from './financeService';
import { simulateCpuScore, simulateMatch } from './matchEngine';
import { appendCupMatches } from './cupService';
import { buildRoundRobinRounds, getRoundFixtures, totalLeagueRounds } from './roundRobin';
import type { Difficulty, Tactic } from '../types';

export const buildInitialTable = (clubs: Club[]): LeagueStanding[] =>
  clubs.map((club) => ({
    clubId: club.id,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  }));

export const sortTable = (table: LeagueStanding[]) =>
  [...table].sort((a, b) => {
    const goalDiffA = a.goalsFor - a.goalsAgainst;
    const goalDiffB = b.goalsFor - b.goalsAgainst;
    return (
      b.points - a.points ||
      b.wins - a.wins ||
      goalDiffB - goalDiffA ||
      b.goalsFor - a.goalsFor ||
      a.clubId.localeCompare(b.clubId)
    );
  });

const DAY_MS = 24 * 60 * 60 * 1000;

const parseDateOnly = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const addDaysToDateString = (date: string, days: number) => {
  const next = parseDateOnly(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
};

export const daysBetweenDates = (from: string, to: string) =>
  Math.round((parseDateOnly(to).getTime() - parseDateOnly(from).getTime()) / DAY_MS);

export const updateTableWithResult = (
  table: LeagueStanding[],
  homeClubId: string,
  awayClubId: string,
  homeGoals: number,
  awayGoals: number,
) =>
  table.map((entry) => {
    if (![homeClubId, awayClubId].includes(entry.clubId)) return entry;
    const isHome = entry.clubId === homeClubId;
    const goalsFor = isHome ? homeGoals : awayGoals;
    const goalsAgainst = isHome ? awayGoals : homeGoals;
    const won = goalsFor > goalsAgainst;
    const draw = goalsFor === goalsAgainst;

    return {
      ...entry,
      played: entry.played + 1,
      wins: entry.wins + (won ? 1 : 0),
      draws: entry.draws + (draw ? 1 : 0),
      losses: entry.losses + (!won && !draw ? 1 : 0),
      goalsFor: entry.goalsFor + goalsFor,
      goalsAgainst: entry.goalsAgainst + goalsAgainst,
      points: entry.points + (won ? 3 : draw ? 1 : 0),
    };
  });

/** Calendário do clube: pontos corridos (todos x todos, ida e volta). */
export const generateSchedule = (clubId: string, season: number): Match[] => {
  const club = CLUBS.find((item) => item.id === clubId);
  const league = LEAGUES.find((item) => item.id === club?.ligaId);
  if (!club || !league) return [];

  const rounds = buildRoundRobinRounds(league.clubIds);
  const start = new Date(season, 0, 28, 12, 0, 0);
  const matches: Match[] = [];

  rounds.forEach((fixtures, roundIndex) => {
    const userFixture = fixtures.find(
      (fixture) => fixture.homeClubId === clubId || fixture.awayClubId === clubId,
    );
    if (!userFixture) return;

    const date = new Date(start);
    date.setDate(start.getDate() + roundIndex * 7);

    matches.push({
      id: uid('match'),
      date: date.toISOString().slice(0, 10),
      competitionId: league.id,
      round: roundIndex + 1,
      homeClubId: userFixture.homeClubId,
      awayClubId: userFixture.awayClubId,
      played: false,
      events: [],
    });
  });

  return matches;
};

export const currentLeagueClubs = (clubId: string) => {
  const club = CLUBS.find((item) => item.id === clubId);
  const league = LEAGUES.find((item) => item.id === club?.ligaId);
  return CLUBS.filter((item) => league?.clubIds.includes(item.id));
};

export const getLeagueForClub = (clubId: string) => {
  const club = CLUBS.find((item) => item.id === clubId);
  return LEAGUES.find((item) => item.id === club?.ligaId);
};

export const isLeagueMatch = (clubId: string, competitionId: string) => {
  const league = getLeagueForClub(clubId);
  return league?.id === competitionId;
};

export const getNextMatch = (career: Career) => career.schedule.find((match) => !match.played) ?? null;

export const getPostMatchCalendarDate = (playedMatchDate: string, nextMatch: Match | null) => {
  if (!nextMatch) return playedMatchDate;
  const nextDay = addDaysToDateString(playedMatchDate, 1);
  return daysBetweenDates(nextDay, nextMatch.date) >= 0 ? nextDay : nextMatch.date;
};

export const getCurrentScheduleContext = (career: Career) => {
  const nextMatch = getNextMatch(career);
  if (!nextMatch) {
    return {
      nextMatch: null,
      isMatchDay: false,
      daysUntilMatch: 0,
      maxTrainingDays: 0,
      trainingDay: 0,
      cycleStartDate: career.currentDate,
    };
  }

  const nextIndex = career.schedule.findIndex((match) => match.id === nextMatch.id);
  const previousMatch = nextIndex > 0 ? career.schedule[nextIndex - 1] : null;
  const cycleStartDate = previousMatch ? getPostMatchCalendarDate(previousMatch.date, nextMatch) : career.currentDate;
  const daysUntilMatch = Math.max(0, daysBetweenDates(career.currentDate, nextMatch.date));
  const isMatchDay = daysBetweenDates(career.currentDate, nextMatch.date) <= 0;
  const maxTrainingDays = Math.max(0, daysBetweenDates(cycleStartDate, nextMatch.date));
  const trainingDay =
    isMatchDay || maxTrainingDays === 0
      ? 0
      : clamp(daysBetweenDates(cycleStartDate, career.currentDate) + 1, 1, maxTrainingDays);

  return {
    nextMatch,
    isMatchDay,
    daysUntilMatch,
    maxTrainingDays,
    trainingDay,
    cycleStartDate,
  };
};

export const canPlayNextMatch = (career: Career) => getCurrentScheduleContext(career).isMatchDay;

export const canTrainToday = (career: Career) => {
  const context = getCurrentScheduleContext(career);
  return Boolean(context.nextMatch && !context.isMatchDay);
};

export const getNextCalendarDate = (career: Career) => {
  const context = getCurrentScheduleContext(career);
  if (!context.nextMatch || context.isMatchDay) return career.currentDate;
  const nextDay = addDaysToDateString(career.currentDate, 1);
  return daysBetweenDates(nextDay, context.nextMatch.date) >= 0 ? nextDay : context.nextMatch.date;
};

export const getRivalRecentForm = (career: Career, rivalClubId: string) =>
  career.matchHistory
    .filter((match) => match.homeClubId === rivalClubId || match.awayClubId === rivalClubId)
    .slice(0, 5)
    .map((match) => {
      const isHome = match.homeClubId === rivalClubId;
      const goals = isHome ? match.homeGoals ?? 0 : match.awayGoals ?? 0;
      const against = isHome ? match.awayGoals ?? 0 : match.homeGoals ?? 0;
      return goals > against ? 'V' : goals === against ? 'E' : 'D';
    });

export const simulateRemainingRound = (
  career: Career,
  tactic: Tactic,
  difficulty: Difficulty,
): { result: ReturnType<typeof simulateMatch> | null; table: Career['leagueTable']; history: Match[] } => {
  const next = getNextMatch(career);
  if (!next) return { result: null, table: career.leagueTable, history: [] };
  const result = simulateMatch(next, career.players, career.clubId, tactic, difficulty);
  return { result, table: career.leagueTable, history: [] };
};

/** Simula os demais jogos da mesma rodada do campeonato (pontos corridos). */
export const simulateOtherRoundResults = (career: Career, userResult: SimulatedMatch, userMatch: Match) => {
  const league = getLeagueForClub(career.clubId);
  if (!league || userMatch.competitionId !== league.id) {
    return { table: career.leagueTable, history: [] as Match[] };
  }

  const roundFixtures = getRoundFixtures(league.clubIds, userMatch.round);
  let table = career.leagueTable;
  const history: Match[] = [];

  for (const fixture of roundFixtures) {
    const isUserMatch =
      (fixture.homeClubId === userResult.homeClubId && fixture.awayClubId === userResult.awayClubId) ||
      (fixture.homeClubId === userResult.awayClubId && fixture.awayClubId === userResult.homeClubId);
    if (isUserMatch) continue;

    const score = simulateCpuScore(fixture.homeClubId, fixture.awayClubId, career.players);
    table = updateTableWithResult(table, fixture.homeClubId, fixture.awayClubId, score.homeGoals, score.awayGoals);
    history.push({
      id: uid('cpu-match'),
      date: userMatch.date,
      competitionId: league.id,
      round: userMatch.round,
      homeClubId: fixture.homeClubId,
      awayClubId: fixture.awayClubId,
      played: true,
      homeGoals: score.homeGoals,
      awayGoals: score.awayGoals,
      events: [],
    });
  }

  return { table: sortTable(table), history };
};

export const endSeason = (career: Career): Career => {
  const sorted = sortTable(career.leagueTable);
  const champion = sorted[0];
  const userPosition = sorted.findIndex((entry) => entry.clubId === career.clubId) + 1;
  const championClub = CLUBS.find((club) => club.id === champion?.clubId);
  const club = CLUBS.find((item) => item.id === career.clubId);
  const league = getLeagueForClub(career.clubId);
  const nextSeason = career.season + 1;
  const evolvedPlayers = career.players.map((player) => {
    if (player.clubeId !== career.clubId) return player;
    const age = player.idade + 1;
    const growth = age <= 23 ? 1 + Math.random() * 1.5 : age >= 31 ? -1 - Math.random() : Math.random() < 0.35 ? 1 : 0;
    return {
      ...player,
      idade: age,
      overall: clamp(Math.round(player.overall + growth), 42, player.potencial),
      potencial: age >= 30 ? clamp(player.potencial - 1, player.overall, 95) : player.potencial,
      contratoAnos: Math.max(0, player.contratoAnos - 1),
      energia: 92,
      moral: clamp(player.moral + (userPosition <= 3 ? 8 : userPosition <= sorted.length / 2 ? 2 : -7), 20, 100),
      status: player.status === 'lesionado' ? 'reserva' : player.status,
    };
  });

  const finance = applySeasonPrize(career.finance, userPosition, sorted.length);
  const leagueClubs = currentLeagueClubs(career.clubId);
  const seasonTone: News['tone'] = userPosition <= 3 ? 'positive' : userPosition <= sorted.length / 2 ? 'neutral' : 'warning';

  return {
    ...career,
    calendarVersion: 2,
    season: nextSeason,
    currentDate: `${nextSeason}-01-28`,
    players: evolvedPlayers,
    finance,
    schedule: appendCupMatches(generateSchedule(career.clubId, nextSeason), career.clubId, nextSeason),
    currentMatchIndex: 0,
    leagueTable: buildInitialTable(leagueClubs),
    news: [
      {
        id: uid('news'),
        title: `Temporada ${career.season} encerrada`,
        body: `${championClub?.nome ?? 'Um clube'} foi campeão do ${league?.nome ?? 'campeonato'}. ${club?.nome ?? 'Seu clube'} terminou em ${userPosition}º.`,
        date: new Date().toISOString(),
        tone: seasonTone,
      },
      ...career.news,
    ].slice(0, 24),
    hallOfFame: [
      {
        id: uid('hall'),
        season: career.season,
        clubName: club?.nome ?? 'Clube',
        leaguePosition: userPosition,
        title: userPosition === 1 ? 'Campeão' : `${userPosition}º colocado`,
      },
      ...career.hallOfFame,
    ],
    boardConfidence: clamp(career.boardConfidence + (userPosition <= 3 ? 15 : userPosition <= sorted.length / 2 ? 4 : -12), 0, 100),
    fanMorale: clamp(career.fanMorale + (userPosition <= 3 ? 12 : userPosition <= sorted.length / 2 ? 3 : -10), 0, 100),
  };
};

/** Alinha calendário antigo ao formato de pontos corridos, preservando jogos já disputados. */
export const repairCareerSchedule = (career: Career): Career => {
  const league = getLeagueForClub(career.clubId);
  if (!league) return career;

  const fresh = appendCupMatches(generateSchedule(career.clubId, career.season), career.clubId, career.season);
  const played = career.schedule.filter((match) => match.played);

  const merged = fresh.map((match) => {
    const existing = played.find(
      (item) =>
        item.round === match.round &&
        item.homeClubId === match.homeClubId &&
        item.awayClubId === match.awayClubId,
    );
    return existing ?? match;
  });

  const nextIndex = merged.findIndex((match) => !match.played);
  const leagueClubs = currentLeagueClubs(career.clubId);
  const tableOk = career.leagueTable.length === leagueClubs.length;
  const nextMatch = nextIndex >= 0 ? merged[nextIndex] : null;
  const previousMatch = nextIndex > 0 ? merged[nextIndex - 1] : null;
  const legacyCalendar = career.calendarVersion !== 2;
  const repairedCurrentDate =
    legacyCalendar && nextMatch && previousMatch && daysBetweenDates(career.currentDate, nextMatch.date) <= 0
      ? getPostMatchCalendarDate(previousMatch.date, nextMatch)
      : career.currentDate;

  return {
    ...career,
    calendarVersion: 2,
    schedule: merged,
    currentMatchIndex: nextIndex < 0 ? merged.length : nextIndex,
    currentDate: nextMatch ? repairedCurrentDate : career.currentDate,
    leagueTable: tableOk ? career.leagueTable : buildInitialTable(leagueClubs),
  };
};

export { totalLeagueRounds };
