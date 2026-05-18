import {
  calculateResults,
  createPracticeState,
  createSession,
  nextDiagnosticQuestion,
  nextPracticeQuestion,
  serializeSession,
  submitDiagnosticAnswer,
  submitPracticeAnswer,
} from "./engine.js";
import { DIFFICULTY_LABELS } from "./questions.js";
import {
  applyAnnualGradeRollover,
  clearActiveProfileId,
  clearSession,
  exportProfilesData,
  getProfile,
  getProfiles,
  importHistoricalReports,
  importProfilesData,
  importStudentProfiles,
  recordPractice,
  recordFinalExam,
  recordTest,
  removeLatestTest,
  recordWorksheet,
  resetWorksheetHistory,
  scoreWorksheet,
  saveSession,
  setActiveProfileId,
  touchProfile,
  updateProfile,
  upsertProfile,
} from "./storage.js";
import { exportResultsPdf } from "./report.js";
import { buildDailyWorksheet, exportWorksheetPdf } from "./worksheet.js";
import {
  EXAM_META,
  EXAM_SECTIONS,
  getAllExamQuestions,
  createFinalExamState,
  getCurrentExamQuestion,
  submitExamAnswer,
  parentGradeQuestion,
  parentSetPoints,
  calculateExamScore,
  getLetterGrade,
  buildExamRecord,
  exportFinalExamPdf,
} from "./finalExam.js";
import { importedReports } from "./importedReports.js";
import {
  getSupabaseConfig,
  pullProfilesFromSupabase,
  pushProfilesToSupabase,
  saveSupabaseConfig,
  syncProfileToSupabase,
  testSupabaseConnection,
} from "./supabaseSync.js";
import { computeLeaderboard, MATH_AVATARS, CATEGORY_STYLES } from "./leaderboard.js";

const seededStudentProfiles = [
  { name: "Halle Arias", grade: "5", notes: "5th grade going to 6th", aliases: ["Halle"] },
  { name: "Hunter Arias", grade: "11", notes: "11th grade going to 12th", aliases: ["Hunter"] },
  { name: "Austin Arias", grade: "10", notes: "10th grade going to 11th", aliases: ["Austin"] },
  { name: "Hannah Arias", grade: "7", notes: "7th grade going to 8th", aliases: ["Hannah"] },
  { name: "Bella Arias", grade: "5", notes: "5th grade", aliases: ["Bella"] },
  { name: "Greyson Arias", grade: "7", notes: "7th grade", aliases: ["Greyson"] },
  { name: "Leilani DeVries", grade: "10", notes: "10th grade — Integrated Math 2", aliases: ["Leilani"] },
];

const playfulBoys = new Set(["liam devries", "austin arias", "greyson arias", "hunter arias"]);
const correctCheers = [
  "Brilliant work. That was sharp, confident, and exactly right.",
  "Excellent job. Your brain is absolutely cooking on that one.",
  "Beautiful thinking. Keep stacking wins like that.",
  "That is top-tier math work. Keep going.",
];
const playfulMisses = [
  "Nope, my guy. Shake it off and get the next one right, foo.",
  "Close, but not today. Lock in and make the next one yours, foo.",
  "That one slipped away. Reset, breathe, and prove it on the next one.",
  "Not quite, champ. Read it twice next time and go win the next round.",
];

const $ = (selector) => document.querySelector(selector);

const elements = {
  sessionDate: $("#sessionDate"),
  studentForm: $("#studentForm"),
  profileSelect: $("#profileSelect"),
  studentName: $("#studentName"),
  gradeLevel: $("#gradeLevel"),
  adminForm: $("#adminForm"),
  adminPassword: $("#adminPassword"),
  adminLoginMessage: $("#adminLoginMessage"),
  startScreen: $("#startScreen"),
  adminScreen: $("#adminScreen"),
  dashboardScreen: $("#dashboardScreen"),
  testScreen: $("#testScreen"),
  resultsScreen: $("#resultsScreen"),
  practiceScreen: $("#practiceScreen"),
  questionMeta: $("#questionMeta"),
  questionTopic: $("#questionTopic"),
  questionText: $("#questionText"),
  questionFormat: $("#questionFormat"),
  difficultyBadge: $("#difficultyBadge"),
  progressFill: $("#progressFill"),
  answerArea: $("#answerArea"),
  answerHint: $("#answerHint"),
  submitAnswer: $("#submitAnswer"),
  nextQuestion: $("#nextQuestion"),
  restartTest: $("#restartTest"),
  restartTestTop: $("#restartTestTop"),
  studentSummary: $("#studentSummary"),
  overallScore: $("#overallScore"),
  placementLevel: $("#placementLevel"),
  currentReadiness: $("#currentReadiness"),
  difficultyReached: $("#difficultyReached"),
  practiceFocus: $("#practiceFocus"),
  coursePlacement: $("#coursePlacement"),
  satPerformance: $("#satPerformance"),
  testDifficultyFit: $("#testDifficultyFit"),
  nextTestLevel: $("#nextTestLevel"),
  readinessNarrative: $("#readinessNarrative"),
  strongestSkills: $("#strongestSkills"),
  weakestSkills: $("#weakestSkills"),
  nextSteps: $("#nextSteps"),
  dailyPlan: $("#dailyPlan"),
  graphingPerformance: $("#graphingPerformance"),
  reasoningPerformance: $("#reasoningPerformance"),
  topicResults: $("#topicResults"),
  improvementList: $("#improvementList"),
  missedReview: $("#missedReview"),
  practiceWeakAreas: $("#practiceWeakAreas"),
  exportPdf: $("#exportPdf"),
  exportMyResults: $("#exportMyResults"),
  newTest: $("#newTest"),
  startNextLevel: $("#startNextLevel"),
  startChallengeMode: $("#startChallengeMode"),
  backToDashboard: $("#backToDashboard"),
  dashboardStudent: $("#dashboardStudent"),
  dashboardScore: $("#dashboardScore"),
  dashboardPlacement: $("#dashboardPlacement"),
  dashboardNextTest: $("#dashboardNextTest"),
  dashboardCourse: $("#dashboardCourse"),
  dashboardNextAction: $("#dashboardNextAction"),
  dashboardTestCount: $("#dashboardTestCount"),
  dashboardPracticeCount: $("#dashboardPracticeCount"),
  dashboardWorksheetCount: $("#dashboardWorksheetCount"),
  learningPath: $("#learningPath"),
  scoreHistory: $("#scoreHistory"),
  topicProgressDashboard: $("#topicProgressDashboard"),
  teacherReport: $("#teacherReport"),
  worksheetHistory: $("#worksheetHistory"),
  startFromDashboard: $("#startFromDashboard"),
  startMiniTest: $("#startMiniTest"),
  dashboardPractice: $("#dashboardPractice"),
  worksheetLength: $("#worksheetLength"),
  createWorksheet: $("#createWorksheet"),
  practiceMeta: $("#practiceMeta"),
  practiceTitle: $("#practiceTitle"),
  practiceDifficulty: $("#practiceDifficulty"),
  practiceStatus: $("#practiceStatus"),
  practiceQuestionText: $("#practiceQuestionText"),
  practiceQuestionFormat: $("#practiceQuestionFormat"),
  practiceAnswerArea: $("#practiceAnswerArea"),
  practiceFeedback: $("#practiceFeedback"),
  submitPractice: $("#submitPractice"),
  nextPractice: $("#nextPractice"),
  backToResults: $("#backToResults"),
  practiceDashboard: $("#practiceDashboard"),
  adminStudents: $("#adminStudents"),
  adminLogout: $("#adminLogout"),
  exportAllProfiles: $("#exportAllProfiles"),
  importProfilesFile: $("#importProfilesFile"),
  adminTransferMessage: $("#adminTransferMessage"),
  supabaseStatus: $("#supabaseStatus"),
  supabaseAnonKey: $("#supabaseAnonKey"),
  saveSupabaseKey: $("#saveSupabaseKey"),
  testSupabase: $("#testSupabase"),
  pushSupabase: $("#pushSupabase"),
  pullSupabase: $("#pullSupabase"),
  backToAdminButtons: document.querySelectorAll("[data-back-admin]"),
  leaderboardSection: $("#leaderboardSection"),
  leaderboardGrid: $("#leaderboardGrid"),
  dashboardAvatar: $("#dashboardAvatar"),
  // Final exam
  startFinalExam: $("#startFinalExam"),
  finalExamRecords: $("#finalExamRecords"),
  finalExamScreen: $("#finalExamScreen"),
  finalExamResultsScreen: $("#finalExamResultsScreen"),
  finalExamMeta: $("#finalExamMeta"),
  finalExamHeading: $("#finalExamHeading"),
  finalExamProgress: $("#finalExamProgress"),
  finalExamSectionLabel: $("#finalExamSectionLabel"),
  finalExamQuestionTopic: $("#finalExamQuestionTopic"),
  finalExamQuestionText: $("#finalExamQuestionText"),
  finalExamAnswerArea: $("#finalExamAnswerArea"),
  finalExamFeedbackLine: $("#finalExamFeedbackLine"),
  submitFinalExamAnswer: $("#submitFinalExamAnswer"),
  nextFinalExamQuestion: $("#nextFinalExamQuestion"),
  finalExamResultsStudent: $("#finalExamResultsStudent"),
  finalExamScoreRing: $("#finalExamScoreRing"),
  finalExamScoreDisplay: $("#finalExamScoreDisplay"),
  finalExamGradeHero: $("#finalExamGradeHero"),
  finalExamPendingBanner: $("#finalExamPendingBanner"),
  finalExamGradingArea: $("#finalExamGradingArea"),
  saveFinalExamRecord: $("#saveFinalExamRecord"),
  exportFinalExamPdf: $("#exportFinalExamPdf"),
  backToDashboardFromExam: $("#backToDashboardFromExam"),
};

