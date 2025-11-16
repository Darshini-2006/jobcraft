'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingDown, Book, BarChart, CheckCircle, User as UserIcon, GraduationCap, ArrowUpRight, BarChart2, Sparkles, TrendingUp } from 'lucide-react';
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
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'sessions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [firestore, user]);
  const { data: sessions, isLoading: sessionsLoading } = useCollection(sessionsQuery);

  // Get the latest completed session
  const latestCompletedSession = useMemoFirebase(() => {
    if (!sessions) return null;
    return sessions.find(s => s.completedAt != null) || null;
  }, [sessions]);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="h-full bg-gradient-to-br from-white to-[#FAF7F3] border-[#3E2F20]/10 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-[#3E2F20]">Job Readiness</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center pb-2">
          <div className="animate-pulse text-4xl font-bold text-[#D4B68A]">...</div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm pt-0">
          <div className="h-4 bg-[#D4B68A]/20 rounded-full w-3/4 animate-pulse" />
          <div className="h-3 bg-[#D4B68A]/20 rounded-full w-full animate-pulse" />
        </CardFooter>
      </Card>
    </motion.div>
  );

  const ReadinessScoreCard = ({ score }: { score: number }) => {
    const chartData = [{ value: score }];
    const getStatus = () => {
      if (score >= 80) return { text: 'Ready', className: 'text-green-600', color: '#10b981' };
      if (score >= 50) return { text: 'Improving', className: 'text-[#E8A87C]', color: '#E8A87C' };
      return { text: 'Needs Work', className: 'text-red-500', color: '#ef4444' };
    };
    const status = getStatus();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full bg-gradient-to-br from-white to-[#FAF7F3] border-[#3E2F20]/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#E8A87C]/10 to-transparent rounded-bl-full" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-[#3E2F20] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#E8A87C]" />
              Job Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2 relative z-10">
            <ChartContainer config={{}} className="mx-auto aspect-square w-full max-w-[180px]">
              <RadialBarChart
                data={chartData}
                startAngle={-90}
                endAngle={270}
                innerRadius={55}
                outerRadius={80}
                barSize={12}
                dataKey="value"
              >
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} domain={[0, 100]} />
                <RadialBar 
                  dataKey="value" 
                  background={{ fill: '#FAF7F3' }} 
                  cornerRadius={10} 
                  style={{ fill: status.color }}
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-[#3E2F20]">
                  <tspan dy="-0.3em" className="text-3xl font-bold">{score}%</tspan>
                  <tspan x="50%" dy="1.3em" className={cn("text-sm font-semibold", status.className)}>{status.text}</tspan>
                </text>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-1 text-xs pt-0 text-center relative z-10">
            <p className="text-[#3E2F20]/60 font-medium">
              Score ≥ 80% is interview-ready
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  const RecentSessionsLoading = () => (
    <Card className="bg-gradient-to-br from-white to-[#FAF7F3] border-[#3E2F20]/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-[#3E2F20]">Recent Interview Sessions</CardTitle>
        <CardDescription className="text-[#3E2F20]/60">Your most recent mock interview practice sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 border border-[#3E2F20]/10 rounded-xl bg-white/50"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-[#D4B68A]/20 rounded-full w-1/3 animate-pulse" />
                <div className="h-3 bg-[#D4B68A]/20 rounded-full w-1/4 animate-pulse" />
              </div>
              <div className="h-8 bg-[#D4B68A]/20 rounded-full w-16 animate-pulse" />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  type Session = {
    id: string;
    jobDescriptionId: string;
    jobRole?: string;
    jobCompany?: string;
    createdAt: { seconds: number };
    completedAt?: { seconds: number } | null;
    overallScore: number;
    skillScores?: { [key: string]: number };
    difficulty: string;
    totalQuestions?: number;
    questionsAnswered?: number;
  };

  const RecentSessionsCard = ({ sessions }: { sessions: Session[] }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-white to-[#FAF7F3] border-[#3E2F20]/10 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-[#3E2F20] flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-[#E8A87C]" />
              Recent Interview Sessions
            </CardTitle>
            <CardDescription className="text-[#3E2F20]/60">Your most recent mock interview practice sessions</CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost" className="gap-1 text-[#3E2F20] hover:text-[#E8A87C] hover:bg-[#E8A87C]/10 transition-colors">
            <Link href="#">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-[#3E2F20]/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FAF7F3] hover:bg-[#FAF7F3] border-[#3E2F20]/10">
                  <TableHead className="text-[#3E2F20] font-semibold">Job Role</TableHead>
                  <TableHead className="hidden md:table-cell text-[#3E2F20] font-semibold">Difficulty</TableHead>
                  <TableHead className="hidden lg:table-cell text-[#3E2F20] font-semibold">Date</TableHead>
                  <TableHead className="text-right text-[#3E2F20] font-semibold">Score</TableHead>
                  <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-[#3E2F20]/60">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="p-4 rounded-full bg-[#E8A87C]/10">
                          <BarChart className="h-8 w-8 text-[#E8A87C]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#3E2F20]">No interview sessions yet</p>
                          <p className="text-xs text-[#3E2F20]/60 mt-1">Start your first mock interview to see results here</p>
                        </div>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session, idx) => (
                    <motion.tr 
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-[#3E2F20]/10 hover:bg-[#FAF7F3]/50 transition-colors"
                    >
                      <TableCell>
                        <div className="font-medium truncate max-w-[200px] text-[#3E2F20]" title={session.jobRole || session.jobDescriptionId}>
                          {session.jobRole || session.jobDescriptionId}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge 
                          className={cn(
                            "text-xs font-semibold",
                            session.difficulty === 'Hard' 
                              ? 'bg-red-100 text-red-700 border-red-200' 
                              : session.difficulty === 'Medium' 
                              ? 'bg-[#E8A87C]/20 text-[#E8A87C] border-[#E8A87C]/30' 
                              : 'bg-green-100 text-green-700 border-green-200'
                          )}
                        >
                          {session.difficulty || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-[#3E2F20]/70">
                        {new Date(session.createdAt.seconds * 1000).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-bold text-lg",
                          session.overallScore >= 80 ? "text-green-600" : session.overallScore >= 50 ? "text-[#E8A87C]" : "text-red-500"
                        )}>
                          {session.overallScore || 0}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild
                          className="hover:bg-[#E8A87C]/10 hover:text-[#E8A87C] transition-colors"
                        >
                          <Link href={`/interview/summary/${session.id}`}>
                            <BarChart2 className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const SkillGapsLoading = () => (
    <Card className="h-full bg-gradient-to-br from-white to-[#FAF7F3] border-[#3E2F20]/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-[#3E2F20]">Skill Gap Analysis</CardTitle>
        <CardDescription className="text-[#3E2F20]/60">Loading analysis...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-[#D4B68A]/20 rounded-full w-1/3 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-[#D4B68A]/20 rounded-full w-16 animate-pulse" />
              <div className="h-6 bg-[#D4B68A]/20 rounded-full w-20 animate-pulse" />
            </div>
          </div>
          <Separator className="bg-[#3E2F20]/10" />
          <div className="space-y-2">
            <div className="h-4 bg-[#D4B68A]/20 rounded-full w-1/3 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-[#D4B68A]/20 rounded-full w-20 animate-pulse" />
              <div className="h-6 bg-[#D4B68A]/20 rounded-full w-16 animate-pulse" />
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full bg-gradient-to-br from-white to-[#FAF7F3] border-[#3E2F20]/10 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-[#3E2F20] flex items-center gap-2">
            <Target className="h-5 w-5 text-[#E8A87C]" />
            Skill Gap Analysis
          </CardTitle>
          <CardDescription className="text-[#3E2F20]/60 truncate" title={skillGap?.jobDescriptionId}>
            {skillGap?.jobDescriptionId ? `For "${skillGap.jobDescriptionId}"` : 'No analysis performed yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[#3E2F20]">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Matched Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(skillGap?.matchedSkills || []).length === 0 ? (
                  <p className="text-sm text-[#3E2F20]/60">No matched skills yet</p>
                ) : (
                  (skillGap?.matchedSkills || []).map((skill, idx) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors font-medium text-xs break-words max-w-full" title={skill}>
                        {skill}
                      </Badge>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
            <Separator className="bg-[#3E2F20]/10" />
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[#3E2F20]">
                <TrendingUp className="h-4 w-4 text-red-600" />
                Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(skillGap?.missingSkills || []).length === 0 ? (
                  <p className="text-sm text-[#3E2F20]/60">No missing skills identified</p>
                ) : (
                  (skillGap?.missingSkills || []).map((skill, idx) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors font-medium text-xs break-words max-w-full" title={skill}>
                        {skill}
                      </Badge>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F3] via-white to-[#FAF7F3] relative overflow-hidden">
      {/* Animated background decorations */}
      <motion.div
        className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-[#E8A87C]/5 to-[#D4B68A]/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-96 h-96 bg-gradient-to-tr from-[#3E2F20]/3 to-[#E8A87C]/3 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-bl from-[#D4B68A]/4 to-transparent rounded-full blur-2xl"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="space-y-8 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto relative z-10">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 relative"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#3E2F20] via-[#E8A87C] to-[#3E2F20] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Welcome back{user?.displayName ? `, ${user.displayName}` : ''}! 👋
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[#3E2F20]/70 text-lg flex items-center gap-2"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              📊
            </motion.span>
            Track your progress and continue your interview preparation journey
          </motion.p>
        </motion.div>

        {/* Latest Session Alert - Show if just completed */}
        {latestCompletedSession && latestCompletedSession.completedAt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <Card className="border-[#E8A87C] bg-gradient-to-r from-[#E8A87C]/10 via-white to-[#FAF7F3] shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: "easeInOut",
                }}
              />
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2 text-[#3E2F20]">
                      <div className="p-1.5 rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      Mock Interview Completed! 🎉
                    </CardTitle>
                    <CardDescription className="text-[#3E2F20]/70">
                      {latestCompletedSession.jobRole || 'Recent Session'} • Score: <span className="font-bold text-[#E8A87C]">{latestCompletedSession.overallScore}%</span>
                    </CardDescription>
                  </div>
                  <Button asChild variant="default" size="sm" className="bg-[#3E2F20] hover:bg-[#E8A87C] text-white transition-all duration-300 shadow-md hover:shadow-lg">
                    <Link href="/learning-path">
                      View Learning Path
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-3 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {[
                    { label: 'Skills Tested', value: latestCompletedSession.skillScores ? Object.keys(latestCompletedSession.skillScores).length : 0, delay: 0 },
                    { label: 'Questions Answered', value: latestCompletedSession.questionsAnswered || latestCompletedSession.totalQuestions || 'N/A', delay: 0.1 },
                    { label: 'Overall Score', value: `${latestCompletedSession.overallScore}%`, isScore: true, delay: 0.2 },
                    { label: 'Completed', value: latestCompletedSession.completedAt ? new Date(latestCompletedSession.completedAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A', delay: 0.3 },
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: stat.delay }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="p-3 rounded-xl bg-white/70 border border-[#3E2F20]/10 hover:border-[#E8A87C]/50 transition-all duration-300 hover:shadow-md cursor-default"
                    >
                      <p className="text-[#3E2F20]/60 text-xs mb-1">{stat.label}</p>
                      <p className={cn(
                        "font-bold text-xl",
                        stat.isScore ? "text-[#E8A87C]" : "text-[#3E2F20]"
                      )}>{stat.value}</p>
                    </motion.div>
                  ))}
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-[#3E2F20]/70 mt-3 flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Sparkles className="h-4 w-4 text-[#E8A87C]" />
                  </motion.div>
                  <span>Your personalized learning path is ready! Review your skill gaps and get curated resources to improve.</span>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="h-auto py-4 px-4 rounded-xl border border-[#3E2F20]/10 bg-gradient-to-br from-white to-[#FAF7F3] shadow-sm"
              >
                <div className="flex items-center w-full">
                  <div className="h-5 w-5 bg-[#D4B68A]/20 rounded mr-3 animate-pulse flex-shrink-0" />
                  <div className="h-5 bg-[#D4B68A]/20 rounded-full flex-1 animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { href: '/analysis/new', icon: BarChart, label: 'Start New Analysis', primary: true },
              { href: '/learning-path', icon: GraduationCap, label: 'View Learning Paths', primary: false },
              { href: '/resume/edit', icon: Target, label: 'Edit Resume', primary: false },
              { href: '/analysis/new', icon: Book, label: 'Add Job Description', primary: false },
            ].map((action, idx) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  asChild 
                  size="lg" 
                  variant={action.primary ? "default" : "outline"}
                  className={cn(
                    "h-auto py-4 justify-start w-full rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group",
                    action.primary 
                      ? "bg-gradient-to-r from-[#3E2F20] to-[#5a4530] hover:from-[#E8A87C] hover:to-[#d4985f] text-white" 
                      : "border-[#3E2F20]/20 hover:border-[#E8A87C] hover:bg-gradient-to-r hover:from-[#FAF7F3] hover:to-white text-[#3E2F20]"
                  )}
                >
                  <Link href={action.href} className="flex items-center w-full">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <action.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    </motion.div>
                    <span className="font-semibold text-sm md:text-base truncate">{action.label}</span>
                    <motion.div
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}

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
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <Card className="bg-gradient-to-br from-white to-[#FAF7F3] border-[#3E2F20]/10 shadow-lg hover:shadow-2xl transition-all duration-300 h-full relative overflow-hidden group cursor-pointer">
                  <motion.div 
                    className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100/50 to-transparent rounded-bl-full"
                    whileHover={{ scale: 1.5, opacity: 0.8 }}
                    transition={{ duration: 0.3 }}
                  />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium flex items-center justify-between text-[#3E2F20]">
                      <span>Skill Gaps</span>
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Target className="h-4 w-4 text-red-500" />
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    {isLoading ? (
                      <div className="space-y-2">
                        <div className="h-8 bg-[#D4B68A]/20 rounded-full w-1/2 animate-pulse" />
                        <div className="h-3 bg-[#D4B68A]/20 rounded-full w-full animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <motion.div 
                          className="text-4xl font-bold text-[#3E2F20]"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        >
                          {latestSkillGap?.missingSkills?.length || 0}
                        </motion.div>
                        <p className="text-xs text-[#3E2F20]/60 mt-1 font-medium">
                          Skills to develop
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <Card className="bg-gradient-to-br from-white to-[#FAF7F3] border-[#3E2F20]/10 shadow-lg hover:shadow-2xl transition-all duration-300 h-full relative overflow-hidden group cursor-pointer">
                  <motion.div 
                    className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100/50 to-transparent rounded-bl-full"
                    whileHover={{ scale: 1.5, opacity: 0.8 }}
                    transition={{ duration: 0.3 }}
                  />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium flex items-center justify-between text-[#3E2F20]">
                      <span>Weakest Area</span>
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                      >
                        <TrendingDown className="h-4 w-4 text-[#E8A87C]" />
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    {isLoading ? (
                      <div className="space-y-2">
                        <div className="h-8 bg-[#D4B68A]/20 rounded-full w-3/4 animate-pulse" />
                        <div className="h-3 bg-[#D4B68A]/20 rounded-full w-full animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <motion.div 
                          className="text-2xl font-bold text-[#3E2F20] line-clamp-2 break-words"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.25 }}
                          title={weakestSkill.name}
                        >
                          {weakestSkill.name}
                        </motion.div>
                        <p className="text-xs text-[#3E2F20]/60 mt-1 font-medium">
                          {weakestSkill.score}% avg score
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <Card className="bg-gradient-to-br from-white to-[#FAF7F3] border-[#3E2F20]/10 shadow-lg hover:shadow-2xl transition-all duration-300 h-full relative overflow-hidden group cursor-pointer">
                  <motion.div 
                    className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-transparent rounded-bl-full"
                    whileHover={{ scale: 1.5, opacity: 0.8 }}
                    transition={{ duration: 0.3 }}
                  />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium flex items-center justify-between text-[#3E2F20]">
                      <span>Total Sessions</span>
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                      >
                        <BarChart className="h-4 w-4 text-blue-500" />
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    {isLoading ? (
                      <div className="space-y-2">
                        <div className="h-8 bg-[#D4B68A]/20 rounded-full w-1/4 animate-pulse" />
                        <div className="h-3 bg-[#D4B68A]/20 rounded-full w-full animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <motion.div 
                          className="text-4xl font-bold text-[#3E2F20]"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                        >
                          {sessions?.length || 0}
                        </motion.div>
                        <p className="text-xs text-[#3E2F20]/60 mt-1 font-medium">
                          Completed
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
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
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="bg-gradient-to-br from-white to-[#FAF7F3] border-[#3E2F20]/10 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                <motion.div 
                  className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E8A87C]/10 to-transparent rounded-bl-full"
                  whileHover={{ scale: 1.3, rotate: 45 }}
                  transition={{ duration: 0.5 }}
                />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 text-[#3E2F20]">
                    <motion.div 
                      className="p-2 rounded-full bg-[#E8A87C]/10"
                      whileHover={{ rotate: 360, scale: 1.15 }}
                      transition={{ duration: 0.6 }}
                    >
                      <UserIcon className="h-5 w-5 text-[#E8A87C]" />
                    </motion.div>
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-6 bg-[#D4B68A]/20 rounded-full w-1/2 animate-pulse" />
                      <div className="h-4 bg-[#D4B68A]/20 rounded-full w-3/4 animate-pulse" />
                      <Separator className="bg-[#3E2F20]/10" />
                      <div className="h-4 bg-[#D4B68A]/20 rounded-full w-full animate-pulse" />
                      <div className="h-4 bg-[#D4B68A]/20 rounded-full w-1/2 animate-pulse" />
                    </div>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="font-bold text-xl text-[#3E2F20] truncate" title={user?.displayName || 'Jane Doe'}>{user?.displayName || 'Jane Doe'}</p>
                        <p className="text-sm text-[#3E2F20]/60 mt-1 truncate" title={user?.email || 'jane.doe@example.com'}>{user?.email || 'jane.doe@example.com'}</p>
                      </motion.div>
                      <Separator className="bg-[#3E2F20]/10" />
                      <div className="space-y-3 text-sm">
                        {[
                          { label: 'Sessions:', value: sessions?.length || 0 },
                          { label: 'Last Active:', value: sessions?.[0]?.createdAt ? new Date(sessions[0].createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A' },
                        ].map((stat, idx) => (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            whileHover={{ scale: 1.03, x: 4 }}
                            className="flex justify-between items-center p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 cursor-default"
                          >
                            <span className="text-[#3E2F20]/70 font-medium">{stat.label}</span>
                            <span className="font-bold text-[#3E2F20]">{stat.value}</span>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Skill Gaps */}
            {isLoading ? <SkillGapsLoading /> : <SkillGapsCard skillGap={latestSkillGap} />}
          </div>
        </div>
      </div>
    </div>
  );
}