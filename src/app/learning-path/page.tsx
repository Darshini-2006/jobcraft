'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, BookOpen, Video, Code, FileText, Target, Clock, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

type ViewMode = 'full' | 'sprint';

interface SkillGap {
    resumeLevel: number;
    requiredLevel: number;
    gapScore: number;
    priority: string;
    currentScore: number;
    explanation?: string;
    resources?: Array<{ type: string; title: string; url: string }>;
}

interface SessionData {
    id: string;
    skillGaps: { [key: string]: SkillGap };
    overallScore: number;
    jobRole: string;
    jobCompany: string;
    completedAt: any;
}

// --- MOCK DATA ---
const mockLearningData = {
    skills: [
        { name: "Kubernetes", resumeLevel: 1, requiredLevel: 4, gapScore: 75, priority: "High", rating: 1, explanation: "Crucial for modern cloud-native applications, but your resume shows minimal experience. Mastering this is key for a Senior role." },
        { name: "System Design", resumeLevel: 2, requiredLevel: 5, gapScore: 60, priority: "High", rating: 2, explanation: "Core competency for senior roles. You have foundational knowledge but need to demonstrate ability to design scalable, resilient systems." },
        { name: "GraphQL", resumeLevel: 0, requiredLevel: 3, gapScore: 100, priority: "Medium", rating: 0, explanation: "A required skill for this role to optimize data fetching. It's a significant gap to address." },
        { name: "Microservices", resumeLevel: 3, requiredLevel: 4, gapScore: 25, priority: "Medium", rating: 3, explanation: "You have some experience, but the job requires a deeper understanding of inter-service communication and patterns." },
        { name: "TypeScript", resumeLevel: 4, requiredLevel: 5, gapScore: 20, priority: "Low", rating: 4, explanation: "You're proficient, but mastering advanced types and decorators will set you apart." },
    ],
    fullPrep: {
        resources: {
            "Kubernetes": [
                { type: 'video', title: "Kubernetes Course - Full", url: "#", icon: Video },
                { type: 'article', title: "Official Kubernetes Docs", url: "#", icon: FileText },
                { type: 'practice', title: "Killercoda Scenarios", url: "#", icon: Code },
            ],
            "System Design": [
                { type: 'video', title: "System Design Primer", url: "#", icon: Video },
                { type: 'article', title: "Grokking the System Design Interview", url: "#", icon: BookOpen },
                { type: 'practice', title: "Case Studies Practice", url: "#", icon: Code },
            ],
        },
        projects: {
           "Kubernetes": { name: "Deploy a Microservices App on K8s", description: "Deploy a multi-service application to a local or cloud Kubernetes cluster, managing deployments, services, and ingress.", problemStatement: "...", expectedOutcome: "...", techStack: ["Docker", "Kubernetes", "Helm"], difficulty: "Hard" },
           "GraphQL": { name: "Build a GraphQL API for a Blog", description: "Create a GraphQL server that exposes data for a blogging platform, including posts, users, and comments.", problemStatement: "...", expectedOutcome: "...", techStack: ["Node.js", "Apollo Server", "GraphQL"], difficulty: "Medium" }
        }
    },
    quickSprint: {
        topSkills: ["Kubernetes", "System Design", "GraphQL"],
        resources: {
            "Kubernetes": { video: { title: "Kubernetes in 100 Seconds", url: "#" }, cheatsheet: { title: "K8s Cheatsheet", url: "#" }, practice: { title: "Basic Pods Lab", url: "#" } },
            "System Design": { video: { title: "5 Common Design Patterns", url: "#" }, cheatsheet: { title: "System Design Cheatsheet", url: "#" }, practice: { title: "Whiteboard a URL Shortener", url: "#" } },
            "GraphQL": { video: { title: "GraphQL in 100 Seconds", url: "#" }, cheatsheet: { title: "GraphQL Cheatsheet", url: "#" }, practice: { title: "Basic GraphQL Query", url: "#" } },
        },
        topQuestions: [
            "Explain the architecture of Kubernetes.",
            "How do you ensure high availability for a web application?",
            "What are the differences between REST and GraphQL?",
            "Describe the CAP theorem.",
            "How would you design a system like Twitter?"
        ]
    }
};
// --- END MOCK DATA ---

type ViewMode = 'full' | 'sprint';

const getPriorityBadge = (priority: string) => {
    switch (priority) {
        case 'High': return 'destructive';
        case 'Medium': return 'secondary';
        case 'Low': return 'outline';
        default: return 'default';
    }
}

const getRatingColor = (score: number) => {
    if (score <= 40) return 'bg-red-500';
    if (score <= 70) return 'bg-yellow-500';
    return 'bg-green-500';
}

const getResourcesForSkill = (skillName: string) => {
    const resourceMap: { [key: string]: any[] } = {
        'default': [
            { type: 'video', title: `${skillName} Tutorial`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skillName + ' tutorial')}`, icon: Video },
            { type: 'article', title: `${skillName} Documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(skillName + ' documentation')}`, icon: FileText },
            { type: 'practice', title: `${skillName} Practice`, url: `https://www.google.com/search?q=${encodeURIComponent(skillName + ' practice problems')}`, icon: Code },
        ]
    };
    return resourceMap[skillName] || resourceMap['default'];
};

