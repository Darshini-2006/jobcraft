'use server';

/**
 * @fileOverview A flow to generate tailored interview questions based on the job description and identified skill gaps.
 *
 * - generateInterviewQuestions - A function that generates interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The text of the job description to generate questions for.'),
  skillGaps: z
    .string()
    .describe(
      'A description of the skill gaps between the user and the job description.'
    ),
});
export type GenerateInterviewQuestionsInput = z.infer<
  typeof GenerateInterviewQuestionsInputSchema
>;

const GenerateInterviewQuestionsOutputSchema = z.object({
  technicalQuestions: z
    .string()
    .describe('Technical interview questions based on the job description.'),
  fundamentalQuestions: z
    .string()
    .describe(
      'Fundamental interview questions based on the job description.'
    ),
  scenarioBasedQuestions: z
    .string()
    .describe(
      'Scenario-based interview questions based on the job description.'
    ),
});
export type GenerateInterviewQuestionsOutput = z.infer<
  typeof GenerateInterviewQuestionsOutputSchema
>;

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert interview question generator for job candidates.

  Based on the job description and the candidate's skill gaps, generate technical, fundamental, and scenario-based interview questions.

  Job Description: {{{jobDescription}}}

  Skill Gaps: {{{skillGaps}}}

  Format the questions as follows:

  Technical Questions:
  - [Question 1]
  - [Question 2]

  Fundamental Questions:
  - [Question 1]
  - [Question 2]

  Scenario-Based Questions:
  - [Question 1]
  - [Question 2]`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
