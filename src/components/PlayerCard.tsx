import { useEffect, useState } from 'react';
import { Battery, CircleDollarSign, Star } from 'lucide-react';
import type { Player } from '../types';
import { LEGEND_PERKS } from '../services/legendService';
import { compactCurrency, currency, positionColor } from '../utils/format';

type Props = {
  player: Player;
  action?: React.ReactNode;
};

export const PlayerCard = ({ player, action }: Props) => (
  <article className="rounded-xl border border-white/10 bg-white/[0.055] p-4 shadow-lg">
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 gap-3">
        <PlayerPortrait player={player} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-1 text-xs font-black ring-1 ${positionColor(player.posicao)}`}>
              {player.posicao}
            </span>
            {player.isLegend ? <span className="rounded-full bg-gold px-2 py-1 text-xs font-black text-slate-950">Lenda</span> : null}
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-slate-300">{player.status}</span>
          </div>
          <h3 className="mt-3 break-words font-display text-xl font-black leading-tight text-white">{player.nome}</h3>
          <p className="break-words text-sm leading-tight text-slate-400">
            {player.idade} anos • {player.nacionalidade}
          </p>
        </div>
      </div>
      <div className="grid h-14 w-14 place-items-center rounded-lg bg-turf text-2xl font-black text-slate-950">
        {player.overall}
      </div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
      <InfoPill icon={<Star size={15} />} label="Potencial" value={player.potencial} />
      <InfoPill icon={<Battery size={15} />} label="Energia" value={`${player.energia}%`} />
      <InfoPill icon={<CircleDollarSign size={15} />} label="Valor" value={compactCurrency(player.valorDeMercado)} />
      <InfoPill icon={<CircleDollarSign size={15} />} label="Salário" value={currency(player.salario)} />
    </div>
    {player.isLegend ? (
      <ul className="mt-3 space-y-1 border-t border-gold/20 pt-3 text-xs text-gold/90">
        {LEGEND_PERKS.map((perk) => (
          <li key={perk} className="flex gap-2">
            <span className="text-gold">•</span>
            <span>{perk}</span>
          </li>
        ))}
      </ul>
    ) : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </article>
);

export const PlayerPortrait = ({ player, size = 'md' }: { player: Player; size?: 'sm' | 'md' }) => {
  const [failed, setFailed] = useState(false);
  const initials = player.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const showImage = Boolean(player.portraitUrl && !failed);
  const sizeClass = size === 'sm' ? 'h-10 w-10 text-xs' : 'h-16 w-16 text-sm';

  useEffect(() => {
    setFailed(false);
  }, [player.id, player.portraitUrl]);

  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-white/15 bg-slate-900 font-black text-gold shadow-lg ${sizeClass}`}>
      {showImage ? (
        <img
          src={player.portraitUrl}
          alt={`Foto de ${player.nome}`}
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

const InfoPill = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="rounded-lg bg-slate-950/45 px-3 py-2">
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <span className="text-gold">{icon}</span>
      {label}
    </div>
    <p className="mt-1 break-words font-bold leading-tight text-white">{value}</p>
  </div>
);
