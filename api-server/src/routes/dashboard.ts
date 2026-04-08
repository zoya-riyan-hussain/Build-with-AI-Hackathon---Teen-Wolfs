import { Router } from "express";
import { store } from "../store";

const router = Router();

function computeCareerScore(userSkills: string[], userInterests: string[], careerSkills: string[], careerTitle: string): number {
  const normalize = (s: string) => s.toLowerCase().trim();
  const normalizedUserSkills = userSkills.map(normalize);
  const normalizedUserInterests = userInterests.map(normalize);
  const normalizedRequired = careerSkills.map(normalize);
  const normalizedTitle = normalize(careerTitle);

  let score = 0;
  for (const skill of normalizedRequired) {
    if (normalizedUserSkills.some(us => us.includes(skill) || skill.includes(us))) score += 15;
  }
  for (const interest of normalizedUserInterests) {
    if (normalizedTitle.includes(interest) || interest.includes(normalizedTitle.split(" ")[0])) score += 10;
    for (const req of normalizedRequired) {
      if (req.includes(interest) || interest.includes(req)) score += 5;
    }
  }
  return Math.min(score, 100);
}

const TOP_CAREERS = [
  { title: "Software Engineer", skills: ["JavaScript", "Python", "Data Structures", "Algorithms", "Git", "Problem Solving"] },
  { title: "Data Scientist", skills: ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization", "R"] },
  { title: "Machine Learning Engineer", skills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Cloud Computing"] },
];

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const records = store.performanceRecords;
  const profile = store.profile;

  const totalSimulations = records.length;
  const averageScore = totalSimulations > 0
    ? Math.round(records.reduce((sum, r) => sum + r.percentage, 0) / totalSimulations)
    : 0;
  const bestScore = totalSimulations > 0
    ? Math.max(...records.map(r => r.percentage))
    : 0;

  const recentActivity = records.slice(0, 5).map(r => ({
    date: r.date,
    score: r.percentage,
    topic: r.topic,
  }));

  let topCareer: string | undefined;
  let topCareerFit: number | undefined;

  if (profile) {
    const scored = TOP_CAREERS.map(c => ({
      title: c.title,
      fit: computeCareerScore(profile.skills, profile.interests, c.skills, c.title),
    })).sort((a, b) => b.fit - a.fit);

    topCareer = scored[0].title;
    topCareerFit = scored[0].fit;
  }

  req.log.info({ totalSimulations, averageScore, topCareer }, "Returning dashboard summary");

  res.json({
    hasProfile: !!profile,
    profileName: profile?.name,
    totalSimulations,
    averageScore,
    bestScore,
    topCareer,
    topCareerFit,
    recentActivity,
  });
});

export default router;
