import { Router } from "express";
import { store, type PerformanceRecord } from "../store";
import { SubmitSimulationBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

router.get("/simulation/task", async (req, res): Promise<void> => {
  const task = store.getNextTask();
  const { correctAnswer: _omit, ...publicTask } = task;
  req.log.info({ taskId: task.id }, "Serving simulation task");
  res.json(publicTask);
});

router.post("/simulation/submit", async (req, res): Promise<void> => {
  const parsed = SubmitSimulationBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid submission body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { taskId, answer, timeTaken } = parsed.data;

  const task = store.simulationTasks.find(t => t.id === taskId);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const correct = answer.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase();
  const maxScore = 100;
  const baseScore = correct ? 100 : 0;

  const timeBonus = correct
    ? Math.max(0, Math.round(((task.timeLimit - timeTaken) / task.timeLimit) * 20))
    : 0;

  const difficultyMultiplier = task.difficulty === "Hard" ? 1.2 : task.difficulty === "Medium" ? 1.1 : 1.0;
  const rawScore = Math.min(Math.round((baseScore + timeBonus) * difficultyMultiplier), 120);
  const cappedMax = task.difficulty === "Hard" ? 120 : task.difficulty === "Medium" ? 110 : 100;
  const percentage = Math.round((rawScore / cappedMax) * 100);

  let feedback: string;
  if (correct && percentage >= 90) {
    feedback = "Excellent work! You answered correctly with great speed. Keep pushing your limits.";
  } else if (correct) {
    feedback = `Correct! The answer is "${task.correctAnswer}". Good understanding of ${task.topic}.`;
  } else {
    feedback = `Not quite — the correct answer is "${task.correctAnswer}". Review ${task.topic} fundamentals and try again.`;
  }

  const record: PerformanceRecord = {
    id: randomUUID(),
    taskId: task.id,
    taskTitle: task.title,
    score: rawScore,
    maxScore: cappedMax,
    percentage: Math.min(percentage, 100),
    timeTaken,
    date: new Date().toISOString(),
    topic: task.topic,
    difficulty: task.difficulty,
  };

  store.performanceRecords.unshift(record);

  req.log.info({ recordId: record.id, correct, score: rawScore }, "Simulation submitted");

  res.json({
    score: rawScore,
    maxScore: cappedMax,
    percentage: Math.min(percentage, 100),
    correct,
    feedback,
    timeTaken,
    recordId: record.id,
  });
});

export default router;
