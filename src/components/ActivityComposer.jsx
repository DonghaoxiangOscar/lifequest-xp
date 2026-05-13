import { Mic, MicOff, Plus, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ActivityBreakdown } from "./ActivityBreakdown.jsx";
import { CategoryPill } from "./CategoryPill.jsx";
import { StructuredActivityEditor } from "./StructuredActivityEditor.jsx";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { analyzeParsedActivities } from "../utils/scoring.js";
import { parseActivities } from "../utils/parser.js";
import { shouldUseAiParser } from "../utils/ai.js";
import { normalizeEditableActivities } from "../utils/activityDefaults.js";

const quickActions = [
  { labelKey: "composer.quickStudy", text: "Studied for 1 hour" },
  { labelKey: "composer.quickExercise", text: "Ran for 30 minutes" },
  { labelKey: "composer.quickMeal", text: "Ate a healthy meal" },
  { labelKey: "composer.quickScroll", text: "Scrolled social media for 30 minutes" },
];

export function ActivityComposer({ gameState, onAddEntry, title }) {
  const { language: appLanguage, t } = useLanguage();
  const defaultSpeechLanguage = appLanguage === "zh" ? "zh-CN" : "en-US";
  const [text, setText] = useState("");
  const [language, setLanguage] = useState(defaultSpeechLanguage);
  const [activities, setActivities] = useState([]);
  const displayTitle = title ?? t("composer.defaultTitle");
  const parseResult = useMemo(() => parseActivities(text), [text]);
  const preview = useMemo(
    () => analyzeParsedActivities(activities, { streakDays: gameState.streak, parserConfidence: parseResult.confidence }),
    [activities, gameState.streak, parseResult.confidence],
  );
  const canSubmit = activities.length > 0;
  const shouldSuggestAi = text.trim().length >= 3 && shouldUseAiParser(parseResult);
  const voice = useSpeechRecognition({
    language,
    onResult: (transcript) => setText((current) => (current ? `${current}, ${transcript}` : transcript)),
  });

  useEffect(() => {
    setLanguage(defaultSpeechLanguage);
  }, [defaultSpeechLanguage]);

  useEffect(() => {
    setActivities(normalizeEditableActivities(parseResult.activities));
  }, [parseResult]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    const sourceText = text.trim() || activities.map((activity) => activity.name).join(", ");
    onAddEntry(sourceText, activities);
    setText("");
    setActivities([]);
  }

  function handleQuickAction(actionText) {
    onAddEntry(actionText);
    setText("");
  }

  return (
    <section className="border-2 border-ink bg-paper p-5 shadow-hard sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-ink/60">{t("composer.eyebrow")}</p>
          <h2 className="font-display text-3xl font-black uppercase leading-tight">{displayTitle}</h2>
        </div>
        <button
          className={`flex min-h-12 items-center justify-center gap-2 border-2 border-ink px-4 py-3 font-black shadow-hard transition focus:outline-none focus:ring-4 focus:ring-ink/20 disabled:cursor-not-allowed disabled:bg-ink/20 ${
            voice.isListening ? "bg-ember text-paper" : "bg-bolt text-ink hover:-translate-y-0.5"
          }`}
          type="button"
          title={voice.isListening ? "Stop voice input" : "Start voice input"}
          disabled={!voice.isSupported}
          onClick={voice.isListening ? voice.stopListening : voice.startListening}
        >
          {voice.isListening ? <MicOff size={20} /> : <Mic size={20} />}
          {voice.isListening
            ? t("composer.listening")
            : voice.isSupported
              ? t("composer.voiceInput")
              : t("composer.voiceUnavailable")}
        </button>
      </div>

      <label className="mt-3 grid max-w-xs gap-1 text-xs font-black uppercase text-ink/60">
        {t("composer.voiceLanguage")}
        <select
          className="border-2 border-ink bg-white px-3 py-2 text-sm font-bold text-ink outline-none focus:ring-4 focus:ring-ink/15"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          <option value="en-US">{t("composer.english")}</option>
          <option value="zh-CN">{t("composer.chineseMandarin")}</option>
          <option value="zh-TW">{t("composer.chineseTraditional")}</option>
        </select>
      </label>

      {voice.error && <p className="mt-3 border-2 border-ink bg-white px-3 py-2 text-sm font-bold">{voice.error}</p>}
      {!voice.isSupported && (
        <p className="mt-3 border-2 border-ink bg-white px-3 py-2 text-sm font-bold">
          {t("composer.unsupported")}
        </p>
      )}

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <textarea
          className="min-h-32 w-full resize-y border-2 border-ink bg-white p-4 text-base font-semibold leading-relaxed shadow-hard outline-none transition focus:-translate-y-0.5 focus:ring-4 focus:ring-ink/15"
          placeholder={t("composer.placeholder")}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        <div className="grid gap-2 sm:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.labelKey}
              className="min-h-11 border-2 border-ink bg-white px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:bg-bolt focus:outline-none focus:ring-4 focus:ring-ink/20"
              type="button"
              onClick={() => handleQuickAction(action.text)}
            >
              {t(action.labelKey)}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
          <div className="border-2 border-ink bg-white p-4">
            <p className="text-xs font-black uppercase text-ink/60">{t("composer.previewGrowth")}</p>
            <p className={`font-display text-5xl font-black ${preview.growth < 0 ? "text-ember" : "text-ink"}`}>
              {preview.growth > 0 ? `+${preview.growth}` : preview.growth}
            </p>
            <p className="mt-2 text-xs font-black uppercase text-ink/50">
              {t("composer.parserConfidence", { value: Math.round(parseResult.confidence * 100) })}
            </p>
          </div>

          <div className="space-y-3">
            <ActivityBreakdown activities={preview.activities} emptyText={t("composer.previewEmpty")} />
            {shouldSuggestAi && (
              <div className="flex items-start gap-2 border-2 border-ink bg-white px-3 py-2 text-sm font-bold">
                <WandSparkles className="mt-0.5 shrink-0" size={17} />
                <span>{t("composer.lowConfidence")}</span>
              </div>
            )}
          </div>
        </div>

        <StructuredActivityEditor activities={activities} onChange={setActivities} />

        <div className="flex flex-wrap gap-2">
          {preview.categories.map((category) => (
            <CategoryPill key={category} category={category} />
          ))}
        </div>

        <button
          className="flex min-h-12 w-full items-center justify-center gap-2 border-2 border-ink bg-ink px-4 py-3 font-black text-paper shadow-hard transition hover:-translate-y-0.5 hover:bg-moss focus:outline-none focus:ring-4 focus:ring-ink/20 disabled:cursor-not-allowed disabled:bg-ink/40"
          type="submit"
          disabled={!canSubmit}
        >
          <Plus size={19} />
          {t("composer.addToToday")}
        </button>
      </form>
    </section>
  );
}
