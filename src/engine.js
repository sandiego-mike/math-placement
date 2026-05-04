import { DIFFICULTY_LABELS, GRADE8_TOPICS, GRADE10_TOPICS, GRADE11_TOPICS, PREREQUISITE_TOPICS, TOPIC_GROUPS, TOPICS, generateQuestion } from "./questions.js";

const DEFAULT_TEST_LENGTH = 24;
const GRADE8_TEST_LENGTH = 30;
const GRADE10_TEST_LENGTH = 30;
const GRADE11_TEST_LENGTH = 32;

const clampDifficulty = (value) => Math.max(0, Math.min(2, value));
const GRADE5_TOPICS = ["Arithmetic", "Fractions", "Decimals", "Percents", "Ratios and Proportions", "Word Problems", "Geometry Basics"];
const GRADE6_TOPICS = [...GRADE5_TOPICS, "Basic Algebra", "Graphing Basics"];
const GRADE7_TOPICS = [...GRADE6_TOPICS, "Negative Numbers", "Exponents", "Solving Equations"];

export function createSession(student) {
  const gradeProfile = getGradeProfile(student.grade);
  const stats = Object.fromEntries(
    TOPICS.map((topic) => [
      topic,
      {
        correct: 0,
        total: 0,
        difficulty: gradeProfile.primaryTopics.includes(topic) ? gradeProfile.startDifficulty : 1,
        streak: 0,
        missed: 0,
      },
    ]),
  );

  return {
    student,
    gradeProfile,
    totalQuestions: gradeProfile.testLength,
    currentIndex: 0,
    currentQuestion: null,
    history: [],
    stats,
    correctStreak: 0,
    acceleration: false,
    challengeMode: Boolean(student.challengeMode),
    difficultyReached: gradeProfile.startDifficulty,
    completedAt: null,
  };
}

export function nextDiagnosticQuestion(session) {
  const topic = chooseNextTopic(session);
  const topicStats = session.stats[topic];
  const difficulty = session.challengeMode || session.acceleration || (session.correctStreak ?? 0) >= 3 ? 2 : topicStats.difficulty;
  const question = generateQuestion(topic, difficulty);
  session.currentQuestion = question;
  return question;
}

export function submitDiagnosticAnswer(session, rawAnswer) {
  const question = session.currentQuestion;
  const studentAnswer = String(rawAnswer ?? "").trim();
  const correct = question.validate(studentAnswer);
  const topicStats = session.stats[question.topic];

  topicStats.total += 1;
  topicStats.correct += correct ? 1 : 0;
  topicStats.streak = correct ? topicStats.streak + 1 : 0;
  topicStats.missed = correct ? topicStats.missed : topicStats.missed + 1;
  session.correctStreak = correct ? (session.correctStreak ?? 0) + 1 : 0;

  if (correct && (topicStats.streak >= 2 || session.correctStreak >= 3)) {
    topicStats.difficulty = clampDifficulty(topicStats.difficulty + 1);
    topicStats.streak = 0;
  }

  if (correct && session.correctStreak >= 5) {
    session.acceleration = true;
    topicStats.difficulty = 2;
    Object.values(session.stats).forEach((stats) => {
      if (stats.total > 0 || session.gradeProfile.primaryTopics.includes(question.topic)) stats.difficulty = Math.max(stats.difficulty, 2);
    });
  }

  if (!correct) {
    topicStats.difficulty = clampDifficulty(topicStats.difficulty - 1);
  }

  session.difficultyReached = Math.max(session.difficultyReached, question.difficulty, topicStats.difficulty);
  session.history.push({
    ...question,
    studentAnswer: studentAnswer || "No answer",
    correct,
  });
  session.currentIndex += 1;

  if (session.currentIndex >= session.totalQuestions) {
    session.completedAt = new Date().toISOString();
  }

  return { correct, completed: Boolean(session.completedAt) };
}

function chooseNextTopic(session) {
  const profile = session.gradeProfile ?? getGradeProfile(session.student.grade);
  const probeTopic = chooseProbeTopic(session, profile);
  if (probeTopic) return probeTopic;
  const requiredTopic = chooseRequiredCoverageTopic(session, profile);
  if (requiredTopic) return requiredTopic;
  if (profile.name === "grade10" || profile.name === "grade8" || profile.name === "grade11") return chooseAdvancedTopic(session, profile);

  const unanswered = profile.primaryTopics.filter((topic) => session.stats[topic].total === 0);
  if (unanswered.length) return choose(unanswered);

  const weakTopics = profile.primaryTopics.filter((topic) => {
    const stats = session.stats[topic];
    return stats.total > 0 && stats.correct / stats.total < 0.68 && stats.total < 3;
  });

  if (weakTopics.length && Math.random() > 0.35) {
    return weakTopics.sort((a, b) => session.stats[b].missed - session.stats[a].missed)[0];
  }

  return [...profile.primaryTopics].sort((a, b) => session.stats[a].total - session.stats[b].total)[0];
}

