import type { Player } from '../types';

/** Bônus de overall em campo (além do OVR alto da carta). */
export const LEGEND_MATCH_OVR_BONUS = 3;

/** Aura do time: ataque/defesa por lenda titular (máx. 3 lendas). */
export const LEGEND_AURA_PER_PLAYER = 1.5;
export const LEGEND_AURA_CAP = 4.5;

/** Peso extra para aparecer em gols, faltas e lances. */
export const LEGEND_EVENT_PICK_WEIGHT = 2.6;

export const LEGEND_PERKS = [
  `+${LEGEND_MATCH_OVR_BONUS} OVR em campo e aura de time`,
  'Menos cansaço e moral protegida em derrotas',
  'Raramente lesionam ou são suspensos',
  'Treino pesado não lesiona; evoluem mais rápido',
  'Contrato eterno (não vence)',
] as const;

export const isLegendPlayer = (player?: Player | null): player is Player =>
  Boolean(player?.isLegend);

export const legendMatchOverallBonus = (player: Player) => (player.isLegend ? LEGEND_MATCH_OVR_BONUS : 0);

export const legendLineupAura = (lineup: Player[]) => {
  const count = lineup.filter(isLegendPlayer).length;
  const aura = Math.min(LEGEND_AURA_CAP, count * LEGEND_AURA_PER_PLAYER);
  return { attack: aura, defense: aura, count };
};

export const legendPostMatchMorale = (player: Player, baseDelta: number) => {
  if (!player.isLegend) return baseDelta;
  if (baseDelta < 0) return Math.max(baseDelta, -2);
  return baseDelta + 1;
};

export const legendPostMatchFatigue = (player: Player, baseDelta: number) => {
  if (!player.isLegend) return baseDelta;
  return Math.round(baseDelta * 0.55);
};

export const legendTrainingFatigueRisk = (player: Player, baseRisk: boolean) =>
  player.isLegend ? false : baseRisk;

export const legendTrainingGrowthBonus = (player: Player) => (player.isLegend ? 0.18 : 0);

export const legendTrainingMoraleBonus = (player: Player, baseMorale: number) =>
  player.isLegend ? baseMorale + 2 : baseMorale;

export const legendAvoidsDiscipline = (player: Player) => player.isLegend && Math.random() < 0.72;

export const legendAvoidsInjury = (player: Player) => player.isLegend && Math.random() < 0.88;

export const legendPickScore = (player: Player) => player.overall * (player.isLegend ? LEGEND_EVENT_PICK_WEIGHT : 1);
