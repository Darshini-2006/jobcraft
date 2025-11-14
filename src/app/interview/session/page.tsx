'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  RefreshCw,
  Sparkles,
  Voicemail,
} from 'lucide-react';
import React from 'react';
import { type ParseResumeSkillsOutput } from '@/ai/flows/parse-resume-skills';
import { type ParseJobDescriptionOutput } from '@/ai/flows/parse-job-description';
import {
  generateInterviewQuestions,
  type GenerateInterviewQuestionsOutput,
} from '@/ai/flows/generate-interview-questions';
import {
  evaluateUserAnswer,
  type EvaluateUserAnswerOutput,
} from '@/ai/flows/evaluate-user-answer';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

function InterviewSession() {
  const searchParams = useSearchParams();

  const [questions, setQuestions] =
    React.useState<GenerateInterviewQuestionsOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(true);
  const [isEvaluating, setIsEvaluating] = React.useState(false);
  const [evaluation, setEvaluation] =
    React.useState<EvaluateUserAnswerOutput | null>(null);

  const jobDetails: ParseJobDescriptionOutput | null = JSON.parse(
    searchParams.get('jobDetails') || 'null'
  );
  const resumeSkills: ParseResumeSkillsOutput | null = JSON.parse(
    searchParams.get('resumeSkills') || 'null'
  );
  const jobDescription = searchParams.get('jobDescription') || '';

  const allQuestions: { type: string; question: string }[] = React.useMemo(() => {
    if (!questions) return [];
    const tech =
      questions.technicalQuestions
        .split('\n')
        .filter((q) => q.startsWith('- '))
        .map((q) => ({ type: 'Technical', question: q.substring(2) })) || [];
    const fundamental =
      questions.fundamentalQuestions
        .split('\n')
        .filter((q) => q.startsWith('- '))
        .map((q) => ({ type: 'Fundamental', question: q.substring(2) })) || [];
    const scenario =
      questions.scenarioBasedQuestions
        .split('\n')
        .filter((q) => q.startsWith('- '))
        .map((q) => ({ type: 'Scenario', question: q.substring(2) })) || [];
    return [...tech, ...fundamental, ...scenario];
  }, [questions]);

  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = allQuestions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;


  const getSkillGaps = () => {
    if (!jobDetails || !resumeSkills) return 'N/A';
    const jobSkills = new Set(jobDetails.requiredSkills.map(s => s.toLowerCase()));
    const userSkills = new Set(resumeSkills.skills.map(s => s.toLowerCase()));
    const gaps = [...jobSkills].filter(skill => !userSkills.has(skill));
    return gaps.join(', ') || 'None';
  };

  React.useEffect(() => {
    const fetchQuestions = async () => {
      if (!jobDescription) return;
      setIsGenerating(true);
      try {
        const result = await generateInterviewQuestions({
          jobDescription,
          skillGaps: getSkillGaps(),
        });
        setQuestions(result);
      } catch (error) {
        console.error('Failed to generate questions:', error);
      } finally {
        setIsGenerating(false);
      }
    };
    fetchQuestions();
  }, [jobDescription]);

  const handleSubmitAnswer = async () => {
    if (!userAnswer || !currentQuestion) return;
    setIsEvaluating(true);
    setEvaluation(null);
    try {
      const result = await evaluateUserAnswer({
        question: currentQuestion.question,
        answer: userAnswer,
        jobDescription: jobDescription,
      });
      setEvaluation(result);
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setEvaluation(null);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer('');
      setEvaluation(null);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-2">
          Generating Your Interview...
        </h2>
        <p className="text-muted-foreground max-w-md">
          Our AI is crafting a personalized set of interview questions based on
          the role of <span className="font-bold">{jobDetails?.role}</span> and your resume.
        </p>
      </div>
    );
  }

  const evaluationData = [
    { name: 'Accuracy', score: evaluation?.accuracy || 0 },
    { name: 'Depth', score: evaluation?.depth || 0 },
    { name: 'Clarity', score: evaluation?.clarity || 0 },
    { name: 'Relevance', score: evaluation?.relevance || 0 },
  ];

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
                <Badge variant="secondary">{currentQuestion?.type}</Badge>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            <div className="p-6 bg-secondary/50 rounded-lg">
                <p className="text-lg font-semibold">
                {currentQuestion?.question}
                </p>
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              <label htmlFor="answer" className="font-medium">
                Your Answer
              </label>
              <Textarea
                id="answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here, or use the voice-to-text feature."
                className="flex-1 text-base"
                rows={8}
                disabled={isEvaluating || !!evaluation}
              />
               <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-muted-foreground">You can use markdown for formatting.</p>
                <Button variant="ghost" size="icon" disabled>
                    <Voicemail className="w-5 h-5" />
                    <span className="sr-only">Voice to text</span>
                </Button>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSubmitAnswer} disabled={!userAnswer || isEvaluating || !!evaluation} className='flex-1'>
                    {isEvaluating ? <><Loader2 className="mr-2 animate-spin"/> Evaluating...</> : <><Check className="mr-2"/>Submit Answer</>}
                </Button>
                <Button variant="outline" onClick={() => { setUserAnswer(''); setEvaluation(null); }}>
                    <RefreshCw className="mr-2"/> Try Again
                </Button>
            </div>
            
          </CardContent>
          <div className="flex justify-between p-4 border-t">
              <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="mr-2"/> Previous
              </Button>
              <Button onClick={handleNextQuestion} disabled={currentQuestionIndex === totalQuestions - 1 || !evaluation}>
                Next <ArrowRight className="ml-2"/>
              </Button>
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
          <CardContent>
            {isEvaluating && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="font-semibold">Evaluating your answer...</p>
                </div>
            )}
            {!isEvaluating && !evaluation && (
                 <div className="flex flex-col items-center justify-center h-64 text-center p-4 rounded-lg bg-secondary/30">
                    <p className="font-medium">Your feedback will appear here once you submit your answer.</p>
                </div>
            )}
            {evaluation && (
                <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4">
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Overall Score</p>
                                <p className="text-5xl font-bold">{evaluation.score}%</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Feedback:</h4>
                                <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md">{evaluation.feedback}</p>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="details">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={evaluationData} layout="vertical" margin={{ left: 10, right: 30}}>
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis type="category" dataKey="name" width={70} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} contentStyle={{ background: 'hsl(var(--background))' }} />
                                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                                        <LabelList dataKey="score" position="right" formatter={(value: number) => `${value}%`} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function InterviewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InterviewSession />
        </Suspense>
    )
}
