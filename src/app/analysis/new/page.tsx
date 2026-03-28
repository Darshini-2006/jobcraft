'use client';

import React, { useState } from 'react';
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
import { FileCheck, Loader2, UploadCloud, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeMatchAction } from './actions';
import { motion } from 'framer-motion';

export default function NewAnalysisPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      
      // Trim job description to save tokens
      const trimmedJD = jobDescription.slice(0, 5000);

      // Perform everything in a SINGLE API call for maximum efficiency
      const result = await analyzeMatchAction({ 
        resumeDataUri, 
        jobDescription: trimmedJD 
      });

      if (!result.success) throw new Error(result.error || 'Analysis failed.');

      // Store results in sessionStorage
      sessionStorage.setItem('resumeSkills', JSON.stringify(result.data.resume));
      sessionStorage.setItem('jobDetails', JSON.stringify(result.data.job));
      sessionStorage.setItem('jobDescription', trimmedJD);

      window.location.href = '/interview/session';

    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F3] via-white to-[#FAF7F3] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white border-[#3E2F20]/10 shadow-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-[#E8A87C]" />
                New Mock Interview
              </CardTitle>
              <CardDescription className="text-base">
                Upload your resume and paste a job description to start your AI-powered interview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-4">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#E8A87C]" />
                  Resume (PDF)
                </Label>
                <div className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${
                  resumeFile ? 'border-[#E8A87C] bg-[#E8A87C]/5' : 'border-[#3E2F20]/20 hover:border-[#E8A87C]'
                }`}>
                  {resumeFile ? (
                    <div className="flex flex-col items-center">
                      <FileCheck className="w-12 h-12 text-[#E8A87C] mb-2" />
                      <p className="font-bold">{resumeFile.name}</p>
                      <p className="text-sm text-muted-foreground mr-1">Ready to analyze! ✨</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Click or drag your PDF here</p>
                    </>
                  )}
                  <Input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#E8A87C]" />
                  Job Description
                </Label>
                <Textarea
                  placeholder="Paste the job description here..."
                  className="h-48 rounded-xl bg-white"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pb-8">
              <Button 
                onClick={handleAnalyze} 
                disabled={isLoading}
                size="lg"
                className="bg-[#3E2F20] hover:bg-[#E8A87C] text-white px-8 py-6 text-lg rounded-xl transition-all"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing...</>
                ) : (
                  <><Sparkles className="mr-2 h-5 w-5" />Start Interview</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
