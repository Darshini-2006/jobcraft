'use server';

import { parseResumeSkills, ParseResumeSkillsOutput } from '@/ai/flows/parse-resume-skills';

export async function parseResumeForEditorAction(params: {
    resumeDataUri: string;
}): Promise<{ success: true; fullText: string } | { success: false; error: string }> {
    try {
        const result = await parseResumeSkills({ resumeDataUri: params.resumeDataUri });
        
        if (!result.fullText) {
            return { success: false, error: 'Could not extract text from the resume.' };
        }
        
        return { success: true, fullText: result.fullText };
    } catch (error: any) {
        console.error("Error parsing resume:", error);
        
        let errorMessage = "We couldn't extract text from your resume. Please try again or paste the content manually.";
        
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
