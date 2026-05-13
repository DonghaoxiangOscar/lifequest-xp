export function StatCard({ label, value, detail, tone = "bg-paper" }) {
  return (
    <section className={`border-2 border-ink p-4 shadow-hard ${tone}`}>
      <p className="text-xs font-black uppercase text-ink/60">{label}</p>
      <p className="mt-2 font-display text-4xl font-black leading-none sm:text-5xl">{value}</p>
      {detail && <p className="mt-2 text-sm font-semibold text-ink/70">{detail}</p>}
    </section>
  );
}
