import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";
import { CategoryPill } from "../components/CategoryPill.jsx";
import { DailySummaryCard } from "../components/DailySummaryCard.jsx";
import { EntryCard } from "../components/EntryCard.jsx";
import { categoryMeta } from "../data/scoringRules.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { buildRuleBasedDailyReport, buildRuleBasedDaySummary } from "../utils/report.js";

export function DailyReport({ gameState, onDeleteEntry, onUpdateEntry }) {
  const { t } = useLanguage();
  const positiveEntries = gameState.todayEntries.filter((entry) => (entry.growth ?? entry.xp ?? 0) > 0);
  const negativeEntries = gameState.todayEntries.filter((entry) => (entry.growth ?? entry.xp ?? 0) < 0);
  const bestCategory = Object.entries(gameState.todayCategoryTotals).sort((a, b) => b[1] - a[1])[0];
  const dailyReport = buildRuleBasedDailyReport(gameState, t);
  const daySummary = buildRuleBasedDaySummary(gameState, t);

  return (
    <div className="space-y-6">
      <DailySummaryCard report={dailyReport} />

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
        <div className="border-2 border-ink bg-paper p-5 shadow-hard">
          <div className="flex items-center gap-2">
            <CalendarDays size={20} />
            <p className="text-xs font-black uppercase text-ink/60">{t("report.today")}</p>
          </div>
          <p className="mt-3 font-display text-5xl font-black">{gameState.todayGrowth}</p>
          <p className="mt-2 text-sm font-semibold text-ink/70">{t("report.todayDetail")}</p>
        </div>

        <div className="border-2 border-ink bg-bolt p-5 shadow-hard">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} />
            <p className="text-xs font-black uppercase text-ink/60">{t("report.wins")}</p>
          </div>
          <p className="mt-3 font-display text-5xl font-black">+{gameState.todayPositiveGrowth}</p>
          <p className="mt-2 text-sm font-semibold text-ink/70">
            {t("report.positiveActions", { count: positiveEntries.length })}
          </p>
        </div>

        <div className="border-2 border-ink bg-white p-5 shadow-hard">
          <div className="flex items-center gap-2">
            <TrendingDown size={20} />
            <p className="text-xs font-black uppercase text-ink/60">{t("report.penalties")}</p>
          </div>
          <p className="mt-3 font-display text-5xl font-black text-ember">{gameState.todayNegativeGrowth}</p>
          <p className="mt-2 text-sm font-semibold text-ink/70">
            {t("report.costlyActions", { count: negativeEntries.length })}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <div className="border-2 border-ink bg-ink p-5 text-paper shadow-hard">
            <h2 className="font-display text-2xl font-black uppercase">{t("report.daySummary")}</h2>
            <p className="mt-3 text-base font-semibold text-paper/80">{daySummary}</p>
            {bestCategory && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-black uppercase text-paper/60">{t("report.strongestCategory")}</p>
                <CategoryPill category={bestCategory[0]} value={bestCategory[1]} />
              </div>
            )}
          </div>

          <div className="border-2 border-ink bg-paper p-5 shadow-hard">
            <h2 className="font-display text-2xl font-black uppercase">{t("report.categorySplit")}</h2>
            <div className="mt-4 grid gap-3">
              {Object.keys(categoryMeta).map((category) => {
                const value = gameState.todayCategoryTotals[category] ?? 0;
                const width = Math.min(100, Math.max(4, Math.abs(value)));

                return (
                  <div key={category}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm font-black">
                      <span>{t(`categories.${category}`)}</span>
                      <span>{value > 0 ? `+${value}` : value}</span>
                    </div>
                    <div className="h-3 border-2 border-ink bg-white">
                      <div className={value < 0 ? "h-full bg-ember" : "h-full bg-moss"} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl font-black uppercase">{t("report.todayLog")}</h2>
          <div className="grid gap-3">
            {gameState.todayEntries.length > 0 ? (
              gameState.todayEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onDeleteEntry={onDeleteEntry} onUpdateEntry={onUpdateEntry} />
              ))
            ) : (
              <div className="border-2 border-dashed border-ink bg-paper p-6 text-center font-black shadow-hard">
                {t("report.emptyToday")}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
