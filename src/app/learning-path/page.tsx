'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, BookOpen, Video, Code, FileText, Target, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

const getPriorityBadge = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
        case 'High': return 'destructive';
        case 'Medium': return 'secondary';
        case 'Low': return 'outline';
        default: return 'default';
    }
}

const getRatingColor = (rating: number) => {
    if (rating <= 1) return 'bg-red-500';
    if (rating <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
}

export default function LearningPathPage() {
    const [mode, setMode] = useState<ViewMode>('full');

    const SkillGapOverview = () => (
        <Card>
            <CardHeader>
                <CardTitle>Skill Gap Overview</CardTitle>
                <CardDescription>Your skills compared to the "Senior Frontend Engineer" role at Vercel.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockLearningData.skills.map(skill => (
                        <div key={skill.name}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold">{skill.name}</span>
                                <Badge variant={getPriorityBadge(skill.priority as any)}>{skill.priority} Priority</Badge>
                            </div>
                            <Progress value={(skill.rating / 5) * 100} className="h-3" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>Your Level: {skill.resumeLevel}</span>
                                <span>Required: {skill.requiredLevel}</span>
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
                 {mockLearningData.skills.map((skill, index) => (
                    <AccordionItem key={skill.name} value={`item-${index}`}>
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-4">
                                <div className={`w-4 h-4 rounded-full ${getRatingColor(skill.rating)}`}></div>
                                {skill.name}
                                <Badge variant={getPriorityBadge(skill.priority as any)}>{skill.priority}</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 bg-card rounded-b-md border-t-0">
                            <p className="text-muted-foreground mb-4 italic">"{skill.explanation}"</p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/> Learning Resources</h4>
                                    <div className="space-y-2">
                                        {(mockLearningData.fullPrep.resources as any)[skill.name]?.map((res: any) => (
                                             <a href={res.url} key={res.title} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                                                <res.icon className="h-5 w-5 text-muted-foreground" />
                                                <span className="text-sm font-medium text-primary hover:underline">{res.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Project Suggestion</h4>
                                    {(mockLearningData.fullPrep.projects as any)[skill.name] ? (
                                        <div className="p-3 rounded-md bg-muted/50">
                                            <p className="font-semibold">{(mockLearningData.fullPrep.projects as any)[skill.name].name}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{(mockLearningData.fullPrep.projects as any)[skill.name].description}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {(mockLearningData.fullPrep.projects as any)[skill.name].techStack.map((tech: string) => <Badge variant="secondary" key={tech}>{tech}</Badge>)}
                                            </div>
                                        </div>
                                    ) : <p className="text-sm text-muted-foreground">No specific project suggestion for this skill.</p>}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                 ))}
            </Accordion>
        </div>
    );
    
    const QuickSprintMode = () => {
        const topSkillsData = mockLearningData.skills.filter(s => mockLearningData.quickSprint.topSkills.includes(s.name));
        return (
             <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 3 Skills to Sprint</CardTitle>
                             <CardDescription>Focus on these high-impact areas for quick improvement.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        {topSkillsData.map(skill => (
                            <Card key={skill.name}>
                                <CardHeader className="p-4">
                                     <CardTitle className="text-lg">{skill.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 grid sm:grid-cols-3 gap-2 text-sm">
                                    <a href={(mockLearningData.quickSprint.resources as any)[skill.name].video.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                                        <Video className="h-4 w-4 text-primary" /> <span className="font-medium">Quick Video</span>
                                    </a>
                                     <a href={(mockLearningData.quickSprint.resources as any)[skill.name].cheatsheet.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                                        <FileText className="h-4 w-4 text-primary" /> <span className="font-medium">Cheatsheet</span>
                                    </a>
                                     <a href={(mockLearningData.quickSprint.resources as any)[skill.name].practice.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                                        <Code className="h-4 w-4 text-primary" /> <span className="font-medium">Practice</span>
                                    </a>
                                </CardContent>
                            </Card>
                        ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 5 Questions</CardTitle>
                            <CardDescription>Be ready for these common questions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ul className="space-y-3 text-sm list-disc list-inside">
                                {mockLearningData.quickSprint.topQuestions.slice(0,5).map(q => <li key={q}>{q}</li>)}
                           </ul>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>15-Minute Tasks</CardTitle>
                            <CardDescription>High-impact tasks you can do right now.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ul className="space-y-3 text-sm">
                               <li className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 text-primary"/><span>Review the Kubernetes pod lifecycle diagram.</span></li>
                               <li className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 text-primary"/><span>Whiteboard the main components of a caching system.</span></li>
                           </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    };


    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex justify-center">
                 <Tabs value={mode} onValueChange={(value) => setMode(value as ViewMode)} className="w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="full" className="gap-2"><BookOpen className="h-5 w-5"/> Full Prep</TabsTrigger>
                        <TabsTrigger value="sprint" className="gap-2"><Zap className="h-5 w-5"/> Quick Sprint</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
           
            <div className="grid lg:grid-cols-4 gap-6 items-start">
                 <div className="lg:col-span-1 lg:sticky top-20">
                    <SkillGapOverview />
                 </div>
                 <div className="lg:col-span-3">
                    {mode === 'full' ? <FullPrepMode /> : <QuickSprintMode />}
                 </div>
            </div>
        </div>
    );
}
