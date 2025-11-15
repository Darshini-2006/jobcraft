'use client';

import { ReadinessScore } from '@/components/dashboard/readiness-score';
import { RecentSessions } from '@/components/dashboard/recent-sessions';
import { SkillGaps } from '@/components/dashboard/skill-gaps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingDown, Book, BarChart, CheckCircle, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';

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
     // This is not a real collection but using it to get user profile data
     // A better way would be to have a /users/{userId} doc
     return query(collection(firestore, 'users'), where('id', '==', user.uid));
  }, [firestore, user]);
  // Note: This is a placeholder for fetching full user profile.
  // In a real app, you'd fetch the user doc directly.
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

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
      {/* Main Column */}
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 xl:col-span-3">
        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
            <Button asChild size="lg" className="h-auto py-4 text-base">
                <Link href="/analysis/new">
                    <BarChart className="mr-3 h-6 w-6" /> Start New Mock Interview
                </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-auto py-4 text-base">
                <Link href="/resume/edit">
                    <Target className="mr-3 h-6 w-6" /> Upload / Edit Resume
                </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-auto py-4 text-base">
                <Link href="/analysis/new">
                    <Book className="mr-3 h-6 w-6" /> Add Job Description
                </Link>
            </Button>
        </div>
        
        {/* Top Cards */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {isLoading ? <Skeleton className="h-[280px]" /> : <ReadinessScore readinessScore={userProfile?.readinessScore || 0} /> }
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Skill Gaps
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-1/2 mt-2" /> : <div className="text-2xl font-bold">{latestSkillGap?.missingSkills?.length || 0}</div>}
              <p className="text-xs text-muted-foreground">
                Missing skills for latest job
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weakest Area</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-3/4 mt-2" /> : <div className="text-2xl font-bold">{weakestSkill.name}</div>}
              <p className="text-xs text-muted-foreground">
                Average score of {weakestSkill.score}%
              </p>
            </CardContent>
          </Card>

           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-1/4 mt-2" /> : <div className="text-2xl font-bold">{sessions?.length || 0}</div>}
              <p className="text-xs text-muted-foreground">
                Practice sessions completed
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Sessions */}
        {isLoading ? <Skeleton className="h-[300px]" /> : <RecentSessions sessions={sessions || []} />}
      </div>

      {/* Right Sidebar Column */}
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1 xl:col-span-1">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <UserIcon className="h-5 w-5"/> Profile Snapshot
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="border-t pt-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-lg">{user?.displayName || 'Jane Doe'}</p>
                  <p className="text-muted-foreground">{user?.email || 'jane.doe@example.com'}</p>
                  <div className="border-t pt-3">
                      <p><span className="font-medium">Total Sessions:</span> {sessions?.length || 0}</p>
                      <p><span className="font-medium">Last Active:</span> {sessions?.[0]?.createdAt ? new Date(sessions[0].createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </>
              )}
            </CardContent>
        </Card>

        {isLoading ? <Skeleton className="h-[360px]" /> : <SkillGaps skillGap={latestSkillGap} />}

        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Start a new analysis</span>
                    </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Complete a mock interview</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Review your learning path</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Get ready for your interview!</span>
                    </li>
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
