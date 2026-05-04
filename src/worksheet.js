import { TOPIC_GROUPS, generateQuestion } from "./questions.js";
import { getGradeProfile } from "./engine.js";

const WORKSHEET_LENGTHS = {
  8: { label: "Quick Practice", warmUp: 2, core: 4, challenge: 2 },
  12: { label: "Standard Practice", warmUp: 3, core: 7, challenge: 2 },
  20: { label: "Full Practice", warmUp: 4, core: 12, challenge: 4 },
};

export function buildDailyWorksheet(profile, options = {}) {
  const requestedLength = WORKSHEET_LENGTHS[options.length] ? options.length : 12;
  const layout = WORKSHEET_LENGTHS[requestedLength];
  const latest = profile.tests[0];
  const profileTopics = getGradeProfile(profile.grade);
  const weakTopics = latest?.topicResults?.filter((row) => row.percent < 80).map((row) => row.topic) ?? [];
  const missedTopics = latest?.missedTopics ?? [];
  const recentPractice = new Set(profile.practice.slice(0, 15).map((item) => item.topic));
  const needs = [...new Set([...missedTopics, ...weakTopics])];
  const maintenance = profileTopics.primaryTopics.filter((topic) => !recentPractice.has(topic));
  const challenge = Number(profile.grade) >= 10 ? TOPIC_GROUPS.grade11Advanced : TOPIC_GROUPS.quadraticsFunctions;
  const enriched = !needs.length;
  const targeted = needs.length > 0 && needs.length <= 2;

  const sectionPlans = [
    {
      title: "Warm-Up",
      count: layout.warmUp,
      topics: enriched ? maintenance : [...needs, ...maintenance],
      difficulty: enriched ? 1 : 0,
    },
    {
      title: "Core Practice",
      count: layout.core,
      topics: enriched ? [...maintenance, ...challenge] : [...needs, ...maintenance, ...TOPIC_GROUPS.graphing],
      difficulty: 1,
    },
    {
      title: "Challenge",
      count: layout.challenge,
      topics: Number(profile.grade) >= 8 ? [...challenge, ...TOPIC_GROUPS.sat] : challenge,
      difficulty: 2,
    },
  ];

  const topicCounts = new Map();
  const templateCounts = new Map();
  const questions = [];
  const sections = sectionPlans.map((section) => ({
    title: section.title,
    questionIds: [],
  }));

  sectionPlans.forEach((section, sectionIndex) => {
    for (let i = 0; i < section.count; i += 1) {
      const question = makeWorksheetQuestion({
        topics: section.topics.length ? section.topics : profileTopics.primaryTopics,
        fallbackTopics: profileTopics.primaryTopics,
        difficulty: section.difficulty,
        topicCounts,
        templateCounts,
        targeted,
      });
      questions.push(question);
      sections[sectionIndex].questionIds.push(question.id);
    }
  });

  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: new Date().toISOString(),
    studentName: profile.name,
    grade: profile.grade,
    label: layout.label,
    length: requestedLength,
    sections,
    topics: [...new Set(questions.map((question) => question.topic))],
    difficulty: enriched ? "Enrichment" : "Adaptive mixed review",
    fileName: `${profile.name.replace(/\s+/g, "-").toLowerCase()}-daily-worksheet-${new Date().toISOString().slice(0, 10)}.pdf`,
    questions,
  };
}

