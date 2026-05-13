import { CategoryPill } from "./CategoryPill.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function ActivityBreakdown({ activities, emptyText }) {
  const { t } = useLanguage();

  if (!activities || activities.length === 0) {
    return (
      <div className="border-2 border-dashed border-ink bg-white px-3 py-4 text-sm font-black text-ink/60">
        {emptyText ?? t("activities.empty")}
      </div>
    );
  }

  return (
    <div className="divide-y-2 divide-ink border-2 border-ink bg-white">
      {activities.map((activity) => {
        const growth = activity.growth ?? activity.xp ?? 0;

        return (
          <div key={activity.id} className="grid gap-2 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-black leading-tight">{activity.label}</p>
                <CategoryPill category={activity.category} />
              </div>
              <p className="mt-1 text-sm font-semibold text-ink/60">{activity.text}</p>
              {activity.minutes && (
                <p className="mt-1 text-xs font-black uppercase text-ink/45">
                  {t("activities.minutes", {
                    minutes: activity.minutes,
                    time: activity.timeFactor.toFixed(2),
                    streak: activity.consistencyFactor.toFixed(2),
                    difficulty: activity.difficulty,
                  })}
                </p>
              )}
            </div>
            <span
              className={`w-fit border-2 border-ink px-2 py-1 font-display text-lg font-black ${
                growth >= 0 ? "bg-bolt text-ink" : "bg-ember text-paper"
              }`}
            >
              {growth > 0 ? `+${growth}` : growth} {t("activities.growth")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
