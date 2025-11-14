'use server';

/**
 * @fileOverview This flow extracts skills, experience, and tools from a resume.
 *
 * - parseResumeSkills - A function that handles the resume parsing process.
 * - ParseResumeSkillsInput - The input type for the parseResumeSkills function.
 * - ParseResumeSkillsOutput - The return type for the parseResumeSkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseResumeSkillsInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      'A resume PDF, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Updated description
    ),
});
export type ParseResumeSkillsInput = z.infer<typeof ParseResumeSkillsInputSchema>;

const ParseResumeSkillsOutputSchema = z.object({
  skills: z.array(z.string()).describe('A list of skills extracted from the resume.'),
  experience: z
    .string()
    .describe('A summary of the experience detailed in the resume.'),
  tools: z.array(z.string()).describe('A list of tools and technologies mentioned in the resume.'),
});
export type ParseResumeSkillsOutput = z.infer<typeof ParseResumeSkillsOutputSchema>;

export async function parseResumeSkills(
  input: ParseResumeSkillsInput
): Promise<ParseResumeSkillsOutput> {
  return parseResumeSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseResumeSkillsPrompt',
  input: {schema: ParseResumeSkillsInputSchema},
  output: {schema: ParseResumeSkillsOutputSchema},
  prompt: `You are an expert resume parser. Extract the skills, experience summary, and tools/technologies from the following resume text.\n\nResume: {{media url=resumeDataUri}}`,
});

const parseResumeSkillsFlow = ai.defineFlow(
  {
    name: 'parseResumeSkillsFlow',
    inputSchema: ParseResumeSkillsInputSchema,
    outputSchema: ParseResumeSkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
