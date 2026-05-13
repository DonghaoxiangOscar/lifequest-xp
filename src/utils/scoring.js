import { parseActivities } from "./parser.js";
import { normalizeEditableActivities } from "./activityDefaults.js";

export const difficultyFactors = {
  easy: 0.8,
  normal: 1,
  hard: 1.3,
  veryHard: 1.6,
};

export function roundGrowth(value) {
  return Math.round(value * 10) / 10;
}

// TimeFactor = Math.log(1 + minutes / 30)
// The log curve gives diminishing returns: longer work is rewarded, but
// 120 minutes is not worth four separate 30-minute sessions.
export function getTimeFactor(minutes) {
  return Math.log(1 + minutes / 30);
}

// ConsistencyFactor = 1 + Math.min(streakDays, 30) / 100
// A streak gives a small bonus, capped at +30%, so consistency matters
// without letting old streaks explode the score.
export function getConsistencyFactor(streakDays) {
  const safeStreak = Math.max(0, Number(streakDays) || 0);
  return 1 + Math.min(safeStreak, 30) / 100;
}

// DifficultyFactor comes from the parser/rule: easy, normal, hard, veryHard.
// Unknown values fall back to normal so custom activities remain safe.
export function getDifficultyFactor(difficulty) {
  return difficultyFactors[difficulty] ?? difficultyFactors.normal;
}

// Growth = BaseXP * TimeFactor * ConsistencyFactor * DifficultyFactor
// Scoring stays local, even when an AI parser is added later.
export function calculateGrowth(baseXp, minutes, streakDays, difficulty) {
  const timeFactor = getTimeFactor(minutes);
  const consistencyFactor = getConsistencyFactor(streakDays);
  const difficultyFactor = getDifficultyFactor(difficulty);
  const rawGrowth = baseXp * timeFactor * consistencyFactor * difficultyFactor;

  return {
    growth: roundGrowth(rawGrowth),
    timeFactor,
    consistencyFactor,
    difficultyFactor,
  };
}

function scaleAttributes(attributeWeights, timeFactor, consistencyFactor, difficultyFactor) {
  return Object.entries(attributeWeights).reduce((totals, [attribute, weight]) => {
    totals[attribute] = roundGrowth(weight * timeFactor * consistencyFactor * difficultyFactor);
    return totals;
  }, {});
}

function sumAttributes(activities) {
  return activities.reduce((totals, activity) => {
    Object.entries(activity.attributeGrowth).forEach(([attribute, value]) => {
      totals[attribute] = roundGrowth((totals[attribute] ?? 0) + value);
    });
    return totals;
  }, {});
}

function sumCategoryGrowth(activities) {
  return activities.reduce((totals, activity) => {
    totals[activity.category] = roundGrowth((totals[activity.category] ?? 0) + activity.growth);
    return totals;
  }, {});
}

function uniqueCategories(activities) {
  return [...new Set(activities.map((activity) => activity.category))];
}

export function scoreParsedActivity(parsedActivity, index = 0, options = {}) {
  const streakDays = options.streakDays ?? 0;
  const formula = calculateGrowth(
    parsedActivity.baseXp,
    parsedActivity.duration,
    streakDays,
    parsedActivity.difficulty,
  );
  const attributeGrowth = scaleAttributes(
    parsedActivity.attributeWeights,
    formula.timeFactor,
    formula.consistencyFactor,
    formula.difficultyFactor,
  );

  return {
    id: parsedActivity.id ?? `${index}-${parsedActivity.ruleId}`,
    text: parsedActivity.sourceText,
    label: parsedActivity.name,
    type: parsedActivity.type,
    parserCategory: parsedActivity.category,
    category: parsedActivity.displayCategory,
    baseXp: parsedActivity.baseXp,
    growth: formula.growth,
    xp: formula.growth,
    minutes: parsedActivity.duration,
    timeFactor: formula.timeFactor,
    consistencyFactor: formula.consistencyFactor,
    difficulty: parsedActivity.difficulty,
    difficultyFactor: formula.difficultyFactor,
    attributes: attributeGrowth,
    attributeGrowth,
    confidence: parsedActivity.confidence,
    ruleId: parsedActivity.ruleId,
    note: parsedActivity.note,
  };
}

export function analyzeEntry(rawText, options = {}) {
  const text = rawText.trim();

  if (!text) {
    return {
      growth: 0,
      xp: 0,
      categories: [],
      categoryGrowth: {},
      categoryXp: {},
      attributes: {},
      attributeGrowth: {},
      activities: [],
      parserConfidence: 0,
      needsAi: false,
      matchedRules: [],
      notes: [],
    };
  }

  const parseResult = parseActivities(text);
  return analyzeParsedActivities(parseResult.activities, {
    ...options,
    rawText: text,
    parserConfidence: parseResult.confidence,
    needsAi: parseResult.needsAi,
  });
}

export function analyzeParsedActivities(parsedActivities, options = {}) {
  const normalizedActivities = normalizeEditableActivities(parsedActivities);
  const activities = normalizedActivities.map((activity, index) => scoreParsedActivity(activity, index, options));
  const growth = roundGrowth(activities.reduce((total, activity) => total + activity.growth, 0));
  const categoryGrowth = sumCategoryGrowth(activities);
  const attributeGrowth = sumAttributes(activities);

  return {
    growth,
    xp: growth,
    categories: uniqueCategories(activities),
    categoryGrowth,
    categoryXp: categoryGrowth,
    attributes: attributeGrowth,
    attributeGrowth,
    activities,
    parserConfidence: options.parserConfidence ?? 1,
    needsAi: options.needsAi ?? false,
    matchedRules: activities,
    notes: activities.map((activity) => activity.note),
  };
}