let session = null;
let results = null;
let practiceState = null;
let activeProfile = null;
let finalExamState = null;
let adminSessionActive = sessionStorage.getItem("math-admin-session") === "1";
let openedFromAdmin = false;

importHistoricalReports(importedReports);
importStudentProfiles(seededStudentProfiles);
applyAnnualGradeRollover();
refreshProfileSelect();
renderSupabaseStatus();
renderLeaderboard();

if (adminSessionActive) {
  renderAdminDashboard();
  showScreen("admin");
} else {
  const savedProfileId = sessionStorage.getItem("math-student-profile");
  if (savedProfileId) {
    const savedProfile = getProfile(savedProfileId);
    if (savedProfile) {
      activeProfile = savedProfile;
      renderDashboard();
      showScreen("dashboard");
    }
  }
}

async function syncFromCloud() {
  if (!getSupabaseConfig().enabled) return;
  try {
    const profiles = await pullProfilesFromSupabase();
    const summary = importProfilesData({ profiles });
    if (summary.addedProfiles + summary.updatedProfiles > 0) {
      refreshProfileSelect();
      renderLeaderboard();
      if (adminSessionActive) renderAdminDashboard();
      if (activeProfile) {
        activeProfile = getProfile(activeProfile.id) ?? activeProfile;
        renderDashboard();
      }
    }
  } catch {
    // silent — no internet or Supabase down shouldn't break the app
  }
}

// Pull on load, every 30 s, and when the tab regains focus (covers mobile app-switching)
syncFromCloud();
setInterval(syncFromCloud, 30000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") syncFromCloud();
});

elements.sessionDate.textContent = new Date().toLocaleDateString(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

elements.studentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(elements.studentForm);
  const selectedProfileId = data.get("profileSelect");
  activeProfile = selectedProfileId
    ? getProfile(selectedProfileId)
    : upsertProfile({
        name: data.get("studentName").trim(),
        grade: data.get("gradeLevel"),
      });
  if (!activeProfile) return;
  if (selectedProfileId) setActiveProfileId(activeProfile.id);
  openedFromAdmin = false;
  activeProfile = touchProfile(activeProfile.id, "Opened dashboard") ?? activeProfile;
  queueProfileSync(activeProfile);
  elements.studentName.value = activeProfile.name;
  elements.gradeLevel.value = activeProfile.grade;
  renderDashboard();
  showScreen("dashboard");
});

elements.profileSelect.addEventListener("change", () => {
  const profile = getProfile(elements.profileSelect.value);
  if (!profile) return;
  elements.studentName.value = profile.name;
  elements.gradeLevel.value = profile.grade;
});

elements.adminForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (elements.adminPassword.value !== "1234#") {
    elements.adminLoginMessage.textContent = "That password did not match.";
    return;
  }
  elements.adminPassword.value = "";
  elements.adminLoginMessage.textContent = "";
  adminSessionActive = true;
  sessionStorage.setItem("math-admin-session", "1");
  openedFromAdmin = false;
  renderAdminDashboard();
  showScreen("admin");
});

elements.startFromDashboard.addEventListener("click", () => {
  if (!activeProfile) return;
  startDiagnosticForProfile(activeProfile.grade);
});

elements.startMiniTest.addEventListener("click", () => {
  if (!activeProfile) return;
  startDiagnosticForProfile(activeProfile.grade, { miniTest: true });
});

elements.dashboardPractice.addEventListener("click", () => {
  if (!activeProfile?.tests.length) return;
  activeProfile = touchProfile(activeProfile.id, "Started practice") ?? activeProfile;
  queueProfileSync(activeProfile);
  results = resultsFromProfileTest(activeProfile.tests[0]);
  practiceState = createPracticeState(results);
  showScreen("practice");
  showPracticeQuestion(nextPracticeQuestion(practiceState));
});

elements.createWorksheet.addEventListener("click", async () => {
  if (!activeProfile) return;
  const btn = elements.createWorksheet;
  btn.disabled = true;
  try {
    const worksheet = buildDailyWorksheet(activeProfile, {
      length: Number(elements.worksheetLength.value),
    });
    // Record the worksheet first so it's saved regardless of PDF outcome
    activeProfile = recordWorksheet(activeProfile.id, worksheet);
    queueProfileSync(activeProfile);
    renderLeaderboard();
    renderDashboard();
    // Then attempt PDF — failure here is non-fatal
    try {
      await exportWorksheetPdf(worksheet);
    } catch (pdfErr) {
      console.error("PDF generation failed:", pdfErr);
      alert("Worksheet saved to your history, but the PDF could not be generated. Try again or use a different browser.");
    }
  } catch (err) {
    console.error("Worksheet creation failed:", err);
    alert("Could not create the worksheet. Please try again.");
  } finally {
    btn.disabled = false;
  }
});

elements.exportMyResults.addEventListener("click", () => {
  if (!activeProfile) return;
  activeProfile = touchProfile(activeProfile.id, "Exported results") ?? activeProfile;
  queueProfileSync(activeProfile);
  downloadJson(exportProfilesData([activeProfile.id]), `${slugify(activeProfile.name)}-math-placement-results.json`);
  renderDashboard();
});

elements.submitAnswer.addEventListener("click", () => {
  const answer = getAnswer(elements.answerArea, session.currentQuestion.type);
  if (!answer) {
    elements.answerHint.textContent = "Choose or enter an answer before submitting.";
    return;
  }

  const outcome = submitDiagnosticAnswer(session, answer);
  saveSession(serializeSession(session));
  if (activeProfile) {
    activeProfile = touchProfile(activeProfile.id, "Taking a test") ?? activeProfile;
    queueProfileSync(activeProfile);
  }
  lockAnswerArea(elements.answerArea);
  elements.answerHint.textContent = outcome.correct
    ? studentCorrectMessage()
    : `${studentMissMessage()} Correct answer: ${session.history.at(-1).answer}`;
  elements.answerHint.style.color = outcome.correct ? "var(--green)" : "var(--red)";
  elements.submitAnswer.classList.add("hidden");
  elements.nextQuestion.classList.remove("hidden");
  elements.nextQuestion.textContent = outcome.completed ? "Review Results" : "Next";
});

elements.nextQuestion.addEventListener("click", () => {
  if (session.completedAt) {
    results = calculateResults(session);
    if (activeProfile) {
      activeProfile = recordTest(activeProfile.id, session, results);
      queueProfileSync(activeProfile);
      renderLeaderboard();
    }
    renderResults();
    showScreen("results");
    return;
  }
  showDiagnosticQuestion(nextDiagnosticQuestion(session));
});

elements.restartTest.addEventListener("click", () => restartTest());
elements.restartTestTop.addEventListener("click", () => restartTest());

elements.practiceWeakAreas.addEventListener("click", () => {
  practiceState = createPracticeState(results);
  showScreen("practice");
  showPracticeQuestion(nextPracticeQuestion(practiceState));
});

elements.submitPractice.addEventListener("click", () => {
  const answer = getAnswer(elements.practiceAnswerArea, practiceState.currentQuestion.type);
  if (!answer) {
    elements.practiceFeedback.textContent = "Try an answer first, then check it.";
    elements.practiceFeedback.classList.add("show");
    return;
  }

  const attempt = submitPracticeAnswer(practiceState, answer);
  if (activeProfile) {
    activeProfile = recordPractice(activeProfile.id, attempt);
    queueProfileSync(activeProfile);
    renderLeaderboard();
  }
  lockAnswerArea(elements.practiceAnswerArea);
  renderPracticeStatus();
  elements.practiceFeedback.innerHTML = `
    <p><span class="answer-mark ${attempt.correct ? "right" : "wrong"}">${escapeHtml(attempt.correct ? studentCorrectMessage() : studentMissMessage())}</span></p>
    <p><strong>${escapeHtml(practiceCoachMessage(attempt))}</strong></p>
    <p><strong>Correct answer:</strong> ${escapeHtml(attempt.answer)}</p>
    <p>${escapeHtml(attempt.explanation)}</p>
    <p><strong>Remember this:</strong> ${escapeHtml(attempt.tip)}</p>
  `;
  elements.practiceFeedback.classList.add("show");
  elements.submitPractice.classList.add("hidden");
  elements.nextPractice.classList.remove("hidden");
  elements.nextPractice.textContent = practiceState.attempts.length >= practiceState.goal ? "Keep Going" : "Next Practice";
});

