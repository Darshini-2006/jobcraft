'use server';

/**
 * @fileOverview Parses a job description to extract key information.
 *
 * - parseJobDescription - A function that parses a job description.
 * - ParseJobDescriptionInput - The input type for the parseJobDescription function.
 * - ParseJobDescriptionOutput - The return type for the parseJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseJobDescriptionInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description text to be parsed.'),
});
export type ParseJobDescriptionInput = z.infer<
  typeof ParseJobDescriptionInputSchema
>;

const ParseJobDescriptionOutputSchema = z.object({
  role: z.string().describe('The role described in the job description.'),
  company: z
    .string()
    .describe('The company mentioned in the job description (if any).')
    .optional(),
  requiredSkills: z
    .array(z.string())
    .describe('The list of required skills for the job.'),
  proficiencyExpectations: z
    .string()
    .describe('The expected proficiency level for the required skills.'),
  difficultyLevel: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the job.'),
});
export type ParseJobDescriptionOutput = z.infer<
  typeof ParseJobDescriptionOutputSchema
>;

export async function parseJobDescription(
  input: ParseJobDescriptionInput
): Promise<ParseJobDescriptionOutput> {
  return parseJobDescriptionFlow(input);
}

const parseJobDescriptionPrompt = ai.definePrompt({
  name: 'parseJobDescriptionPrompt',
  input: {schema: ParseJobDescriptionInputSchema},
  output: {schema: ParseJobDescriptionOutputSchema},
  prompt: `You are an expert AI recruiter that will parse a job description and extract the following information from it:

- role: The role described in the job description.
- company: The company mentioned in the job description (if any).
- requiredSkills: A list of the skills that are required for the job. Be specific, and break down general skills into more granular ones (e.g. instead of "software engineering", include "typescript", "react", and "database design").
- proficiencyExpectations: The expected proficiency level for the required skills.
- difficultyLevel: The difficulty level of the job (easy, medium, or hard).

Job Description:
{{jobDescription}}`,
});

const parseJobDescriptionFlow = ai.defineFlow(
  {
    name: 'parseJobDescriptionFlow',
    inputSchema: ParseJobDescriptionInputSchema,
    outputSchema: ParseJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await parseJobDescriptionPrompt(input);
    return output!;
  }
);
