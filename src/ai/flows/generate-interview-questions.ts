'use server';

import { AIService } from '@/lib/ai/ai.service';

export type GenerateInterviewQuestionsInput = {
  jobDescription: string;
  skillGaps: string[];
  difficulty: string;
};

export type GenerateInterviewQuestionsOutput = {
  questions: Array<{
    questionText: string;
    skill: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'technical' | 'conceptual' | 'scenario' | 'edge-case';
  }>;
};

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  const systemPrompt = "You are an expert interview question generator. You ONLY output valid JSON.";

  const userPrompt = `Generate 7 interview questions for a job candidate based on the following:

Job Difficulty: ${input.difficulty}
Job Description: ${input.jobDescription}
Skill Gaps to focus on: ${JSON.stringify(input.skillGaps)}

The question distribution should be:
- 3 technical questions
- 2 conceptual questions
- 1 scenario-based question
- 1 tricky or edge-case question

For each question, provide: questionText, skill (the main skill it targets), difficulty (easy/medium/hard), and type (technical/conceptual/scenario/edge-case).

Output a JSON object with this exact structure:
{
  "questions": [
    {
      "questionText": "...",
      "skill": "...",
      "difficulty": "easy" | "medium" | "hard",
      "type": "technical" | "conceptual" | "scenario" | "edge-case"
    }
  ]
}`;

  return AIService.chat(systemPrompt, userPrompt);
}
