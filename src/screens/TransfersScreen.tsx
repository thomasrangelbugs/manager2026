import { useMemo, useState } from 'react';
import { GitCompare, HandCoins, Search, X } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { PlayerTable } from '../components/PlayerTable';
import { ScreenHeader } from '../components/ScreenHeader';
import { POSITION_ORDER } from '../data/names';
import { useGameStore } from '../stores/gameStore';
import type { Player, Position } from '../types';
import { currency } from '../utils/format';

const POSITIONS: Array<Position | 'Todos'> = ['Todos', ...POSITION_ORDER];

export const TransfersScreen = () => {
  const career = useGameStore((state) => state.career);
  const buyPlayer = useGameStore((state) => state.buyPlayer);
  const loanPlayer = useGameStore((state) => state.loanPlayer);
  const sellPlayer = useGameStore((state) => state.sellPlayer);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<Position | 'Todos'>('Todos');
  const [maxAge, setMaxAge] = useState(35);
  const [minOverall, setMinOverall] = useState(55);
  const [maxValue, setMaxValue] = useState(120);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  if (!career) return null;

  const market = useMemo(
    () =>
      career.players
        .filter((player) => player.clubeId !== career.clubId && !player.isLegend)
        .filter((player) => player.nome.toLowerCase().includes(search.toLowerCase()))
        .filter((player) => position === 'Todos' || player.posicao === position)
        .filter((player) => player.idade <= maxAge)
        .filter((player) => player.overall >= minOverall)
        .filter((player) => player.valorDeMercado <= maxValue * 1000000)
        .sort((a, b) => b.overall - a.overall)
        .slice(0, 50),
    [career.clubId, career.players, maxAge, maxValue, minOverall, position, search],
  );
  const legends = useMemo(
    () =>
      career.players
        .filter((player) => player.isLegend && player.clubeId !== career.clubId)
        .filter((player) => player.nome.toLowerCase().includes(search.toLowerCase()))
        .filter((player) => position === 'Todos' || player.posicao === position)
        .sort((a, b) => b.overall - a.overall),
    [career.clubId, career.players, position, search],
  );
  const squad = career.players.filter((player) => player.clubeId === career.clubId).sort((a, b) => b.valorDeMercado - a.valorDeMercado);
  const playerA = career.players.find((player) => player.id === compareA);
  const playerB = career.players.find((player) => player.id === compareB);

  const toggleCompare = (playerId: string) => {
    if (compareA === playerId) {
      setCompareA(compareB);
      setCompareB(null);
      return;
    }
    if (compareB === playerId) {
      setCompareB(null);
      return;
    }
    if (!compareA) {
      setCompareA(playerId);
      return;
    }
    if (!compareB) {
      setCompareB(playerId);
      return;
    }
    setCompareA(playerId);
    setCompareB(null);
  };

  return (
    <>
      <ScreenHeader
        title="Transferências"
        subtitle={`Caixa disponível: ${currency(career.finance.orcamento)}. Negociações têm chance de sucesso conforme dificuldade, moral e orçamento.`}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {POSITIONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPosition(item)}
            className={`rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
              position === item ? 'border-turf bg-turf text-slate-950' : 'border-white/10 bg-slate-950/70 text-slate-300'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mb-5 grid gap-3 rounded-xl border border-white/10 bg-white/[0.055] p-3 sm:p-4 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_10rem_10rem]">
        <label className="flex items-center gap-2">
          <Search size={18} className="text-turf" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar jogador"
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-turf"
          />
        </label>
        <NumberFilter label="Idade máx" value={maxAge} setValue={setMaxAge} min={18} max={40} />
        <NumberFilter label="OVR mín" value={minOverall} setValue={setMinOverall} min={45} max={90} />
        <NumberFilter label="Valor mi" value={maxValue} setValue={setMaxValue} min={1} max={140} />
      </div>

      {(playerA || playerB) && (
        <section className="mb-5 rounded-xl border border-white/10 bg-white/[0.055] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-xl font-black text-white">
              <GitCompare size={20} className="text-turf" />
              Comparar jogadores
            </h2>
            <button
              type="button"
              onClick={() => {
                setCompareA(null);
                setCompareB(null);
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
              aria-label="Limpar comparação"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <CompareCard player={playerA} label="Jogador A" />
            <CompareCard player={playerB} label="Jogador B" />
          </div>
        </section>
      )}

      <div className="grid gap-6">
        <section>
          <h2 className="mb-1 font-display text-2xl font-black text-white">Lendas disponíveis</h2>
          <p className="mb-3 text-sm text-slate-400">
            OVR altíssimo e vantagens exclusivas em jogo: aura de time, menos lesão/suspensão, treino seguro e contrato eterno.
          </p>
          <PlayerTable
            players={legends}
            action={(player) => (
              <div className="flex flex-col gap-2">
                <AnimatedButton className="min-h-9 px-3 py-1 text-xs" icon={<HandCoins size={15} />} onClick={() => buyPlayer(player.id)}>
                  Comprar lenda
                </AnimatedButton>
                <CompareToggle playerId={player.id} compareA={compareA} compareB={compareB} onToggle={toggleCompare} />
              </div>
            )}
          />
        </section>
        <section>
          <h2 className="mb-3 font-display text-2xl font-black text-white">Mercado de jogadores</h2>
          <PlayerTable
            players={market}
            action={(player) => (
              <div className="flex flex-col gap-2">
                <AnimatedButton className="min-h-9 px-3 py-1 text-xs" icon={<HandCoins size={15} />} onClick={() => buyPlayer(player.id)}>
                  Comprar
                </AnimatedButton>
                <AnimatedButton variant="secondary" className="min-h-9 px-3 py-1 text-xs" onClick={() => loanPlayer(player.id)}>
                  Empréstimo
                </AnimatedButton>
                <CompareToggle playerId={player.id} compareA={compareA} compareB={compareB} onToggle={toggleCompare} />
              </div>
            )}
          />
        </section>
        <section>
          <h2 className="mb-3 font-display text-2xl font-black text-white">Vender jogador</h2>
          <PlayerTable
            players={squad.slice(0, 18)}
            action={(player) => (
              <AnimatedButton variant="danger" className="min-h-9 px-3 py-1 text-xs" onClick={() => sellPlayer(player.id)}>
                Vender
              </AnimatedButton>
            )}
          />
        </section>
      </div>
    </>
  );
};

const CompareToggle = ({
  playerId,
  compareA,
  compareB,
  onToggle,
}: {
  playerId: string;
  compareA: string | null;
  compareB: string | null;
  onToggle: (id: string) => void;
}) => {
  const active = compareA === playerId || compareB === playerId;
  return (
    <button
      type="button"
      onClick={() => onToggle(playerId)}
      className={`rounded-lg border px-2 py-1 text-[0.65rem] font-black uppercase ${
        active ? 'border-gold bg-gold/15 text-gold' : 'border-white/10 text-slate-400 hover:border-turf/40'
      }`}
    >
      {active ? 'Na comparação' : 'Comparar'}
    </button>
  );
};

const CompareCard = ({ player, label }: { player?: Player; label: string }) => {
  if (!player) {
    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-slate-950/40 p-4 text-sm text-slate-500">
        {label}: selecione um jogador no mercado.
      </div>
    );
  }
  const attrs = player.atributos;
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 font-display text-xl font-black text-white">
        {player.nome} <span className="text-turf">({player.overall} OVR)</span>
      </p>
      <p className="text-sm text-slate-400">
        {player.posicao} • {player.idade} anos • {currency(player.valorDeMercado)}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Stat label="Finalização" value={attrs.finalizacao} />
        <Stat label="Passe" value={attrs.passe} />
        <Stat label="Marcação" value={attrs.marcacao} />
        <Stat label="Velocidade" value={attrs.velocidade} />
        <Stat label="Físico" value={attrs.fisico} />
        <Stat label="Técnica" value={attrs.tecnica} />
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md bg-white/5 px-2 py-1.5">
    <p className="text-slate-500">{label}</p>
    <p className="font-black text-white">{value}</p>
  </div>
);

const NumberFilter = ({ label, value, setValue, min, max }: { label: string; value: number; setValue: (value: number) => void; min: number; max: number }) => (
  <label className="grid gap-1">
    <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(event) => setValue(Number(event.target.value))}
      className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-turf"
    />
  </label>
);
