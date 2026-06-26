import { CLUBS } from '../data/clubs';
import { COMPETITIONS, LEAGUES } from '../data/leagues';
import type { Match } from '../types';
import { uid } from '../utils/random';

const copaDoBrasilDates = (season: number) => [
  `${season}-02-18`,
  `${season}-03-11`,
  `${season}-04-15`,
  `${season}-05-20`,
  `${season}-07-29`,
  `${season}-08-19`,
  `${season}-09-16`,
  `${season}-10-21`,
  `${season}-12-06`,
];

const byDateThenCompetition = (a: Match, b: Match) =>
  a.date.localeCompare(b.date) || a.competitionId.localeCompare(b.competitionId) || a.round - b.round;

/** Caminho do clube na Copa do Brasil em 9 fases, alinhado ao formato oficial de 2026. */
export const appendCupMatches = (schedule: Match[], clubId: string, season: number): Match[] => {
  const club = CLUBS.find((item) => item.id === clubId);
  const league = LEAGUES.find((item) => item.id === club?.ligaId);
  const copa = COMPETITIONS.find((item) => item.id === 'copa-do-brasil');
  if (!league || !copa) return schedule;
  if (league.id.startsWith('gauchao-')) return schedule;

  const pool = copa.clubIds.filter((id) => id !== clubId);
  if (!pool.length) return schedule;

  const seed = Math.max(0, league.clubIds.findIndex((id) => id === clubId));
  const cupMatches: Match[] = copaDoBrasilDates(season).map((date, index) => {
    const opponent = pool[(seed * 5 + index * 7) % pool.length] ?? pool[index % pool.length];
    const userHome = index % 2 === 0;
    return {
      id: uid('cup'),
      date,
      competitionId: 'copa-do-brasil',
      round: index + 1,
      homeClubId: userHome ? clubId : opponent,
      awayClubId: userHome ? opponent : clubId,
      played: false,
      events: [],
    };
  });

  return [...schedule, ...cupMatches].sort(byDateThenCompetition);
};
