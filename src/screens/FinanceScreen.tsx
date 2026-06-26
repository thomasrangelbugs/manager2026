import { FinancePanel } from '../components/FinancePanel';
import { ScreenHeader } from '../components/ScreenHeader';
import { useGameStore } from '../stores/gameStore';

export const FinanceScreen = () => {
  const career = useGameStore((state) => state.career);
  if (!career) return null;

  return (
    <>
      <ScreenHeader title="Finanças" subtitle="Acompanhe caixa, folha salarial, bilheteria, patrocínio, premiações e alertas da diretoria." />
      <FinancePanel career={career} />
    </>
  );
};
