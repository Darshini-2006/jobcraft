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
  question: z.string().describe('The interview question asked.'),
  answer: z.string().describe('The user\'s answer to the question.'),
  jobDescription: z.string().describe('The job description for the role.'),
});
export type EvaluateUserAnswerInput = z.infer<typeof EvaluateUserAnswerInputSchema>;

const EvaluateUserAnswerOutputSchema = z.object({
  accuracy: z.number().describe('The accuracy of the answer (0-100).'),
  depth: z.number().describe('The depth of the answer (0-100).'),
  clarity: z.number().describe('The clarity of the answer (0-100).'),
  relevance: z.number().describe('The relevance of the answer (0-100).'),
  feedback: z.string().describe('Feedback on how to improve the answer.'),
  score: z.number().describe('Overall score for the answer (0-100).'),
});
export type EvaluateUserAnswerOutput = z.infer<typeof EvaluateUserAnswerOutputSchema>;

export async function evaluateUserAnswer(input: EvaluateUserAnswerInput): Promise<EvaluateUserAnswerOutput> {
  return evaluateUserAnswerFlow(input);
}

const evaluateUserAnswerPrompt = ai.definePrompt({
  name: 'evaluateUserAnswerPrompt',
  input: {schema: EvaluateUserAnswerInputSchema},
  output: {schema: EvaluateUserAnswerOutputSchema},
  prompt: `You are an expert interview evaluator. Evaluate the user's answer to the interview question based on the following criteria:

Accuracy: How accurate is the answer?
Depth: How deep does the answer go into the topic?
Clarity: How clear is the answer?
Relevance: How relevant is the answer to the question and the job description?

Provide a score (0-100) for each criterion and overall, along with feedback on how to improve the answer.

Job Description: {{{jobDescription}}}

Question: {{{question}}}

Answer: {{{answer}}}

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
