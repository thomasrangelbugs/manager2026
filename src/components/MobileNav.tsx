import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontal, X } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import type { Screen } from '../types';
import { NAV_ITEMS } from './Sidebar';

const primaryScreens: Screen[] = ['dashboard', 'squad', 'tactics', 'match', 'transfers'];

export const MobileNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const screen = useGameStore((state) => state.screen);
  const setScreen = useGameStore((state) => state.setScreen);
  const primaryItems = NAV_ITEMS.filter((item) => primaryScreens.includes(item.screen));
  const secondaryItems = NAV_ITEMS.filter((item) => !primaryScreens.includes(item.screen));
  const menuActive = secondaryItems.some((item) => item.screen === screen);

  return (
    <>
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-x-3 z-50 max-h-[68vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/96 p-3 shadow-2xl backdrop-blur-xl lg:hidden"
            style={{ bottom: 'calc(4.8rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="font-display text-xl font-black text-white">Menu do clube</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = screen === item.screen || (screen === 'postMatch' && item.screen === 'dashboard');
                return (
                  <button
                    key={item.screen}
                    type="button"
                    onClick={() => {
                      setScreen(item.screen);
                      setMenuOpen(false);
                    }}
                    className={`flex min-h-12 items-center gap-2 rounded-lg px-3 text-left text-sm font-bold ${
                      active ? 'bg-turf text-slate-950' : 'bg-white/[0.06] text-slate-200'
                    }`}
                  >
                    <Icon size={17} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-white/10 bg-slate-950/92 px-1 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl lg:hidden">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const active = screen === item.screen || (screen === 'postMatch' && item.screen === 'dashboard');
          return (
            <button
              key={item.screen}
              type="button"
              onClick={() => {
                setScreen(item.screen);
                setMenuOpen(false);
              }}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[0.68rem] font-bold ${
                active ? 'bg-turf text-slate-950' : 'text-slate-300'
              }`}
            >
              <Icon size={18} />
              <span className="leading-none">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[0.68rem] font-bold ${
            menuActive || menuOpen ? 'bg-turf text-slate-950' : 'text-slate-300'
          }`}
        >
          <MoreHorizontal size={19} />
          <span className="leading-none">Mais</span>
        </button>
      </nav>
    </>
  );
};
