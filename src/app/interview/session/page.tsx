'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  query,
  limit,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { useAuth, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import React from 'react';
import { type ParseResumeSkillsOutput } from '@/ai/flows/parse-resume-skills';
import { type ParseJobDescriptionOutput } from '@/ai/flows/parse-job-description';
import {
  generateInterviewQuestions,
} from '@/ai/flows/generate-interview-questions';
import { evaluateUserAnswer } from '@/ai/flows/evaluate-user-answer';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { type WithId, useCollection } from '@/firebase/firestore/use-collection';
import { type Question } from '@/lib/types';
import Link from 'next/link';

function InterviewSession() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [jobDetails, setJobDetails] =
    useState<ParseJobDescriptionOutput | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the current question
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Fetch questions for the current session
  const questionsQuery = useMemoFirebase(() => {
    if (!firestore || !sessionId) return null;
    return query(collection(firestore, 'sessions', sessionId, 'questions'), orderBy('createdAt', 'asc'));
  }, [firestore, sessionId]);

  const { data: questions, isLoading: isLoadingQuestions } = useCollection<Question>(questionsQuery);
  
  const totalQuestions = questions?.length || 0;
  const currentQuestion = questions?.[currentQuestionIndex];
  const isSessionComplete = currentQuestionIndex >= totalQuestions && totalQuestions > 0;


  // Start session and generate questions
  useEffect(() => {
    if (isUserLoading || !user || !firestore) return;

    const startSession = async () => {
      setIsStartingSession(true);
      setError(null);
      try {
        const jdString = sessionStorage.getItem('jobDetails');
        const rsString = sessionStorage.getItem('resumeSkills');
        const jobDescText = sessionStorage.getItem('jobDescription');

        if (!jdString || !rsString || !jobDescText) {
          throw new Error('Session data not found. Please start a new analysis.');
        }

        const jd: ParseJobDescriptionOutput = JSON.parse(jdString);
        const rs: ParseResumeSkillsOutput = JSON.parse(rsString);
        setJobDetails(jd);

        // 1. Create a new session document
        const sessionRef = await addDoc(collection(firestore, 'sessions'), {
          userId: user.uid,
          jobDescriptionText: jobDescText,
          jobDetails: jd,
          createdAt: serverTimestamp(),
          currentQuestionIndex: 0,
          overallScore: null,
        });
        setSessionId(sessionRef.id);

        // 2. Generate Questions
        const skillGaps = jd.requiredSkills.filter(
          (skill) => !rs.skills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
        );

        const questionResponse = await generateInterviewQuestions({
          jobDescription: jobDescText,
          skillGaps: skillGaps,
          difficulty: jd.difficultyLevel,
        });

        // 3. Save questions to subcollection
        const batch = writeBatch(firestore);
        questionResponse.questions.forEach((q) => {
          const questionRef = doc(collection(firestore, 'sessions', sessionRef.id, 'questions'));
          batch.set(questionRef, { ...q, userAnswer: '', aiFeedback: '', score: null, createdAt: serverTimestamp() });
        });
        await batch.commit();

      } catch (e: any) {
        console.error('Failed to start session:', e);
        setError(e.message || 'An unknown error occurred.');
        toast({
          variant: 'destructive',
          title: 'Failed to Start Session',
          description: e.message,
        });
      } finally {
        setIsStartingSession(false);
      }
    };

    startSession();
  }, [user, firestore, isUserLoading, toast]);


  const handleSubmitAnswer = async () => {
    if (!userAnswer || !currentQuestion || !sessionId || !firestore) return;
    setIsEvaluating(true);

    try {
      const result = await evaluateUserAnswer({
        questionText: currentQuestion.questionText,
        userAnswer: userAnswer,
        skill: currentQuestion.skill,
        difficulty: currentQuestion.difficulty,
      });

      const questionRef = doc(firestore, 'sessions', sessionId, 'questions', currentQuestion.id);
      await updateDoc(questionRef, {
        userAnswer,
        aiFeedback: result.feedback,
        score: result.score,
      });

    } catch (error: any) {
      console.error('Failed to evaluate answer:', error);
       let description = 'Something went wrong. Please try again.';
        if (error?.message?.includes('503')) {
          description = 'The AI service is temporarily overloaded. Please wait a moment and try submitting again.'
        }
        toast({
          variant: 'destructive',
          title: 'Evaluation Failed',
          description: description,
        });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions -1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
    } else {
        // Last question was answered, move to summary
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (isStartingSession || isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center" style={{height: 'calc(100vh - 8rem)'}}>
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-2">
          Preparing Your Mock Interview...
        </h2>
        <p className="text-muted-foreground max-w-md">
          Our AI is crafting a personalized set of interview questions based on
          the role of <span className="font-bold">{jobDetails?.role || '...'}</span> and your resume.
        </p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center" style={{height: 'calc(100vh - 8rem)'}}>
        <h2 className="text-2xl font-semibold mb-2 text-destructive">
          Failed to Start Interview
        </h2>
        <p className="text-muted-foreground max-w-md">
         {error}
        </p>
         <Button onClick={() => router.push('/analysis/new')} className="mt-4">
            Start New Analysis
          </Button>
      </div>
    );
  }

  if (isSessionComplete) {
    return <SessionSummary questions={questions} jobDetails={jobDetails}/>
  }
  
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const answerSubmitted = !!currentQuestion?.aiFeedback;

  return (
    <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle>Interview for {jobDetails?.role}</CardTitle>
                    <CardDescription>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline">{currentQuestion?.skill}</Badge>
                    <Badge variant="secondary">{currentQuestion?.type}</Badge>
                </div>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            <div className="p-6 bg-secondary/50 rounded-lg min-h-[100px]">
                {isLoadingQuestions ? <Loader2 className="animate-spin"/> : 
                <p className="text-lg font-semibold">
                    {currentQuestion?.questionText}
                </p>}
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              <label htmlFor="answer" className="font-medium">
                Your Answer
              </label>
              <Textarea
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here."
                className="flex-1 text-base"
                rows={8}
                disabled={isEvaluating || answerSubmitted}
              />
            </div>
          </CardContent>
          <div className="flex justify-between p-4 border-t items-center">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="mr-2"/> End Session
              </Button>
              {answerSubmitted ? (
                 <Button onClick={handleNextQuestion}>
                    {currentQuestionIndex === totalQuestions - 1 ? 'Finish & View Summary' : 'Next Question'} <ArrowRight className="ml-2"/>
                </Button>
              ) : (
                <Button onClick={handleSubmitAnswer} disabled={!userAnswer || isEvaluating || answerSubmitted}>
                    {isEvaluating ? <><Loader2 className="mr-2 animate-spin"/> Evaluating...</> : <><Check className="mr-2"/>Submit Answer</>}
                </Button>
              )}
            </div>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className='sticky top-20'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary"/>
                AI Feedback
            </CardTitle>
            <CardDescription>
                Real-time evaluation of your answer.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {isEvaluating && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="font-semibold">Evaluating your answer...</p>
                </div>
            )}
            {!isEvaluating && !answerSubmitted && (
                 <div className="flex flex-col items-center justify-center h-full text-center p-4 rounded-lg bg-secondary/30">
                    <p className="font-medium">Your feedback will appear here once you submit your answer.</p>
                </div>
            )}
            {answerSubmitted && (
                 <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Your Score</p>
                        <p className="text-5xl font-bold">{currentQuestion?.score}%</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Feedback:</h4>
                        <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md whitespace-pre-wrap">{currentQuestion?.aiFeedback}</p>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SessionSummary({ questions, jobDetails }: { questions: WithId<Question>[] | null, jobDetails: ParseJobDescriptionOutput | null }) {
    const overallScore = useMemo(() => {
        if (!questions || questions.length === 0) return 0;
        const total = questions.reduce((sum, q) => sum + (q.score || 0), 0);
        return Math.round(total / questions.length);
    }, [questions]);

    const {bestSkill, worstSkill} = useMemo(() => {
        if (!questions) return { bestSkill: 'N/A', worstSkill: 'N/A' };
        
        const skillScores: {[key: string]: {total: number, count: number}} = {};
        questions.forEach(q => {
            if (!skillScores[q.skill]) {
                skillScores[q.skill] = { total: 0, count: 0 };
            }
            skillScores[q.skill].total += q.score || 0;
            skillScores[q.skill].count++;
        });

        let best = { skill: 'N/A', avg: -1 };
        let worst = { skill: 'N/A', avg: 101 };

        for (const skill in skillScores) {
            const avg = skillScores[skill].total / skillScores[skill].count;
            if (avg > best.avg) {
                best = { skill, avg };
            }
            if (avg < worst.avg) {
                worst = { skill, avg };
            }
        }
        return { bestSkill: best.skill, worstSkill: worst.skill };

    }, [questions]);


    return (
        <div className="flex justify-center items-center p-4 md:p-6" style={{height: 'calc(100vh - 8rem)'}}>
            <Card className="w-full max-w-2xl text-center">
                <CardHeader>
                    <CardTitle>Session Complete!</CardTitle>
                    <CardDescription>Here's a summary of your performance for the {jobDetails?.role} interview.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="text-muted-foreground">Overall Score</p>
                        <p className="text-7xl font-bold text-primary">{overallScore}%</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-secondary/50 p-3 rounded-lg">
                            <p className="font-semibold">Best Performing Skill</p>
                            <p className="text-primary">{bestSkill}</p>
                        </div>
                         <div className="bg-secondary/50 p-3 rounded-lg">
                            <p className="font-semibold">Skill to Improve</p>
                            <p className="text-destructive">{worstSkill}</p>
                        </div>
                    </div>
                     <div className="text-left bg-secondary/50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">AI Summary & Recommendations</h4>
                        <p className="text-sm text-muted-foreground">
                            Coming soon: A detailed AI summary of your strengths, weaknesses, and a plan for what to practice next.
                        </p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button asChild>
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                        <Button variant="outline" asChild>
                           <Link href="/analysis/new">Practice Again</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


export default function InterviewPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
            <InterviewSession />
        </Suspense>
    )
}
