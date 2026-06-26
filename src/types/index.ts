export type Continent = 'Brasil' | 'América Latina' | 'Europa';

export type Position =
  | 'GOL'
  | 'LD'
  | 'ZAG'
  | 'LE'
  | 'VOL'
  | 'MC'
  | 'MEI'
  | 'PE'
  | 'PD'
  | 'ATA';

export type PlayerStatus = 'titular' | 'reserva' | 'lesionado' | 'suspenso' | 'jovem promessa';

export type Difficulty = 'Fácil' | 'Normal' | 'Difícil' | 'Lendário';

export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2';

export type TacticalStyle =
  | 'Equilibrado'
  | 'Ofensivo'
  | 'Defensivo'
  | 'Contra-ataque'
  | 'Posse de bola'
  | 'Pressão alta';

export type Screen =
  | 'splash'
  | 'careerSetup'
  | 'dashboard'
  | 'squad'
  | 'tactics'
  | 'calendar'
  | 'match'
  | 'postMatch'
  | 'transfers'
  | 'training'
  | 'radio'
  | 'finance'
  | 'competitions'
  | 'table'
  | 'news'
  | 'board'
  | 'academy'
  | 'settings'
  | 'hall';

export interface BoardObjective {
  label: string;
  targetPosition: number;
  minConfidence: number;
}

export interface PlayerDiscipline {
  yellows: number;
  suspendedRounds: number;
}

export interface PostMatchSummary {
  matchId: string;
  homeClubId: string;
  awayClubId: string;
  homeGoals: number;
  awayGoals: number;
  userGoals: number;
  rivalGoals: number;
  won: boolean;
  draw: boolean;
  confidenceDelta: number;
  fanDelta: number;
  financeDelta: number;
  mvpPlayerId: string | null;
  boardMessage: string;
}

export interface PlayerAttributes {
  finalizacao: number;
  passe: number;
  marcacao: number;
  velocidade: number;
  fisico: number;
  tecnica: number;
  goleiro: number;
  lideranca: number;
}

export interface Player {
  id: string;
  nome: string;
  idade: number;
  nacionalidade: string;
  posicao: Position;
  overall: number;
  potencial: number;
  valorDeMercado: number;
  salario: number;
  energia: number;
  moral: number;
  contratoAnos: number;
  clubeId: string | null;
  status: PlayerStatus;
  minutosJogos: number;
  atributos: PlayerAttributes;
  isLegend?: boolean;
  portraitUrl?: string;
}

export interface Club {
  id: string;
  nome: string;
  apelido?: string;
  pais: string;
  continente: Continent;
  ligaId: string;
  serie?: 'Série A' | 'Série B' | 'Série A2';
  estadio: string;
  orcamento: number;
  folhaSalarialLimite: number;
  forcaElenco: number;
  expectativa: BoardExpectation;
  reputacao: number;
  escudoUrl?: string;
  imagemUrl?: string;
  cores: {
    primaria: string;
    secundaria: string;
  };
}

export type BoardExpectation =
  | 'Não cair'
  | 'Meio de tabela'
  | 'Classificar para torneio continental'
  | 'Ser campeão';

export interface League {
  id: string;
  nome: string;
  continente: Continent;
  pais: string;
  clubIds: string[];
}

export interface Competition {
  id: string;
  nome: string;
  tipo: 'Liga' | 'Copa' | 'Continental' | 'Mundial';
  continente?: Continent;
  descricao: string;
  clubIds: string[];
  participantes: number;
  formato: string;
  fases?: string;
}

export interface Manager {
  nome: string;
  nacionalidade: string;
  dificuldade: Difficulty;
}

export interface FormationSlot {
  id: string;
  label: string;
  posicao: Position;
  x: number;
  y: number;
}

export interface Tactic {
  formation: Formation;
  style: TacticalStyle;
  lineup: Record<string, string | null>;
  captainId: string | null;
  freeKickTakerId: string | null;
  penaltyTakerId: string | null;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type:
    | 'kickoff'
    | 'shot'
    | 'save'
    | 'woodwork'
    | 'yellow'
    | 'red'
    | 'injury'
    | 'goal'
    | 'substitution'
    | 'pressure'
    | 'tactic'
    | 'fulltime';
  clubId?: string;
  playerId?: string;
  title: string;
  description: string;
}

export interface MatchStats {
  posseCasa: number;
  finalizacoesCasa: number;
  finalizacoesFora: number;
  noGolCasa: number;
  noGolFora: number;
  faltasCasa: number;
  faltasFora: number;
  amarelosCasa: number;
  amarelosFora: number;
  vermelhosCasa: number;
  vermelhosFora: number;
  escanteiosCasa: number;
  escanteiosFora: number;
}

export interface Match {
  id: string;
  date: string;
  competitionId: string;
  round: number;
  homeClubId: string;
  awayClubId: string;
  played: boolean;
  homeGoals?: number;
  awayGoals?: number;
  events: MatchEvent[];
}

export interface SimulatedMatch {
  matchId: string;
  homeClubId: string;
  awayClubId: string;
  homeGoals: number;
  awayGoals: number;
  stats: MatchStats;
  events: MatchEvent[];
  playerImpacts: Record<string, { energia: number; moral: number; minutos: number }>;
}

export interface LeagueStanding {
  clubId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface News {
  id: string;
  title: string;
  body: string;
  date: string;
  tone: 'positive' | 'neutral' | 'warning' | 'danger';
}

export interface Finance {
  orcamento: number;
  receitaBilheteria: number;
  receitaPatrocinio: number;
  premiacoes: number;
  gastosSalarios: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
}

export interface HallEntry {
  id: string;
  season: number;
  clubName: string;
  leaguePosition: number;
  title: string;
}

export interface Career {
  id: string;
  calendarVersion: number;
  manager: Manager;
  clubId: string;
  continent: Continent;
  season: number;
  currentDate: string;
  players: Player[];
  academy: Player[];
  finance: Finance;
  tactic: Tactic;
  schedule: Match[];
  currentMatchIndex: number;
  leagueTable: LeagueStanding[];
  news: News[];
  matchHistory: Match[];
  boardConfidence: number;
  fanMorale: number;
  pressPressure: number;
  achievements: Achievement[];
  hallOfFame: HallEntry[];
  isFired: boolean;
  boardObjective: BoardObjective;
  discipline: Record<string, PlayerDiscipline>;
  pendingAchievement: Achievement | null;
}

export interface AudioSettings {
  musicVolume: number;
  effectsVolume: number;
  muteMusic: boolean;
  muteEffects: boolean;
}

export interface GameSettings extends AudioSettings {
  animations: boolean;
  theme: 'dark' | 'light';
  defaultSimulationSpeed: 1 | 2;
  hideLegendLineupWarning: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
