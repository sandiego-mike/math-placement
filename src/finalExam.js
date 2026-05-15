// Integrated Math 2 Semester 2 Final Exam
// California high school math standards, Grade 10

export const EXAM_META = {
  id: "im2-semester2-final",
  title: "Integrated Math 2 Semester 2 Final Exam",
  course: "Integrated Math 2",
  semester: "Semester 2",
  totalPoints: 100,
};

// 30 questions: 15 MC (×2 pts = 30), 10 Short Answer (×4 pts = 40), 5 Extended (×6 pts = 30)
export const EXAM_SECTIONS = [
  {
    id: "partI",
    title: "Part I: Multiple Choice",
    instructions: "Circle the letter of the best answer. Each question is worth 2 points.",
    pointsEach: 2,
    gradingMode: "auto",
    questions: [
      {
        id: "mc1",
        topic: "Quadratic Functions",
        text: "Which of the following is the vertex form of y = x² − 6x + 8?",
        type: "multiple-choice",
        choices: ["y = (x − 3)² − 1", "y = (x + 3)² − 1", "y = (x − 3)² + 1", "y = (x − 6)² + 8"],
        answer: "A",
        answerText: "y = (x − 3)² − 1",
        explanation: "Complete the square: x² − 6x + 8 = (x² − 6x + 9) − 9 + 8 = (x − 3)² − 1. The vertex is at (3, −1).",
      },
      {
        id: "mc2",
        topic: "Exponential Functions",
        text: "A savings account starts with $800 and earns 3% interest per year. Which equation models the balance A after t years?",
        type: "multiple-choice",
        choices: ["A = 800 + 0.03t", "A = 800(0.03)ᵗ", "A = 800(1.03)ᵗ", "A = 800(3)ᵗ"],
        answer: "C",
        answerText: "A = 800(1.03)ᵗ",
        explanation: "Exponential growth: A = P(1 + r)ᵗ where P = 800 and r = 0.03, so A = 800(1.03)ᵗ.",
      },
      {
        id: "mc3",
        topic: "Radicals",
        text: "Simplify: √48",
        type: "multiple-choice",
        choices: ["4√3", "6√2", "2√12", "8√3"],
        answer: "A",
        answerText: "4√3",
        explanation: "√48 = √(16 × 3) = √16 · √3 = 4√3. Factor out the largest perfect square.",
      },
      {
        id: "mc4",
        topic: "Rational Exponents",
        text: "Which expression is equivalent to x^(2/3)?",
        type: "multiple-choice",
        choices: ["∛(x²)", "x² ÷ 3", "√(x³)", "(1/3)x²"],
        answer: "A",
        answerText: "∛(x²)",
        explanation: "x^(m/n) = ⁿ√(xᵐ). So x^(2/3) = ³√(x²). The denominator is the radical index; the numerator is the exponent.",
      },
      {
        id: "mc5",
        topic: "Similarity",
        text: "Two similar triangles have a scale factor of 3:5. If the area of the smaller triangle is 27 cm², what is the area of the larger triangle?",
        type: "multiple-choice",
        choices: ["45 cm²", "81 cm²", "75 cm²", "135 cm²"],
        answer: "C",
        answerText: "75 cm²",
        explanation: "Areas scale by the square of the scale factor: (3/5)² = 9/25. Larger area = 27 × (25/9) = 75 cm².",
      },
      {
        id: "mc6",
        topic: "Right Triangle Trigonometry",
        text: "In a right triangle, sin(θ) = 5/13. What is cos(θ)?",
        type: "multiple-choice",
        choices: ["5/12", "12/13", "13/12", "5/13"],
        answer: "B",
        answerText: "12/13",
        explanation: "With opposite = 5 and hypotenuse = 13: adjacent = √(169 − 25) = √144 = 12. So cos(θ) = adjacent/hypotenuse = 12/13.",
      },
      {
        id: "mc7",
        topic: "Circles",
        text: "What is the equation of a circle with center (2, −3) and radius 5?",
        type: "multiple-choice",
        choices: ["(x + 2)² + (y − 3)² = 25", "(x − 2)² + (y + 3)² = 25", "(x − 2)² + (y + 3)² = 5", "(x + 2)² + (y − 3)² = 5"],
        answer: "B",
        answerText: "(x − 2)² + (y + 3)² = 25",
        explanation: "Standard form: (x − h)² + (y − k)² = r². Center (2, −3): (x − 2)² + (y − (−3))² = 5² → (x − 2)² + (y + 3)² = 25.",
      },
      {
        id: "mc8",
        topic: "Probability",
        text: "A bag has 4 red and 6 blue marbles. Two marbles are drawn without replacement. What is P(red, then blue)?",
        type: "multiple-choice",
        choices: ["4/15", "6/25", "24/100", "2/15"],
        answer: "A",
        answerText: "4/15",
        explanation: "P(red) = 4/10. After removing one red, P(blue) = 6/9. So P = (4/10) × (6/9) = 24/90 = 4/15.",
      },
      {
        id: "mc9",
        topic: "Function Transformations",
        text: "The graph of y = f(x) is shifted left 3 units and then reflected over the x-axis. The new equation is:",
        type: "multiple-choice",
        choices: ["y = −f(x − 3)", "y = −f(x + 3)", "y = f(−x + 3)", "y = f(−x − 3)"],
        answer: "B",
        answerText: "y = −f(x + 3)",
        explanation: "Shift left 3: replace x with (x + 3) → y = f(x + 3). Reflect over x-axis: negate output → y = −f(x + 3).",
      },
      {
        id: "mc10",
        topic: "Quadratic Equations",
        text: "For x² − 4x + 5 = 0, the discriminant (b² − 4ac) equals −4. This means the equation has:",
        type: "multiple-choice",
        choices: ["Two real solutions", "One real solution", "No real solutions", "Infinitely many solutions"],
        answer: "C",
        answerText: "No real solutions",
        explanation: "b² − 4ac = 16 − 20 = −4 < 0. A negative discriminant means no real solutions; the roots are complex numbers.",
      },
      {
        id: "mc11",
        topic: "Exponential Decay",
        text: "A car worth $24,000 loses 15% of its value each year. Which equation models its value V after t years?",
        type: "multiple-choice",
        choices: ["V = 24000(0.85)ᵗ", "V = 24000(0.15)ᵗ", "V = 24000 − 15t", "V = 24000(1.15)ᵗ"],
        answer: "A",
        answerText: "V = 24000(0.85)ᵗ",
        explanation: "Losing 15% per year means retaining 85%: V = 24000(1 − 0.15)ᵗ = 24000(0.85)ᵗ.",
      },
      {
        id: "mc12",
        topic: "Systems of Equations",
        text: "Which ordered pair is a solution to the system y = 2x and y = x²?",
        type: "multiple-choice",
        choices: ["(1, 2)", "(2, 4)", "(3, 9)", "(0, 1)"],
        answer: "B",
        answerText: "(2, 4)",
        explanation: "Set 2x = x² → x² − 2x = 0 → x(x − 2) = 0 → x = 0 or x = 2. At x = 2: y = 4. Check: 2(2) = 4 ✓ and 2² = 4 ✓.",
      },
      {
        id: "mc13",
        topic: "Circles — Arc Length",
        text: "A circle has radius 6. What is the arc length of a 120° arc? (Leave answer in terms of π.)",
        type: "multiple-choice",
        choices: ["2π", "4π", "6π", "8π"],
        answer: "B",
        answerText: "4π",
        explanation: "Arc length = (central angle/360°) × 2πr = (120/360) × 2π(6) = (1/3) × 12π = 4π.",
      },
      {
        id: "mc14",
        topic: "Conditional Probability",
        text: "Of 30 students, 18 play sports. Of those who play sports, 12 also play an instrument. What is the probability that a randomly chosen sports player also plays an instrument?",
        type: "multiple-choice",
        choices: ["2/5", "2/3", "12/30", "6/30"],
        answer: "B",
        answerText: "2/3",
        explanation: "P(instrument | sports) = (students who do both) ÷ (students who play sports) = 12/18 = 2/3.",
      },
      {
        id: "mc15",
        topic: "Rational Exponents",
        text: "Evaluate: 16^(3/4)",
        type: "multiple-choice",
        choices: ["4", "8", "12", "32"],
        answer: "B",
        answerText: "8",
        explanation: "16^(3/4) = (16^(1/4))³ = (⁴√16)³ = 2³ = 8. First take the 4th root, then cube the result.",
      },
    ],
  },
  {
    id: "partII",
    title: "Part II: Short Answer",
    instructions: "Show all work. Each question is worth 4 points.",
    pointsEach: 4,
    gradingMode: "parent",
    questions: [
      {
        id: "sa1",
        topic: "Quadratic Functions",
        text: "Find the x-intercepts of y = 3x² − 12x by factoring. Show your work.",
        type: "short-answer",
        answer: "x = 0 and x = 4",
        explanation: "Factor: y = 3x(x − 4). Set each factor to zero: 3x = 0 → x = 0; x − 4 = 0 → x = 4.",
      },
      {
        id: "sa2",
        topic: "Quadratic Formula",
        text: "Use the quadratic formula to solve 2x² − 5x − 3 = 0. Show all steps.",
        type: "short-answer",
        answer: "x = 3 and x = −1/2",
        explanation: "a = 2, b = −5, c = −3. x = (5 ± √(25 + 24))/4 = (5 ± √49)/4 = (5 ± 7)/4. So x = 12/4 = 3 or x = −2/4 = −1/2.",
      },
      {
        id: "sa3",
        topic: "Exponential Functions",
        text: "A city had a population of 50,000 in 2010 and grows at 2.5% per year. Write an equation P(t) for the population t years after 2010, then find the population in 2020.",
        type: "short-answer",
        answer: "P(t) = 50000(1.025)ᵗ; P(10) ≈ 64,004",
        explanation: "P(t) = 50000(1.025)ᵗ. At t = 10: P = 50000(1.025)¹⁰ ≈ 50000(1.2801) ≈ 64,004.",
      },
      {
        id: "sa4",
        topic: "Rational Exponents",
        text: "Simplify: (32)^(3/5). Show your reasoning.",
        type: "short-answer",
        answer: "8",
        explanation: "32 = 2⁵, so (2⁵)^(3/5) = 2^(5 × 3/5) = 2³ = 8. Alternatively: ⁵√32 = 2, then 2³ = 8.",
      },
      {
        id: "sa5",
        topic: "Similarity",
        text: "Triangle ABC is similar to triangle DEF with a scale factor of 3:7. If AB = 9 cm, find DE.",
        type: "short-answer",
        answer: "DE = 21 cm",
        explanation: "Set up the proportion: AB/DE = 3/7. So 9/DE = 3/7 → DE = 9 × 7/3 = 63/3 = 21 cm.",
      },
      {
        id: "sa6",
        topic: "Right Triangle Trigonometry",
        text: "In a right triangle, angle θ = 40° and the hypotenuse = 20 m. Find the length of the leg opposite angle θ. Round to the nearest tenth.",
        type: "short-answer",
        answer: "≈ 12.9 m",
        explanation: "sin(40°) = opposite/hypotenuse → opposite = 20 × sin(40°) ≈ 20 × 0.6428 ≈ 12.9 m.",
      },
      {
        id: "sa7",
        topic: "Circles",
        text: "The equation of a circle is (x − 3)² + (y + 1)² = 64. Identify the center and radius. Then find the circumference in terms of π.",
        type: "short-answer",
        answer: "Center (3, −1), radius = 8, circumference = 16π",
        explanation: "Center: (h, k) = (3, −1). Radius: r = √64 = 8. Circumference: C = 2πr = 2π(8) = 16π.",
      },
      {
        id: "sa8",
        topic: "Probability",
        text: "A jar has 5 red, 3 green, and 2 yellow candies. One is drawn and NOT replaced. A second is drawn. Find P(green then yellow). Express as a fraction.",
        type: "short-answer",
        answer: "1/15",
        explanation: "P(green) = 3/10. After removing one green, P(yellow) = 2/9. P = (3/10) × (2/9) = 6/90 = 1/15.",
      },
      {
        id: "sa9",
        topic: "Function Transformations",
        text: "Describe in words all the transformations applied to y = x² to obtain y = 2(x − 1)² + 3.",
        type: "short-answer",
        answer: "Vertical stretch by factor 2; shift right 1 unit; shift up 3 units",
        explanation: "The 2 outside stretches the graph vertically by factor 2. The (x − 1) shifts right 1. The + 3 shifts up 3.",
      },
      {
        id: "sa10",
        topic: "Systems of Equations",
        text: "Solve the system: 3x + 2y = 16 and x − y = 2. Show all work.",
        type: "short-answer",
        answer: "x = 4, y = 2",
        explanation: "From x − y = 2: x = y + 2. Substitute: 3(y + 2) + 2y = 16 → 3y + 6 + 2y = 16 → 5y = 10 → y = 2, x = 4. Check: 3(4) + 2(2) = 16 ✓",
      },
    ],
  },
  {
    id: "partIII",
    title: "Part III: Extended Response",
    instructions: "Show all work and explain your reasoning. Each question is worth 6 points.",
    pointsEach: 6,
    gradingMode: "parent",
    questions: [
      {
        id: "er1",
        topic: "Quadratic Modeling",
        text: "A ball is launched upward from a platform. Its height in feet is modeled by h(t) = −16t² + 48t + 6, where t is time in seconds.\n\n(a) Find the maximum height and the time it occurs. Show work.\n(b) When does the ball hit the ground? Round to the nearest hundredth of a second.\n(c) What is the height of the ball at t = 1 second?",
        type: "extended-response",
        answer: "(a) t = 1.5 s, max height = 42 ft\n(b) t ≈ 3.12 s\n(c) h(1) = 38 ft",
        explanation: "(a) t = −48/(2×−16) = 1.5 s; h(1.5) = −16(2.25) + 72 + 6 = 42 ft.\n(b) Use quadratic formula on −16t² + 48t + 6 = 0: t ≈ (−48 − √(2304 + 384))/(−32) ≈ 3.12 s.\n(c) h(1) = −16 + 48 + 6 = 38 ft.",
      },
      {
        id: "er2",
        topic: "Exponential — Compound Interest",
        text: "$3,000 is invested at 5% annual interest compounded annually.\n\n(a) Write the equation for the investment's value V after t years.\n(b) Find the value after 10 years. Round to the nearest dollar.\n(c) Approximately how many years will it take to double? Use logarithms or guess-and-check.",
        type: "extended-response",
        answer: "(a) V = 3000(1.05)ᵗ\n(b) V ≈ $4,887\n(c) ≈ 14.2 years",
        explanation: "(a) V = 3000(1.05)ᵗ.\n(b) V = 3000(1.05)¹⁰ ≈ 3000(1.6289) ≈ $4,887.\n(c) 3000(1.05)ᵗ = 6000 → (1.05)ᵗ = 2 → t = log(2)/log(1.05) ≈ 14.2 years.",
      },
      {
        id: "er3",
        topic: "Right Triangle Trigonometry — Applied",
        text: "From the top of a 60-foot cliff, the angle of depression to a boat in the water is 28°.\n\n(a) Sketch and label a diagram showing the cliff, boat, and angle.\n(b) Find the horizontal distance from the base of the cliff to the boat. Round to the nearest foot.\n(c) Find the straight-line distance from the top of the cliff to the boat. Round to the nearest foot.",
        type: "extended-response",
        answer: "(a) Diagram: right triangle with 60 ft vertical leg, 28° depression angle.\n(b) ≈ 113 ft\n(c) ≈ 128 ft",
        explanation: "(a) The angle of depression from the top equals the angle of elevation from the boat.\n(b) tan(28°) = 60/d → d = 60/tan(28°) ≈ 60/0.5317 ≈ 113 ft.\n(c) sin(28°) = 60/hyp → hyp = 60/0.4695 ≈ 128 ft.",
      },
      {
        id: "er4",
        topic: "Circles — Geometry",
        text: "A circle has equation x² + y² = 100.\n\n(a) State the center and radius. Find the circumference and area. Leave in terms of π.\n(b) A chord is drawn 6 units from the center. Find the length of the chord. Show work.\n(c) A central angle of 72° intercepts an arc. Find the arc length in terms of π.",
        type: "extended-response",
        answer: "(a) Center (0,0), r = 10, C = 20π, A = 100π\n(b) Chord = 16 units\n(c) Arc length = 4π",
        explanation: "(a) r = √100 = 10; C = 2π(10) = 20π; A = π(10²) = 100π.\n(b) Half-chord: √(10² − 6²) = √(100 − 36) = √64 = 8; Full chord = 2 × 8 = 16.\n(c) Arc = (72/360) × 2π(10) = (1/5) × 20π = 4π.",
      },
      {
        id: "er5",
        topic: "Systems — Word Problem",
        text: "A theater sells adult tickets for $10 and student tickets for $6. On Friday, 200 tickets were sold for a total of $1,560.\n\n(a) Define variables and write a system of two equations.\n(b) Solve the system using substitution or elimination. Show all steps.\n(c) Verify your solution satisfies both equations.",
        type: "extended-response",
        answer: "(a) a + s = 200; 10a + 6s = 1560\n(b) a = 90, s = 110\n(c) 90 + 110 = 200 ✓; 10(90) + 6(110) = 900 + 660 = 1560 ✓",
        explanation: "(a) Let a = adult tickets, s = student tickets.\n(b) From a = 200 − s: 10(200 − s) + 6s = 1560 → 2000 − 4s = 1560 → s = 110, a = 90.\n(c) Both equations verified.",
      },
    ],
  },
];

