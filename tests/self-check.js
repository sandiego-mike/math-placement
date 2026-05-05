import assert from "node:assert/strict";
import { calculateResults, createPracticeState, createSession, nextDiagnosticQuestion, nextPracticeQuestion, submitDiagnosticAnswer } from "../src/engine.js";
import { TOPICS, generateQuestion, parseStudentNumber } from "../src/questions.js";
import { nextAnnualGrade } from "../src/storage.js";

const closeTo = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 0.001;

function checkGeneratedQuestion(question) {
  assert.ok(question.prompt, "question has a prompt");
  assert.ok(question.answer, "question has a display answer");
  assert.ok(question.explanation, "question has an explanation");
  assert.ok(question.tip, "question has a remember-this tip");
  assert.ok(question.validate(question.answer), `${question.topic} validates its computed answer`);
  assert.ok(
    question.explanation.includes(question.answer),
    `${question.topic} explanation includes the computed answer`,
  );
  if (/Graph|Geometry|Triangle|Pythagorean|Trigonometry|Volume|Scatter|Data|Transformations|Circle|Rectangle|Parabola/i.test(question.topic)) {
    assert.ok(question.visual || question.visualChoices, `${question.topic} includes a required visual`);
  }

  for (const step of question.steps) {
    if (step.value !== undefined) {
      assert.ok(
        closeTo(Number(step.value), Number(step.expected)),
        `${question.topic} step math agrees with its expected computed value`,
      );
    }
  }

  if (question.type === "multiple-choice") {
    assert.equal(question.choices.length, 4, `${question.topic} has four choices`);
    assert.ok(question.choices.includes(question.answer), `${question.topic} includes the correct choice`);
    assert.equal(
      question.choices.filter((choice) => question.validate(choice)).length,
      1,
      `${question.topic} has exactly one correct multiple-choice answer`,
    );
    if (question.visualChoices) {
      assert.equal(question.visualChoices.length, question.choices.length, `${question.topic} has one visual per choice`);
    }
  }

  if (question.type === "fill-blank") {
    assert.match(question.answerFormat, /example/i, `${question.topic} gives a clear example input`);
    const equivalentDecimal = String(question.answerValue);
    const equivalentPercent = `${question.answerValue * 100}%`;
    const incorrect = String(question.answerValue + 1);

    assert.ok(question.validate(equivalentDecimal), `${question.topic} accepts decimal equivalent`);
    assert.ok(question.validate(` ${question.answer} `), `${question.topic} ignores extra spaces`);
    if (/percent/i.test(question.answerFormat) || question.answerFormat.includes("%")) {
      assert.ok(question.validate(equivalentPercent) || question.validate(equivalentDecimal), `${question.topic} handles the stated percent/decimal format`);
    } else {
      assert.equal(question.validate(equivalentPercent), false, `${question.topic} rejects percent format when percent is not allowed`);
    }
    assert.equal(question.validate(incorrect), false, `${question.topic} rejects an incorrect fill-in answer`);
  }
}

function templateKey(question) {
  const visualFingerprint = question.visual || question.visualChoices ? `|visual:${hashString(String(question.visual ?? question.visualChoices?.join("") ?? ""))}` : "";
  return `${question.topic}|${String(question.prompt)
    .replace(/Answer format:.*/gi, "")
    .replace(/-?\d+(?:\.\d+)?\s*\/\s*-?\d+(?:\.\d+)?/g, "#/#")
    .replace(/-?\d+(?:\.\d+)?%?/g, "#")
    .replace(/\b[A-D]\b/g, "L")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()}${visualFingerprint}`;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return hash.toString(36);
}

function svgTextContent(svg) {
  return [...String(svg).matchAll(/<text[^>]*>(.*?)<\/text>/g)].map((match) => match[1].trim());
}

let totalMultipleChoice = 0;
let totalFillBlank = 0;

for (const topic of TOPICS) {
  for (let difficulty = 0; difficulty < 3; difficulty += 1) {
    for (let sample = 0; sample < 80; sample += 1) {
      const question = generateQuestion(topic, difficulty);
      checkGeneratedQuestion(question);
      totalMultipleChoice += question.type === "multiple-choice" ? 1 : 0;
      totalFillBlank += question.type === "fill-blank" ? 1 : 0;
    }
  }
}

assert.ok(totalMultipleChoice > 0, "the engine generates multiple-choice questions");
assert.ok(totalFillBlank > 0, "the engine generates fill-in questions");

