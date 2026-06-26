import { useMemo, useState } from 'react';
import { ArrowLeft, Banknote, Flag, Goal, PlayCircle, ShieldCheck } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { ClubBadge } from '../components/ClubBadge';
import { ScreenHeader } from '../components/ScreenHeader';
import { CLUBS } from '../data/clubs';
import { LEAGUES } from '../data/leagues';
import { MANAGER_NATIONALITIES } from '../data/countries';
import type { Difficulty } from '../types';
import { useGameStore } from '../stores/gameStore';
import { currency } from '../utils/format';

const difficulties: Difficulty[] = ['Fácil', 'Normal', 'Difícil', 'Lendário'];

export const CareerSetupScreen = () => {
  const createCareer = useGameStore((state) => state.createCareer);
  const setScreen = useGameStore((state) => state.setScreen);
  const [managerName, setManagerName] = useState('');
  const [nationality, setNationality] = useState('Brasil');
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [leagueId, setLeagueId] = useState(LEAGUES[0]?.id ?? '');
  const filteredClubs = useMemo(() => CLUBS.filter((club) => club.ligaId === leagueId), [leagueId]);
  const [clubId, setClubId] = useState(filteredClubs[0]?.id ?? '');
  const selectedClub = CLUBS.find((club) => club.id === clubId) ?? filteredClubs[0];
  const selectedLeague = LEAGUES.find((league) => league.id === selectedClub?.ligaId);

  const updateLeague = (value: string) => {
    const first = CLUBS.find((club) => club.ligaId === value);
    setLeagueId(value);
    if (first) setClubId(first.id);
  };

  const startCareer = (nextClubId = selectedClub?.id) => {
    const club = CLUBS.find((item) => item.id === nextClubId);
    if (!club) return;
    createCareer({
      managerName,
      nationality,
      difficulty,
      continent: club.continente,
      clubId: club.id,
    });
  };

  return (
    <div className="app-theme min-h-screen bg-app px-4 py-6 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <ScreenHeader
          title="Criação de carreira"
          subtitle="Escolha técnico, dificuldade e clube inicial no Brasileirão ou no Campeonato Gaúcho."
          action={
            <AnimatedButton variant="ghost" icon={<ArrowLeft size={18} />} onClick={() => setScreen('splash')}>
              Voltar
            </AnimatedButton>
          }
        />
        <div className="grid gap-5 lg:grid-cols-[24rem_1fr]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-300">Nome do técnico</span>
                <input
                  value={managerName}
                  onChange={(event) => setManagerName(event.target.value)}
                  placeholder="Seu nome"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-turf"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-300">Nacionalidade</span>
                <select
                  value={nationality}
                  onChange={(event) => setNationality(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-turf"
                >
                  {MANAGER_NATIONALITIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <fieldset>
                <legend className="text-sm font-bold text-slate-300">Dificuldade</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {difficulties.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDifficulty(item)}
                      className={`rounded-lg border px-3 py-2 text-sm font-bold ${difficulty === item ? 'border-turf bg-turf text-slate-950' : 'border-white/10 bg-slate-950 text-slate-300'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-bold text-slate-300">Campeonato</legend>
                <div className="mt-2 grid gap-2">
                  {LEAGUES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateLeague(item.id)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm font-bold ${leagueId === item.id ? 'border-turf bg-turf text-slate-950' : 'border-white/10 bg-slate-950 text-slate-300'}`}
                    >
                      {item.nome}
                    </button>
                  ))}
                </div>
              </fieldset>
              <AnimatedButton
                className="w-full"
                icon={<PlayCircle size={18} />}
                onClick={() => startCareer()}
              >
                Começar no {selectedClub?.nome}
              </AnimatedButton>
            </div>
          </section>
          <section className="grid gap-4 xl:grid-cols-[1fr_22rem]">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              {filteredClubs.map((club) => (
                <div
                  key={club.id}
                  className={`rounded-xl border p-4 text-left transition ${clubId === club.id ? 'border-turf bg-turf/12 shadow-glow' : 'border-white/10 bg-white/[0.045] hover:bg-white/[0.075]'}`}
                >
                  <button type="button" onClick={() => setClubId(club.id)} className="w-full text-left">
                    <div className="flex items-center gap-3">
                      <ClubBadge club={club} />
                      <div className="min-w-0">
                        <p className="break-words font-display text-xl font-black leading-tight text-white">{club.nome}</p>
                        <p className="text-sm text-slate-400">{club.pais}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <span>{club.serie}</span>
                      <span>Rep {club.reputacao}</span>
                      <span className="col-span-2 break-words leading-tight">{club.estadio}</span>
                    </div>
                  </button>
                  {clubId === club.id ? (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <AnimatedButton className="w-full min-h-10 px-3 py-2 text-xs" icon={<PlayCircle size={16} />} onClick={() => startCareer(club.id)}>
                        Começar
                      </AnimatedButton>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <aside className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 xl:sticky xl:top-5 xl:self-start">
              <div className="flex items-center gap-3">
                <ClubBadge club={selectedClub} size="lg" />
                <div>
                  <h2 className="font-display text-2xl font-black text-white">{selectedClub?.nome}</h2>
                  <p className="text-sm text-slate-400">{selectedClub?.pais} • {selectedLeague?.nome}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <Detail icon={<Goal size={18} />} label="Estádio" value={selectedClub?.estadio} />
                <Detail icon={<Banknote size={18} />} label="Orçamento" value={currency(selectedClub?.orcamento ?? 0)} />
                <Detail icon={<ShieldCheck size={18} />} label="Força do elenco" value={selectedClub?.forcaElenco} />
                <Detail icon={<Flag size={18} />} label="Diretoria espera" value={selectedClub?.expectativa} />
              </div>
              <AnimatedButton className="mt-5 w-full" icon={<PlayCircle size={18} />} onClick={() => startCareer()}>
                Começar no {selectedClub?.nome}
              </AnimatedButton>
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-center gap-3 rounded-lg bg-white/[0.06] p-3">
    <span className="text-gold">{icon}</span>
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="font-bold text-white">{value}</p>
    </div>
  </div>
);
