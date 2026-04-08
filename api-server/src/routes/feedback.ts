import { Router } from "express";
import { store } from "../store";

const router = Router();

const TOPIC_ADVICE: Record<string, { study: string; resource: string }> = {
  "Data Structures": {
    study: "Focus on trees, graphs, and hash maps — the most frequently tested topics in technical interviews.",
    resource: "Practice on LeetCode's data structures track and review 'Cracking the Coding Interview'.",
  },
  "Algorithms": {
    study: "Strengthen your understanding of sorting algorithms and dynamic programming patterns.",
    resource: "Visualize algorithms with VisuAlgo.net and work through NeetCode's roadmap systematically.",
  },
  "Python": {
    study: "Master list comprehensions, generators, and built-in functions like map, filter, and zip.",
    resource: "Work through 'Fluent Python' and practice daily on Exercism.io to build idiomatic habits.",
  },
  "Machine Learning": {
    study: "Build intuition for bias-variance tradeoff, regularization, and model evaluation metrics.",
    resource: "Revisit Andrew Ng's ML course on Coursera and implement models from scratch in a notebook.",
  },
  "Databases": {
    study: "Drill window functions, CTEs, and query optimization — these separate junior from senior engineers.",
    resource: "Practice on SQLZoo and Mode Analytics, then benchmark your queries with EXPLAIN ANALYZE.",
  },
};

