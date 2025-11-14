'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, ChevronDown, Loader2, Send, Sparkles, Star, BookOpen, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Bar, BarChart, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

// --- MOCK DATA ---
const mockInterviewData = {
  jobInfo: {
    role: "Senior Frontend Engineer",
    company: "Vercel",
    difficulty: "Hard",
    skills: ["React", "TypeScript", "System Design", "GraphQL", "Next.js"]
  },
  fullPrep: {
    questions: [
      { id: "q1", skill: "React", questionText: "Explain the difference between a Presentational and a Container component in React.", status: "answered", score: 85, feedback: "Good explanation, but you could have mentioned Hooks as a more modern way to handle state in functional components.", strengths: ["Clear definition", "Mentioned separation of concerns"], weaknesses: ["Did not mention modern patterns (Hooks)"] },
      { id: "q2", skill: "React", questionText: "How does the virtual DOM work and what are its benefits?", status: "answered", score: 92, feedback: "Excellent answer. You clearly understand the diffing algorithm and performance benefits.", strengths: ["Detailed explanation of diffing", "Correctly identified performance gains"], weaknesses: [] },
      { id: "q3", skill: "System Design", questionText: "How would you design a scalable notification system?", status: "unanswered" },
      { id: "q4", skill: "TypeScript", questionText: "What are mapped types in TypeScript and provide an example.", status: "unanswered" },
      { id: "q5", skill: "Next.js", questionText: "Describe the differences between getServerSideProps, getStaticProps, and Incremental Static Regeneration (ISR).", status: "unanswered" },
    ],
    summary: {
      overallScore: 88,
      weakestSkill: "System Design",
      strongestSkill: "React",
      detailedFeedback: "You have a strong command of React fundamentals. Your main area for improvement is in large-scale system design, where you need to think more about distributed components and trade-offs. Practice more on designing systems like news feeds or notification services.",
      nextSteps: ["Review common system design patterns.", "Practice a medium-difficulty System Design question on a whiteboard.", "Read about TypeScript's utility types."]
    }
  },
  quickSprint: {
    questions: [
        { id: "qs1", skill: "React", questionText: "What is a React Hook?", status: "answered", tag: "Strong", quickFeedback: "Correct and concise.", fundamental: "Core concept of modern React state and lifecycle." },
        { id: "qs2", skill: "System Design", questionText: "What is a load balancer?", status: "answered", tag: "Medium", quickFeedback: "Good, but could mention different balancing algorithms.", fundamental: "Key component for scalability." },
        { id: "qs3", skill: "TypeScript", questionText: "What is the difference between an interface and a type in TypeScript?", status: "unanswered" },
    ],
    summary: {
        fundamentals: ["React Hooks", "State Management", "Component Lifecycle", "Load Balancing", "API Design (REST vs GraphQL)"],
        topQuestions: ["What are the benefits of Next.js?", "How do you handle state in a large React application?", "Explain the CAP theorem.", "What are microservices?", "Describe a recent challenging technical problem you solved."],
        miniTasks: ["Whiteboard a simple URL shortener service.", "Review the TypeScript handbook on utility types."]
    }
  }
};
// --- END MOCK DATA ---

type ViewMode = 'fullPrep' | 'quickSprint';

