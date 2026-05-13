import { attributes, categoryMeta } from "../data/scoringRules.js";
import { getConsistencyFactor, roundGrowth } from "./scoring.js";
import { addDays, toDateKey } from "./dates.js";

const attributeDecay = 0.995;

function emptyAttributeTotals() {
  return attributes.reduce((totals, attribute) => {
    totals[attribute.id] = 0;
    return totals;
  }, {});
}

function emptyCategoryTotals() {
  return Object.keys(categoryMeta).reduce((totals, category) => {
    totals[category] = 0;
    return totals;
  }, {});
}

function getEntryGrowth(entry) {
  return Number(entry.growth ?? entry.xp ?? 0);
}

function getEntryDateKey(entry) {
  return entry.dateKey ?? toDateKey(entry.createdAt);
}

function getEntryCategoryGrowth(entry) {
  if (entry.categoryGrowth) return entry.categoryGrowth;
  if (entry.categoryXp) return entry.categoryXp;

  return (entry.categories ?? []).reduce((totals, category) => {
    totals[category] = roundGrowth((totals[category] ?? 0) + getEntryGrowth(entry));
    return totals;
  }, {});
}

function getEntryAttributeGrowth(entry) {
  return entry.attributeGrowth ?? entry.attributes ?? {};
}

function buildCategoryTotals(entries) {
  const categoryTotals = emptyCategoryTotals();

  entries.forEach((entry) => {
    Object.entries(getEntryCategoryGrowth(entry)).forEach(([category, value]) => {
      categoryTotals[category] = roundGrowth((categoryTotals[category] ?? 0) + value);
    });
  });

  return categoryTotals;
}

function buildDailyAttributeGrowth(entries) {
  return entries.reduce((dailyGrowth, entry) => {
    const dateKey = getEntryDateKey(entry);

    if (!dailyGrowth[dateKey]) {
      dailyGrowth[dateKey] = emptyAttributeTotals();
    }

    Object.entries(getEntryAttributeGrowth(entry)).forEach(([attribute, value]) => {
      dailyGrowth[dateKey][attribute] = roundGrowth((dailyGrowth[dateKey][attribute] ?? 0) + value);
    });

    return dailyGrowth;
  }, {});
}

// NewAttribute = OldAttribute * 0.995 + DailyGrowth
// We replay each logged day in order, decay yesterday's attribute value,
// then add that day's growth. Missing days still decay the current score.
function buildDecayedAttributeTotals(entries) {
  const attributeTotals = emptyAttributeTotals();
  const datedEntries = entries.filter((entry) => entry.createdAt || entry.dateKey);

  if (datedEntries.length === 0) {
    return attributeTotals;
  }

  const dailyGrowth = buildDailyAttributeGrowth(datedEntries);
  const firstDateKey = datedEntries
    .map(getEntryDateKey)
    .sort((a, b) => a.localeCompare(b))[0];
  let cursor = new Date(`${firstDateKey}T00:00:00`);
  const today = new Date(`${toDateKey()}T00:00:00`);

  while (cursor <= today) {
    const dateKey = toDateKey(cursor);

    attributes.forEach((attribute) => {
      attributeTotals[attribute.id] = roundGrowth(attributeTotals[attribute.id] * attributeDecay);
    });

    Object.entries(dailyGrowth[dateKey] ?? {}).forEach(([attribute, value]) => {
      attributeTotals[attribute] = roundGrowth((attributeTotals[attribute] ?? 0) + value);
    });

    cursor = addDays(cursor, 1);
  }

  return attributeTotals;
}

function buildAttributeScores(attributeTotals) {
  return attributes.reduce((scores, attribute) => {
    scores[attribute.id] = Math.max(0, Math.min(100, Math.round(attributeTotals[attribute.id])));
    return scores;
  }, {});
}

