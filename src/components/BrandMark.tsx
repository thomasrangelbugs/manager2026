export const BrandMark = ({ compact = false }: { compact?: boolean }) => (
  <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
    <img
      src="/logo/logo.svg"
      alt="Manager 2026"
      className={compact ? 'h-8 w-auto object-contain' : 'h-10 w-auto object-contain'}
    />
    {!compact ? (
      <div className="leading-none">
        <p className="font-display text-lg font-black uppercase tracking-[0.12em] text-white">Manager</p>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-turf">2026</p>
      </div>
    ) : null}
  </div>
);
