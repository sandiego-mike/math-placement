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
  let profile = profiles.find((item) => profileMatchesName(item, normalized));
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
      lastActiveAt: new Date().toISOString(),
      activityStatus: "Profile created",
      lastGradeRolloverYear: null,
      avatar: null,
      leaderboardVisible: true,
    };
    profiles.push(profile);
  } else {
    profile.name = name.trim();
    profile.grade = grade;
    profile.lastActiveAt = new Date().toISOString();
    profile.activityStatus = "Opened dashboard";
  }
  saveProfiles(profiles);
  setActiveProfileId(profile.id);
  return profile;
}

export function importStudentProfiles(students) {
  const profiles = getProfiles();
  let changed = false;

  students.forEach((student) => {
    const normalized = student.name.trim().toLowerCase();
    const incomingAliases = mergeAliases([], student.aliases);
    const matchingProfiles = profiles.filter(
      (profile) =>
        profileMatchesName(profile, normalized) ||
        incomingAliases.some((alias) => profileMatchesName(profile, alias.trim().toLowerCase())),
    );
    const existing = matchingProfiles.find((profile) => profile.name.trim().toLowerCase() === normalized) ?? matchingProfiles[0];
    if (existing) {
      if (existing.name !== student.name.trim()) {
        existing.name = student.name.trim();
        changed = true;
      }
      if (String(existing.grade) !== String(student.grade)) {
        existing.grade = String(student.grade);
        changed = true;
      }
      const aliases = mergeAliases(existing.aliases, incomingAliases);
      if (aliases.length !== (existing.aliases ?? []).length) {
        existing.aliases = aliases;
        changed = true;
      }
      matchingProfiles.filter((profile) => profile !== existing).forEach((duplicate) => {
        existing.tests = mergeById(existing.tests, duplicate.tests).sort((a, b) => new Date(b.date) - new Date(a.date));
        existing.practice = mergeById(existing.practice, duplicate.practice).sort((a, b) => new Date(b.date) - new Date(a.date));
        existing.worksheets = mergeById(existing.worksheets, duplicate.worksheets).sort((a, b) => new Date(b.date) - new Date(a.date));
        existing.topicProgress = mergeTopicProgressObjects(existing.topicProgress, duplicate.topicProgress);
        existing.aliases = mergeAliases(existing.aliases, [duplicate.name, ...(duplicate.aliases ?? [])]);
        const index = profiles.findIndex((profile) => profile.id === duplicate.id);
        if (index >= 0) profiles.splice(index, 1);
        changed = true;
      });
      existing.learningPath = buildLearningPath(existing);
      return;
    }

    profiles.push({
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: student.name.trim(),
      grade: String(student.grade),
      createdAt: new Date().toISOString(),
      tests: [],
      practice: [],
      worksheets: [],
      topicProgress: {},
      learningPath: [],
      lastActiveAt: new Date().toISOString(),
      activityStatus: "Profile created",
      lastGradeRolloverYear: null,
      notes: student.notes ?? "",
      aliases: incomingAliases,
    });
    changed = true;
  });

  if (changed) saveProfiles(profiles);
  return profiles;
}

export function applyAnnualGradeRollover(currentDate = new Date()) {
  const month = currentDate.getMonth();
  const rolloverYear = currentDate.getFullYear();
  if (month < 6) return { changed: false, updatedProfiles: 0 };

  const cutoff = new Date(rolloverYear, 6, 1);
  const profiles = getProfiles();
  let updatedProfiles = 0;

  profiles.forEach((profile) => {
    if (profile.lastGradeRolloverYear === rolloverYear) return;
    const createdAt = profile.createdAt ? new Date(profile.createdAt) : null;
    const createdBeforeRollover = !createdAt || Number.isNaN(createdAt.getTime()) || createdAt < cutoff;
    const seededGoingToNextGrade = /going to/i.test(profile.notes ?? "");
    if (!createdBeforeRollover && !seededGoingToNextGrade) return;

    const nextGrade = nextAnnualGrade(profile.grade);
    if (nextGrade === String(profile.grade)) {
      profile.lastGradeRolloverYear = rolloverYear;
      return;
    }

    profile.gradeHistory = profile.gradeHistory ?? [];
    profile.gradeHistory.push({
      from: String(profile.grade),
      to: nextGrade,
      date: currentDate.toISOString(),
      reason: "Annual grade rollover after June",
    });
    profile.grade = nextGrade;
    profile.lastGradeRolloverYear = rolloverYear;
    profile.activityStatus = `Advanced to grade ${nextGrade}`;
    profile.lastActiveAt = currentDate.toISOString();
    profile.learningPath = buildLearningPath(profile);
    updatedProfiles += 1;
  });

  if (updatedProfiles) saveProfiles(profiles);
  return { changed: updatedProfiles > 0, updatedProfiles };
}

