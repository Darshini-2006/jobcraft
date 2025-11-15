'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingDown, Book, BarChart, CheckCircle, User as UserIcon, GraduationCap, ArrowUpRight, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChartContainer } from '@/components/ui/chart';
import { PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import Link from 'next/link';
import { useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'sessions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [firestore, user]);
  const { data: sessions, isLoading: sessionsLoading } = useCollection(sessionsQuery);

  const skillGapsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'skill_gaps'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
  }, [firestore, user]);
  const { data: skillGaps, isLoading: skillGapsLoading } = useCollection(skillGapsQuery);
  const latestSkillGap = skillGaps?.[0];

  const userQuery = useMemoFirebase(() => {
     if (!user) return null;
     return query(collection(firestore, 'users'), where('id', '==', user.uid));
  }, [firestore, user]);
  const { data: userData, isLoading: userDataLoading } = useCollection(userQuery);
  const userProfile = userData?.[0];

  const isLoading = isUserLoading || sessionsLoading || skillGapsLoading || userDataLoading;

  const getWeakestSkill = () => {
    if (!sessions || sessions.length === 0) return { name: 'N/A', score: 0 };

    const allSkillScores: { [key: string]: number[] } = {};
    sessions.forEach(session => {
      if (session.skillScores) {
        Object.entries(session.skillScores).forEach(([skill, score]) => {
          if (!allSkillScores[skill]) {
            allSkillScores[skill] = [];
          }
          allSkillScores[skill].push(score as number);
        });
      }
    });

    let weakestSkill = { name: 'N/A', score: 100 };
    Object.entries(allSkillScores).forEach(([skill, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < weakestSkill.score) {
        weakestSkill = { name: skill, score: Math.round(avg) };
      }
    });

    return weakestSkill.score === 100 ? { name: 'N/A', score: 0 } : weakestSkill;
  };

  const weakestSkill = getWeakestSkill();

  const ReadinessScoreLoading = () => (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Job Readiness</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center pb-2">
        <div className="animate-pulse text-4xl font-bold text-muted-foreground">...</div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-0">
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-muted rounded w-full animate-pulse" />
      </CardFooter>
    </Card>
  );

  const ReadinessScoreCard = ({ score }: { score: number }) => {
    const chartData = [{ value: score }];
    const getStatus = () => {
      if (score >= 80) return { text: 'Ready', className: 'text-green-500' };
      if (score >= 50) return { text: 'Improving', className: 'text-yellow-500' };
      return { text: 'Needs Work', className: 'text-red-500' };
    };
    const status = getStatus();
    const fillColor = `hsl(var(--${score >= 80 ? 'primary' : score >= 50 ? 'chart-4' : 'destructive'}))`;

    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Job Readiness</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <ChartContainer config={{}} className="mx-auto aspect-square w-full max-w-[200px]">
            <RadialBarChart
              data={chartData}
              startAngle={-90}
              endAngle={270}
              innerRadius={60}
              outerRadius={85}
              barSize={10}
              dataKey="value"
            >
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} domain={[0, 100]} />
              <RadialBar dataKey="value" background cornerRadius={10} style={{ fill: fillColor }} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground">
                <tspan dy="-0.3em" className="text-3xl font-bold">{score}%</tspan>
                <tspan x="50%" dy="1.3em" className={cn("text-sm font-medium", status.className)}>{status.text}</tspan>
              </text>
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-1 text-xs pt-0 text-center">
          <p className="text-muted-foreground">
            Score ≥ 80% is interview-ready
          </p>
        </CardFooter>
      </Card>
    );
  };

  const RecentSessionsLoading = () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Interview Sessions</CardTitle>
        <CardDescription>Your most recent mock interview practice sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
              </div>
              <div className="h-8 bg-muted rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  type Session = {
    id: string;
    jobDescriptionId: string;
    createdAt: { seconds: number };
    overallScore: number;
    difficulty: string;
  };

  const RecentSessionsCard = ({ sessions }: { sessions: Session[] }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>Recent Interview Sessions</CardTitle>
          <CardDescription>Your most recent mock interview practice sessions</CardDescription>
        </div>
        <Button asChild size="sm" variant="ghost" className="gap-1">
          <Link href="#">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Role</TableHead>
              <TableHead className="hidden md:table-cell">Difficulty</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <BarChart className="h-8 w-8 opacity-50" />
                    <p>No interview sessions yet</p>
                    <p className="text-xs">Start your first mock interview to see results here</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sessions.map(session => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="font-medium truncate max-w-[200px]">{session.jobDescriptionId}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge className="text-xs" variant={session.difficulty === 'Hard' ? 'destructive' : session.difficulty === 'Medium' ? 'secondary' : 'default'}>
                      {session.difficulty || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {new Date(session.createdAt.seconds * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{session.overallScore || 0}%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/interview/summary/${session.id}`}>
                        <BarChart2 className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const SkillGapsLoading = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Skill Gap Analysis</CardTitle>
        <CardDescription>Loading analysis...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded w-16 animate-pulse" />
              <div className="h-6 bg-muted rounded w-20 animate-pulse" />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded w-20 animate-pulse" />
              <div className="h-6 bg-muted rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  type SkillGap = {
    matchedSkills: string[];
    missingSkills: string[];
    jobDescriptionId?: string;
  };

  const SkillGapsCard = ({ skillGap }: { skillGap: SkillGap | undefined }) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Skill Gap Analysis</CardTitle>
        <CardDescription>
          {skillGap?.jobDescriptionId ? `For "${skillGap.jobDescriptionId}"` : 'No analysis performed yet'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Matched Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(skillGap?.matchedSkills || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No matched skills yet</p>
              ) : (
                (skillGap?.matchedSkills || []).map(skill => (
                  <Badge key={skill} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50">
                    {skill}
                  </Badge>
                ))
              )}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-red-500" />
              Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(skillGap?.missingSkills || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No missing skills identified</p>
              ) : (
                (skillGap?.missingSkills || []).map(skill => (
                  <Badge key={skill} variant="destructive">{skill}</Badge>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!</h1>
        <p className="text-muted-foreground">Track your progress and continue your interview preparation journey</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Button asChild size="lg" className="h-auto py-4 justify-start">
          <Link href="/analysis/new">
            <BarChart className="mr-2 h-5 w-5 flex-shrink-0" />
            <span>Start New Analysis</span>
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-auto py-4 justify-start">
          <Link href="/resume/edit">
            <Target className="mr-2 h-5 w-5 flex-shrink-0" />
            <span>Edit Resume</span>
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-auto py-4 justify-start sm:col-span-2 lg:col-span-1">
          <Link href="/analysis/new">
            <Book className="mr-2 h-5 w-5 flex-shrink-0" />
            <span>Add Job Description</span>
          </Link>
        </Button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Stats and Sessions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <ReadinessScoreLoading />
            ) : (
              <ReadinessScoreCard score={userProfile?.readinessScore || 0} />
            )}
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Skill Gaps
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 bg-muted rounded w-1/2 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-full animate-pulse" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">{latestSkillGap?.missingSkills?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Skills to develop
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Weakest Area
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-full animate-pulse" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold truncate">{weakestSkill.name}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {weakestSkill.score}% avg score
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Total Sessions
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-full animate-pulse" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">{sessions?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Sessions */}
          {isLoading ? (
            <RecentSessionsLoading />
          ) : (
            <RecentSessionsCard sessions={sessions || []} />
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <Separator />
                  <div className="h-4 bg-muted rounded w-full animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-semibold text-lg">{user?.displayName || 'Jane Doe'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email || 'jane.doe@example.com'}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sessions:</span>
                      <span className="font-medium">{sessions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Active:</span>
                      <span className="font-medium">{sessions?.[0]?.createdAt ? new Date(sessions[0].createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Skill Gaps */}
          {isLoading ? <SkillGapsLoading /> : <SkillGapsCard skillGap={latestSkillGap} />}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Start a new analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Complete a mock interview</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Review your learning path</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Get ready for your interview!</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}