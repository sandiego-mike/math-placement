export const PREREQUISITE_TOPICS = [
  "Arithmetic",
  "Fractions",
  "Decimals",
  "Percents",
  "Negative Numbers",
  "Ratios and Proportions",
  "Basic Algebra",
  "Solving Equations",
  "Exponents",
  "Square Roots",
  "Word Problems",
  "Geometry Basics",
  "Graphing Basics",
];

export const GRADE10_TOPICS = [
  "Graphing: Match Equation",
  "Graphing: Slope From Points",
  "Graphing: Y-Intercept",
  "Graphing: Word Problem Graph",
  "Linear vs Nonlinear Relationships",
  "Linear Equations and Inequalities",
  "Systems of Equations",
  "Linear Functions and Graphing",
  "Function Notation",
  "Exponents and Radicals",
  "Polynomials",
  "Factoring",
  "Quadratics",
  "Solving Quadratic Equations",
  "Graphing Parabolas",
  "Quadratic Transformations",
  "Discriminant",
  "Completing the Square",
  "Quadratic Formula",
  "Rational Expressions",
  "Radical Expressions",
  "Similar Triangles",
  "Pythagorean Theorem",
  "Trigonometry Basics",
  "Algebra and Quadratic Word Problems",
  "SAT Math Reasoning",
  "Data Interpretation",
];

export const GRADE8_TOPICS = [
  "Graphing: Match Equation",
  "Graphing: Slope From Points",
  "Graphing: Y-Intercept",
  "Graphing: Word Problem Graph",
  "Linear vs Nonlinear Relationships",
  "Linear Equations and Inequalities",
  "Systems of Equations",
  "Linear Functions and Graphing",
  "Function Notation",
  "Exponents and Radicals",
  "Scientific Notation",
  "Square and Cube Roots",
  "Pythagorean Theorem",
  "Irrational Numbers",
  "Transformations",
  "Volume of 3D Shapes",
  "Scatter Plots and Best Fit",
  "Algebra 1 Readiness Word Problems",
  "Factoring",
  "Solving Quadratic Equations",
  "Graphing Parabolas",
  "SAT Math Reasoning",
  "Data Interpretation",
];

export const GRADE11_TOPICS = [
  ...GRADE10_TOPICS,
  "Discriminant",
  "Quadratic Transformations",
  "Quadratic Formula",
  "Rational Expressions",
  "Radical Expressions",
  "SAT Math Reasoning",
  "Data Interpretation",
];

export const TOPICS = [...new Set([...PREREQUISITE_TOPICS, ...GRADE8_TOPICS, ...GRADE10_TOPICS, ...GRADE11_TOPICS])];

export const TOPIC_GROUPS = {
  prerequisite: PREREQUISITE_TOPICS,
  grade8: GRADE8_TOPICS,
  grade10: GRADE10_TOPICS,
  grade11: GRADE11_TOPICS,
  quadraticsFunctions: [
    "Function Notation",
    "Quadratics",
    "Factoring",
    "Solving Quadratic Equations",
    "Graphing Parabolas",
    "Quadratic Transformations",
    "Discriminant",
    "Completing the Square",
    "Quadratic Formula",
    "Algebra and Quadratic Word Problems",
  ],
  grade11Advanced: [
    "Function Notation",
    "Quadratics",
    "Factoring",
    "Solving Quadratic Equations",
    "Graphing Parabolas",
    "Quadratic Transformations",
    "Discriminant",
    "Completing the Square",
    "Quadratic Formula",
    "Rational Expressions",
    "Radical Expressions",
    "SAT Math Reasoning",
    "Data Interpretation",
  ],
  graphing: [
    "Graphing Basics",
    "Linear Functions and Graphing",
    "Graphing Parabolas",
    "Data Interpretation",
    "Scatter Plots and Best Fit",
    "Linear vs Nonlinear Relationships",
    "Graphing: Match Equation",
    "Graphing: Slope From Points",
    "Graphing: Y-Intercept",
    "Graphing: Word Problem Graph",
  ],
  sat: ["SAT Math Reasoning", "Data Interpretation"],
};

export const DIFFICULTY_LABELS = ["Easy", "Medium", "Hard"];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choose = (items) => items[rand(0, items.length - 1)];
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

const simplify = (num, den) => {
  const sign = den < 0 ? -1 : 1;
  const g = gcd(num, den);
  return { num: (num / g) * sign, den: Math.abs(den / g) };
};

const fractionText = (fraction) =>
  fraction.den === 1 ? String(fraction.num) : `${fraction.num}/${fraction.den}`;

const decimalPlaces = (value) => {
  const text = String(value);
  return text.includes(".") ? text.split(".")[1].length : 0;
};

const closeTo = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 0.001;
const percentInput = (raw) => String(raw).trim().replace(/\s+/g, "").endsWith("%");

export const parseStudentNumber = (raw) => {
  const text = String(raw).trim().replace(/\s+/g, "");
  if (text.endsWith("%")) {
    const percent = Number(text.slice(0, -1));
    return Number.isFinite(percent) ? percent / 100 : Number.NaN;
  }
  if (/^-?\d+\s*\/\s*-?\d+$/.test(text)) {
    const [num, den] = text.split("/").map((part) => Number(part.trim()));
    return den === 0 ? Number.NaN : num / den;
  }
  return Number(text);
};

export const numericValidator = (answerValue, options = {}) => (student) => {
  if (percentInput(student) && !options.allowPercent) return false;
  return closeTo(parseStudentNumber(student), answerValue);
};

export const roundedValidator = (answerValue, decimals, options = {}) => {
  const rounded = Number(answerValue.toFixed(decimals));
  const tolerance = decimals === 0 ? 0.5 : 0.5 * 10 ** -decimals;
  return (student) => {
    if (percentInput(student) && !options.allowPercent) return false;
    const parsed = parseStudentNumber(student);
    return Number.isFinite(parsed) && Math.abs(parsed - rounded) < tolerance;
  };
};

const defaultAnswerFormat = (answerValue) =>
  Number.isInteger(answerValue)
    ? "Answer format: Enter an integer or an equivalent fraction/decimal (example: 6). Do not enter a percent unless the question asks for percent."
    : "Answer format: Enter an exact number. Equivalent fractions or decimals are accepted (example: 1/2 or 0.5). Do not enter a percent unless the question asks for percent.";

const decimalFormat = (decimals) => `Answer format: Enter as a decimal rounded to the nearest ${["whole number", "tenth", "hundredth", "thousandth"][decimals] ?? `${decimals} decimal places`} (example: ${decimals === 0 ? "2" : `2.${"0".repeat(Math.max(0, decimals - 1))}3`}).`;
const fractionFormat = "Answer format: Enter your answer as a fraction (example: 7/3). Leave your answer as an improper fraction if needed. Equivalent decimals are accepted only when the prompt says so.";

const explanationFromSteps = (steps) => steps.map((step) => step.text).join(" ");

const validateStepMath = (steps) =>
  steps.every((step) => step.value === undefined || closeTo(Number(step.value), Number(step.expected)));

const makeChoices = (correct, validator, options = {}) => {
  const values = new Set([String(correct)]);
  const numeric = Number(options.answerValue ?? correct);
  const decimals = options.forceDecimal ? Math.max(1, options.decimals ?? decimalPlaces(correct)) : options.decimals ?? decimalPlaces(correct);

  let attempts = 0;
  while (values.size < 4 && attempts < 100) {
    attempts += 1;
    let distractor;
    if (Number.isFinite(numeric)) {
      const offset = choose([-12, -10, -6, -5, -3, -2, -1, 1, 2, 3, 5, 6, 10, 12]);
      distractor = options.forceDecimal ? (numeric + offset / 10).toFixed(decimals) : String(numeric + offset);
    } else {
      distractor = choose(options.fallback ?? []);
    }
    if (distractor !== String(correct) && !validator(distractor)) values.add(String(distractor));
  }

  return [...values].sort(() => Math.random() - 0.5);
};

const requiresVisual = (topic) =>
  /Graph|Geometry|Triangle|Pythagorean|Trigonometry|Volume|Scatter|Data|Transformations|Circle|Rectangle|Parabola/i.test(topic);
const isGraphingTopic = (topic) => /Graph|Slope|Intercept|Linear vs Nonlinear|Scatter|Data|Parabola/i.test(topic);