function chooseProbeTopic(session, profile) {
  const probes = profile.probeTopics ?? [];
  if (!probes.length || session.currentIndex >= 5) return null;
  const unansweredProbe = probes.find((topic) => session.stats[topic]?.total === 0);
  if (unansweredProbe) return unansweredProbe;
  const firstFive = session.history.slice(0, 5);
  const misses = firstFive.filter((item) => !item.correct);
  if (firstFive.length >= 3 && misses.length >= 2) {
    const missed = misses.at(-1);
    return profile.prerequisiteMap[missed?.topic] ?? choose(profile.reviewTopics);
  }
  if (firstFive.length >= 3 && firstFive.every((item) => item.correct)) {
    return choose(profile.challengeTopics ?? profile.primaryTopics);
  }
  return null;
}

function chooseRequiredCoverageTopic(session, profile) {
  const remaining = session.totalQuestions - session.currentIndex;
  const missingRequired = (profile.requiredTopics ?? []).filter((topic) => session.stats[topic]?.total === 0);
  const satCount = session.history.filter((item) => TOPIC_GROUPS.sat.includes(item.topic)).length;
  const graphingCount = session.history.filter((item) => TOPIC_GROUPS.graphing.includes(item.topic)).length;
  const focusCount = session.history.filter((item) => (profile.focusTopics ?? []).includes(item.topic)).length;
  const needsSat = profile.minSatQuestions && satCount < profile.minSatQuestions;
  const needsGraphing = profile.minGraphingQuestions && graphingCount < profile.minGraphingQuestions;
  const needsFocus = profile.minFocusQuestions && focusCount < profile.minFocusQuestions;
  const satRemaining = Math.max(0, (profile.minSatQuestions ?? 0) - satCount);
  const graphingRemaining = Math.max(0, (profile.minGraphingQuestions ?? 0) - graphingCount);
  const focusRemaining = Math.max(0, (profile.minFocusQuestions ?? 0) - focusCount);

  if (missingRequired.length && (session.currentIndex < missingRequired.length || remaining <= missingRequired.length + satRemaining + focusRemaining + 1)) return missingRequired[0];
  if (needsFocus && remaining <= focusRemaining + satRemaining + graphingRemaining + missingRequired.length + 1) return choose(profile.focusTopics);
  if (needsSat && remaining <= satRemaining + graphingRemaining + focusRemaining + missingRequired.length + 1) return choose(TOPIC_GROUPS.sat);
  if (needsGraphing && remaining <= graphingRemaining + 1) return choose(profile.graphingTopics ?? TOPIC_GROUPS.graphing);
  if (needsFocus && session.currentIndex > 0 && session.currentIndex % 3 === 0) return choose(profile.focusTopics);
  if (needsSat && session.currentIndex > 0 && session.currentIndex % 5 === 0) return choose(TOPIC_GROUPS.sat);
  if (needsGraphing && session.currentIndex > 0 && session.currentIndex % 4 === 0) return choose(profile.graphingTopics ?? TOPIC_GROUPS.graphing);
  return null;
}

function chooseAdvancedTopic(session, profile) {
  const recent = session.history.slice(-5);
  const recentMisses = recent.filter((item) => !item.correct).length;
  const primaryMisses = session.history.filter((item) => !item.correct && profile.primaryTopics.includes(item.topic)).length;

  if (session.challengeMode || session.acceleration || (session.correctStreak ?? 0) >= 3 || (recent.length >= 5 && recent.every((item) => item.correct))) {
    return choose([...(profile.challengeTopics ?? []), ...TOPIC_GROUPS.sat, ...(profile.focusTopics ?? [])]);
  }

  if (recent.length >= 4 && recentMisses >= 3) {
    const missed = [...recent].reverse().find((item) => !item.correct);
    return profile.prerequisiteMap[missed?.topic] ?? choose(profile.reviewTopics);
  }

  if (session.currentIndex >= 6 && primaryMisses >= 4 && Math.random() > 0.35) {
    return choose(profile.reviewTopics);
  }

  const primaryUnanswered = profile.primaryTopics.filter((topic) => session.stats[topic].total === 0);
  if (primaryUnanswered.length) return choose(primaryUnanswered);

  const weakPrimary = profile.primaryTopics.filter((topic) => {
    const stats = session.stats[topic];
    return stats.total > 0 && stats.correct / stats.total < 0.7 && stats.total < 3;
  });
  if (weakPrimary.length && Math.random() > 0.25) return choose(weakPrimary);

  const strongRun = recent.length >= 4 && recent.every((item) => item.correct);
  if (strongRun) {
    const readinessTopics = [
      ...(profile.challengeTopics ?? []),
      "SAT Math Reasoning",
      "Data Interpretation",
    ];
    return choose(readinessTopics);
  }

  return [...profile.primaryTopics].sort((a, b) => session.stats[a].total - session.stats[b].total)[0];
}

