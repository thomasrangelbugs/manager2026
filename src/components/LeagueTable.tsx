import type { LeagueStanding } from '../types';
import { CLUBS } from '../data/clubs';

type Props = {
  table: LeagueStanding[];
  selectedClubId?: string;
};

export const LeagueTable = ({ table, selectedClubId }: Props) => (
  <div className="overflow-x-auto rounded-xl border border-white/10">
    <table className="min-w-full border-collapse bg-white/[0.04] text-sm sm:min-w-[34rem]">
      <thead className="bg-slate-950/80 text-left text-xs uppercase tracking-[0.14em] text-slate-400">
        <tr>
          <th className="w-14 px-3 py-3">#</th>
          <th className="px-3 py-3">Clube</th>
          <th className="px-2 py-3 text-center">J</th>
          <th className="hidden px-2 py-3 text-center sm:table-cell">V</th>
          <th className="hidden px-2 py-3 text-center sm:table-cell">E</th>
          <th className="hidden px-2 py-3 text-center sm:table-cell">D</th>
          <th className="hidden px-2 py-3 text-center md:table-cell">GP</th>
          <th className="hidden px-2 py-3 text-center md:table-cell">GC</th>
          <th className="px-2 py-3 text-center">SG</th>
          <th className="px-3 py-3 text-center">Pts</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10">
        {table.map((entry, index) => {
          const club = CLUBS.find((item) => item.id === entry.clubId);
          const selected = entry.clubId === selectedClubId;
          return (
            <tr key={entry.clubId} className={selected ? 'bg-turf/12 text-white' : 'hover:bg-white/[0.04]'}>
              <td className="px-3 py-3 font-black text-slate-300">{index + 1}</td>
              <td className="min-w-0 px-3 py-3">
                <p className="break-words font-bold leading-tight text-white">{club?.nome ?? entry.clubId}</p>
                <p className="break-words text-xs leading-tight text-slate-400">{club?.pais}</p>
              </td>
              <td className="px-2 py-3 text-center">{entry.played}</td>
              <td className="hidden px-2 py-3 text-center sm:table-cell">{entry.wins}</td>
              <td className="hidden px-2 py-3 text-center sm:table-cell">{entry.draws}</td>
              <td className="hidden px-2 py-3 text-center sm:table-cell">{entry.losses}</td>
              <td className="hidden px-2 py-3 text-center md:table-cell">{entry.goalsFor}</td>
              <td className="hidden px-2 py-3 text-center md:table-cell">{entry.goalsAgainst}</td>
              <td className="px-2 py-3 text-center">{entry.goalsFor - entry.goalsAgainst}</td>
              <td className="px-3 py-3 text-center font-black text-turf">{entry.points}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
