import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { categoryOptions, difficultyOptions, getCategoryDefaults } from "../utils/activityDefaults.js";

export function StructuredActivityEditor({ activities, onChange }) {
  const { t } = useLanguage();

  function updateActivity(activityId, field, value) {
    onChange(
      activities.map((activity) => {
        if (activity.id !== activityId) return activity;

        if (field === "category") {
          const defaults = getCategoryDefaults(value);
          return {
            ...activity,
            category: defaults.value,
            displayCategory: defaults.displayCategory,
            type: defaults.type,
            baseXp: defaults.baseXp,
            attributeWeights: defaults.attributeWeights,
          };
        }

        const nextActivity = {
          ...activity,
          [field]: field === "duration" || field === "baseXp" ? Number(value) : value,
        };

        if (field === "name") {
          nextActivity.sourceText = value;
        }

        return nextActivity;
      }),
    );
  }

  function addActivity() {
    const defaults = getCategoryDefaults("discipline");
    onChange([
      ...activities,
      {
        id: `manual-${Date.now()}`,
        sourceText: t("editor.customActivity"),
        name: t("editor.customActivity"),
        type: defaults.type,
        duration: 30,
        category: defaults.value,
        displayCategory: defaults.displayCategory,
        baseXp: defaults.baseXp,
        difficulty: "normal",
        attributeWeights: defaults.attributeWeights,
        ruleId: "manual-activity",
        confidence: 1,
        note: t("editor.manualNote"),
      },
    ]);
  }

  function removeActivity(activityId) {
    onChange(activities.filter((activity) => activity.id !== activityId));
  }

  return (
    <div className="border-2 border-ink bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-ink/60">{t("editor.reviewParser")}</p>
          <h3 className="font-display text-xl font-black uppercase">{t("editor.title")}</h3>
        </div>
        <button
          className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-bolt transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20"
          type="button"
          aria-label={t("editor.addActivity")}
          title={t("editor.addActivity")}
          onClick={addActivity}
        >
          <Plus size={18} />
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="mt-3 border-2 border-dashed border-ink bg-paper p-4 text-sm font-black text-ink/60">
          {t("editor.empty")}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="grid gap-2 border-2 border-ink bg-paper p-3">
              <div className="grid gap-2 sm:grid-cols-[1.2fr_0.8fr_0.7fr]">
                <label className="grid gap-1 text-xs font-black uppercase text-ink/60">
                  {t("editor.activity")}
                  <input
                    className="border-2 border-ink bg-white px-2 py-2 text-sm font-bold text-ink outline-none focus:ring-4 focus:ring-ink/15"
                    value={activity.name}
                    onChange={(event) => updateActivity(activity.id, "name", event.target.value)}
                  />
                </label>

                <label className="grid gap-1 text-xs font-black uppercase text-ink/60">
                  {t("editor.category")}
                  <select
                    className="border-2 border-ink bg-white px-2 py-2 text-sm font-bold text-ink outline-none focus:ring-4 focus:ring-ink/15"
                    value={activity.category}
                    onChange={(event) => updateActivity(activity.id, "category", event.target.value)}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>
                        {t(`categories.${category.displayCategory}`)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1 text-xs font-black uppercase text-ink/60">
                  {t("editor.minutes")}
                  <input
                    className="border-2 border-ink bg-white px-2 py-2 text-sm font-bold text-ink outline-none focus:ring-4 focus:ring-ink/15"
                    min="1"
                    type="number"
                    value={activity.duration}
                    onChange={(event) => updateActivity(activity.id, "duration", event.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-[0.8fr_0.8fr_auto]">
                <label className="grid gap-1 text-xs font-black uppercase text-ink/60">
                  {t("editor.difficulty")}
                  <select
                    className="border-2 border-ink bg-white px-2 py-2 text-sm font-bold text-ink outline-none focus:ring-4 focus:ring-ink/15"
                    value={activity.difficulty}
                    onChange={(event) => updateActivity(activity.id, "difficulty", event.target.value)}
                  >
                    {difficultyOptions.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1 text-xs font-black uppercase text-ink/60">
                  {t("editor.baseXp")}
                  <input
                    className="border-2 border-ink bg-white px-2 py-2 text-sm font-bold text-ink outline-none focus:ring-4 focus:ring-ink/15"
                    type="number"
                    value={activity.baseXp}
                    onChange={(event) => updateActivity(activity.id, "baseXp", event.target.value)}
                  />
                </label>

                <button
                  className="flex h-11 items-center justify-center gap-2 self-end border-2 border-ink bg-white px-3 font-black transition hover:bg-ember hover:text-paper focus:outline-none focus:ring-4 focus:ring-ink/20"
                  type="button"
                  onClick={() => removeActivity(activity.id)}
                >
                  <Trash2 size={16} />
                  {t("editor.remove")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