elements.nextPractice.addEventListener("click", () => {
  showPracticeQuestion(nextPracticeQuestion(practiceState));
});

elements.backToResults.addEventListener("click", () => showScreen(results ? "results" : "dashboard"));
elements.practiceDashboard.addEventListener("click", () => {
  renderDashboard();
  showScreen("dashboard");
});
elements.adminLogout.addEventListener("click", () => {
  adminSessionActive = false;
  sessionStorage.removeItem("math-admin-session");
  openedFromAdmin = false;
  showScreen("start");
});

elements.exportAllProfiles.addEventListener("click", () => {
  downloadJson(exportProfilesData(), `math-placement-all-results-${new Date().toISOString().slice(0, 10)}.json`);
  elements.adminTransferMessage.textContent = "Exported all student results.";
});

elements.importProfilesFile.addEventListener("change", async () => {
  const file = elements.importProfilesFile.files?.[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    const summary = importProfilesData(payload);
    refreshProfileSelect();
    renderAdminDashboard();
    renderLeaderboard();
    elements.adminTransferMessage.textContent = `Imported results: ${summary.addedProfiles} new profile${summary.addedProfiles === 1 ? "" : "s"}, ${summary.updatedProfiles} updated.`;
  } catch (error) {
    elements.adminTransferMessage.textContent = error instanceof Error ? error.message : "Could not import that results file.";
  } finally {
    elements.importProfilesFile.value = "";
  }
});

elements.saveSupabaseKey.addEventListener("click", () => {
  saveSupabaseConfig({ anonKey: elements.supabaseAnonKey.value });
  elements.supabaseAnonKey.value = "";
  renderSupabaseStatus("Supabase key saved. This browser can now sync results.");
});

elements.testSupabase.addEventListener("click", async () => {
  await runSupabaseAction("Testing Supabase connection...", async () => {
    await testSupabaseConnection();
    return "Supabase connection works.";
  });
});

elements.pushSupabase.addEventListener("click", async () => {
  await runSupabaseAction("Uploading local results...", async () => {
    const summary = await pushProfilesToSupabase(getProfiles());
    return `Uploaded ${summary.pushed} profile${summary.pushed === 1 ? "" : "s"} to Supabase.`;
  });
});

elements.pullSupabase.addEventListener("click", async () => {
  await runSupabaseAction("Downloading cloud results...", async () => {
    const profiles = await pullProfilesFromSupabase();
    const summary = importProfilesData({ profiles });
    refreshProfileSelect();
    renderAdminDashboard();
    renderLeaderboard();
    return `Downloaded cloud results: ${summary.addedProfiles} new, ${summary.updatedProfiles} updated.`;
  });
});

elements.backToDashboard.addEventListener("click", () => {
  renderDashboard();
  showScreen("dashboard");
});
elements.exportPdf.addEventListener("click", () => exportResultsPdf(session, results));
elements.newTest.addEventListener("click", () => {
  if (!confirm("Start over? This will clear the current score, missed questions, adaptive level, practice recommendations, and saved session.")) return;
  resetAll();
});

elements.startNextLevel.addEventListener("click", () => {
  if (!activeProfile || !results?.nextLevelGrade) return;
  startDiagnosticForProfile(results.nextLevelGrade);
});

elements.startChallengeMode.addEventListener("click", () => {
  if (!activeProfile) return;
  startDiagnosticForProfile(results?.nextLevelGrade ?? activeProfile.grade, { challengeMode: true });
});

elements.adminStudents.addEventListener("change", async (event) => {
  const uploadInput = event.target.closest("[data-upload-avatar]");
  if (!uploadInput) return;
  const file = uploadInput.files?.[0];
  if (!file) return;
  const profileId = uploadInput.dataset.uploadAvatar;
  try {
    const dataUrl = await readAndResizeAvatar(file);
    const updated = updateProfile(profileId, (p) => { p.avatar = dataUrl; return p; });
    queueProfileSync(updated);
    renderAdminDashboard();
    renderLeaderboard();
  } catch {
    // silently ignore bad image files
  }
});

// ── Final Exam: event listeners ──────────────────────────────────────────────

elements.startFinalExam.addEventListener("click", () => {
  if (!activeProfile) return;
  if (activeProfile.finalExams?.length) {
    const last = activeProfile.finalExams[0];
    if (!confirm(`A completed exam record already exists (${new Date(last.completedAt).toLocaleDateString()}, ${last.letterGrade} — ${last.percent}%). Start a new attempt?`)) return;
  }
  activeProfile = touchProfile(activeProfile.id, "Started final exam") ?? activeProfile;
  queueProfileSync(activeProfile);
  finalExamState = createFinalExamState(activeProfile);
  showScreen("finalExam");
  renderFinalExamQuestion();
});

elements.submitFinalExamAnswer.addEventListener("click", () => {
  const question = getCurrentExamQuestion(finalExamState);
  if (!question) return;
  const answer = getAnswer(elements.finalExamAnswerArea, question.type === "multiple-choice" ? "multiple-choice" : "fill-blank");
  if (!answer.trim()) {
    elements.finalExamFeedbackLine.textContent = "Enter or choose an answer before submitting.";
    elements.finalExamFeedbackLine.style.color = "var(--red)";
    return;
  }

  const outcome = submitExamAnswer(finalExamState, answer);
  lockAnswerArea(elements.finalExamAnswerArea);

  if (question.type === "multiple-choice") {
    const choiceLabels = ["A", "B", "C", "D"];
    const chosenIndex = choiceLabels.indexOf(answer.toUpperCase());
    const chosenText = question.choices[chosenIndex] ?? answer;
    elements.finalExamFeedbackLine.textContent = outcome.correct
      ? `Correct. ${question.explanation}`
      : `Incorrect. Correct answer: ${question.answer}) ${question.answerText}. ${question.explanation}`;
    elements.finalExamFeedbackLine.style.color = outcome.correct ? "var(--green)" : "var(--red)";
  } else {
    elements.finalExamFeedbackLine.textContent = "Answer recorded. Your response will be reviewed during grading.";
    elements.finalExamFeedbackLine.style.color = "var(--muted)";
  }

  elements.submitFinalExamAnswer.classList.add("hidden");
  elements.nextFinalExamQuestion.classList.remove("hidden");
  elements.nextFinalExamQuestion.textContent = outcome.isLast ? "View Results" : "Next Question";
});

elements.nextFinalExamQuestion.addEventListener("click", () => {
  if (finalExamState.phase !== "taking") {
    renderFinalExamResults();
    showScreen("finalExamResults");
  } else {
    renderFinalExamQuestion();
  }
});

elements.saveFinalExamRecord.addEventListener("click", () => {
  if (!activeProfile || !finalExamState) return;
  const record = buildExamRecord(finalExamState);
  activeProfile = recordFinalExam(activeProfile.id, record);
  queueProfileSync(activeProfile);
  renderDashboard();
  elements.saveFinalExamRecord.textContent = "Record Saved";
  elements.saveFinalExamRecord.disabled = true;
});

elements.exportFinalExamPdf.addEventListener("click", async () => {
  if (!activeProfile || !finalExamState) return;
  const btn = elements.exportFinalExamPdf;
  btn.disabled = true;
  try {
    const record = buildExamRecord(finalExamState);
    await exportFinalExamPdf(activeProfile, finalExamState, record);
  } catch (err) {
    console.error("Final exam PDF failed:", err);
    alert("Could not generate the PDF. Try again or use a different browser.");
  } finally {
    btn.disabled = false;
  }
});

elements.backToDashboardFromExam.addEventListener("click", () => {
  renderDashboard();
  showScreen("dashboard");
});

// Delegated: parent grading buttons in finalExamGradingArea
elements.finalExamGradingArea.addEventListener("click", (event) => {
  const markBtn = event.target.closest("[data-mark-question]");
  if (markBtn && finalExamState) {
    const { markQuestion, markCorrect } = markBtn.dataset;
    parentGradeQuestion(finalExamState, markQuestion, markCorrect === "true");
    renderFinalExamResults();
    return;
  }
});

elements.finalExamGradingArea.addEventListener("change", (event) => {
  const pointsInput = event.target.closest("[data-points-question]");
  if (pointsInput && finalExamState) {
    parentSetPoints(finalExamState, pointsInput.dataset.pointsQuestion, pointsInput.value);
    renderFinalExamResults();
  }
});

