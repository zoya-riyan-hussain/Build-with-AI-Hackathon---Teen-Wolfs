import { Link } from "wouter";
import { useGetDashboardSummary, useGetCareerRecommendations, useGetPerformanceHistory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgress } from "@/components/circular-progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Trophy, Activity, Target, TrendingUp, ArrowRight, UserCircle, Sparkles, ChevronRight, TrendingDown, Minus, Zap } from "lucide-react";
import { format } from "date-fns";

function ImprovementBar({ earlyAvg, recentAvg, delta }: { earlyAvg: number; recentAvg: number; delta: number }) {
  const isUp = delta > 0;
  const isDown = delta < 0;
  const color = isUp ? "bg-emerald-500" : isDown ? "bg-red-400" : "bg-amber-400";
  const textColor = isUp ? "text-emerald-600" : isDown ? "text-red-500" : "text-amber-600";
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm flex items-center gap-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isUp ? "bg-emerald-100" : isDown ? "bg-red-100" : "bg-amber-100"}`}>
        <Icon className={`w-4.5 h-4.5 ${textColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress Over Time</p>
          <span className={`text-xs font-bold ${textColor}`}>
            {isUp ? "+" : ""}{delta}% {isUp ? "improvement" : isDown ? "regression" : "stable"}
          </span>
        </div>
        <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
          <div className="absolute left-0 top-0 h-full rounded-full bg-muted-foreground/20" style={{ width: `${earlyAvg}%` }} />
          <div className={`absolute left-0 top-0 h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${recentAvg}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">Early avg: {earlyAvg}%</span>
          <span className="text-[10px] text-muted-foreground">Recent avg: {recentAvg}%</span>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: careers, isLoading: careersLoading } = useGetCareerRecommendations({ query: { retry: false } } as Parameters<typeof useGetCareerRecommendations>[0]);
  const { data: performance } = useGetPerformanceHistory();

  const sorted = [...(performance || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const chartData = sorted.slice(-12).map((r) => ({
    name: format(new Date(r.date), "MMM d"),
    score: r.percentage,
    topic: r.topic,
  }));

  const mid = Math.floor(sorted.length / 2);
  const earlyRecords = sorted.slice(0, Math.max(mid, 1));
  const recentRecords = sorted.slice(mid);
  const earlyAvg = earlyRecords.length ? Math.round(earlyRecords.reduce((s, r) => s + r.percentage, 0) / earlyRecords.length) : 0;
  const recentAvg = recentRecords.length ? Math.round(recentRecords.reduce((s, r) => s + r.percentage, 0) / recentRecords.length) : 0;
  const delta = recentAvg - earlyAvg;

  if (summaryLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!summary?.hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5 shadow-sm">
          <UserCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Profile Yet</h2>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
          Create your profile to unlock personalized career recommendations and start tracking your performance.
        </p>
        <Link href="/profile">
          <Button size="lg" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Create Your Profile
          </Button>
        </Link>
      </div>
    );
  }

  const statCards = [
    { label: "Simulations", sublabel: "Completed", value: summary.totalSimulations, icon: Activity, iconColor: "text-blue-600", cardClass: "stat-card-blue" },
    { label: "Average", sublabel: "Score", value: `${summary.averageScore}%`, icon: Target, iconColor: "text-emerald-600", cardClass: "stat-card-emerald" },
    { label: "Personal", sublabel: "Best", value: `${summary.bestScore}%`, icon: Trophy, iconColor: "text-amber-600", cardClass: "stat-card-amber" },
    { label: "Career", sublabel: "Fit Score", value: `${summary.topCareerFit ?? 0}%`, icon: TrendingUp, iconColor: "text-violet-600", cardClass: "stat-card-violet" },
  ];

  const topCareer = careers?.[0];

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-2xl bg-sidebar text-sidebar-foreground overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(ellipse at 85% 40%, hsl(180,85%,42%) 0%, transparent 55%), radial-gradient(ellipse at 10% 80%, hsl(224,38%,20%) 0%, transparent 50%)"
        }} />
        <div className="relative px-7 py-6 flex items-start justify-between gap-6">
          <div>
            <p className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-semibold mb-1.5">Career Intelligence Platform</p>
            <h1 className="text-2xl font-bold text-sidebar-foreground leading-tight">
              Welcome back, {summary.profileName}
            </h1>
            <p className="text-sidebar-foreground/50 text-sm mt-1.5 max-w-sm leading-relaxed">
              {summary.totalSimulations > 0
                ? `${summary.totalSimulations} simulation${summary.totalSimulations !== 1 ? "s" : ""} completed · Your insights are personalized and up to date.`
                : "Your dashboard is ready. Complete a simulation to begin tracking your progress."}
            </p>
            {summary.totalSimulations > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <Zap className="w-3.5 h-3.5 text-sidebar-primary" />
                <span className="text-xs text-sidebar-primary font-semibold">
                  {recentAvg >= earlyAvg ? `+${delta}% improvement trend` : `${delta}% trend — time to refocus`}
                </span>
              </div>
            )}
          </div>

          {/* Career Fit Score Hero */}
          {topCareer && (
            <div className="flex-shrink-0 flex flex-col items-center gap-2 bg-white/5 rounded-2xl px-5 py-4 border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest font-semibold">Career Fit Score</p>
              <CircularProgress value={topCareer.fitPercentage} size={100} strokeWidth={9} />
              <p className="text-xs font-bold text-sidebar-primary text-center leading-tight mt-0.5">{topCareer.title}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className={`rounded-xl border p-5 shadow-sm ${card.cardClass}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center shadow-xs">
                <card.icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground/70">{card.sublabel}</span>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Improvement Progress Bar */}
      {sorted.length >= 2 && (
        <ImprovementBar earlyAvg={earlyAvg} recentAvg={recentAvg} delta={delta} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Career Fit Score Card */}
        <Card className="shadow-sm border-card-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Career Fit Score
              </CardTitle>
              {topCareer && (
                <Badge className="text-[10px] uppercase tracking-wide bg-sidebar text-sidebar-foreground border-0">
                  #{1} Match
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {careersLoading ? (
              <Skeleton className="h-44 rounded-lg" />
            ) : topCareer ? (
              <div className="flex flex-col items-center gap-3 pt-1 pb-2">
                <div className="relative">
                  <CircularProgress value={topCareer.fitPercentage} size={120} strokeWidth={10} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-base">{topCareer.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed max-w-[180px] mx-auto">
                    {topCareer.description}
                  </p>
                </div>
                {/* Matched skills mini-list */}
                {topCareer.matchedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {topCareer.matchedSkills.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-medium border border-emerald-200">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <Link href="/careers">
                  <Button variant="outline" size="sm" className="gap-1.5 w-full">
                    All Career Paths <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-3">Add skills to your profile to get matched</p>
                <Link href="/profile">
                  <Button variant="outline" size="sm">Update Profile</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Trend Chart */}
        <Card className="lg:col-span-2 shadow-sm border-card-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Score Trend
              </CardTitle>
              <Link href="/performance">
                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  Full history <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={chartData} margin={{ left: -20, right: 4 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="score" stroke="hsl(180,85%,42%)" strokeWidth={2.5} fill="url(#scoreGrad)"
                    dot={{ r: 3.5, fill: "hsl(180,85%,42%)", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Activity className="w-10 h-10 text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">No performance data yet</p>
                <Link href="/simulation">
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                    Start a Simulation <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {summary.recentActivity && summary.recentActivity.length > 0 && (
        <Card className="shadow-sm border-card-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recent Activity</CardTitle>
              <Link href="/performance">
                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="space-y-0.5">
              {summary.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.score >= 75 ? "bg-emerald-500" : activity.score >= 50 ? "bg-amber-500" : "bg-red-400"}`} />
                    <div>
                      <p className="font-medium text-sm">{activity.topic}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(activity.date), "MMM d, yyyy · h:mm a")}</p>
                    </div>
                  </div>
                  <Badge variant={activity.score >= 75 ? "default" : activity.score >= 50 ? "secondary" : "destructive"} className="text-xs font-bold">
                    {activity.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: "/simulation", icon: Activity, label: "Run a Simulation", sub: "Test your knowledge", color: "text-blue-500", bg: "bg-blue-50 border-blue-100" },
            { href: "/feedback", icon: TrendingUp, label: "Get AI Feedback", sub: "Strengths & suggestions", color: "text-violet-500", bg: "bg-violet-50 border-violet-100" },
            { href: "/careers", icon: Target, label: "Explore Careers", sub: "See your top matches", color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-100" },
          ].map(action => (
            <Link key={action.href} href={action.href}>
              <div className={`rounded-xl border p-4 flex items-center gap-3.5 cursor-pointer card-hover ${action.bg}`}>
                <div className="w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center shadow-xs flex-shrink-0">
                  <action.icon className={`w-4.5 h-4.5 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
