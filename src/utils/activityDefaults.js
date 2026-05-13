export const difficultyOptions = ["easy", "normal", "hard", "veryHard"];

export const categoryOptions = [
  {
    value: "body",
    label: "Body",
    displayCategory: "Body",
    type: "exercise",
    baseXp: 24,
    attributeWeights: { body: 5, health: 1 },
  },
  {
    value: "knowledge",
    label: "Knowledge",
    displayCategory: "Knowledge",
    type: "study",
    baseXp: 25,
    attributeWeights: { knowledge: 6, discipline: 1 },
  },
  {
    value: "health",
    label: "Health",
    displayCategory: "Health",
    type: "food",
    baseXp: 16,
    attributeWeights: { health: 4, discipline: 1 },
  },
  {
    value: "discipline",
    label: "Discipline",
    displayCategory: "Discipline",
    type: "discipline",
    baseXp: 18,
    attributeWeights: { discipline: 4 },
  },
  {
    value: "social",
    label: "Social",
    displayCategory: "Social",
    type: "social",
    baseXp: 18,
    attributeWeights: { social: 5 },
  },
  {
    value: "waste",
    label: "Waste",
    displayCategory: "Waste",
    type: "waste",
    baseXp: -15,
    attributeWeights: { discipline: -3 },
  },
];

export function getCategoryDefaults(categoryValue) {
  const normalizedValue = String(categoryValue ?? "").toLowerCase();
  return categoryOptions.find((category) => category.value === normalizedValue) ?? categoryOptions[3];
}

export function normalizeEditableActivity(activity, index = 0) {
  const categoryValue = activity.parserCategory ?? activity.category;
  const defaults = getCategoryDefaults(categoryValue);

  return {
    id: activity.id ?? `manual-${index}`,
    sourceText: activity.sourceText ?? activity.text ?? activity.name ?? activity.label ?? defaults.label,
    name: activity.name ?? activity.label ?? defaults.label,
    type: activity.type ?? defaults.type,
    duration: Number(activity.duration ?? activity.minutes) > 0 ? Number(activity.duration ?? activity.minutes) : 30,
    category: defaults.value,
    displayCategory: activity.displayCategory ?? defaults.displayCategory,
    baseXp: Number.isFinite(Number(activity.baseXp)) ? Number(activity.baseXp) : defaults.baseXp,
    difficulty: difficultyOptions.includes(activity.difficulty) ? activity.difficulty : "normal",
    attributeWeights: activity.attributeWeights ?? defaults.attributeWeights,
    ruleId: activity.ruleId ?? "manual-activity",
    confidence: activity.confidence ?? 1,
    note: activity.note ?? "Manually reviewed activity.",
  };
}

export function normalizeEditableActivities(activities) {
  return activities.map((activity, index) => normalizeEditableActivity(activity, index));
}