function computeStreak(entries) {
  const loggedDays = new Set(entries.map(getEntryDateKey));
  let cursor = new Date();
  let streak = 0;

  while (loggedDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

// Level = Math.floor(Math.sqrt(totalGrowth / 100))
// This nonlinear curve makes later levels require much more total growth.
function computeLevel(totalGrowth) {
  const safeGrowth = Math.max(0, totalGrowth);
  return Math.floor(Math.sqrt(safeGrowth / 100));
}

function getTitle(level) {
  if (level >= 10) return "Mythic Builder";
  if (level >= 7) return "Momentum Knight";
  if (level >= 4) return "Habit Adventurer";
  if (level >= 1) return "Level-One Human";
  return "Untrained Recruit";
}

function getTitleKey(level) {
  if (level >= 10) return "titles.mythicBuilder";
  if (level >= 7) return "titles.momentumKnight";
  if (level >= 4) return "titles.habitAdventurer";
  if (level >= 1) return "titles.levelOneHuman";
  return "titles.untrainedRecruit";
}

function buildLevelProgress(totalGrowth, level) {
  const safeGrowth = Math.max(0, totalGrowth);
  const currentLevelGrowth = level * level * 100;
  const nextLevelGrowth = (level + 1) * (level + 1) * 100;
  const growthIntoLevel = roundGrowth(safeGrowth - currentLevelGrowth);
  const growthToNext = roundGrowth(nextLevelGrowth - safeGrowth);
  const levelRange = nextLevelGrowth - currentLevelGrowth;
  const levelProgress = Math.round((growthIntoLevel / levelRange) * 100);

  return {
    currentLevelGrowth: growthIntoLevel,
    nextLevelGrowth: growthToNext,
    levelProgress: Math.max(0, Math.min(100, levelProgress)),
  };
}

function buildReportSummary(todayEntries, todayGrowth, todayPositiveGrowth, todayNegativeGrowth) {
  if (todayEntries.length === 0) {
    return "No quests logged today. The day is still open.";
  }

  if (todayGrowth >= 60) {
    return `Strong day: ${todayEntries.length} logs produced ${todayGrowth} net Growth. Keep the chain warm.`;
  }

  if (todayNegativeGrowth < 0 && todayPositiveGrowth > 0) {
    return `Mixed day: ${todayPositiveGrowth} Growth earned and ${Math.abs(todayNegativeGrowth)} Growth lost. The useful part is visible now.`;
  }

  if (todayGrowth < 0) {
    return `Penalty-heavy day: ${Math.abs(todayGrowth)} Growth below zero. One small recovery quest can still flip the tone.`;
  }

  return `Steady day: ${todayEntries.length} logs and ${todayGrowth} net Growth. Small actions are becoming trackable.`;
}

export function buildGameState(entries) {
  const todayKey = toDateKey();
  const todayEntries = entries.filter((entry) => getEntryDateKey(entry) === todayKey);
  const totalGrowth = roundGrowth(entries.reduce((total, entry) => total + getEntryGrowth(entry), 0));
  const todayGrowth = roundGrowth(todayEntries.reduce((total, entry) => total + getEntryGrowth(entry), 0));
  const todayPositiveGrowth = roundGrowth(
    todayEntries.filter((entry) => getEntryGrowth(entry) > 0).reduce((total, entry) => total + getEntryGrowth(entry), 0),
  );
  const todayNegativeGrowth = roundGrowth(
    todayEntries.filter((entry) => getEntryGrowth(entry) < 0).reduce((total, entry) => total + getEntryGrowth(entry), 0),
  );
  const level = computeLevel(totalGrowth);
  const { currentLevelGrowth, nextLevelGrowth, levelProgress } = buildLevelProgress(totalGrowth, level);
  const attributeTotals = buildDecayedAttributeTotals(entries);
  const attributeScores = buildAttributeScores(attributeTotals);
  const categoryTotals = buildCategoryTotals(entries);
  const todayCategoryTotals = buildCategoryTotals(todayEntries);
  const streak = computeStreak(entries);
  const streakMultiplier = getConsistencyFactor(streak);

  return {
    level,
    title: getTitle(level),
    titleKey: getTitleKey(level),
    totalGrowth,
    todayGrowth,
    todayPositiveGrowth,
    todayNegativeGrowth,
    currentLevelGrowth,
    nextLevelGrowth,
    levelProgress,
    streak,
    streakMultiplier,
    attributeTotals,
    attributeScores,
    categoryTotals,
    todayCategoryTotals,
    todayEntries,
    reportSummary: buildReportSummary(todayEntries, todayGrowth, todayPositiveGrowth, todayNegativeGrowth),
    milestones: [
      { label: "First Log", labelKey: "milestones.firstLog", done: entries.length >= 1 },
      { label: "Level 3", labelKey: "milestones.levelThree", done: level >= 3 },
      { label: "Three-Day Streak", labelKey: "milestones.threeDayStreak", done: streak >= 3 },
      { label: "100 Body Growth", labelKey: "milestones.bodyGrowth", done: attributeTotals.body >= 100 },
    ],

    // Compatibility aliases for older components and older localStorage data.
    totalXp: totalGrowth,
    todayXp: todayGrowth,
    todayPositiveXp: todayPositiveGrowth,
    todayNegativeXp: todayNegativeGrowth,
    currentLevelXp: currentLevelGrowth,
    nextLevelXp: nextLevelGrowth,
  };
}
