'use server';

/**
 * @fileOverview A flow to evaluate user answers to interview questions.
 *
 * - evaluateUserAnswer - A function that evaluates a user's answer to an interview question.
 * - EvaluateUserAnswerInput - The input type for the evaluateUserAnswer function.
 * - EvaluateUserAnswerOutput - The return type for the evaluateUserAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateUserAnswerInputSchema = z.object({
  questionText: z.string().describe('The interview question that was asked.'),
  userAnswer: z.string().describe("The user's answer to the question."),
  skill: z.string().describe('The skill the question is testing.'),
  difficulty: z.string().describe('The expected difficulty of the answer.'),
});
export type EvaluateUserAnswerInput = z.infer<typeof EvaluateUserAnswerInputSchema>;

const EvaluateUserAnswerOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('A score for the answer, from 0 to 100.'),
  feedback: z.string().describe('Detailed feedback on the answer, highlighting strengths and areas for improvement.'),
});
export type EvaluateUserAnswerOutput = z.infer<typeof EvaluateUserAnswerOutputSchema>;

export async function evaluateUserAnswer(input: EvaluateUserAnswerInput): Promise<EvaluateUserAnswerOutput> {
  return evaluateUserAnswerFlow(input);
}

const evaluateUserAnswerPrompt = ai.definePrompt({
  name: 'evaluateUserAnswerPrompt',
  input: {schema: EvaluateUserAnswerInputSchema},
  output: {schema: EvaluateUserAnswerOutputSchema},
  prompt: `You are an expert interview evaluator. Evaluate the user's answer to the interview question.

Job Role Context: The user is preparing for an interview.
Skill being tested: {{{skill}}}
Question Difficulty: {{{difficulty}}}

Question:
"{{{questionText}}}"

User's Answer:
"{{{userAnswer}}}"

Based on the question, skill, and difficulty, provide a score from 0-100 and detailed feedback. The feedback should be constructive, highlighting both strengths and specific areas for improvement.

Output should be a JSON object that conforms to EvaluateUserAnswerOutputSchema.
`,
});

const evaluateUserAnswerFlow = ai.defineFlow(
  {
    name: 'evaluateUserAnswerFlow',
    inputSchema: EvaluateUserAnswerInputSchema,
    outputSchema: EvaluateUserAnswerOutputSchema,
  },
  async input => {
    const {output} = await evaluateUserAnswerPrompt(input);
    return output!;
  }
);
