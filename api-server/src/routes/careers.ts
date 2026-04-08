import { Router } from "express";
import { store } from "../store";

const router = Router();

const CAREER_DATABASE = [
  {
    title: "Software Engineer",
    description: "Design, develop, and maintain software systems and applications across a variety of domains.",
    requiredSkills: ["JavaScript", "Python", "Data Structures", "Algorithms", "Git", "Problem Solving"],
    salaryRange: "$95,000 – $185,000",
    growthRate: "+25% by 2030",
  },
  {
    title: "Data Scientist",
    description: "Analyze complex datasets to extract insights, build predictive models, and inform business decisions.",
    requiredSkills: ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization", "R"],
    salaryRange: "$100,000 – $175,000",
    growthRate: "+36% by 2030",
  },
  {
    title: "Machine Learning Engineer",
    description: "Build and deploy machine learning pipelines and AI systems at scale.",
    requiredSkills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Cloud Computing"],
    salaryRange: "$130,000 – $220,000",
    growthRate: "+40% by 2030",
  },
  {
    title: "Product Manager",
    description: "Define product vision, strategy, and roadmap; bridge technical teams with business stakeholders.",
    requiredSkills: ["Communication", "Leadership", "Problem Solving", "Agile", "User Research", "Analytics"],
    salaryRange: "$110,000 – $190,000",
    growthRate: "+10% by 2030",
  },
  {
    title: "UX Designer",
    description: "Create intuitive, beautiful user experiences through research, prototyping, and design systems.",
    requiredSkills: ["Design", "User Research", "Figma", "Prototyping", "Communication", "Empathy"],
    salaryRange: "$80,000 – $145,000",
    growthRate: "+13% by 2030",
  },
  {
    title: "Cybersecurity Analyst",
    description: "Protect systems and networks from cyber threats through monitoring, analysis, and incident response.",
    requiredSkills: ["Networking", "Linux", "Security", "Python", "Risk Analysis", "Problem Solving"],
    salaryRange: "$85,000 – $155,000",
    growthRate: "+35% by 2030",
  },
  {
    title: "Cloud Architect",
    description: "Design and manage scalable cloud infrastructure solutions for enterprise systems.",
    requiredSkills: ["AWS", "Cloud Computing", "Networking", "DevOps", "Docker", "Kubernetes"],
    salaryRange: "$140,000 – $230,000",
    growthRate: "+28% by 2030",
  },
  {
    title: "DevOps Engineer",
    description: "Bridge development and operations with CI/CD pipelines, infrastructure automation, and reliability engineering.",
    requiredSkills: ["Linux", "Docker", "Kubernetes", "Git", "Python", "DevOps"],
    salaryRange: "$110,000 – $185,000",
    growthRate: "+22% by 2030",
  },
  {
    title: "Business Analyst",
    description: "Translate business needs into technical requirements and help organizations make data-driven decisions.",
    requiredSkills: ["SQL", "Analytics", "Communication", "Excel", "Problem Solving", "Statistics"],
    salaryRange: "$70,000 – $120,000",
    growthRate: "+11% by 2030",
  },
  {
    title: "Research Scientist",
    description: "Conduct original research to advance knowledge in computer science, AI, or related fields.",
    requiredSkills: ["Machine Learning", "Statistics", "Python", "R", "Mathematics", "Research"],
    salaryRange: "$120,000 – $200,000",
    growthRate: "+20% by 2030",
  },
];

function computeScore(userSkills: string[], userInterests: string[], careerRequiredSkills: string[], careerTitle: string): number {
  const normalize = (s: string) => s.toLowerCase().trim();
  const normalizedUserSkills = userSkills.map(normalize);
  const normalizedUserInterests = userInterests.map(normalize);
  const normalizedRequired = careerRequiredSkills.map(normalize);
  const normalizedTitle = normalize(careerTitle);

  let score = 0;

  for (const skill of normalizedRequired) {
    if (normalizedUserSkills.some(us => us.includes(skill) || skill.includes(us))) {
      score += 15;
    }
  }

  for (const interest of normalizedUserInterests) {
    if (normalizedTitle.includes(interest) || interest.includes(normalizedTitle.split(" ")[0])) {
      score += 10;
    }
    for (const required of normalizedRequired) {
      if (required.includes(interest) || interest.includes(required)) {
        score += 5;
      }
    }
  }

  return Math.min(score, 100);
}

router.get("/careers/recommendations", async (req, res): Promise<void> => {
  if (!store.profile) {
    res.status(404).json({ error: "Profile not found. Please create a profile first." });
    return;
  }

  const { skills, interests } = store.profile;

  const scored = CAREER_DATABASE.map(career => {
    const raw = computeScore(skills, interests, career.requiredSkills, career.title);
    const matchedSkills = career.requiredSkills.filter(rs =>
      skills.some(us => us.toLowerCase().includes(rs.toLowerCase()) || rs.toLowerCase().includes(us.toLowerCase()))
    );

    return {
      ...career,
      score: raw,
      fitPercentage: Math.round((raw / 100) * 100),
      matchedSkills,
    };
  });

  const top3 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  req.log.info({ count: top3.length }, "Returning career recommendations");
  res.json(top3);
});

export default router;
