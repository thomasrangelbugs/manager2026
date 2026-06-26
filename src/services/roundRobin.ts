export type RoundFixture = {
  homeClubId: string;
  awayClubId: string;
};

const rotateTeams = (teams: string[]) => {
  if (teams.length <= 2) return teams;
  const [fixed, ...rest] = teams;
  const last = rest.pop();
  if (!last) return teams;
  return [fixed, last, ...rest];
};

/** Pontos corridos: turno e returno com todos os clubes da liga. */
export const buildRoundRobinRounds = (clubIds: string[]): RoundFixture[][] => {
  const teams = [...clubIds].sort((a, b) => a.localeCompare(b));
  if (teams.length < 2) return [];

  const list = teams.length % 2 === 0 ? [...teams] : [...teams, '__bye__'];
  let order = [...list];
  const firstLeg: RoundFixture[][] = [];

  for (let round = 0; round < order.length - 1; round += 1) {
    const fixtures: RoundFixture[] = [];
    for (let i = 0; i < order.length / 2; i += 1) {
      const a = order[i];
      const b = order[order.length - 1 - i];
      if (a === '__bye__' || b === '__bye__') continue;
      fixtures.push(
        round % 2 === 0 ? { homeClubId: a, awayClubId: b } : { homeClubId: b, awayClubId: a },
      );
    }
    firstLeg.push(fixtures);
    order = rotateTeams(order);
  }

  const secondLeg = firstLeg.map((fixtures) =>
    fixtures.map(({ homeClubId, awayClubId }) => ({ homeClubId: awayClubId, awayClubId: homeClubId })),
  );

  return [...firstLeg, ...secondLeg];
};

export const getRoundFixtures = (clubIds: string[], round: number): RoundFixture[] => {
  const rounds = buildRoundRobinRounds(clubIds);
  const index = round - 1;
  if (index < 0 || index >= rounds.length) return [];
  return rounds[index];
};

export const totalLeagueRounds = (teamCount: number) => {
  const slots = teamCount % 2 === 0 ? teamCount : teamCount + 1;
  return (slots - 1) * 2;
};
