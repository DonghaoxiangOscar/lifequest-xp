import { useMemo, useState } from "react";
import { Activity, BarChart3, ClipboardPenLine, Settings as SettingsIcon, Shield, UserRound } from "lucide-react";
import { AuthGate } from "./components/AuthGate.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { LogEntry } from "./pages/LogEntry.jsx";
import { DailyReport } from "./pages/DailyReport.jsx";
import { Profile } from "./pages/Profile.jsx";
import { Settings } from "./pages/Settings.jsx";
import { AppShell } from "./components/AppShell.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useEntries } from "./hooks/useEntries.js";
import { useLanguage } from "./i18n/LanguageContext.jsx";
import { createEmptyEntries } from "./utils/initialData.js";
import { analyzeEntry, analyzeParsedActivities } from "./utils/scoring.js";
import { createEntry, seedEntries } from "./utils/storage.js";
import { buildGameState } from "./utils/stats.js";

const pages = [
  { id: "dashboard", labelKey: "nav.dashboard", icon: Activity },
  { id: "log", labelKey: "nav.log", icon: ClipboardPenLine },
  { id: "report", labelKey: "nav.report", icon: BarChart3 },
  { id: "profile", labelKey: "nav.profile", icon: UserRound },
  { id: "settings", labelKey: "nav.settings", icon: SettingsIcon },
];

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const auth = useAuth();
  const { t } = useLanguage();
  const entryStore = useEntries(auth.currentAccount, createEmptyEntries);
  const entries = entryStore.entries;

  const gameState = useMemo(() => buildGameState(entries), [entries]);

  if (!auth.isAuthReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4 text-ink">
        <div className="border-2 border-ink bg-white px-5 py-4 font-black shadow-hard">{t("app.loading")}</div>
      </main>
    );
  }

  if (!auth.currentAccount) {
    return (
      <AuthGate
        authMode={auth.authMode}
        startupError={auth.authError}
        onLogin={auth.login}
        onRegister={auth.register}
      />
    );
  }

  if (!entryStore.isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4 text-ink">
        <div className="border-2 border-ink bg-white px-5 py-4 font-black shadow-hard">{t("app.loading")}</div>
      </main>
    );
  }

  async function addEntry(text, parsedActivities) {
    const analysis = parsedActivities
      ? analyzeParsedActivities(parsedActivities, { streakDays: gameState.streak })
      : analyzeEntry(text, { streakDays: gameState.streak });
    await entryStore.addEntry(createEntry(text, analysis));
    setActivePage("dashboard");
  }

  async function updateEntry(entryId, text, parsedActivities) {
    await entryStore.updateEntry(entryId, (entry) => {
      const analysis = parsedActivities
        ? analyzeParsedActivities(parsedActivities, { streakDays: gameState.streak })
        : analyzeEntry(text, { streakDays: gameState.streak });

      return {
        ...createEntry(text, analysis, new Date(entry.createdAt)),
        id: entry.id,
      };
    });
  }

  function deleteEntry(entryId) {
    entryStore.deleteEntry(entryId);
  }

  function loadDemoData() {
    if (entries.length > 0) {
      const shouldReplace = window.confirm(t("messages.loadDemoConfirm"));
      if (!shouldReplace) return;
    }

    entryStore.replaceEntries(seedEntries());
    setActivePage("dashboard");
  }

  function importEntries(importedEntries) {
    if (!Array.isArray(importedEntries)) return;
    entryStore.replaceEntries(importedEntries);
    setActivePage("dashboard");
  }

  async function clearEntries() {
    if (entries.length === 0) return;

    const shouldClear = window.confirm(t("messages.clearConfirm"));
    if (!shouldClear) return;

    await entryStore.clearEntries();
    setActivePage("dashboard");
  }

  const pageProps = {
    entries,
    gameState,
    onAddEntry: addEntry,
    onDeleteEntry: deleteEntry,
    onUpdateEntry: updateEntry,
    onImportEntries: importEntries,
    onClearEntries: clearEntries,
    onLoadDemoData: loadDemoData,
    currentAccount: auth.currentAccount,
    authMode: auth.authMode,
    isEntriesLoaded: entryStore.isLoaded,
    storageLabel: entryStore.storageLabel,
    syncError: entryStore.syncError,
    syncStatus: entryStore.syncStatus,
  };

  return (
    <AppShell
      pages={pages}
      activePage={activePage}
      onNavigate={setActivePage}
      currentAccount={auth.currentAccount}
      authMode={auth.authMode}
      syncError={entryStore.syncError}
      syncStatus={entryStore.syncStatus}
      onLogout={auth.logout}
      onLoadDemoData={loadDemoData}
    >
      {activePage === "dashboard" && <Dashboard {...pageProps} />}
      {activePage === "log" && <LogEntry {...pageProps} />}
      {activePage === "report" && <DailyReport {...pageProps} />}
      {activePage === "profile" && <Profile {...pageProps} />}
      {activePage === "settings" && <Settings {...pageProps} onLogout={auth.logout} />}

      <button
        className="fixed bottom-5 right-5 flex h-14 w-14 items-center justify-center border-2 border-ink bg-bolt text-ink shadow-hard transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-ink/20 md:hidden"
        type="button"
        aria-label={t("nav.openLog")}
        title={t("nav.openLog")}
        onClick={() => setActivePage("log")}
      >
        <Shield size={24} />
      </button>
    </AppShell>
  );
}
