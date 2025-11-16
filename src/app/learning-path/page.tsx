'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, BookOpen, Video, Code, FileText, Target, Clock, AlertCircle, Sparkles, ArrowRight, TrendingUp, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
            <div className="min-h-screen bg-gradient-to-b from-white to-[#FAF7F3] p-4 md:p-6 space-y-6 relative overflow-hidden">
                {/* Floating Background Blobs */}
                <motion.div
                    className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-[#E8A87C]/20 to-[#D4B68A]/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-[#3E2F20]/10 to-[#D4B68A]/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10"
                >
                    <Skeleton className="h-16 w-80 mx-auto rounded-2xl bg-white/50 border border-[#3E2F20]/10" />
                </motion.div>
                <div className="grid lg:grid-cols-4 gap-6 relative z-10">
                    <Skeleton className="h-96 rounded-2xl bg-white/50 border border-[#3E2F20]/10" />
                    <div className="lg:col-span-3 space-y-4">
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-2xl bg-white/50 border border-[#3E2F20]/10" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Show error if Firestore query failed
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-[#FAF7F3] p-4 md:p-6 flex items-center justify-center relative overflow-hidden">
                <motion.div
                    className="absolute top-10 right-10 w-80 h-80 bg-gradient-to-br from-red-100/30 to-amber-100/30 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 max-w-2xl w-full"
                >
                    <Card className="border-[#3E2F20]/10 shadow-2xl rounded-2xl bg-white/90 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-center gap-3 text-red-600">
                                <AlertCircle className="h-8 w-8" />
                                <CardTitle className="text-2xl">Error Loading Learning Path</CardTitle>
                            </div>
                            <CardDescription className="text-base">
                                {error.message || 'Unable to fetch your learning path data. Please try again.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-[#3E2F20]/70">
                                If this error persists, you may need to complete a new mock interview session.
                            </p>
                            <Button asChild className="bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] hover:opacity-90 transition-all duration-300 group">
                                <Link href="/analysis/new" className="flex items-center gap-2">
                                    Start New Mock Interview
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // Show "no data" message when loaded but no session found
    if (!selectedSession) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-[#FAF7F3] p-4 md:p-6 flex items-center justify-center relative overflow-hidden">
                <motion.div
                    className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-[#E8A87C]/20 to-[#D4B68A]/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 max-w-2xl w-full"
                >
                    <Card className="border-[#3E2F20]/10 shadow-2xl rounded-2xl bg-white/90 backdrop-blur-sm">
                        <CardHeader className="text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <BookOpen className="h-16 w-16 text-[#E8A87C] mx-auto" />
                            </motion.div>
                            <CardTitle className="text-3xl bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent">
                                No Learning Path Available
                            </CardTitle>
                            <CardDescription className="text-base text-[#3E2F20]/70">
                                Complete a mock interview session to generate your personalized learning path.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center pb-8">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button asChild className="bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] hover:opacity-90 transition-all duration-300 px-8 py-6 text-base group">
                                    <Link href="/analysis/new" className="flex items-center gap-2">
                                        Start Mock Interview
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const JobRoleSelector = () => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-[#3E2F20]/10 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm sticky top-6">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-[#E8A87C]" />
                        <CardTitle className="text-lg text-[#3E2F20]">Job Roles</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-[#3E2F20]/70">
                        Select a role to view its learning path
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        {Object.entries(sessionsByRole).map(([role, roleSessions], idx) => (
                            <motion.div
                                key={role}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="space-y-1"
                            >
                                <motion.button
                                    onClick={() => setSelectedSessionId(roleSessions[0].id)}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                                        selectedSession?.jobRole === role 
                                            ? 'bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] text-white shadow-lg' 
                                            : 'bg-[#FAF7F3] hover:bg-[#FAF7F3]/80 border border-[#3E2F20]/10 hover:border-[#E8A87C]'
                                    }`}
                                >
                                    <div className="font-semibold text-sm flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        {role}
                                    </div>
                                    {roleSessions[0].jobCompany && (
                                        <div className={`text-xs mt-0.5 ${selectedSession?.jobRole === role ? 'opacity-90' : 'text-[#3E2F20]/60'}`}>
                                            {roleSessions[0].jobCompany}
                                        </div>
                                    )}
                                    <div className={`text-xs mt-1.5 flex items-center gap-1.5 ${selectedSession?.jobRole === role ? 'opacity-90' : 'text-[#3E2F20]/70'}`}>
                                        <TrendingUp className="h-3 w-3" />
                                        Score: {roleSessions[0].overallScore}% • {roleSessions.length} session{roleSessions.length > 1 ? 's' : ''}
                                    </div>
                                </motion.button>
                                {roleSessions.length > 1 && selectedSession?.jobRole === role && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="ml-4 space-y-2"
                                    >
                                        {roleSessions.slice(1).map((session) => (
                                            <motion.button
                                                key={session.id}
                                                onClick={() => setSelectedSessionId(session.id)}
                                                whileHover={{ x: 4 }}
                                                className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-300 ${
                                                    selectedSession?.id === session.id
                                                        ? 'bg-[#E8A87C]/20 text-[#3E2F20] border border-[#E8A87C]'
                                                        : 'hover:bg-white/50 border border-transparent hover:border-[#3E2F20]/10'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">Attempt {roleSessions.indexOf(session) + 1}</span>
                                                    <span className="text-xs font-semibold">{session.overallScore}%</span>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const FullPrepMode = () => (
        <div className="space-y-4">
            {/* Learning Path Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4"
            >
                <h2 className="text-xl font-bold text-[#3E2F20] mb-1">Your Learning Journey</h2>
                <p className="text-sm text-[#3E2F20]/70">Follow this path to master each skill step by step</p>
            </motion.div>

            {/* Skills as a vertical learning path */}
            <div className="relative">
                {/* Vertical connecting line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#E8A87C] via-[#D4B68A] to-[#3E2F20]/20" />
                
                <div className="space-y-4">
                    {skills.map((skill, index) => (
                        <motion.div
                            key={skill.name}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-16"
                        >
                            {/* Step number indicator */}
                            <motion.div 
                                className="absolute left-0 top-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#3E2F20] to-[#E8A87C] flex items-center justify-center shadow-lg z-10"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <span className="text-white font-bold text-base">#{index + 1}</span>
                            </motion.div>

                            {/* Skill Card */}
                            <Card className="border-[#3E2F20]/10 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-[#FAF7F3] to-white border-b border-[#3E2F20]/10 pb-3 pt-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <motion.div 
                                                className={`w-5 h-5 rounded-full ${getRatingColor(skill.rating)}`}
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                            <div>
                                                <CardTitle className="text-lg text-[#3E2F20]">{skill.name}</CardTitle>
                                                <CardDescription className="text-xs mt-0.5 text-[#3E2F20]/70">
                                                    Current: <span className="font-bold text-[#3E2F20]">{skill.rating}%</span> • 
                                                    Gap: <span className="font-bold text-[#E8A87C]">{skill.gapScore}%</span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge 
                                            className={`${
                                                skill.priority === 'High' 
                                                    ? 'bg-red-100 text-red-700 border-red-200' 
                                                    : skill.priority === 'Medium'
                                                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                    : 'bg-green-100 text-green-700 border-green-200'
                                            } px-3 py-1 text-xs font-semibold`}
                                        >
                                            {skill.priority}
                                        </Badge>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="mt-3">
                                        <Progress 
                                            value={skill.rating} 
                                            className="h-2 bg-[#FAF7F3]"
                                        />
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4">
                                    {/* Explanation */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="mb-4"
                                    >
                                        <p className="text-sm text-[#3E2F20]/80 italic bg-gradient-to-r from-[#FAF7F3] to-white p-3 rounded-lg border border-[#3E2F20]/10 leading-relaxed">
                                            "{skill.explanation}"
                                        </p>
                                    </motion.div>

                                    {/* Two-column layout for resources and performance */}
                                    <div className="grid md:grid-cols-5 gap-4">
                                        {/* Learning Resources - Takes 3 columns */}
                                        <div className="md:col-span-3 space-y-3">
                                            <h4 className="font-semibold text-[#3E2F20] flex items-center gap-2 text-sm">
                                                <BookOpen className="h-4 w-4 text-[#E8A87C]"/>
                                                Learning Resources
                                            </h4>
                                            <div className="grid gap-2">
                                                {getResourcesForSkill(skill.name).map((res: any, idx: number) => (
                                                    <motion.a 
                                                        href={res.url} 
                                                        key={res.title} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="flex items-center gap-2 p-2.5 rounded-lg bg-gradient-to-br from-white to-[#FAF7F3] hover:from-[#FAF7F3] hover:to-white border border-[#3E2F20]/10 hover:border-[#E8A87C] transition-all duration-300 group"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 + idx * 0.05 }}
                                                        whileHover={{ y: -2 }}
                                                    >
                                                        <div className="p-1.5 rounded bg-white group-hover:bg-[#E8A87C]/10 transition-colors">
                                                            <res.icon className="h-4 w-4 text-[#E8A87C] group-hover:scale-110 transition-transform" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-xs font-medium text-[#3E2F20] group-hover:text-[#E8A87C] transition-colors block truncate">
                                                                {res.title}
                                                            </span>
                                                        </div>
                                                        <ArrowRight className="h-3 w-3 text-[#3E2F20]/40 group-hover:text-[#E8A87C] group-hover:translate-x-1 transition-all flex-shrink-0" />
                                                    </motion.a>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Current Performance - Takes 2 columns */}
                                        <div className="md:col-span-2 space-y-3">
                                            <h4 className="font-semibold text-[#3E2F20] flex items-center gap-2 text-sm">
                                                <Target className="h-4 w-4 text-[#E8A87C]"/>
                                                Performance
                                            </h4>
                                            <motion.div 
                                                className="p-3 rounded-lg bg-gradient-to-br from-[#3E2F20]/5 to-[#E8A87C]/5 border border-[#3E2F20]/10 h-full"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                <div className="space-y-2">
                                                    <div className="text-center p-3 rounded-lg bg-white/80">
                                                        <div className="text-xs text-[#3E2F20]/60 mb-1">Score</div>
                                                        <motion.div 
                                                            className="text-2xl font-bold bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                                        >
                                                            {skill.rating}%
                                                        </motion.div>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 rounded-lg bg-white/60">
                                                        <span className="text-sm text-[#3E2F20]/70">Skill Gap:</span>
                                                        <span className="font-bold text-[#E8A87C]">{skill.gapScore}%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/60">
                                                        <span className="text-sm text-[#3E2F20]/70">Priority:</span>
                                                        <Badge 
                                                            className={`${
                                                                skill.priority === 'High' 
                                                                    ? 'bg-red-100 text-red-700 border-red-200' 
                                                                    : skill.priority === 'Medium'
                                                                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                                    : 'bg-green-100 text-green-700 border-green-200'
                                                            }`}
                                                        >
                                                            {skill.priority}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Journey completion indicator */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: skills.length * 0.1 + 0.3 }}
                    className="relative pl-16 mt-4"
                >
                    <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg z-10">
                        <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg rounded-xl">
                        <CardContent className="p-4">
                            <h3 className="text-base font-bold text-green-800 mb-1">Journey Complete!</h3>
                            <p className="text-sm text-green-700">Master all these skills to become job-ready for {selectedSession?.jobRole}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
    
    const QuickSprintMode = () => {
        return (
             <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="border-[#3E2F20]/10 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Zap className="h-6 w-6 text-[#E8A87C]" />
                                    <CardTitle className="text-2xl text-[#3E2F20]">Top 3 Skills to Sprint</CardTitle>
                                </div>
                                <CardDescription className="text-[#3E2F20]/70">
                                    Focus on these high-impact areas for quick improvement.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                            {topSkills.map((skill, idx) => {
                                const resources = getResourcesForSkill(skill.name);
                                return (
                                    <motion.div
                                        key={skill.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                        whileHover={{ y: -4 }}
                                    >
                                        <Card className="border-[#3E2F20]/10 hover:border-[#E8A87C] transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-[#FAF7F3]/30 rounded-xl">
                                            <CardHeader className="p-5">
                                                 <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <motion.div
                                                            className={`w-4 h-4 rounded-full ${getRatingColor(skill.rating)}`}
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        />
                                                        <CardTitle className="text-lg text-[#3E2F20]">{skill.name}</CardTitle>
                                                    </div>
                                                    <Badge 
                                                        variant={getPriorityBadge(skill.priority) as any}
                                                        className={`${
                                                            skill.priority === 'High' 
                                                                ? 'bg-red-100 text-red-700 border-red-200' 
                                                                : skill.priority === 'Medium'
                                                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                                : 'bg-green-100 text-green-700 border-green-200'
                                                        }`}
                                                    >
                                                        {skill.priority}
                                                    </Badge>
                                                 </div>
                                                 <CardDescription className="text-[#3E2F20]/70">
                                                     Current Score: <span className="font-bold text-[#3E2F20]">{skill.rating}%</span> • Gap: <span className="font-bold text-[#E8A87C]">{skill.gapScore}%</span>
                                                 </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-5 pt-0 grid sm:grid-cols-3 gap-3">
                                                {resources.map((res: any, resIdx: number) => (
                                                    <motion.a 
                                                        key={res.title} 
                                                        href={res.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="flex items-center gap-2 p-3 rounded-lg bg-white hover:bg-[#FAF7F3] border border-[#3E2F20]/10 hover:border-[#E8A87C] transition-all duration-300 group"
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.3 + idx * 0.1 + resIdx * 0.05 }}
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        <res.icon className="h-5 w-5 text-[#E8A87C] group-hover:scale-110 transition-transform" />
                                                        <span className="font-medium text-sm text-[#3E2F20] group-hover:text-[#E8A87C] transition-colors">
                                                            {res.type === 'video' ? 'Video' : res.type === 'article' ? 'Docs' : 'Practice'}
                                                        </span>
                                                    </motion.a>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="border-[#3E2F20]/10 shadow-lg rounded-2xl bg-gradient-to-br from-white to-[#FAF7F3]/50 sticky top-6">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-[#E8A87C]" />
                                    <CardTitle className="text-xl text-[#3E2F20]">Performance Summary</CardTitle>
                                </div>
                                <CardDescription className="text-[#3E2F20]/70">Latest mock interview results</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <motion.div 
                                        className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-br from-[#3E2F20]/5 to-[#E8A87C]/5"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                    >
                                        <span className="text-sm text-[#3E2F20]/70">Overall Score:</span>
                                        <motion.span 
                                            className="text-3xl font-bold bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            {selectedSession?.overallScore || 0}%
                                        </motion.span>
                                    </motion.div>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Skills Tested', value: skills.length, icon: Target },
                                            { label: 'High Priority', value: skills.filter(s => s.priority === 'High').length, icon: AlertCircle }
                                        ].map((stat, idx) => (
                                            <motion.div
                                                key={stat.label}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.6 + idx * 0.1 }}
                                                className="flex justify-between items-center p-3 rounded-lg bg-white border border-[#3E2F20]/10"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <stat.icon className="h-4 w-4 text-[#E8A87C]" />
                                                    <span className="text-sm text-[#3E2F20]/70">{stat.label}:</span>
                                                </div>
                                                <span className="font-bold text-[#3E2F20]">{stat.value}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border-[#3E2F20]/10 shadow-lg rounded-2xl bg-gradient-to-br from-white to-[#FAF7F3]/50">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-[#E8A87C]" />
                                    <CardTitle className="text-xl text-[#3E2F20]">15-Minute Tasks</CardTitle>
                                </div>
                                <CardDescription className="text-[#3E2F20]/70">
                                    High-impact tasks you can do right now.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                               <ul className="space-y-3">
                                   {topSkills.slice(0, 3).map((skill, idx) => (
                                       <motion.li 
                                           key={idx} 
                                           className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[#3E2F20]/10 hover:border-[#E8A87C] transition-all duration-300"
                                           initial={{ opacity: 0, x: -10 }}
                                           animate={{ opacity: 1, x: 0 }}
                                           transition={{ delay: 0.7 + idx * 0.1 }}
                                           whileHover={{ x: 4 }}
                                       >
                                           <CheckCircle className="h-5 w-5 mt-0.5 text-[#E8A87C] flex-shrink-0"/>
                                           <span className="text-sm text-[#3E2F20]">
                                               Review <span className="font-semibold text-[#E8A87C]">{skill.name}</span> fundamentals and key concepts.
                                           </span>
                                       </motion.li>
                                   ))}
                               </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        )
    };


    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-[#FAF7F3] p-4 md:p-6 space-y-6 relative overflow-hidden">
            {/* Floating Background Blobs */}
            <motion.div
                className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E8A87C]/10 to-[#D4B68A]/10 rounded-full blur-3xl -z-0"
                animate={{
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-[#3E2F20]/10 to-[#E8A87C]/10 rounded-full blur-3xl -z-0"
                animate={{
                    x: [0, 80, 0],
                    y: [0, -80, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Header */}
            <motion.div 
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="h-8 w-8 text-[#E8A87C]" />
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent">
                            Learning Paths
                        </h1>
                    </div>
                    <p className="text-[#3E2F20]/70 text-base">Prepare for multiple job roles simultaneously</p>
                </div>
                <Tabs value={mode} onValueChange={(value) => setMode(value as ViewMode)} className="w-auto">
                    <TabsList className="grid w-full grid-cols-2 bg-white border border-[#3E2F20]/10 p-1">
                        <TabsTrigger 
                            value="full" 
                            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3E2F20] data-[state=active]:to-[#E8A87C] data-[state=active]:text-white transition-all duration-300"
                        >
                            <BookOpen className="h-5 w-5"/>
                            Full Prep
                        </TabsTrigger>
                        <TabsTrigger 
                            value="sprint" 
                            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3E2F20] data-[state=active]:to-[#E8A87C] data-[state=active]:text-white transition-all duration-300"
                        >
                            <Zap className="h-5 w-5"/>
                            Quick Sprint
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </motion.div>
           
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-4 gap-6 items-start relative z-10">
                 {/* Left Sidebar - Job Roles */}
                 <div className="lg:col-span-1">
                    <JobRoleSelector />
                 </div>
                 
                 {/* Main Learning Path Content */}
                 <div className="lg:col-span-3">
                    {/* Skill Gap Overview - Horizontal at top */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-4"
                    >
                        <Card className="border-[#3E2F20]/10 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-gradient-to-br from-white to-[#FAF7F3]/50">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-[#E8A87C]" />
                                    <CardTitle className="text-lg text-[#3E2F20]">Skill Gap Overview</CardTitle>
                                </div>
                                <CardDescription className="text-xs text-[#3E2F20]/70">
                                    Skills for <span className="font-semibold text-[#E8A87C]">"{selectedSession?.jobRole || 'Latest Role'}"</span>
                                    {selectedSession?.jobCompany && ` at ${selectedSession.jobCompany}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                    {skills.map((skill, idx) => (
                                        <motion.div
                                            key={skill.name}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-2 rounded-lg bg-white border border-[#3E2F20]/10 hover:border-[#E8A87C] transition-all duration-300 hover:shadow-md text-center"
                                            whileHover={{ y: -2 }}
                                        >
                                            <div className={`w-6 h-6 rounded-full ${getRatingColor(skill.rating)} mx-auto mb-1.5`} />
                                            <div className="font-semibold text-xs text-[#3E2F20] mb-0.5 truncate" title={skill.name}>
                                                {skill.name}
                                            </div>
                                            <div className="text-xs text-[#3E2F20]/60">{skill.rating}%</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Learning Path Content */}
                    {mode === 'full' ? <FullPrepMode /> : <QuickSprintMode />}
                 </div>
            </div>
        </div>
    );
}
