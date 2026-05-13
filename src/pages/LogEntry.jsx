import { ActivityComposer } from "../components/ActivityComposer.jsx";
import { EntryCard } from "../components/EntryCard.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function LogEntry({ entries, gameState, onAddEntry, onDeleteEntry, onUpdateEntry }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <ActivityComposer gameState={gameState} onAddEntry={onAddEntry} title={t("composer.inboxTitle")} />

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-black uppercase">{t("nav.log")}</h2>
        <div className="grid gap-3">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onDeleteEntry={onDeleteEntry} onUpdateEntry={onUpdateEntry} />
          ))}
        </div>
      </section>
    </div>
  );
}