// Flat list of all questions in order
export function getAllExamQuestions() {
  return EXAM_SECTIONS.flatMap((section) =>
    section.questions.map((q) => ({ ...q, sectionId: section.id, sectionTitle: section.title, pointsEach: section.pointsEach }))
  );
}

export function createFinalExamState(profile) {
  const allQuestions = getAllExamQuestions();
  return {
    profileId: profile.id,
    studentName: profile.name,
    grade: profile.grade,
    examMeta: EXAM_META,
    allQuestions,
    currentIndex: 0,
    answers: [], // {questionId, studentAnswer, correct, pointsEarned, parentGraded}
    startedAt: new Date().toISOString(),
    completedAt: null,
    phase: "taking", // "taking" | "grading" | "done"
  };
}

export function getCurrentExamQuestion(state) {
  return state.allQuestions[state.currentIndex] ?? null;
}

export function submitExamAnswer(state, studentAnswer) {
  const question = state.allQuestions[state.currentIndex];
  if (!question) return null;

  let correct = false;
  let pointsEarned = 0;

  if (question.type === "multiple-choice") {
    correct = studentAnswer.trim().toUpperCase() === question.answer.toUpperCase();
    pointsEarned = correct ? question.pointsEach : 0;
  } else {
    // Short answer and extended response — marked as pending parent grading
    correct = null;
    pointsEarned = null;
  }

  const answerRecord = {
    questionId: question.id,
    studentAnswer,
    correct,
    pointsEarned,
    parentGraded: question.type === "multiple-choice",
    pointsEach: question.pointsEach,
  };

  state.answers.push(answerRecord);

  const isLast = state.currentIndex >= state.allQuestions.length - 1;
  if (isLast) {
    state.completedAt = new Date().toISOString();
    state.phase = "grading";
  } else {
    state.currentIndex += 1;
  }

  return { correct, isLast, answerRecord };
}

