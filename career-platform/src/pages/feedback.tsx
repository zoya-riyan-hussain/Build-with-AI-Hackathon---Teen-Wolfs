import { Link } from "wouter";
import { useGetAiFeedback } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertTriangle, Lightbulb, ArrowUpRight, MessageSquare, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";

function ScoreGauge({ value }: { value: number }) {
  const color = value >= 75 ? "#10B981" : value >= 50 ? "#F59E0B" : "#EF4444";
  const circumference = Math.PI * 52;
  const angle = (value / 100) * 180;
  const dashArray = `${(angle / 180) * circumference} ${circumference}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 h-24 overflow-visible">
        <svg viewBox="0 0 130 68" className="w-full h-full overflow-visible">
          <path d="M 13 65 A 52 52 0 0 1 117 65" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" strokeLinecap="round" />
          <path d="M 13 65 A 52 52 0 0 1 117 65" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={dashArray} style={{ transition: "stroke-dasharray 1s ease" }} />
          <text x="65" y="58" textAnchor="middle" fontSize="22" fontWeight="800" fill="hsl(var(--foreground))">{value}%</text>
        </svg>
      </div>
      <div className="text-center">
        <p className="font-bold text-base">
          {value >= 75 ? "Strong Performance" : value >= 50 ? "Developing Well" : "Early Stage"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Overall score across all simulations</p>
      </div>
    </div>
  );
}

export function Feedback() {
  const { data: feedback, isLoading, error } = useGetAiFeedback({
    query: { retry: false },
  } as Parameters<typeof useGetAiFeedback>[0]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-14 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Feedback</h1>
          <p className="text-muted-foreground mt-1 text-sm">Personalized analysis based on your performance.</p>
        </div>
        <div className="rounded-2xl border border-card-border bg-card p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-2">No Simulation Data Yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto leading-relaxed">
            Complete at least one simulation to get personalized AI analysis of your strengths and weaknesses.
          </p>
          <Link href="/simulation">
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" />
              Start Your First Simulation
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!feedback) return null;

  const trend = feedback.trend;
  const isUp = trend.direction === "up";
  const isDown = trend.direction === "down";
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const trendColor = isUp ? "text-emerald-600" : isDown ? "text-red-500" : "text-amber-600";
  const trendBg = isUp ? "bg-emerald-50 border-emerald-200" : isDown ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200";
  const trendBarFill = isUp ? "bg-emerald-500" : isDown ? "bg-red-400" : "bg-amber-400";
  const trendLabel = isUp
    ? `↑ ${Math.abs(trend.delta)}% improvement from early sessions`
    : isDown
      ? `↓ ${Math.abs(trend.delta)}% dip — consider refocusing your study strategy`
      : "Stable performance — consistent but room to push forward";

  const scoreColor = feedback.overallScore >= 75 ? "emerald" : feedback.overallScore >= 50 ? "amber" : "red";
  const scoreBg = scoreColor === "emerald" ? "from-emerald-50 to-teal-50 border-emerald-200"
    : scoreColor === "amber" ? "from-amber-50 to-orange-50 border-amber-200"
      : "from-red-50 to-pink-50 border-red-200";

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Feedback</h1>
          <p className="text-muted-foreground mt-1 text-sm">Rule-based analysis tailored to your simulation results.</p>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">AI-Generated</Badge>
      </div>

      {/* Score Hero */}
      <div className={`rounded-2xl border bg-gradient-to-br ${scoreBg} p-6 shadow-sm`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreGauge value={feedback.overallScore} />
          <div className="flex-1 text-center sm:text-left space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feedback.overallScore >= 75
                ? "You're performing at a high level. The data shows real competency in your key areas. Continue reinforcing strengths and targeting remaining gaps."
                : feedback.overallScore >= 50
                  ? "Good progress — you're building a solid foundation. Focused practice in your weak areas will accelerate your improvement significantly."
                  : "You're at the start of your learning journey. Every simulation you complete gives the AI more to work with. Consistent practice drives rapid improvement."}
            </p>
            <Link href="/simulation">
              <Button variant="outline" size="sm" className="gap-1.5">
                Run More Simulations <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Trend Bar */}
      <div className={`rounded-xl border ${trendBg} p-4 flex items-center gap-4`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isUp ? "bg-emerald-100" : isDown ? "bg-red-100" : "bg-amber-100"}`}>
          <TrendIcon className={`w-4.5 h-4.5 ${trendColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress Trend</p>
            <span className={`text-xs font-bold ${trendColor}`}>{isUp ? "+" : ""}{trend.delta}% overall</span>
          </div>
          <div className="relative h-2.5 rounded-full bg-black/5 overflow-hidden">
            <div className="absolute left-0 top-0 h-full rounded-full bg-black/10" style={{ width: `${trend.earlyAvg}%` }} />
            <div className={`absolute left-0 top-0 h-full rounded-full ${trendBarFill} transition-all duration-700`} style={{ width: `${trend.recentAvg}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">Early avg: {trend.earlyAvg}%</span>
            <span className="text-xs text-muted-foreground leading-relaxed">{trendLabel}</span>
            <span className="text-[10px] text-muted-foreground">Recent avg: {trend.recentAvg}%</span>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {feedback.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed text-foreground/80">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/60 to-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {feedback.weaknesses.map((weakness, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed text-foreground/80">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions */}
      <Card className="shadow-sm border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Actionable Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2.5">
            {feedback.suggestions.map((suggestion, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="shadow-sm border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-violet-600" />
            </div>
            Pro Tips for Advancement
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-3">
            {feedback.improvementTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed text-foreground/80">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
