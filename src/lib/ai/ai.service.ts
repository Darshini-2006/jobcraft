import 'server-only';
import { AnalyzeMatchOutput } from '@/ai/flows/analyze-match';

/**
 * Service to handle AI calls using alternative providers (Groq/OpenRouter).
 * This provides a fallback when Google Gemini quota is unavailable.
 */
export class AIService {

    private static getConfig() {
        const groqKey = process.env.GROQ_API_KEY;
        const orKey = process.env.OPENROUTER_API_KEY;
        const apiKey = groqKey || orKey;
        const baseUrl = groqKey
            ? "https://api.groq.com/openai/v1/chat/completions"
            : "https://openrouter.ai/api/v1/chat/completions";
        const model = groqKey
            ? "llama-3.3-70b-versatile"
            : "meta-llama/llama-3.3-70b-instruct:free";

        if (!apiKey) {
            throw new Error("No AI API key found. Please set GROQ_API_KEY or OPENROUTER_API_KEY in .env.local");
        }
        return { apiKey, baseUrl, model, isOpenRouter: !!orKey && !groqKey };
    }

    /**
     * Generic chat completion that returns parsed JSON.
     */
    static async chat(systemPrompt: string, userPrompt: string): Promise<any> {
        const { apiKey, baseUrl, model, isOpenRouter } = this.getConfig();
        console.log(`AI_SERVICE chat: Using ${isOpenRouter ? 'OpenRouter' : 'Groq'}`);

        const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                ...(isOpenRouter && { "HTTP-Referer": "http://localhost:3000", "X-Title": "JobCraft" })
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.2
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`AI Provider Error (${response.status}): ${errData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        const content = result.choices[0].message.content;
        return JSON.parse(content);
    }

    /**
     * Analyzes the match between a resume and a job description.
     */
    static async analyzeMatch(resumeText: string, jobDescription: string): Promise<AnalyzeMatchOutput> {
        const systemPrompt = "You are a specialized career analysis assistant. You ONLY output valid JSON. No conversational filler.";
        const userPrompt = `
            You are an expert career consultant. Parse the provided resume text and job description.
            
            OBJECTIVES:
            1. EXTRACT resume details: technical skills, experience summary, tools, and cleaned full text.
            2. ANALYZE job description: role title, company, granular required skills, proficiency expectations, and difficulty level.
            
            Resume Text:
            ${resumeText}
            
            Job Description:
            ${jobDescription}
            
            OUTPUT: Return a structured JSON object exactly matching this schema:
            {
                "resume": {
                    "skills": ["skill1", "skill2"],
                    "experience": "Summary of experience...",
                    "tools": ["tool1", "tool2"],
                    "fullText": "Cleaned version of the provided input text"
                },
                "job": {
                    "role": "Job Title",
                    "company": "Company Name",
                    "requiredSkills": ["req1", "req2"],
                    "proficiencyExpectations": "Detailed expectations...",
                    "difficultyLevel": "easy" | "medium" | "hard"
                }
            }
        `;
        return this.chat(systemPrompt, userPrompt);
    }
}