export function calculateResults(session) {
  const correctCount = session.history.filter((item) => item.correct).length;
  const overallPercent = Math.round((correctCount / session.history.length) * 100);
  const topicResults = TOPICS.map((topic) => {
    const stats = session.stats[topic];
    const percent = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
    return {
      topic,
      correct: stats.correct,
      total: stats.total,
      percent,
      difficulty: DIFFICULTY_LABELS[stats.difficulty],
    };
  }).filter((result) => result.total > 0);

  const weakTopics = topicResults
    .filter((result) => topicNeedsReview(result, session))
    .sort((a, b) => a.percent - b.percent)
    .map((result) => result.topic);

  const averageDifficulty =
    topicResults.reduce((sum, result) => sum + DIFFICULTY_LABELS.indexOf(result.difficulty), 0) /
    Math.max(1, topicResults.length);

  const profile = session.gradeProfile ?? getGradeProfile(session.student.grade);
  const placementDetails = buildPlacementDetails(session, profile, overallPercent, averageDifficulty, topicResults, weakTopics);

  return {
    overallPercent,
    correctCount,
    total: session.history.length,
    topicResults,
    weakTopics,
    strongestSkills: placementDetails.strongestSkills,
    weakestSkills: placementDetails.weakestSkills,
    reviewTopics: placementDetails.reviewTopics,
    testDifficultyFit: placementDetails.testDifficultyFit,
    higherLevelRecommended: placementDetails.higherLevelRecommended,
    nextRecommendedTest: placementDetails.nextRecommendedTest,
    currentReadiness: placementDetails.currentReadiness,
    placement: placementDetails.placement,
    courseRecommendation: placementDetails.courseRecommendation,
    nextSteps: placementDetails.nextSteps,
    graphingPerformance: performanceForGroup(session, TOPIC_GROUPS.graphing),
    satPerformance: performanceForGroup(session, TOPIC_GROUPS.sat),
    difficultyReached: DIFFICULTY_LABELS[session.difficultyReached],
    missed: session.history.filter((item) => !item.correct),
    masteredLevel: overallPercent === 100,
    challengeUnlocked: overallPercent === 100 || placementDetails.testDifficultyFit === "Too easy",
    nextLevelGrade: getNextLevelGrade(session.student.grade),
    dailyPlan: buildDailyPlan(topicResults, placementDetails.reviewTopics, session.student.grade, overallPercent),
  };
}