function renderFinalExamQuestion() {
  const state = finalExamState;
  const question = getCurrentExamQuestion(state);
  if (!question) return;

  const total = state.allQuestions.length;
  const num = state.currentIndex + 1;
  const section = EXAM_SECTIONS.find((s) => s.id === question.sectionId);

  elements.finalExamMeta.textContent = `Question ${num} of ${total}`;
  elements.finalExamProgress.style.width = `${((num - 1) / total) * 100}%`;
  elements.finalExamSectionLabel.textContent = section ? `${section.title} — ${section.instructions}` : "";
  elements.finalExamQuestionTopic.textContent = question.topic;
  elements.finalExamQuestionText.textContent = question.text;
  elements.finalExamFeedbackLine.textContent = "";
  elements.submitFinalExamAnswer.classList.remove("hidden");
  elements.nextFinalExamQuestion.classList.add("hidden");

  // Render answer area
  elements.finalExamAnswerArea.innerHTML = "";
  if (question.type === "multiple-choice") {
    question.choices.forEach((choice, i) => {
      const label = document.createElement("label");
      label.className = "choice";
      label.innerHTML = `
        <input type="radio" name="answer" value="${escapeHtml(String.fromCharCode(65 + i))}" />
        <span>${String.fromCharCode(65 + i)}. ${escapeHtml(choice)}</span>
      `;
      elements.finalExamAnswerArea.appendChild(label);
    });
  } else {
    const isMultiLine = question.type === "extended-response";
    if (isMultiLine) {
      const lbl = document.createElement("label");
      lbl.innerHTML = `Answer<br /><textarea name="answer" rows="6" placeholder="Show all work and explain your reasoning…" style="width:100%;font-family:inherit;font-size:1rem;padding:10px;border:2px solid var(--border);border-radius:8px;margin-top:6px;resize:vertical"></textarea>`;
      elements.finalExamAnswerArea.appendChild(lbl);
    } else {
      const lbl = document.createElement("label");
      lbl.innerHTML = `Answer<input inputmode="text" autocomplete="off" name="answer" placeholder="Type your answer" />`;
      elements.finalExamAnswerArea.appendChild(lbl);
    }
  }
}

function renderFinalExamResults() {
  const state = finalExamState;
  if (!state) return;

  const score = calculateExamScore(state);
  const gradeColors = { A: "#16a34a", B: "#2563eb", C: "#d97706", D: "#ea580c", F: "#dc2626" };
  const gColor = gradeColors[score.letterGrade] ?? "#374151";

  elements.finalExamResultsStudent.textContent = `${state.studentName} • Grade ${state.grade} • Completed ${new Date(state.completedAt ?? Date.now()).toLocaleDateString()}`;
  elements.finalExamScoreDisplay.textContent = `${score.percent}%`;
  elements.finalExamScoreRing.style.setProperty("--ring-color", gColor);

  // Grade hero
  elements.finalExamGradeHero.innerHTML = `
    <div class="exam-grade-card" style="border-left-color:${gColor}">
      <div class="exam-grade-letter" style="color:${gColor}">${score.letterGrade}</div>
      <div class="exam-grade-details">
        <strong style="font-size:1.4rem">${score.pointsEarned} / ${score.totalPoints} points</strong>
        <div style="color:var(--muted);margin-top:4px">${score.percent}% — ${gradeDescriptorText(score.letterGrade)}</div>
      </div>
    </div>
  `;

  // Pending banner
  const hasPending = score.pendingCount > 0;
  elements.finalExamPendingBanner.classList.toggle("hidden", !hasPending);
  if (hasPending) {
    elements.finalExamPendingBanner.innerHTML = `
      <strong>Parent grading required</strong> — ${score.pendingCount} question${score.pendingCount === 1 ? "" : "s"} still need${score.pendingCount === 1 ? "s" : ""} to be marked.
      Review each one below and click <strong>Correct</strong> or <strong>Incorrect</strong>.
    `;
  }

  // Save button state
  elements.saveFinalExamRecord.disabled = false;
  elements.saveFinalExamRecord.textContent = "Save Exam Record";

  // Grading area — all questions
  let html = "";
  const allQuestions = state.allQuestions;
  let lastSectionId = null;

  allQuestions.forEach((question, idx) => {
    if (question.sectionId !== lastSectionId) {
      lastSectionId = question.sectionId;
      const section = EXAM_SECTIONS.find((s) => s.id === question.sectionId);
      html += `<h3 class="exam-section-divider">${escapeHtml(section?.title ?? question.sectionId)}</h3>`;
    }

    const ansRecord = state.answers.find((a) => a.questionId === question.id);
    const studentAnswer = ansRecord?.studentAnswer ?? "(not answered)";
    const correct = ansRecord?.correct;
    const ptsEarned = ansRecord?.pointsEarned;
    const ptsMax = question.pointsEach;
    const isAuto = question.type === "multiple-choice";
    const isGraded = ansRecord?.parentGraded;

    const correctMark = correct === true ? `<span class="answer-mark right">✔ Correct</span>` : correct === false ? `<span class="answer-mark wrong">✘ Incorrect</span>` : `<span class="answer-mark" style="background:#f1f5f9;color:#64748b">Pending</span>`;

    const parentButtons = !isAuto ? `
      <div class="exam-grade-buttons">
        <button class="secondary small-button" type="button" data-mark-question="${escapeHtml(question.id)}" data-mark-correct="true">✔ Mark Correct (${ptsMax} pts)</button>
        <button class="ghost small-button" type="button" data-mark-question="${escapeHtml(question.id)}" data-mark-correct="false">✘ Mark Incorrect (0 pts)</button>
        <label style="font-size:0.85rem;color:var(--muted)">
          Or enter partial credit:
          <input type="number" min="0" max="${ptsMax}" value="${ptsEarned ?? ""}" placeholder="0–${ptsMax}" data-points-question="${escapeHtml(question.id)}" style="width:60px;margin-left:6px" />
          / ${ptsMax} pts
        </label>
      </div>
    ` : "";

    html += `
      <article class="review-card exam-question-card">
        <div class="exam-q-header">
          <span class="exam-q-num">Q${idx + 1} — ${escapeHtml(question.topic)}</span>
          <span>${correctMark} ${ptsEarned !== null && ptsEarned !== undefined ? `<strong>${ptsEarned}/${ptsMax} pts</strong>` : `<span style="color:var(--muted)">—/${ptsMax} pts</span>`}</span>
        </div>
        <p class="question-text" style="font-size:1rem;margin:8px 0">${escapeHtml(question.text)}</p>
        <p><strong>Student answer:</strong> ${escapeHtml(studentAnswer)}</p>
        ${!isAuto || correct === false ? `<p style="color:#16a34a"><strong>Correct answer:</strong> ${escapeHtml(question.answer)}</p>` : ""}
        ${correct === false || (!isAuto && !isGraded) ? `<p style="color:var(--muted);font-size:0.9rem"><em>${escapeHtml(question.explanation)}</em></p>` : ""}
        ${parentButtons}
      </article>
    `;
  });

  elements.finalExamGradingArea.innerHTML = html;
}

function gradeDescriptorText(letter) {
  return { A: "Excellent", B: "Above Average", C: "Satisfactory", D: "Below Average", F: "Needs Improvement" }[letter] ?? "";
}

function restartTest() {
  if (!confirm("Restart this test? This will clear the current question, score, adaptive level, missed questions, practice recommendations, and saved session.")) return;
  resetAll();
}

function resetAll() {
  clearSession();
  session = null;
  results = null;
  practiceState = null;
  finalExamState = null;
  if (activeProfile) {
    renderDashboard();
    showScreen("dashboard");
  } else {
    elements.studentForm.reset();
    showScreen("start");
  }
}

function startDiagnosticForProfile(grade, options = {}) {
  const status = options.challengeMode ? "Started challenge mode" : options.miniTest ? "Started a daily mini test" : "Started a test";
  activeProfile = touchProfile(activeProfile.id, status) ?? activeProfile;
  queueProfileSync(activeProfile);
  session = createSession({
    name: activeProfile.name,
    grade,
    startedAt: new Date().toISOString(),
    challengeMode: options.challengeMode,
    miniTest: options.miniTest,
  });
  if (options.miniTest) {
    session.totalQuestions = 8;
    session.miniTest = true;
  }
  saveSession(serializeSession(session));
  showScreen("test");
  showDiagnosticQuestion(nextDiagnosticQuestion(session));
}

function exitProfile() {
  clearSession();
  clearActiveProfileId();
  session = null;
  results = null;
  practiceState = null;
  finalExamState = null;
  activeProfile = null;
  openedFromAdmin = false;
  elements.studentForm.reset();
  elements.answerHint.textContent = "";
  elements.practiceFeedback.textContent = "";
  elements.practiceFeedback.classList.remove("show");
  refreshProfileSelect();
  showScreen("start");
}

function backToAdmin() {
  if (!adminSessionActive) return;
  clearSession();
  session = null;
  results = null;
  practiceState = null;
  finalExamState = null;
  activeProfile = null;
  openedFromAdmin = false;
  renderAdminDashboard();
  showScreen("admin");
}

function showScreen(name) {
  const screens = {
    start: elements.startScreen,
    admin: elements.adminScreen,
    dashboard: elements.dashboardScreen,
    test: elements.testScreen,
    results: elements.resultsScreen,
    practice: elements.practiceScreen,
    finalExam: elements.finalExamScreen,
    finalExamResults: elements.finalExamResultsScreen,
  };
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
  updateAdminReturnButtons();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (name === "dashboard" && activeProfile) {
    sessionStorage.setItem("math-student-profile", activeProfile.id);
  } else if (name === "start") {
    sessionStorage.removeItem("math-student-profile");
  }
}

