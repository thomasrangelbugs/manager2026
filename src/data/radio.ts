export type RadioPresetId = 'brasileirao' | 'gauchao';

export type RadioPreset = {
  id: RadioPresetId;
  title: string;
  eyebrow: string;
  description: string;
  queries: string[];
  competitionIds: string[];
};

export const RADIO_PRESETS: RadioPreset[] = [
  {
    id: 'brasileirao',
    title: 'Radio Brasileirao',
    eyebrow: 'Nacional',
    description: 'Busca radios brasileiras com cobertura esportiva e monta a agenda das rodadas nacionais.',
    queries: ['CBN', 'Itatiaia', 'Bandeirantes', 'Jovem Pan'],
    competitionIds: ['brasileirao-serie-a', 'brasileirao-serie-b', 'copa-do-brasil'],
  },
  {
    id: 'gauchao',
    title: 'Radio Gauchao',
    eyebrow: 'Rio Grande do Sul',
    description: 'Foco em radios do sul e planejamento das partidas do calendario estadual.',
    queries: ['Gaucha', 'Guaiba', 'Grenal', 'Bandeirantes Porto Alegre'],
    competitionIds: ['gauchao-serie-a', 'gauchao-serie-b'],
  },
];
