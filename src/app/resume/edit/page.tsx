'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Download, Save } from 'lucide-react';
import React from 'react';

const initialResumeContent = `[Your Name]
[Your Contact Information: Phone | Email | LinkedIn]

Summary
[A brief, powerful summary of your skills and career ambitions.]

Experience
[Job Title], [Company Name] | [Start Date] - [End Date]
- [Responsibility or accomplishment]
- [Responsibility or accomplishment]

Education
[Degree], [University Name] | [Graduation Date]

Skills
- [Skill 1], [Skill 2], [Skill 3]`;

export default function ResumeEditorPage() {
  const [resumeText, setResumeText] = React.useState(initialResumeContent);

  const handleDownload = () => {
    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'resume.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-4 md:p-6">
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Resume Editor</CardTitle>
                <CardDescription>
                    Craft and refine your resume here.
                </CardDescription>
            </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Save className="mr-2" />
              Save
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Start writing your resume..."
            className="flex-1 w-full h-full text-base p-8 font-mono bg-white dark:bg-card"
            style={{ minHeight: 'calc(100vh - 200px)' }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
