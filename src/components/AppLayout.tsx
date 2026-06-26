import { ReactNode } from 'react';
import { useGameStore } from '../stores/gameStore';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const screen = useGameStore((state) => state.screen);

  return (
    <div className="app-theme min-h-screen overflow-x-hidden bg-app text-slate-100">
      <div className="flex min-w-0">
        <Sidebar />
        <div className="min-w-0 flex-1 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
          <TopBar />
          <main key={screen} className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
};