export function parentGradeQuestion(state, questionId, isCorrect) {
  const record = state.answers.find((a) => a.questionId === questionId);
  if (!record) return;
  record.correct = isCorrect;
  record.pointsEarned = isCorrect ? record.pointsEach : 0;
  record.parentGraded = true;

  const allGraded = state.answers.every((a) => a.parentGraded);
  if (allGraded) state.phase = "done";
}

export function parentSetPoints(state, questionId, points) {
  const record = state.answers.find((a) => a.questionId === questionId);
  if (!record) return;
  record.pointsEarned = Math.max(0, Math.min(record.pointsEach, Number(points) || 0));
  record.correct = record.pointsEarned > 0;
  record.parentGraded = true;

  const allGraded = state.answers.every((a) => a.parentGraded);
  if (allGraded) state.phase = "done";
}

export function calculateExamScore(state) {
  const gradedAnswers = state.answers.filter((a) => a.pointsEarned !== null);
  const pointsEarned = gradedAnswers.reduce((sum, a) => sum + (a.pointsEarned ?? 0), 0);
  const totalPoints = EXAM_META.totalPoints;
  const percent = Math.round((pointsEarned / totalPoints) * 100);
  const letterGrade = getLetterGrade(percent);
  const pendingCount = state.answers.filter((a) => !a.parentGraded).length;
  return { pointsEarned, totalPoints, percent, letterGrade, pendingCount };
}