const QuestionCard = ({ question, mode }: { question: any; mode: ViewMode }) => {
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isAnswered, setIsAnswered] = useState(question.status === 'answered');

  const handleSubmit = () => {
    if (!answer) return;
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setIsAnswered(true);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Question</CardTitle>
            <CardDescription className="mt-1">
              {question.skill}
            </CardDescription>
          </div>
          <Badge variant="secondary">{mode === 'fullPrep' ? "Deep Dive" : "Quick Check"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-semibold">{question.questionText}</p>
        <Textarea
          placeholder="Your answer..."
          rows={mode === 'fullPrep' ? 8 : 4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isEvaluating || isAnswered}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        {!isAnswered ? (
          <Button onClick={handleSubmit} disabled={!answer || isEvaluating}>
            {isEvaluating ? <Loader2 className="animate-spin" /> : <Send />}
            {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
};

const EvaluationCard = ({ question, mode }: { question: any, mode: ViewMode }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {mode === 'fullPrep' ? (
                <>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Your Score</p>
                        <p className="text-5xl font-bold">{question.score}%</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Strengths:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {question.strengths.map((s: string) => <li key={s}>{s}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Areas for Improvement:</h4>
                         <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {question.weaknesses.map((w: string) => <li key={w}>{w}</li>)}
                        </ul>
                    </div>
                </>
            ) : (
                <>
                    <div className="text-center">
                         <Badge variant={question.tag === 'Strong' ? 'default' : question.tag === 'Medium' ? 'secondary' : 'destructive'} className="text-2xl font-bold px-4 py-2">{question.tag}</Badge>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Feedback:</h4>
                        <p className="text-sm text-muted-foreground">{question.quickFeedback}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Fundamental to Review:</h4>
                        <p className="text-sm text-muted-foreground">{question.fundamental}</p>
                    </div>
                </>
            )}
        </CardContent>
    </Card>
);

const FullPrepSummary = ({ summary }: { summary: any }) => (
    <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
            <CardTitle>Full Prep Session Complete!</CardTitle>
            <CardDescription>Here's a detailed breakdown of your performance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
             <div className="text-center">
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-7xl font-bold text-primary">{summary.overallScore}%</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-secondary/50 p-3 rounded-lg text-center">
                    <p className="font-semibold">Strongest Skill</p>
                    <p className="text-green-500">{summary.strongestSkill}</p>
                </div>
                 <div className="bg-secondary/50 p-3 rounded-lg text-center">
                    <p className="font-semibold">Weakest Skill</p>
                    <p className="text-red-500">{summary.weakestSkill}</p>
                </div>
            </div>
            <div>
                 <h4 className="font-semibold mb-2 text-center">AI Coach Summary</h4>
                 <p className="text-sm text-muted-foreground italic text-center">"{summary.detailedFeedback}"</p>
            </div>
             <div>
                <h4 className="font-semibold mb-2 text-center">Recommended Next Steps</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground mx-auto max-w-md">
                    {summary.nextSteps.map((step: string) => <li key={step}>{step}</li>)}
                </ul>
            </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
            <Button asChild><Link href="/learning-path">Update Learning Path (Full Prep)</Link></Button>
            <Button variant="outline" asChild><Link href="/dashboard">Go to Dashboard</Link></Button>
        </CardFooter>
    </Card>
);

const QuickSprintSummary = ({ summary }: { summary: any }) => (
     <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
            <CardTitle>Quick Sprint Complete!</CardTitle>
            <CardDescription>Here's your quick boost summary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold mb-3 text-center flex items-center justify-center gap-2"><Star className="text-yellow-400"/> Top 5 Fundamentals to Review</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {summary.fundamentals.map((f: string) => <li key={f}>{f}</li>)}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold mb-3 text-center flex items-center justify-center gap-2"><BookOpen className="text-primary"/> 10 Most Asked Questions</h4>
                    <ul className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                        {summary.topQuestions.slice(0, 5).map((q: string) => <li key={q}>{q}</li>)}
                    </ul>
                </div>
            </div>
        </CardContent>
         <CardFooter className="flex justify-center gap-4">
            <Button asChild><Link href="/learning-path">Update Learning Path (Quick Sprint)</Link></Button>
            <Button variant="outline" asChild><Link href="/dashboard">Go to Dashboard</Link></Button>
        </CardFooter>
    </Card>
);


export default function MockInterviewPage() {
    const [mode, setMode] = useState<ViewMode>('fullPrep');
    const [selectedSkill, setSelectedSkill] = useState('All');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const interviewState = mockInterviewData[mode];
    const questions = interviewState.questions;
    const currentQuestion = questions[currentQuestionIndex];
    const isSessionComplete = currentQuestionIndex >= questions.length;

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    
    if (isSessionComplete) {
         return (
            <div className="flex-1 flex items-center justify-center p-4">
                {mode === 'fullPrep' ? <FullPrepSummary summary={mockInterviewData.fullPrep.summary} /> : <QuickSprintSummary summary={mockInterviewData.quickSprint.summary} />}
            </div>
         )
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Tabs value={mode} onValueChange={(value) => setMode(value as ViewMode)} className="w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="fullPrep" className="gap-2"><BookOpen /> Full Prep</TabsTrigger>
                        <TabsTrigger value="quickSprint" className="gap-2"><Zap /> Quick Sprint</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="w-full sm:w-auto">
                     <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Select a skill" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Skills</SelectItem>
                            {mockInterviewData.jobInfo.skills.map(skill => (
                                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                             <CardTitle>{mockInterviewData.jobInfo.role}</CardTitle>
                             <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
                        </div>
                         <Button variant="outline" size="sm" asChild><Link href="/dashboard"><ArrowLeft/> End Session</Link></Button>
                    </div>
                     <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mt-4" />
                </CardHeader>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <QuestionCard question={currentQuestion} mode={mode}/>
                </div>
                <div className="space-y-6 sticky top-20">
                     {currentQuestion.status === 'answered' ? <EvaluationCard question={currentQuestion} mode={mode} /> : (
                         <Card className="flex items-center justify-center min-h-[200px]">
                            <CardContent className="text-center text-muted-foreground p-6">
                                <p>Your feedback will appear here once you submit an answer.</p>
                            </CardContent>
                         </Card>
                     )}
                     {currentQuestion.status === 'answered' && (
                         <Button onClick={handleNextQuestion} className="w-full">
                            {currentQuestionIndex === questions.length - 1 ? "Finish & View Summary" : "Next Question"}
                         </Button>
                     )}
                </div>
            </div>

        </div>
    );
}
