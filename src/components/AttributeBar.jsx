export function AttributeBar({ label, value, accent = "bg-moss", detail }) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="border-2 border-ink bg-paper p-4 shadow-hard">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase leading-tight">{label}</p>
          {detail && <p className="text-xs font-semibold text-ink/60">{detail}</p>}
        </div>
        <span className="min-w-12 text-right font-display text-xl font-black">{safeValue}</span>
      </div>
      <div className="h-4 border-2 border-ink bg-white">
        <div className={`h-full ${accent}`} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
