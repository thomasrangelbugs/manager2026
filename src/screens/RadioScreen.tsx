import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Headphones, Loader2, Pause, Play, Radio, RefreshCw } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { CLUBS } from '../data/clubs';
import { LEAGUES } from '../data/leagues';
import { RADIO_PRESETS, type RadioPresetId } from '../data/radio';
import { audioService } from '../services/audioService';
import { getCurrentScheduleContext } from '../services/seasonService';
import { searchRadioStations, type RadioStation } from '../services/radioApi';
import { useGameStore } from '../stores/gameStore';
import type { Career } from '../types';
import { formatDate } from '../utils/format';

export const RadioScreen = () => {
  const career = useGameStore((state) => state.career);
  const addToast = useGameStore((state) => state.addToast);
  const [presetId, setPresetId] = useState<RadioPresetId>('brasileirao');
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preset = RADIO_PRESETS.find((item) => item.id === presetId) ?? RADIO_PRESETS[0];
  const plans = useMemo(() => (career ? buildBroadcastPlans(career, preset.competitionIds) : []), [career, preset.competitionIds]);

  useEffect(() => {
    void loadStations(preset.queries);
    return () => {
      audioService.stopRadio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset.id]);

  const loadStations = async (queries = preset.queries) => {
    setLoading(true);
    setError(null);
    setPlayingId(null);
    audioService.stopRadio(false);
    try {
      const nextStations = await searchRadioStations(queries);
      setStations(nextStations);
      if (!nextStations.length) {
        setError('Nenhuma radio encontrada agora. Tente atualizar em alguns segundos.');
      }
    } catch {
      setStations([]);
      setError('Nao foi possivel consultar a API de radios agora.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRadio = async (station: RadioStation) => {
    if (playingId === station.id) {
      audioService.stopRadio();
      setPlayingId(null);
      return;
    }

    try {
      await audioService.startRadio(station.streamUrl);
      setPlayingId(station.id);
      addToast({ type: 'info', message: `Radio sintonizada: ${station.name}.` });
    } catch {
      setPlayingId(null);
      addToast({ type: 'warning', message: 'Esta radio nao respondeu. Tente outra emissora.' });
    }
  };

  if (!career) return null;

  return (
    <>
      <ScreenHeader
        title="Central Radio"
        subtitle="Um menu separado do game para ouvir cobertura esportiva e acompanhar planejamento de jogos."
        action={
          <AnimatedButton variant="secondary" icon={<RefreshCw size={18} />} onClick={() => loadStations()}>
            Atualizar radios
          </AnimatedButton>
        }
      />

      <section className="mb-5 grid gap-3 sm:grid-cols-2">
        {RADIO_PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPresetId(item.id)}
            className={`rounded-xl border p-4 text-left transition ${
              presetId === item.id ? 'border-turf bg-turf/12 shadow-glow' : 'border-white/10 bg-white/[0.045] hover:bg-white/[0.07]'
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">{item.eyebrow}</p>
            <h2 className="mt-1 font-display text-2xl font-black text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.description}</p>
          </button>
        ))}
      </section>

      <div className="layout-two-col">
        <section className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-turf">Sintonizar</p>
                <h2 className="font-display text-2xl font-black text-white">{preset.title}</h2>
              </div>
              {loading ? <Loader2 size={22} className="animate-spin text-turf" /> : <Radio size={22} className="text-gold" />}
            </div>

            {error ? <p className="mb-3 rounded-lg border border-amber-300/25 bg-amber-500/10 p-3 text-sm text-amber-100">{error}</p> : null}

            <div className="grid gap-2">
              {stations.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => toggleRadio(station)}
                  className={`flex min-h-14 items-center justify-between gap-3 rounded-lg border px-3 text-left transition ${
                    playingId === station.id ? 'border-turf bg-turf text-slate-950' : 'border-white/10 bg-slate-950/55 text-slate-200 hover:border-turf/40'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    {playingId === station.id ? <Pause size={18} /> : <Play size={18} />}
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{station.name}</span>
                      <span className={`block truncate text-xs ${playingId === station.id ? 'text-slate-800' : 'text-slate-400'}`}>
                        {station.country ?? 'Brasil'} {station.votes ? `- ${station.votes} votos` : ''}
                      </span>
                    </span>
                  </span>
                  <Headphones size={18} className="shrink-0" />
                </button>
              ))}
              {!loading && !stations.length ? (
                <p className="rounded-lg bg-slate-950/55 p-4 text-sm text-slate-400">
                  A busca usa a API publica Radio Browser. Se ela estiver fora, o planejamento abaixo continua funcionando.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays size={20} className="text-turf" />
            <h2 className="font-display text-2xl font-black text-white">Planejamento</h2>
          </div>
          <div className="space-y-3">
            {plans.map((plan) => (
              <article key={plan.id} className="rounded-lg border border-white/10 bg-slate-950/55 p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-gold">{plan.competition}</p>
                <h3 className="mt-1 break-words font-bold text-white">{plan.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{plan.detail}</p>
              </article>
            ))}
            {!plans.length ? (
              <p className="rounded-lg bg-slate-950/55 p-4 text-sm text-slate-400">
                Nao ha jogos desse pacote de radio no calendario atual da carreira.
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </>
  );
};

const buildBroadcastPlans = (career: Career, competitionIds: string[]) => {
  const nextContext = getCurrentScheduleContext(career);
  return career.schedule
    .filter((match) => !match.played && competitionIds.includes(match.competitionId))
    .slice(0, 8)
    .map((match) => {
      const home = CLUBS.find((club) => club.id === match.homeClubId);
      const away = CLUBS.find((club) => club.id === match.awayClubId);
      const competition = LEAGUES.find((league) => league.id === match.competitionId)?.nome ?? match.competitionId.replace(/-/g, ' ');
      const isNext = nextContext.nextMatch?.id === match.id;
      return {
        id: match.id,
        competition,
        title: `${home?.nome ?? match.homeClubId} x ${away?.nome ?? match.awayClubId}`,
        detail: `${formatDate(match.date)} - Rodada/fase ${match.round}${isNext ? ' - proximo jogo da carreira' : ''}`,
      };
    });
};