function updateAdminReturnButtons() {
  elements.backToAdminButtons.forEach((button) => {
    button.classList.toggle("hidden", !openedFromAdmin);
  });
}

function renderAdminDashboard() {
  const profiles = getProfiles();
  elements.adminStudents.innerHTML = profiles.length
    ? profiles.map(renderAdminStudentCard).join("")
    : `<div class="review-card"><p>No student profiles yet.</p></div>`;
}

function renderAdminStudentCard(profile) {
  const latest = profile.tests[0];
  const latestScore = latest ? `${latest.score}%` : "No test yet";
  const progress = latest ? latest.placement : "Diagnostic needed";
  const weakAreas = latest?.missedTopics?.length ? latest.missedTopics.slice(0, 3).join(", ") : "No major weaknesses detected";
  const activity = activityLabel(profile);
  const avatarHtml = avatarDisplay(profile.avatar, 52);
  const visible = profile.leaderboardVisible !== false;
  const avatarOptions = MATH_AVATARS.map(
    (emoji) => `<button class="avatar-option" type="button" data-set-avatar="${profile.id}" data-emoji="${escapeHtml(emoji)}">${emoji}</button>`
  ).join("") + `<label class="avatar-upload-label" title="Upload a photo">📷 Upload<input type="file" accept="image/*" data-upload-avatar="${profile.id}" /></label>`;
  return `
    <article class="review-card">
      <div class="admin-card-top">
        <button class="admin-avatar-bubble" type="button" data-pick-avatar="${profile.id}" title="Change avatar">${avatarHtml}</button>
        <div>
          <h4 style="margin:0">${escapeHtml(profile.name)} • Grade ${escapeHtml(profile.grade)}</h4>
          <p style="margin:4px 0 0;font-size:0.82rem;color:var(--muted)">${escapeHtml(activity.status)} • ${escapeHtml(activity.when)}</p>
        </div>
      </div>
      <div class="avatar-picker" id="avatar-picker-${profile.id}">${avatarOptions}</div>
      <p><strong>Latest score:</strong> ${escapeHtml(latestScore)}</p>
      <p><strong>Placement:</strong> ${escapeHtml(progress)}</p>
      <p><strong>Practice completed:</strong> ${profile.practice.length} question${profile.practice.length === 1 ? "" : "s"}</p>
      <p><strong>Worksheets:</strong> ${profile.worksheets.length}</p>
      <p><strong>Focus:</strong> ${escapeHtml(weakAreas)}</p>
      <div class="actions wrap">
        <button class="secondary small-button" type="button" data-admin-open="${profile.id}">Open Dashboard</button>
        <button class="secondary small-button" type="button" data-export-profile="${profile.id}">Export Results</button>
        <button class="ghost small-button leaderboard-toggle" type="button" data-toggle-leaderboard="${profile.id}">${visible ? "Hide from Highlights" : "Show in Highlights"}</button>
        <button class="ghost small-button" type="button" data-reset-worksheets="${profile.id}">Reset Worksheet History</button>
        ${latest ? `<button class="ghost small-button" type="button" data-remove-latest-test="${profile.id}">Remove Latest Test</button>` : ""}
      </div>
    </article>
  `;
}

function refreshProfileSelect() {
  const profiles = getProfiles();
  elements.profileSelect.innerHTML = `<option value="">Create or choose profile</option>${profiles
    .map((profile) => `<option value="${profile.id}">${escapeHtml(profile.name)} • Grade ${escapeHtml(profile.grade)}</option>`)
    .join("")}`;
}

function renderDashboard() {
  if (!activeProfile) return;
  if (!openedFromAdmin) activeProfile = touchProfile(activeProfile.id, "Viewing dashboard") ?? activeProfile;
  const latest = activeProfile.tests[0];
  elements.dashboardStudent.textContent = `${activeProfile.name}, Grade ${activeProfile.grade}`;
  elements.dashboardAvatar.innerHTML = avatarDisplay(activeProfile.avatar, 72);
  elements.dashboardScore.textContent = latest ? `${latest.score}%` : "--";
  elements.dashboardPlacement.textContent = latest?.placement ?? "No test yet";
  elements.dashboardNextTest.textContent = latest?.nextRecommendedTest ?? "Take first diagnostic";
  elements.dashboardCourse.textContent = latest?.courseRecommendation ?? "Diagnostic needed";
  elements.dashboardNextAction.textContent = nextBestAction(activeProfile);
  elements.dashboardTestCount.textContent = activeProfile.tests.length;
  elements.dashboardPracticeCount.textContent = activeProfile.practice.length;
  elements.dashboardWorksheetCount.textContent = activeProfile.worksheets.length;
  elements.dashboardPractice.disabled = !latest;
  elements.learningPath.innerHTML = (activeProfile.learningPath.length ? activeProfile.learningPath : seedLearningPath()).map(renderPathItem).join("");
  elements.scoreHistory.innerHTML = activeProfile.tests.length
    ? activeProfile.tests.slice(0, 8).map((test) => renderProgressRow(new Date(test.date).toLocaleDateString(), test.score, `${test.type ?? "Placement Test"} • ${test.placement}`)).join("")
    : `<div class="review-card"><p>No tests yet. Start a diagnostic to build history.</p></div>`;
  elements.topicProgressDashboard.innerHTML = renderTopicProgress(activeProfile);
  elements.teacherReport.innerHTML = renderTeacherReport(activeProfile);
  elements.worksheetHistory.innerHTML = renderWorksheetHistory(activeProfile);
  elements.finalExamRecords.innerHTML = renderFinalExamHistory(activeProfile);
}

function renderPathItem(item) {
  return `
    <div class="path-item">
      <span class="path-rank">${item.priority}</span>
      <div>
        <strong>${escapeHtml(item.skill)}</strong>
        <div class="bar"><span style="width:${Math.min(100, item.currentAccuracy)}%"></span></div>
        <small>${item.currentAccuracy}% now • target ${item.targetAccuracy}% • ${item.recommendedPracticeCount} questions • ${escapeHtml(item.nextMilestone)}</small>
      </div>
      <strong>${escapeHtml(item.difficulty)}</strong>
    </div>
  `;
}

function renderProgressRow(label, percent, detail = "") {
  return `
    <div class="topic-row">
      <div><strong>${escapeHtml(label)}</strong><br /><span>${escapeHtml(detail)}</span><div class="bar"><span style="width:${Math.min(100, percent)}%"></span></div></div>
      <strong>${percent}%</strong>
    </div>
  `;
}

function renderTopicProgress(profile) {
  const entries = Object.entries(profile.topicProgress ?? {}).slice(0, 10);
  if (!entries.length) return `<div class="review-card"><p>Topic progress appears after the first test.</p></div>`;
  return entries.map(([topic, rows]) => {
    const current = rows.at(-1)?.percent ?? 0;
    const trend = rows.map((row) => `${row.percent}%`).join(" → ");
    return renderProgressRow(topic, current, `${masteryLevel(current)} • ${trend}`);
  }).join("");
}

function renderTeacherReport(profile) {
  const latest = profile.tests[0];
  if (!latest) return `<p>No history yet. The report will populate after the first diagnostic.</p>`;
  const sortedTopics = [...(latest.topicResults ?? [])].sort((a, b) => b.percent - a.percent);
  const strongest = sortedTopics.slice(0, 3).map((row) => row.topic).join(", ") || "Not enough data yet";
  const stillNeeds = sortedTopics.filter((row) => row.percent < 80).slice(-3).map((row) => row.topic).join(", ") || "No major weaknesses detected";
  const improving = Object.entries(profile.topicProgress ?? {})
    .filter(([, rows]) => rows.length > 1 && rows.at(-1).percent > rows[0].percent)
    .map(([topic]) => topic)
    .slice(0, 3)
    .join(", ") || "Improvement trend will appear after more tests";
  return `
    <p><strong>Current placement:</strong> ${escapeHtml(latest.placement)}</p>
    <p><strong>Recommended next steps:</strong> ${escapeHtml(latest.courseRecommendation)}</p>
    <p><strong>Progress trend:</strong> ${profile.tests.slice(0, 5).reverse().map((test) => `${test.score}%`).join(" → ")}</p>
    <p><strong>Strongest skills:</strong> ${escapeHtml(strongest)}</p>
    <p><strong>Skills improving:</strong> ${escapeHtml(improving)}</p>
    <p><strong>Skills still needing practice:</strong> ${escapeHtml(stillNeeds)}</p>
    <p><strong>Current practice focus:</strong> ${escapeHtml(profile.learningPath[0]?.skill ?? "SAT Math Reasoning")}</p>
  `;
}

function worksheetGrade(score) {
  if (score >= 90) return { letter: "A", color: "#16a34a", message: "Excellent! Ready to move forward." };
  if (score >= 80) return { letter: "B", color: "#2563eb", message: "Strong work. Keep building on this." };
  if (score >= 70) return { letter: "C", color: "#d97706", message: "Good effort. Review the missed questions." };
  if (score >= 60) return { letter: "D", color: "#ea580c", message: "Keep practicing. Try a shorter set soon." };
  return { letter: "F", color: "#dc2626", message: "More review needed. Focus on weak areas first." };
}

