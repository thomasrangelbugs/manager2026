import { AlertTriangle } from 'lucide-react';
import type { FormationSlot, Player, Tactic } from '../types';
import { getFormationSlots } from '../stores/gameStore';
import { adjustedPlayerOverall, evaluatePositionFit } from '../services/matchEngine';

type Props = {
  tactic: Tactic;
  squad: Player[];
  onAssign: (slotId: string, playerId: string | null) => void;
};

export const FormationPitch = ({ tactic, squad, onAssign }: Props) => {
  const slots = getFormationSlots(tactic.formation);
  const emptySlots = slots.filter((slot) => !tactic.lineup[slot.id]).length;

  return (
    <div className="min-w-0 space-y-3">
      {emptySlots ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          <AlertTriangle size={16} />
          {emptySlots} posicao{emptySlots > 1 ? 'es' : ''} vazia{emptySlots > 1 ? 's' : ''}.
        </div>
      ) : null}
      <div className="pitch relative mx-auto aspect-[3/4] w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
        <div className="absolute inset-x-[10%] top-[50%] h-px bg-white/25" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
        <div className="absolute inset-x-[24%] bottom-0 h-[17%] rounded-t-3xl border border-b-0 border-white/25" />
        <div className="absolute inset-x-[24%] top-0 h-[17%] rounded-b-3xl border border-t-0 border-white/25" />
        {slots.map((slot) => (
          <SlotMarker key={slot.id} slot={slot} tactic={tactic} squad={squad} onAssign={onAssign} />
        ))}
      </div>
      <div className="grid gap-2 sm:hidden">
        {slots.map((slot) => (
          <MobileSlotSelect key={slot.id} slot={slot} tactic={tactic} squad={squad} onAssign={onAssign} />
        ))}
      </div>
    </div>
  );
};

const SlotMarker = ({
  slot,
  tactic,
  squad,
  onAssign,
}: {
  slot: FormationSlot;
  tactic: Tactic;
  squad: Player[];
  onAssign: (slotId: string, playerId: string | null) => void;
}) => {
  const selectedId = tactic.lineup[slot.id] ?? '';
  const selected = squad.find((player) => player.id === selectedId);
  const fit = selected ? evaluatePositionFit(slot, selected) : null;
  const adjustedOverall = selected ? adjustedPlayerOverall(slot, selected) : null;
  const isOutOfPosition = Boolean(fit && fit.modifier < 0);

  return (
    <div
      className="absolute w-[4.6rem] -translate-x-1/2 -translate-y-1/2 sm:w-[28%]"
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
    >
      <div
        className={`rounded-xl border bg-slate-950/78 p-1.5 text-center shadow-xl backdrop-blur sm:p-2 ${
          isOutOfPosition ? 'border-amber-300/45' : 'border-white/15'
        }`}
      >
        <div className="text-[0.62rem] font-black uppercase leading-none tracking-wide text-turf sm:mb-1 sm:text-[0.68rem]">{slot.label}</div>
        <div className="mt-1 sm:hidden">
          <p className="truncate rounded-md bg-slate-900 px-1 py-0.5 text-[0.58rem] font-black leading-tight text-white">
            {selected ? shortName(selected.nome) : 'Vazio'}
          </p>
          <p className={`mt-0.5 text-[0.56rem] font-bold leading-tight ${isOutOfPosition ? 'text-amber-200' : 'text-slate-300'}`}>
            {selected && adjustedOverall !== null ? `${adjustedOverall} | ${selected.energia}%` : 'Toque abaixo'}
          </p>
        </div>
        <div className="hidden sm:block">
          <select
            value={selectedId}
            onChange={(event) => onAssign(slot.id, event.target.value || null)}
            className={`w-full rounded-md border bg-slate-900 px-1 py-1 text-center text-[0.68rem] font-bold text-white outline-none focus:border-turf ${
              isOutOfPosition ? 'border-amber-300/45' : 'border-white/10'
            }`}
            title={`Selecionar ${slot.label}`}
          >
            <PlayerOptions slot={slot} squad={squad} />
          </select>
          <div className={`mt-1 truncate text-[0.64rem] leading-tight ${isOutOfPosition ? 'text-amber-200' : 'text-slate-400'}`}>
            {selected && adjustedOverall !== null
              ? `${adjustedOverall} OVR${isOutOfPosition ? ` - ${fit?.label}` : ''} - ${selected.energia}%${
                  selected.status === 'lesionado' ? ' - lesionado' : selected.status === 'suspenso' ? ' - suspenso' : ''
                }`
              : 'Selecione'}
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileSlotSelect = ({
  slot,
  tactic,
  squad,
  onAssign,
}: {
  slot: FormationSlot;
  tactic: Tactic;
  squad: Player[];
  onAssign: (slotId: string, playerId: string | null) => void;
}) => {
  const selectedId = tactic.lineup[slot.id] ?? '';
  const selected = squad.find((player) => player.id === selectedId);
  const adjustedOverall = selected ? adjustedPlayerOverall(slot, selected) : null;

  return (
    <label className="grid grid-cols-[3.4rem_minmax(0,1fr)] items-center gap-2 rounded-lg border border-white/10 bg-slate-950/55 p-2">
      <span className="rounded-md bg-turf/15 px-2 py-2 text-center text-xs font-black text-turf">{slot.label}</span>
      <div className="min-w-0">
        <select
          value={selectedId}
          onChange={(event) => onAssign(slot.id, event.target.value || null)}
          className="w-full rounded-md border border-white/10 bg-slate-900 px-2 py-2 text-sm font-bold text-white outline-none focus:border-turf"
          title={`Selecionar ${slot.label}`}
        >
          <PlayerOptions slot={slot} squad={squad} />
        </select>
        <p className="mt-1 truncate text-xs text-slate-400">
          {selected && adjustedOverall !== null ? `${adjustedOverall} OVR - energia ${selected.energia}%` : 'Selecione um jogador'}
        </p>
      </div>
    </label>
  );
};

const PlayerOptions = ({ slot, squad }: { slot: FormationSlot; squad: Player[] }) => (
  <>
    <option value="">Vazio</option>
    {squad.map((player) => {
      const unavailable = player.status === 'lesionado' || player.status === 'suspenso';
      const optionOverall = adjustedPlayerOverall(slot, player);
      const suffix = optionOverall === player.overall ? player.overall : `${player.overall}->${optionOverall}`;
      const statusLabel = player.status === 'lesionado' ? ' - lesionado' : player.status === 'suspenso' ? ' - suspenso' : '';
      const legendLabel = player.isLegend ? ' - Lenda' : '';
      return (
        <option key={player.id} value={player.id} disabled={unavailable}>
          {player.posicao} {player.nome} ({suffix}){legendLabel}{statusLabel}
        </option>
      );
    })}
  </>
);

const shortName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] ?? name;
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
};
