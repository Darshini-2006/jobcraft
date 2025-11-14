'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Loader2, Send, Sparkles, Star, BookOpen, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { generateInterviewQuestions, GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import { evaluateUserAnswer, EvaluateUserAnswerOutput } from '@/ai/flows/evaluate-user-answer';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Question = GenerateInterviewQuestionsOutput['questions'][0] & {
    status: 'answered' | 'unanswered' | 'evaluating';
    userAnswer?: string;
    evaluation?: EvaluateUserAnswerOutput;
};

type SessionState = {
    jobDetails: any;
    resumeSkills: any;
    jobDescription: string;
    questions: Question[];
    currentQuestionIndex: number;
    isSessionComplete: boolean;
    isGenerating: boolean;
    error: string | null;
};

const QuestionCard = ({ question, answer, setAnswer, onSubmit, isEvaluating }: { question: Question; answer: string; setAnswer: (a: string) => void; onSubmit: () => void; isEvaluating: boolean }) => {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Question</CardTitle>
                        <CardDescription className="mt-1">
                            Skill: {question.skill}
                        </CardDescription>
                    </div>
                    <Badge variant="secondary">{question.difficulty}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-lg font-semibold">{question.questionText}</p>
                <Textarea
                    placeholder="Your answer..."
                    rows={8}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={isEvaluating || question.status === 'answered'}
                />
            </CardContent>
            <CardFooter className="flex justify-end">
                {question.status !== 'answered' && (
                    <Button onClick={onSubmit} disabled={!answer || isEvaluating}>
                        {isEvaluating && <Loader2 className="animate-spin" />}
                        {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

const EvaluationCard = ({ evaluation }: { evaluation: EvaluateUserAnswerOutput }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> AI Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="text-center">
                <p className="text-sm text-muted-foreground">Your Score</p>
                <p className="text-5xl font-bold">{evaluation.score}%</p>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Feedback:</h4>
                <p className="text-sm text-muted-foreground italic">"{evaluation.feedback}"</p>
            </div>
        </CardContent>
    </Card>
);

const SessionSummary = ({ questions, jobDetails }: { questions: Question[], jobDetails: any }) => {
    const totalScore = questions.reduce((acc, q) => acc + (q.evaluation?.score || 0), 0);
    const averageScore = Math.round(totalScore / questions.length);

    // Group scores by skill
    const skillScores: { [key: string]: { scores: number[], count: number } } = {};
    questions.forEach(q => {
        if (!q.evaluation) return;
        if (!skillScores[q.skill]) {
            skillScores[q.skill] = { scores: [], count: 0 };
        }
        skillScores[q.skill].scores.push(q.evaluation.score);
        skillScores[q.skill].count++;
    });

    const skillAverages = Object.entries(skillScores).map(([skill, data]) => ({
        skill,
        average: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count)
    })).sort((a, b) => a.average - b.average);

    const weakestSkill = skillAverages[0];
    const strongestSkill = skillAverages[skillAverages.length - 1];

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl">
                <CardHeader className="text-center">
                    <CardTitle>Session Complete!</CardTitle>
                    <CardDescription>Here's a breakdown of your performance for the {jobDetails.role} role.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                        <p className="text-7xl font-bold text-primary">{averageScore}%</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-secondary/50 p-3 rounded-lg text-center">
                            <p className="font-semibold">Strongest Skill</p>
                            <p className="text-green-500">{strongestSkill?.skill} ({strongestSkill?.average}%)</p>
                        </div>
                        <div className="bg-secondary/50 p-3 rounded-lg text-center">
                            <p className="font-semibold">Weakest Skill</p>
                            <p className="text-red-500">{weakestSkill?.skill} ({weakestSkill?.average}%)</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 text-center">Next Steps</h4>
                        <p className="text-sm text-muted-foreground italic text-center">
                            Your performance data will be used to update your dashboard and learning path.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    <Button asChild><Link href="/learning-path">View Learning Path</Link></Button>
                    <Button variant="outline" asChild><Link href="/dashboard">Go to Dashboard</Link></Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default function MockInterviewPage() {
    const { toast } = useToast();
    const [sessionState, setSessionState] = useState<SessionState>({
        jobDetails: null,
        resumeSkills: null,
        jobDescription: '',
        questions: [],
        currentQuestionIndex: 0,
        isSessionComplete: false,
        isGenerating: true,
        error: null,
    });
    const [currentAnswer, setCurrentAnswer] = useState('');

    useEffect(() => {
        const startSession = async () => {
            try {
                const jobDetailsStr = sessionStorage.getItem('jobDetails');
                const resumeSkillsStr = sessionStorage.getItem('resumeSkills');
                const jobDescription = sessionStorage.getItem('jobDescription');

                if (!jobDetailsStr || !resumeSkillsStr || !jobDescription) {
                    throw new Error("Interview data not found. Please start a new analysis first.");
                }

                const jobDetails = JSON.parse(jobDetailsStr);
                const resumeSkills = JSON.parse(resumeSkillsStr);

                const skillGaps = jobDetails.requiredSkills.filter((skill: string) => !resumeSkills.skills.includes(skill));

                const questionResponse = await generateInterviewQuestions({
                    jobDescription: jobDescription,
                    skillGaps: skillGaps,
                    difficulty: jobDetails.difficultyLevel,
                });
                
                if (!questionResponse || !questionResponse.questions || questionResponse.questions.length === 0) {
                     throw new Error("Failed to generate interview questions.");
                }

                const initialQuestions: Question[] = questionResponse.questions.map(q => ({ ...q, status: 'unanswered' }));

                setSessionState({
                    jobDetails,
                    resumeSkills,
                    jobDescription,
                    questions: initialQuestions,
                    currentQuestionIndex: 0,
                    isSessionComplete: false,
                    isGenerating: false,
                    error: null,
                });
            } catch (err: any) {
                console.error(err);
                toast({
                    variant: "destructive",
                    title: "Failed to Start Session",
                    description: err.message || "An unexpected error occurred.",
                });
                setSessionState(prev => ({ ...prev, isGenerating: false, error: err.message }));
            }
        };

        startSession();
    }, [toast]);
    
    const handleSubmitAnswer = async () => {
        const { questions, currentQuestionIndex } = sessionState;
        const currentQuestion = questions[currentQuestionIndex];

        setSessionState(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => i === currentQuestionIndex ? { ...q, status: 'evaluating' } : q)
        }));

        try {
            const evaluation = await evaluateUserAnswer({
                questionText: currentQuestion.questionText,
                userAnswer: currentAnswer,
                skill: currentQuestion.skill,
                difficulty: currentQuestion.difficulty,
            });

            setSessionState(prev => ({
                ...prev,
                questions: prev.questions.map((q, i) =>
                    i === currentQuestionIndex ? { ...q, status: 'answered', userAnswer: currentAnswer, evaluation } : q
                )
            }));
            setCurrentAnswer('');
        } catch (err: any) {
            console.error("Evaluation failed:", err);
            toast({ variant: 'destructive', title: 'Evaluation Failed', description: 'Could not get feedback from AI.' });
            setSessionState(prev => ({
                ...prev,
                questions: prev.questions.map((q, i) => i === currentQuestionIndex ? { ...q, status: 'unanswered' } : q)
            }));
        }
    };

    const handleNextQuestion = () => {
        if (sessionState.currentQuestionIndex < sessionState.questions.length - 1) {
            setSessionState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
        } else {
            setSessionState(prev => ({ ...prev, isSessionComplete: true }));
        }
    };

    if (sessionState.isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                 <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                 <h2 className="text-2xl font-semibold mb-2">Generating Your Interview...</h2>
                 <p className="text-muted-foreground">Our AI is crafting personalized questions based on your resume and the job description.</p>
                 <div className="w-full max-w-md mt-8 space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-40 w-full" />
                 </div>
            </div>
        );
    }
    
    if (sessionState.error) {
         return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                 <h2 className="text-2xl font-semibold mb-2 text-destructive">Error</h2>
                 <p className="text-muted-foreground mb-4">{sessionState.error}</p>
                 <Button asChild>
                    <Link href="/analysis/new">Start a New Analysis</Link>
                 </Button>
            </div>
         )
    }

    if (sessionState.isSessionComplete) {
        return <SessionSummary questions={sessionState.questions} jobDetails={sessionState.jobDetails} />;
    }

    const { questions, currentQuestionIndex, jobDetails } = sessionState;
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="p-4 md:p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{jobDetails?.role || 'Mock Interview'}</CardTitle>
                            <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild><Link href="/dashboard"><ArrowLeft /> End Session</Link></Button>
                    </div>
                    <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mt-4" />
                </CardHeader>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {currentQuestion && (
                        <QuestionCard
                            question={currentQuestion}
                            answer={currentAnswer}
                            setAnswer={setCurrentAnswer}
                            onSubmit={handleSubmitAnswer}
                            isEvaluating={currentQuestion.status === 'evaluating'}
                        />
                    )}
                </div>
                <div className="space-y-6 sticky top-20">
                    {currentQuestion?.status === 'answered' && currentQuestion.evaluation ? (
                        <EvaluationCard evaluation={currentQuestion.evaluation} />
                    ) : (
                        <Card className="flex items-center justify-center min-h-[200px]">
                            <CardContent className="text-center text-muted-foreground p-6">
                                <p>Your feedback will appear here once you submit an answer.</p>
                            </CardContent>
                        </Card>
                    )}
                    {currentQuestion?.status === 'answered' && (
                        <Button onClick={handleNextQuestion} className="w-full">
                            {currentQuestionIndex === questions.length - 1 ? "Finish & View Summary" : "Next Question"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
