const SESSION_KEY = "adaptive-math-placement-session";
const PROFILES_KEY = "adaptive-math-placement-profiles";
const ACTIVE_PROFILE_KEY = "adaptive-math-placement-active-profile";

// LocalStorage is the prototype adapter. A backend adapter can later implement
// the same functions with Supabase, Firebase, PostgreSQL, or any API service.

export function saveSession(sessionJson) {
  localStorage.setItem(SESSION_KEY, sessionJson);
}

export function loadSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY)) ?? [];
  } catch {
    localStorage.removeItem(PROFILES_KEY);
    return [];
  }
}

export function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfileId(profileId) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
}

export function clearActiveProfileId() {
  localStorage.removeItem(ACTIVE_PROFILE_KEY);
}

export function upsertProfile({ name, grade }) {
  const profiles = getProfiles();
  const normalized = name.trim().toLowerCase();
  let profile = profiles.find((item) => item.name.trim().toLowerCase() === normalized && String(item.grade) === String(grade));
  if (!profile) {
    profile = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name.trim(),
      grade,
      createdAt: new Date().toISOString(),
      tests: [],
      practice: [],
      worksheets: [],
      topicProgress: {},
      learningPath: [],
    };
    profiles.push(profile);
  } else {
    profile.name = name.trim();
    profile.grade = grade;
  }
  saveProfiles(profiles);
  setActiveProfileId(profile.id);
  return profile;
}

export function getProfile(profileId = getActiveProfileId()) {
  return getProfiles().find((profile) => profile.id === profileId) ?? null;
}

export function updateProfile(profileId, updater) {
  const profiles = getProfiles();
  const index = profiles.findIndex((profile) => profile.id === profileId);
  if (index === -1) return null;
  const nextProfile = updater(structuredClone(profiles[index]));
  profiles[index] = nextProfile;
  saveProfiles(profiles);
  return nextProfile;
}

export function recordTest(profileId, session, results) {
  return updateProfile(profileId, (profile) => {
    const testRecord = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: session.completedAt ?? new Date().toISOString(),
      score: results.overallPercent,
      placement: results.placement,
      currentReadiness: results.currentReadiness,
      courseRecommendation: results.courseRecommendation,
      nextRecommendedTest: results.nextRecommendedTest,
      missedTopics: results.reviewTopics,
      topicResults: results.topicResults,
      graphingPerformance: results.graphingPerformance,
      satPerformance: results.satPerformance,
    };
    profile.tests.unshift(testRecord);
    profile.topicProgress = mergeTopicProgress(profile.topicProgress, results.topicResults, testRecord.date);
    profile.learningPath = buildLearningPath(profile);
    return profile;
  });
}

export function recordPractice(profileId, attempt) {
  return updateProfile(profileId, (profile) => {
    profile.practice.unshift({
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: new Date().toISOString(),
      topic: attempt.topic,
      difficulty: attempt.difficulty,
      correct: attempt.correct,
      answer: attempt.answer,
      studentAnswer: attempt.studentAnswer,
    });
    profile.learningPath = buildLearningPath(profile);
    return profile;
  });
}

export function recordWorksheet(profileId, worksheet) {
  return updateProfile(profileId, (profile) => {
    profile.worksheets.unshift({
      id: worksheet.id,
      date: worksheet.date,
      topics: worksheet.topics,
      difficulty: worksheet.difficulty,
      fileName: worksheet.fileName,
      completed: false,
      score: null,
      questionCount: worksheet.questions.length,
    });
    profile.learningPath = buildLearningPath(profile);
    return profile;
  });
}

export function scoreWorksheet(profileId, worksheetId, score) {
  return updateProfile(profileId, (profile) => {
    const worksheet = profile.worksheets.find((item) => item.id === worksheetId);
    if (worksheet) {
      worksheet.completed = true;
      worksheet.score = Number(score);
      worksheet.completedAt = new Date().toISOString();
    }
    profile.learningPath = buildLearningPath(profile);
    return profile;
  });
}

export function resetWorksheetHistory(profileId) {
  return updateProfile(profileId, (profile) => {
    profile.worksheets = [];
    profile.learningPath = buildLearningPath(profile);
    return profile;
  });
}

function mergeTopicProgress(existing, topicResults, date) {
  const progress = existing ?? {};
  topicResults.forEach((row) => {
    progress[row.topic] = progress[row.topic] ?? [];
    progress[row.topic].push({ date, percent: row.percent, correct: row.correct, total: row.total });
  });
  return progress;
}

export function buildLearningPath(profile) {
  const latest = profile.tests[0];
  const topicRows = latest?.topicResults ?? [];
  const weak = topicRows.filter((row) => row.percent < 80).sort((a, b) => a.percent - b.percent);
  const practicedTopics = new Set(profile.practice.slice(0, 12).map((item) => item.topic));
  const priorityOne = weak[0]?.topic ?? latest?.missedTopics?.[0] ?? "SAT Math Reasoning";
  const priorityTwo = weak[1]?.topic ?? "Solving Equations";
  const priorityThree = topicRows.find((row) => row.percent >= 80 && !practicedTopics.has(row.topic))?.topic ?? "Graphing Parabolas";
  const priorityFour = "SAT Math Reasoning";
  const topics = [priorityOne, priorityTwo, priorityThree, priorityFour];

  return topics.map((topic, index) => {
    const row = topicRows.find((item) => item.topic === topic);
    const currentAccuracy = row?.percent ?? 0;
    return {
      priority: index + 1,
      skill: topic,
      currentAccuracy,
      targetAccuracy: index === 3 ? 85 : 80,
      recommendedPracticeCount: currentAccuracy >= 80 ? 6 : 12,
      difficulty: currentAccuracy >= 80 ? "Challenge" : currentAccuracy >= 55 ? "Grade level" : "Foundation",
      nextMilestone: currentAccuracy >= 80 ? "Complete challenge set with 85%+" : "Reach 80% accuracy twice in a row",
    };
  });
}

export function importHistoricalReports(reports) {
  const profiles = getProfiles();
  let changed = false;

  reports.forEach((report) => {
    const normalized = report.name.trim().toLowerCase();
    let profile = profiles.find((item) => item.name.trim().toLowerCase() === normalized && String(item.grade) === String(report.grade));
    if (!profile) {
      profile = {
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: report.name,
        grade: report.grade,
        createdAt: new Date().toISOString(),
        tests: [],
        practice: [],
        worksheets: [],
        topicProgress: {},
        learningPath: [],
      };
      profiles.push(profile);
      changed = true;
    }

    const alreadyImported = profile.tests.some((test) => test.id === report.test.id);
    if (!alreadyImported) {
      profile.tests.unshift(report.test);
      profile.tests.sort((a, b) => new Date(b.date) - new Date(a.date));
      profile.topicProgress = mergeTopicProgress(profile.topicProgress, report.test.topicResults, report.test.date);
      profile.learningPath = buildLearningPath(profile);
      changed = true;
    }
  });

  if (changed) saveProfiles(profiles);
  return profiles;
}
