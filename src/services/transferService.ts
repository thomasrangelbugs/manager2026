import type { Difficulty, Finance, Player } from '../types';
import { clamp } from '../utils/random';

const difficultyNegotiation: Record<Difficulty, number> = {
  Fácil: 12,
  Normal: 0,
  Difícil: -12,
  Lendário: -22,
};

export const squadWageTotal = (players: Player[], clubId: string) =>
  players.filter((player) => player.clubeId === clubId).reduce((sum, player) => sum + player.salario, 0);

export const canBuyPlayer = (
  finance: Finance,
  player: Player,
  wageLimit: number,
  currentWages: number,
): { ok: boolean; message: string } => {
  const transferCost = player.valorDeMercado;
  if (finance.orcamento < transferCost) {
    return { ok: false, message: 'A diretoria bloqueou: orçamento insuficiente.' };
  }

  if (currentWages + player.salario > wageLimit * 1.08) {
    return { ok: false, message: 'A folha salarial ficaria acima do limite aceitável.' };
  }

  return { ok: true, message: 'Negociação autorizada.' };
};

export const negotiateTransfer = (player: Player, difficulty: Difficulty) => {
  const baseChance = 67 + difficultyNegotiation[difficulty] + (player.moral < 45 ? 10 : 0);
  const price = Math.round(player.valorDeMercado * (0.94 + Math.random() * 0.22));
  const success = Math.random() * 100 < clamp(baseChance, 22, 88);
  const message = success
    ? `Empresário aceita contrato. ${player.nome} está pronto para assinar.`
    : `Clube vendedor recusou a oferta por ${player.nome}. Eles pedem mais garantias.`;

  return { success, price, message };
};

export const sellValue = (player: Player) =>
  Math.round(player.valorDeMercado * (0.72 + Math.random() * 0.22));

export const canSellPlayer = (squad: Player[], player: Player) => {
  if (player.isLegend) {
    return { ok: false, message: 'Lendas não podem ser vendidas — são ícones do clube.' };
  }

  if (squad.length <= 18) {
    return { ok: false, message: 'Elenco ficaria curto demais. A diretoria pediu para segurar a venda.' };
  }

  const samePosition = squad.filter((item) => item.id !== player.id && item.posicao === player.posicao).length;
  if (samePosition === 0) {
    return { ok: false, message: `Você não tem reposição para ${player.posicao}. Venda bloqueada.` };
  }

  return { ok: true, message: 'Venda liberada.' };
};
