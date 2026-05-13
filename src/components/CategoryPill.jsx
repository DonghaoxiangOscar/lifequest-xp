import { categoryMeta } from "../data/scoringRules.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function CategoryPill({ category, value }) {
  const { t } = useLanguage();
  const meta = categoryMeta[category] ?? categoryMeta.Discipline;
  const Icon = meta.icon;
  const label = t(`categories.${category}`);

  return (
    <span
      className={`inline-flex min-h-8 items-center gap-1 border-2 border-ink px-2 py-1 text-xs font-black ${meta.badgeClass}`}
      title={label}
    >
      <Icon size={14} />
      {label}
      {typeof value === "number" && <span>{value > 0 ? `+${value}` : value}</span>}
    </span>
  );
}
