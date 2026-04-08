import { Link } from "wouter";
import { useGetPerformanceHistory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { format } from "date-fns";
import { Clock, Target, Activity, Trophy, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

const DIFFICULTY_CONFIG: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Hard: "bg-red-100 text-red-700 border-red-200",
};

function scoreBarColor(pct: number) {
  if (pct >= 75) return "hsl(145, 58%, 45%)";
  if (pct >= 50) return "hsl(38, 95%, 52%)";
  return "hsl(0, 80%, 58%)";
}

export function Performance() {
  const { data: records, isLoading } = useGetPerformanceHistory();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance History</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track your progress across all simulations.</p>
        </div>
        <div className="rounded-2xl border border-card-border bg-card p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <Activity className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-2">No Simulations Yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto leading-relaxed">
            Complete your first simulation to start tracking your performance over time.
          </p>
          <Link href="/simulation">
            <Button className="gap-2">
              Start a Simulation <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const avg = Math.round(records.reduce((s, r) => s + r.percentage, 0) / records.length);
  const best = Math.max(...records.map(r => r.percentage));
  const totalTime = records.reduce((s, r) => s + r.timeTaken, 0);

  // Improvement trend
  const mid = Math.floor(sorted.length / 2);
  const earlyRecords = sorted.slice(0, Math.max(mid, 1));
  const recentRecords = sorted.slice(mid);
  const earlyAvg = Math.round(earlyRecords.reduce((s, r) => s + r.percentage, 0) / earlyRecords.length);
  const recentAvg = Math.round(recentRecords.reduce((s, r) => s + r.percentage, 0) / recentRecords.length);
  const delta = recentAvg - earlyAvg;
  const isUp = delta > 2;
  const isDown = delta < -2;

  // Topic chart
  const topicGroups: Record<string, number[]> = {};
  for (const r of records) {
    if (!topicGroups[r.topic]) topicGroups[r.topic] = [];
    topicGroups[r.topic].push(r.percentage);
  }
  const topicChartData = Object.entries(topicGroups).map(([topic, scores]) => ({
    topic: topic.length > 14 ? topic.slice(0, 14) + "…" : topic,
    avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    attempts: scores.length,
  })).sort((a, b) => b.avgScore - a.avgScore);

  // Line chart data
  const lineData = sorted.slice(-12).map((r) => ({
    name: format(new Date(r.date), "MMM d"),
    score: r.percentage,
    topic: r.topic,
  }));

  const statCards = [
    { label: "Average Score", value: `${avg}%`, icon: Target, cardClass: "stat-card-blue", iconColor: "text-blue-600" },
    { label: "Personal Best", value: `${best}%`, icon: Trophy, cardClass: "stat-card-amber", iconColor: "text-amber-600" },
    { label: "Time Practiced", value: `${Math.round(totalTime / 60)}m`, icon: Clock, cardClass: "stat-card-emerald", iconColor: "text-emerald-600" },
  ];

  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const trendColor = isUp ? "text-emerald-600" : isDown ? "text-red-500" : "text-amber-600";
  const trendBg = isUp ? "bg-emerald-100" : isDown ? "bg-red-100" : "bg-amber-100";
  const barFill = isUp ? "bg-emerald-500" : isDown ? "bg-red-400" : "bg-amber-400";
  const trendLabel = isUp ? `+${delta}% improvement` : isDown ? `${delta}% regression` : "Stable";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance History</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {records.length} simulation{records.length !== 1 ? "s" : ""} completed.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(card => (
          <div key={card.label} className={`rounded-xl border p-5 shadow-sm ${card.cardClass}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center shadow-xs">
                <card.icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Improvement Trend Bar */}
      <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm flex items-center gap-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${trendBg}`}>
          <TrendIcon className={`w-4.5 h-4.5 ${trendColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Improvement Over Time</p>
            <span className={`text-xs font-bold ${trendColor}`}>{trendLabel}</span>
          </div>
          <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
            <div className="absolute left-0 top-0 h-full rounded-full bg-muted-foreground/15" style={{ width: `${earlyAvg}%` }} />
            <div className={`absolute left-0 top-0 h-full rounded-full ${barFill} transition-all duration-700`} style={{ width: `${recentAvg}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">First {earlyRecords.length} session{earlyRecords.length !== 1 ? "s" : ""}: {earlyAvg}% avg</span>
            <span className="text-[10px] text-muted-foreground">Last {recentRecords.length} session{recentRecords.length !== 1 ? "s" : ""}: {recentAvg}% avg</span>
          </div>
        </div>
      </div>

      {/* Score Over Time */}
      <Card className="shadow-sm border-card-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Score Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={lineData} margin={{ left: -20, right: 4 }}>
              <defs>
                <linearGradient id="perf-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(180,85%,42%)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="hsl(180,85%,42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="transparent" tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="transparent" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                formatter={(v: number, _: string, props: { payload?: { topic?: string } }) => [`${v}%`, props.payload?.topic ?? "Score"]}
              />
              <Area type="monotone" dataKey="score" stroke="hsl(180,85%,42%)" strokeWidth={2.5} fill="url(#perf-grad)"
                dot={{ r: 3.5, fill: "hsl(180,85%,42%)", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Topic Breakdown Chart */}
      <Card className="shadow-sm border-card-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Average Score by Topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topicChartData} margin={{ left: -20, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="topic" tick={{ fontSize: 10 }} stroke="transparent" tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="transparent" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                formatter={(v: number, name: string) => [name === "avgScore" ? `${v}%` : v, name === "avgScore" ? "Avg Score" : "Attempts"]}
              />
              <Bar dataKey="avgScore" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {topicChartData.map((entry, i) => <Cell key={i} fill={scoreBarColor(entry.avgScore)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card className="shadow-sm border-card-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            All Simulations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="space-y-0.5">
            {[...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
              <div key={record.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${record.percentage >= 75 ? "bg-emerald-500" : record.percentage >= 50 ? "bg-amber-500" : "bg-red-400"}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{record.taskTitle}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{format(new Date(record.date), "MMM d, yyyy")}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${DIFFICULTY_CONFIG[record.difficulty] || "bg-muted text-muted-foreground border-border"}`}>
                        {record.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />{record.timeTaken}s
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="text-xs text-muted-foreground">{record.score}/{record.maxScore}</span>
                  <Badge variant={record.percentage >= 75 ? "default" : record.percentage >= 50 ? "secondary" : "destructive"}
                    className="text-xs font-bold min-w-[46px] justify-center">
                    {record.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