function renderWorksheetHistory(profile) {
  if (!profile.worksheets.length) return `<div class="review-card"><p>No worksheets yet.</p></div>`;
  return profile.worksheets.slice(0, 8).map((worksheet) => {
    const grade = worksheet.completed ? worksheetGrade(worksheet.score) : null;
    return `
      <div class="review-card">
        <h4>${new Date(worksheet.date).toLocaleDateString()} • ${escapeHtml(worksheet.difficulty)}</h4>
        <p>${worksheet.questionCount} questions • ${escapeHtml(worksheet.topics.slice(0, 4).join(", "))}</p>
        ${grade ? `
          <div style="display:flex;align-items:center;gap:12px;margin:10px 0 6px">
            <span style="font-size:2rem;font-weight:800;line-height:1;color:${grade.color}">${grade.letter}</span>
            <div>
              <strong style="color:${grade.color};font-size:1rem">${worksheet.score}%</strong>
              <div style="font-size:0.84rem;color:var(--muted);margin-top:2px">${grade.message}</div>
            </div>
          </div>
        ` : `<p style="color:var(--muted);font-size:0.88rem;margin:6px 0">Not scored yet — enter your score below</p>`}
        <div class="worksheet-score">
          <input type="number" min="0" max="100" placeholder="${worksheet.completed ? "Update score" : "Score %"}" data-worksheet-score="${worksheet.id}" />
          <button class="secondary small-button" type="button" data-score-worksheet="${worksheet.id}">Save Score</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderFinalExamHistory(profile) {
  const exams = profile.finalExams ?? [];
  if (!exams.length) {
    return `<div class="review-card"><p>No final exam taken yet. Click <strong>Take Final Exam</strong> below to begin.</p></div>`;
  }
  const gradeColors = { A: "#16a34a", B: "#2563eb", C: "#d97706", D: "#ea580c", F: "#dc2626" };
  return exams.slice(0, 5).map((exam) => {
    const gc = gradeColors[exam.letterGrade] ?? "#374151";
    return `
      <div class="review-card">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">
          <span style="font-size:2.2rem;font-weight:800;line-height:1;color:${gc}">${exam.letterGrade}</span>
          <div>
            <strong style="font-size:1rem">${escapeHtml(exam.title)}</strong>
            <div style="font-size:0.84rem;color:var(--muted);margin-top:2px">${new Date(exam.completedAt).toLocaleDateString()} • ${exam.pointsEarned}/${exam.totalPoints} pts • ${exam.percent}%</div>
            ${!exam.graded ? `<div style="font-size:0.8rem;color:#d97706;margin-top:2px">Grading incomplete — some questions pending parent review</div>` : ""}
          </div>
        </div>
        <div class="actions wrap" style="margin:0">
          <button class="secondary small-button" type="button" data-view-exam="${escapeHtml(exam.id)}">View &amp; Grade</button>
          <button class="secondary small-button" type="button" data-export-exam="${escapeHtml(exam.id)}">Export PDF</button>
        </div>
      </div>
    `;
  }).join("");
}

function showDiagnosticQuestion(question) {
  elements.questionMeta.textContent = `Question ${session.currentIndex + 1} of ${session.totalQuestions}`;
  elements.questionTopic.textContent = question.topic;
  elements.questionText.textContent = questionTextOnly(question);
  elements.questionFormat.textContent = answerFormatLine(question);
  elements.questionFormat.classList.toggle("hidden", !elements.questionFormat.textContent);
  elements.difficultyBadge.textContent = DIFFICULTY_LABELS[question.difficulty];
  elements.progressFill.style.width = `${(session.currentIndex / session.totalQuestions) * 100}%`;
  elements.answerHint.textContent = "";
  elements.answerHint.style.color = "var(--red)";
  elements.submitAnswer.classList.remove("hidden");
  elements.nextQuestion.classList.add("hidden");
  renderAnswerInput(elements.answerArea, question);
}

function showPracticeQuestion(question) {
  const nextNumber = practiceState.attempts.length + 1;
  elements.practiceMeta.textContent =
    nextNumber <= practiceState.goal ? `Practice ${nextNumber} of ${practiceState.goal}` : `Bonus Practice ${nextNumber - practiceState.goal}`;
  elements.practiceTitle.textContent = question.topic;
  elements.practiceQuestionText.textContent = questionTextOnly(question);
  elements.practiceQuestionFormat.textContent = answerFormatLine(question);
  elements.practiceQuestionFormat.classList.toggle("hidden", !elements.practiceQuestionFormat.textContent);
  elements.practiceDifficulty.textContent = DIFFICULTY_LABELS[question.difficulty];
  renderPracticeStatus();
  elements.practiceFeedback.classList.remove("show");
  elements.practiceFeedback.textContent = "";
  elements.submitPractice.classList.remove("hidden");
  elements.nextPractice.classList.add("hidden");
  elements.nextPractice.textContent = "Next Practice";
  renderAnswerInput(elements.practiceAnswerArea, question);
}

function renderPracticeStatus() {
  if (!practiceState) return;
  const answered = practiceState.attempts.length;
  const goal = practiceState.goal;
  const progress = Math.min(100, Math.round((answered / goal) * 100));
  const accuracy = answered ? Math.round((practiceState.sessionCorrect / answered) * 100) : 0;
  const mastered = Object.keys(practiceState.masteredTopics ?? {}).length;
  const message = answered >= goal
    ? `Session goal complete: ${practiceState.sessionCorrect}/${answered} correct. ${accuracy >= 80 ? "Strong work. A challenge round is ready." : "Good effort. A few more review questions can help."}`
    : `Goal: ${goal} focused questions. ${Math.max(0, goal - answered)} to go.`;
  elements.practiceStatus.innerHTML = `
    <div><strong>${escapeHtml(message)}</strong></div>
    <div class="bar"><span style="width:${progress}%"></span></div>
    <small>${accuracy}% this session • ${practiceState.overallStreak ?? 0} correct in a row • ${mastered} skill${mastered === 1 ? "" : "s"} mastered</small>
  `;
}

function practiceCoachMessage(attempt) {
  if (attempt.levelChange === "mastered") return `${attempt.topic} is looking mastered. Keep going for a challenge question.`;
  if (attempt.levelChange === "up") return `Level up. The next ${attempt.topic} question will get harder.`;
  if (attempt.levelChange === "down") return `We’ll slow this skill down and build it back up step by step.`;
  if (attempt.correct && attempt.overallStreak >= 3) return `${attempt.overallStreak} correct in a row. Nice momentum.`;
  if (attempt.correct) return `That one is correct. Keep building the streak.`;
  return `This is a useful miss. Review the explanation, then try the next one a little slower.`;
}

function renderAnswerInput(container, question) {
  container.innerHTML = "";
  if (question.visual) {
    const visual = document.createElement("div");
    visual.className = "math-visual";
    visual.innerHTML = question.visual;
    container.appendChild(visual);
  }

  if (question.visualChoices) {
    const visualGrid = document.createElement("div");
    visualGrid.className = "visual-choice-grid";
    visualGrid.innerHTML = question.visualChoices
      .map((visual, index) => `<div class="visual-choice"><strong>${escapeHtml(question.choices[index])}</strong>${visual}</div>`)
      .join("");
    container.appendChild(visualGrid);
  }

  if (question.interactiveGraph) {
    container.appendChild(createGraphWorkspace());
  }

  if (question.type === "multiple-choice") {
    question.choices.forEach((choice, index) => {
      const label = document.createElement("label");
      label.className = "choice";
      label.innerHTML = `
        <input type="radio" name="answer" value="${escapeHtml(choice)}" />
        <span>${String.fromCharCode(65 + index)}. ${escapeHtml(choice)}</span>
      `;
      container.appendChild(label);
    });
    return;
  }

  const label = document.createElement("label");
  const needsTextKeyboard = /fraction|improper|sqrt|root|exact|equivalent|percent|do not convert/i.test(question.answerFormat ?? "");
  const inputMode = needsTextKeyboard ? "text" : "decimal";
  label.innerHTML = `
    Answer
    <input inputmode="${inputMode}" autocomplete="off" name="answer" placeholder="Type your answer" />
  `;
  container.appendChild(label);
  const symbolPad = document.createElement("div");
  symbolPad.className = "symbol-pad";
  symbolPad.setAttribute("aria-label", "Math symbols");
  symbolPad.innerHTML = `
    <span>Math symbols</span>
    ${["/", "√", "^", "%", "-", "."].map((symbol) => `<button type="button" class="ghost small-button" data-insert-symbol="${escapeHtml(symbol)}">${escapeHtml(symbol)}</button>`).join("")}
  `;
  container.appendChild(symbolPad);
}

function createGraphWorkspace() {
  const wrap = document.createElement("div");
  wrap.className = "graph-workspace";
  wrap.innerHTML = `
    <div class="graph-toolbar">
      <span>Interactive graph workspace</span>
      <button type="button" class="ghost small-button" data-action="line">Draw line</button>
      <button type="button" class="ghost small-button" data-action="clear">Clear</button>
    </div>
    <svg viewBox="0 0 220 220" aria-label="Interactive coordinate plane">
      ${Array.from({ length: 11 }, (_, i) => {
        const p = 20 + i * 18;
        return `<line x1="${p}" y1="20" x2="${p}" y2="200"/><line x1="20" y1="${p}" x2="200" y2="${p}"/>`;
      }).join("")}
      <line class="axis" x1="110" y1="20" x2="110" y2="200"/>
      <line class="axis" x1="20" y1="110" x2="200" y2="110"/>
      <g class="student-layer"></g>
    </svg>
  `;
  const svgEl = wrap.querySelector("svg");
  const layer = wrap.querySelector(".student-layer");
  const points = [];
  svgEl.addEventListener("click", (event) => {
    const rect = svgEl.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 220;
    const y = ((event.clientY - rect.top) / rect.height) * 220;
    if (x < 20 || x > 200 || y < 20 || y > 200) return;
    points.push([x, y]);
    layer.insertAdjacentHTML("beforeend", `<circle cx="${x}" cy="${y}" r="5" class="student-point"/>`);
  });
  wrap.querySelector("[data-action='line']").addEventListener("click", () => {
    if (points.length < 2) return;
    const [a, b] = points.slice(-2);
    layer.insertAdjacentHTML("beforeend", `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="student-line"/>`);
  });
  wrap.querySelector("[data-action='clear']").addEventListener("click", () => {
    points.length = 0;
    layer.innerHTML = "";
  });
  return wrap;
}

function getAnswer(container, type) {
  if (type === "multiple-choice") {
    return container.querySelector("input:checked")?.value ?? "";
  }
  const textarea = container.querySelector("textarea[name='answer']");
  if (textarea) return textarea.value.trim();
  return container.querySelector("input[name='answer']")?.value.trim() ?? "";
}

function lockAnswerArea(container) {
  container.querySelectorAll("input, textarea").forEach((el) => {
    el.disabled = true;
  });
}

function renderResults() {
  elements.studentSummary.textContent = `${session.student.name}, Grade ${session.student.grade} • Completed ${new Date(
    session.completedAt,
  ).toLocaleDateString()}${session.miniTest ? " • Daily Mini Test" : ""}`;
  elements.overallScore.textContent = `${results.overallPercent}%`;
  elements.placementLevel.textContent = results.placement;
  elements.currentReadiness.textContent = results.currentReadiness;
  elements.difficultyReached.textContent = results.difficultyReached;
  elements.practiceFocus.textContent = results.reviewTopics[0] ?? "No assigned practice";
  elements.coursePlacement.textContent = results.courseRecommendation;
  elements.satPerformance.textContent = `${results.satPerformance.percent}%`;
  elements.testDifficultyFit.textContent = results.testDifficultyFit;
  elements.nextTestLevel.textContent = results.nextRecommendedTest;
  elements.readinessNarrative.textContent = `${results.currentReadiness}: ${results.courseRecommendation}. Test difficulty fit: ${results.testDifficultyFit}. ${results.masteredLevel ? "You have mastered this level. This test was below the student’s level." : results.higherLevelRecommended ? "A higher-level test is recommended." : "This test provided usable placement information."} This recommendation is based on the overall score, grade-level topic accuracy, graphing performance, SAT-style reasoning, and the difficulty level reached during the adaptive test.`;
  elements.strongestSkills.innerHTML = renderList(results.strongestSkills.length ? results.strongestSkills : ["No clear strength yet"]);
  elements.weakestSkills.innerHTML = renderList(results.weakestSkills.length ? results.weakestSkills : ["No major weaknesses detected."]);
  elements.nextSteps.innerHTML = renderList(results.nextSteps);
  elements.dailyPlan.innerHTML = renderDailyPlan(results.dailyPlan);
  elements.graphingPerformance.textContent = `Graphing: ${results.graphingPerformance.percent}% (${results.graphingPerformance.correct}/${results.graphingPerformance.total})`;
  elements.reasoningPerformance.textContent = `SAT-style reasoning: ${results.satPerformance.percent}% (${results.satPerformance.correct}/${results.satPerformance.total})`;

  elements.topicResults.innerHTML = results.topicResults
    .map(
      (row) => `
        <div class="topic-row">
          <div>
            <strong>${escapeHtml(row.topic)}</strong><br />
            <span>${row.correct}/${row.total} correct • ${row.difficulty}</span>
          </div>
          <strong>${row.percent}%</strong>
        </div>
      `,
    )
    .join("");

  elements.improvementList.innerHTML = renderList(results.reviewTopics.length ? results.reviewTopics : ["No major weaknesses detected."]);
  elements.practiceWeakAreas.disabled = results.reviewTopics.length === 0;
  elements.practiceWeakAreas.textContent = results.reviewTopics.length ? "Practice Weak Areas" : "No Weak-Area Practice Needed";
  elements.startNextLevel.classList.toggle("hidden", !results.masteredLevel && !results.higherLevelRecommended);
  elements.startChallengeMode.classList.toggle("hidden", !results.challengeUnlocked);

  elements.missedReview.innerHTML = results.missed.length
    ? results.missed.map(renderMissedQuestion).join("")
    : `<div class="review-card"><h4>No missed questions</h4><p>The student answered every question correctly.</p></div>`;
}

function renderList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderDailyPlan(plan = []) {
  if (!plan.length) return `<div class="review-card"><p>No daily plan yet.</p></div>`;
  return plan.map((day) => `
    <div class="path-item">
      <span class="path-rank">${escapeHtml(day.day)}</span>
      <div>
        <strong>Day ${escapeHtml(day.day)}</strong>
        <small>${escapeHtml(day.tasks.join(" • "))}</small>
      </div>
      <strong>${results?.masteredLevel ? "Advance" : "Practice"}</strong>
    </div>
  `).join("");
}

function questionTextOnly(question) {
  return String(question.prompt ?? "")
    .replace(/\s*Answer format:.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function answerFormatLine(question) {
  if (question.type !== "fill-blank") return "";
  return String(question.answerFormat ?? "")
    .replace(/^\s*Answer format:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function masteryLevel(percent) {
  if (percent >= 95) return "Mastered";
  if (percent >= 80) return "Strong";
  if (percent > 0) return "Learning";
  return "Not Started";
}

function nextBestAction(profile) {
  const latest = profile.tests[0];
  if (!latest) return "Take first diagnostic";
  if (latest.masteredLevel || latest.score === 100) return `Advance to next level: ${latest.nextRecommendedTest ?? "higher-level test"}`;
  if (latest.missedTopics?.length) return `Focus on ${latest.missedTopics[0]} before advancing`;
  if (latest.score >= 95) return "Try a challenge test or SAT-style practice";
  return profile.learningPath[0]?.skill ?? "Continue adaptive practice";
}

function studentCorrectMessage() {
  return chooseMessage(correctCheers);
}

function studentMissMessage() {
  const normalized = activeProfile?.name?.trim().toLowerCase() ?? "";
  if (playfulBoys.has(normalized)) return chooseMessage(playfulMisses);
  return "Not quite yet. Review the answer, then try to win the next one.";
}

function chooseMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

function renderMissedQuestion(item, index) {
  return `
    <article class="review-card">
      <h4>${index + 1}. ${escapeHtml(item.topic)} • ${DIFFICULTY_LABELS[item.difficulty]}</h4>
      <p><strong>Question:</strong> ${escapeHtml(item.prompt)}</p>
      <p><span class="answer-mark wrong">Student answer: ${escapeHtml(item.studentAnswer)}</span></p>
      <p><span class="answer-mark right">Correct answer: ${escapeHtml(item.answer)}</span></p>
      ${item.answerFormat ? `<p><strong>Expected format:</strong> ${escapeHtml(item.answerFormat.replace("Answer format: ", ""))}</p>` : ""}
      <p><strong>Equivalent answers:</strong> ${item.allowEquivalent === false ? "A specific format was required for this question." : "Mathematically equivalent answers were accepted when they matched the stated format and rounding rule."}</p>
      <p><strong>Step-by-step:</strong> ${escapeHtml(item.explanation)}</p>
      <p><strong>How to enter this next time:</strong> Follow the format line in the question first, then round only if the prompt gives a rounding rule.</p>
      <p><strong>Remember this:</strong> ${escapeHtml(item.tip)}</p>
    </article>
  `;
}

document.addEventListener("click", (event) => {
  const symbolButton = event.target.closest("[data-insert-symbol]");
  if (symbolButton) {
    const area = symbolButton.closest(".answer-area");
    const input = area?.querySelector("input[name='answer']");
    if (!input) return;
    insertIntoInput(input, symbolButton.dataset.insertSymbol ?? "");
    return;
  }

  const backAdmin = event.target.closest("[data-back-admin]");
  if (backAdmin) {
    backToAdmin();
    return;
  }

  const exitButton = event.target.closest("[data-exit-profile]");
  if (exitButton) {
    exitProfile();
    return;
  }

  const pickAvatar = event.target.closest("[data-pick-avatar]");
  if (pickAvatar) {
    const picker = document.getElementById(`avatar-picker-${pickAvatar.dataset.pickAvatar}`);
    if (picker) picker.classList.toggle("show");
    return;
  }

  const setAvatar = event.target.closest("[data-set-avatar]");
  if (setAvatar) {
    const updated = updateProfile(setAvatar.dataset.setAvatar, (p) => { p.avatar = setAvatar.dataset.emoji; return p; });
    queueProfileSync(updated);
    renderAdminDashboard();
    renderLeaderboard();
    return;
  }

  const toggleLeaderboard = event.target.closest("[data-toggle-leaderboard]");
  if (toggleLeaderboard) {
    const updated = updateProfile(toggleLeaderboard.dataset.toggleLeaderboard, (p) => {
      p.leaderboardVisible = p.leaderboardVisible === false ? true : false;
      return p;
    });
    queueProfileSync(updated);
    renderAdminDashboard();
    renderLeaderboard();
    return;
  }

  const openProfile = event.target.closest("[data-admin-open]");
  if (openProfile) {
    activeProfile = getProfile(openProfile.dataset.adminOpen);
    if (!activeProfile) return;
    openedFromAdmin = true;
    elements.studentName.value = activeProfile.name;
    elements.gradeLevel.value = activeProfile.grade;
    renderDashboard();
    showScreen("dashboard");
    return;
  }

  const exportProfile = event.target.closest("[data-export-profile]");
  if (exportProfile) {
    const profile = getProfile(exportProfile.dataset.exportProfile);
    if (!profile) return;
    downloadJson(exportProfilesData([profile.id]), `${slugify(profile.name)}-math-placement-results.json`);
    elements.adminTransferMessage.textContent = `Exported ${profile.name}'s results.`;
    return;
  }

  const removeLatestTestBtn = event.target.closest("[data-remove-latest-test]");
  if (removeLatestTestBtn) {
    const profile = getProfile(removeLatestTestBtn.dataset.removeLatestTest);
    if (!profile || !profile.tests.length) return;
    const latest = profile.tests[0];
    const dateStr = new Date(latest.date).toLocaleDateString();
    if (!confirm(`Remove ${profile.name}'s latest test (${dateStr}, ${latest.score}%)? This cannot be undone.`)) return;
    const updated = removeLatestTest(profile.id);
    if (activeProfile?.id === updated?.id) activeProfile = updated;
    queueProfileSync(updated);
    renderAdminDashboard();
    if (activeProfile) renderDashboard();
    return;
  }

  const resetWorksheets = event.target.closest("[data-reset-worksheets]");
  if (resetWorksheets) {
    const profile = getProfile(resetWorksheets.dataset.resetWorksheets);
    if (!profile) return;
    if (!confirm(`Reset worksheet history for ${profile.name}? This deletes saved worksheet records for this local profile.`)) return;
    const updated = resetWorksheetHistory(profile.id);
    if (activeProfile?.id === updated?.id) activeProfile = updated;
    queueProfileSync(updated);
    renderAdminDashboard();
    if (activeProfile) renderDashboard();
    return;
  }

  const viewExam = event.target.closest("[data-view-exam]");
  if (viewExam && activeProfile) {
    const examId = viewExam.dataset.viewExam;
    const record = (activeProfile.finalExams ?? []).find((e) => e.id === examId);
    if (!record) return;
    // Rebuild state from saved record so the grading screen works
    finalExamState = createFinalExamState(activeProfile);
    finalExamState.answers = structuredClone(record.answers);
    finalExamState.completedAt = record.completedAt;
    finalExamState.startedAt = record.startedAt;
    finalExamState.phase = "grading";
    finalExamState.currentIndex = finalExamState.allQuestions.length - 1;
    renderFinalExamResults();
    showScreen("finalExamResults");
    return;
  }

  const exportExamBtn = event.target.closest("[data-export-exam]");
  if (exportExamBtn && activeProfile) {
    const examId = exportExamBtn.dataset.exportExam;
    const record = (activeProfile.finalExams ?? []).find((e) => e.id === examId);
    if (!record) return;
    const exportState = createFinalExamState(activeProfile);
    exportState.answers = structuredClone(record.answers);
    exportState.completedAt = record.completedAt;
    exportState.startedAt = record.startedAt;
    exportFinalExamPdf(activeProfile, exportState, record).catch((err) => {
      console.error("Final exam PDF failed:", err);
      alert("Could not generate the PDF. Try again or use a different browser.");
    });
    return;
  }

  const button = event.target.closest("[data-score-worksheet]");
  if (!button || !activeProfile) return;
  const id = button.dataset.scoreWorksheet;
  const input = document.querySelector(`[data-worksheet-score="${CSS.escape(id)}"]`);
  if (!input?.value) return;
  activeProfile = scoreWorksheet(activeProfile.id, id, input.value);
  queueProfileSync(activeProfile);
  renderDashboard();
});