function buildPlacementDetails(session, profile, score, averageDifficulty, topicResults, weakTopics) {
  const missedTopics = new Set(session.history.filter((item) => !item.correct).map((item) => item.topic));
  const actualWeakRows = topicResults.filter((result) => topicNeedsReview(result, session));
  const below80Rows = topicResults.filter((result) => result.percent < 80);
  const strongestSkills = [...topicResults]
    .filter((result) => result.total > 0)
    .sort((a, b) => b.percent - a.percent || b.correct - a.correct)
    .slice(0, 4)
    .map((result) => result.topic);
  const weakestSkills = [...topicResults]
    .filter((result) => actualWeakRows.some((weak) => weak.topic === result.topic))
    .sort((a, b) => a.percent - b.percent || b.total - a.total)
    .slice(0, 5)
    .map((result) => result.topic);
  const reviewTopics = weakTopics.filter((topic) => missedTopics.has(topic) || topicResults.find((row) => row.topic === topic)?.percent < 80);
  const testDifficultyFit = getTestDifficultyFit(session, score, topicResults);
  const higherLevelRecommended = testDifficultyFit === "Too easy" || score >= 95;
  const nextRecommendedTest = getNextRecommendedTest(profile, score);

  if (score >= 95 && below80Rows.length === 0) {
    return {
      strongestSkills,
      weakestSkills: [],
      reviewTopics: score === 100 ? [] : reviewTopics,
      placement: score === 100 ? "Above grade level" : "SAT prep ready with targeted review",
      currentReadiness: score === 100 ? "Above grade level" : "On or above grade level",
      courseRecommendation:
        score === 100
          ? "You have mastered this level. This test was below the student’s level."
          : "Strong performance. Move to a more advanced diagnostic or SAT-style challenge practice.",
      nextSteps: [
        score === 100 ? "Advance to next level." : "Move to a more advanced diagnostic.",
        score === 100 ? "Begin higher-level problem solving." : `Try ${nextRecommendedTest}.`,
        score === 100 ? "Optional: take challenge test." : "Begin SAT-style challenge practice.",
      ],
      testDifficultyFit,
      higherLevelRecommended,
      nextRecommendedTest,
    };
  }

  if (profile.name === "grade10" || profile.name === "grade8" || profile.name === "grade11") {
    const gradeRows = topicResults.filter((row) => profile.primaryTopics.includes(row.topic));
    const gradeScore = weightedPercent(gradeRows);
    const graphing = performanceForGroup(session, TOPIC_GROUPS.graphing);
    const sat = performanceForGroup(session, TOPIC_GROUPS.sat);
    let placement = "Below current grade level";
    let currentReadiness = "Needs more Integrated Math 2 review";
    let courseRecommendation = "Integrated Math 2 review with prerequisite support";
    let nextSteps = [
      "Review missed prerequisite skills first.",
      "Practice linear equations, graphing, and equation setup from word problems.",
      "Retest after consistent accuracy on review practice.",
    ];

    if (profile.name === "grade11") {
      currentReadiness = "Needs more Algebra 2 / Integrated Math 3 review";
      courseRecommendation = "Integrated Math 3 / Algebra 2 review with SAT-style algebra support";
      nextSteps = [
        "Review quadratics, functions, radicals, and rational expressions.",
        "Practice SAT-style multi-step algebra and graph interpretation.",
        "Retest with an Algebra 2 readiness diagnostic after review.",
      ];
    }

    if (profile.name === "grade8") {
      currentReadiness = "Needs more grade 8 standards review";
      courseRecommendation = "Grade 8 readiness review before Algebra 1 / Integrated Math 1 placement";
      nextSteps = [
        "Review missed grade 8 readiness skills first.",
        "Practice linear equations, graphing, functions, and Pythagorean theorem.",
        "Retest with Algebra 1 readiness after review accuracy improves.",
      ];
    }

    if (score >= 88 && gradeScore >= 85 && averageDifficulty >= 1.6 && graphing.percent >= 75 && sat.percent >= 70) {
      placement = "SAT prep ready with targeted review";
      currentReadiness = "Above grade level";
      courseRecommendation = "Integrated Math 3 / Algebra 2 ready; begin SAT prep with targeted review";
      nextSteps = [
        "Move into Algebra 2 readiness practice: quadratics, rational expressions, and advanced functions.",
        "Add timed SAT-style mixed problem sets.",
        "Keep a short review cycle for any missed graphing or geometry skills.",
      ];
    } else if (score >= 78 && gradeScore >= 72) {
      placement = "Algebra 2 ready";
      currentReadiness = "On grade level";
      courseRecommendation = "Ready for Integrated Math 3 / Algebra 2 with targeted review";
      nextSteps = [
        "Continue with Integrated Math 3 or Algebra 2 placement.",
        "Target weak areas before adding SAT pacing.",
        "Practice quadratics and functions until explanations feel routine.",
      ];
    } else if (score >= 62 && gradeScore >= 55) {
      placement = "Approaching grade level";
      currentReadiness = "Developing Integrated Math 2 readiness";
      courseRecommendation = "Continue Integrated Math 2 review before full Algebra 2 placement";
      nextSteps = [
        "Practice weak Integrated Math 2 topics three to four times per week.",
        "Use worked examples first, then mixed review.",
        "Retest after graphing, systems, and quadratics improve.",
      ];
    }

    if (profile.name === "grade8") {
      if (score >= 88 && gradeScore >= 82) {
        placement = "Above grade level";
        currentReadiness = "Algebra 1 ready";
        courseRecommendation = "Ready for Algebra 1 / Integrated Math 1, with above-grade challenge practice";
      } else if (score >= 75 && gradeScore >= 68) {
        placement = "On grade level";
        currentReadiness = "Approaching Algebra 1 readiness";
        courseRecommendation = "Ready for Integrated Math 1 with targeted review";
      } else if (score >= 60) {
        placement = "Approaching grade level";
        currentReadiness = "Needs more grade 8 readiness review";
        courseRecommendation = "Continue grade 8 standards review before full Algebra 1 placement";
      }
    }

    if (profile.name === "grade11") {
      if (score >= 88 && gradeScore >= 82 && sat.percent >= 75) {
        placement = "SAT prep ready with targeted review";
        currentReadiness = "Algebra 2 ready";
        courseRecommendation = "Ready for advanced Algebra 2 / Integrated Math 3 and SAT prep";
      } else if (score >= 72 && gradeScore >= 65) {
        placement = "On grade level";
        currentReadiness = "Developing Algebra 2 readiness";
        courseRecommendation = "Continue Integrated Math 3 / Algebra 2 with targeted review";
      }
    }

    return { strongestSkills, weakestSkills, reviewTopics, placement, currentReadiness, courseRecommendation, nextSteps, testDifficultyFit, higherLevelRecommended, nextRecommendedTest };
  }

  const algebraReady = ["Basic Algebra", "Solving Equations", "Exponents", "Graphing Basics"].every((topic) => {
    const row = topicResults.find((result) => result.topic === topic);
    return row && row.percent >= 70;
  });

  const placement =
    score >= 88 && averageDifficulty >= 1.45 && algebraReady
      ? "Algebra 2 readiness"
      : score >= 75 && algebraReady
        ? "Algebra 1 readiness"
        : score >= 58
          ? "Pre-Algebra"
          : "Foundational Math";
  const currentReadiness =
    score >= 85 ? "Above grade level" : score >= 70 ? "On grade level" : score >= 55 ? "Approaching grade level" : "Below current grade level";
  return {
    strongestSkills,
    weakestSkills,
    reviewTopics,
    placement,
    currentReadiness,
    courseRecommendation: placement,
    nextSteps: [
      "Practice the weakest topics first.",
      "Retake a new adaptive test after practice improves.",
      "Use the missed-question explanations as worked examples.",
    ],
    testDifficultyFit,
    higherLevelRecommended,
    nextRecommendedTest,
  };
}

