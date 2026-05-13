import { Sparkles } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function DailySummaryCard({ report }) {
  const { t } = useLanguage();

  return (
    <section className="border-2 border-ink bg-paper p-5 shadow-hard">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-ink/60">{t("report.dailyAiReport")}</p>
          <h2 className="font-display text-2xl font-black uppercase">{t("report.localSummary")}</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-bolt">
          <Sparkles size={20} />
        </div>
      </div>

      <div className="mt-4 border-2 border-ink bg-white p-4">
        <p className="text-xs font-black uppercase text-ink/60">{t("report.score")}</p>
        <p className="font-display text-4xl font-black">{report.score}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ReportList title={t("report.strengths")} items={report.strengths} />
        <ReportList title={t("report.weaknesses")} items={report.weaknesses} />
        <ReportList title={t("report.suggestions")} items={report.suggestions} />
      </div>
    </section>
  );
}

function ReportList({ title, items }) {
  return (
    <div className="border-2 border-ink bg-white p-3">
      <p className="text-xs font-black uppercase text-ink/60">{title}</p>
      <ul className="mt-2 space-y-2 text-sm font-bold text-ink/80">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