export function nextAnnualGrade(grade) {
  const gradeText = String(grade);
  const gradeNumber = Number(gradeText);
  if (!Number.isFinite(gradeNumber)) return gradeText;
  if (gradeNumber >= 12) return "College";
  if (gradeNumber < 1) return gradeText;
  return String(gradeNumber + 1);
}

export function getProfile(profileId = getActiveProfileId()) {
  return getProfiles().find((profile) => profile.id === profileId) ?? null;
}

function profileMatchesName(profile, normalizedName) {
  const canonical = profile.name?.trim().toLowerCase();
  if (canonical === normalizedName) return true;
  return (profile.aliases ?? []).some((alias) => alias.trim().toLowerCase() === normalizedName);
}

function mergeAliases(existing = [], incoming = []) {
  return [...new Set([...existing, ...incoming].filter(Boolean).map((alias) => String(alias).trim()).filter(Boolean))];
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

export function touchProfile(profileId, status = "Using account") {
  return updateProfile(profileId, (profile) => {
    profile.lastActiveAt = new Date().toISOString();
    profile.activityStatus = status;
    return profile;
  });
}

export function recordTest(profileId, session, results) {
  return updateProfile(profileId, (profile) => {
    const testRecord = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: session.completedAt ?? new Date().toISOString(),
      type: session.miniTest ? "Daily Mini Test" : "Placement Test",
      score: results.overallPercent,
      placement: results.placement,
      currentReadiness: results.currentReadiness,
      courseRecommendation: results.courseRecommendation,
      nextRecommendedTest: results.nextRecommendedTest,
      missedTopics: results.reviewTopics,
      topicResults: results.topicResults,
      graphingPerformance: results.graphingPerformance,
      satPerformance: results.satPerformance,
      testDifficultyFit: results.testDifficultyFit,
      masteredLevel: results.masteredLevel,
      challengeUnlocked: results.challengeUnlocked,
      nextLevelGrade: results.nextLevelGrade,
      dailyPlan: results.dailyPlan,
    };
    profile.tests.unshift(testRecord);
    profile.topicProgress = mergeTopicProgress(profile.topicProgress, results.topicResults, testRecord.date);
    profile.learningPath = buildLearningPath(profile);
    profile.lastActiveAt = new Date().toISOString();
    profile.activityStatus = session.miniTest ? "Completed a daily mini test" : "Completed a test";
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
    profile.lastActiveAt = new Date().toISOString();
    profile.activityStatus = attempt.correct ? "Practicing correctly" : "Practicing with review";
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
    profile.lastActiveAt = new Date().toISOString();
    profile.activityStatus = "Created a worksheet";
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
    profile.lastActiveAt = new Date().toISOString();
    profile.activityStatus = "Scored a worksheet";
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

export function exportProfilesData(profileIds = null) {
  const selected = new Set(profileIds ?? []);
  const profiles = getProfiles().filter((profile) => !profileIds || selected.has(profile.id));
  return {
    app: "adaptive-math-placement",
    version: 1,
    exportedAt: new Date().toISOString(),
    profiles,
  };
}

export function importProfilesData(payload) {
  const incoming = Array.isArray(payload) ? payload : payload?.profiles;
  if (!Array.isArray(incoming)) throw new Error("This file does not look like a math placement results export.");

  const profiles = getProfiles();
  let addedProfiles = 0;
  let updatedProfiles = 0;

  incoming.forEach((rawProfile) => {
    if (!rawProfile?.name || !rawProfile?.grade) return;
    const normalized = rawProfile.name.trim().toLowerCase();
    const existing = profiles.find((profile) => profileMatchesName(profile, normalized) || rawProfile.aliases?.some((alias) => profileMatchesName(profile, String(alias).trim().toLowerCase())));
    const cleanProfile = normalizeImportedProfile(rawProfile);

    if (!existing) {
      profiles.push(cleanProfile);
      addedProfiles += 1;
      return;
    }

    existing.tests = mergeById(existing.tests, cleanProfile.tests).sort((a, b) => new Date(b.date) - new Date(a.date));
    existing.practice = mergeById(existing.practice, cleanProfile.practice).sort((a, b) => new Date(b.date) - new Date(a.date));
    existing.worksheets = mergeById(existing.worksheets, cleanProfile.worksheets).sort((a, b) => new Date(b.date) - new Date(a.date));
    existing.topicProgress = mergeTopicProgressObjects(existing.topicProgress, cleanProfile.topicProgress);
    existing.learningPath = buildLearningPath(existing);
    existing.notes = existing.notes || cleanProfile.notes || "";
    existing.aliases = mergeAliases(existing.aliases, cleanProfile.aliases);
    updatedProfiles += 1;
  });

  saveProfiles(profiles);
  return { addedProfiles, updatedProfiles, totalProfiles: profiles.length };
}

function normalizeImportedProfile(profile) {
  const normalized = {
    id: profile.id || crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: String(profile.name).trim(),
    grade: String(profile.grade),
    createdAt: profile.createdAt ?? new Date().toISOString(),
    tests: Array.isArray(profile.tests) ? profile.tests : [],
    practice: Array.isArray(profile.practice) ? profile.practice : [],
    worksheets: Array.isArray(profile.worksheets) ? profile.worksheets : [],
    topicProgress: profile.topicProgress && typeof profile.topicProgress === "object" ? profile.topicProgress : {},
    learningPath: Array.isArray(profile.learningPath) ? profile.learningPath : [],
    notes: profile.notes ?? "",
    aliases: mergeAliases([], profile.aliases),
    lastGradeRolloverYear: profile.lastGradeRolloverYear ?? null,
    gradeHistory: Array.isArray(profile.gradeHistory) ? profile.gradeHistory : [],
  };
  normalized.learningPath = normalized.learningPath.length ? normalized.learningPath : buildLearningPath(normalized);
  return normalized;
}

function mergeById(existing = [], incoming = []) {
  const rows = new Map();
  [...existing, ...incoming].forEach((row) => {
    if (!row) return;
    const id = row.id ?? `${row.date ?? ""}-${row.topic ?? row.fileName ?? JSON.stringify(row).slice(0, 40)}`;
    rows.set(id, { ...row, id });
  });
  return [...rows.values()];
}

function mergeTopicProgressObjects(existing = {}, incoming = {}) {
  const merged = structuredClone(existing ?? {});
  Object.entries(incoming ?? {}).forEach(([topic, rows]) => {
    if (!Array.isArray(rows)) return;
    merged[topic] = mergeById(merged[topic] ?? [], rows).sort((a, b) => new Date(a.date) - new Date(b.date));
  });
  return merged;
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
  if (latest?.masteredLevel || latest?.score === 100) {
    const challengeSkill = Number(profile.grade) >= 10 ? "SAT Math Reasoning" : "Graphing Parabolas";
    return [
      {
        priority: 1,
        skill: `Advance to next level: ${latest.nextRecommendedTest ?? "higher-level diagnostic"}`,
        currentAccuracy: 100,
        targetAccuracy: 85,
        recommendedPracticeCount: 0,
        difficulty: "Mastered",
        nextMilestone: "Start Next Level Test",
      },
      {
        priority: 2,
        skill: `Begin challenge problems in ${challengeSkill}`,
        currentAccuracy: 100,
        targetAccuracy: 85,
        recommendedPracticeCount: 10,
        difficulty: "Challenge",
        nextMilestone: "Complete mixed challenge set",
      },
      {
        priority: 3,
        skill: "Prepare for SAT-style questions",
        currentAccuracy: latest.satPerformance?.percent ?? 100,
        targetAccuracy: 85,
        recommendedPracticeCount: 8,
        difficulty: "SAT prep",
        nextMilestone: "Try timed reasoning practice",
      },
    ];
  }
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
    let profile = profiles.find((item) => profileMatchesName(item, normalized));
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