export function getLetterGrade(percent) {
  if (percent >= 90) return "A";
  if (percent >= 80) return "B";
  if (percent >= 70) return "C";
  if (percent >= 60) return "D";
  return "F";
}

export function buildExamRecord(state) {
  const score = calculateExamScore(state);
  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    examId: EXAM_META.id,
    title: EXAM_META.title,
    course: EXAM_META.course,
    semester: EXAM_META.semester,
    studentName: state.studentName,
    grade: state.grade,
    startedAt: state.startedAt,
    completedAt: state.completedAt ?? new Date().toISOString(),
    savedAt: new Date().toISOString(),
    totalPoints: score.totalPoints,
    pointsEarned: score.pointsEarned,
    percent: score.percent,
    letterGrade: score.letterGrade,
    graded: state.answers.every((a) => a.parentGraded),
    answers: structuredClone(state.answers),
  };
}

export async function exportFinalExamPdf(profile, state, savedRecord = null) {
  const jspdf = window.jspdf;
  if (!jspdf?.jsPDF) {
    window.print();
    return;
  }

  const record = savedRecord ?? buildExamRecord(state);
  const score = { pointsEarned: record.pointsEarned, totalPoints: record.totalPoints, percent: record.percent, letterGrade: record.letterGrade };
  const allQuestions = getAllExamQuestions();
  const answerMap = new Map(record.answers.map((a) => [a.questionId, a]));

  const doc = new jspdf.jsPDF({ unit: "pt", format: "letter" });
  window.__examPdfDoc = doc;
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  const bottom = pageHeight - margin;
  let y = margin;

  const colors = {
    ink: [22, 30, 46],
    muted: [90, 104, 122],
    line: [214, 222, 232],
    blue: [37, 99, 235],
    green: [21, 128, 61],
    red: [185, 28, 28],
    soft: [248, 250, 252],
    gradeA: [21, 128, 61],
    gradeB: [29, 78, 216],
    gradeC: [161, 98, 7],
    gradeD: [194, 65, 12],
    gradeF: [185, 28, 28],
  };

  const gradeColor = {
    A: colors.gradeA, B: colors.gradeB, C: colors.gradeC, D: colors.gradeD, F: colors.gradeF,
  }[score.letterGrade] ?? colors.ink;

  const setText = (size, style = "normal", color = colors.ink) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const write = (text, startY, options = {}) => {
    const size = options.size ?? 11;
    const lh = size * 1.45;
    setText(size, options.bold ? "bold" : "normal", options.color ?? colors.ink);
    const lines = doc.splitTextToSize(String(text ?? ""), options.width ?? contentWidth);
    if (startY + lines.length * lh > bottom) {
      doc.addPage();
      y = margin;
      return write(text, y, options);
    }
    doc.text(lines, options.x ?? margin, startY);
    return startY + lines.length * lh + (options.after ?? 3);
  };

  const hRule = (startY) => {
    doc.setDrawColor(...colors.line);
    doc.line(margin, startY, pageWidth - margin, startY);
    return startY + 10;
  };

  // ── Cover header ──────────────────────────────────────────────────────────
  // School / course block
  setText(10, "normal", colors.muted);
  doc.text("HOMESCHOOL ACADEMIC RECORD", margin, y);
  y += 16;

  setText(20, "bold", colors.ink);
  doc.text(EXAM_META.title, margin, y);
  y += 26;

  setText(12, "normal", colors.muted);
  doc.text(`${EXAM_META.course}  •  ${EXAM_META.semester}`, margin, y);
  y += 20;
  y = hRule(y);

  // Student info
  setText(11, "normal", colors.ink);
  y = write(`Student: ${record.studentName}`, y, { bold: true, size: 11, after: 5 });
  y = write(`Grade Level: ${record.grade}`, y, { size: 11, after: 5 });
  y = write(`Date Completed: ${new Date(record.completedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`, y, { size: 11, after: 5 });
  y = write(`Exam: ${EXAM_META.title}`, y, { size: 11, after: 14 });

  // ── Grade box ─────────────────────────────────────────────────────────────
  const boxH = 88;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...gradeColor);
  doc.setLineWidth(2.5);
  doc.roundedRect(margin, y, contentWidth, boxH, 10, 10, "FD");
  doc.setLineWidth(1);

  // Letter grade (large)
  setText(52, "bold", gradeColor);
  doc.text(score.letterGrade, margin + 22, y + 60);

  // Score details
  const mid = margin + 90;
  setText(18, "bold", colors.ink);
  doc.text(`${score.pointsEarned} / ${score.totalPoints} points`, mid, y + 32);
  setText(13, "normal", colors.muted);
  doc.text(`${score.percent}%  —  ${gradeDescriptor(score.letterGrade)}`, mid, y + 50);

  const gradeNote = record.graded
    ? "Parent-verified final grade"
    : "Partially graded — some questions pending parent review";
  setText(10, "normal", colors.muted);
  doc.text(gradeNote, mid, y + 66);

  y += boxH + 22;
  y = hRule(y);

  // ── Section-by-section questions ─────────────────────────────────────────
  for (const section of EXAM_SECTIONS) {
    if (y + 28 > bottom) { doc.addPage(); y = margin; }
    setText(14, "bold", colors.blue);
    doc.text(section.title, margin, y);
    y += 6;
    setText(10, "normal", colors.muted);
    doc.text(section.instructions, margin, y + 10);
    y += 22;

    for (const question of section.questions) {
      const ansRecord = answerMap.get(question.id);
      const studentAnswer = ansRecord?.studentAnswer ?? "(no answer)";
      const correct = ansRecord?.correct;
      const ptsEarned = ansRecord?.pointsEarned ?? 0;
      const ptsMax = question.pointsEach;
      const isMultiLine = question.type !== "multiple-choice";
      const questionNum = allQuestions.findIndex((q) => q.id === question.id) + 1;

      // Estimate card height
      const qLines = doc.splitTextToSize(`${questionNum}. [${question.topic}] ${question.text}`, contentWidth - 32).length;
      const aLines = doc.splitTextToSize(`Student answer: ${studentAnswer}`, contentWidth - 32).length;
      const cLines = doc.splitTextToSize(`Correct answer: ${question.answer}`, contentWidth - 32).length;
      const cardH = Math.max(80, (qLines + aLines + cLines) * 15 + 44);

      if (y + cardH > bottom) { doc.addPage(); y = margin; }

      const cardTop = y;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...colors.line);
      doc.roundedRect(margin, cardTop, contentWidth, cardH, 6, 6, "FD");

      let cy = cardTop + 14;

      // Question header
      setText(9, "bold", colors.muted);
      doc.text(`Q${questionNum}  •  ${question.topic}  •  ${ptsEarned !== null ? ptsEarned : "—"}/${ptsMax} pts`, margin + 14, cy);

      // Correct/incorrect badge
      if (correct === true) {
        setText(9, "bold", colors.green);
        doc.text("✔ CORRECT", pageWidth - margin - 70, cy);
      } else if (correct === false) {
        setText(9, "bold", colors.red);
        doc.text("✘ INCORRECT", pageWidth - margin - 70, cy);
      } else {
        setText(9, "normal", colors.muted);
        doc.text("PENDING", pageWidth - margin - 70, cy);
      }

      cy += 16;
      cy = write(question.text, cy, { size: 11, bold: false, width: contentWidth - 28, x: margin + 14, after: 6 });
      cy = write(`Student answer: ${studentAnswer}`, cy, { size: 10.5, bold: true, width: contentWidth - 28, x: margin + 14, after: 4 });
      cy = write(`Correct answer: ${question.answer}`, cy, { size: 10.5, color: colors.green, width: contentWidth - 28, x: margin + 14, after: 4 });
      if (correct === false || correct === null) {
        cy = write(`Explanation: ${question.explanation}`, cy, { size: 9.5, color: colors.muted, width: contentWidth - 28, x: margin + 14, after: 4 });
      }

      y = Math.max(cardTop + cardH + 10, cy + 10);
    }
  }

  // ── Score summary page ────────────────────────────────────────────────────
  doc.addPage();
  y = margin;

  setText(16, "bold", colors.ink);
  doc.text("Exam Score Summary", margin, y);
  y += 22;
  y = hRule(y);

  setText(11, "bold");
  y = write(`Student: ${record.studentName}`, y, { bold: true, after: 5 });
  y = write(`Exam: ${EXAM_META.title}`, y, { after: 5 });
  y = write(`Course: ${EXAM_META.course}  •  ${EXAM_META.semester}`, y, { after: 5 });
  y = write(`Date Completed: ${new Date(record.completedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`, y, { after: 14 });

  // Score by section
  for (const section of EXAM_SECTIONS) {
    const sectionAnswers = section.questions.map((q) => answerMap.get(q.id)).filter(Boolean);
    const earned = sectionAnswers.reduce((s, a) => s + (a.pointsEarned ?? 0), 0);
    const possible = section.questions.length * section.pointsEach;
    y = write(`${section.title}: ${earned} / ${possible} pts`, y, { size: 11, after: 6 });
  }

  y += 8;
  y = hRule(y);

  setText(14, "bold", gradeColor);
  doc.text(`Final Grade: ${score.letterGrade}  |  ${score.percent}%  |  ${score.pointsEarned}/${score.totalPoints} pts`, margin, y + 18);
  y += 34;

  setText(9, "normal", colors.muted);
  const footLines = [
    `Exam completed: ${new Date(record.completedAt).toLocaleDateString()}`,
    `Record generated: ${new Date().toLocaleDateString()}`,
    "This document is intended for homeschool academic records.",
  ];
  footLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 14;
  });

  const fileName = `${profile.name.replace(/\s+/g, "-").toLowerCase()}-im2-sem2-final-exam.pdf`;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    showExamPdfToast(URL.createObjectURL(doc.output("blob")), fileName);
  } else {
    doc.save(fileName);
  }

  delete window.__examPdfDoc;
}