function topicNeedsReview(result, session) {
  if (result.percent === 100) return false;
  const attempts = session.history.filter((item) => item.topic === result.topic);
  const missed = attempts.some((item) => !item.correct);
  const hardMissed = attempts.some((item) => item.difficulty >= 2 && !item.correct);
  return missed || result.percent < 80 || hardMissed;
}

function getTestDifficultyFit(session, score, topicResults) {
  if (!session.history.length) return "Inconclusive";
  const missed = session.history.length - session.history.filter((item) => item.correct).length;
  const hardAttempts = session.history.filter((item) => item.difficulty >= 2);
  const hardCorrect = hardAttempts.filter((item) => item.correct).length;
  const topicsTested = topicResults.length;
  if (score === 100 || (score >= 95 && missed === 0) || (score >= 95 && hardAttempts.length >= 5 && hardCorrect / hardAttempts.length >= 0.85)) return "Too easy";
  if (score < 45 || (session.history.length >= 8 && session.history.slice(0, 8).filter((item) => !item.correct).length >= 6)) return "Too difficult";
  if (topicsTested < 5) return "Inconclusive";
  return "Appropriate";
}

function getNextRecommendedTest(profile, score) {
  if (profile.name === "grade8") return score >= 95 ? "Integrated Math 1 readiness or Algebra 1 readiness" : "Grade 8 readiness review";
  if (profile.name === "grade10") return score >= 95 ? "Integrated Math 3 / Algebra 2 readiness" : "Integrated Math 2 readiness";
  if (profile.name === "grade11") return score >= 95 ? "Precalculus readiness or advanced SAT math challenge" : "Integrated Math 3 / Algebra 2 readiness";
  return score >= 95 ? "Algebra 1 readiness, Integrated Math 1 readiness, or Integrated Math 2 readiness" : "A grade-level readiness diagnostic";
}

function getNextLevelGrade(grade) {
  if (String(grade) === "8" || String(grade) === "9") return "10";
  if (String(grade) === "10") return "11";
  if (String(grade) === "11") return "12";
  const gradeNumber = Number(grade);
  return Number.isFinite(gradeNumber) ? String(Math.min(12, gradeNumber + 1)) : grade;
}

function buildDailyPlan(topicResults, reviewTopics, grade, score) {
  if (score === 100 || reviewTopics.length === 0) {
    const challengeTopics = Number(grade) >= 10 ? TOPIC_GROUPS.grade11Advanced : TOPIC_GROUPS.quadraticsFunctions;
    return [
      { day: 1, tasks: [`5 ${challengeTopics[0]} questions`, "3 graphing or function questions", "2 SAT-style reasoning questions"] },
      { day: 2, tasks: ["4 mixed challenge problems", `4 ${challengeTopics[1] ?? "quadratics"} questions`, "2 non-routine word problems"] },
    ];
  }
  const focus = reviewTopics.slice(0, 3);
  return [
    { day: 1, tasks: [`5 ${focus[0] ?? "review"} questions`, `3 ${focus[1] ?? "graphing"} questions`] },
    { day: 2, tasks: [`4 ${focus[2] ?? "SAT-style"} problems`, "4 mixed grade-level questions"] },
  ];
}

function weightedPercent(rows) {
  const totals = rows.reduce(
    (acc, row) => ({
      correct: acc.correct + row.correct,
      total: acc.total + row.total,
    }),
    { correct: 0, total: 0 },
  );
  return totals.total ? Math.round((totals.correct / totals.total) * 100) : 0;
}

