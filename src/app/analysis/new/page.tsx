'use client';

import { useState } from 'react';
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
import { parseResumeSkills } from '@/ai/flows/parse-resume-skills';
import { parseJobDescription } from '@/ai/flows/parse-job-description';
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
      
      // We run the AI flows in parallel to speed up the process.
      const [resumeSkills, jobDetails] = await Promise.all([
        parseResumeSkills({ resumeDataUri }),
        parseJobDescription({ jobDescription }),
      ]);

      // Store results in session storage to pass them to the interview page.
      sessionStorage.setItem('resumeSkills', JSON.stringify(resumeSkills));
      sessionStorage.setItem('jobDetails', JSON.stringify(jobDetails));
      sessionStorage.setItem('jobDescription', jobDescription);

      // Redirect to the mock interview page.
      window.location.href = '/interview/session';

    } catch (error: any) {
      console.error('Analysis failed:', error);
      let description = 'Something went wrong. Please try again.';
      // Specifically check for a 503 Service Unavailable error from the AI service.
      if (error?.message?.includes('503')) {
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
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F3] via-white to-[#FAF7F3] relative overflow-hidden">
      {/* Animated background decorations */}
      <motion.div
        className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-[#E8A87C]/5 to-[#D4B68A]/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-96 h-96 bg-gradient-to-tr from-[#3E2F20]/3 to-[#E8A87C]/3 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="flex justify-center items-start p-4 md:p-8 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <Card className="bg-gradient-to-br from-white to-[#FAF7F3] border-[#3E2F20]/10 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="space-y-4 pb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-8 w-8 text-[#E8A87C]" />
                  </motion.div>
                  New Mock Interview
                </CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardDescription className="text-[#3E2F20]/70 text-base md:text-lg">
                  Upload your resume and paste a job description to start a personalized AI-powered mock interview.
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:gap-10">
                {/* Resume Upload Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid gap-4"
                >
                  <Label htmlFor="resume" className="text-[#3E2F20] font-semibold text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#E8A87C]" />
                    Resume (PDF)
                  </Label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="relative"
                  >
                    <div className={`w-full relative border-2 border-dashed rounded-2xl p-10 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                      resumeFile 
                        ? 'border-[#E8A87C] bg-[#E8A87C]/5' 
                        : 'border-[#3E2F20]/30 hover:border-[#E8A87C] hover:bg-[#FAF7F3]'
                    }`}>
                      {resumeFile ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <FileCheck className="w-16 h-16 text-[#E8A87C] mb-4" />
                          </motion.div>
                          <p className="text-base font-bold text-[#3E2F20] mb-1">
                            {resumeFile.name}
                          </p>
                          <p className="text-sm text-[#3E2F20]/60">
                            File uploaded successfully! ✨
                          </p>
                        </motion.div>
                      ) : (
                        <>
                          <UploadCloud className="w-14 h-14 text-[#3E2F20]/40 mb-4" />
                          <p className="text-base text-[#3E2F20]/70 mb-2">
                            <span className="font-bold text-[#E8A87C]">
                              Click to upload
                            </span>{' '}
                            or drag and drop
                          </p>
                          <p className="text-sm text-[#3E2F20]/50">
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
                  </motion.div>
                </motion.div>

                {/* Job Description Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid gap-4"
                >
                  <Label htmlFor="job-description" className="text-[#3E2F20] font-semibold text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#E8A87C]" />
                    Job Description
                  </Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the full job description here...&#10;&#10;Include:&#10;• Role title and responsibilities&#10;• Required skills and qualifications&#10;• Company information"
                    className="h-64 resize-none rounded-2xl border-[#3E2F20]/20 focus:border-[#E8A87C] focus:ring-[#E8A87C] bg-white/50 text-[#3E2F20] placeholder:text-[#3E2F20]/40 transition-all duration-300"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    disabled={isLoading}
                  />
                </motion.div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-8 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-[#3E2F20] to-[#5a4530] hover:from-[#E8A87C] hover:to-[#d4985f] text-white shadow-lg hover:shadow-2xl transition-all duration-300 px-8 py-6 text-lg rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing & Preparing Interview...
                    </>
                  ) : (
                    <>
                      Start Interview
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </CardFooter>
          </Card>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid md:grid-cols-3 gap-4 mt-8"
          >
            {[
              { icon: Sparkles, title: 'AI-Powered', desc: 'Smart question generation' },
              { icon: CheckCircle2, title: 'Personalized', desc: 'Tailored to your profile' },
              { icon: FileCheck, title: 'Instant Results', desc: 'Get feedback immediately' },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Card className="bg-white/80 border-[#3E2F20]/10 hover:border-[#E8A87C]/50 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="pt-6 pb-6 text-center">
                    <item.icon className="h-8 w-8 text-[#E8A87C] mx-auto mb-3" />
                    <h3 className="font-bold text-[#3E2F20] mb-1">{item.title}</h3>
                    <p className="text-sm text-[#3E2F20]/60">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
