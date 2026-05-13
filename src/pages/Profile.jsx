import { Award, Crown, Database, ShieldCheck, Target } from "lucide-react";
import { AttributeBar } from "../components/AttributeBar.jsx";
import { DataManager } from "../components/DataManager.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { attributes, categoryMeta } from "../data/scoringRules.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function Profile({ entries, gameState, onImportEntries, onClearEntries, currentAccount }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="border-2 border-ink bg-paper p-5 shadow-hard sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center border-2 border-ink bg-ink text-bolt shadow-hard">
            <Crown size={42} />
          </div>
          <div>
            <p className="text-sm font-black uppercase text-ink/60">{t("profile.characterProfile")}</p>
            <h2 className="font-display text-4xl font-black uppercase leading-none">{t(gameState.titleKey)}</h2>
            <p className="mt-3 max-w-md text-sm font-semibold text-ink/70">{t("profile.builtFromProof")}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard
            label={t("profile.level")}
            value={gameState.level}
            detail={t("profile.progress", { value: gameState.levelProgress })}
            tone="bg-bolt"
          />
          <StatCard
            label={t("profile.streak")}
            value={`${gameState.streak}d`}
            detail={t("profile.activeLogging")}
            tone="bg-white"
          />
        </div>

        <div className="mt-6 border-2 border-ink bg-white p-4">
          <div className="flex items-center gap-2">
            <Award size={20} />
            <h3 className="font-display text-xl font-black uppercase">{t("profile.milestones")}</h3>
          </div>
          <div className="mt-4 grid gap-2 text-sm font-bold">
            {gameState.milestones.map((milestone) => (
              <div key={milestone.label} className="flex items-center justify-between border-2 border-ink bg-paper px-3 py-2">
                <span>{t(milestone.labelKey)}</span>
                <span>{milestone.done ? t("profile.done") : t("profile.locked")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-2 border-ink bg-white p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} />
            <h3 className="font-display text-xl font-black uppercase">{t("profile.accountStatus")}</h3>
          </div>
          <div className="mt-4 grid gap-2 text-sm font-bold">
            <div className="flex items-center justify-between border-2 border-ink bg-paper px-3 py-2">
              <span>{t("profile.localUser")}</span>
              <span>{currentAccount?.displayName ?? "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between border-2 border-ink bg-paper px-3 py-2">
              <span>{t("profile.savedLogs")}</span>
              <span>{entries.length}</span>
            </div>
            <div className="flex items-center justify-between border-2 border-ink bg-paper px-3 py-2">
              <span className="flex items-center gap-2">
                <Database size={16} />
                {t("profile.storage")}
              </span>
              <span>{t("profile.thisBrowser")}</span>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-ink/65">{t("profile.localOnly")}</p>
        </div>

        <div className="mt-6">
          <DataManager entries={entries} onImportEntries={onImportEntries} onClearEntries={onClearEntries} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Target size={23} />
          <h2 className="font-display text-2xl font-black uppercase">{t("profile.statsSheet")}</h2>
        </div>

        <div className="grid gap-3">
          {attributes.map((attribute) => (
            <AttributeBar
              key={attribute.id}
              label={t(`categories.${attribute.label}`)}
              value={gameState.attributeScores[attribute.id]}
              accent={attribute.accent}
              detail={t("profile.decayedGrowth", { value: gameState.attributeTotals[attribute.id] })}
            />
          ))}
        </div>

        <div className="border-2 border-ink bg-paper p-5 shadow-hard">
          <h2 className="font-display text-2xl font-black uppercase">{t("profile.lifetimeCategories")}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(categoryMeta).map(([category, meta]) => {
              const Icon = meta.icon;
              const value = gameState.categoryTotals[category] ?? 0;

              return (
                <div key={category} className="flex items-center justify-between border-2 border-ink bg-white p-3">
                  <span className="flex items-center gap-2 font-black">
                    <Icon size={18} />
                    {t(`categories.${category}`)}
                  </span>
                  <span className="font-display text-2xl font-black">{value > 0 ? `+${value}` : value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
