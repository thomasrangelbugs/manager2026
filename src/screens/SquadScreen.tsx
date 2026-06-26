import { useMemo, useState } from 'react';
import { Filter, SortDesc } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { PlayerTable } from '../components/PlayerTable';
import { ScreenHeader } from '../components/ScreenHeader';
import { POSITION_ORDER } from '../data/names';
import { useGameStore } from '../stores/gameStore';
import type { Position } from '../types';

type SortKey = 'overall' | 'idade' | 'valorDeMercado' | 'salario';

export const SquadScreen = () => {
  const career = useGameStore((state) => state.career);
  const sellPlayer = useGameStore((state) => state.sellPlayer);
  const [position, setPosition] = useState<Position | 'Todos'>('Todos');
  const [sort, setSort] = useState<SortKey>('overall');
  if (!career) return null;

  const squad = career.players.filter((player) => player.clubeId === career.clubId);
  const filtered = useMemo(
    () =>
      squad
        .filter((player) => position === 'Todos' || player.posicao === position)
        .sort((a, b) => (sort === 'idade' ? a.idade - b.idade : b[sort] - a[sort])),
    [position, sort, squad],
  );

  return (
    <>
      <ScreenHeader
        title="Elenco"
        subtitle="Controle status, idade, contrato, moral, energia e valores de mercado."
      />
      <div className="mb-4 grid gap-3 rounded-xl border border-white/10 bg-white/[0.055] p-4 md:grid-cols-[1fr_16rem]">
        <label className="flex items-center gap-2">
          <Filter size={18} className="text-turf" />
          <select
            value={position}
            onChange={(event) => setPosition(event.target.value as Position | 'Todos')}
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-turf"
          >
            <option>Todos</option>
            {POSITION_ORDER.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <SortDesc size={18} className="text-gold" />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-turf"
          >
            <option value="overall">Overall</option>
            <option value="idade">Idade</option>
            <option value="valorDeMercado">Valor</option>
            <option value="salario">Salário</option>
          </select>
        </label>
      </div>
      <PlayerTable
        players={filtered}
        action={(player) => (
          <AnimatedButton variant="secondary" className="min-h-9 px-3 py-1 text-xs" onClick={() => sellPlayer(player.id)}>
            Vender
          </AnimatedButton>
        )}
      />
    </>
  );
};
