import {
  Building2,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Home,
  Landmark,
  Newspaper,
  PlayCircle,
  Radio,
  Repeat,
  Settings,
  Shield,
  Sprout,
  Star,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import type { Screen } from '../types';
import { useGameStore } from '../stores/gameStore';
import { ClubBadge } from './ClubBadge';
import { CLUBS } from '../data/clubs';

export const NAV_ITEMS: { screen: Screen; label: string; icon: typeof Home }[] = [
  { screen: 'dashboard', label: 'Painel', icon: Home },
  { screen: 'squad', label: 'Elenco', icon: Users },
  { screen: 'tactics', label: 'Tatica', icon: ClipboardList },
  { screen: 'calendar', label: 'Calendario', icon: CalendarDays },
  { screen: 'match', label: 'Jogo', icon: PlayCircle },
  { screen: 'transfers', label: 'Mercado', icon: Repeat },
  { screen: 'training', label: 'Treino', icon: Dumbbell },
  { screen: 'radio', label: 'Radio', icon: Radio },
  { screen: 'finance', label: 'Financas', icon: Wallet },
  { screen: 'competitions', label: 'Competicoes', icon: Trophy },
  { screen: 'table', label: 'Tabela', icon: Landmark },
  { screen: 'news', label: 'Noticias', icon: Newspaper },
  { screen: 'board', label: 'Diretoria', icon: Building2 },
  { screen: 'academy', label: 'Base', icon: Sprout },
  { screen: 'hall', label: 'Historico', icon: Star },
  { screen: 'settings', label: 'Ajustes', icon: Settings },
];

export const Sidebar = () => {
  const career = useGameStore((state) => state.career);
  const screen = useGameStore((state) => state.screen);
  const setScreen = useGameStore((state) => state.setScreen);
  const club = CLUBS.find((item) => item.id === career?.clubId);

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950/82 p-4 backdrop-blur-xl lg:sticky lg:top-0 lg:block">
      <div className="mb-6 flex items-center gap-3">
        <ClubBadge club={club} />
        <div className="min-w-0">
          <p className="font-display text-lg font-black uppercase text-white">THOR Manager</p>
          <p className="truncate text-sm text-slate-400">{club?.nome ?? 'Sem clube'}</p>
        </div>
      </div>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = screen === item.screen;
          return (
            <button
              key={item.screen}
              type="button"
              onClick={() => setScreen(item.screen)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition ${
                active ? 'bg-turf text-slate-950 shadow-glow' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Shield size={16} className="text-gold" />
          Temporada {career?.season ?? '----'}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Brasileirao e Gauchao com elencos do manager em <span className="text-slate-200">src/data</span>.
        </p>
      </div>
    </aside>
  );
};
