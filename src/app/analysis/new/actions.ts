'use server';

import { parseResumeSkills, ParseResumeSkillsOutput } from '@/ai/flows/parse-resume-skills';
import { parseJobDescription, ParseJobDescriptionOutput } from '@/ai/flows/parse-job-description';

export async function parseResumeAction(params: {
    resumeDataUri: string;
}): Promise<{ success: true; data: ParseResumeSkillsOutput } | { success: false; error: string }> {
    try {
        const result = await parseResumeSkills({ resumeDataUri: params.resumeDataUri });
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error parsing resume:", error);
        
        let errorMessage = "Failed to parse resume.";
        
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

export async function parseJobDescriptionAction(params: {
    jobDescription: string;
}): Promise<{ success: true; data: ParseJobDescriptionOutput } | { success: false; error: string }> {
    try {
        const result = await parseJobDescription({ jobDescription: params.jobDescription });
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error parsing job description:", error);
        
        let errorMessage = "Failed to parse job description.";
        
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
