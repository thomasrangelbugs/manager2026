import type { Position } from '../types';

export const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

export const compactCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);

export const percent = (value: number) => `${Math.round(value)}%`;

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));

export const positionColor = (position: Position) => {
  if (position === 'GOL') return 'bg-cyan-500/15 text-cyan-200 ring-cyan-400/20';
  if (['LD', 'ZAG', 'LE'].includes(position)) return 'bg-blue-500/15 text-blue-200 ring-blue-400/20';
  if (['VOL', 'MC', 'MEI'].includes(position)) return 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/20';
  return 'bg-amber-500/15 text-amber-200 ring-amber-400/20';
};