export default function LearningPathPage() {
    const [mode, setMode] = useState<ViewMode>('full');
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const { user } = useUser();
    const firestore = useFirestore();

    // Fetch all completed sessions for this user
    const sessionsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'sessions'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(50) // Get more sessions to show all job roles
        );
    }, [user, firestore]);

    const { data: sessions, isLoading, error } = useCollection<SessionData>(sessionsQuery);
    
    // Filter for completed sessions only
    const completedSessions = useMemo(() => {
        if (!sessions) return [];
        return sessions.filter(s => s.completedAt != null);
    }, [sessions]);

    // Get the selected session or default to the latest
    const selectedSession = useMemo(() => {
        if (!completedSessions.length) return null;
        if (selectedSessionId) {
            return completedSessions.find(s => s.id === selectedSessionId) || completedSessions[0];
        }
        return completedSessions[0];
    }, [completedSessions, selectedSessionId]);

    // Group sessions by job role for the sidebar
    const sessionsByRole = useMemo(() => {
        const grouped: { [key: string]: SessionData[] } = {};
        completedSessions.forEach(session => {
            const role = session.jobRole || 'Unknown Role';
            if (!grouped[role]) {
                grouped[role] = [];
            }
            grouped[role].push(session);
        });
        return grouped;
    }, [completedSessions]);

    // Debug logging
    console.log('Learning Path Debug:', { 
        user: user?.uid, 
        firestore: !!firestore, 
        isLoading, 
        allSessions: sessions?.length,
        completedSessions: completedSessions.length,
        selectedSession,
        sessionsByRole,
        error: error?.message 
    });

    // Transform Firestore data into skills array
    const skills = useMemo(() => {
        if (!selectedSession?.skillGaps) return [];
        
        return Object.entries(selectedSession.skillGaps).map(([name, gap]) => ({
            name,
            resumeLevel: gap.resumeLevel,
            requiredLevel: gap.requiredLevel,
            gapScore: gap.gapScore,
            priority: gap.priority,
            rating: gap.currentScore,
            explanation: gap.explanation || `Current performance: ${gap.currentScore}%. ${gap.gapScore > 60 ? 'Significant improvement needed.' : gap.gapScore > 30 ? 'Some improvement recommended.' : 'Good foundation, refine further.'}`
        })).sort((a, b) => b.gapScore - a.gapScore); // Sort by gap score (highest first)
    }, [selectedSession]);

    const topSkills = skills.slice(0, 3);

    // Show loading state
    if (isLoading) {
        return (
            <div className="p-4 md:p-6 space-y-6">
                <Skeleton className="h-12 w-64 mx-auto" />
                <div className="grid lg:grid-cols-4 gap-6">
                    <Skeleton className="h-96" />
                    <div className="lg:col-span-3 space-y-4">
                        <Skeleton className="h-24" />
                        <Skeleton className="h-24" />
                        <Skeleton className="h-24" />
                    </div>
                </div>
            </div>
        );
    }

    // Show error if Firestore query failed
    if (error) {
        return (
            <div className="p-4 md:p-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-6 w-6" />
                            <CardTitle>Error Loading Learning Path</CardTitle>
                        </div>
                        <CardDescription>
                            {error.message || 'Unable to fetch your learning path data. Please try again.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            If this error persists, you may need to complete a new mock interview session.
                        </p>
                        <Button asChild>
                            <Link href="/analysis/new">Start New Mock Interview</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show "no data" message when loaded but no session found
    if (!selectedSession) {
        return (
            <div className="p-4 md:p-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="h-6 w-6" />
                            <CardTitle>No Learning Path Available</CardTitle>
                        </div>
                        <CardDescription>
                            Complete a mock interview session to generate your personalized learning path.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/analysis/new">Start Mock Interview</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const JobRoleSelector = () => (
        <Card>
            <CardHeader>
                <CardTitle>Job Roles</CardTitle>
                <CardDescription>
                    Select a role to view its learning path
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {Object.entries(sessionsByRole).map(([role, roleSessions]) => (
                        <div key={role} className="space-y-1">
                            <button
                                onClick={() => setSelectedSessionId(roleSessions[0].id)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${
                                    selectedSession?.jobRole === role 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted hover:bg-muted/80'
                                }`}
                            >
                                <div className="font-semibold">{role}</div>
                                {roleSessions[0].jobCompany && (
                                    <div className="text-xs opacity-80">{roleSessions[0].jobCompany}</div>
                                )}
                                <div className="text-xs mt-1">
                                    Score: {roleSessions[0].overallScore}% • {roleSessions.length} session{roleSessions.length > 1 ? 's' : ''}
                                </div>
                            </button>
                            {roleSessions.length > 1 && selectedSession?.jobRole === role && (
                                <div className="ml-4 space-y-1">
                                    {roleSessions.slice(1).map((session) => (
                                        <button
                                            key={session.id}
                                            onClick={() => setSelectedSessionId(session.id)}
                                            className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                                selectedSession?.id === session.id
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'hover:bg-muted/50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>Attempt {roleSessions.indexOf(session) + 1}</span>
                                                <span className="text-xs">{session.overallScore}%</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    const SkillGapOverview = () => (
        <Card>
            <CardHeader>
                <CardTitle>Skill Gap Overview</CardTitle>
                <CardDescription>
                    Skills for "{selectedSession?.jobRole || 'Latest Role'}"
                    {selectedSession?.jobCompany && ` at ${selectedSession.jobCompany}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {skills.map(skill => (
                        <div key={skill.name}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold">{skill.name}</span>
                                <Badge variant={getPriorityBadge(skill.priority) as any}>{skill.priority} Priority</Badge>
                            </div>
                            <Progress value={skill.rating} className="h-3" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>Score: {skill.rating}%</span>
                                <span>Gap: {skill.gapScore}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    const FullPrepMode = () => (
        <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full" defaultValue='item-0'>
                 {skills.map((skill, index) => (
                    <AccordionItem key={skill.name} value={`item-${index}`}>
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-4">
                                <div className={`w-4 h-4 rounded-full ${getRatingColor(skill.rating)}`}></div>
                                {skill.name}
                                <Badge variant={getPriorityBadge(skill.priority) as any}>{skill.priority}</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 bg-card rounded-b-md border-t-0">
                            <p className="text-muted-foreground mb-4 italic">"{skill.explanation}"</p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/> Learning Resources</h4>
                                    <div className="space-y-2">
                                        {getResourcesForSkill(skill.name).map((res: any) => (
                                             <a href={res.url} key={res.title} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                                                <res.icon className="h-5 w-5 text-muted-foreground" />
                                                <span className="text-sm font-medium text-primary hover:underline">{res.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Current Performance</h4>
                                    <div className="p-3 rounded-md bg-muted/50">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Interview Score:</span>
                                                <span className="font-semibold">{skill.rating}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Skill Gap:</span>
                                                <span className="font-semibold">{skill.gapScore}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Priority:</span>
                                                <Badge variant={getPriorityBadge(skill.priority) as any}>{skill.priority}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                 ))}
            </Accordion>
        </div>
    );
    
    const QuickSprintMode = () => {
        return (
             <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 3 Skills to Sprint</CardTitle>
                             <CardDescription>Focus on these high-impact areas for quick improvement.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        {topSkills.map(skill => {
                            const resources = getResourcesForSkill(skill.name);
                            return (
                                <Card key={skill.name}>
                                    <CardHeader className="p-4">
                                         <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg">{skill.name}</CardTitle>
                                            <Badge variant={getPriorityBadge(skill.priority) as any}>{skill.priority}</Badge>
                                         </div>
                                         <CardDescription>Current Score: {skill.rating}% • Gap: {skill.gapScore}%</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 grid sm:grid-cols-3 gap-2 text-sm">
                                        {resources.map((res: any) => (
                                            <a key={res.title} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                                                <res.icon className="h-4 w-4 text-primary" /> <span className="font-medium">{res.type === 'video' ? 'Video' : res.type === 'article' ? 'Docs' : 'Practice'}</span>
                                            </a>
                                        ))}
                                    </CardContent>
                                </Card>
                            )
                        })}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Summary</CardTitle>
                            <CardDescription>Latest mock interview results</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Overall Score:</span>
                                    <span className="text-2xl font-bold">{selectedSession?.overallScore || 0}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Skills Tested:</span>
                                    <span className="font-semibold">{skills.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">High Priority:</span>
                                    <span className="font-semibold">{skills.filter(s => s.priority === 'High').length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>15-Minute Tasks</CardTitle>
                            <CardDescription>High-impact tasks you can do right now.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ul className="space-y-3 text-sm">
                               {topSkills.slice(0, 3).map((skill, idx) => (
                                   <li key={idx} className="flex items-start gap-2">
                                       <Clock className="h-4 w-4 mt-0.5 text-primary"/>
                                       <span>Review {skill.name} fundamentals and key concepts.</span>
                                   </li>
                               ))}
                           </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    };


    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Learning Paths</h1>
                    <p className="text-muted-foreground">Prepare for multiple job roles simultaneously</p>
                </div>
                <Tabs value={mode} onValueChange={(value) => setMode(value as ViewMode)} className="w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="full" className="gap-2"><BookOpen className="h-5 w-5"/> Full Prep</TabsTrigger>
                        <TabsTrigger value="sprint" className="gap-2"><Zap className="h-5 w-5"/> Quick Sprint</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
           
            <div className="grid lg:grid-cols-5 gap-6 items-start">
                 <div className="lg:col-span-1 space-y-6">
                    <JobRoleSelector />
                 </div>
                 <div className="lg:col-span-1">
                    <SkillGapOverview />
                 </div>
                 <div className="lg:col-span-3">
                    {mode === 'full' ? <FullPrepMode /> : <QuickSprintMode />}
                 </div>
            </div>
        </div>
    );
}
