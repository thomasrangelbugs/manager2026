import { LeagueTable } from '../components/LeagueTable';
import { ScreenHeader } from '../components/ScreenHeader';
import { sortTable } from '../services/seasonService';
import { useGameStore } from '../stores/gameStore';

export const TableScreen = () => {
  const career = useGameStore((state) => state.career);
  if (!career) return null;

  return (
    <>
      <ScreenHeader title="Tabela da Liga" subtitle={`Classificacao completa com ${career.leagueTable.length} clubes.`} />
      <LeagueTable table={sortTable(career.leagueTable)} selectedClubId={career.clubId} />
    </>
  );
};
