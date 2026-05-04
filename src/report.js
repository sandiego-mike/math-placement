export function exportResultsPdf(session, results) {
  const jspdf = window.jspdf;
  if (!jspdf?.jsPDF) {
    window.print();
    return;
  }

  const doc = new jspdf.jsPDF({ unit: "pt", format: "letter" });
  const margin = 44;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  const write = (text, options = {}) => {
    const size = options.size ?? 11;
    const lineHeight = options.lineHeight ?? size * 1.45;
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(String(text), width);
    if (y + lines.length * lineHeight > 748) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + (options.after ?? 4);
  };

  write("Adaptive Math Placement Report", { size: 19, bold: true, after: 10 });
  write(`Student: ${session.student.name}`, { bold: true });
  write(`Grade level: ${session.student.grade}`);
  write(`Date completed: ${new Date(session.completedAt ?? Date.now()).toLocaleDateString()}`);
  write(`Overall score: ${results.overallPercent}% (${results.correctCount}/${results.total})`, { bold: true });
  write(`Placement level: ${results.placement}`, { bold: true });
  write(`Current estimated math readiness: ${results.currentReadiness}`, { bold: true });
  write(`Course readiness recommendation: ${results.courseRecommendation}`, { bold: true });
  write(`Test difficulty fit: ${results.testDifficultyFit}`, { bold: true });
  write(`Higher-level test recommended: ${results.higherLevelRecommended ? "Yes" : "No"}`);
  write(`Next recommended test level: ${results.nextRecommendedTest}`);
  write(`Difficulty level reached: ${results.difficultyReached}`, { after: 14 });

  write("Student-friendly placement summary", { size: 15, bold: true, after: 8 });
  write(`${results.currentReadiness}. ${results.courseRecommendation}. Test difficulty fit: ${results.testDifficultyFit}. ${results.higherLevelRecommended ? "A higher-level test is recommended." : "This test provided usable placement information."} This is based on the overall score, topic-by-topic accuracy, graphing/math reasoning performance, SAT-style performance, and the highest difficulty reached.`);

  write("Strongest skills", { size: 15, bold: true, after: 8 });
  (results.strongestSkills.length ? results.strongestSkills : ["No clear strength yet."]).forEach((topic) => write(`- ${topic}`));

  write("Weakest skills", { size: 15, bold: true, after: 8 });
  (results.weakestSkills.length ? results.weakestSkills : ["No major weak areas were found on this test."]).forEach((topic) => write(`- ${topic}`));

  write("Recommended next steps", { size: 15, bold: true, after: 8 });
  results.nextSteps.forEach((step) => write(`- ${step}`));

  write("Topic-by-topic results", { size: 15, bold: true, after: 8 });
  results.topicResults.forEach((row) => {
    write(`${row.topic}: ${row.percent}% (${row.correct}/${row.total}), current level ${row.difficulty}`);
  });

  write("Graphing and math reasoning performance", { size: 15, bold: true, after: 8 });
  write(`Graphing topics: ${results.graphingPerformance.percent}% (${results.graphingPerformance.correct}/${results.graphingPerformance.total})`);
  write(`SAT-style question performance: ${results.satPerformance.percent}% (${results.satPerformance.correct}/${results.satPerformance.total})`);

  write("Recommended practice areas", { size: 15, bold: true, after: 8 });
  const practice = results.reviewTopics.length ? results.reviewTopics : ["No practice areas were assigned because no missed or below-80% topics were found."];
  practice.forEach((topic) => write(`- ${topic}`));

  write("Questions missed", { size: 15, bold: true, after: 8 });
  if (!results.missed.length) {
    write("No missed questions. Great work.");
  } else {
    results.missed.forEach((item, index) => {
      write(`${index + 1}. ${item.topic}: ${item.prompt}`, { bold: true, after: 2 });
      write(`Student answer: ${item.studentAnswer}`);
      write(`Correct answer: ${item.answer}`);
      if (item.answerFormat) write(`Expected answer format: ${item.answerFormat.replace("Answer format: ", "")}`);
      write(`Equivalent answer rule: ${item.allowEquivalent === false ? "A specific format was required." : "Equivalent answers were accepted when they matched the stated format and rounding rule."}`);
      write(`Explanation: ${item.explanation}`);
      write("How to enter this type of answer next time: follow the format line in the question first, then round only when the prompt gives a rounding rule.");
      write(`Remember this: ${item.tip}`, { after: 12 });
    });
  }

  doc.save(`${session.student.name.replace(/\s+/g, "-").toLowerCase()}-math-placement-report.pdf`);
}
