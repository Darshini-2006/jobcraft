# **App Name**: JobCraft AI

## Core Features:

- User Authentication: Secure email/password based login and signup.
- Resume Parsing: Extract skills, experience, and tools from uploaded PDF resumes using OCR and store in Firestore.
- Job Description Analysis: Parse job description text to identify role, company, required skills, proficiency, and difficulty level.
- Skill Gap Analysis: Compare resume skills against job description skills and generate a structured report highlighting matched, missing, and skills needing improvement. Stored in Firestore.
- Interview Question Generator: Based on the job description and identified skill gaps, generate tailored technical, fundamental, and scenario-based interview questions, storing questions for each session.
- Answer Evaluation: Evaluate user answers for accuracy, depth, clarity, and relevance using AI, providing a score (0-100) and feedback.
- Progress Tracker: Track user progress by maintaining session history and recalculating readiness scores, displaying skill gap summaries, session scores, answered questions, and weak areas, using Firestore as the tool to persist user's session.

## Style Guidelines:

- Primary color: Saturated blue (#3F51B5), evoking a sense of trust and professionalism.
- Background color: Light blue (#E8EAF6), a desaturated variant of the primary that provides a calming backdrop.
- Accent color: Purple (#7E57C2) to highlight important UI elements, while remaining analogous to the primary.
- Body and headline font: 'Inter' (sans-serif) for a clean, modern, and highly readable design.
- Use a consistent set of professional icons related to career development, skills, and job searching.
- Clean and intuitive layout with clear information hierarchy, guiding users through each step.
- Subtle animations to provide feedback and guide users through the app.