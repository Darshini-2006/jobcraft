
export interface Question {
    id: string;
    questionText: string;
    skill: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'technical' | 'conceptual' | 'scenario' | 'edge-case';
    userAnswer: string;
    aiFeedback: string;
    score: number | null;
}