export async function exportWorksheetPdf(worksheet) {
  const jspdf = window.jspdf;
  if (!jspdf?.jsPDF) {
    window.print();
    return;
  }

  const doc = new jspdf.jsPDF({ unit: "pt", format: "letter" });
  window.__worksheetDoc = doc;
  const margin = 42;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const width = pageWidth - margin * 2;
  const bottom = pageHeight - margin;
  const cardGap = 18;
  let y = margin;
  let questionsOnPage = 0;

  const colors = {
    ink: [33, 43, 54],
    muted: [92, 105, 120],
    line: [218, 226, 232],
    soft: [247, 250, 248],
    blue: [37, 99, 235],
  };

  const setText = (size = 11, style = "normal", color = colors.ink) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const clean = (text) => formatMathForPdf(String(text ?? ""));
  const textLineHeight = (size) => size * 1.45;
  const lineCount = (text, maxWidth = width, size = 11, bold = false) =>
    wrapForPdf(clean(text), maxWidth, size, bold).length;
  const blockHeight = (text, maxWidth = width, size = 11, after = 0) =>
    lineCount(text, maxWidth, size) * textLineHeight(size) + after;

  const canUsePdfText = (text) => /^[\x00-\x7F]*$/.test(text);
  const write = (text, x, startY, options = {}) => {
    const size = options.size ?? 11;
    const lineHeight = options.lineHeight ?? textLineHeight(size);
    setText(size, options.bold ? "bold" : "normal", options.color ?? colors.ink);
    const lines = wrapForPdf(clean(text), options.width ?? width, size, Boolean(options.bold));
    if (lines.some((line) => !canUsePdfText(line))) {
      drawTextImage(lines, x, startY - size, {
        size,
        lineHeight,
        bold: options.bold,
        color: options.color ?? colors.ink,
        maxWidth: options.width ?? width,
      });
    } else {
      doc.text(lines, x, startY);
    }
    return startY + lines.length * lineHeight + (options.after ?? 0);
  };

  const ensureSpace = (height, options = {}) => {
    if (questionsOnPage >= 6 || y + height > bottom) {
      doc.addPage();
      y = margin;
      questionsOnPage = 0;
      if (options.sectionTitle) drawSectionHeader(options.sectionTitle);
    }
  };

  const drawHeader = () => {
    setText(22, "bold");
    doc.text("Daily Math Worksheet", margin, y);
    y += 27;
    setText(11, "normal", colors.muted);
    doc.text(clean(`${worksheet.label ?? "Standard Practice"} • ${worksheet.studentName} • Grade ${worksheet.grade} • ${new Date(worksheet.date).toLocaleDateString()}`), margin, y);
    y += 24;
    doc.setFillColor(247, 250, 248);
    doc.setDrawColor(...colors.line);
    doc.roundedRect(margin, y, width, 42, 8, 8, "FD");
    y = write("Take your time. Show your thinking. This worksheet is for practice, not perfection.", margin + 16, y + 17, {
      size: 12,
      bold: true,
      width: width - 32,
      after: 12,
    });
    y += 8;
    const topics = worksheet.topics.slice(0, 7).join(", ");
    y = write(`Target skill areas: ${topics}${worksheet.topics.length > 7 ? ", ..." : ""}`, margin, y, {
      size: 10.5,
      color: colors.muted,
      after: 8,
    });
  };

  const drawSectionHeader = (title) => {
    setText(14, "bold", colors.blue);
    doc.text(title, margin, y);
    y += 18;
  };

  const renderQuestion = async (question, number, sectionTitle) => {
    const visualHeight = question.visualChoices ? 230 : question.visual ? 150 : question.interactiveGraph ? 132 : 0;
    const format = answerFormatText(question);
    const contentWidth = width - 32;
    const choicesHeight =
      question.type === "multiple-choice" && !question.visualChoices
        ? question.choices.reduce((total, choice) => total + blockHeight(`${choice}`, width - 54, 11.2, 8), 0)
        : 0;
    const estimatedHeight = Math.max(
      220,
      94 +
        blockHeight(`${number}. ${questionText(question)}`, contentWidth, 12.2, 8) +
        (format ? blockHeight(format, contentWidth, 10.5, 8) : 0) +
        visualHeight +
        (visualHeight ? 14 : 0) +
        choicesHeight +
        88,
    );
    ensureSpace(estimatedHeight, { sectionTitle });

    const cardTop = y;
    const cardHeight = estimatedHeight;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colors.line);
    doc.roundedRect(margin, cardTop, width, cardHeight, 8, 8, "FD");

    let cursor = cardTop + 18;
    setText(9, "bold", colors.muted);
    doc.text(clean(`${question.topic} • ${difficultyLabel(question.difficulty)}`), margin + 16, cursor);
    cursor += 18;
    cursor = write(`${number}. ${questionText(question)}`, margin + 16, cursor, {
      size: 12.2,
      bold: true,
      width: width - 32,
      after: 8,
    });

    if (format) {
      cursor = write(format, margin + 16, cursor, {
        size: 10.5,
        color: colors.muted,
        width: width - 32,
        after: 8,
      });
    }

    if (question.visualChoices) {
      cursor = await drawVisualChoices(question, margin + 18, cursor, width - 36);
      cursor += 8;
    } else if (question.visual) {
      cursor = await drawSvg(question.visual, margin + 22, cursor, 245, 138);
      cursor += 8;
    } else if (question.interactiveGraph) {
      drawBlankGrid(margin + 22, cursor, 210, 118);
      cursor += 128;
    }

    if (question.type === "multiple-choice" && !question.visualChoices) {
      question.choices.forEach((choice, choiceIndex) => {
        setText(11.2, "bold");
        doc.text(`${String.fromCharCode(65 + choiceIndex)}.`, margin + 24, cursor);
        cursor = write(`${choice}`, margin + 44, cursor, {
          size: 11.2,
          width: width - 74,
          after: 8,
        });
      });
      cursor += 2;
    }

    setText(9.5, "bold", colors.muted);
    doc.text("Work space", margin + 18, cursor + 8);
    cursor += 22;
    doc.setDrawColor(229, 235, 240);
    for (let line = 0; line < 3; line += 1) {
      doc.line(margin + 18, cursor + line * 18, margin + width - 18, cursor + line * 18);
    }

    y = Math.max(cardTop + cardHeight + cardGap, cursor + 58);
    questionsOnPage += 1;
  };

  drawHeader();
  for (const section of worksheet.sections) {
    ensureSpace(54);
    drawSectionHeader(section.title);
    for (const id of section.questionIds) {
      const question = worksheet.questions.find((item) => item.id === id);
      if (question) await renderQuestion(question, worksheet.questions.indexOf(question) + 1, section.title);
    }
  }

  doc.addPage();
  y = margin;
  questionsOnPage = 0;
  setText(19, "bold");
  doc.text("Answer Key", margin, y);
  y += 24;
  setText(11);
  const keyLines = worksheet.questions.map((question, index) => `${index + 1}. ${question.answer}`);
  const columnWidth = width / 2 - 12;
  keyLines.forEach((line, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * (columnWidth + 24);
    const lineY = y + row * 20;
    if (canUsePdfText(clean(line))) {
      doc.text(clean(line), x, lineY);
    } else {
      drawTextImage([clean(line)], x, lineY - 11, { size: 11, lineHeight: 16, maxWidth: columnWidth });
    }
  });
  y += Math.ceil(keyLines.length / 2) * 20 + 26;

  setText(19, "bold");
  doc.text("Step-by-Step Solutions", margin, y);
  y += 26;
  worksheet.questions.forEach((question, index) => {
    const text = `${index + 1}. ${question.explanation} Remember this: ${question.tip}`;
    const height = wrapForPdf(clean(text), width, 11, false).length * 15 + 18;
    if (y + height > bottom) {
      doc.addPage();
      y = margin;
    }
    y = write(text, margin, y, { size: 11, width, after: 14 });
  });

  doc.save(worksheet.fileName);
  delete window.__worksheetDoc;
}