function insertIntoInput(input, value) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  input.value = `${input.value.slice(0, start)}${value}${input.value.slice(end)}`;
  input.focus();
  const caret = start + value.length;
  input.setSelectionRange(caret, caret);
}

function renderLeaderboard() {
  if (!elements.leaderboardSection || !elements.leaderboardGrid) return;
  const awards = computeLeaderboard(getProfiles());
  if (!awards.length) {
    elements.leaderboardSection.classList.add("hidden");
    return;
  }
  elements.leaderboardSection.classList.remove("hidden");
  elements.leaderboardGrid.innerHTML = awards.map((award) => {
    const styles = CATEGORY_STYLES[award.category] ?? CATEGORY_STYLES["Top Score"];
    const avatar = avatarDisplay(award.student.avatar, 56);
    return `
      <article class="highlight-card" style="--card-accent: ${styles.accent}">
        <div class="highlight-avatar">${avatar}</div>
        <p class="highlight-category">${escapeHtml(award.category)}</p>
        <p class="highlight-name">${escapeHtml(award.student.name)}</p>
        <span class="highlight-badge" style="background:${styles.badge};color:${styles.badgeText}">
          ${award.badgeEmoji} ${escapeHtml(award.badge)}
        </span>
        <p class="highlight-achievement">${escapeHtml(award.achievement)}</p>
      </article>
    `;
  }).join("");
}