const svg = (body, width = 360, height = 220) =>
  `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Math visual" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const rectVisual = (l, w) =>
  svg(`<rect x="85" y="45" width="190" height="110" fill="#edf5ff" stroke="#2563eb" stroke-width="3"/><text x="180" y="178" text-anchor="middle" font-size="18">${l}</text><text x="65" y="105" text-anchor="middle" font-size="18">${w}</text>`);

const circleVisual = (r) =>
  svg(`<circle cx="180" cy="105" r="72" fill="#fff8e6" stroke="#a16207" stroke-width="3"/><line x1="180" y1="105" x2="252" y2="105" stroke="#a16207" stroke-width="3"/><text x="215" y="95" text-anchor="middle">r=${r}</text>`);

const compositeVisual = (l, w, extra) =>
  svg(`<rect x="70" y="65" width="150" height="95" fill="#edf5ff" stroke="#2563eb" stroke-width="3"/><rect x="220" y="105" width="70" height="55" fill="#e8f7ef" stroke="#168a63" stroke-width="3"/><text x="145" y="184" text-anchor="middle">${l}</text><text x="52" y="115">${w}</text><text x="256" y="184" text-anchor="middle">${extra}</text>`);

const triangleVisual = (a, b, c = "") =>
  svg(`<path d="M85 165 L265 165 L85 45 Z" fill="#e8f7ef" stroke="#168a63" stroke-width="3"/><path d="M85 145 L105 145 L105 165" fill="none" stroke="#168a63" stroke-width="2"/><text x="175" y="188" text-anchor="middle" font-size="17">${a}</text><text x="62" y="110" text-anchor="middle" font-size="17">${b}</text><text x="188" y="92" text-anchor="middle" font-size="17">${c}</text>`);

const axes = () => {
  let lines = "";
  for (let i = 0; i <= 10; i += 1) {
    const p = 20 + i * 18;
    lines += `<line x1="${p}" y1="20" x2="${p}" y2="200" stroke="#e5e7eb"/><line x1="20" y1="${p}" x2="200" y2="${p}" stroke="#e5e7eb"/>`;
  }
  return `${lines}<line x1="110" y1="20" x2="110" y2="200" stroke="#647181" stroke-width="2"/><line x1="20" y1="110" x2="200" y2="110" stroke="#647181" stroke-width="2"/>`;
};

const point = (x, y) => [110 + x * 18, 110 - y * 18];
const lineGraph = (m, b, label = "") => {
  const [x1, y1] = point(-5, m * -5 + b);
  const [x2, y2] = point(5, m * 5 + b);
  return svg(`${axes()}<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2563eb" stroke-width="4"/>`, 300, 220);
};

const parabolaGraph = (h, k, label = "") => {
  const left = 20;
  const top = 20;
  const size = 180;
  const xMin = h - 5;
  const xMax = h + 5;
  const yMin = Math.min(k - 2, 0);
  const yMax = Math.max(k + 10, 0);
  const toSvgPoint = (x, y) => [
    left + ((x - xMin) / (xMax - xMin)) * size,
    top + size - ((y - yMin) / (yMax - yMin)) * size,
  ];
  let grid = "";
  for (let i = 0; i <= 10; i += 1) {
    const x = left + i * (size / 10);
    const y = top + i * (size / 10);
    grid += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + size}" stroke="#e5e7eb"/><line x1="${left}" y1="${y}" x2="${left + size}" y2="${y}" stroke="#e5e7eb"/>`;
  }
  if (xMin <= 0 && xMax >= 0) {
    const [axisX] = toSvgPoint(0, yMin);
    grid += `<line x1="${axisX}" y1="${top}" x2="${axisX}" y2="${top + size}" stroke="#647181" stroke-width="2"/>`;
  }
  if (yMin <= 0 && yMax >= 0) {
    const [, axisY] = toSvgPoint(xMin, 0);
    grid += `<line x1="${left}" y1="${axisY}" x2="${left + size}" y2="${axisY}" stroke="#647181" stroke-width="2"/>`;
  }

  let path = "";
  const visibleHalfWidth = Math.sqrt(Math.max(1, yMax - k));
  const start = Math.max(xMin, h - visibleHalfWidth);
  const end = Math.min(xMax, h + visibleHalfWidth);
  const step = (end - start) / 48;
  for (let px = start; px <= end + step / 2; px += step) {
    const py = (px - h) ** 2 + k;
    const [sx, sy] = toSvgPoint(px, py);
    path += `${path ? " L" : "M"}${sx} ${sy}`;
  }
  const [vx, vy] = toSvgPoint(h, k);
  return svg(`${grid}<path d="${path}" fill="none" stroke="#a16207" stroke-width="4"/><circle cx="${vx}" cy="${vy}" r="5" fill="#c2413b"/>`, 300, 220);
};

const scatterVisual = (slope, start) => {
  const dots = [0, 1, 2, 3, 4].map((x) => {
    const y = start / 10 + slope * x / 4 + (x % 2 ? 0.5 : -0.3);
    const [sx, sy] = point(x - 2, y - 5);
    return `<circle cx="${sx}" cy="${sy}" r="5" fill="#2563eb"/>`;
  }).join("");
  return svg(`${axes()}${dots}<line x1="70" y1="160" x2="185" y2="60" stroke="#168a63" stroke-width="3" stroke-dasharray="6 4"/>`, 300, 220);
};

const barVisual = (start, end) =>
  svg(`<line x1="55" y1="180" x2="285" y2="180" stroke="#647181" stroke-width="2"/><rect x="90" y="${180 - start}" width="55" height="${start}" fill="#93c5fd"/><rect x="200" y="${180 - end}" width="55" height="${end}" fill="#86efac"/><text x="118" y="202" text-anchor="middle">Start</text><text x="228" y="202" text-anchor="middle">End</text><text x="118" y="${170 - start}" text-anchor="middle">${start}</text><text x="228" y="${170 - end}" text-anchor="middle">${end}</text>`);

const trendVisual = (start, end, xLabel = "weeks") =>
  svg(`<line x1="55" y1="180" x2="305" y2="180" stroke="#647181" stroke-width="2"/><line x1="55" y1="180" x2="55" y2="35" stroke="#647181" stroke-width="2"/><line x1="75" y1="150" x2="285" y2="65" stroke="#2563eb" stroke-width="4"/><circle cx="75" cy="150" r="5" fill="#2563eb"/><circle cx="285" cy="65" r="5" fill="#2563eb"/><text x="75" y="170" text-anchor="middle">${start}</text><text x="285" y="55" text-anchor="middle">${end}</text><text x="180" y="205" text-anchor="middle">${xLabel}</text>`);

