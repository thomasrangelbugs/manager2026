import { CLUBS } from './clubs';
import { COUNTRIES_BY_CONTINENT } from './countries';
import { LAST_NAMES, POSITION_ORDER, YOUTH_FIRST_NAMES } from './names';
import { CLUB_FEATURED_PLAYERS, LEGEND_PLAYERS, REAL_PLAYERS_BY_POSITION, type RealPlayerSeed } from './realPlayers';
import type { Player, PlayerAttributes, Position } from '../types';
import { clamp, hashString, seededInt, seededRandom } from '../utils/random';

const squadShape: Position[] = [
  'GOL',
  'GOL',
  'LD',
  'LD',
  'ZAG',
  'ZAG',
  'ZAG',
  'ZAG',
  'LE',
  'LE',
  'VOL',
  'VOL',
  'MC',
  'MC',
  'MC',
  'MEI',
  'MEI',
  'PE',
  'PE',
  'PD',
  'PD',
  'ATA',
  'ATA',
  'ATA',
];

const countriesForClub = (clubId: string) => {
  const club = CLUBS.find((item) => item.id === clubId);
  if (!club) return ['Brasil'];
  const regional = COUNTRIES_BY_CONTINENT[club.continente];
  return [...regional, 'Brasil', 'Argentina', 'Uruguai', 'Portugal', 'Espanha'];
};

const positionOccurrence = (index: number, posicao: Position) =>
  squadShape.slice(0, index + 1).filter((item) => item === posicao).length - 1;

/** Nomes reais por clube (2026) ou pool por posição; overall/valor continuam gerados pelo jogo. */
const pickRealPlayer = (clubId: string, posicao: Position, index: number): RealPlayerSeed => {
  const occurrence = positionOccurrence(index, posicao);
  const featuredClubId = clubId.startsWith('gauchao-') ? clubId.replace('gauchao-', '') : clubId;
  const featuredPool = (CLUB_FEATURED_PLAYERS[clubId] ?? CLUB_FEATURED_PLAYERS[featuredClubId])?.[posicao] ?? [];
  const featured = featuredPool[occurrence];
  if (featured) return featured;

  const featuredNames = new Set(featuredPool.map((player) => player.nome));
  const pool = REAL_PLAYERS_BY_POSITION[posicao].filter((player) => !featuredNames.has(player.nome));
  const offset = Math.abs(hashString(`${clubId}-${posicao}`)) % pool.length;
  return pool[(offset + occurrence) % pool.length];
};

const attributesByPosition = (
  posicao: Position,
  overall: number,
  rand: () => number,
): PlayerAttributes => {
  const noise = () => seededInt(rand, -8, 8);
  const base = (modifier = 0) => clamp(overall + modifier + noise(), 38, 94);

  return {
    finalizacao: base(['ATA', 'PE', 'PD', 'MEI'].includes(posicao) ? 8 : -8),
    passe: base(['MC', 'MEI', 'VOL'].includes(posicao) ? 7 : 0),
    marcacao: base(['ZAG', 'LD', 'LE', 'VOL'].includes(posicao) ? 8 : -8),
    velocidade: base(['LD', 'LE', 'PE', 'PD', 'ATA'].includes(posicao) ? 7 : -2),
    fisico: base(['ZAG', 'VOL', 'ATA'].includes(posicao) ? 5 : 0),
    tecnica: base(['MEI', 'PE', 'PD', 'MC'].includes(posicao) ? 8 : 0),
    goleiro: posicao === 'GOL' ? base(10) : clamp(28 + noise(), 20, 45),
    lideranca: base(seededInt(rand, -5, 10)),
  };
};

