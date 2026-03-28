import { analyzeMatchFlow, AnalyzeMatchOutput } from '@/ai/flows/analyze-match';

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error?.message?.includes('429') || error?.message?.includes('503'))) {
            console.log(`Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}

export async function analyzeMatchAction(params: {
    resumeDataUri: string;
    jobDescription: string;
}): Promise<{ success: true; data: AnalyzeMatchOutput } | { success: false; error: string }> {
    try {
        console.log("SERVER ACTION: Starting combined analyzeMatchFlow (with Retry)...");
        // Additional protection: ensure we are not sending more than 5000 characters for JD
        const jobDescription = params.jobDescription.slice(0, 5000);
        
        const result = await withRetry(() => analyzeMatchFlow({ 
            resumeDataUri: params.resumeDataUri, 
            jobDescription: jobDescription 
        }));
        
        console.log("SERVER ACTION: analyzeMatchFlow Success!");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("SERVER ACTION ERROR (Combined Analysis):", error);
        
        let errorMessage = "Failed to analyze data. Please try again.";
        
        if (error?.message?.includes('429') || error?.message?.includes('503')) {
            errorMessage = 'The AI service is temporarily busy (Quota Limit). Please wait 60 seconds and try again.';
        } else if (error?.message?.includes('404')) {
            errorMessage = 'AI model configuration error. Please contact the administrator.';
        } else if (error?.message) {
            errorMessage = `Analysis error: ${error.message}`;
        }
        
        return { success: false, error: errorMessage };
    }
}

export async function parseResumeAction(params: {
    resumeDataUri: string;
}): Promise<{ success: true; data: ParseResumeSkillsOutput } | { success: false; error: string }> {
    try {
        console.log("SERVER ACTION: Starting parseResumeFlow...");
        const result = await parseResumeSkills({ resumeDataUri: params.resumeDataUri });
        console.log("SERVER ACTION: parseResumeFlow Success!");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("SERVER ACTION ERROR (Resume Analysis):", error);
        
        let errorMessage = "Failed to analyze resume. Please try again.";
        
        if (error?.message?.includes('429') || error?.message?.includes('503')) {
            errorMessage = 'The AI service is temporarily busy (Quota Limit). Please wait 60 seconds and try again.';
        } else if (error?.message?.includes('404')) {
            errorMessage = 'AI model configuration error. Please contact the administrator.';
        } else if (error?.message?.includes('API key')) {
            errorMessage = 'Invalid API configuration. Please check your environment settings.';
        } else if (error?.message) {
            errorMessage = `Analysis error: ${error.message}`;
        }
        
        return { success: false, error: errorMessage };
    }
}

export async function parseJobDescriptionAction(params: {
    jobDescription: string;
}): Promise<{ success: true; data: ParseJobDescriptionOutput } | { success: false; error: string }> {
    try {
        console.log("SERVER ACTION: Starting parseJobDescriptionFlow...");
        const result = await parseJobDescription({ jobDescription: params.jobDescription });
        console.log("SERVER ACTION: parseJobDescriptionFlow Success!");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("SERVER ACTION ERROR (Job Analysis):", error);
        
        let errorMessage = "Failed to analyze job description. Please try again.";
        
        if (error?.message?.includes('429') || error?.message?.includes('503')) {
            errorMessage = 'The AI service is temporarily busy (Quota Limit). Please wait 60 seconds and try again.';
        } else if (error?.message?.includes('404')) {
            errorMessage = 'AI model configuration error. Please contact the administrator.';
        } else if (error?.message) {
            errorMessage = `Analysis error: ${error.message}`;
        }
        
        return { success: false, error: errorMessage };
    }
}
