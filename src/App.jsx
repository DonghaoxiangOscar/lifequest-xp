import { useMemo, useState } from "react";
import { Activity, BarChart3, ClipboardPenLine, Settings as SettingsIcon, Shield, UserRound } from "lucide-react";
import { AuthGate } from "./components/AuthGate.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { LogEntry } from "./pages/LogEntry.jsx";
import { DailyReport } from "./pages/DailyReport.jsx";
import { Profile } from "./pages/Profile.jsx";
import { Settings } from "./pages/Settings.jsx";
import { AppShell } from "./components/AppShell.jsx";
import { useAccountEntries } from "./hooks/useAccountEntries.js";
import { useLocalAuth } from "./hooks/useLocalAuth.js";
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
  const auth = useLocalAuth();
  const { t } = useLanguage();
  const [entries, setEntries] = useAccountEntries(auth.currentAccount?.id, createEmptyEntries);

  const gameState = useMemo(() => buildGameState(entries), [entries]);

  if (!auth.currentAccount) {
    return <AuthGate onLogin={auth.login} onRegister={auth.register} />;
  }

  function addEntry(text, parsedActivities) {
    const analysis = parsedActivities
      ? analyzeParsedActivities(parsedActivities, { streakDays: gameState.streak })
      : analyzeEntry(text, { streakDays: gameState.streak });
    setEntries((currentEntries) => [createEntry(text, analysis), ...currentEntries]);
    setActivePage("dashboard");
  }

  function updateEntry(entryId, text, parsedActivities) {
    setEntries((currentEntries) =>
      currentEntries.map((entry) => {
        if (entry.id !== entryId) return entry;

        const analysis = parsedActivities
          ? analyzeParsedActivities(parsedActivities, { streakDays: gameState.streak })
          : analyzeEntry(text, { streakDays: gameState.streak });

        return {
          ...createEntry(text, analysis, new Date(entry.createdAt)),
          id: entry.id,
        };
      }),
    );
  }

  function deleteEntry(entryId) {
    setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== entryId));
  }

  function loadDemoData() {
    if (entries.length > 0) {
      const shouldReplace = window.confirm(t("messages.loadDemoConfirm"));
      if (!shouldReplace) return;
    }

    setEntries(seedEntries());
    setActivePage("dashboard");
  }

  function importEntries(importedEntries) {
    if (!Array.isArray(importedEntries)) return;
    setEntries(importedEntries);
    setActivePage("dashboard");
  }

  function clearEntries() {
    if (entries.length === 0) return;

    const shouldClear = window.confirm(t("messages.clearConfirm"));
    if (!shouldClear) return;

    setEntries(createEmptyEntries());
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
  };

  return (
    <AppShell
      pages={pages}
      activePage={activePage}
      onNavigate={setActivePage}
      currentAccount={auth.currentAccount}
      onLogout={auth.logout}
      onLoadDemoData={loadDemoData}
    >
      {activePage === "dashboard" && <Dashboard {...pageProps} />}
      {activePage === "log" && <LogEntry {...pageProps} />}
      {activePage === "report" && <DailyReport {...pageProps} />}
      {activePage === "profile" && <Profile {...pageProps} />}
      {activePage === "settings" && <Settings />}

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