router.get("/feedback", async (req, res): Promise<void> => {
  const records = store.performanceRecords;

  if (records.length === 0) {
    res.status(404).json({ error: "No performance data found. Complete at least one simulation first." });
    return;
  }

  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const avgScore = Math.round(records.reduce((s, r) => s + r.percentage, 0) / records.length);

  // Trend analysis: compare first half vs second half
  const mid = Math.floor(sorted.length / 2);
  const earlyAvg = sorted.slice(0, Math.max(mid, 1)).reduce((s, r) => s + r.percentage, 0) / Math.max(mid, 1);
  const recentAvg = sorted.slice(mid).reduce((s, r) => s + r.percentage, 0) / sorted.slice(mid).length;
  const improving = recentAvg > earlyAvg + 3;
  const declining = recentAvg < earlyAvg - 3;
  const trendDelta = Math.round(recentAvg - earlyAvg);

  // Per-topic analysis
  const topicScores: Record<string, number[]> = {};
  const topicTimes: Record<string, number[]> = {};
  for (const r of records) {
    if (!topicScores[r.topic]) { topicScores[r.topic] = []; topicTimes[r.topic] = []; }
    topicScores[r.topic].push(r.percentage);
    topicTimes[r.topic].push(r.timeTaken);
  }
  const topicAverages = Object.entries(topicScores).map(([topic, scores]) => ({
    topic,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    count: scores.length,
    avgTime: Math.round(topicTimes[topic].reduce((a, b) => a + b, 0) / topicTimes[topic].length),
  })).sort((a, b) => b.avg - a.avg);

  const strongTopics = topicAverages.filter(t => t.avg >= 70);
  const weakTopics = topicAverages.filter(t => t.avg < 58);
  const bestTopic = topicAverages[0];
  const worstTopic = topicAverages[topicAverages.length - 1];

  // Difficulty breakdown
  const hardRecords = records.filter(r => r.difficulty === "Hard");
  const hardAvg = hardRecords.length ? Math.round(hardRecords.reduce((s, r) => s + r.percentage, 0) / hardRecords.length) : null;
  const easyRecords = records.filter(r => r.difficulty === "Easy");
  const easyAvg = easyRecords.length ? Math.round(easyRecords.reduce((s, r) => s + r.percentage, 0) / easyRecords.length) : null;

  // Speed analysis
  const fastCompletions = records.filter(r => r.timeTaken < 30).length;
  const slowCompletions = records.filter(r => r.timeTaken > 100).length;

  // Streak analysis
  const recentRecords = sorted.slice(-3);
  const recentUpward = recentRecords.length >= 2 &&
    recentRecords[recentRecords.length - 1].percentage > recentRecords[0].percentage;

  // Profile skill gap analysis
  const profileSkills = (store.profile?.skills || []).map(s => s.toLowerCase());
  const industryKeySkills = ["git", "docker", "aws", "linux", "cloud computing", "system design"];
  const missingKeySkills = industryKeySkills.filter(s => !profileSkills.some(p => p.includes(s)));

  // Build feedback
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  const improvementTips: string[] = [];

  // --- Strengths ---
  if (improving) {
    strengths.push(`Clear upward trajectory — your average has risen ${trendDelta} points since you started. This kind of consistency compounds fast.`);
  }
  if (recentUpward && !improving) {
    strengths.push("Your last 3 sessions show an upward trend — you're building momentum at exactly the right time.");
  }
  if (strongTopics.length > 0) {
    const names = strongTopics.map(t => t.topic).join(", ");
    strengths.push(`Solid command of ${names} — scoring ${strongTopics[0].avg}% average. This is a genuine asset for roles in your target area.`);
  }
  if (avgScore >= 75) {
    strengths.push("Top-quartile overall performance. You're demonstrating the kind of consistency employers look for.");
  }
  if (hardAvg !== null && hardAvg >= 60) {
    strengths.push(`You handle Hard-difficulty questions at ${hardAvg}% — a strong signal that you perform under pressure.`);
  }
  if (fastCompletions >= 2) {
    strengths.push("Multiple fast, accurate completions indicate strong pattern recognition — you're not just guessing.");
  }
  if (easyAvg !== null && easyAvg >= 85) {
    strengths.push("Near-perfect accuracy on foundational material — your base knowledge is solid.");
  }
  if (strengths.length === 0) {
    strengths.push("Showing up consistently and attempting every question — that willingness to engage is the foundation of all improvement.");
    strengths.push("Your early attempts give the system real data to work with. Every session calibrates your recommendations better.");
  }

  // --- Weaknesses ---
  if (declining) {
    weaknesses.push(`Scores have dipped ${Math.abs(trendDelta)} points recently. This usually signals fatigue or over-reliance on one study strategy — time to mix it up.`);
  }
  if (weakTopics.length > 0) {
    weaknesses.push(`${worstTopic.topic} is your lowest-scoring area at ${worstTopic.avg}% average. Targeted practice here will have the highest ROI on your overall score.`);
    if (weakTopics.length > 1) {
      weaknesses.push(`Secondary gaps in ${weakTopics.slice(1).map(t => t.topic).join(", ")} — enough to notice in technical interviews. Worth a focused sprint.`);
    }
  }
  if (avgScore < 60) {
    weaknesses.push("Overall accuracy below 60% suggests foundational gaps in multiple areas. Starting with structured learning before more simulations will be more effective.");
  }
  if (hardAvg !== null && hardAvg < 50) {
    weaknesses.push(`Hard questions are averaging only ${hardAvg}% — focus on Medium difficulty to close the conceptual gaps before tackling Hard-level problems.`);
  }
  if (slowCompletions >= 2) {
    weaknesses.push("Several responses took over 100 seconds. Under-timed answers in interviews can cost you — practice for speed alongside accuracy.");
  }
  if (!improving && !declining && records.length >= 5) {
    weaknesses.push("Progress has plateaued — your score band has stayed flat for several sessions. This is the right time to change study strategy, not work harder on the same approach.");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("Limited data to identify specific weak areas — more simulations will give sharper diagnostics.");
  }

  // --- Suggestions ---
  if (weakTopics.length > 0) {
    const worst = weakTopics[0];
    const advice = TOPIC_ADVICE[worst.topic];
    if (advice) {
      suggestions.push(`For ${worst.topic}: ${advice.study}`);
      suggestions.push(advice.resource);
    } else {
      suggestions.push(`Dedicate 3 focused sessions this week specifically to ${worst.topic} before attempting more simulations.`);
    }
  }
  if (avgScore >= 60 && avgScore < 80) {
    suggestions.push("You're in the 60–80% zone — the fastest path forward is reviewing every wrong answer with a 'why' mindset, not just checking the correct option.");
  }
  if (hardAvg !== null && hardAvg < 60) {
    suggestions.push("Work through Medium questions first and aim for 80%+ before advancing to Hard — a stronger foundation makes Hard problems significantly more accessible.");
  }
  suggestions.push("Space your simulations across multiple days rather than clustering them — spaced repetition has a 40% better retention outcome than cramming.");
  if (records.length < 5) {
    suggestions.push("Complete at least 10 total simulations to get a reliable picture of your strengths. Early data is noisy — more samples sharpen the signal.");
  }

  // --- Tips ---
  if (bestTopic) {
    const advice = TOPIC_ADVICE[bestTopic.topic];
    improvementTips.push(`You're strongest in ${bestTopic.topic} — use this as your anchor topic to build interview confidence while developing other areas.`);
    if (advice) improvementTips.push(advice.resource);
  }
  if (missingKeySkills.length > 0) {
    improvementTips.push(`Key industry skills missing from your profile: ${missingKeySkills.slice(0, 2).join(" and ")}. Even a basic working knowledge of these will stand out on a resume.`);
  }
  if (store.profile?.academicYear === "Junior" || store.profile?.academicYear === "Sophomore") {
    improvementTips.push("Start building a portfolio of 2–3 projects that directly apply your strongest skills. Recruiters spend more time on GitHub than resumes.");
  }
  if (store.profile?.academicYear === "Senior" || store.profile?.academicYear === "Graduate") {
    improvementTips.push("At your stage, systems design knowledge separates candidates. Study distributed systems fundamentals and practice designing real-world architectures.");
  }
  improvementTips.push("Set a weekly goal: one simulation per topic area. Variety across topics prevents the false confidence of drilling a single subject.");
  improvementTips.push("Track your improvement delta week-over-week, not just your absolute score — a +5% week is meaningful progress even at lower baselines.");

  req.log.info({ avgScore, improving, trendDelta, strongTopics: strongTopics.map(t => t.topic), weakTopics: weakTopics.map(t => t.topic) }, "Returning AI feedback");

  res.json({
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    suggestions: suggestions.slice(0, 4),
    overallScore: avgScore,
    improvementTips: improvementTips.slice(0, 4),
    trend: {
      direction: improving ? "up" : declining ? "down" : "flat",
      delta: trendDelta,
      earlyAvg: Math.round(earlyAvg),
      recentAvg: Math.round(recentAvg),
    },
  });
});

export default router;