export const createPlayerForClub = (clubId: string, index: number): Player => {
  const club = CLUBS.find((item) => item.id === clubId);
  const seed = hashString(`${clubId}-${index}`);
  const rand = seededRandom(seed);
  const posicao = squadShape[index % squadShape.length];
  const strength = club?.forcaElenco ?? 66;
  const age = seededInt(rand, 18, 34);
  const ageCurve = age <= 22 ? 2 : age >= 31 ? -3 : 0;
  const starBias = index === 15 || index === 21 ? 4 : index < 11 ? 1 : -2;
  const overall = clamp(strength + seededInt(rand, -9, 9) + ageCurve + starBias, 49, 91);
  const potencial = clamp(overall + seededInt(rand, age < 23 ? 4 : -4, age < 23 ? 14 : 5), overall, 95);
  const countries = countriesForClub(clubId);
  const realPlayer = pickRealPlayer(clubId, posicao, index);
  const marketMultiplier = posicao === 'ATA' || posicao === 'MEI' ? 1.18 : posicao === 'GOL' ? 0.92 : 1;
  const valorDeMercado = Math.round((overall ** 3.25 * 105 * marketMultiplier * (potencial / overall)) / 10000) * 10000;
  const salario = Math.round((overall ** 2.08 * (club?.reputacao ?? 65) * 0.68) / 1000) * 1000;

  return {
    id: `${clubId}-p${index + 1}`,
    nome: realPlayer.nome,
    idade: realPlayer.idade ?? age,
    nacionalidade: realPlayer.nacionalidade ?? countries[seededInt(rand, 0, countries.length - 1)],
    posicao,
    overall,
    potencial,
    valorDeMercado,
    salario,
    energia: seededInt(rand, 76, 100),
    moral: seededInt(rand, 58, 88),
    contratoAnos: seededInt(rand, 1, 5),
    clubeId: clubId,
    status: index < 11 ? 'titular' : age <= 20 && potencial >= overall + 8 ? 'jovem promessa' : 'reserva',
    minutosJogos: 0,
    atributos: attributesByPosition(posicao, overall, rand),
  };
};

export const INITIAL_PLAYERS: Player[] = CLUBS.flatMap((club) =>
  Array.from({ length: squadShape.length }, (_, index) => createPlayerForClub(club.id, index)),
);

const createLegend = (legend: (typeof LEGEND_PLAYERS)[number]): Player => {
  const rand = seededRandom(hashString(legend.id));
  return {
    id: legend.id,
    nome: legend.nome,
    idade: legend.idade ?? 26,
    nacionalidade: legend.nacionalidade,
    posicao: legend.posicao,
    overall: legend.overall,
    potencial: legend.potencial,
    valorDeMercado: legend.valorDeMercado,
    salario: legend.salario,
    energia: 95,
    moral: 88,
    contratoAnos: 99,
    clubeId: null,
    status: 'reserva',
    minutosJogos: 0,
    isLegend: true,
    portraitUrl: legend.portraitUrl,
    atributos: attributesByPosition(legend.posicao, legend.overall, rand),
  };
};

export const createFreeAgentPool = (): Player[] => {
  const freeAgents: Player[] = Array.from({ length: 28 }, (_, index) => {
    const rand = seededRandom(hashString(`free-agent-${index}`));
    const posicao = POSITION_ORDER[index % POSITION_ORDER.length];
    const overall = seededInt(rand, 58, 78);
    const potencial = clamp(overall + seededInt(rand, -2, 10), overall, 88);
    const realPlayer = REAL_PLAYERS_BY_POSITION[posicao][seededInt(rand, 0, REAL_PLAYERS_BY_POSITION[posicao].length - 1)];

    return {
      id: `free-agent-${index + 1}`,
      nome: realPlayer.nome,
      idade: realPlayer.idade ?? seededInt(rand, 18, 33),
      nacionalidade: realPlayer.nacionalidade,
      posicao,
      overall,
      potencial,
      valorDeMercado: Math.round((overall ** 3.05 * 90) / 10000) * 10000,
      salario: Math.round((overall ** 2.02 * 38) / 1000) * 1000,
      energia: seededInt(rand, 78, 100),
      moral: seededInt(rand, 50, 82),
      contratoAnos: seededInt(rand, 1, 3),
      clubeId: null,
      status: potencial > overall + 7 ? 'jovem promessa' as const : 'reserva' as const,
      minutosJogos: 0,
      atributos: attributesByPosition(posicao, overall, rand),
    };
  });

  return [...freeAgents, ...LEGEND_PLAYERS.map(createLegend)];
};

export const createYouthName = () => {
  const rand = seededRandom(hashString(`youth-${Date.now()}-${Math.random()}`));
  const posicao = POSITION_ORDER[seededInt(rand, 0, POSITION_ORDER.length - 1)];
  const realPlayer = REAL_PLAYERS_BY_POSITION[posicao][seededInt(rand, 0, REAL_PLAYERS_BY_POSITION[posicao].length - 1)];
  const first = YOUTH_FIRST_NAMES[seededInt(rand, 0, YOUTH_FIRST_NAMES.length - 1)];
  const last = LAST_NAMES[seededInt(rand, 0, LAST_NAMES.length - 1)];
  return Math.random() < 0.55 ? realPlayer.nome : `${first} ${last}`;
};
