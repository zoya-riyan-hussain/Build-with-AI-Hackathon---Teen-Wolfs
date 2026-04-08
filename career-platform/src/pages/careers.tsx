import { Link } from "wouter";
import { useGetCareerRecommendations } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgress } from "@/components/circular-progress";
import { DollarSign, TrendingUp, CheckCircle2, PlusCircle, UserCircle, Trophy } from "lucide-react";

export function Careers() {
  const { data: careers, isLoading, error } = useGetCareerRecommendations({
    query: { retry: false },
  } as Parameters<typeof useGetCareerRecommendations>[0]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-56 rounded-lg" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-60 rounded-xl" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
          <UserCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Profile Required</h2>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
          Career recommendations are personalized to your skills and interests. Create your profile first.
        </p>
        <Link href="/profile">
          <Button>Create Profile</Button>
        </Link>
      </div>
    );
  }

  const rankConfig = [
    { label: "Top Match", bg: "bg-amber-400", ring: "ring-amber-200", gradient: "from-amber-50 to-orange-50", border: "border-amber-200" },
    { label: "Strong Match", bg: "bg-slate-400", ring: "ring-slate-200", gradient: "from-slate-50 to-gray-50", border: "border-slate-200" },
    { label: "Good Match", bg: "bg-orange-700", ring: "ring-orange-200", gradient: "from-orange-50/40 to-amber-50/30", border: "border-orange-200" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Career Recommendations</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Ranked by career fit — based on your skills and interests.
        </p>
      </div>

      {careers && careers.length > 0 ? (
        <div className="space-y-4">
          {careers.map((career, index) => {
            const rank = rankConfig[index];
            return (
              <div
                key={career.title}
                className={`rounded-2xl border overflow-hidden shadow-sm ${rank.border} bg-gradient-to-br ${rank.gradient}`}
              >
                {/* Card Header accent bar */}
                {index === 0 && (
                  <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300" />
                )}

                <div className="p-6">
                  <div className="flex items-start gap-5">
                    {/* Left: rank + circular score */}
                    <div className="flex flex-col items-center gap-2.5 flex-shrink-0">
                      <div className={`w-7 h-7 rounded-full ${rank.bg} ring-2 ${rank.ring} flex items-center justify-center`}>
                        {index === 0 ? (
                          <Trophy className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <span className="text-white font-bold text-xs">#{index + 1}</span>
                        )}
                      </div>
                      <CircularProgress value={career.fitPercentage} size={84} strokeWidth={7} />
                    </div>

                    {/* Right: main content */}
                    <div className="flex-1 min-w-0 space-y-4">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-xl font-bold leading-tight">{career.title}</h2>
                          <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{career.description}</p>
                        </div>
                        {index === 0 && (
                          <Badge className="flex-shrink-0 bg-amber-500 hover:bg-amber-500 text-white border-0 text-[10px] uppercase tracking-wide">
                            Top Match
                          </Badge>
                        )}
                      </div>

                      {/* Match score bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Match Score</span>
                          <span className="text-xs font-bold">{career.score}/100</span>
                        </div>
                        <div className="h-2 rounded-full bg-black/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${career.score}%`,
                              background: index === 0
                                ? "linear-gradient(90deg, #f59e0b, #f97316)"
                                : "linear-gradient(90deg, hsl(180,85%,42%), hsl(180,85%,35%))"
                            }}
                          />
                        </div>
                      </div>

                      {/* Skills grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> You Have
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {career.matchedSkills.length > 0 ? (
                              career.matchedSkills.map(skill => (
                                <span key={skill} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-medium border border-emerald-200">
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">Add skills to your profile</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1">
                            <PlusCircle className="w-3 h-3" /> To Develop
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {career.requiredSkills
                              .filter(s => !career.matchedSkills.includes(s))
                              .slice(0, 4)
                              .map(skill => (
                                <span key={skill} className="text-[11px] px-2 py-0.5 rounded-md bg-white/70 text-muted-foreground font-medium border border-border">
                                  {skill}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Salary + growth */}
                      <div className="flex items-center gap-5 pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <span className="text-sm font-semibold">{career.salaryRange}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-sm text-muted-foreground">{career.growthRate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground text-sm">No career recommendations available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
