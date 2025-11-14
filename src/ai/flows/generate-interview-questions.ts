'use server';

/**
 * @fileOverview A flow to generate tailored interview questions based on the job description and identified skill gaps.
 *
 * - generateInterviewQuestions - A function that generates interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - Question - The individual question type in the output.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The text of the job description to generate questions for.'),
  skillGaps: z
    .array(z.string())
    .describe(
      'A list of skill gaps between the user and the job description.'
    ),
    difficulty: z.string().describe("The difficulty of the job (e.g. 'medium')")
});
export type GenerateInterviewQuestionsInput = z.infer<
  typeof GenerateInterviewQuestionsInputSchema
>;

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the interview question.'),
  skill: z.string().describe('The primary skill this question targets.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty of the question.'),
  type: z.enum(['technical', 'conceptual', 'scenario', 'edge-case']).describe('The type of question.'),
});

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of generated interview questions.'),
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

  Based on the job description, the candidate's skill gaps, and the job difficulty, generate a list of 7 interview questions.

  The question distribution should be:
  - 3 technical questions
  - 2 conceptual questions
  - 1 scenario-based question
  - 1 tricky or edge-case question

  Job Difficulty: {{{difficulty}}}
  Job Description: {{{jobDescription}}}
  Skill Gaps to focus on: {{{json skillGaps}}}

  For each question, provide the question text, the main skill it targets, the question's difficulty (easy, medium, hard), and the type of question.

  Output a JSON object that strictly conforms to the GenerateInterviewQuestionsOutput schema.
  `,
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