function makeWorksheetQuestion({ topics, fallbackTopics, difficulty, topicCounts, templateCounts, targeted }) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const pool = attempt < 50 ? topics : fallbackTopics;
    const topic = pick(pool);
    const topicCount = topicCounts.get(topic) ?? 0;
    if (!targeted && topicCount >= 3) continue;

    const question = generateQuestion(topic, difficulty);
    const template = templateKey(question.prompt);
    const templateCount = templateCounts.get(template) ?? 0;
    if (templateCount >= 2) continue;

    topicCounts.set(topic, topicCount + 1);
    templateCounts.set(template, templateCount + 1);
    return question;
  }

  const topic = pick(fallbackTopics);
  const question = generateQuestion(topic, difficulty);
  topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
  templateCounts.set(templateKey(question.prompt), (templateCounts.get(templateKey(question.prompt)) ?? 0) + 1);
  return question;
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function templateKey(prompt) {
  return String(prompt)
    .replace(/Answer format:.*/i, "")
    .replace(/-?\d+\/-?\d+/g, "#/#")
    .replace(/-?\d+(\.\d+)?%?/g, "#")
    .replace(/[A-D]\./g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function questionText(question) {
  return String(question.prompt ?? "")
    .replace(/\s*Answer format:.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function answerFormatText(question) {
  if (question.type !== "fill-blank") return "";
  return String(question.answerFormat ?? "")
    .replace(/^\s*Answer format:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanAnswerFormat(text) {
  return String(text ?? "")
    .replace(/\s*Answer format:\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function difficultyLabel(value) {
  return ["Easy", "Medium", "Hard"][value] ?? "Practice";
}

function formatMathForPdf(text) {
  return String(text)
    .replace(/\^(-?\d+)/g, (_, power) => toSuperscript(power))
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/−/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function toSuperscript(value) {
  const map = {
    "-": "⁻",
    0: "⁰",
    1: "¹",
    2: "²",
    3: "³",
    4: "⁴",
    5: "⁵",
    6: "⁶",
    7: "⁷",
    8: "⁸",
    9: "⁹",
  };
  return String(value).split("").map((char) => map[char] ?? char).join("");
}

function wrapForPdf(text, maxWidth, size = 11, bold = false) {
  const doc = window.__worksheetDoc;
  const value = String(text ?? "");
  if (/^[\x00-\x7F]*$/.test(value) && doc) {
    return doc.splitTextToSize(value, maxWidth);
  }
  if (typeof document === "undefined") {
    return value.match(new RegExp(`.{1,${Math.max(18, Math.floor(maxWidth / size))}}`, "g")) ?? [value];
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = `${bold ? "700" : "400"} ${size}px Arial, Helvetica, sans-serif`;
  const lines = [];
  const paragraphs = value.split(/\n/);

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (context.measureText(next).width <= maxWidth) {
        line = next;
        return;
      }
      if (line) lines.push(line);
      if (context.measureText(word).width <= maxWidth) {
        line = word;
        return;
      }
      const chunks = breakLongWord(word, context, maxWidth);
      lines.push(...chunks.slice(0, -1));
      line = chunks.at(-1) ?? "";
    });
    if (line) lines.push(line);
  });

  return lines.length ? lines : [value];
}

function breakLongWord(word, context, maxWidth) {
  const chunks = [];
  let chunk = "";
  for (const char of String(word)) {
    const next = `${chunk}${char}`;
    if (context.measureText(next).width <= maxWidth) {
      chunk = next;
    } else {
      if (chunk) chunks.push(chunk);
      chunk = char;
    }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

function drawTextImage(lines, x, y, options = {}) {
  const doc = window.__worksheetDoc;
  if (!doc || typeof document === "undefined") return;
  const scale = 3;
  const size = options.size ?? 11;
  const lineHeight = options.lineHeight ?? size * 1.45;
  const maxWidth = options.maxWidth ?? 500;
  const padding = 3;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil((maxWidth + padding * 2) * scale);
  canvas.height = Math.ceil((lines.length * lineHeight + padding * 2) * scale);
  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  context.clearRect(0, 0, canvas.width, canvas.height);
  const [r, g, b] = options.color ?? [33, 43, 54];
  context.fillStyle = `rgb(${r}, ${g}, ${b})`;
  context.font = `${options.bold ? "700" : "400"} ${size}px Arial, Helvetica, sans-serif`;
  context.textBaseline = "alphabetic";
  lines.forEach((line, index) => {
    context.fillText(line, padding, padding + size + index * lineHeight);
  });
  doc.addImage(canvas.toDataURL("image/png"), "PNG", x, y, maxWidth, canvas.height / scale, undefined, "FAST");
}

async function drawVisualChoices(question, x, y, width) {
  const cellWidth = (width - 14) / 2;
  let cursorY = y;
  for (let row = 0; row < 2; row += 1) {
    const rowY = cursorY;
    for (let col = 0; col < 2; col += 1) {
      const index = row * 2 + col;
      const visual = question.visualChoices[index];
      const cellX = x + col * (cellWidth + 14);
      question.choices[index] && drawChoiceLabel(question.choices[index], cellX, rowY);
      if (visual) await drawSvg(visual, cellX + 18, rowY + 6, cellWidth - 26, 92);
    }
    cursorY += 110;
  }
  return cursorY;
}

function drawChoiceLabel(label, x, y) {
  const doc = window.__worksheetDoc;
  if (!doc) return;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(33, 43, 54);
  doc.text(formatMathForPdf(label), x, y + 16);
}

async function drawSvg(svgText, x, y, maxWidth, maxHeight) {
  const doc = window.__worksheetDoc;
  if (!doc) return y + maxHeight;
  try {
    const dataUrl = await svgToPng(svgText, maxWidth * 2, maxHeight * 2);
    doc.addImage(dataUrl, "PNG", x, y, maxWidth, maxHeight, undefined, "FAST");
  } catch {
    drawBlankGrid(x, y, Math.min(maxWidth, 220), Math.min(maxHeight, 120));
  }
  return y + maxHeight;
}

function drawBlankGrid(x, y, width, height) {
  const doc = window.__worksheetDoc;
  if (!doc) return;
  doc.setDrawColor(229, 235, 240);
  for (let gx = x; gx <= x + width; gx += width / 10) doc.line(gx, y, gx, y + height);
  for (let gy = y; gy <= y + height; gy += height / 8) doc.line(x, gy, x + width, gy);
  doc.setDrawColor(100, 113, 129);
  doc.line(x + width / 2, y, x + width / 2, y + height);
  doc.line(x, y + height / 2, x + width, y + height / 2);
}

function svgToPng(svgText, width, height) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not render worksheet visual."));
    };
    image.src = url;
  });
}
