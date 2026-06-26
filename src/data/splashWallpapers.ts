export type SplashWallpaper = {
  id: string;
  src: string;
  label: string;
};

/** Fundos remotos (Unsplash) — funcionam sem arquivos em public/wallpapers. */
const img = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const SPLASH_WALLPAPERS: SplashWallpaper[] = [
  {
    id: 'celebration',
    src: img('photo-1574629810360-7efbbe195018'),
    label: 'Brasileirão 2026 — festa no gramado',
  },
  {
    id: 'stadium-night',
    src: img('photo-1522778119026-d647f0596c20'),
    label: 'Brasileirão 2026 — estádio lotado',
  },
  {
    id: 'fans',
    src: img('photo-1431324155629-1a6deb1dec8d'),
    label: 'Brasileirão 2026 — arquibancada em festa',
  },
  {
    id: 'match',
    src: img('photo-1522771739844-4743f11827b0'),
    label: 'Rodada decisiva sob os refletores',
  },
];

export const SPLASH_WALLPAPER_INTERVAL_MS = 7500;
export const SPLASH_WALLPAPER_FADE_MS = 2800;
