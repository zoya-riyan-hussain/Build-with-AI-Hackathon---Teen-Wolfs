import { useState, useEffect, useRef } from "react";
import { useGetSimulationTask, useSubmitSimulation } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, ChevronRight, RotateCcw, Zap, Code2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const DIFFICULTY_CONFIG: Record<string, { label: string; class: string; barColor: string }> = {
  Easy: { label: "Easy", class: "bg-emerald-100 text-emerald-700 border-emerald-200", barColor: "bg-emerald-500" },
  Medium: { label: "Medium", class: "bg-amber-100 text-amber-700 border-amber-200", barColor: "bg-amber-500" },
  Hard: { label: "Hard", class: "bg-red-100 text-red-700 border-red-200", barColor: "bg-red-500" },
};

const TYPE_CONFIG: Record<string, { icon: typeof HelpCircle; label: string }> = {
  quiz: { icon: HelpCircle, label: "Quiz" },
  coding: { icon: Code2, label: "Coding" },
};

export function Simulation() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: task, isLoading, refetch } = useGetSimulationTask();
  const submitSimulation = useSubmitSimulation();

  useEffect(() => {
    if (task && !submitted) {
      setTimeLeft(task.timeLimit);
      setTimeTaken(0);
      setSelectedAnswer(null);
      setAutoSubmitted(false);
    }
  }, [task]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { handleAutoSubmit(); return; }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        setTimeTaken(t => t + 1);
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, submitted]);

  const handleAutoSubmit = () => {
    if (submitted || !task) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setAutoSubmitted(true);
    setSubmitted(true);
    submitSimulation.mutate({ data: { taskId: task.id, answer: selectedAnswer || "__time_out__", timeTaken: task.timeLimit } });
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !task || submitted) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
    submitSimulation.mutate({ data: { taskId: task.id, answer: selectedAnswer, timeTaken } });
  };

  const handleNext = () => {
    setSubmitted(false);
    setSelectedAnswer(null);
    setTimeLeft(null);
    setTimeTaken(0);
    setAutoSubmitted(false);
    if (timerRef.current) clearInterval(timerRef.current);
    refetch();
  };

  const timePercent = task && timeLeft !== null ? (timeLeft / task.timeLimit) * 100 : 100;
  const isUrgent = timePercent < 30;
  const result = submitSimulation.data;
  const diffConfig = task ? DIFFICULTY_CONFIG[task.difficulty] : null;
  const typeConfig = task ? TYPE_CONFIG[task.type] : null;

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-2xl">
        <Card className="rounded-2xl">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground text-sm mb-4">No simulation available.</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Simulation</h1>
        <p className="text-muted-foreground mt-1 text-sm">Answer correctly and quickly to maximize your score.</p>
      </div>

      <div className={cn(
        "rounded-2xl border overflow-hidden shadow-sm",
        submitted && result?.correct ? "border-emerald-300" : submitted && !result?.correct ? "border-red-300" : "border-card-border"
      )}>
        {/* Timer bar at very top */}
        {!submitted && (
          <div className="h-1.5 bg-muted overflow-hidden">
            <div
              className={cn("h-full transition-all duration-1000 ease-linear", isUrgent ? "bg-red-500" : "bg-sidebar-primary")}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        )}
        {submitted && result?.correct && <div className="h-1.5 bg-emerald-400" />}
        {submitted && !result?.correct && <div className="h-1.5 bg-red-400" />}

        <div className="bg-card p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {typeConfig && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    <typeConfig.icon className="w-3 h-3" />
                    {typeConfig.label}
                  </span>
                )}
                {diffConfig && (
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md border ${diffConfig.class}`}>
                    {diffConfig.label}
                  </span>
                )}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {task.topic}
                </span>
              </div>
              <h2 className="text-lg font-bold">{task.title}</h2>
            </div>

            {/* Timer badge */}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono font-bold text-sm flex-shrink-0",
              isUrgent && !submitted
                ? "bg-red-100 text-red-600 border border-red-200"
                : "bg-muted text-muted-foreground border border-border"
            )}>
              <Clock className="w-3.5 h-3.5" />
              {timeLeft !== null ? `${timeLeft}s` : `${task.timeLimit}s`}
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>

          <div className="rounded-xl bg-muted/50 border border-border p-4">
            <p className="font-semibold text-sm leading-relaxed">{task.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {task.options.map((option, i) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = submitted && result?.correct && isSelected;
              const isWrong = submitted && !result?.correct && isSelected;
              const letters = ["A", "B", "C", "D"];

              return (
                <button
                  key={option}
                  disabled={submitted}
                  onClick={() => setSelectedAnswer(option)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 flex items-center gap-3",
                    "disabled:cursor-not-allowed",
                    isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-800",
                    isWrong && "border-red-400 bg-red-50 text-red-800",
                    isSelected && !submitted && "border-sidebar-primary/60 bg-sidebar-primary/5 text-foreground",
                    !isSelected && !submitted && "border-border bg-card hover:border-sidebar-primary/40 hover:bg-muted/40",
                    !isSelected && submitted && "opacity-40 border-border bg-card"
                  )}
                >
                  <span className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0",
                    isCorrect ? "bg-emerald-200 text-emerald-700"
                      : isWrong ? "bg-red-200 text-red-700"
                        : isSelected && !submitted ? "bg-sidebar-primary/20 text-sidebar-primary"
                          : "bg-muted text-muted-foreground"
                  )}>
                    {letters[i]}
                  </span>
                  <span className="flex-1">{option}</span>
                  {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                  {isWrong && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Auto-submit notice */}
          {autoSubmitted && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
              Time expired — submitted automatically.
            </div>
          )}

          {/* Result feedback */}
          {submitted && result && (
            <div className={cn(
              "rounded-xl border p-4 space-y-2",
              result.correct ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {result.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  {result.correct ? "Correct!" : "Incorrect"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {result.score}/{result.maxScore} pts
                  </span>
                  <Badge variant={result.percentage >= 75 ? "default" : "secondary"} className="text-xs font-bold">
                    {result.percentage}%
                  </Badge>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-foreground/80">{result.feedback}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            {!submitted ? (
              <Button
                className="flex-1"
                disabled={!selectedAnswer || submitSimulation.isPending}
                onClick={handleSubmit}
              >
                {submitSimulation.isPending ? "Submitting..." : "Submit Answer"}
              </Button>
            ) : (
              <Button className="flex-1 gap-2" onClick={handleNext}>
                Next Question <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {!submitted && (
              <Button variant="outline" size="icon" onClick={handleNext} title="Skip">
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
