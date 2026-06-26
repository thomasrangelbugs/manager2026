import { AlertTriangle, ClipboardCheck, Star } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { FormationPitch } from '../components/FormationPitch';
import { ScreenHeader } from '../components/ScreenHeader';
import { FORMATION_SLOTS, calculateLineupStrength } from '../services/matchEngine';
import { useGameStore } from '../stores/gameStore';
import type { Formation, TacticalStyle } from '../types';

const formations = Object.keys(FORMATION_SLOTS) as Formation[];
const styles: TacticalStyle[] = ['Equilibrado', 'Ofensivo', 'Defensivo', 'Contra-ataque', 'Posse de bola', 'Pressão alta'];

export const TacticsScreen = () => {
  const career = useGameStore((state) => state.career);
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const setFormation = useGameStore((state) => state.setFormation);
  const setTacticalStyle = useGameStore((state) => state.setTacticalStyle);
  const assignPlayerToSlot = useGameStore((state) => state.assignPlayerToSlot);
  const autoFillLineup = useGameStore((state) => state.autoFillLineup);
  const setSpecialRole = useGameStore((state) => state.setSpecialRole);
  if (!career) return null;

  const squad = career.players.filter((player) => player.clubeId === career.clubId);
  const selectedIds = Object.values(career.tactic.lineup).filter(Boolean) as string[];
  const selectedSet = new Set(selectedIds);
  const strength = calculateLineupStrength(career.tactic, squad);
  const empty = selectedIds.length < 11;
  const unavailable = squad.filter((player) => player.status === 'lesionado' || player.status === 'suspenso');
  const benchedLegends = squad.filter(
    (player) => player.isLegend && !selectedSet.has(player.id) && player.status !== 'lesionado' && player.status !== 'suspenso',
  );

  return (
    <>
      <ScreenHeader
        title="Taticas e escalacao"
        subtitle="Selecione jogadores no campo, ajuste formacao, estilo e bolas paradas."
        action={
          <AnimatedButton variant="gold" icon={<ClipboardCheck size={18} />} onClick={autoFillLineup}>
            Auto escalar
          </AnimatedButton>
        }
      />
      {unavailable.length ? (
        <div className="mb-4 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4">
          <p className="text-sm font-bold text-rose-100">Indisponiveis para escalacao</p>
          <ul className="mt-2 flex flex-wrap gap-2 text-xs text-rose-50">
            {unavailable.map((player) => (
              <li key={player.id} className="rounded-full border border-rose-300/30 bg-rose-500/10 px-2.5 py-1 font-bold">
                {player.nome} ({player.status === 'lesionado' ? 'lesionado' : 'suspenso'})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {benchedLegends.length && !settings.hideLegendLineupWarning ? (
        <div className="mb-4 rounded-xl border border-gold/35 bg-gold/10 p-4">
          <div className="flex gap-3">
            <Star size={18} className="mt-0.5 shrink-0 text-gold" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-amber-100">
                {benchedLegends.length === 1 ? 'Lenda fora da escalacao' : 'Lendas fora da escalacao'}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                {benchedLegends.map((player) => player.nome).join(', ')} {benchedLegends.length === 1 ? 'esta' : 'estao'} no elenco,
                mas nao no time titular.
              </p>
              <label className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#23d38d]"
                  onChange={(event) => updateSettings({ hideLegendLineupWarning: event.target.checked })}
                />
                Nao mostrar novamente
              </label>
            </div>
          </div>
        </div>
      ) : null}
      <div className="layout-two-col">
        <FormationPitch tactic={career.tactic} squad={squad} onAssign={assignPlayerToSlot} />
        <aside className="space-y-4">
          <Panel title="Formacao">
            <div className="grid grid-cols-2 gap-2">
              {formations.map((formation) => (
                <button
                  key={formation}
                  type="button"
                  onClick={() => setFormation(formation)}
                  className={`rounded-lg border px-3 py-2 text-sm font-black ${
                    career.tactic.formation === formation ? 'border-turf bg-turf text-slate-950' : 'border-white/10 bg-slate-950 text-slate-300'
                  }`}
                >
                  {formation}
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="Estilo de jogo">
            <div className="grid gap-2">
              {styles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setTacticalStyle(style)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-bold ${
                    career.tactic.style === style ? 'border-gold bg-gold text-slate-950' : 'border-white/10 bg-slate-950 text-slate-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="Papeis">
            <RoleSelect label="Capitao" value={career.tactic.captainId} onChange={(id) => setSpecialRole('captainId', id)} squad={squad} />
            <RoleSelect label="Faltas" value={career.tactic.freeKickTakerId} onChange={(id) => setSpecialRole('freeKickTakerId', id)} squad={squad} />
            <RoleSelect label="Penaltis" value={career.tactic.penaltyTakerId} onChange={(id) => setSpecialRole('penaltyTakerId', id)} squad={squad} />
          </Panel>
          <Panel title="Forca titular">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Metric label="Geral" value={Math.round(strength.overall)} />
              <Metric label="Ataque" value={Math.round(strength.attack)} />
              <Metric label="Defesa" value={Math.round(strength.defense)} />
              <Metric label="Energia" value={`${Math.round(strength.energy)}%`} />
            </div>
            {empty ? <p className="mt-3 text-sm text-amber-200">Ha posicao vazia. O jogo nao comeca sem 11 jogadores.</p> : null}
            {benchedLegends.length ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-amber-100">
                <AlertTriangle size={15} className="shrink-0" />
                {benchedLegends.length} lenda(s) no banco.
              </p>
            ) : null}
          </Panel>
        </aside>
      </div>
    </>
  );
};

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
    <h2 className="mb-3 font-display text-xl font-black text-white">{title}</h2>
    {children}
  </section>
);

const RoleSelect = ({
  label,
  value,
  onChange,
  squad,
}: {
  label: string;
  value: string | null;
  onChange: (id: string) => void;
  squad: { id: string; nome: string; posicao: string; overall: number }[];
}) => (
  <label className="mb-3 block">
    <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</span>
    <select value={value ?? ''} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-turf">
      {squad.map((player) => (
        <option key={player.id} value={player.id}>
          {player.posicao} {player.nome} ({player.overall})
        </option>
      ))}
    </select>
  </label>
);

const Metric = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-lg bg-slate-950/60 p-3">
    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className="mt-1 font-display text-2xl font-black text-white">{value}</p>
  </div>
);
