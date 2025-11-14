'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileCheck, Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseResumeSkills } from '@/ai/flows/parse-resume-skills';
import { parseJobDescription } from '@/ai/flows/parse-job-description';

export default function NewAnalysisPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.type !== 'application/pdf') {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a PDF file.',
        });
        return;
      }
      setResumeFile(file);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please upload a resume and paste a job description.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const resumeDataUri = await fileToDataUri(resumeFile);

      const [resumeSkills, jobDetails] = await Promise.all([
        parseResumeSkills({ resumeDataUri }),
        parseJobDescription({ jobDescription }),
      ]);
      
      sessionStorage.setItem('resumeSkills', JSON.stringify(resumeSkills));
      sessionStorage.setItem('jobDetails', JSON.stringify(jobDetails));
      sessionStorage.setItem('jobDescription', jobDescription);

      router.push(`/interview/session`);

    } catch (error: any) {
      console.error('Analysis failed:', error);
      let description = 'Something went wrong. Please try again.';
      if (error.message && error.message.includes('503')) {
        description = 'The AI service is temporarily overloaded. Please wait a moment and try again.'
      }
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start p-4 md:p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>New Job Analysis</CardTitle>
          <CardDescription>
            Upload your resume and paste a job description to get a detailed
            analysis and tailored interview questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8">
            <div className="grid gap-4">
              <Label htmlFor="resume">Resume (PDF)</Label>
              <div className="flex items-center gap-4">
                <div className="w-full relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
                  {resumeFile ? (
                    <>
                      <FileCheck className="w-10 h-10 text-primary mb-4" />
                      <p className="text-sm font-semibold text-primary">
                        {resumeFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        File uploaded successfully!
                      </p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">
                          Click to upload
                        </span>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF up to 10MB
                      </p>
                    </>
                  )}
                  <Input
                    id="resume"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the full job description here..."
                className="h-48 resize-none"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Job'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
