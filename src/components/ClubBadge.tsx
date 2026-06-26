import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import type { Club } from '../types';

type Props = {
  club?: Club;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const imageSizes = {
  sm: 'h-[78%] w-[78%]',
  md: 'h-[80%] w-[80%]',
  lg: 'h-[82%] w-[82%]',
};

export const ClubBadge = ({ club, size = 'md' }: Props) => {
  const [failed, setFailed] = useState(false);
  const primary = club?.cores.primaria ?? '#23d38d';
  const secondary = club?.cores.secundaria ?? '#0b1220';
  const showImage = Boolean(club?.escudoUrl && !failed);

  useEffect(() => {
    setFailed(false);
  }, [club?.id]);

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-white/15 bg-white p-1 shadow-lg ${sizes[size]}`}
      style={{
        background: showImage ? '#ffffff' : `linear-gradient(145deg, ${primary}, ${secondary})`,
      }}
      title={club?.nome}
    >
      {showImage ? (
        <span className="flex h-full w-full items-center justify-center leading-none">
          <img
            src={club?.escudoUrl}
            alt={`Escudo do ${club?.nome}`}
            className={`block shrink-0 object-contain object-center ${imageSizes[size]}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        </span>
      ) : (
        <Shield className="text-white drop-shadow" size={size === 'lg' ? 34 : size === 'md' ? 26 : 20} />
      )}
    </div>
  );
};
