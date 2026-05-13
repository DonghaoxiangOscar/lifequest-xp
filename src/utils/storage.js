import { analyzeEntry } from "./scoring.js";
import { addDays, toDateKey } from "./dates.js";

export function createEntry(text, analysis = analyzeEntry(text), createdAt = new Date()) {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    createdAt: createdAt.toISOString(),
    dateKey: toDateKey(createdAt),
    growth: analysis.growth,
    xp: analysis.growth,
    categories: analysis.categories,
    categoryGrowth: analysis.categoryGrowth,
    categoryXp: analysis.categoryXp,
    attributeGrowth: analysis.attributeGrowth,
    attributes: analysis.attributes,
    activities: analysis.activities,
    parserConfidence: analysis.parserConfidence,
    needsAi: analysis.needsAi,
    matchedRuleIds: analysis.activities.map((activity) => activity.ruleId),
  };
}

export function seedEntries() {
  const now = new Date();

  return [
    createEntry("Studied React components for 45 minutes and took notes", undefined, now),
    createEntry("Went for a walk, drank water, and cooked a healthy meal", undefined, now),
    createEntry("Today I studied linear algebra for 2 hours and ran 30 minutes", undefined, now),
    createEntry("Scrolled social media for 30 minutes but still finished a focused work block", undefined, now),
    createEntry("Called a friend and planned tomorrow morning", undefined, addDays(now, -1)),
    createEntry("Lifted at the gym and meal prepped vegetables", undefined, addDays(now, -2)),
  ];
}
