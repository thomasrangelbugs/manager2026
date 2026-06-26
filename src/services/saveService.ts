import type { Career, GameSettings } from '../types';

const CAREER_KEY = 'tmf-career-save-v3';
const SETTINGS_KEY = 'tmf-settings-v1';

export const defaultSettings: GameSettings = {
  musicVolume: 0.35,
  effectsVolume: 0.55,
  muteMusic: false,
  muteEffects: false,
  animations: true,
  theme: 'dark',
  defaultSimulationSpeed: 1,
  hideLegendLineupWarning: false,
};

export const saveCareer = (career: Career | null) => {
  if (!career) {
    localStorage.removeItem(CAREER_KEY);
    return;
  }

  localStorage.setItem(CAREER_KEY, JSON.stringify(career));
};

const normalizeCareer = (career: Career): Career => ({
  ...career,
  calendarVersion: career.calendarVersion ?? 1,
  boardObjective: career.boardObjective ?? {
    label: 'Meio de tabela',
    targetPosition: 10,
    minConfidence: 45,
  },
  discipline: career.discipline ?? {},
  pendingAchievement: career.pendingAchievement ?? null,
});

export const loadCareer = (): Career | null => {
  const raw = localStorage.getItem(CAREER_KEY) ?? localStorage.getItem('tmf-career-save-v2');
  if (!raw) return null;

  try {
    return normalizeCareer(JSON.parse(raw) as Career);
  } catch {
    localStorage.removeItem(CAREER_KEY);
    localStorage.removeItem('tmf-career-save-v2');
    return null;
  }
};

export const exportCareerJson = (career: Career) => {
  const blob = new Blob([JSON.stringify(career, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `manager-2026-save-${career.season}-${career.clubId}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const importCareerJson = async (file: File): Promise<Career> => {
  const text = await file.text();
  const parsed = JSON.parse(text) as Career;
  if (!parsed?.clubId || !parsed?.players || !parsed?.schedule) {
    throw new Error('Arquivo de save inválido.');
  }
  return normalizeCareer(parsed);
};

export const clearCareer = () => {
  localStorage.removeItem(CAREER_KEY);
};

export const saveSettings = (settings: GameSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadSettings = (): GameSettings => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;

  try {
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<GameSettings>) };
  } catch {
    localStorage.removeItem(SETTINGS_KEY);
    return defaultSettings;
  }
};
