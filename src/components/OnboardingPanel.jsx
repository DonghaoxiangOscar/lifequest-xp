import { ArrowRight, ClipboardCheck, Mic, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function OnboardingPanel({ onDismiss, onLoadDemoData, onOpenLog, onQuickStart }) {
  const { t } = useLanguage();

  const steps = [
    {
      icon: ClipboardCheck,
      title: t("onboarding.stepLogTitle"),
      copy: t("onboarding.stepLogCopy"),
    },
    {
      icon: Mic,
      title: t("onboarding.stepVoiceTitle"),
      copy: t("onboarding.stepVoiceCopy"),
    },
    {
      icon: ShieldCheck,
      title: t("onboarding.stepPrivateTitle"),
      copy: t("onboarding.stepPrivateCopy"),
    },
  ];

  function startLogging() {
    onDismiss();
    onOpenLog();
  }

  function addStarterActivity() {
    onDismiss();
    onQuickStart("Studied for 30 minutes");
  }

  function loadDemo() {
    onDismiss();
    onLoadDemoData();
  }

  return (
    <section className="border-2 border-ink bg-bolt p-5 shadow-hard sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr] xl:items-center">
        <div>
          <p className="text-xs font-black uppercase text-ink/60">{t("onboarding.eyebrow")}</p>
          <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none">
            {t("onboarding.title")}
          </h2>
          <p className="mt-3 text-sm font-bold text-ink/70">{t("onboarding.copy")}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="border-2 border-ink bg-paper p-4">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-white">
                  <Icon size={19} />
                </div>
                <h3 className="mt-3 font-display text-xl font-black uppercase leading-tight">{step.title}</h3>
                <p className="mt-2 text-sm font-semibold text-ink/65">{step.copy}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          className="flex min-h-11 items-center justify-center gap-2 border-2 border-ink bg-ink px-4 py-2 font-black text-paper shadow-hard transition hover:-translate-y-0.5 hover:bg-moss focus:outline-none focus:ring-4 focus:ring-ink/20"
          type="button"
          onClick={startLogging}
        >
          {t("onboarding.startLogging")}
          <ArrowRight size={18} />
        </button>
        <button
          className="flex min-h-11 items-center justify-center gap-2 border-2 border-ink bg-white px-4 py-2 font-black shadow-hard transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20"
          type="button"
          onClick={addStarterActivity}
        >
          <ClipboardCheck size={18} />
          {t("onboarding.addStarter")}
        </button>
        <button
          className="flex min-h-11 items-center justify-center gap-2 border-2 border-ink bg-white px-4 py-2 font-black shadow-hard transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20"
          type="button"
          onClick={loadDemo}
        >
          <Sparkles size={18} />
          {t("onboarding.tryDemo")}
        </button>
        <button
          className="flex min-h-11 items-center justify-center border-2 border-ink bg-bolt px-4 py-2 font-black transition hover:bg-paper focus:outline-none focus:ring-4 focus:ring-ink/20"
          type="button"
          onClick={onDismiss}
        >
          {t("onboarding.skip")}
        </button>
      </div>
    </section>
  );
}