function performanceForGroup(session, topics) {
  const attempts = session.history.filter((item) => topics.includes(item.topic));
  const correct = attempts.filter((item) => item.correct).length;
  return {
    correct,
    total: attempts.length,
    percent: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
  };
}

export function createPracticeState(results, options = {}) {
  const topics = results.reviewTopics.length ? results.reviewTopics : TOPICS.slice(0, 5);
  const topicRows = new Map((results.topicResults ?? []).map((row) => [row.topic, row]));
  const startingDifficulty = (topic) => {
    const percent = topicRows.get(topic)?.percent ?? 0;
    if (percent >= 80) return 2;
    if (percent >= 55) return 1;
    return 0;
  };
  return {
    topics,
    goal: options.goal ?? 12,
    index: 0,
    difficultyByTopic: Object.fromEntries(topics.map((topic) => [topic, startingDifficulty(topic)])),
    streakByTopic: Object.fromEntries(topics.map((topic) => [topic, 0])),
    missStreakByTopic: Object.fromEntries(topics.map((topic) => [topic, 0])),
    masteredTopics: {},
    sessionCorrect: 0,
    overallStreak: 0,
    currentQuestion: null,
    attempts: [],
  };
}

export function nextPracticeQuestion(practiceState) {
  const topic = practiceState.topics[practiceState.index % practiceState.topics.length];
  const difficulty = practiceState.difficultyByTopic[topic] ?? 0;
  const question = generateQuestion(topic, difficulty);
  practiceState.currentQuestion = question;
  practiceState.index += 1;
  return question;
}

export function submitPracticeAnswer(practiceState, rawAnswer) {
  const question = practiceState.currentQuestion;
  const studentAnswer = String(rawAnswer ?? "").trim();
  const correct = question.validate(studentAnswer);
  const topic = question.topic;
  const beforeDifficulty = practiceState.difficultyByTopic[topic] ?? 0;
  let levelChange = "steady";

  practiceState.streakByTopic[topic] = correct ? (practiceState.streakByTopic[topic] ?? 0) + 1 : 0;
  practiceState.missStreakByTopic[topic] = correct ? 0 : (practiceState.missStreakByTopic[topic] ?? 0) + 1;
  practiceState.sessionCorrect += correct ? 1 : 0;
  practiceState.overallStreak = correct ? (practiceState.overallStreak ?? 0) + 1 : 0;

  if (correct && practiceState.streakByTopic[topic] >= 3) {
    practiceState.difficultyByTopic[topic] = clampDifficulty((practiceState.difficultyByTopic[topic] ?? 0) + 1);
    levelChange = practiceState.difficultyByTopic[topic] > beforeDifficulty ? "up" : "mastered";
    if (practiceState.difficultyByTopic[topic] === 2) practiceState.masteredTopics[topic] = true;
    practiceState.streakByTopic[topic] = 0;
  }
  if (!correct && practiceState.missStreakByTopic[topic] >= 2) {
    practiceState.difficultyByTopic[topic] = clampDifficulty((practiceState.difficultyByTopic[topic] ?? 0) - 1);
    levelChange = practiceState.difficultyByTopic[topic] < beforeDifficulty ? "down" : "steady";
    practiceState.missStreakByTopic[topic] = 0;
  }

  const attempt = {
    ...question,
    studentAnswer: studentAnswer || "No answer",
    correct,
    levelChange,
    sessionNumber: practiceState.attempts.length + 1,
    sessionGoal: practiceState.goal,
    sessionCorrect: practiceState.sessionCorrect,
    sessionAccuracy: Math.round((practiceState.sessionCorrect / (practiceState.attempts.length + 1)) * 100),
    topicStreak: practiceState.streakByTopic[topic] ?? 0,
    overallStreak: practiceState.overallStreak,
    mastered: Boolean(practiceState.masteredTopics[topic]),
  };
  practiceState.attempts.push(attempt);
  return attempt;
}

export function serializeSession(session) {
  return JSON.stringify({
    ...session,
    currentQuestion: null,
  });
}

