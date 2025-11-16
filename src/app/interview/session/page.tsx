'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Sparkles, Lock, FileText, CheckCircle, XCircle, ArrowRight, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/provider';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { generateQuestionsAction, evaluateAnswerAction, Question } from './actions';
import type { EvaluateUserAnswerOutput } from '@/ai/flows/evaluate-user-answer';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FAF7F3] flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Floating Background Blobs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#E8A87C]/20 to-[#D4B68A]/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#3E2F20]/10 to-[#D4B68A]/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl relative z-10"
      >
        <Card className="border-[#3E2F20]/10 shadow-2xl rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <CardHeader className="text-center space-y-4 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center justify-center gap-3"
            >
              <Lock className="h-8 w-8 text-[#E8A87C]" />
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent">
                Mock Interview Locked
              </h2>
            </motion.div>
            <CardDescription className="text-base text-[#3E2F20]/70">
              Upload your Resume and Job Description to unlock personalized AI interview modes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-10 px-8 pb-8">
            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-2xl mx-auto space-y-4"
            >
              <h3 className="font-semibold text-lg text-[#3E2F20]">Setup Progress</h3>
              <div className="space-y-4">
                {[
                  { step: 1, text: 'Upload Resume', done: resumeUploaded },
                  { step: 2, text: 'Paste Job Description', done: jdUploaded },
                  { step: 3, text: 'Start Mock Interview', done: false, locked: true }
                ].map((item, idx) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                      item.done 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                        : item.locked 
                        ? 'bg-[#FAF7F3]/50 border border-[#3E2F20]/10' 
                        : 'bg-amber-50 border border-amber-200'
                    }`}
                  >
                    <span className="font-medium text-[#3E2F20]">Step {item.step}: {item.text}</span>
                    {item.done ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle className="h-7 w-7 text-green-600" />
                      </motion.div>
                    ) : item.locked ? (
                      <Lock className="h-7 w-7 text-[#3E2F20]/40" />
                    ) : (
                      <XCircle className="h-7 w-7 text-amber-500" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
  
            {/* Call to Action Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="text-left h-full border-[#3E2F20]/10 hover:border-[#E8A87C] transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-[#FAF7F3]/30 rounded-xl">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-6 w-6 text-[#E8A87C]" />
                      <CardTitle className="text-xl text-[#3E2F20]">1. Upload Your Resume</CardTitle>
                    </div>
                    <CardDescription className="text-[#3E2F20]/70">
                      Used to understand your existing skills and experience.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild className="w-full bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] hover:opacity-90 transition-all duration-300 group">
                      <Link href="/resume/edit" className="flex items-center justify-center gap-2">
                        Go to Resume Editor
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="text-left h-full border-[#3E2F20]/10 hover:border-[#E8A87C] transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-[#FAF7F3]/30 rounded-xl">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-6 w-6 text-[#E8A87C]" />
                      <CardTitle className="text-xl text-[#3E2F20]">2. Add Job Description</CardTitle>
                    </div>
                    <CardDescription className="text-[#3E2F20]/70">
                      Used to identify required skills for your target role.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild className="w-full bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] hover:opacity-90 transition-all duration-300 group">
                      <Link href="/analysis/new" className="flex items-center justify-center gap-2">
                        Go to Job Analysis
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

const QuestionCard = ({ question, answer, setAnswer, onSubmit, isEvaluating }: { question: Question; answer: string; setAnswer: (a: string) => void; onSubmit: () => void; isEvaluating: boolean }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-[#3E2F20]/10 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-[#E8A87C]" />
                                <CardTitle className="text-2xl text-[#3E2F20]">Question</CardTitle>
                            </div>
                            <CardDescription className="text-[#3E2F20]/70 flex items-center gap-2">
                                <span className="font-semibold">Skill:</span> {question.skill}
                            </CardDescription>
                        </div>
                        <Badge 
                            variant="secondary" 
                            className={`${
                                question.difficulty === 'easy' 
                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                    : question.difficulty === 'medium'
                                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                                    : 'bg-red-100 text-red-700 border-red-200'
                            } px-4 py-1.5 text-sm font-semibold capitalize`}
                        >
                            {question.difficulty}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg font-medium text-[#3E2F20] leading-relaxed bg-gradient-to-r from-[#FAF7F3] to-white p-6 rounded-xl border border-[#3E2F20]/10"
                    >
                        {question.questionText}
                    </motion.p>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#3E2F20]">Your Answer:</label>
                        <Textarea
                            placeholder="Type your detailed answer here..."
                            rows={10}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            disabled={isEvaluating || question.status === 'answered'}
                            className="rounded-xl border-[#3E2F20]/20 focus:border-[#E8A87C] focus:ring-[#E8A87C]/20 resize-none text-base"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-6">
                    {question.status !== 'answered' && (
                        <Button 
                            onClick={onSubmit} 
                            disabled={!answer || isEvaluating}
                            className="bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] hover:opacity-90 transition-all duration-300 px-8 py-6 text-base group"
                        >
                            {isEvaluating ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                    Evaluating...
                                </>
                            ) : (
                                <>
                                    Submit Answer
                                    <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
};

const EvaluationCard = ({ evaluation }: { evaluation: EvaluateUserAnswerOutput }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
    >
        <Card className="border-[#3E2F20]/10 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-white to-[#FAF7F3]/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#3E2F20]">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles className="text-[#E8A87C] h-6 w-6" />
                    </motion.div>
                    AI Feedback
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <motion.div 
                    className="text-center p-6 bg-gradient-to-br from-[#3E2F20]/5 to-[#E8A87C]/5 rounded-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <p className="text-sm text-[#3E2F20]/70 mb-2 font-medium">Your Score</p>
                    <motion.p 
                        className="text-6xl font-bold bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {evaluation.score}%
                    </motion.p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h4 className="font-semibold mb-3 text-[#3E2F20] flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-[#E8A87C]" />
                        Feedback:
                    </h4>
                    <p className="text-sm text-[#3E2F20]/80 leading-relaxed bg-white/80 p-4 rounded-xl border border-[#3E2F20]/10 italic">
                        "{evaluation.feedback}"
                    </p>
                </motion.div>
            </CardContent>
        </Card>
    </motion.div>
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
            setTimeout(() => window.location.href = '/dashboard', 1000);
        } catch (error) {
            console.error("Failed to save session:", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save session data.' });
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-[#FAF7F3] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Floating Background Blobs */}
            <motion.div
                className="absolute top-10 right-20 w-80 h-80 bg-gradient-to-br from-[#E8A87C]/20 to-[#D4B68A]/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-10 left-20 w-96 h-96 bg-gradient-to-br from-[#3E2F20]/10 to-[#E8A87C]/10 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, -90, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-4xl relative z-10"
            >
                <Card className="border-[#3E2F20]/10 shadow-2xl rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-4 pb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        </motion.div>
                        <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent">
                            Session Complete! 🎉
                        </CardTitle>
                        <CardDescription className="text-base text-[#3E2F20]/70">
                            Here's a breakdown of your performance for the <span className="font-semibold text-[#E8A87C]">{jobDetails.role}</span> role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 px-8 pb-8">
                        <motion.div 
                            className="text-center p-8 bg-gradient-to-br from-[#FAF7F3] to-white rounded-2xl border border-[#3E2F20]/10"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        >
                            <p className="text-sm text-[#3E2F20]/70 mb-2 font-medium">Overall Score</p>
                            <motion.p 
                                className="text-8xl font-bold bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                {averageScore}%
                            </motion.p>
                        </motion.div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl text-center border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-3" />
                                <p className="font-semibold text-[#3E2F20] mb-2">Strongest Skill</p>
                                <p className="text-2xl font-bold text-green-600">{strongestSkill?.skill}</p>
                                <p className="text-lg text-green-700 mt-1">{strongestSkill?.average}%</p>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl text-center border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <ArrowRight className="h-8 w-8 text-amber-600 mx-auto mb-3" />
                                <p className="font-semibold text-[#3E2F20] mb-2">Area to Improve</p>
                                <p className="text-2xl font-bold text-amber-600">{weakestSkill?.skill}</p>
                                <p className="text-lg text-amber-700 mt-1">{weakestSkill?.average}%</p>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gradient-to-r from-[#FAF7F3] to-white p-6 rounded-2xl border border-[#3E2F20]/10"
                        >
                            <h4 className="font-semibold text-[#3E2F20] mb-4 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-[#E8A87C]" />
                                Session Statistics
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-center p-3 bg-white rounded-xl border border-[#3E2F20]/10">
                                    <p className="text-[#3E2F20]/70">Questions Answered</p>
                                    <p className="text-2xl font-bold text-[#3E2F20]">{questions.length}</p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-xl border border-[#3E2F20]/10">
                                    <p className="text-[#3E2F20]/70">Skills Tested</p>
                                    <p className="text-2xl font-bold text-[#3E2F20]">{Object.keys(skillScores).length}</p>
                                </div>
                            </div>
                        </motion.div>
                    </CardContent>
                    <CardFooter className="flex justify-center gap-4 pb-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button 
                                onClick={handleFinish} 
                                disabled={isSaving}
                                className="bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] hover:opacity-90 transition-all duration-300 px-8 py-6 text-base group"
                                size="lg"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Finish & Go to Dashboard
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </CardFooter>
                </Card>
            </motion.div>
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
            // First check if user and firestore are ready
            if (!user || !firestore) {
                // Still loading authentication/firestore
                return;
            }

            const jobDetailsStr = sessionStorage.getItem('jobDetails');
            const resumeSkillsStr = sessionStorage.getItem('resumeSkills');
            
            if (!jobDetailsStr || !resumeSkillsStr) {
                setSessionState(prev => ({ ...prev, isGenerating: false, isReady: false }));
                return; // Exit if data is not present
            }

            setSessionState(prev => ({...prev, isReady: true }));

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

                const result = await generateQuestionsAction({
                    jobDescription: jobDescription,
                    skillGaps: missingSkills,
                    difficulty: jobDetails.difficultyLevel,
                });
                
                if (!result.success || !result.questions || result.questions.length === 0) {
                     throw new Error(!result.success ? result.error : "Failed to generate interview questions.");
                }

                const initialQuestions: Question[] = result.questions.map(q => ({ ...q, status: 'unanswered' }));

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
    }, [user, firestore, toast]);
    
    const handleSubmitAnswer = async () => {
        const { questions, currentQuestionIndex, sessionId } = sessionState;
        if (!sessionId) return;
        const currentQuestion = questions[currentQuestionIndex];

        setSessionState(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => i === currentQuestionIndex ? { ...q, status: 'evaluating' } : q)
        }));

        try {
            const result = await evaluateAnswerAction({
                questionText: currentQuestion.questionText,
                userAnswer: currentAnswer,
                skill: currentQuestion.skill,
                difficulty: currentQuestion.difficulty,
            });

            if (!result.success || !result.evaluation) {
                throw new Error(!result.success ? result.error : 'Evaluation failed');
            }

            setSessionState(prev => ({
                ...prev,
                questions: prev.questions.map((q, i) =>
                    i === currentQuestionIndex ? { ...q, status: 'answered', userAnswer: currentAnswer, evaluation: result.evaluation } : q
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
        
        const { questions, sessionId, jobDetails, resumeSkills } = sessionState;

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

        // 3. Generate comprehensive learning path based on performance
        const skillGaps: { [key: string]: { 
            resumeLevel: number; 
            requiredLevel: number; 
            gapScore: number; 
            priority: string; 
            currentScore: number;
            explanation: string;
            resources: Array<{ type: string; title: string; url: string }>;
        } } = {};
        
        const requiredSkills = jobDetails?.requiredSkills || [];
        const userSkills = resumeSkills?.skills || [];
        
        requiredSkills.forEach((skill: string) => {
            const hasSkill = userSkills.includes(skill);
            const currentScore = finalSkillScores[skill] || 0;
            const resumeLevel = hasSkill ? 3 : 0;
            const requiredLevel = 5;
            const gapScore = hasSkill ? Math.round((1 - currentScore / 100) * 100) : 100;
            
            let priority = 'Low';
            if (gapScore > 60) priority = 'High';
            else if (gapScore > 30) priority = 'Medium';
            
            // Generate explanation based on performance
            let explanation = '';
            if (currentScore >= 80) {
                explanation = `Excellent performance (${currentScore}%)! Continue refining your expertise.`;
            } else if (currentScore >= 60) {
                explanation = `Good foundation (${currentScore}%). Focus on advanced concepts and real-world applications.`;
            } else if (currentScore >= 40) {
                explanation = `Moderate knowledge (${currentScore}%). Significant improvement needed through structured learning.`;
            } else {
                explanation = `Limited experience (${currentScore}%). This is a critical gap that requires immediate attention.`;
            }
            
            // Generate learning resources
            const resources = [
                { 
                    type: 'video', 
                    title: `${skill} Tutorial`, 
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}` 
                },
                { 
                    type: 'article', 
                    title: `${skill} Documentation`, 
                    url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' documentation')}` 
                },
                { 
                    type: 'practice', 
                    title: `${skill} Practice Problems`, 
                    url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' practice problems')}` 
                },
            ];
            
            skillGaps[skill] = {
                resumeLevel,
                requiredLevel,
                gapScore,
                priority,
                currentScore,
                explanation,
                resources,
            };
        });
        
        // 4. Update the session document with complete learning path data
        const sessionDocRef = doc(firestore, 'sessions', sessionId);
        await setDocumentNonBlocking(sessionDocRef, {
            overallScore,
            skillScores: finalSkillScores,
            skillGaps,
            readinessPercentage: overallScore,
            completedAt: serverTimestamp(),
            jobRole: jobDetails?.role || 'Unknown',
            jobCompany: jobDetails?.company || '',
            totalQuestions: questions.length,
            questionsAnswered: questions.filter(q => q.status === 'answered').length,
        }, { merge: true });

        // 5. Create a dedicated learning_paths document for easier retrieval
        const learningPathRef = collection(firestore, 'learning_paths');
        await addDocumentNonBlocking(learningPathRef, {
            userId: user.uid,
            sessionId: sessionId,
            jobRole: jobDetails?.role || 'Unknown',
            jobCompany: jobDetails?.company || '',
            overallScore,
            skillGaps,
            topPrioritySkills: Object.entries(skillGaps)
                .filter(([_, gap]) => gap.priority === 'High')
                .map(([skill, _]) => skill),
            createdAt: serverTimestamp(),
            status: 'active',
        });

        // 6. Update the user's main readiness score
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDocumentNonBlocking(userDocRef, {
            readinessScore: overallScore,
            email: user.email,
            id: user.uid,
            lastSessionId: sessionId,
            lastUpdated: serverTimestamp(),
        }, { merge: true });
    };

    if (sessionState.isGenerating) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-[#FAF7F3] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
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
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="relative z-10"
                >
                    <Loader2 className="h-16 w-16 animate-spin text-[#E8A87C] mb-6" />
                </motion.div>
                
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent relative z-10"
                >
                    Generating Your Interview...
                </motion.h2>
                
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[#3E2F20]/70 text-lg max-w-xl mb-12 relative z-10"
                >
                    Our AI is crafting personalized questions based on your resume and the job description.
                </motion.p>
                
                <div className="w-full max-w-2xl space-y-6 relative z-10">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                        >
                            <Skeleton className="h-32 w-full rounded-2xl bg-white/50 border border-[#3E2F20]/10" />
                        </motion.div>
                    ))}
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
            <div className="min-h-screen bg-gradient-to-b from-white to-[#FAF7F3] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                <motion.div
                    className="absolute top-10 right-10 w-80 h-80 bg-gradient-to-br from-red-100/30 to-amber-100/30 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="relative z-10"
                >
                    <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
                </motion.div>
                
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-semibold mb-4 text-red-600 relative z-10"
                >
                    Error
                </motion.h2>
                
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[#3E2F20]/70 mb-8 max-w-md relative z-10"
                >
                    {sessionState.error}
                </motion.p>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative z-10"
                >
                    <Button asChild className="bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] hover:opacity-90 transition-all duration-300 px-8 py-6 text-base group">
                        <Link href="/analysis/new" className="flex items-center gap-2">
                            Start a New Analysis
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
         )
    }

    if (sessionState.isSessionComplete) {
        return <SessionSummary questions={sessionState.questions} jobDetails={sessionState.jobDetails} onSave={handleSaveSession} />;
    }

    const { questions, currentQuestionIndex, jobDetails } = sessionState;
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-[#FAF7F3] p-4 md:p-6 space-y-6 relative overflow-hidden">
            {/* Floating Background Blobs */}
            <motion.div
                className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#E8A87C]/10 to-[#D4B68A]/10 rounded-full blur-3xl -z-0"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-[#3E2F20]/10 to-[#E8A87C]/10 rounded-full blur-3xl -z-0"
                animate={{
                    x: [0, -80, 0],
                    y: [0, 80, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Progress Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <Card className="border-[#3E2F20]/10 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-6 w-6 text-[#E8A87C]" />
                                    <CardTitle className="text-2xl md:text-3xl text-[#3E2F20]">
                                        {jobDetails?.role || 'Mock Interview'}
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-base text-[#3E2F20]/70">
                                    Question <span className="font-bold text-[#E8A87C]">{currentQuestionIndex + 1}</span> of <span className="font-bold">{questions.length}</span>
                                </CardDescription>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                asChild 
                                className="border-[#3E2F20]/20 hover:border-[#E8A87C] hover:bg-[#FAF7F3] transition-all duration-300"
                            >
                                <Link href="/dashboard" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    End Session
                                </Link>
                            </Button>
                        </div>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mt-6"
                        >
                            <Progress 
                                value={((currentQuestionIndex + 1) / questions.length) * 100} 
                                className="h-3 bg-[#FAF7F3]"
                            />
                        </motion.div>
                    </CardHeader>
                </Card>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6 items-start relative z-10">
                {/* Question Card */}
                <div className="lg:col-span-2">
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
                
                {/* Evaluation Sidebar */}
                <div className="space-y-6 lg:sticky lg:top-24">
                    {currentQuestion?.status === 'answered' && currentQuestion.evaluation ? (
                        <>
                            <EvaluationCard evaluation={currentQuestion.evaluation} />
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <Button 
                                    onClick={handleNextQuestion} 
                                    className="w-full bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] hover:opacity-90 transition-all duration-300 py-6 text-base group"
                                >
                                    {currentQuestionIndex === questions.length - 1 ? (
                                        <>
                                            Finish & View Summary
                                            <CheckCircle className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                        </>
                                    ) : (
                                        <>
                                            Next Question
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="flex items-center justify-center min-h-[280px] border-[#3E2F20]/10 rounded-2xl bg-gradient-to-br from-white to-[#FAF7F3]/50">
                                <CardContent className="text-center p-8">
                                    <Sparkles className="h-12 w-12 text-[#E8A87C]/40 mx-auto mb-4" />
                                    <p className="text-[#3E2F20]/60 leading-relaxed">
                                        Your feedback will appear here once you submit an answer.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}