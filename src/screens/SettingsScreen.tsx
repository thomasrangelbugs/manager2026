import { useRef, useState } from 'react';
import { Download, RotateCcw, Upload, Volume2, VolumeX } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ScreenHeader } from '../components/ScreenHeader';
import { useGameStore } from '../stores/gameStore';

export const SettingsScreen = () => {
  const settings = useGameStore((state) => state.settings);
  const career = useGameStore((state) => state.career);
  const setScreen = useGameStore((state) => state.setScreen);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const deleteCareer = useGameStore((state) => state.deleteCareer);
  const exportSave = useGameStore((state) => state.exportSave);
  const importSave = useGameStore((state) => state.importSave);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <ScreenHeader title="Configurações" subtitle="Áudio, animações, tema, velocidade padrão e reset de carreira." />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <h2 className="font-display text-2xl font-black text-white">Áudio</h2>
          <Range label="Música" value={settings.musicVolume} onChange={(value) => updateSettings({ musicVolume: value })} />
          <Range label="Efeitos" value={settings.effectsVolume} onChange={(value) => updateSettings({ effectsVolume: value })} />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <AnimatedButton variant={settings.muteMusic ? 'danger' : 'secondary'} icon={settings.muteMusic ? <VolumeX size={18} /> : <Volume2 size={18} />} onClick={() => updateSettings({ muteMusic: !settings.muteMusic })}>
              Música {settings.muteMusic ? 'mutada' : 'ativa'}
            </AnimatedButton>
            <AnimatedButton variant={settings.muteEffects ? 'danger' : 'secondary'} icon={settings.muteEffects ? <VolumeX size={18} /> : <Volume2 size={18} />} onClick={() => updateSettings({ muteEffects: !settings.muteEffects })}>
              Efeitos {settings.muteEffects ? 'mutados' : 'ativos'}
            </AnimatedButton>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <h2 className="font-display text-2xl font-black text-white">Jogo</h2>
          <div className="mt-4 grid gap-3">
            <Toggle label="Animações" enabled={settings.animations} onClick={() => updateSettings({ animations: !settings.animations })} />
            <div>
              <p className="mb-2 text-sm font-bold text-slate-300">Tema</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => updateSettings({ theme: 'dark' })} className={`rounded-lg border px-4 py-3 font-bold ${settings.theme === 'dark' ? 'border-turf bg-turf text-slate-950' : 'border-white/10 bg-slate-950 text-slate-300'}`}>Escuro</button>
                <button type="button" onClick={() => updateSettings({ theme: 'light' })} className={`rounded-lg border px-4 py-3 font-bold ${settings.theme === 'light' ? 'border-turf bg-turf text-slate-950' : 'border-white/10 bg-slate-950 text-slate-300'}`}>Claro</button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-300">Velocidade padrão</p>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((value) => (
                  <button key={value} type="button" onClick={() => updateSettings({ defaultSimulationSpeed: value as 1 | 2 })} className={`rounded-lg border px-4 py-3 font-bold ${settings.defaultSimulationSpeed === value ? 'border-gold bg-gold text-slate-950' : 'border-white/10 bg-slate-950 text-slate-300'}`}>
                    {value}x
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <AnimatedButton variant="secondary" icon={<Download size={18} />} onClick={exportSave} disabled={!career}>
                Exportar save
              </AnimatedButton>
              <AnimatedButton variant="secondary" icon={<Upload size={18} />} onClick={() => fileRef.current?.click()} disabled={!career}>
                Importar save
              </AnimatedButton>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importSave(file);
                event.target.value = '';
              }}
            />
            <AnimatedButton variant="danger" icon={<RotateCcw size={18} />} onClick={() => setConfirmOpen(true)} disabled={!career}>
              Resetar carreira
            </AnimatedButton>
            {!career ? (
              <AnimatedButton variant="secondary" onClick={() => setScreen('splash')}>
                Voltar
              </AnimatedButton>
            ) : null}
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Apagar carreira?"
        message="Essa ação remove o save local desta carreira."
        confirmLabel="Apagar"
        danger
        onConfirm={deleteCareer}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

const Range = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => (
  <label className="mt-4 block">
    <div className="mb-2 flex justify-between text-sm font-bold text-slate-300">
      <span>{label}</span>
      <span>{Math.round(value * 100)}%</span>
    </div>
    <input type="range" min={0} max={1} step={0.05} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-emerald-400" />
  </label>
);

const Toggle = ({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-left">
    <span className="font-bold text-white">{label}</span>
    <span className={`h-7 w-12 rounded-full p-1 transition ${enabled ? 'bg-turf' : 'bg-slate-700'}`}>
      <span className={`block h-5 w-5 rounded-full bg-white transition ${enabled ? 'translate-x-5' : ''}`} />
    </span>
  </button>
);
