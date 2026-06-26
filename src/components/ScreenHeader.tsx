import { ReactNode } from 'react';

export const ScreenHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="mb-4 min-w-0 sm:mb-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-turf sm:tracking-[0.24em]">THOR Manager Football</p>
        <h1 className="mt-1 break-words font-display text-2xl font-black text-white sm:text-3xl lg:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-1 break-words text-sm leading-relaxed text-slate-400">{subtitle}</p> : null}
      </div>
      {action ? (
        <div className="w-full shrink-0 sm:w-auto [&_button]:w-full sm:[&_button]:w-auto">{action}</div>
      ) : null}
    </div>
  </div>
);
