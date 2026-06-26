import type { Player } from '../types';
import {
  legendTrainingFatigueRisk,
  legendTrainingGrowthBonus,
  legendTrainingMoraleBonus,
} from './legendService';
import { clamp, randomInt } from '../utils/random';

export type TrainingFocus = 'Ataque' | 'Defesa' | 'Físico' | 'Velocidade' | 'Técnica' | 'Goleiros' | 'Jovens';
export type TrainingIntensity = 'Leve' | 'Normal' | 'Pesado';

const focusBoost: Record<TrainingFocus, (keyof Player['atributos'])[]> = {
  Ataque: ['finalizacao', 'tecnica'],
  Defesa: ['marcacao', 'fisico'],
  Físico: ['fisico'],
  Velocidade: ['velocidade'],
  Técnica: ['tecnica', 'passe'],
  Goleiros: ['goleiro'],
  Jovens: ['tecnica', 'passe', 'velocidade'],
};

const intensityImpact: Record<TrainingIntensity, { growth: number; energy: number; morale: number }> = {
  Leve: { growth: 0.35, energy: -3, morale: 2 },
  Normal: { growth: 0.6, energy: -7, morale: 0 },
  Pesado: { growth: 0.95, energy: -14, morale: -4 },
};

export const runTrainingDay = (
  players: Player[],
  clubId: string,
  focus: TrainingFocus,
  intensity: TrainingIntensity,
) => {
  const impact = intensityImpact[intensity];
  const reports: string[] = [];

  const updatedPlayers = players.map((player) => {
    if (player.clubeId !== clubId) return player;

    const isYoung = player.idade <= 22;
    const growthChance =
      (focus === 'Jovens' && isYoung ? 0.68 : 0.32) + legendTrainingGrowthBonus(player);
    const fatigueRisk = legendTrainingFatigueRisk(
      player,
      intensity === 'Pesado' && player.energia < 55 && Math.random() < 0.13,
    );
    const next = {
      ...player,
      energia: clamp(player.energia + impact.energy + randomInt(-2, 2), fatigueRisk ? 12 : 25, 100),
      moral: clamp(
        legendTrainingMoraleBonus(player, player.moral + impact.morale + randomInt(-2, 3)),
        15,
        100,
      ),
      atributos: { ...player.atributos },
    };

    focusBoost[focus].forEach((attribute) => {
      if (focus === 'Goleiros' && player.posicao !== 'GOL') return;
      if (focus !== 'Goleiros' && player.posicao === 'GOL' && attribute !== 'goleiro') return;

      if (Math.random() < growthChance + (player.potencial - player.overall) / 100) {
        next.atributos[attribute] = clamp(next.atributos[attribute] + impact.growth, 1, 99);
      }
    });

    const attributeAverage =
      next.posicao === 'GOL'
        ? next.atributos.goleiro * 0.72 + next.atributos.lideranca * 0.08 + next.atributos.passe * 0.2
        : (next.atributos.finalizacao +
            next.atributos.passe +
            next.atributos.marcacao +
            next.atributos.velocidade +
            next.atributos.fisico +
            next.atributos.tecnica) /
          6;
    const newOverall = clamp(Math.round(attributeAverage), 38, next.potencial);

    if (newOverall > player.overall) {
      reports.push(`${player.nome} evoluiu para overall ${newOverall}.`);
      next.overall = newOverall;
    }

    if (fatigueRisk) {
      next.status = 'lesionado';
      reports.push(`${player.nome} sentiu o treino pesado e ficará em observação.`);
    }

    return next;
  });

  if (reports.length === 0) {
    reports.push(`Treino de ${focus.toLowerCase()} concluído sem grandes mudanças.`);
  }

  return { players: updatedPlayers, reports };
};

export const runTrainingWeek = runTrainingDay;
