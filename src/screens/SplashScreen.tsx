import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Settings, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { HeroWallpaperRotator } from '../components/HeroWallpaperRotator';
import { Modal } from '../components/Modal';
import { useGameStore } from '../stores/gameStore';

export const SplashScreen = () => {
  const [creditsOpen, setCreditsOpen] = useState(false);
  const bootstrapped = useGameStore((state) => state.bootstrapped);
  const setScreen = useGameStore((state) => state.setScreen);
  const continueCareer = useGameStore((state) => state.continueCareer);

  return (
    <div className="stadium-hero relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <HeroWallpaperRotator />
      <div className="particles z-[2] opacity-40" />
      <div className="hero-tunnel hero-tunnel--splash absolute inset-0 z-[2]" />
      <main className="relative z-10 flex min-h-screen items-center px-4 py-8 pb-28 sm:px-5 sm:py-10 sm:pb-10">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto grid w-full max-w-7xl gap-7 lg:grid-cols-[1fr_25rem] lg:items-end"
        >
          <div className="min-w-0 pb-2 lg:pb-10">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-turf/30 bg-slate-950/45 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-turf shadow-glow backdrop-blur"
            >
              <Sparkles size={16} />
              football career simulator
            </motion.div>
            <div className="flex items-center gap-4">
              <div className="thunder-mark hidden sm:grid">
                <Zap size={38} />
              </div>
              <h1 className="max-w-5xl break-words font-display text-4xl font-black leading-[0.9] text-white sm:text-6xl lg:text-7xl">
                MANAGER 2026
              </h1>
            </div>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Assuma clubes reais do Brasileirão, controle tática, mercado e vestiário, e viva partidas simuladas com clima de estádio.
            </p>
            <div className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
              <HeroPill label="Modo carreira" value="Temporadas" />
              <HeroPill label="Motor de jogo" value="Ao vivo" />
              <HeroPill label="Save" value="Navegador" />
            </div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-white/10 bg-slate-950/72 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 overflow-hidden rounded-xl border border-gold/20 bg-gradient-to-br from-gold/18 via-white/[0.06] to-turf/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">edição browser</p>
                  <h2 className="mt-1 font-display text-3xl font-black text-white">Seu banco espera</h2>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-turf text-slate-950 shadow-glow">
                  <Crown size={26} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-300">
                <span className="rounded-lg bg-slate-950/55 px-2 py-2">Tática</span>
                <span className="rounded-lg bg-slate-950/55 px-2 py-2">Mercado</span>
                <span className="rounded-lg bg-slate-950/55 px-2 py-2">Títulos</span>
              </div>
            </div>
            <div className="grid gap-3">
              <AnimatedButton icon={<Trophy size={18} />} onClick={() => setScreen('careerSetup')}>
                Nova carreira
              </AnimatedButton>
              <AnimatedButton variant="gold" icon={<Users size={18} />} onClick={continueCareer} disabled={!bootstrapped}>
                Continuar
              </AnimatedButton>
              <AnimatedButton variant="secondary" icon={<Settings size={18} />} onClick={() => setScreen('settings')}>
                Configurações
              </AnimatedButton>
              <AnimatedButton variant="ghost" onClick={() => setCreditsOpen(true)}>
                Créditos
              </AnimatedButton>
            </div>
          </motion.aside>
        </motion.section>
      </main>
      <Modal open={creditsOpen} title="Créditos" onClose={() => setCreditsOpen(false)}>
        <p className="text-sm leading-relaxed text-slate-300">
          THOR MANAGER FOOTBALL usa clubes brasileiros, nomes reais de jogadores e uma simulação própria feita em React, Vite, TypeScript, Tailwind, Framer Motion e Zustand.
        </p>
      </Modal>
    </div>
  );
};

const HeroPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4 shadow-xl backdrop-blur">
    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-1 font-display text-2xl font-black text-white">{value}</p>
  </div>
);