const question = ({
  topic,
  difficulty,
  type = Math.random() > 0.45 ? "multiple-choice" : "fill-blank",
  prompt,
  answer,
  answerValue = parseStudentNumber(answer),
  steps = [],
  tip,
  choices,
  validator,
  choiceOptions,
  answerFormat,
  visual,
  visualChoices,
  allowEquivalent = true,
}) => {
  const displayAnswer = String(answer);
  const validate = validator ?? numericValidator(answerValue);
  const builtChoices =
    type === "multiple-choice"
      ? choices ?? makeChoices(displayAnswer, validate, { ...choiceOptions, answerValue })
      : [];
  const format = answerFormat ?? (type === "fill-blank" ? defaultAnswerFormat(answerValue) : "");
  const displayPrompt = type === "fill-blank" && !prompt.includes("Answer format:")
    ? `${prompt} ${format}`
    : prompt;
  const interactiveGraph = isGraphingTopic(topic) && !visualChoices;

  return validateGeneratedQuestion({
    id: `${topic}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    topic,
    difficulty,
    type,
    prompt: displayPrompt,
    answer: displayAnswer,
    answerValue,
    choices: builtChoices,
    visual,
    visualChoices,
    interactiveGraph,
    answerFormat: format,
    allowEquivalent,
    steps,
    explanation: explanationFromSteps(steps),
    tip,
    validate,
  });
};

function validateGeneratedQuestion(candidate) {
  if (!candidate.prompt || !candidate.answer || !candidate.tip || !candidate.explanation) return null;
  if (!candidate.validate(candidate.answer)) return null;
  if (candidate.type === "fill-blank" && !candidate.answerFormat) return null;
  if (!validateStepMath(candidate.steps)) return null;
  if (!candidate.explanation.includes(candidate.answer)) return null;
  if (requiresVisual(candidate.topic) && !candidate.visual && !candidate.visualChoices) return null;
  if (isGraphingTopic(candidate.topic) && !candidate.visualChoices && !candidate.interactiveGraph) return null;

  if (candidate.type === "multiple-choice") {
    if (candidate.choices.length !== 4) return null;
    if (new Set(candidate.choices).size !== 4) return null;
    if (!candidate.choices.includes(candidate.answer)) return null;
    const correctChoices = candidate.choices.filter((choice) => candidate.validate(choice));
    if (correctChoices.length !== 1) return null;
    if (candidate.visualChoices && candidate.visualChoices.length !== candidate.choices.length) return null;
  }

  return candidate;
}

const generators = {
  Arithmetic(difficulty) {
    if (difficulty === 0) {
      const a = rand(8, 48);
      const b = rand(3, 29);
      const op = choose(["+", "-"]);
      const answer = op === "+" ? a + b : a - b;
      return question({
        topic: "Arithmetic",
        difficulty,
        prompt: `What is ${a} ${op} ${b}?`,
        answer,
        answerValue: answer,
        steps: [
          {
            text: `Line up the place values and ${op === "+" ? "add" : "subtract"} each column. ${a} ${op} ${b} = ${answer}.`,
            value: answer,
            expected: op === "+" ? a + b : a - b,
          },
        ],
        tip: "Keep digits in the same place value column lined up.",
      });
    }
    if (difficulty === 1) {
      const a = rand(6, 18);
      const b = rand(4, 16);
      const answer = a * b;
      return question({
        topic: "Arithmetic",
        difficulty,
        prompt: `What is ${a} × ${b}?`,
        answer,
        answerValue: answer,
        steps: [
          {
            text: `Multiplication means equal groups. ${a} groups of ${b} makes ${answer}.`,
            value: answer,
            expected: a * b,
          },
        ],
        tip: "Break hard multiplication into friendlier parts, like 12 × 8 = 10 × 8 plus 2 × 8.",
      });
    }
    const divisor = rand(6, 15);
    const answer = rand(8, 24);
    const dividend = divisor * answer;
    return question({
      topic: "Arithmetic",
      difficulty,
      prompt: `What is ${dividend} ÷ ${divisor}?`,
      answer,
      answerValue: answer,
      steps: [
        {
          text: `Division asks how many ${divisor}s fit into ${dividend}. Since ${divisor} × ${answer} = ${dividend}, the answer is ${answer}.`,
          value: divisor * answer,
          expected: dividend,
        },
      ],
      tip: "Check division by multiplying your answer by the divisor.",
    });
  },

  Fractions(difficulty) {
    if (difficulty === 0) {
      const den = rand(3, 12);
      const num = rand(1, den - 1);
      const add = rand(1, den - num);
      const result = simplify(num + add, den);
      return question({
        topic: "Fractions",
        difficulty,
        prompt: `What is ${num}/${den} + ${add}/${den}?`,
        answer: fractionText(result),
        answerValue: result.num / result.den,
        choices: makeFractionChoices(result),
        steps: [
          {
            text: `The denominators are the same, so add the top numbers: ${num} + ${add} = ${num + add}. Keep the denominator ${den}, then simplify to ${fractionText(result)} if possible.`,
            value: result.num / result.den,
            expected: (num + add) / den,
          },
        ],
        tip: "When denominators match, add or subtract only the numerators.",
      });
    }
    if (difficulty === 1) {
      const a = rand(1, 5);
      const b = rand(3, 9);
      const c = rand(1, 5);
      const d = rand(3, 9);
      const result = simplify(a * d + c * b, b * d);
      return question({
        topic: "Fractions",
        difficulty,
        prompt: `What is ${a}/${b} + ${c}/${d}?`,
        answer: fractionText(result),
        answerValue: result.num / result.den,
        choices: makeFractionChoices(result),
        steps: [
          {
            text: `Use a common denominator. ${a}/${b} becomes ${a * d}/${b * d}, and ${c}/${d} becomes ${c * b}/${d * b}. Add the top numbers and simplify to ${fractionText(result)}.`,
            value: result.num / result.den,
            expected: a / b + c / d,
          },
        ],
        tip: "Different denominators need a common denominator before adding.",
      });
    }
    const a = rand(1, 6);
    const b = rand(2, 9);
    const c = rand(1, 6);
    const d = rand(2, 9);
    const result = simplify(a * c, b * d);
    return question({
      topic: "Fractions",
      difficulty,
      prompt: `What is ${a}/${b} × ${c}/${d}?`,
      answer: fractionText(result),
      answerValue: result.num / result.den,
      choices: makeFractionChoices(result),
      steps: [
        {
          text: `Multiply straight across: ${a} × ${c} = ${a * c}, and ${b} × ${d} = ${b * d}. Then simplify the fraction to ${fractionText(result)}.`,
          value: result.num / result.den,
          expected: (a * c) / (b * d),
        },
      ],
      tip: "For fraction multiplication, multiply top by top and bottom by bottom.",
    });
  },

  Decimals(difficulty) {
    const places = difficulty === 0 ? 1 : 2;
    const a = Number((rand(12, 95) / 10 ** places).toFixed(places));
    const b = Number((rand(8, 86) / 10 ** places).toFixed(places));
    const op = difficulty === 2 ? "×" : choose(["+", "-"]);
    const answer = op === "×" ? Number((a * b).toFixed(2)) : Number((op === "+" ? a + b : a - b).toFixed(places));
    const roundingText = op === "×" ? "Round to the nearest hundredth." : "No rounding is needed; give the exact decimal answer.";
    return question({
      topic: "Decimals",
      difficulty,
      prompt: `What is ${a} ${op} ${b}? ${roundingText}`,
      answer,
      answerValue: answer,
      validator: op === "×" ? roundedValidator(a * b, 2) : undefined,
      answerFormat: op === "×" ? decimalFormat(2) : undefined,
      choiceOptions: { forceDecimal: true, decimals: decimalPlaces(answer) },
      steps: [
        {
          text:
            op === "×"
              ? `Multiply as whole numbers first, then place the decimal and round to the nearest hundredth. ${a} × ${b} = ${answer}.`
              : `Line up the decimal points, then ${op === "+" ? "add" : "subtract"}. ${a} ${op} ${b} = ${answer}.`,
          value: answer,
          expected: op === "×" ? Number((a * b).toFixed(2)) : Number((op === "+" ? a + b : a - b).toFixed(places)),
        },
      ],
      tip: "For adding or subtracting decimals, line up the decimal points first.",
    });
  },

  Percents(difficulty) {
    if (difficulty === 0) {
      const percent = choose([10, 20, 25, 50]);
      const whole = rand(4, 24) * 10;
      const answer = (percent / 100) * whole;
      return question({
        topic: "Percents",
        difficulty,
        prompt: `What is ${percent}% of ${whole}?`,
        answer,
        answerValue: answer,
        steps: [
          {
            text: `${percent}% means ${percent}/100. Multiply ${whole} by ${percent}/100 to get ${answer}.`,
            value: answer,
            expected: (percent / 100) * whole,
          },
        ],
        tip: "Percent means out of 100.",
      });
    }
    if (difficulty === 1) {
      const original = rand(20, 90);
      const percent = choose([15, 20, 25, 30, 40]);
      const answer = Number((original * (1 + percent / 100)).toFixed(2));
      return question({
        topic: "Percents",
        difficulty,
        prompt: `A price of $${original} increases by ${percent}%. What is the new price?`,
        answer,
        answerValue: answer,
        steps: [
          {
            text: `Find the increase first: ${percent}% of ${original} is ${Number((original * percent / 100).toFixed(2))}. Add that to ${original} for ${answer}.`,
            value: answer,
            expected: Number((original * (1 + percent / 100)).toFixed(2)),
          },
        ],
        tip: "For percent increase, add the percent amount to the original.",
      });
    }
    const whole = rand(4, 24) * 5;
    const percent = choose([20, 25, 30, 40, 50, 60, 75]);
    const part = Number((whole * (percent / 100)).toFixed(2));
    return question({
      topic: "Percents",
      difficulty,
      prompt: `${part} is ${percent}% of what number?`,
      answer: whole,
      answerValue: whole,
      steps: [
        {
          text: `Write it as ${part} = ${percent}% × whole. Divide ${part} by ${percent / 100} to get ${whole}.`,
          value: whole,
          expected: part / (percent / 100),
        },
      ],
      tip: "When you need the whole, divide the part by the percent written as a decimal.",
    });
  },

  "Negative Numbers"(difficulty) {
    const a = rand(-14, -2);
    const b = difficulty === 0 ? rand(1, 12) : rand(-10, 10) || 4;
    const op = difficulty === 2 ? "×" : choose(["+", "-"]);
    const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
    return question({
      topic: "Negative Numbers",
      difficulty,
      prompt: `What is ${a} ${op} ${b}?`,
      answer,
      answerValue: answer,
      steps: [
        {
          text:
            op === "×"
              ? `A negative times a ${b < 0 ? "negative" : "positive"} is ${b < 0 ? "positive" : "negative"}. ${a} × ${b} = ${answer}.`
              : `Think of moving on a number line. Starting at ${a}, ${op === "+" ? "add" : "subtract"} ${b} to land on ${answer}.`,
          value: answer,
          expected: op === "+" ? a + b : op === "-" ? a - b : a * b,
        },
      ],
      tip: "A number line can make negative number operations much easier to see.",
    });
  },

  "Ratios and Proportions"(difficulty) {
    if (difficulty < 2) {
      const a = rand(2, 8);
      const b = rand(3, 12);
      const scale = rand(2, difficulty === 0 ? 5 : 9);
      return question({
        topic: "Ratios and Proportions",
        difficulty,
        prompt: `A recipe uses ${a} cups of flour for ${b} cups of water. How many cups of flour are needed for ${b * scale} cups of water?`,
        answer: a * scale,
        answerValue: a * scale,
        steps: [
          {
            text: `The water was multiplied by ${scale}, so multiply the flour by the same number: ${a} × ${scale} = ${a * scale}.`,
            value: a * scale,
            expected: a * scale,
          },
        ],
        tip: "In a proportion, both parts grow by the same scale factor.",
      });
    }
    const x = rand(3, 14);
    const a = rand(2, 9);
    const b = rand(2, 9);
    const c = a * x;
    return question({
      topic: "Ratios and Proportions",
      difficulty,
      prompt: `Solve the proportion ${a}/${b} = ${c}/x.`,
      answer: b * x,
      answerValue: b * x,
      steps: [
        {
          text: `Cross multiply: ${a} × x = ${b} × ${c}. Since ${b} × ${c} = ${b * c}, divide by ${a} to get x = ${b * x}.`,
          value: b * x,
          expected: (b * c) / a,
        },
      ],
      tip: "Cross multiplication helps when one part of a proportion is missing.",
    });
  },

  "Basic Algebra"(difficulty) {
    const x = rand(2, 12);
    const coeff = difficulty === 0 ? 1 : rand(2, 8);
    const constant = rand(3, 18);
    const answer = coeff * x + constant;
    return question({
      topic: "Basic Algebra",
      difficulty,
      prompt: `If x = ${x}, what is ${coeff === 1 ? "" : `${coeff}`}x + ${constant}?`,
      answer,
      answerValue: answer,
      steps: [
        {
          text: `Replace x with ${x}. That gives ${coeff} × ${x} + ${constant} = ${coeff * x} + ${constant} = ${answer}.`,
          value: answer,
          expected: coeff * x + constant,
        },
      ],
      tip: "Substitution means replacing the variable with the number you are given.",
    });
  },

  "Solving Equations"(difficulty) {
    const x = rand(2, 18);
    const a = difficulty === 0 ? 1 : rand(2, 7);
    const b = rand(3, 25);
    const total = a * x + b;
    return question({
      topic: "Solving Equations",
      difficulty,
      prompt: `Solve for x: ${a === 1 ? "x" : `${a}x`} + ${b} = ${total}`,
      answer: x,
      answerValue: x,
      steps: [
        {
          text: `Undo the + ${b} first: ${total} - ${b} = ${total - b}. Then ${a === 1 ? `x = ${x}` : `divide by ${a}: ${total - b} ÷ ${a} = ${x}`}.`,
          value: x,
          expected: (total - b) / a,
        },
      ],
      tip: "Use inverse operations: undo addition or subtraction before undoing multiplication.",
    });
  },

  Exponents(difficulty) {
    const base = rand(2, difficulty === 2 ? 9 : 6);
    const power = difficulty === 0 ? 2 : rand(2, 4);
    const answer = base ** power;
    return question({
      topic: "Exponents",
      difficulty,
      prompt: `What is ${base}^${power}?`,
      answer,
      answerValue: answer,
      steps: [
        {
          text: `${base}^${power} means multiply ${base} by itself ${power} times. The result is ${answer}.`,
          value: answer,
          expected: base ** power,
        },
      ],
      tip: "An exponent tells how many times to use the base as a factor.",
    });
  },

  "Square Roots"(difficulty) {
    const root = rand(difficulty === 0 ? 2 : 5, difficulty === 2 ? 18 : 12);
    const square = root ** 2;
    return question({
      topic: "Square Roots",
      difficulty,
      prompt: `What is √${square}?`,
      answer: root,
      answerValue: root,
      steps: [
        {
          text: `The square root asks what number times itself makes ${square}. Since ${root} × ${root} = ${square}, √${square} = ${root}.`,
          value: root * root,
          expected: square,
        },
      ],
      tip: "Square roots undo squaring.",
    });
  },

  "Square and Cube Roots"(difficulty) {
    if (difficulty < 2 || Math.random() > 0.45) {
      const root = rand(3, 15);
      const square = root ** 2;
      return question({
        topic: "Square and Cube Roots",
        difficulty,
        prompt: `What is √${square}?`,
        answer: root,
        answerValue: root,
        steps: [{ text: `The square root asks what number times itself makes ${square}. Since ${root} × ${root} = ${square}, √${square} = ${root}.`, value: root * root, expected: square }],
        tip: "Square roots undo squaring.",
      });
    }
    const root = rand(2, 8);
    const cube = root ** 3;
    return question({
      topic: "Square and Cube Roots",
      difficulty,
      prompt: `What is ∛${cube}?`,
      answer: root,
      answerValue: root,
      steps: [{ text: `The cube root asks what number times itself three times makes ${cube}. Since ${root}^3 = ${cube}, ∛${cube} = ${root}.`, value: root ** 3, expected: cube }],
      tip: "Cube roots undo cubing.",
    });
  },

  "Word Problems"(difficulty) {
    const packs = rand(3, difficulty === 2 ? 14 : 8);
    const each = rand(4, difficulty === 2 ? 18 : 10);
    const used = rand(2, packs * each - 3);
    const answer = packs * each - used;
    return question({
      topic: "Word Problems",
      difficulty,
      prompt: `A student has ${packs} packs of pencils with ${each} pencils in each pack. After giving away ${used} pencils, how many pencils are left?`,
      answer,
      answerValue: answer,
      steps: [
        {
          text: `First find the total pencils: ${packs} × ${each} = ${packs * each}. Then subtract the pencils given away: ${packs * each} - ${used} = ${answer}.`,
          value: answer,
          expected: packs * each - used,
        },
      ],
      tip: "For word problems, decide which operation comes first before calculating.",
    });
  },

  "Geometry Basics"(difficulty) {
    if (difficulty === 0) {
      const l = rand(4, 16);
      const w = rand(3, 12);
      return question({
        topic: "Geometry Basics",
        difficulty,
        prompt: `What is the area of a rectangle that is ${l} units long and ${w} units wide?`,
        answer: l * w,
        answerValue: l * w,
        visual: rectVisual(l, w),
        steps: [
          {
            text: `Rectangle area is length × width. ${l} × ${w} = ${l * w} square units.`,
            value: l * w,
            expected: l * w,
          },
        ],
        tip: "Area measures the space inside a shape.",
      });
    }
    if (difficulty === 2 && Math.random() > 0.75) {
      const l = rand(8, 16);
      const w = rand(4, 10);
      const extra = rand(3, 8);
      const answer = l * w + extra * w;
      return question({
        topic: "Geometry Basics",
        difficulty,
        prompt: `What is the area of the composite figure made from two rectangles?`,
        answer,
        answerValue: answer,
        visual: compositeVisual(l, w, extra),
        steps: [{ text: `Find each rectangle area, then add: ${l} × ${w} + ${extra} × ${w} = ${answer}.`, value: answer, expected: l * w + extra * w }],
        tip: "For composite area, split the shape into simple pieces.",
      });
    }
    if (difficulty === 2 && Math.random() > 0.55) {
      const r = rand(2, 9);
      const answer = Number((3.14 * r * r).toFixed(1));
      return question({
        topic: "Geometry Basics",
        difficulty,
        prompt: `What is the area of the circle? Use 3.14 for π and round to the nearest tenth.`,
        answer,
        answerValue: answer,
        validator: roundedValidator(3.14 * r * r, 1),
        answerFormat: decimalFormat(1),
        visual: circleVisual(r),
        steps: [{ text: `Circle area is πr^2. Using 3.14 gives 3.14 × ${r}^2 = ${answer}.`, value: answer, expected: Number((3.14 * r * r).toFixed(1)) }],
        tip: "For circle area, square the radius before multiplying by π.",
      });
    }
    const base = rand(5, 18);
    const height = rand(4, 16);
    const answer = difficulty === 1 ? 2 * (base + height) : (base * height) / 2;
    return question({
      topic: "Geometry Basics",
      difficulty,
      prompt:
        difficulty === 1
          ? `What is the perimeter of a rectangle with side lengths ${base} and ${height}?`
          : `What is the area of a triangle with base ${base} and height ${height}?`,
      answer,
      answerValue: answer,
      visual: difficulty === 1 ? rectVisual(base, height) : triangleVisual(base, height),
      steps: [
        {
          text:
            difficulty === 1
              ? `Perimeter is the distance around the rectangle: ${base} + ${height} + ${base} + ${height} = ${answer}.`
              : `Triangle area is one half of base × height: (${base} × ${height}) ÷ 2 = ${answer}.`,
          value: answer,
          expected: difficulty === 1 ? 2 * (base + height) : (base * height) / 2,
        },
      ],
      tip: difficulty === 1 ? "Perimeter goes around the outside." : "A triangle is half of a matching rectangle.",
    });
  },

  "Graphing Basics"(difficulty) {
    if (difficulty === 0) {
      const x = rand(-5, 5);
      const y = rand(-5, 5);
      return question({
        topic: "Graphing Basics",
        difficulty,
        prompt: `In the point (${x}, ${y}), what is the x-coordinate?`,
        answer: x,
        answerValue: x,
        visual: svg(`${axes()}<circle cx="${point(x, y)[0]}" cy="${point(x, y)[1]}" r="6" fill="#c2413b"/><text x="${point(x, y)[0] + 8}" y="${point(x, y)[1] - 8}" font-size="15">(${x}, ${y})</text>`, 300, 220),
        steps: [
          {
            text: `An ordered pair is written as (x, y). The first number is the x-coordinate, so the answer is ${x}.`,
            value: x,
            expected: x,
          },
        ],
        tip: "Ordered pairs are always written x first, then y.",
      });
    }
    const m = rand(-4, 4) || 2;
    const b = rand(-6, 6);
    const x = rand(-3, 5);
    const answer = m * x + b;
    return question({
      topic: "Graphing Basics",
      difficulty,
      prompt: `For y = ${m}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b}, what is y when x = ${x}?`,
      answer,
      answerValue: answer,
      visual: lineGraph(m, b),
      steps: [
        {
          text: `Replace x with ${x}: y = ${m} × ${x} ${b < 0 ? "- " + Math.abs(b) : "+ " + b} = ${answer}.`,
          value: answer,
          expected: m * x + b,
        },
      ],
      tip: "To check a point on a line, substitute the x-value into the equation.",
    });
  },

  "Linear Equations and Inequalities"(difficulty) {
    if (difficulty < 2) {
      const x = rand(-6, 10);
      const a = rand(2, 8);
      const b = rand(-12, 12);
      const total = a * x + b;
      return question({
        topic: "Linear Equations and Inequalities",
        difficulty,
        prompt: `Solve for x: ${a}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b} = ${total}`,
        answer: x,
        answerValue: x,
        steps: [
          {
            text: `Undo the constant first: ${total} ${b < 0 ? "+ " + Math.abs(b) : "- " + b} = ${total - b}. Then divide by ${a}: ${total - b} ÷ ${a} = ${x}.`,
            value: x,
            expected: (total - b) / a,
          },
        ],
        tip: "For linear equations, isolate the variable by undoing operations in reverse order.",
      });
    }
    if (Math.random() > 0.5) {
      const m = rand(-4, 4) || 2;
      const b = rand(-6, 6);
      const answer = "dashed";
      return question({
        topic: "Linear Equations and Inequalities",
        difficulty,
        type: "multiple-choice",
        prompt: `When graphing y > ${m}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b}, should the boundary line be solid or dashed?`,
        answer,
        answerValue: 0,
        validator: (student) => String(student).trim().toLowerCase() === answer,
        choices: ["solid", "dashed", "vertical", "horizontal"].sort(() => Math.random() - 0.5),
        steps: [
          {
            text: `The inequality uses >, not ≥. A strict inequality does not include the boundary line, so the boundary is ${answer}.`,
          },
        ],
        tip: "Use a dashed boundary for < or >, and a solid boundary for ≤ or ≥.",
      });
    }
    const a = rand(2, 7);
    const boundary = rand(-4, 9);
    const b = rand(-10, 12);
    const total = a * boundary + b;
    const answer = boundary + 1;
    return question({
      topic: "Linear Equations and Inequalities",
      difficulty,
      prompt: `What is the smallest integer solution to ${a}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b} > ${total}?`,
      answer,
      answerValue: answer,
      steps: [
        {
          text: `First solve the boundary equation: ${a}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b} = ${total}, so x = ${boundary}. Because the inequality is greater than, the smallest integer solution is ${answer}.`,
          value: answer,
          expected: boundary + 1,
        },
      ],
      tip: "For a strict greater-than inequality, the first integer solution is one more than the boundary.",
    });
  },

  "Systems of Equations"(difficulty) {
    const x = rand(-5, 7);
    const y = rand(-4, 8);
    const a = rand(1, 5);
    const b = rand(1, 5);
    const c = rand(1, 5);
    const d = rand(1, 5);
    if (a * d === b * c) return null;
    const e = a * x + b * y;
    const f = c * x + d * y;
    const askY = difficulty === 2 && Math.random() > 0.5;
    const answer = askY ? y : x;
    return question({
      topic: "Systems of Equations",
      difficulty,
      prompt: `Solve the system. ${a}x + ${b}y = ${e} and ${c}x + ${d}y = ${f}. What is ${askY ? "y" : "x"}?`,
      answer,
      answerValue: answer,
      steps: [
        {
          text: `The ordered pair that satisfies both equations is (${x}, ${y}), so ${askY ? "y" : "x"} = ${answer}.`,
          value: answer,
          expected: askY ? y : x,
        },
      ],
      tip: "A system solution must make both equations true at the same time.",
    });
  },

  "Linear Functions and Graphing"(difficulty) {
    if (difficulty === 0) {
      const m = rand(-5, 5) || 3;
      const b = rand(-6, 8);
      return question({
        topic: "Linear Functions and Graphing",
        difficulty,
        prompt: `For the line y = ${m}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b}, what is the y-intercept?`,
        answer: b,
        answerValue: b,
        visual: lineGraph(m, b),
        steps: [{ text: `In y = mx + b, the y-intercept is b. Here b = ${b}.`, value: b, expected: b }],
        tip: "Slope-intercept form is y = mx + b.",
      });
    }
    if (difficulty === 2 && Math.random() > 0.45) {
      const m = rand(-5, 5) || 2;
      const b = rand(-8, 8) || 3;
      const answer = `y = ${m}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b}`;
      const graphOptions = [
        { equation: answer, visual: lineGraph(m, b), correct: true },
        { equation: `y = ${b}x ${m < 0 ? "- " + Math.abs(m) : "+ " + m}`, visual: lineGraph(b, m), correct: false },
        { equation: `y = ${-m}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b}`, visual: lineGraph(-m, b), correct: false },
        { equation: `y = ${m}x ${b < 0 ? "+ " + Math.abs(b) : "- " + b}`, visual: lineGraph(m, -b), correct: false },
      ].sort(() => Math.random() - 0.5).map((option, index) => ({ ...option, label: String.fromCharCode(65 + index) }));
      const correctLabel = graphOptions.find((option) => option.equation === answer).label;
      return question({
        topic: "Linear Functions and Graphing",
        difficulty,
        type: "multiple-choice",
        prompt: `Which graph matches a line with slope ${m} and y-intercept ${b}?`,
        answer: correctLabel,
        answerValue: 0,
        validator: (student) => String(student).trim().toUpperCase() === correctLabel,
        choices: graphOptions.map((option) => option.label),
        visualChoices: graphOptions.map((option) => option.visual),
        steps: [{ text: `Slope-intercept form is y = mx + b. With slope ${m} and y-intercept ${b}, the matching graph is ${correctLabel}, which represents ${answer}.` }],
        tip: "In y = mx + b, m is the slope and b is the y-intercept.",
      });
    }
    const x1 = rand(-6, 3);
    const y1 = rand(-6, 6);
    const slope = choose([-3, -2, -1, 1, 2, 3, 4]);
    const run = rand(1, 5);
    const x2 = x1 + run;
    const y2 = y1 + slope * run;
    return question({
      topic: "Linear Functions and Graphing",
      difficulty,
      prompt: `What is the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2})?`,
      answer: slope,
      answerValue: slope,
      visual: lineGraph(slope, y1 - slope * x1),
      steps: [
        {
          text: `Slope is rise over run: (${y2} - ${y1}) ÷ (${x2} - ${x1}) = ${y2 - y1} ÷ ${x2 - x1} = ${slope}.`,
          value: slope,
          expected: (y2 - y1) / (x2 - x1),
        },
      ],
      tip: "Slope compares vertical change to horizontal change.",
    });
  },

  "Graphing: Y-Intercept"(difficulty) {
    const m = rand(-5, 5) || 3;
    const b = rand(-8, 8);
    return question({
      topic: "Graphing: Y-Intercept",
      difficulty,
      prompt: `For the line y = ${m}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b}, what is the y-intercept?`,
      answer: b,
      answerValue: b,
      visual: lineGraph(m, b),
      steps: [{ text: `In y = mx + b, the y-intercept is b. Here b = ${b}.`, value: b, expected: b }],
      tip: "The y-intercept is where the line crosses the y-axis.",
    });
  },

  "Graphing: Slope From Points"(difficulty) {
    const x1 = rand(-6, 3);
    const y1 = rand(-6, 6);
    const slope = choose([-4, -3, -2, -1, 1, 2, 3, 4]);
    const run = rand(1, 5);
    const x2 = x1 + run;
    const y2 = y1 + slope * run;
    return question({
      topic: "Graphing: Slope From Points",
      difficulty,
      prompt: `Find the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2}).`,
      answer: slope,
      answerValue: slope,
      visual: lineGraph(slope, y1 - slope * x1),
      steps: [{ text: `Slope is (${y2} - ${y1}) ÷ (${x2} - ${x1}) = ${y2 - y1} ÷ ${x2 - x1} = ${slope}.`, value: slope, expected: (y2 - y1) / (x2 - x1) }],
      tip: "Slope is change in y divided by change in x.",
    });
  },

  "Graphing: Match Equation"(difficulty) {
    const m = rand(-5, 5) || 2;
    const b = rand(-8, 8) || 3;
    const equation = `y = ${m}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b}`;
    const graphOptions = [
      { visual: lineGraph(m, b), correct: true },
      { visual: lineGraph(b, m), correct: false },
      { visual: lineGraph(-m, b), correct: false },
      { visual: lineGraph(m, -b), correct: false },
    ].sort(() => Math.random() - 0.5).map((option, index) => ({ ...option, label: String.fromCharCode(65 + index) }));
    const answer = graphOptions.find((option) => option.correct).label;
    return question({
      topic: "Graphing: Match Equation",
      difficulty,
      type: "multiple-choice",
      prompt: `Which graph matches a line with slope ${m} and y-intercept ${b}?`,
      answer,
      answerValue: 0,
      validator: (student) => String(student).trim().toUpperCase() === answer,
      choices: graphOptions.map((option) => option.label),
      visualChoices: graphOptions.map((option) => option.visual),
      steps: [{ text: `Slope-intercept form is y = mx + b. With slope ${m} and y-intercept ${b}, the equation is ${equation}, so the matching graph is ${answer}.` }],
      tip: "Match m to the slope and b to the y-intercept.",
    });
  },

  "Graphing: Word Problem Graph"(difficulty) {
    const start = rand(10, 60);
    const rate = rand(3, 12);
    const weeks = rand(4, 10);
    const answer = start + rate * weeks;
    return question({
      topic: "Graphing: Word Problem Graph",
      difficulty,
      prompt: `A graph starts at ${start} and increases by ${rate} each week. What value does the graph show after ${weeks} weeks?`,
      answer,
      answerValue: answer,
      visual: trendVisual(start, answer),
      steps: [{ text: `Start at ${start}, then add ${rate} for each of ${weeks} weeks: ${start} + ${rate} × ${weeks} = ${answer}.`, value: answer, expected: start + rate * weeks }],
      tip: "The starting value is the y-intercept, and the repeated change is the slope.",
    });
  },

  "Function Notation"(difficulty) {
    const a = rand(-4, 5) || 2;
    const b = rand(-8, 8);
    const x = rand(-5, 7);
    const answer = a * x + b;
    return question({
      topic: "Function Notation",
      difficulty,
      prompt: `If f(x) = ${a}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b}, what is f(${x})?`,
      answer,
      answerValue: answer,
      steps: [
        {
          text: `f(${x}) means replace x with ${x}: ${a}(${x}) ${b < 0 ? "- " + Math.abs(b) : "+ " + b} = ${answer}.`,
          value: answer,
          expected: a * x + b,
        },
      ],
      tip: "Function notation is another way to say substitute this input value.",
    });
  },

  "Exponents and Radicals"(difficulty) {
    if (difficulty < 2) {
      const base = rand(2, 7);
      const power = difficulty === 0 ? 2 : 3;
      const answer = base ** power;
      return question({
        topic: "Exponents and Radicals",
        difficulty,
        prompt: `Simplify ${base}^${power}.`,
        answer,
        answerValue: answer,
        steps: [
          {
            text: `${base}^${power} means multiply ${base} by itself ${power} times. The result is ${answer}.`,
            value: answer,
            expected: base ** power,
          },
        ],
        tip: "Exponents count repeated multiplication.",
      });
    }
    const a = rand(2, 8);
    const b = rand(2, 4);
    const answer = a ** b;
    return question({
      topic: "Exponents and Radicals",
      difficulty,
      prompt: `Simplify (${a}^${b}) using a positive exponent.`,
      answer,
      answerValue: answer,
      steps: [{ text: `${a}^${b} means multiply ${a} by itself ${b} times, which gives ${answer}.`, value: answer, expected: a ** b }],
      tip: "Exponents count repeated multiplication.",
    });
  },

  Polynomials(difficulty) {
    const a = rand(2, 8);
    const b = rand(-9, 9) || 4;
    const c = rand(2, 8);
    const answer = a + c;
    return question({
      topic: "Polynomials",
      difficulty,
      prompt: `Combine like terms: (${a}x^2 ${b < 0 ? "- " + Math.abs(b) : "+ " + b}x) + ${c}x^2. What is the coefficient of x^2?`,
      answer,
      answerValue: answer,
      steps: [{ text: `Only x^2 terms combine with x^2 terms: ${a}x^2 + ${c}x^2 = ${answer}x^2.`, value: answer, expected: a + c }],
      tip: "Like terms have the same variable part and the same exponent.",
    });
  },

  Factoring(difficulty) {
    const r = rand(2, 8);
    const s = rand(2, 8);
    const b = r + s;
    const c = r * s;
    const answer = `(x + ${r})(x + ${s})`;
    const choices = [answer, `(x + ${b})(x + ${c})`, `(x - ${r})(x - ${s})`, `(x + ${c})(x + ${b})`].sort(
      () => Math.random() - 0.5,
    );
    return question({
      topic: "Factoring",
      difficulty,
      type: "multiple-choice",
      prompt: `Factor x^2 + ${b}x + ${c}.`,
      answer,
      answerValue: 0,
      validator: (student) => String(student).replace(/\s+/g, "") === answer.replace(/\s+/g, ""),
      choices,
      steps: [
        {
          text: `Find two numbers that multiply to ${c} and add to ${b}: ${r} and ${s}. So the factorization is ${answer}.`,
        },
      ],
      tip: "For x^2 + bx + c, look for two numbers that multiply to c and add to b.",
    });
  },

  Quadratics(difficulty) {
    const x = rand(-5, 6);
    const a = difficulty === 2 ? rand(2, 3) : 1;
    const b = rand(-6, 8);
    const c = rand(-10, 10);
    const answer = a * x * x + b * x + c;
    return question({
      topic: "Quadratics",
      difficulty,
      prompt: `For q(x) = ${a}x^2 ${b < 0 ? "- " + Math.abs(b) : "+ " + b}x ${c < 0 ? "- " + Math.abs(c) : "+ " + c}, what is q(${x})?`,
      answer,
      answerValue: answer,
      steps: [
        {
          text: `Substitute ${x}: ${a}(${x})^2 ${b < 0 ? "- " + Math.abs(b) : "+ " + b}(${x}) ${c < 0 ? "- " + Math.abs(c) : "+ " + c} = ${answer}.`,
          value: answer,
          expected: a * x * x + b * x + c,
        },
      ],
      tip: "Evaluate the exponent before multiplying by the coefficient.",
    });
  },

  "Solving Quadratic Equations"(difficulty) {
    const r = rand(-6, 2);
    const s = rand(3, 9);
    const b = -(r + s);
    const c = r * s;
    const answer = Math.min(r, s);
    return question({
      topic: "Solving Quadratic Equations",
      difficulty,
      prompt: `One solution of x^2 ${b < 0 ? "- " + Math.abs(b) : "+ " + b}x ${c < 0 ? "- " + Math.abs(c) : "+ " + c} = 0 is ${Math.max(r, s)}. What is the other solution?`,
      answer,
      answerValue: answer,
      steps: [
        {
          text: `The equation factors as (x - ${r})(x - ${s}) = 0, so the two solutions are ${r} and ${s}. The other solution is ${answer}.`,
          value: answer,
          expected: Math.min(r, s),
        },
      ],
      tip: "A zero product means at least one factor must equal zero.",
    });
  },

  "Graphing Parabolas"(difficulty) {
    const h = rand(-5, 5);
    const k = rand(-8, 8);
    const askAxis = difficulty > 0 && Math.random() > 0.5;
    return question({
      topic: "Graphing Parabolas",
      difficulty,
      prompt: `For y = (x ${h < 0 ? "+ " + Math.abs(h) : "- " + h})^2 ${k < 0 ? "- " + Math.abs(k) : "+ " + k}, what is the ${askAxis ? "axis of symmetry" : "x-coordinate of the vertex"}?`,
      answer: h,
      answerValue: h,
      visual: parabolaGraph(h, k),
      steps: [
        {
          text: `Vertex form is y = (x - h)^2 + k. Here h = ${h}, so the ${askAxis ? "axis of symmetry is x =" : "vertex x-coordinate is"} ${h}.`,
          value: h,
          expected: h,
        },
      ],
      tip: "In vertex form, the sign inside the parentheses is the opposite of the vertex x-value.",
    });
  },

  "Quadratic Transformations"(difficulty) {
    const h = rand(-4, 4) || 2;
    const k = rand(-6, 6);
    const answer = h;
    return question({
      topic: "Quadratic Transformations",
      difficulty,
      prompt: `For y = (x ${h < 0 ? "+ " + Math.abs(h) : "- " + h})^2 ${k < 0 ? "- " + Math.abs(k) : "+ " + k}, what is the x-coordinate of the vertex?`,
      answer,
      answerValue: answer,
      visual: parabolaGraph(h, k),
      steps: [{ text: `In vertex form y = (x - h)^2 + k, the vertex is (${h}, ${k}), so the x-coordinate is ${answer}.`, value: answer, expected: h }],
      tip: "The value inside parentheses has the opposite sign of the vertex x-coordinate.",
    });
  },

  Discriminant(difficulty) {
    const a = 1;
    const b = rand(-8, 8) || 5;
    const c = rand(-10, 10);
    const answer = b * b - 4 * a * c;
    return question({
      topic: "Discriminant",
      difficulty,
      prompt: `Find the discriminant of x^2 ${b < 0 ? "- " + Math.abs(b) : "+ " + b}x ${c < 0 ? "- " + Math.abs(c) : "+ " + c} = 0.`,
      answer,
      answerValue: answer,
      steps: [{ text: `The discriminant is b^2 - 4ac. Here it is ${b}^2 - 4(1)(${c}) = ${answer}.`, value: answer, expected: b * b - 4 * a * c }],
      tip: "The discriminant tells how many real solutions a quadratic has.",
    });
  },

  "Completing the Square"(difficulty) {
    const b = choose([4, 6, 8, 10, 12, 14]);
    const answer = (b / 2) ** 2;
    return question({
      topic: "Completing the Square",
      difficulty,
      prompt: `What number completes the square for x^2 + ${b}x + ___?`,
      answer,
      answerValue: answer,
      steps: [{ text: `Take half of ${b}, then square it: (${b} ÷ 2)^2 = ${answer}.`, value: answer, expected: (b / 2) ** 2 }],
      tip: "To complete the square, use (b/2)^2.",
    });
  },

  "Quadratic Formula"(difficulty) {
    const a = 1;
    const b = rand(-9, -3);
    const c = rand(1, 12);
    const discriminant = b * b - 4 * a * c;
    if (discriminant <= 0) return null;
    const root = (-b + Math.sqrt(discriminant)) / (2 * a);
    const answer = Number(root.toFixed(1));
    return question({
      topic: "Quadratic Formula",
      difficulty,
      prompt: `Using the quadratic formula, find the larger solution of x^2 ${b < 0 ? "- " + Math.abs(b) : "+ " + b}x + ${c} = 0. Round to the nearest tenth.`,
      answer,
      answerValue: answer,
      validator: roundedValidator(root, 1),
      choiceOptions: { forceDecimal: true, decimals: 1 },
      answerFormat: decimalFormat(1),
      steps: [
        {
          text: `The larger root is (-b + √(b^2 - 4ac)) ÷ 2a. Substituting gives ${root.toFixed(3)}, which rounds to ${answer}.`,
          value: answer,
          expected: Number(root.toFixed(1)),
        },
      ],
      tip: "Use the plus sign in the quadratic formula to get the larger root.",
    });
  },

  "Rational Expressions"(difficulty) {
    const x = rand(4, 12);
    const a = rand(2, 6);
    const answer = x + a;
    return question({
      topic: "Rational Expressions",
      difficulty,
      prompt: `Evaluate (x^2 - ${a * a})/(x - ${a}) when x = ${x}.`,
      answer,
      answerValue: answer,
      steps: [
        {
          text: `Factor the numerator as (x - ${a})(x + ${a}). After canceling x - ${a}, substitute x = ${x}: ${x} + ${a} = ${answer}.`,
          value: answer,
          expected: (x * x - a * a) / (x - a),
        },
      ],
      tip: "Factor first, then cancel common factors when allowed.",
    });
  },

  "Radical Expressions"(difficulty) {
    const outside = rand(2, 8);
    const inside = choose([2, 3, 5, 6, 7]);
    const radicand = outside * outside * inside;
    const answer = `${outside}√${inside}`;
    const choices = [answer, `√${radicand}`, `${inside}√${outside}`, `${outside * inside}√${inside}`].sort(
      () => Math.random() - 0.5,
    );
    return question({
      topic: "Radical Expressions",
      difficulty,
      type: "multiple-choice",
      prompt: `Simplify √${radicand}.`,
      answer,
      answerValue: 0,
      validator: (student) => String(student).replace(/\s+/g, "") === answer.replace(/\s+/g, ""),
      choices,
      steps: [{ text: `Break ${radicand} into ${outside * outside} × ${inside}. Since √${outside * outside} = ${outside}, √${radicand} = ${answer}.` }],
      tip: "Pull perfect-square factors out of the radical.",
    });
  },

  "Similar Triangles"(difficulty) {
    const small = rand(3, 9);
    const large = small * rand(2, 5);
    const side = rand(4, 12);
    const answer = side * (large / small);
    return question({
      topic: "Similar Triangles",
      difficulty,
      prompt: `Two similar triangles have corresponding sides ${small} and ${large}. If another side on the smaller triangle is ${side}, what is the matching side on the larger triangle?`,
      answer,
      answerValue: answer,
      visual: svg(`<path d="M65 165 L155 165 L65 80 Z" fill="#edf5ff" stroke="#2563eb" stroke-width="3"/><path d="M210 165 L330 165 L210 50 Z" fill="#e8f7ef" stroke="#168a63" stroke-width="3"/><text x="110" y="190" text-anchor="middle">${small}</text><text x="270" y="190" text-anchor="middle">${large}</text><text x="45" y="125">${side}</text><text x="340" y="115">?</text>`),
      steps: [{ text: `The scale factor is ${large} ÷ ${small} = ${large / small}. Multiply ${side} by that scale factor to get ${answer}.`, value: answer, expected: side * (large / small) }],
      tip: "Similar figures use the same scale factor for all matching sides.",
    });
  },

  "Pythagorean Theorem"(difficulty) {
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [7, 24, 25],
      [8, 15, 17],
    ];
    const [a, b, c] = choose(triples);
    return question({
      topic: "Pythagorean Theorem",
      difficulty,
      prompt: `A right triangle has legs ${a} and ${b}. What is the hypotenuse?`,
      answer: c,
      answerValue: c,
      visual: triangleVisual(a, b, "?"),
      steps: [{ text: `Use a^2 + b^2 = c^2: ${a}^2 + ${b}^2 = ${c * c}, so c = ${c}.`, value: c * c, expected: a * a + b * b }],
      tip: "The hypotenuse is the side across from the right angle.",
    });
  },

  "Trigonometry Basics"(difficulty) {
    const opp = rand(3, 9);
    const hyp = opp + rand(3, 8);
    const result = simplify(opp, hyp);
    return question({
      topic: "Trigonometry Basics",
      difficulty,
      prompt: `In a right triangle, the side opposite angle A is ${opp} and the hypotenuse is ${hyp}. What is sin(A)?`,
      answer: fractionText(result),
      answerValue: result.num / result.den,
      choices: makeFractionChoices(result),
      visual: triangleVisual("adjacent", opp, hyp),
      answerFormat: "Answer format: Enter your answer as a fraction (example: 5/4). Equivalent decimals are accepted.",
      steps: [{ text: `Sine is opposite over hypotenuse, so sin(A) = ${opp}/${hyp} = ${fractionText(result)}.`, value: result.num / result.den, expected: opp / hyp }],
      tip: "SOH means sine = opposite ÷ hypotenuse.",
    });
  },

  "Algebra and Quadratic Word Problems"(difficulty) {
    const width = rand(4, 12);
    const length = width + rand(3, 9);
    const area = width * length;
    return question({
      topic: "Algebra and Quadratic Word Problems",
      difficulty,
      prompt: `A rectangle has length ${length - width} more than its width and area ${area}. What is the width?`,
      answer: width,
      answerValue: width,
      steps: [
        {
          text: `Let the width be w, so the length is w + ${length - width}. The area equation is w(w + ${length - width}) = ${area}. The positive solution is ${width}.`,
          value: width * length,
          expected: area,
        },
      ],
      tip: "For geometry word problems, define a variable before writing the equation.",
    });
  },

  "SAT Math Reasoning"(difficulty) {
    const variant = choose(["percent", "system", "function", "quadratic", "geometry", "algebra"]);
    if (variant === "system") {
      const x = rand(2, 8);
      const y = rand(1, 7);
      const sum = x + y;
      const diff = x - y;
      return question({
        topic: "SAT Math Reasoning",
        difficulty,
        prompt: `If x + y = ${sum} and x - y = ${diff}, what is x?`,
        answer: x,
        answerValue: x,
        steps: [{ text: `Add the equations: 2x = ${sum + diff}. Divide by 2 to get x = ${x}.`, value: x, expected: (sum + diff) / 2 }],
        tip: "Adding equations can eliminate a variable in a system.",
      });
    }
    if (variant === "function") {
      const a = rand(2, 5);
      const b = rand(-8, 8);
      const input = rand(3, 9);
      const answer = a * input + b;
      return question({
        topic: "SAT Math Reasoning",
        difficulty,
        prompt: `For f(x) = ${a}x ${b < 0 ? "- " + Math.abs(b) : "+ " + b}, what is f(${input})?`,
        answer,
        answerValue: answer,
        steps: [{ text: `Substitute ${input}: f(${input}) = ${a}(${input}) ${b < 0 ? "- " + Math.abs(b) : "+ " + b} = ${answer}.`, value: answer, expected: a * input + b }],
        tip: "Function notation asks you to substitute the input.",
      });
    }
    if (variant === "quadratic") {
      const width = rand(3, 9);
      const length = width + rand(2, 7);
      const area = width * length;
      return question({
        topic: "SAT Math Reasoning",
        difficulty,
        prompt: `A rectangle has length ${length - width} more than its width and area ${area}. What is the width?`,
        answer: width,
        answerValue: width,
        steps: [{ text: `Let width be w. Then w(w + ${length - width}) = ${area}. The positive solution is ${width}.`, value: width * length, expected: area }],
        tip: "SAT word problems often need an equation before arithmetic.",
      });
    }
    if (variant === "geometry") {
      const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];
      const [a, b, c] = choose(triples);
      return question({
        topic: "SAT Math Reasoning",
        difficulty,
        prompt: `A right triangle has legs ${a} and ${b}. What is the hypotenuse?`,
        answer: c,
        answerValue: c,
        visual: triangleVisual(a, b, "?"),
        steps: [{ text: `Use a^2 + b^2 = c^2: ${a}^2 + ${b}^2 = ${c * c}, so c = ${c}.`, value: c * c, expected: a * a + b * b }],
        tip: "Right triangle questions often use the Pythagorean theorem.",
      });
    }
    if (variant === "algebra") {
      const x = rand(2, 10);
      const a = rand(2, 6);
      const b = rand(3, 12);
      const total = a * (x + b);
      return question({
        topic: "SAT Math Reasoning",
        difficulty,
        prompt: `If ${a}(x + ${b}) = ${total}, what is x?`,
        answer: x,
        answerValue: x,
        steps: [{ text: `Divide by ${a}: x + ${b} = ${total / a}. Then subtract ${b}: x = ${x}.`, value: x, expected: total / a - b }],
        tip: "Undo multiplication before undoing addition inside the parentheses.",
      });
    }
    const base = rand(30, 80);
    const percent = choose([15, 20, 25, 30]);
    const after = Number((base * (1 + percent / 100)).toFixed(2));
    const answer = base;
    return question({
      topic: "SAT Math Reasoning",
      difficulty,
      prompt: `A value increases by ${percent}% to become ${after}. What was the original value? Round to the nearest whole number.`,
      answer,
      answerValue: answer,
      validator: roundedValidator(after / (1 + percent / 100), 0),
      answerFormat: decimalFormat(0),
      steps: [
        {
          text: `After a ${percent}% increase, the new value is ${1 + percent / 100} times the original. Divide ${after} by ${1 + percent / 100} to get ${answer}.`,
          value: answer,
          expected: Number((after / (1 + percent / 100)).toFixed(0)),
        },
      ],
      tip: "For a percent increase, divide by 1 plus the percent as a decimal to recover the original.",
    });
  },

  "Data Interpretation"(difficulty) {
    const start = rand(20, 80);
    const change = rand(5, 25);
    const end = start + change;
    const answer = Number(((change / start) * 100).toFixed(1));
    return question({
      topic: "Data Interpretation",
      difficulty,
      prompt: `A graph shows enrollment rising from ${start} students to ${end} students. What is the percent increase? Round to the nearest tenth.`,
      answer,
      answerValue: answer,
      validator: roundedValidator((change / start) * 100, 1),
      choiceOptions: { forceDecimal: true, decimals: 1 },
      answerFormat: "Answer format: Enter a percent rounded to the nearest tenth without the percent sign (example: 12.5).",
      visual: barVisual(start, end),
      steps: [
        {
          text: `Percent increase is change divided by original, times 100: (${end} - ${start}) ÷ ${start} × 100 = ${answer}.`,
          value: answer,
          expected: Number((((end - start) / start) * 100).toFixed(1)),
        },
      ],
      tip: "In data questions, percent change uses the original amount in the denominator.",
    });
  },

  "Scientific Notation"(difficulty) {
    const coefficient = rand(12, 98) / 10;
    const exponent = rand(3, 7);
    const answer = Number((coefficient * 10 ** exponent).toFixed(0));
    return question({
      topic: "Scientific Notation",
      difficulty,
      prompt: `Write ${coefficient} × 10^${exponent} in standard form.`,
      answer,
      answerValue: answer,
      steps: [{ text: `Multiplying by 10^${exponent} moves the decimal ${exponent} places to the right, so ${coefficient} × 10^${exponent} = ${answer}.`, value: answer, expected: coefficient * 10 ** exponent }],
      tip: "A positive power of 10 moves the decimal to the right.",
    });
  },

  "Irrational Numbers"(difficulty) {
    const perfect = choose([4, 9, 16, 25, 36, 49, 64, 81]);
    const irrational = perfect + choose([1, 2, 3, 5]);
    return question({
      topic: "Irrational Numbers",
      difficulty,
      type: "multiple-choice",
      prompt: `Which number is irrational?`,
      answer: `√${irrational}`,
      answerValue: 0,
      validator: (student) => String(student).replace(/\s+/g, "") === `√${irrational}`,
      choices: [`√${irrational}`, `√${perfect}`, `${rand(2, 9)}/10`, `${rand(2, 8)}`].sort(() => Math.random() - 0.5),
      steps: [{ text: `√${perfect} is rational because ${perfect} is a perfect square. √${irrational} is not a perfect square, so √${irrational} is irrational.` }],
      tip: "Square roots of non-perfect squares are irrational.",
    });
  },

  Transformations(difficulty) {
    const shift = rand(2, 8);
    const answer = "up";
    return question({
      topic: "Transformations",
      difficulty,
      type: "multiple-choice",
      prompt: `The graph of y = x^2 is changed to y = x^2 + ${shift}. Which transformation happened?`,
      answer,
      answerValue: 0,
      validator: (student) => String(student).trim().toLowerCase() === answer,
      choices: ["up", "down", "left", "right"].sort(() => Math.random() - 0.5),
      visual: parabolaGraph(0, shift),
      steps: [{ text: `Adding ${shift} outside the function moves every y-value up ${shift} units, so the graph shifts ${answer}.` }],
      tip: "Adding outside a function changes vertical position.",
    });
  },

  "Volume of 3D Shapes"(difficulty) {
    const radius = rand(2, 7);
    const height = rand(4, 12);
    const useCone = difficulty > 0 && Math.random() > 0.5;
    const exact = (3.14 * radius * radius * height) / (useCone ? 3 : 1);
    const answer = Number(exact.toFixed(1));
    return question({
      topic: "Volume of 3D Shapes",
      difficulty,
      prompt: `A ${useCone ? "cone" : "cylinder"} has radius ${radius} and height ${height}. What is its volume? Use 3.14 for π and round to the nearest tenth.`,
      answer,
      answerValue: answer,
      validator: roundedValidator((3.14 * radius * radius * height) / (useCone ? 3 : 1), 1),
      choiceOptions: { forceDecimal: true, decimals: 1 },
      answerFormat: decimalFormat(1),
      visual: svg(useCone
        ? `<path d="M180 45 L95 170 L265 170 Z" fill="#fff8e6" stroke="#a16207" stroke-width="3"/><ellipse cx="180" cy="170" rx="85" ry="18" fill="none" stroke="#a16207" stroke-width="3"/><text x="180" y="196" text-anchor="middle">r=${radius}</text><text x="275" y="112">h=${height}</text>`
        : `<ellipse cx="180" cy="55" rx="80" ry="20" fill="#edf5ff" stroke="#2563eb" stroke-width="3"/><rect x="100" y="55" width="160" height="115" fill="#edf5ff" stroke="#2563eb" stroke-width="3"/><ellipse cx="180" cy="170" rx="80" ry="20" fill="#edf5ff" stroke="#2563eb" stroke-width="3"/><text x="180" y="198" text-anchor="middle">r=${radius}</text><text x="270" y="115">h=${height}</text>`),
      steps: [{ text: `${useCone ? "Cone volume is (πr^2h) ÷ 3" : "Cylinder volume is πr^2h"}. Using 3.14 gives ${answer}.`, value: answer, expected: Number(((3.14 * radius * radius * height) / (useCone ? 3 : 1)).toFixed(1)) }],
      tip: "Volume formulas measure the space inside a 3D shape.",
    });
  },

  "Scatter Plots and Best Fit"(difficulty) {
    const slope = rand(2, 6);
    const start = rand(5, 20);
    const x = rand(4, 10);
    const answer = slope * x + start;
    return question({
      topic: "Scatter Plots and Best Fit",
      difficulty,
      prompt: `A line of best fit for a scatter plot is y = ${slope}x + ${start}. What does the model predict when x = ${x}?`,
      answer,
      answerValue: answer,
      visual: scatterVisual(slope, start),
      steps: [{ text: `Substitute x = ${x}: y = ${slope}(${x}) + ${start} = ${answer}.`, value: answer, expected: slope * x + start }],
      tip: "A line of best fit can be used to make predictions from data.",
    });
  },

  "Algebra 1 Readiness Word Problems"(difficulty) {
    const rate = rand(8, 25);
    const fee = rand(10, 60);
    const hours = rand(3, 9);
    const total = rate * hours + fee;
    return question({
      topic: "Algebra 1 Readiness Word Problems",
      difficulty,
      prompt: `A repair service charges a $${fee} fee plus $${rate} per hour. If the total cost is $${total}, how many hours were worked?`,
      answer: hours,
      answerValue: hours,
      steps: [{ text: `Set up ${rate}h + ${fee} = ${total}. Subtract ${fee} to get ${rate}h = ${total - fee}, then divide by ${rate}: h = ${hours}.`, value: hours, expected: (total - fee) / rate }],
      tip: "Translate the situation into an equation before solving.",
    });
  },

  "Linear vs Nonlinear Relationships"(difficulty) {
    return question({
      topic: "Linear vs Nonlinear Relationships",
      difficulty,
      type: "multiple-choice",
      prompt: `Which table could represent a linear relationship?`,
      answer: "x: 0, 1, 2, 3; y: 4, 7, 10, 13",
      answerValue: 0,
      validator: (student) => String(student).trim() === "x: 0, 1, 2, 3; y: 4, 7, 10, 13",
      choices: [
        "x: 0, 1, 2, 3; y: 4, 7, 10, 13",
        "x: 0, 1, 2, 3; y: 1, 2, 4, 8",
        "x: 0, 1, 2, 3; y: 0, 1, 4, 9",
        "x: 0, 1, 2, 3; y: 5, 7, 12, 20",
      ].sort(() => Math.random() - 0.5),
      visual: svg(`<rect x="55" y="35" width="250" height="150" fill="#fff" stroke="#dce3de"/><text x="80" y="70">A: +3 each step</text><text x="80" y="100">B: doubles</text><text x="80" y="130">C: squares</text><text x="80" y="160">D: uneven changes</text>`),
      steps: [{ text: `A linear relationship has a constant rate of change. The y-values 4, 7, 10, 13 increase by 3 each time, so x: 0, 1, 2, 3; y: 4, 7, 10, 13 is linear.` }],
      tip: "Linear tables have equal changes in y when x changes by equal amounts.",
    });
  },
};

const makeFractionChoices = (correctFraction) => {
  const correct = fractionText(correctFraction);
  const validator = numericValidator(correctFraction.num / correctFraction.den);
  const values = new Set([correct]);
  let attempts = 0;
  while (values.size < 4 && attempts < 100) {
    attempts += 1;
    const num = Math.max(1, correctFraction.num + choose([-3, -2, -1, 1, 2, 3]));
    const den = Math.max(2, correctFraction.den + choose([-2, -1, 1, 2]));
    const distractor = fractionText(simplify(num, den));
    if (!validator(distractor)) values.add(distractor);
  }
  return [...values].sort(() => Math.random() - 0.5);
};

export function generateQuestion(topic, difficulty) {
  const generator = generators[topic] ?? generators.Arithmetic;
  const normalizedDifficulty = Math.max(0, Math.min(2, difficulty));
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const generated = generator(normalizedDifficulty);
    if (generated) return generated;
  }
  throw new Error(`Could not generate a valid question for ${topic}`);
}

// To add a new topic later:
// 1. Add the topic name to TOPICS.
// 2. Add a matching generator function above.
// 3. Return a question object with prompt, answer, explanation, and tip.
// The adaptive engine will automatically include it in scoring and practice.
