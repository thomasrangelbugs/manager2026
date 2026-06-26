import type { Player } from '../types';
import { currency, positionColor } from '../utils/format';
import { PlayerCard, PlayerPortrait } from './PlayerCard';

type Props = {
  players: Player[];
  action?: (player: Player) => React.ReactNode;
};

export const PlayerTable = ({ players, action }: Props) => (
  <>
    <div className="grid gap-3 md:hidden">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} action={action?.(player)} />
      ))}
    </div>
    <div className="hidden overflow-x-auto rounded-xl border border-white/10 md:block">
      <table className="min-w-[58rem] w-full table-fixed border-collapse bg-white/[0.04] text-sm">
        <thead className="bg-slate-950/80 text-left text-xs uppercase tracking-[0.14em] text-slate-400">
          <tr>
            <th className="px-4 py-3">Jogador</th>
            <th className="w-20 px-3 py-3">Pos</th>
            <th className="w-20 px-3 py-3">Idade</th>
            <th className="w-20 px-3 py-3">OVR</th>
            <th className="w-20 px-3 py-3">POT</th>
            <th className="w-28 px-3 py-3">Moral</th>
            <th className="w-28 px-3 py-3">Energia</th>
            <th className="w-36 px-3 py-3">Valor</th>
            <th className="w-36 px-3 py-3">Salário</th>
            {action ? <th className="w-36 px-3 py-3">Ação</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {players.map((player) => (
            <tr key={player.id} className="hover:bg-white/[0.04]">
              <td className="min-w-0 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <PlayerPortrait player={player} size="sm" />
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate font-bold text-white">{player.nome}</p>
                      {player.isLegend ? (
                        <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-black uppercase text-slate-950">
                          Lenda
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-slate-400">{player.nacionalidade} • {player.status}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-black ring-1 ${positionColor(player.posicao)}`}>{player.posicao}</span>
              </td>
              <td className="px-3 py-3 text-slate-300">{player.idade}</td>
              <td className="px-3 py-3 font-black text-turf">{player.overall}</td>
              <td className="px-3 py-3 font-bold text-gold">{player.potencial}</td>
              <td className="px-3 py-3">{player.moral}%</td>
              <td className="px-3 py-3">{player.energia}%</td>
              <td className="px-3 py-3">{currency(player.valorDeMercado)}</td>
              <td className="px-3 py-3">{currency(player.salario)}</td>
              {action ? <td className="px-3 py-3">{action(player)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);
