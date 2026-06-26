import type { Career, Club, Finance, Player } from '../types';

export const calculateWeeklyWages = (players: Player[], clubId: string) =>
  players.filter((player) => player.clubeId === clubId).reduce((total, player) => total + player.salario, 0);

export const createInitialFinance = (club: Club, players: Player[]): Finance => ({
  orcamento: club.orcamento,
  receitaBilheteria: 0,
  receitaPatrocinio: Math.round(club.orcamento * 0.16),
  premiacoes: 0,
  gastosSalarios: calculateWeeklyWages(players, club.id),
});

export const refreshFinance = (career: Career): Finance => ({
  ...career.finance,
  gastosSalarios: calculateWeeklyWages(career.players, career.clubId),
});

export const applyMatchFinance = (finance: Finance, attendancePower: number, isHome: boolean, won: boolean) => {
  const ticketIncome = isHome ? Math.round(130000 + attendancePower * 6500 + Math.random() * 90000) : 0;
  const sponsorBonus = won ? Math.round(65000 + attendancePower * 800) : 0;

  return {
    ...finance,
    orcamento: finance.orcamento + ticketIncome + sponsorBonus,
    receitaBilheteria: finance.receitaBilheteria + ticketIncome,
    receitaPatrocinio: finance.receitaPatrocinio + sponsorBonus,
  };
};

export const applySeasonPrize = (finance: Finance, position: number, leagueSize: number) => {
  const prize = Math.round(Math.max(1, leagueSize - position + 1) * 950000);
  return {
    ...finance,
    orcamento: finance.orcamento + prize,
    premiacoes: finance.premiacoes + prize,
  };
};
