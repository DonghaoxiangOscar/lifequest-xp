import {
  AlertTriangle,
  Check,
  Clipboard,
  Cloud,
  Database,
  Globe2,
  LogOut,
  MessageSquareText,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { DataManager } from "../components/DataManager.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { isSupabaseConfigured } from "../utils/supabaseClient.js";

export function Settings({
  authMode = "local",
  currentAccount,
  entries = [],
  onClearEntries,
  onImportEntries,
  onLogout,
  onRetrySync,
  syncError = "",
  syncStatus = "idle",
}) {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const [notice, setNotice] = useState("");
  const selectedLanguage = supportedLanguages.find((option) => option.id === language) ?? supportedLanguages[0];
  const isCloudMode = authMode === "cloud";
  const accountEmail = currentAccount?.email ?? t("settings.unknownEmail");

  const betaStatuses = [
    { icon: Check, label: t("settings.statusReady"), tone: "bg-moss text-paper" },
    {
      icon: ShieldCheck,
      label: isCloudMode ? t("settings.statusCloudAuth") : t("settings.statusLocal"),
      tone: isCloudMode ? "bg-moss text-paper" : "bg-bolt text-ink",
    },
    {
      icon: Cloud,
      label: isSupabaseConfigured ? t("settings.statusCloudConfigured") : t("settings.statusCloudNeeded"),
      tone: isSupabaseConfigured ? "bg-moss text-paper" : "bg-white text-ink",
    },
    { icon: Sparkles, label: t("settings.statusAiBackend"), tone: "bg-white text-ink" },
  ];

  async function copyDeletionRequest() {
    const requestText = t("settings.deletionRequestTemplate", { email: accountEmail });

    try {
      await navigator.clipboard.writeText(requestText);
      setNotice(t("settings.deletionRequestCopied"));
    } catch {
      setNotice(requestText);
    }
  }

  async function copyFeedbackTemplate() {
    const feedbackText = t("settings.feedbackTemplate", {
      email: accountEmail,
      logs: entries.length,
      mode: authMode,
      syncStatus: t(`sync.${syncStatus}`),
    });

    try {
      await navigator.clipboard.writeText(feedbackText);
      setNotice(t("settings.feedbackCopied"));
    } catch {
      setNotice(feedbackText);
    }
  }

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

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-2 border-ink bg-paper p-5 shadow-hard sm:p-6">
          <div className="flex items-center gap-2">
            <UserRound size={22} />
            <h3 className="font-display text-2xl font-black uppercase">{t("settings.accountTitle")}</h3>
          </div>
          <p className="mt-2 text-sm font-semibold text-ink/70">{t("settings.accountCopy")}</p>

          <div className="mt-5 grid gap-2 text-sm font-bold">
            <div className="flex items-center justify-between gap-3 border-2 border-ink bg-white px-3 py-2">
              <span>{t("settings.accountName")}</span>
              <span className="text-right">{currentAccount?.displayName ?? "Player"}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-2 border-ink bg-white px-3 py-2">
              <span>{t("settings.accountEmail")}</span>
              <span className="max-w-64 truncate text-right">{accountEmail}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-2 border-ink bg-white px-3 py-2">
              <span>{t("profile.syncStatus")}</span>
              <span>{t(`sync.${syncStatus}`)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-2 border-ink bg-white px-3 py-2">
              <span>{t("profile.savedLogs")}</span>
              <span>{entries.length}</span>
            </div>
          </div>

          {syncError && <p className="mt-3 border-2 border-ink bg-white px-3 py-2 text-sm font-bold text-ember">{syncError}</p>}

          {onRetrySync && (
            <button
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 border-2 border-ink bg-bolt px-3 py-2 font-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/40"
              type="button"
              disabled={syncStatus === "syncing"}
              onClick={onRetrySync}
            >
              <RefreshCw size={18} className={syncStatus === "syncing" ? "animate-spin" : ""} />
              {t("sync.retry")}
            </button>
          )}

          <button
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 border-2 border-ink bg-white px-3 py-2 font-black transition hover:-translate-y-0.5 hover:bg-bolt focus:outline-none focus:ring-4 focus:ring-ink/20"
            type="button"
            onClick={onLogout}
          >
            <LogOut size={18} />
            {t("nav.logout")}
          </button>
        </div>

        <DataManager
          authMode={authMode}
          entries={entries}
          onClearEntries={onClearEntries}
          onImportEntries={onImportEntries}
        />
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
          <p className="mt-2 text-sm font-semibold text-ink/70">
            {isCloudMode ? t("settings.publicBetaCloudCopy") : t("settings.publicBetaCopy")}
          </p>

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
          <p className="mt-4 text-xs font-black uppercase text-ink/55">
            {t("profile.syncStatus")}: {t(`sync.${syncStatus}`)}
          </p>
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

      <section className="border-2 border-ink bg-paper p-5 shadow-hard sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareText size={22} />
              <h3 className="font-display text-2xl font-black uppercase">{t("settings.feedbackTitle")}</h3>
            </div>
            <p className="mt-2 max-w-3xl text-sm font-semibold text-ink/70">{t("settings.feedbackCopy")}</p>
          </div>
          <button
            className="flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-bolt px-4 py-3 font-black text-ink shadow-hard transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20"
            type="button"
            onClick={copyFeedbackTemplate}
          >
            <Clipboard size={18} />
            {t("settings.copyFeedback")}
          </button>
        </div>
      </section>

      <section className="border-2 border-ink bg-paper p-5 shadow-hard sm:p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle size={22} />
          <h3 className="font-display text-2xl font-black uppercase">{t("settings.dangerTitle")}</h3>
        </div>
        <p className="mt-2 text-sm font-semibold text-ink/70">{t("settings.dangerCopy")}</p>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <button
            className="flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-white px-4 py-3 font-black transition hover:-translate-y-0.5 hover:bg-ember hover:text-paper focus:outline-none focus:ring-4 focus:ring-ink/20 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/40"
            type="button"
            disabled={entries.length === 0}
            onClick={onClearEntries}
          >
            <Trash2 size={18} />
            {t("settings.clearData")}
          </button>

          <button
            className="flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-bolt px-4 py-3 font-black text-ink transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20"
            type="button"
            onClick={copyDeletionRequest}
          >
            <Clipboard size={18} />
            {t("settings.copyDeletionRequest")}
          </button>
        </div>

        {notice && <p className="mt-3 border-2 border-ink bg-white px-3 py-2 text-sm font-bold text-ink/70">{notice}</p>}
        <p className="mt-3 text-xs font-bold text-ink/55">{t("settings.deleteAccountBackendNote")}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="border-2 border-ink bg-white p-5 shadow-hard">
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} />
            <h3 className="font-display text-2xl font-black uppercase">{t("settings.privacyPolicyTitle")}</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm font-semibold text-ink/75">
            <p>{t("settings.privacyPolicy1")}</p>
            <p>{t("settings.privacyPolicy2")}</p>
            <p>{t("settings.privacyPolicy3")}</p>
          </div>
        </div>

        <div className="border-2 border-ink bg-white p-5 shadow-hard">
          <div className="flex items-center gap-2">
            <Clipboard size={22} />
            <h3 className="font-display text-2xl font-black uppercase">{t("settings.termsTitle")}</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm font-semibold text-ink/75">
            <p>{t("settings.terms1")}</p>
            <p>{t("settings.terms2")}</p>
            <p>{t("settings.terms3")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
