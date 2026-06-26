import { AlertTriangle, Banknote, Coins, Landmark, ReceiptText } from 'lucide-react';
import type { Career } from '../types';
import { CLUBS } from '../data/clubs';
import { calculateWeeklyWages } from '../services/financeService';
import { currency } from '../utils/format';
import { StatCard } from './StatCard';

export const FinancePanel = ({ career }: { career: Career }) => {
  const club = CLUBS.find((item) => item.id === career.clubId);
  const wages = calculateWeeklyWages(career.players, career.clubId);
  const limit = club?.folhaSalarialLimite ?? 1;
  const overLimit = wages > limit;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Orçamento" value={currency(career.finance.orcamento)} icon={<Coins size={20} />} tone="green" />
        <StatCard title="Folha salarial" value={currency(wages)} detail={`Limite: ${currency(limit)}`} icon={<ReceiptText size={20} />} tone={overLimit ? 'rose' : 'blue'} />
        <StatCard title="Bilheteria" value={currency(career.finance.receitaBilheteria)} icon={<Banknote size={20} />} tone="gold" />
        <StatCard title="Patrocínio / prêmios" value={currency(career.finance.receitaPatrocinio + career.finance.premiacoes)} icon={<Landmark size={20} />} tone="neutral" />
      </div>
      {overLimit || career.finance.orcamento < 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 text-rose-100">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-bold">Alerta financeiro</p>
            <p className="text-sm text-rose-100/80">
              A diretoria pode bloquear transferências enquanto folha ou caixa estiverem fora do planejado.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
