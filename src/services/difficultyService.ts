import type { Difficulty } from '../types';

const attackMultiplier: Record<Difficulty, number> = {
  Fácil: 1.14,
  Normal: 1,
  Difícil: 0.9,
  Lendário: 0.82,
};

const budgetMultiplier: Record<Difficulty, number> = {
  Fácil: 1.15,
  Normal: 1,
  Difícil: 0.88,
  Lendário: 0.75,
};

const boardStart: Record<Difficulty, number> = {
  Fácil: 78,
  Normal: 72,
  Difícil: 62,
  Lendário: 52,
};

export const difficultyAttackBoost = (difficulty: Difficulty) => attackMultiplier[difficulty];
export const difficultyBudgetFactor = (difficulty: Difficulty) => budgetMultiplier[difficulty];
export const difficultyBoardStart = (difficulty: Difficulty) => boardStart[difficulty];
