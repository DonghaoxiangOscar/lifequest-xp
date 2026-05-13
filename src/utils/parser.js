import { fallbackRule, scoringRules } from "../data/scoringRules.js";

const defaultMinutes = 30;
const splitPattern = /[,，;；。.!?\n\r]+|\s+(?:and|then|but)\s+|(?:然后|接着|之后)/i;

function includesKeyword(text, keyword) {
  return text.includes(keyword.toLowerCase());
}

function getRuleBaseXp(rule) {
  return rule.baseXp ?? rule.xp ?? 0;
}

function toParserCategory(category) {
  return category.toLowerCase();
}

export function splitActivityText(rawText) {
  return rawText
    .split(splitPattern)
    .map((activity) => activity.trim())
    .filter(Boolean);
}

// Converts text like "2 hours" or "30 minutes" into minutes.
// If a user does not write a duration, we assume 30 minutes to keep logging easy.
export function extractDuration(activityText) {
  const hourMatch = activityText.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|小时|小時)/i);
  const minuteMatch = activityText.match(/(\d+(?:\.\d+)?)\s*(minutes?|mins?|m|分钟|分鐘)/i);
  const hours = hourMatch ? Number(hourMatch[1]) * 60 : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
  const totalMinutes = hours + minutes;

  return totalMinutes > 0 ? totalMinutes : defaultMinutes;
}

function findRule(activityText) {
  const normalizedText = activityText.toLowerCase();
  return (
    scoringRules.find((rule) => rule.keywords.some((keyword) => includesKeyword(normalizedText, keyword))) ??
    fallbackRule
  );
}

function getConfidence(rule, activityText) {
  const hasRuleMatch = rule.id !== fallbackRule.id;
  const hasDuration =
    extractDuration(activityText) !== defaultMinutes ||
    /(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|小时|小時|minutes?|mins?|m|分钟|分鐘)/i.test(activityText);

  if (hasRuleMatch && hasDuration) return 0.95;
  if (hasRuleMatch) return 0.78;
  return 0.35;
}

function getActivityType(rule) {
  if (rule.category === "Body") return "exercise";
  if (rule.category === "Knowledge") return "study";
  if (rule.category === "Health") return "food";
  if (rule.category === "Social") return "social";
  if (rule.category === "Waste") return "waste";
  return "discipline";
}

export function parseActivity(activityText, index = 0) {
  const rule = findRule(activityText);
  const confidence = getConfidence(rule, activityText);

  return {
    id: `${index}-${rule.id}`,
    sourceText: activityText,
    name: rule.label,
    type: getActivityType(rule),
    duration: extractDuration(activityText),
    category: toParserCategory(rule.category),
    displayCategory: rule.category,
    baseXp: getRuleBaseXp(rule),
    difficulty: rule.difficulty,
    attributeWeights: rule.attributes,
    ruleId: rule.id,
    confidence,
    note: rule.note,
  };
}

export function parseActivities(rawText) {
  const parts = splitActivityText(rawText.trim());
  const activities = parts.map((part, index) => parseActivity(part, index));
  const confidence =
    activities.length > 0
      ? activities.reduce((total, activity) => total + activity.confidence, 0) / activities.length
      : 0;

  return {
    activities,
    confidence,
    needsAi: activities.length === 0 || confidence < 0.7,
  };
}
