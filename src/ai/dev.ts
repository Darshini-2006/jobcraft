import { config } from 'dotenv';
config();

import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/evaluate-user-answer.ts';
import '@/ai/flows/parse-resume-skills.ts';
import '@/ai/flows/parse-job-description.ts';