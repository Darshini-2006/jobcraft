'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Sparkles, Lock, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { generateInterviewQuestions, GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import { evaluateUserAnswer, EvaluateUserAnswerOutput } from '@/ai/flows/evaluate-user-answer';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/provider';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';


type Question = GenerateInterviewQuestionsOutput['questions'][0] & {
    id?: string; // Firestore document ID
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
    sessionId: string | null;
    isReady: boolean; // New state to check if ready for interview
};

const LockedState = ({ resumeUploaded, jdUploaded }: { resumeUploaded: boolean; jdUploaded: boolean }) => (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6 text-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 text-xl font-semibold text-destructive">
            <Lock className="h-6 w-6" />
            <span>Mock Interview Locked</span>
          </div>
          <CardDescription>
            Upload your Resume and Job Description to unlock personalized AI interview modes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Progress Indicator */}
          <div className="w-full max-w-md mx-auto space-y-4">
            <h3 className="font-semibold">Setup Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Step 1: Upload Resume</span>
                {resumeUploaded ? <CheckCircle className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Step 2: Paste Job Description</span>
                {jdUploaded ? <CheckCircle className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-muted-foreground">
                <span className="font-medium">Step 3: Start Mock Interview</span>
                <Lock className="h-6 w-6" />
              </div>
            </div>
          </div>
  
          {/* Call to Action Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="text-left">
              <CardHeader>
                <CardTitle>1. Upload Your Resume</CardTitle>
                <CardDescription>Used to understand your existing skills and experience.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/resume/edit">Go to Resume Editor</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="text-left">
              <CardHeader>
                <CardTitle>2. Add Job Description</CardTitle>
                <CardDescription>Used to identify required skills for your target role.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/analysis/new">Go to Job Analysis</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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

const SessionSummary = ({ questions, jobDetails, onSave }: { questions: Question[], jobDetails: any, onSave: () => Promise<void> }) => {
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const totalScore = questions.reduce((acc, q) => acc + (q.evaluation?.score || 0), 0);
    const averageScore = Math.round(totalScore / questions.length);

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
    
    const handleFinish = async () => {
        setIsSaving(true);
        try {
            await onSave();
            toast({ title: "Session Saved!", description: "Your progress has been updated on the dashboard." });
            // Redirect after a short delay
            setTimeout(() => window.location.href = '/dashboard', 1000);
        } catch (error) {
            console.error("Failed to save session:", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save session data.' });
            setIsSaving(false);
        }
    };


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
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    <Button onClick={handleFinish} disabled={isSaving}>
                        {isSaving && <Loader2 className="animate-spin mr-2" />}
                        Finish & Go to Dashboard
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default function MockInterviewPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const [sessionState, setSessionState] = useState<SessionState>({
        jobDetails: null,
        resumeSkills: null,
        jobDescription: '',
        questions: [],
        currentQuestionIndex: 0,
        isSessionComplete: false,
        isGenerating: true,
        error: null,
        sessionId: null,
        isReady: false, // Default to not ready
    });
    const [currentAnswer, setCurrentAnswer] = useState('');

    useEffect(() => {
        const startSession = async () => {
            const jobDetailsStr = sessionStorage.getItem('jobDetails');
            const resumeSkillsStr = sessionStorage.getItem('resumeSkills');
            
            if (!jobDetailsStr || !resumeSkillsStr) {
                setSessionState(prev => ({ ...prev, isGenerating: false, isReady: false }));
                return; // Exit if data is not present
            }

            setSessionState(prev => ({...prev, isReady: true }));

            if (!user || !firestore) return;

            try {
                const jobDescription = sessionStorage.getItem('jobDescription');

                if (!jobDescription) {
                    throw new Error("Interview data not found. Please start a new analysis first.");
                }

                const jobDetails = JSON.parse(jobDetailsStr);
                const resumeSkills = JSON.parse(resumeSkillsStr);

                // Create skill gap analysis and save to Firestore
                const matchedSkills = resumeSkills.skills.filter((skill: string) => jobDetails.requiredSkills.includes(skill));
                const missingSkills = jobDetails.requiredSkills.filter((skill: string) => !resumeSkills.skills.includes(skill));

                const skillGapRef = collection(firestore, 'skill_gaps');
                await addDocumentNonBlocking(skillGapRef, {
                    userId: user.uid,
                    jobDescriptionId: jobDetails.role, // Assuming role is unique for now
                    matchedSkills,
                    missingSkills,
                    createdAt: serverTimestamp(),
                });

                // Create a new session document
                const sessionRef = collection(firestore, 'sessions');
                const newSession = {
                    userId: user.uid,
                    jobDescriptionId: jobDetails.role,
                    createdAt: serverTimestamp(),
                    currentQuestionIndex: 0,
                    overallScore: null,
                    skillScores: {},
                    readinessPercentage: null,
                };
                const sessionDoc = await addDocumentNonBlocking(sessionRef, newSession);
                if (!sessionDoc?.id) throw new Error("Could not create session.");

                const questionResponse = await generateInterviewQuestions({
                    jobDescription: jobDescription,
                    skillGaps: missingSkills,
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
                    sessionId: sessionDoc.id,
                    isReady: true,
                });
            } catch (err: any) {
                console.error(err);
                let description = err.message || "An unexpected error occurred.";
                if (err?.message?.includes('503')) {
                    description = 'The AI service is temporarily overloaded. Please wait a moment and try again.'
                }

                toast({
                    variant: "destructive",
                    title: "Failed to Start Session",
                    description: description,
                });
                setSessionState(prev => ({ ...prev, isGenerating: false, error: description, isReady: true }));
            }
        };

        startSession();
    }, [toast, user, firestore]);
    
    const handleSubmitAnswer = async () => {
        const { questions, currentQuestionIndex, sessionId } = sessionState;
        if (!sessionId) return;
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
    
    const handleSaveSession = async () => {
        if (!user || !firestore || !sessionState.sessionId) {
            throw new Error("Cannot save session. User or session not initialized.");
        }
        
        const { questions, sessionId } = sessionState;

        // 1. Save all questions to the subcollection
        const questionsRef = collection(firestore, 'sessions', sessionId, 'questions');
        for (const q of questions) {
            if (q.status === 'answered') {
                await addDocumentNonBlocking(questionsRef, {
                    skill: q.skill,
                    difficulty: q.difficulty,
                    questionText: q.questionText,
                    userAnswer: q.userAnswer,
                    aiFeedback: q.evaluation?.feedback,
                    score: q.evaluation?.score,
                });
            }
        }

        // 2. Calculate final scores
        const totalScore = questions.reduce((acc, q) => acc + (q.evaluation?.score || 0), 0);
        const overallScore = Math.round(totalScore / questions.length);

        const skillScores: { [key: string]: number } = {};
        const skillCounts: { [key: string]: number } = {};
        questions.forEach(q => {
            if (q.evaluation) {
                skillScores[q.skill] = (skillScores[q.skill] || 0) + q.evaluation.score;
                skillCounts[q.skill] = (skillCounts[q.skill] || 0) + 1;
            }
        });
        const finalSkillScores: { [key: string]: number } = {};
        for (const skill in skillScores) {
            finalSkillScores[skill] = Math.round(skillScores[skill] / skillCounts[skill]);
        }
        
        // 3. Update the session document
        const sessionDocRef = doc(firestore, 'sessions', sessionId);
        await setDocumentNonBlocking(sessionDocRef, {
            overallScore,
            skillScores: finalSkillScores,
            readinessPercentage: overallScore, // Simplified for now
            completedAt: serverTimestamp(),
            // summary: 'AI summary would go here' // TODO: Add AI summary generation flow
        }, { merge: true });

        // 4. Update the user's main readiness score
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDocumentNonBlocking(userDocRef, {
            readinessScore: overallScore,
            email: user.email,
            id: user.uid,
        }, { merge: true });
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
    
    if (!sessionState.isReady) {
        const hasResume = !!sessionStorage.getItem('resumeSkills');
        const hasJd = !!sessionStorage.getItem('jobDetails');
        return <LockedState resumeUploaded={hasResume} jdUploaded={hasJd} />;
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
        return <SessionSummary questions={sessionState.questions} jobDetails={sessionState.jobDetails} onSave={handleSaveSession} />;
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
