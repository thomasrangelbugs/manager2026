import type { BoardExpectation, BoardObjective, Club } from '../types';

const objectiveByExpectation: Record<BoardExpectation, BoardObjective> = {
  'Não cair': { label: 'Fugir do rebaixamento (top 16)', targetPosition: 16, minConfidence: 35 },
  'Meio de tabela': { label: 'Terminar no meio da tabela (top 10)', targetPosition: 10, minConfidence: 45 },
  'Classificar para torneio continental': { label: 'Garantir vaga continental (top 6)', targetPosition: 6, minConfidence: 55 },
  'Ser campeão': { label: 'Disputar o título (top 3)', targetPosition: 3, minConfidence: 65 },
};

export const createBoardObjective = (club: Club): BoardObjective =>
  objectiveByExpectation[club.expectativa] ?? objectiveByExpectation['Meio de tabela'];

export const evaluateObjective = (position: number, objective: BoardObjective) => {
  if (position <= objective.targetPosition) {
    return { tone: 'positive' as const, message: `Meta em dia: ${objective.label}. Posição atual ${position}º.` };
  }
  if (position <= objective.targetPosition + 3) {
    return { tone: 'warning' as const, message: `Atenção: ${position}º — a meta é ${objective.label}.` };
  }
  return { tone: 'danger' as const, message: `Abaixo da meta (${position}º). Diretoria exige ${objective.label}.` };
};
