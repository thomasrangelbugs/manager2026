export type RadioStation = {
  id: string;
  name: string;
  streamUrl: string;
  homepage?: string;
  country?: string;
  tags?: string;
  votes?: number;
};

type RadioBrowserStation = {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved?: string;
  homepage?: string;
  country?: string;
  tags?: string;
  votes?: number;
};

const RADIO_BROWSER_ENDPOINT = 'https://de1.api.radio-browser.info/json/stations/search';

export const searchRadioStations = async (queries: string[]) => {
  const results = await Promise.all(
    queries.map(async (query) => {
      const params = new URLSearchParams({
        name: query,
        countrycode: 'BR',
        hidebroken: 'true',
        order: 'votes',
        reverse: 'true',
        limit: '8',
      });
      const response = await fetch(`${RADIO_BROWSER_ENDPOINT}?${params.toString()}`);
      if (!response.ok) throw new Error('Falha ao buscar radios');
      return (await response.json()) as RadioBrowserStation[];
    }),
  );

  const seen = new Set<string>();
  return results
    .flat()
    .map((station): RadioStation | null => {
      const streamUrl = station.url_resolved || station.url;
      if (!station.stationuuid || !streamUrl) return null;
      return {
        id: station.stationuuid,
        name: station.name,
        streamUrl,
        homepage: station.homepage,
        country: station.country,
        tags: station.tags,
        votes: station.votes,
      };
    })
    .filter((station): station is RadioStation => Boolean(station))
    .filter((station) => {
      const key = station.streamUrl;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
};
