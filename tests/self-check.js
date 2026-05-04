import assert from "node:assert/strict";
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

console.log("Self-check passed: generated questions, explanations, choices, and fill-in validation are consistent.");
