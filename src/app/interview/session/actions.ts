'use server';

import { generateInterviewQuestions, GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import { evaluateUserAnswer, EvaluateUserAnswerOutput } from '@/ai/flows/evaluate-user-answer';

export type Question = GenerateInterviewQuestionsOutput['questions'][0] & {
    status: 'answered' | 'unanswered' | 'evaluating';
    userAnswer?: string;
    evaluation?: EvaluateUserAnswerOutput;
};

export async function generateQuestionsAction(params: {
    jobDescription: string;
    skillGaps: string[];
    difficulty: string;
}): Promise<{ success: true; questions: Question[] } | { success: false; error: string }> {
    try {
        const questionResponse = await generateInterviewQuestions({
            jobDescription: params.jobDescription,
            skillGaps: params.skillGaps,
            difficulty: params.difficulty,
        });

        if (!questionResponse || !questionResponse.questions || questionResponse.questions.length === 0) {
            return { success: false, error: "Failed to generate interview questions." };
        }

        const questions: Question[] = questionResponse.questions.map(q => ({ ...q, status: 'unanswered' }));
        return { success: true, questions };
    } catch (error: any) {
        console.error("Error generating questions:", error);
        
        let errorMessage = "An unexpected error occurred while generating questions.";
        
        if (error?.message?.includes('503')) {
            errorMessage = 'The AI service is temporarily overloaded. Please wait a moment and try again.';
        } else if (error?.message?.includes('API key')) {
            errorMessage = 'API key configuration error. Please contact support.';
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}

export async function evaluateAnswerAction(params: {
    questionText: string;
    userAnswer: string;
    skill: string;
    difficulty: string;
}): Promise<{ success: true; evaluation: EvaluateUserAnswerOutput } | { success: false; error: string }> {
    try {
        const evaluation = await evaluateUserAnswer({
            questionText: params.questionText,
            userAnswer: params.userAnswer,
            skill: params.skill,
            difficulty: params.difficulty,
        });

        return { success: true, evaluation };
    } catch (error: any) {
        console.error("Error evaluating answer:", error);
        
        let errorMessage = "Could not get feedback from AI.";
        
        if (error?.message?.includes('503')) {
            errorMessage = 'The AI service is temporarily overloaded. Please try again.';
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}
