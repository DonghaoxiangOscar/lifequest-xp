import { Download, Trash2, Upload } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function DataManager({ entries, onImportEntries, onClearEntries }) {
  const { t } = useLanguage();

  function exportData() {
    const payload = {
      app: "LifeQuest XP",
      version: 1,
      exportedAt: new Date().toISOString(),
      entries,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `lifequest-xp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const importedEntries = Array.isArray(data) ? data : data.entries;

        if (!Array.isArray(importedEntries)) {
          throw new Error("Backup file does not contain entries.");
        }

        const shouldImport = window.confirm(t("data.importConfirm"));
        if (shouldImport) {
          onImportEntries(importedEntries);
        }
      } catch {
        window.alert(t("data.importError"));
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <section className="border-2 border-ink bg-paper p-5 shadow-hard">
      <h2 className="font-display text-2xl font-black uppercase">{t("data.backup")}</h2>
      <p className="mt-2 text-sm font-semibold text-ink/70">{t("data.backupCopy")}</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button
          className="flex min-h-11 items-center justify-center gap-2 border-2 border-ink bg-bolt px-3 py-2 font-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ink/20"
          type="button"
          onClick={exportData}
        >
          <Download size={18} />
          {t("data.exportJson")}
        </button>

        <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 border-2 border-ink bg-white px-3 py-2 font-black transition hover:-translate-y-0.5 hover:bg-bolt focus-within:ring-4 focus-within:ring-ink/20">
          <Upload size={18} />
          {t("data.importJson")}
          <input className="sr-only" accept="application/json" type="file" onChange={importData} />
        </label>

        <button
          className="flex min-h-11 items-center justify-center gap-2 border-2 border-ink bg-white px-3 py-2 font-black transition hover:-translate-y-0.5 hover:bg-ember hover:text-paper focus:outline-none focus:ring-4 focus:ring-ink/20 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/40"
          type="button"
          disabled={entries.length === 0}
          onClick={onClearEntries}
        >
          <Trash2 size={18} />
          {t("data.clearLocal")}
        </button>
      </div>
    </section>
  );
}
