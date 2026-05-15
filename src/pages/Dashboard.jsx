import { ArrowRight, Flame, Plus, Sparkles } from "lucide-react";
import { ActivityBreakdown } from "../components/ActivityBreakdown.jsx";
import { ActivityComposer } from "../components/ActivityComposer.jsx";
import { AttributeBar } from "../components/AttributeBar.jsx";
import { DailySummaryCard } from "../components/DailySummaryCard.jsx";
import { EntryCard } from "../components/EntryCard.jsx";
import { OnboardingPanel } from "../components/OnboardingPanel.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { attributes } from "../data/scoringRules.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { buildRuleBasedDailyReport } from "../utils/report.js";

const starterActions = [
  { labelKey: "dashboard.starterStudy", text: "Studied for 30 minutes" },
  { labelKey: "dashboard.starterExercise", text: "Ran for 20 minutes" },
  { labelKey: "dashboard.starterMeal", text: "Ate a healthy meal" },
];

function flattenTodayActivities(todayEntries) {
  return todayEntries.flatMap((entry) => {
    if (entry.activities?.length > 0) {
      return entry.activities.map((activity) => ({
        ...activity,
        id: `${entry.id}-${activity.id}`,
      }));
    }

    return [
      {
        id: entry.id,
        label: entry.text,
        text: entry.text,
        category: entry.categories?.[0] ?? "Discipline",
        growth: entry.growth ?? entry.xp ?? 0,
      },
    ];
  });
}

export function Dashboard({
  entries,
  gameState,
  onAddEntry,
  onCompleteOnboarding,
  onDeleteEntry,
  onNavigate,
  onUpdateEntry,
  onLoadDemoData,
  showOnboarding = false,
}) {
  const { t } = useLanguage();
  const todayActivities = flattenTodayActivities(gameState.todayEntries);
  const dailyReport = buildRuleBasedDailyReport(gameState, t);
  const recentEntries = entries.slice(0, 3);
  const isFreshAccount = entries.length === 0;

  function addStarterActivity(activityText) {
    onAddEntry(activityText);
    onCompleteOnboarding?.();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="border-2 border-ink bg-ink p-5 text-paper shadow-hard sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-bolt">{t("dashboard.mainQuest")}</p>
              <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
                {t("dashboard.title")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold text-paper/75">
                {t("dashboard.intro")}
              </p>
            </div>
            <div className="flex min-w-28 items-center gap-2 border-2 border-paper bg-bolt px-3 py-2 text-ink">
              <Flame size={20} />
              <span className="font-display text-2xl font-black">{gameState.streak}</span>
              <span className="text-xs font-black uppercase">{t("dashboard.days")}</span>
            </div>
          </div>

          <div className="mt-5 bg-paper text-ink">
            {todayActivities.length > 0 ? (
              <ActivityBreakdown activities={todayActivities} />
            ) : (
              <div className="p-5">
                <p className="text-xs font-black uppercase text-ink/60">
                  {isFreshAccount ? t("dashboard.freshAccount") : t("dashboard.noActivityToday")}
                </p>
                <h3 className="mt-2 font-display text-3xl font-black uppercase leading-tight">
                  {isFreshAccount ? t("dashboard.statsStartZero") : t("dashboard.dayStillOpen")}
                </h3>
                <p className="mt-2 max-w-xl text-sm font-semibold text-ink/70">
                  {isFreshAccount ? t("dashboard.freshCopy") : t("dashboard.emptyCopy")}
                </p>
                {isFreshAccount && (
                  <button
                    className="mt-4 flex min-h-11 items-center justify-center gap-2 border-2 border-ink bg-bolt px-4 py-2 font-black shadow-hard transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20"
                    type="button"
                    onClick={onLoadDemoData}
                  >
                    <Sparkles size={18} />
                    {t("dashboard.loadSample")}
                  </button>
                )}
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {starterActions.map((action) => (
                    <button
                      key={action.labelKey}
                      className="min-h-11 border-2 border-ink bg-white px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:bg-bolt focus:outline-none focus:ring-4 focus:ring-ink/20"
                      type="button"
                      onClick={() => addStarterActivity(action.text)}
                    >
                      {t(action.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <ActivityComposer gameState={gameState} onAddEntry={onAddEntry} title={t("composer.dashboardTitle")} />
      </section>

      {showOnboarding && (
        <OnboardingPanel
          onDismiss={onCompleteOnboarding}
          onLoadDemoData={onLoadDemoData}
          onOpenLog={() => onNavigate("log")}
          onQuickStart={addStarterActivity}
        />
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("dashboard.dailyGrowth")}
          value={gameState.todayGrowth}
          detail={t("dashboard.dailyGrowthDetail")}
          tone="bg-bolt"
        />
        <StatCard
          label={t("dashboard.totalGrowth")}
          value={gameState.totalGrowth}
          detail={t("dashboard.totalGrowthDetail")}
          tone="bg-paper"
        />
        <StatCard label={t("dashboard.level")} value={gameState.level} detail={t("dashboard.levelDetail")} tone="bg-paper" />
        <StatCard
          label={t("dashboard.streakMultiplier")}
          value={`x${gameState.streakMultiplier.toFixed(2)}`}
          detail={t("dashboard.activeDays", { count: gameState.streak })}
          tone="bg-paper"
        />
      </section>

      <section className="scanline border-2 border-ink bg-ink p-5 text-paper shadow-hard sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-bolt">{t("dashboard.levelCurve")}</p>
            <h2 className="font-display text-3xl font-black uppercase">
              {t("dashboard.level")} {gameState.level} {t(gameState.titleKey)}
            </h2>
          </div>
          <p className="text-sm font-black uppercase text-paper/70">
            {t("dashboard.growthInLevel", {
              current: gameState.currentLevelGrowth,
              next: gameState.nextLevelGrowth,
            })}
          </p>
        </div>
        <div className="mt-5 h-5 border-2 border-paper bg-ink">
          <div className="h-full bg-bolt" style={{ width: `${gameState.levelProgress}%` }} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-black uppercase">{t("dashboard.attributes")}</h2>
            <ArrowRight size={21} />
          </div>
          <div className="grid gap-3">
            {attributes.map((attribute) => (
              <AttributeBar
                key={attribute.id}
                label={t(`categories.${attribute.label}`)}
                value={gameState.attributeScores[attribute.id]}
                accent={attribute.accent}
                detail={t("profile.afterDecay", { value: gameState.attributeTotals[attribute.id] })}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <DailySummaryCard report={dailyReport} />
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-black uppercase">{t("dashboard.recentLogs")}</h2>
              <Plus size={21} />
            </div>
            <div className="grid gap-3">
              {recentEntries.length > 0 ? (
                recentEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDeleteEntry={onDeleteEntry}
                    onUpdateEntry={onUpdateEntry}
                  />
                ))
              ) : (
                <div className="border-2 border-dashed border-ink bg-paper p-6 text-center font-black shadow-hard">
                  {t("dashboard.emptyLog")}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
