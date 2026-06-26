import type { MatchEvent, Player, PlayerDiscipline } from '../types';
import { legendAvoidsDiscipline, legendAvoidsInjury } from './legendService';

export const applyDisciplineAfterMatch = (
  players: Player[],
  clubId: string,
  events: MatchEvent[],
  discipline: Record<string, PlayerDiscipline>,
) => {
  const nextDiscipline = { ...discipline };
  let updatedPlayers = [...players];

  events.forEach((event) => {
    if (!event.playerId || event.clubId !== clubId) return;
    if (event.type === 'yellow') {
      const flagged = updatedPlayers.find((p) => p.id === event.playerId);
      if (flagged && legendAvoidsDiscipline(flagged)) return;
      const current = nextDiscipline[event.playerId] ?? { yellows: 0, suspendedRounds: 0 };
      const yellows = current.yellows + 1;
      nextDiscipline[event.playerId] = {
        yellows: yellows >= 2 ? 0 : yellows,
        suspendedRounds: yellows >= 2 ? 1 : current.suspendedRounds,
      };
      if (yellows >= 2) {
        updatedPlayers = updatedPlayers.map((player) =>
          player.id === event.playerId ? { ...player, status: 'suspenso' as const } : player,
        );
      }
    }
    if (event.type === 'red') {
      const flagged = updatedPlayers.find((p) => p.id === event.playerId);
      if (flagged && legendAvoidsDiscipline(flagged)) return;
      nextDiscipline[event.playerId] = { yellows: 0, suspendedRounds: 2 };
      updatedPlayers = updatedPlayers.map((player) =>
        player.id === event.playerId ? { ...player, status: 'suspenso' as const } : player,
      );
    }
    if (event.type === 'injury') {
      updatedPlayers = updatedPlayers.map((player) => {
        if (player.id !== event.playerId) return player;
        if (legendAvoidsInjury(player)) return player;
        if (Math.random() >= 0.55) return player;
        return { ...player, status: 'lesionado' as const, energia: Math.max(20, player.energia - 25) };
      });
    }
  });

  return { players: updatedPlayers, discipline: nextDiscipline };
};

export const tickDisciplineRound = (players: Player[], discipline: Record<string, PlayerDiscipline>) => {
  const nextDiscipline: Record<string, PlayerDiscipline> = {};
  let updatedPlayers = players.map((player) => {
    const record = discipline[player.id];
    if (!record || record.suspendedRounds <= 0) return player;
    const roundsLeft = record.suspendedRounds - 1;
    if (roundsLeft <= 0) {
      return player.status === 'suspenso' ? { ...player, status: 'reserva' as const } : player;
    }
    nextDiscipline[player.id] = { ...record, suspendedRounds: roundsLeft };
    return player;
  });
  return { players: updatedPlayers, discipline: { ...discipline, ...nextDiscipline } };
};

export const warnExpiringContracts = (players: Player[], clubId: string) =>
  players.filter((player) => player.clubeId === clubId && player.contratoAnos <= 1 && !player.isLegend);
