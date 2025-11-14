'use client';

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
import { UploadCloud } from 'lucide-react';

export default function NewAnalysisPage() {
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
                  <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PDF up to 10MB</p>
                  <Input
                    id="resume"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf"
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
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Analyze Job</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
