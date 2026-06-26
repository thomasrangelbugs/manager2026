import { CalendarDays, Coins, HeartPulse, ShieldCheck } from 'lucide-react';
import { CLUBS } from '../data/clubs';
import { useGameStore } from '../stores/gameStore';
import { currency, formatDate } from '../utils/format';
import { BrandMark } from './BrandMark';
import { ClubBadge } from './ClubBadge';

export const TopBar = () => {
  const career = useGameStore((state) => state.career);
  const club = CLUBS.find((item) => item.id === career?.clubId);

  if (!career) return null;

  const pills = [
    { icon: <Coins size={15} />, label: currency(career.finance.orcamento) },
    { icon: <ShieldCheck size={15} />, label: `${career.boardConfidence}% diretoria` },
    { icon: <HeartPulse size={15} />, label: `${career.fanMorale}% torcida` },
    { icon: <CalendarDays size={15} />, label: formatDate(career.currentDate) },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <BrandMark compact />
            </div>
            <ClubBadge club={club} size="sm" />
            <div className="min-w-0">
              <p className="break-words font-display text-base font-black leading-tight text-white sm:text-xl">{club?.nome}</p>
              <p className="break-words text-[0.65rem] leading-tight text-slate-400 sm:text-xs">
                {career.manager.nome} • {club?.estadio}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            {pills.map((pill) => (
              <TopPill key={pill.label} icon={pill.icon} label={pill.label} />
            ))}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 lg:hidden">
          {pills.map((pill) => (
            <TopPill key={`m-${pill.label}`} icon={pill.icon} label={pill.label} compact />
          ))}
        </div>
      </div>
    </header>
  );
};

const TopPill = ({
  icon,
  label,
  compact,
}: {
  icon: React.ReactNode;
  label: string;
  compact?: boolean;
}) => (
  <div
    className={`flex min-w-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] font-bold text-slate-200 ${
      compact ? 'px-2 py-1.5 text-[0.65rem]' : 'px-3 py-2 text-xs'
    } ${compact ? '' : 'shrink-0'}`}
  >
    <span className="text-turf">{icon}</span>
    <span className={compact ? 'min-w-0 break-words leading-tight' : 'whitespace-nowrap'}>{label}</span>
  </div>
);
