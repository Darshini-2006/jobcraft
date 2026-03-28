'use server';

import 'server-only';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { extractTextFromPDF } from '@/lib/pdf-util';
import { AIService } from '@/lib/ai/ai.service';

const AnalyzeMatchInputSchema = z.object({
  resumeDataUri: z.string().describe('Base64 encoded PDF resume data URI'),
  jobDescription: z.string().describe('Job description text'),
});

const AnalyzeMatchOutputSchema = z.object({
  resume: z.object({
    skills: z.array(z.string()).describe('Core technical skills'),
    experience: z.string().describe('Professional experience summary'),
    tools: z.array(z.string()).describe('Key tools and technologies'),
    fullText: z.string().describe('Cleaned full text of the resume'),
  }),
  job: z.object({
    role: z.string().describe('Job role/title'),
    company: z.string().optional().describe('Company name'),
    requiredSkills: z.array(z.string()).describe('Granular required skills'),
    proficiencyExpectations: z.string().describe('Expected expertise level'),
    difficultyLevel: z.enum(['easy', 'medium', 'hard']).describe('Overall job difficulty'),
  }),
});

export type AnalyzeMatchOutput = z.infer<typeof AnalyzeMatchOutputSchema>;

export const analyzeMatchFlow = ai.defineFlow(
  {
    name: 'analyzeMatchFlow',
    inputSchema: AnalyzeMatchInputSchema,
    outputSchema: AnalyzeMatchOutputSchema,
  },
  async (input) => {
    // 1. Extract text from PDF locally to save tokens and use text-only models
    const resumeText = await extractTextFromPDF(input.resumeDataUri);
    
    // 2. Perform analysis using the abstracted AI Service (Groq/OpenRouter)
    const output = await AIService.analyzeMatch(resumeText, input.jobDescription);
    
    return output;
  }
);
