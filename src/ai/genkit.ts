import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({ 
    apiKey: process.env.GOOGLE_API_KEY,
    apiVersion: 'v1'
  })],
  model: 'googleai/gemini-2.0-flash',
});
