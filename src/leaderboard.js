export const MATH_AVATARS = [
  // Animals
  "🦁", "🐯", "🦊", "🐺", "🦅", "🦉", "🐉", "🦄",
  "🐻", "🐼", "🐨", "🦋", "🐬", "🦈", "🐙", "🐸",
  "🦩", "🦚", "🦜", "🐧", "🦎", "🦀", "🐢", "🦝",
  // Space & nature
  "🌟", "⚡", "🔥", "💎", "🚀", "🌈", "🌊", "🌋",
  "🌙", "☀️", "💫", "✨", "🪐", "☄️", "🌺", "🌸",
  // Math & science
  "🏆", "🎯", "🧠", "💡", "🧮", "📐", "🔢", "🔭",
  "🔬", "🧪", "🌍", "🧬",
  // Fun
  "🎮", "🎨", "🎸", "⚽", "🏀", "🎉", "🍀", "🌵",
];

export const CATEGORY_STYLES = {
  "Top Score":        { accent: "#a16207", badge: "#fef3c7", badgeText: "#a16207" },
  "Most Improved":    { accent: "#168a63", badge: "#e8f7ef", badgeText: "#168a63" },
  "Hardest Worker":   { accent: "#2563eb", badge: "#edf5ff", badgeText: "#1d4ed8" },
  "Streak Leader":    { accent: "#c2413b", badge: "#ffeceb", badgeText: "#b91c1c" },
  "Challenge Champion": { accent: "#7c3aed", badge: "#f5f0ff", badgeText: "#6d28d9" },
  "Growth Mindset":   { accent: "#0891b2", badge: "#e0f9ff", badgeText: "#0e7490" },
};

export function computeLeaderboard(profiles) {
  const eligible = profiles.filter((p) => p.leaderboardVisible !== false);
  const awards = [];
  const awardCount = new Map();

  function pick(category, badge, badgeEmoji, candidates) {
    const sorted = candidates
      .filter((c) => c.profile)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aCount = awardCount.get(a.profile.id) ?? 0;
        const bCount = awardCount.get(b.profile.id) ?? 0;
        return aCount - bCount;
      });
    if (!sorted.length) return;
    const winner = sorted[0];
    awards.push({ category, badge, badgeEmoji, student: winner.profile, achievement: winner.achievement });
    awardCount.set(winner.profile.id, (awardCount.get(winner.profile.id) ?? 0) + 1);
  }

  // 1. Top Score
  pick("Top Score", "Math Master", "🏆",
    eligible
      .filter((p) => p.tests.length > 0)
      .map((p) => ({
        profile: p,
        score: p.tests[0].score,
        achievement: `${p.tests[0].score}% — ${p.tests[0].placement}`,
      }))
  );

  // 2. Most Improved (needs 2+ tests)
  pick("Most Improved", "Comeback Star", "📈",
    eligible
      .filter((p) => p.tests.length >= 2)
      .map((p) => {
        const latest = p.tests[0].score;
        const earliest = p.tests[p.tests.length - 1].score;
        const gain = latest - earliest;
        return {
          profile: p,
          score: gain,
          achievement: `Up ${gain}% — from ${earliest}% to ${latest}%`,
        };
      })
      .filter((c) => c.score > 0)
  );

  // 3. Hardest Worker
  pick("Hardest Worker", "Problem Solver", "💪",
    eligible
      .map((p) => {
        const days = countStudyDays(p);
        const workerScore = p.practice.length + p.worksheets.length * 3 + days * 2;
        const parts = [];
        if (p.practice.length) parts.push(`${p.practice.length} practice q's`);
        if (p.worksheets.length) parts.push(`${p.worksheets.length} worksheet${p.worksheets.length > 1 ? "s" : ""}`);
        if (days) parts.push(`${days} study day${days > 1 ? "s" : ""}`);
        return {
          profile: p,
          score: workerScore,
          achievement: parts.join(", ") || "Getting started",
        };
      })
      .filter((c) => c.score > 0)
  );

  // 4. Streak Leader
  pick("Streak Leader", "Streak Champion", "🔥",
    eligible
      .map((p) => {
        const streak = computeStreak(p);
        return {
          profile: p,
          score: streak,
          achievement: `${streak}-day practice streak`,
        };
      })
      .filter((c) => c.score >= 2)
  );

  // 5. Challenge Champion (best SAT or graphing across all tests)
  pick("Challenge Champion", "Challenge Ready", "⚡",
    eligible
      .filter((p) => p.tests.length > 0)
      .map((p) => {
        const bestSat = Math.max(...p.tests.map((t) => t.satPerformance?.percent ?? 0));
        const bestGraph = Math.max(...p.tests.map((t) => t.graphingPerformance?.percent ?? 0));
        const best = Math.max(bestSat, bestGraph);
        const label = bestSat >= bestGraph ? "SAT-style" : "graphing";
        return {
          profile: p,
          score: best,
          achievement: `${best}% on ${label} questions`,
        };
      })
      .filter((c) => c.score > 0)
  );

  // 6. Growth Mindset — most improvement on a previously weak topic
  pick("Growth Mindset", "Growth Mindset Award", "🌱",
    eligible
      .filter((p) => p.tests.length >= 2)
      .map((p) => {
        let bestGain = 0;
        let bestTopic = null;
        const allTopics = new Set(p.tests.flatMap((t) => (t.topicResults ?? []).map((r) => r.topic)));
        allTopics.forEach((topic) => {
          const scores = p.tests
            .map((t) => (t.topicResults ?? []).find((r) => r.topic === topic)?.percent)
            .filter((s) => s !== undefined);
          if (scores.length < 2) return;
          const earliest = scores[scores.length - 1];
          const latest = scores[0];
          const gain = latest - earliest;
          if (earliest < 70 && gain > bestGain) {
            bestGain = gain;
            bestTopic = topic;
          }
        });
        return {
          profile: p,
          score: bestGain,
          achievement: bestTopic ? `Turned ${bestTopic} from a struggle into a strength` : "",
        };
      })
      .filter((c) => c.score > 0 && c.achievement)
  );

  return awards;
}

function countStudyDays(profile) {
  const days = new Set();
  [...profile.tests, ...profile.practice, ...profile.worksheets].forEach((item) => {
    if (item?.date) days.add(item.date.slice(0, 10));
  });
  return days.size;
}

function computeStreak(profile) {
  const days = [
    ...new Set(profile.practice.filter((p) => p.date).map((p) => p.date.slice(0, 10))),
  ].sort().reverse();
  if (days.length === 0) return 0;
  let streak = 1;
  let current = new Date(days[0]);
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i]);
    const diff = Math.round((current - prev) / 86400000);
    if (diff === 1) { streak++; current = prev; } else break;
  }
  return streak;
}