function renderSupabaseStatus(message = "") {
  const config = getSupabaseConfig();
  if (!elements.supabaseStatus) return;
  const base = config.enabled
    ? "Supabase sync is configured for https://tzssykhgfxpemfotxnkp.supabase.co."
    : "Supabase project: https://tzssykhgfxpemfotxnkp.supabase.co. Add the anon public key to enable cloud sync.";
  elements.supabaseStatus.textContent = message || base;
}

async function runSupabaseAction(workingMessage, action) {
  renderSupabaseStatus(workingMessage);
  try {
    const message = await action();
    renderSupabaseStatus(message);
  } catch (error) {
    renderSupabaseStatus(error instanceof Error ? error.message : "Supabase sync failed.");
  }
}

function queueProfileSync(profile) {
  if (!profile || !getSupabaseConfig().enabled) return;
  syncProfileToSupabase(profile).catch((error) => {
    console.warn("Supabase sync failed", error);
  });
}

function avatarDisplay(avatar, size) {
  if (avatar?.startsWith("data:")) {
    return `<img src="${avatar}" width="${size}" height="${size}" style="border-radius:999px;object-fit:cover;display:block" />`;
  }
  return avatar || "⭐";
}

function readAndResizeAvatar(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext("2d");
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, 100, 100);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function downloadJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function activityLabel(profile) {
  if (!profile.lastActiveAt) return { status: "Not active yet", when: "No activity recorded" };
  const last = new Date(profile.lastActiveAt);
  const minutes = Math.round((Date.now() - last.getTime()) / 60000);
  const status = minutes <= 10 ? "Active now" : profile.activityStatus || "Last used";
  if (minutes < 1) return { status, when: "just now" };
  if (minutes < 60) return { status, when: `${minutes} minute${minutes === 1 ? "" : "s"} ago` };
  if (minutes < 1440) {
    const hours = Math.round(minutes / 60);
    return { status, when: `${hours} hour${hours === 1 ? "" : "s"} ago` };
  }
  return { status, when: last.toLocaleDateString() };
}

function slugify(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function seedLearningPath() {
  return [
    {
      priority: 1,
      skill: "Take first diagnostic",
      currentAccuracy: 0,
      targetAccuracy: 80,
      recommendedPracticeCount: 0,
      difficulty: "Start",
      nextMilestone: "Complete diagnostic",
    },
  ];
}

function resultsFromProfileTest(test) {
  const reviewTopics = test.missedTopics.length ? test.missedTopics : (activeProfile?.learningPath ?? []).map((item) => item.skill);
  return {
    weakTopics: reviewTopics,
    reviewTopics,
    topicResults: test.topicResults,
    overallPercent: test.score,
    missed: [],
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
