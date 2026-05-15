import assert from "node:assert/strict";
import { parseActivities } from "../src/utils/parser.js";
import { analyzeEntry, analyzeParsedActivities } from "../src/utils/scoring.js";
import { buildGameState } from "../src/utils/stats.js";
import { createEmptyEntries } from "../src/utils/initialData.js";
import { createEntry } from "../src/utils/storage.js";
import { translate } from "../src/i18n/translations.js";
import { buildRuleBasedDailyReport } from "../src/utils/report.js";
import { activitiesToRows, entryToRow, rowToEntry } from "../src/utils/cloudEntries.js";
import { isSupabaseConfigured } from "../src/utils/supabaseClient.js";
import { buildAuthRedirectUrl } from "../src/utils/cloudAuth.js";
import { getOnboardingStorageKey } from "../src/hooks/useOnboarding.js";
import { getFriendlyAuthError } from "../src/utils/authMessages.js";

function runTest(name, testFn) {
  try {
    testFn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

runTest("parser converts natural language into structured activities", () => {
  const result = parseActivities("Today I studied linear algebra for 2 hours and ran 30 minutes");

  assert.equal(result.needsAi, false);
  assert.equal(result.activities.length, 2);
  assert.deepEqual(
    result.activities.map((activity) => ({
      type: activity.type,
      duration: activity.duration,
      category: activity.category,
    })),
    [
      { type: "study", duration: 120, category: "knowledge" },
      { type: "exercise", duration: 30, category: "body" },
    ],
  );
});

runTest("parser handles Chinese duration and activity keywords", () => {
  const result = parseActivities("跑步30分钟，学习线性代数2小时，刷短视频1小时");

  assert.equal(result.activities.length, 3);
  assert.deepEqual(
    result.activities.map((activity) => activity.duration),
    [30, 120, 60],
  );
});

runTest("growth scoring stays local and uses time, streak, and difficulty", () => {
  const analysis = analyzeEntry("Today I studied linear algebra for 2 hours and ran 30 minutes", {
    streakDays: 4,
  });

  assert.equal(analysis.activities.length, 2);
  assert.equal(analysis.activities[0].difficulty, "hard");
  assert.equal(analysis.activities[0].minutes, 120);
  assert.ok(analysis.growth > 100);
});

runTest("manual correction can rescore edited structured activities", () => {
  const analysis = analyzeParsedActivities(
    [
      {
        id: "manual-1",
        name: "Custom hard study",
        sourceText: "Custom hard study",
        type: "study",
        duration: 90,
        category: "knowledge",
        displayCategory: "Knowledge",
        baseXp: 40,
        difficulty: "veryHard",
        attributeWeights: { knowledge: 8, discipline: 2 },
        ruleId: "manual-activity",
        confidence: 1,
      },
    ],
    { streakDays: 10 },
  );

  assert.equal(analysis.categories[0], "Knowledge");
  assert.ok(analysis.growth > 80);
});

runTest("stats compute nonlinear level and today's growth", () => {
  const entry = createEntry("Today I studied linear algebra for 2 hours", undefined, new Date());
  const gameState = buildGameState([entry]);

  assert.ok(gameState.todayGrowth > 0);
  assert.equal(gameState.level, Math.floor(Math.sqrt(gameState.totalGrowth / 100)));
});

runTest("new accounts start with empty entries and zero stats", () => {
  const entries = createEmptyEntries();
  const gameState = buildGameState(entries);

  assert.deepEqual(entries, []);
  assert.equal(gameState.todayGrowth, 0);
  assert.equal(gameState.totalGrowth, 0);
  assert.equal(gameState.level, 0);
  assert.equal(gameState.streak, 0);
});

runTest("language settings translate public beta UI and reports", () => {
  const gameState = buildGameState([]);
  const t = (key, params) => translate("zh", key, params);
  const en = (key, params) => translate("en", key, params);
  const report = buildRuleBasedDailyReport(gameState, t);

  assert.equal(t("nav.settings"), "设置");
  assert.equal(t("settings.publicBeta"), "公开测试模式");
  assert.equal(t("settings.accountTitle"), "账号中心");
  assert.equal(t("settings.termsTitle"), "Beta 条款");
  assert.equal(t("sync.retry"), "重试同步");
  assert.notEqual(t("onboarding.title"), "onboarding.title");
  assert.notEqual(t("launch.title"), "launch.title");
  assert.equal(en("settings.feedbackTitle"), "Beta Feedback");
  assert.equal(report.suggestions[0], "先记录一个小行动，启动今天的连续链。");
});

runTest("cloud row helpers preserve local entry data shape", () => {
  const entry = createEntry("Ran for 30 minutes", undefined, new Date("2026-05-14T08:00:00.000Z"));
  const row = entryToRow(entry, "user-1");
  const restoredEntry = rowToEntry(row);
  const activityRows = activitiesToRows(entry, "user-1");

  assert.equal(row.user_id, "user-1");
  assert.equal(restoredEntry.id, entry.id);
  assert.equal(restoredEntry.text, entry.text);
  assert.equal(restoredEntry.growth, entry.growth);
  assert.deepEqual(restoredEntry.categories, entry.categories);
  assert.equal(activityRows[0].entry_id, entry.id);
});

runTest("Supabase stays optional for local development", () => {
  assert.equal(typeof isSupabaseConfigured, "boolean");
});

runTest("email confirmation redirects keep the GitHub Pages base path", () => {
  assert.equal(
    buildAuthRedirectUrl("https://donghaoxiangoscar.github.io", "/lifequest-xp/"),
    "https://donghaoxiangoscar.github.io/lifequest-xp/",
  );
});

runTest("onboarding state is scoped per signed-in account", () => {
  assert.equal(getOnboardingStorageKey("user-123"), "lifequest-xp.onboarding.v1.user-123");
  assert.equal(getOnboardingStorageKey(""), null);
});

runTest("auth errors are converted into user-friendly beta messages", () => {
  const t = (key, params) => translate("en", key, params);

  assert.equal(
    getFriendlyAuthError("email rate limit exceeded", t),
    "Supabase email rate limit exceeded. Wait before requesting another email, or configure custom SMTP for public testing.",
  );
  assert.equal(getFriendlyAuthError("Invalid login credentials", t), "Email or password is incorrect.");
  assert.equal(
    getFriendlyAuthError("Invalid path specified in request URL", t),
    "Supabase URL looks wrong. Use the project base URL, not the /rest/v1 endpoint.",
  );
});

console.log("All LifeQuest XP checks passed.");