function gradeDescriptor(letter) {
  return { A: "Excellent", B: "Above Average", C: "Satisfactory", D: "Below Average", F: "Needs Improvement" }[letter] ?? "";
}

function showExamPdfToast(blobUrl, fileName) {
  document.getElementById("math-pdf-toast")?.remove();
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const hint = isIOS
    ? "Tap <strong>Open PDF</strong>, then tap the share icon <strong>↑</strong> and choose <strong>Save to Files</strong>."
    : "Tap <strong>Open PDF</strong> — your browser will download or open it.";
  const toast = document.createElement("div");
  toast.id = "math-pdf-toast";
  toast.style.cssText = [
    "position:fixed;bottom:0;left:0;right:0;z-index:9999",
    "background:#fff;border-top:3px solid #2563eb",
    "padding:16px 20px;box-shadow:0 -4px 24px rgba(0,0,0,.18)",
    "font-family:inherit;animation:pdf-slide-up .25s ease",
  ].join(";");
  toast.innerHTML = `
    <style>@keyframes pdf-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}</style>
    <div style="max-width:560px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <div>
          <strong style="font-size:1rem">Final Exam PDF ready</strong>
          <p style="margin:5px 0 0;font-size:.85rem;color:#5c6978;line-height:1.4">${hint}</p>
        </div>
        <button type="button" onclick="document.getElementById('math-pdf-toast').remove()"
          style="background:none;border:none;font-size:1.4rem;cursor:pointer;line-height:1;color:#5c6978;padding:0;flex-shrink:0">✕</button>
      </div>
      <a href="${blobUrl}" download="${fileName}" target="_blank" rel="noopener"
        style="display:inline-block;margin-top:12px;padding:11px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:.95rem">
        Open PDF
      </a>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => { URL.revokeObjectURL(blobUrl); toast.remove(); }, 90000);
}
