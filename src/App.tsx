import { useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { ToastNotification } from './components/ToastNotification';
import { AcademyScreen } from './screens/AcademyScreen';
import { BoardScreen } from './screens/BoardScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { CareerSetupScreen } from './screens/CareerSetupScreen';
import { CompetitionsScreen } from './screens/CompetitionsScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { FinanceScreen } from './screens/FinanceScreen';
import { HallScreen } from './screens/HallScreen';
import { AchievementModal } from './components/AchievementModal';
import { MatchScreen } from './screens/MatchScreen';
import { PostMatchScreen } from './screens/PostMatchScreen';
import { NewsScreen } from './screens/NewsScreen';
import { RadioScreen } from './screens/RadioScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SplashScreen } from './screens/SplashScreen';
import { SquadScreen } from './screens/SquadScreen';
import { TableScreen } from './screens/TableScreen';
import { TacticsScreen } from './screens/TacticsScreen';
import { TrainingScreen } from './screens/TrainingScreen';
import { TransfersScreen } from './screens/TransfersScreen';
import { useGameStore } from './stores/gameStore';
import type { Screen } from './types';

const screenMap: Record<Exclude<Screen, 'splash' | 'careerSetup'>, JSX.Element> = {
  dashboard: <DashboardScreen />,
  squad: <SquadScreen />,
  tactics: <TacticsScreen />,
  calendar: <CalendarScreen />,
  match: <MatchScreen />,
  postMatch: <PostMatchScreen />,
  transfers: <TransfersScreen />,
  training: <TrainingScreen />,
  radio: <RadioScreen />,
  finance: <FinanceScreen />,
  competitions: <CompetitionsScreen />,
  table: <TableScreen />,
  news: <NewsScreen />,
  board: <BoardScreen />,
  academy: <AcademyScreen />,
  settings: <SettingsScreen />,
  hall: <HallScreen />,
};

export default function App() {
  const screen = useGameStore((state) => state.screen);
  const career = useGameStore((state) => state.career);
  const theme = useGameStore((state) => state.settings.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  if (screen === 'splash') {
    return (
      <>
        <SplashScreen />
        <ToastNotification />
      </>
    );
  }

  if (screen === 'careerSetup') {
    return (
      <>
        <CareerSetupScreen />
        <ToastNotification />
      </>
    );
  }

  if (!career) {
    return (
      <div className="app-theme min-h-screen bg-app px-4 py-6 text-slate-100 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <SettingsScreen />
        </div>
        <ToastNotification />
      </div>
    );
  }

  return (
    <>
      <AppLayout>{screenMap[screen]}</AppLayout>
      <AchievementModal />
      <ToastNotification />
    </>
  );
}
