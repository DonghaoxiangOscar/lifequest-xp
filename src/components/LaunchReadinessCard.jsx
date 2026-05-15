import { AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function LaunchReadinessCard({ isCloudMode, isSupabaseReady }) {
  const { t } = useLanguage();

  const checklist = [
    {
      key: "frontend",
      isReady: true,
      label: t("launch.frontend"),
      detail: t("launch.frontendDetail"),
    },
    {
      key: "cloud",
      isReady: isCloudMode && isSupabaseReady,
      label: t("launch.cloud"),
      detail: isCloudMode && isSupabaseReady ? t("launch.cloudReady") : t("launch.cloudPending"),
    },
    {
      key: "recovery",
      isReady: isCloudMode && isSupabaseReady,
      label: t("launch.recovery"),
      detail: isCloudMode && isSupabaseReady ? t("launch.recoveryReady") : t("launch.recoveryPending"),
    },
    {
      key: "headers",
      isReady: true,
      label: t("launch.headers"),
      detail: t("launch.headersDetail"),
    },
    {
      key: "manual",
      isReady: false,
      label: t("launch.manual"),
      detail: t("launch.manualDetail"),
    },
  ];

  return (
    <section className="border-2 border-ink bg-paper p-5 shadow-hard sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-ink/60">{t("launch.eyebrow")}</p>
          <h3 className="font-display text-2xl font-black uppercase">{t("launch.title")}</h3>
          <p className="mt-2 max-w-3xl text-sm font-semibold text-ink/70">{t("launch.copy")}</p>
        </div>
        <div className="flex min-h-11 items-center gap-2 border-2 border-ink bg-bolt px-3 py-2 font-black">
          <AlertTriangle size={18} />
          {t("launch.betaLabel")}
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        {checklist.map((item) => {
          const Icon = item.isReady ? CheckCircle2 : CircleDashed;

          return (
            <div key={item.key} className="border-2 border-ink bg-white p-3">
              <div
                className={`flex h-9 w-9 items-center justify-center border-2 border-ink ${
                  item.isReady ? "bg-moss text-paper" : "bg-bolt text-ink"
                }`}
              >
                <Icon size={18} />
              </div>
              <h4 className="mt-3 font-display text-lg font-black uppercase leading-tight">{item.label}</h4>
              <p className="mt-2 text-xs font-bold text-ink/60">{item.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
