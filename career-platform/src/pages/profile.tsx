import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetProfile, useSaveProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Plus, User, Lightbulb, GraduationCap, Sparkles } from "lucide-react";

const ACADEMIC_YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Other"] as const;

const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "Java", "C++", "SQL", "Machine Learning", "Data Structures",
  "Algorithms", "React", "Node.js", "Git", "Docker", "AWS", "Linux", "Statistics",
  "Deep Learning", "Communication", "Leadership", "Problem Solving", "Research"
];

const INTEREST_SUGGESTIONS = [
  "Software Engineering", "Data Science", "Machine Learning", "Cybersecurity",
  "Product Management", "UX Design", "Cloud Computing", "DevOps", "Research",
  "Business Analytics", "Mobile Development", "Blockchain", "Robotics"
];

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  academicYear: z.enum(["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Other"]),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function Profile() {
  const [, navigate] = useLocation();
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const { data: existingProfile, isLoading } = useGetProfile({
    query: {
      retry: false,
      onSuccess: (data: { skills: string[]; interests: string[]; name: string; academicYear: string }) => {
        setSkills(data.skills || []);
        setInterests(data.interests || []);
      },
    },
  } as Parameters<typeof useGetProfile>[0]);

  const saveProfile = useSaveProfile();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: existingProfile
      ? { name: existingProfile.name, academicYear: existingProfile.academicYear as typeof ACADEMIC_YEARS[number] }
      : undefined,
  });

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
    }
    setSkillInput("");
  };

  const addInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests(prev => [...prev, trimmed]);
    }
    setInterestInput("");
  };

  const removeSkill = (skill: string) => setSkills(prev => prev.filter(s => s !== skill));
  const removeInterest = (interest: string) => setInterests(prev => prev.filter(i => i !== interest));

  const onSubmit = async (data: ProfileFormData) => {
    await saveProfile.mutateAsync({
      data: { ...data, skills, interests },
    });
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isEditing = !!existingProfile;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Update Your Profile" : "Build Your Profile"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditing
            ? "Keep your skills and interests current for better career matching."
            : "Tell us about yourself to get personalized career recommendations and insights."}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select
                value={form.watch("academicYear")}
                onValueChange={(v) => form.setValue("academicYear", v as typeof ACADEMIC_YEARS[number])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your academic year" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.academicYear && (
                <p className="text-sm text-destructive">{form.formState.errors.academicYear.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4" />
              Skills
            </CardTitle>
            <CardDescription>Add skills you've developed or are currently learning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => addSkill(skillInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge key={skill} className="gap-1 pr-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Suggestions</p>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="text-xs px-2 py-1 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-4 h-4" />
              Career Interests
            </CardTitle>
            <CardDescription>What fields excite you?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type an interest and press Enter"
                value={interestInput}
                onChange={e => setInterestInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { e.preventDefault(); addInterest(interestInput); }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => addInterest(interestInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <Badge key={interest} variant="secondary" className="gap-1 pr-1">
                  {interest}
                  <button type="button" onClick={() => removeInterest(interest)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Suggestions</p>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_SUGGESTIONS.filter(i => !interests.includes(i)).slice(0, 8).map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => addInterest(i)}
                    className="text-xs px-2 py-1 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    + {i}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {skills.length} skills · {interests.length} interests
            </span>
          </div>
          <Button
            type="submit"
            disabled={saveProfile.isPending || skills.length === 0}
          >
            {saveProfile.isPending ? "Saving..." : isEditing ? "Update Profile" : "Create Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