export function getGradeProfile(grade) {
  const gradeNumber = Number(grade);
  if (String(grade) === "5" || gradeNumber <= 5) {
    return {
      name: "grade5",
      testLength: DEFAULT_TEST_LENGTH,
      startDifficulty: 1,
      primaryTopics: GRADE5_TOPICS,
      probeTopics: ["Fractions", "Decimals", "Word Problems"],
      reviewTopics: ["Arithmetic", "Fractions", "Decimals", "Word Problems", "Geometry Basics"],
      challengeTopics: ["Ratios and Proportions", "Percents", "Graphing Basics", "Geometry Basics"],
      minSatQuestions: 0,
      minGraphingQuestions: 0,
      prerequisiteMap: {
        Fractions: "Arithmetic",
        Decimals: "Fractions",
        Percents: "Fractions",
        "Ratios and Proportions": "Fractions",
        "Word Problems": "Arithmetic",
        "Geometry Basics": "Arithmetic",
      },
    };
  }

  if (String(grade) === "6") {
    return {
      name: "grade6",
      testLength: DEFAULT_TEST_LENGTH,
      startDifficulty: 1,
      primaryTopics: GRADE6_TOPICS,
      probeTopics: ["Fractions", "Ratios and Proportions", "Word Problems"],
      reviewTopics: GRADE5_TOPICS,
      challengeTopics: ["Basic Algebra", "Graphing Basics", "Exponents"],
      minSatQuestions: 0,
      minGraphingQuestions: 0,
      prerequisiteMap: {
        "Basic Algebra": "Arithmetic",
        "Graphing Basics": "Geometry Basics",
        Exponents: "Arithmetic",
      },
    };
  }

  if (String(grade) === "7") {
    return {
      name: "grade7",
      testLength: DEFAULT_TEST_LENGTH,
      startDifficulty: 1,
      primaryTopics: GRADE7_TOPICS,
      probeTopics: ["Ratios and Proportions", "Basic Algebra", "Graphing Basics"],
      reviewTopics: GRADE6_TOPICS,
      challengeTopics: ["Solving Equations", "Exponents", "Graphing Basics"],
      minSatQuestions: 5,
      minGraphingQuestions: 2,
      graphingTopics: ["Graphing Basics", "Data Interpretation"],
      prerequisiteMap: {
        "Negative Numbers": "Arithmetic",
        Exponents: "Arithmetic",
        "Solving Equations": "Basic Algebra",
        "Graphing Basics": "Geometry Basics",
      },
    };
  }

  if (String(grade) === "8" || String(grade) === "9") {
    return {
      name: "grade8",
      testLength: GRADE8_TEST_LENGTH,
      startDifficulty: 1,
      primaryTopics: GRADE8_TOPICS,
      probeTopics: ["Linear Equations and Inequalities", "Graphing: Word Problem Graph", "Exponents and Radicals"],
      reviewTopics: [
        "Fractions",
        "Percents",
        "Negative Numbers",
        "Solving Equations",
        "Exponents",
        "Square Roots",
        "Geometry Basics",
        "Graphing Basics",
      ],
      graphingTopics: [
        "Graphing: Match Equation",
        "Graphing: Slope From Points",
        "Graphing: Y-Intercept",
        "Graphing: Word Problem Graph",
        "Linear vs Nonlinear Relationships",
        "Linear Functions and Graphing",
        "Graphing Parabolas",
        "Scatter Plots and Best Fit",
        "Data Interpretation",
      ],
      requiredTopics: [
        "Graphing: Match Equation",
        "Graphing: Slope From Points",
        "Graphing: Y-Intercept",
        "Graphing: Word Problem Graph",
        "Linear vs Nonlinear Relationships",
      ],
      challengeTopics: [
        "Factoring",
        "Solving Quadratic Equations",
        "Graphing Parabolas",
        "SAT Math Reasoning",
        "Algebra 1 Readiness Word Problems",
      ],
      focusTopics: ["Factoring", "Solving Quadratic Equations", "Graphing Parabolas", "Function Notation", "SAT Math Reasoning"],
      minFocusQuestions: 5,
      minSatQuestions: 5,
      minGraphingQuestions: 5,
      prerequisiteMap: {
        "Linear Equations and Inequalities": "Solving Equations",
        "Systems of Equations": "Solving Equations",
        "Linear Functions and Graphing": "Graphing Basics",
        "Function Notation": "Basic Algebra",
        "Exponents and Radicals": "Exponents",
        "Scientific Notation": "Exponents",
        "Square and Cube Roots": "Square Roots",
        "Pythagorean Theorem": "Square Roots",
        "Irrational Numbers": "Square Roots",
        Transformations: "Graphing Basics",
        "Volume of 3D Shapes": "Geometry Basics",
        "Scatter Plots and Best Fit": "Graphing Basics",
        "Algebra 1 Readiness Word Problems": "Word Problems",
        "Linear vs Nonlinear Relationships": "Graphing Basics",
        Factoring: "Basic Algebra",
        "Solving Quadratic Equations": "Factoring",
        "Graphing Parabolas": "Graphing Basics",
        "SAT Math Reasoning": "Percents",
        "Data Interpretation": "Percents",
      },
    };
  }

  if (String(grade) === "10") {
    return {
      name: "grade10",
      testLength: GRADE10_TEST_LENGTH,
      startDifficulty: 1,
      primaryTopics: GRADE10_TOPICS,
      probeTopics: ["Systems of Equations", "Function Notation", "Graphing Parabolas"],
      reviewTopics: [
        "Fractions",
        "Percents",
        "Negative Numbers",
        "Basic Algebra",
        "Solving Equations",
        "Exponents",
        "Square Roots",
        "Geometry Basics",
        "Graphing Basics",
      ],
      graphingTopics: [
        "Graphing: Match Equation",
        "Graphing: Slope From Points",
        "Graphing: Y-Intercept",
        "Graphing: Word Problem Graph",
        "Linear vs Nonlinear Relationships",
        "Linear Functions and Graphing",
        "Graphing Parabolas",
        "Data Interpretation",
      ],
      requiredTopics: [
        "Graphing: Match Equation",
        "Graphing: Slope From Points",
        "Graphing: Y-Intercept",
        "Graphing: Word Problem Graph",
        "Linear vs Nonlinear Relationships",
      ],
      challengeTopics: [
        "Quadratic Formula",
        "Rational Expressions",
        "SAT Math Reasoning",
        "Data Interpretation",
        "Algebra and Quadratic Word Problems",
      ],
      minSatQuestions: 5,
      minGraphingQuestions: 5,
      focusTopics: TOPIC_GROUPS.quadraticsFunctions,
      minFocusQuestions: 6,
      prerequisiteMap: {
        "Linear Equations and Inequalities": "Solving Equations",
        "Systems of Equations": "Solving Equations",
        "Linear Functions and Graphing": "Graphing Basics",
        "Function Notation": "Basic Algebra",
        "Exponents and Radicals": "Exponents",
        Polynomials: "Basic Algebra",
        Factoring: "Basic Algebra",
        Quadratics: "Basic Algebra",
        "Solving Quadratic Equations": "Factoring",
        "Graphing Parabolas": "Graphing Basics",
        "Completing the Square": "Basic Algebra",
        "Quadratic Formula": "Solving Quadratic Equations",
        "Rational Expressions": "Fractions",
        "Radical Expressions": "Square Roots",
        "Similar Triangles": "Ratios and Proportions",
        "Pythagorean Theorem": "Square Roots",
        "Trigonometry Basics": "Fractions",
        "Algebra and Quadratic Word Problems": "Word Problems",
        "SAT Math Reasoning": "Percents",
        "Data Interpretation": "Percents",
      },
    };
  }

  if (String(grade) === "11") {
    return {
      name: "grade11",
      testLength: GRADE11_TEST_LENGTH,
      startDifficulty: 2,
      primaryTopics: GRADE11_TOPICS,
      probeTopics: ["Quadratic Formula", "Rational Expressions", "SAT Math Reasoning"],
      reviewTopics: [
        "Linear Equations and Inequalities",
        "Systems of Equations",
        "Function Notation",
        "Quadratics",
        "Factoring",
        "Radical Expressions",
        "Rational Expressions",
        "Graphing Parabolas",
      ],
      graphingTopics: [
        "Graphing: Match Equation",
        "Graphing: Slope From Points",
        "Graphing: Y-Intercept",
        "Graphing: Word Problem Graph",
        "Linear vs Nonlinear Relationships",
        "Graphing Parabolas",
        "Data Interpretation",
      ],
      requiredTopics: [
        "Graphing: Match Equation",
        "Graphing: Slope From Points",
        "Graphing: Y-Intercept",
        "Graphing: Word Problem Graph",
        "Linear vs Nonlinear Relationships",
      ],
      challengeTopics: TOPIC_GROUPS.grade11Advanced,
      focusTopics: TOPIC_GROUPS.grade11Advanced,
      minFocusQuestions: 8,
      minSatQuestions: 5,
      minGraphingQuestions: 5,
      prerequisiteMap: {
        "Quadratic Formula": "Solving Quadratic Equations",
        "Rational Expressions": "Fractions",
        "Radical Expressions": "Square Roots",
        "SAT Math Reasoning": "Percents",
        "Data Interpretation": "Percents",
      },
    };
  }

  return {
    name: "default",
    testLength: DEFAULT_TEST_LENGTH,
    startDifficulty: 1,
    primaryTopics: PREREQUISITE_TOPICS,
    probeTopics: Number.isFinite(gradeNumber) && gradeNumber >= 7 ? ["Solving Equations", "Graphing Basics", "Exponents"] : ["Fractions", "Decimals", "Word Problems"],
    reviewTopics: PREREQUISITE_TOPICS,
    minSatQuestions: !Number.isFinite(gradeNumber) || gradeNumber >= 7 ? 5 : 0,
    prerequisiteMap: {},
  };
}

function choose(items) {
  return items[Math.floor(Math.random() * items.length)];
}
