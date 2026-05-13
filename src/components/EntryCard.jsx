import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ActivityBreakdown } from "./ActivityBreakdown.jsx";
import { CategoryPill } from "./CategoryPill.jsx";
import { StructuredActivityEditor } from "./StructuredActivityEditor.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { formatEntryTime } from "../utils/dates.js";
import { normalizeEditableActivities } from "../utils/activityDefaults.js";
import { parseActivities } from "../utils/parser.js";

export function EntryCard({ entry, onDeleteEntry, onUpdateEntry }) {
  const { t } = useLanguage();
  const growth = entry.growth ?? entry.xp ?? 0;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(entry.text);
  const [editActivities, setEditActivities] = useState([]);

  function startEditing() {
    setEditText(entry.text);
    setEditActivities(normalizeEditableActivities(entry.activities?.length ? entry.activities : parseActivities(entry.text).activities));
    setIsEditing(true);
  }

  function saveEdit() {
    onUpdateEntry?.(entry.id, editText, editActivities);
    setIsEditing(false);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  return (
    <article className="border-2 border-ink bg-paper p-4 shadow-hard">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink/60">{formatEntryTime(entry.createdAt)}</p>
          <h3 className="mt-1 text-base font-black leading-snug">{entry.text}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`min-w-16 border-2 border-ink px-2 py-1 text-center font-display text-lg font-black ${
              growth >= 0 ? "bg-bolt text-ink" : "bg-ember text-paper"
            }`}
          >
            {growth > 0 ? `+${growth}` : growth}
          </span>
          {onDeleteEntry && (
            <button
              className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-white transition hover:bg-ember hover:text-paper focus:outline-none focus:ring-4 focus:ring-ink/20"
              type="button"
              aria-label={t("entry.delete")}
              title={t("entry.delete")}
              onClick={() => onDeleteEntry(entry.id)}
            >
              <Trash2 size={17} />
            </button>
          )}
          {onUpdateEntry && !isEditing && (
            <button
              className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-white transition hover:bg-bolt focus:outline-none focus:ring-4 focus:ring-ink/20"
              type="button"
              aria-label={t("entry.edit")}
              title={t("entry.edit")}
              onClick={startEditing}
            >
              <Pencil size={17} />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-4 space-y-3">
          <textarea
            className="min-h-24 w-full resize-y border-2 border-ink bg-white p-3 text-sm font-bold outline-none focus:ring-4 focus:ring-ink/15"
            value={editText}
            onChange={(event) => setEditText(event.target.value)}
          />
          <StructuredActivityEditor activities={editActivities} onChange={setEditActivities} />
          <div className="flex flex-wrap gap-2">
            <button
              className="flex min-h-10 items-center gap-2 border-2 border-ink bg-ink px-3 py-2 font-black text-paper transition hover:bg-moss focus:outline-none focus:ring-4 focus:ring-ink/20"
              type="button"
              onClick={saveEdit}
            >
              <Check size={17} />
              {t("entry.save")}
            </button>
            <button
              className="flex min-h-10 items-center gap-2 border-2 border-ink bg-white px-3 py-2 font-black transition hover:bg-bolt focus:outline-none focus:ring-4 focus:ring-ink/20"
              type="button"
              onClick={cancelEdit}
            >
              <X size={17} />
              {t("entry.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {entry.categories.map((category) => (
              <CategoryPill key={category} category={category} />
            ))}
          </div>

          {entry.activities?.length > 0 && (
            <div className="mt-4">
              <ActivityBreakdown activities={entry.activities} />
            </div>
          )}
        </>
      )}
    </article>
  );
}