assert.equal(parseStudentNumber("1/2"), 0.5, "fraction parsing works");
assert.equal(parseStudentNumber("0.5"), 0.5, "decimal parsing works");
assert.equal(parseStudentNumber("50%"), 0.5, "percent parsing works");
assert.equal(nextAnnualGrade("5"), "6", "annual rollover moves grade 5 to grade 6");
assert.equal(nextAnnualGrade("11"), "12", "annual rollover moves grade 11 to grade 12");
assert.equal(nextAnnualGrade("12"), "College", "annual rollover moves grade 12 to college");
assert.equal(nextAnnualGrade("Adult learner"), "Adult learner", "annual rollover leaves adult learners unchanged");

for (const grade of ["8", "10", "11"]) {
  const session = createSession({ name: "Probe Test", grade });
  const firstTopics = [];
  for (let index = 0; index < 3; index += 1) {
    const question = nextDiagnosticQuestion(session);
    firstTopics.push(question.topic);
    submitDiagnosticAnswer(session, question.answer);
  }
  assert.equal(firstTopics.includes("Arithmetic"), false, `grade ${grade} does not start with arithmetic`);
}

const grade5 = createSession({ name: "Halle", grade: "5" });
const grade5Topics = [];
for (let index = 0; index < 12; index += 1) {
  const question = nextDiagnosticQuestion(grade5);
  grade5Topics.push(question.topic);
  submitDiagnosticAnswer(grade5, question.answer);
}
assert.equal(grade5Topics.includes("Negative Numbers"), false, "grade 5 test does not use negative numbers as normal content");
assert.equal(grade5Topics.includes("Square Roots"), false, "grade 5 test does not use square roots as normal content");
assert.equal(grade5Topics.slice(0, 3).some((topic) => ["Fractions", "Decimals", "Word Problems"].includes(topic)), true, "grade 5 starts with grade-level probes");

const graphWord = generateQuestion("Graphing: Word Problem Graph", 1);
assert.equal(svgTextContent(graphWord.visual).includes(String(graphWord.answer)), false, "word-problem graph does not display the computed answer");
assert.equal(/a graph shows/i.test(graphWord.prompt), false, "graphing prompt points to the rendered graph without using text-only wording");

const linearRelationshipSamples = new Set();
for (let index = 0; index < 8; index += 1) {
  const linearQuestion = generateQuestion("Linear vs Nonlinear Relationships", 1);
  checkGeneratedQuestion(linearQuestion);
  assert.equal(/\+3 each step|doubles|squares|uneven changes/i.test(linearQuestion.visual), false, "linear relationship visual does not give away the reasoning");
  linearRelationshipSamples.add(linearQuestion.visual);
}
assert.ok(linearRelationshipSamples.size > 1, "linear relationship tables are randomized");

const duplicateGuard = createSession({ name: "Duplicate Guard", grade: "10" });
const diagnosticKeys = [];
for (let index = 0; index < 12; index += 1) {
  const question = nextDiagnosticQuestion(duplicateGuard);
  diagnosticKeys.push(templateKey(question));
  submitDiagnosticAnswer(duplicateGuard, question.answer);
}
for (const key of new Set(diagnosticKeys)) {
  assert.ok(diagnosticKeys.filter((item) => item === key).length <= 2, "diagnostic avoids overusing the same question template");
}

const practice = createPracticeState({
  reviewTopics: ["Linear vs Nonlinear Relationships"],
  topicResults: [{ topic: "Linear vs Nonlinear Relationships", percent: 60 }],
}, { goal: 6 });
const practiceKeys = [];
for (let index = 0; index < 4; index += 1) {
  const question = nextPracticeQuestion(practice);
  practiceKeys.push(templateKey(question));
  practice.attempts.push({ ...question, correct: true });
}
assert.equal(new Set(practiceKeys).size, practiceKeys.length, "practice avoids immediate repeated templates");

const perfect = createSession({ name: "Perfect Student", grade: "10" });
while (!perfect.completedAt) {
  const question = nextDiagnosticQuestion(perfect);
  submitDiagnosticAnswer(perfect, question.answer);
}
const perfectResults = calculateResults(perfect);
assert.equal(perfectResults.overallPercent, 100, "perfect simulation scores 100%");
assert.equal(perfectResults.masteredLevel, true, "100% marks the level mastered");
assert.deepEqual(perfectResults.weakestSkills, [], "100% does not create weak areas");
assert.deepEqual(perfectResults.reviewTopics, [], "100% does not create remediation practice");
assert.equal(perfectResults.challengeUnlocked, true, "100% unlocks challenge mode");

console.log("Self-check passed: generated questions, explanations, choices, and fill-in validation are consistent.");
