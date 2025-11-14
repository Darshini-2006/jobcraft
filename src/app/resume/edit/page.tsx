'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileCheck, Loader2, Save, UploadCloud } from 'lucide-react';
import React, { useState } from 'react';
import { parseResumeSkills } from '@/ai/flows/parse-resume-skills';

export default function ResumeEditorPage() {
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      await handleResumeParse(file);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleResumeParse = async (file: File) => {
    setIsLoading(true);
    try {
      const resumeDataUri = await fileToDataUri(file);
      const { fullText } = await parseResumeSkills({ resumeDataUri });
      if (fullText) {
        setResumeText(fullText);
        toast({
          title: 'Resume Parsed',
          description: 'Your resume content has been extracted into the editor.',
        });
      } else {
        throw new Error('Could not extract text from the resume.');
      }
    } catch (error: any) {
      console.error('Resume parsing failed:', error);
      toast({
        variant: 'destructive',
        title: 'Parsing Failed',
        description: 'We couldn’t extract text from your resume. Please try again or paste the content manually.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>
                Upload your resume (PDF) to automatically extract its content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
                {isLoading ? (
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                ) : resumeFile ? (
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
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Resume Editor</CardTitle>
                <CardDescription>
                  Refine your resume here. Use the AI tools to improve it.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={isLoading}>
                  <Save className="mr-2" />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Upload your resume or paste its content here..."
                className="flex-1 w-full h-full text-base p-4 font-mono bg-white dark:bg-card"
                style={{ minHeight: 'calc(100vh - 250px)' }}
                disabled={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
