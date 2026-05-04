import assert from "node:assert/strict";
import { calculateResults, createSession, nextDiagnosticQuestion, submitDiagnosticAnswer } from "../src/engine.js";
import { TOPICS, generateQuestion, parseStudentNumber } from "../src/questions.js";

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
