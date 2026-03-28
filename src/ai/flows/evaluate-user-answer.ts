'use server';

import { AIService } from '@/lib/ai/ai.service';

export type EvaluateUserAnswerInput = {
  questionText: string;
  userAnswer: string;
  skill: string;
  difficulty: string;
};

export type EvaluateUserAnswerOutput = {
  score: number;
  feedback: string;
};

export async function evaluateUserAnswer(
  input: EvaluateUserAnswerInput
): Promise<EvaluateUserAnswerOutput> {
  const systemPrompt = "You are an expert interview evaluator. You ONLY output valid JSON.";

  const userPrompt = `Evaluate the user's answer to the following interview question.

Skill being tested: ${input.skill}
Question Difficulty: ${input.difficulty}

Question:
"${input.questionText}"

User's Answer:
"${input.userAnswer}"

Provide a score from 0-100 and detailed constructive feedback highlighting both strengths and specific areas for improvement.

Output a JSON object with this exact structure:
{
  "score": 75,
  "feedback": "Detailed feedback here..."
}`;

  return AIService.chat(systemPrompt, userPrompt);
}
