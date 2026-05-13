import { Check, Cloud, Database, Globe2, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function Settings() {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const selectedLanguage = supportedLanguages.find((option) => option.id === language) ?? supportedLanguages[0];

  const betaStatuses = [
    { icon: Check, label: t("settings.statusReady"), tone: "bg-moss text-paper" },
    { icon: ShieldCheck, label: t("settings.statusLocal"), tone: "bg-bolt text-ink" },
    { icon: Cloud, label: t("settings.statusCloudNeeded"), tone: "bg-white text-ink" },
    { icon: Sparkles, label: t("settings.statusAiBackend"), tone: "bg-white text-ink" },
  ];

  return (
    <div className="space-y-6">
      <section className="border-2 border-ink bg-ink p-5 text-paper shadow-hard sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-bolt">{t("app.publicBeta")}</p>
            <h2 className="mt-2 font-display text-5xl font-black uppercase leading-none">{t("settings.title")}</h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold text-paper/75">{t("settings.subtitle")}</p>
          </div>
          <div className="flex min-h-12 items-center gap-2 border-2 border-paper bg-bolt px-3 py-2 text-ink">
            <Globe2 size={20} />
            <span className="text-xs font-black uppercase">{t("settings.currentLanguage")}</span>
            <span className="font-display text-2xl font-black">{selectedLanguage.nativeLabel}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-2 border-ink bg-paper p-5 shadow-hard sm:p-6">
          <div className="flex items-center gap-2">
            <Globe2 size={22} />
            <h3 className="font-display text-2xl font-black uppercase">{t("settings.displayLanguage")}</h3>
          </div>
          <p className="mt-2 text-sm font-semibold text-ink/70">{t("settings.displayLanguageCopy")}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {supportedLanguages.map((option) => {
              const isSelected = option.id === language;

              return (
                <button
                  key={option.id}
                  className={`flex min-h-24 items-center justify-between border-2 border-ink p-4 text-left shadow-hard transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20 ${
                    isSelected ? "bg-bolt" : "bg-white"
                  }`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setLanguage(option.id)}
                >
                  <div>
                    <p className="text-xs font-black uppercase text-ink/60">{option.label}</p>
                    <p className="mt-1 font-display text-3xl font-black uppercase">{option.nativeLabel}</p>
                  </div>
                  {isSelected && (
                    <span className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-ink text-paper">
                      <Check size={18} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-2 border-ink bg-white p-3 text-sm font-bold text-ink/70">
            {t("settings.savedLocally")}: <span className="text-ink">{selectedLanguage.nativeLabel}</span>
          </div>
        </div>

        <div className="border-2 border-ink bg-paper p-5 shadow-hard sm:p-6">
          <div className="flex items-center gap-2">
            <Rocket size={22} />
            <h3 className="font-display text-2xl font-black uppercase">{t("settings.publicBeta")}</h3>
          </div>
          <p className="mt-2 text-sm font-semibold text-ink/70">{t("settings.publicBetaCopy")}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {betaStatuses.map((status) => {
              const Icon = status.icon;

              return (
                <div key={status.label} className={`flex min-h-16 items-center gap-3 border-2 border-ink p-3 ${status.tone}`}>
                  <Icon size={20} />
                  <span className="font-black">{status.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="border-2 border-ink bg-paper p-5 shadow-hard">
          <div className="flex items-center gap-2">
            <Database size={22} />
            <h3 className="font-display text-2xl font-black uppercase">{t("settings.deploymentTitle")}</h3>
          </div>
          <p className="mt-3 text-sm font-semibold text-ink/70">{t("settings.deploymentCopy")}</p>
        </div>

        <div className="border-2 border-ink bg-paper p-5 shadow-hard">
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} />
            <h3 className="font-display text-2xl font-black uppercase">{t("settings.privacyTitle")}</h3>
          </div>
          <p className="mt-3 text-sm font-semibold text-ink/70">{t("settings.privacyCopy")}</p>
        </div>
      </section>
    </div>
  );
}
