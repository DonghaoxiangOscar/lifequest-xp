import { categoryMeta } from "../data/scoringRules.js";

function fallbackTranslate(key, params = {}) {
  const fallbackText = {
    "dailyReportText.logOne": "Log one small action to start today's chain.",
    "dailyReportText.addBody": "Add a short walk or workout for Body growth.",
    "dailyReportText.addKnowledge": "Add a focused study block for Knowledge growth.",
    "dailyReportText.protectAttention": "Protect attention by replacing one low-value habit tomorrow.",
    "dailyReportText.clearStructure": "A clear log structure is forming.",
    "dailyReportText.noPenalty": "No major penalty category today.",
    "dailyReportText.repeatStrongest": "Repeat the strongest habit tomorrow.",
    "dailyReportText.noQuests": "No quests logged today. The day is still open.",
    "dailyReportText.strongDay": "Strong day: {count} logs produced {growth} net Growth. Keep the chain warm.",
    "dailyReportText.mixedDay":
      "Mixed day: {positive} Growth earned and {negative} Growth lost. The useful part is visible now.",
    "dailyReportText.penaltyHeavy":
      "Penalty-heavy day: {negative} Growth below zero. One small recovery quest can still flip the tone.",
    "dailyReportText.steadyDay":
      "Steady day: {count} logs and {growth} net Growth. Small actions are becoming trackable.",
    "categories.Body": "Body",
    "categories.Knowledge": "Knowledge",
    "categories.Health": "Health",
    "categories.Discipline": "Discipline",
    "categories.Social": "Social",
    "categories.Waste": "Waste",
  };

  const template = fallbackText[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, paramKey) =>
    Object.prototype.hasOwnProperty.call(params, paramKey) ? String(params[paramKey]) : `{${paramKey}}`,
  );
}

function topPositiveCategories(categoryTotals) {
  return Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([category]) => category);
}

function negativeCategories(categoryTotals) {
  return Object.entries(categoryTotals)
    .filter(([, value]) => value < 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([category]) => category);
}

function localizeCategory(category, t) {
  return categoryMeta[category] ? t(`categories.${category}`) : category;
}

export function buildRuleBasedDailyReport(gameState, t = fallbackTranslate) {
  const strengthCategories = topPositiveCategories(gameState.todayCategoryTotals);
  const weaknessCategories = negativeCategories(gameState.todayCategoryTotals);
  const suggestions = [];

  if (gameState.todayEntries.length === 0) {
    suggestions.push(t("dailyReportText.logOne"));
  }

  if (!strengthCategories.includes("Body")) {
    suggestions.push(t("dailyReportText.addBody"));
  }

  if (!strengthCategories.includes("Knowledge")) {
    suggestions.push(t("dailyReportText.addKnowledge"));
  }

  if (weaknessCategories.length > 0) {
    suggestions.push(t("dailyReportText.protectAttention"));
  }

  return {
    score: gameState.todayGrowth,
    strengths:
      strengthCategories.length > 0
        ? strengthCategories.map((category) => localizeCategory(category, t))
        : [t("dailyReportText.clearStructure")],
    weaknesses:
      weaknessCategories.length > 0
        ? weaknessCategories.map((category) => localizeCategory(category, t))
        : [t("dailyReportText.noPenalty")],
    suggestions: suggestions.length > 0 ? suggestions.slice(0, 3) : [t("dailyReportText.repeatStrongest")],
  };
}

export function buildRuleBasedDaySummary(gameState, t = fallbackTranslate) {
  if (gameState.todayEntries.length === 0) {
    return t("dailyReportText.noQuests");
  }

  if (gameState.todayGrowth >= 60) {
    return t("dailyReportText.strongDay", {
      count: gameState.todayEntries.length,
      growth: gameState.todayGrowth,
    });
  }

  if (gameState.todayNegativeGrowth < 0 && gameState.todayPositiveGrowth > 0) {
    return t("dailyReportText.mixedDay", {
      positive: gameState.todayPositiveGrowth,
      negative: Math.abs(gameState.todayNegativeGrowth),
    });
  }

  if (gameState.todayGrowth < 0) {
    return t("dailyReportText.penaltyHeavy", {
      negative: Math.abs(gameState.todayGrowth),
    });
  }

  return t("dailyReportText.steadyDay", {
    count: gameState.todayEntries.length,
    growth: gameState.todayGrowth,
  });
}
