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
import { FileCheck, Loader2, Save, UploadCloud, Sparkles, Wand2, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { parseResumeSkills } from '@/ai/flows/parse-resume-skills';
import { motion } from 'framer-motion';

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
    <div className="flex-1 p-4 md:p-6 min-h-screen bg-gradient-to-b from-white to-[#FAF7F3] relative overflow-hidden">
      {/* Floating Background Blobs */}
      <motion.div
        className="absolute top-0 right-20 w-96 h-96 bg-gradient-to-br from-[#E8A87C]/10 to-[#D4B68A]/10 rounded-full blur-3xl -z-0"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-20 w-80 h-80 bg-gradient-to-br from-[#3E2F20]/10 to-[#E8A87C]/10 rounded-full blur-3xl -z-0"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="grid gap-6 lg:grid-cols-3 relative z-10">
        {/* Upload Section */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-[#3E2F20]/10 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm sticky top-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <UploadCloud className="h-5 w-5 text-[#E8A87C]" />
                </motion.div>
                <CardTitle className="text-lg text-[#3E2F20]">Upload Resume</CardTitle>
              </div>
              <CardDescription className="text-xs text-[#3E2F20]/70">
                Upload your resume (PDF) to automatically extract its content.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <motion.div 
                className="w-full relative border-2 border-dashed border-[#3E2F20]/20 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#E8A87C] transition-all duration-300 bg-gradient-to-br from-white to-[#FAF7F3]/30 group"
                whileHover={{ scale: 1.02 }}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-12 h-12 text-[#E8A87C] mb-4" />
                    </motion.div>
                    <p className="text-sm font-semibold text-[#3E2F20]">
                      Extracting content...
                    </p>
                  </>
                ) : resumeFile ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FileCheck className="w-12 h-12 text-[#E8A87C] mb-4" />
                    </motion.div>
                    <p className="text-sm font-semibold text-[#E8A87C]">
                      {resumeFile.name}
                    </p>
                    <p className="text-xs text-[#3E2F20]/60 mt-1">
                      File uploaded successfully!
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <UploadCloud className="w-12 h-12 text-[#3E2F20]/40 group-hover:text-[#E8A87C] transition-colors mb-4" />
                    </motion.div>
                    <p className="text-sm text-[#3E2F20]/70">
                      <span className="font-semibold text-[#E8A87C]">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </p>
                    <p className="text-xs text-[#3E2F20]/60 mt-1">
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
              </motion.div>

              {/* Info Cards */}
              <div className="mt-6 space-y-3">
                {[
                  { icon: Sparkles, title: 'AI-Powered', desc: 'Intelligent text extraction' },
                  { icon: Wand2, title: 'Auto-Parse', desc: 'Instant content extraction' },
                  { icon: FileText, title: 'Easy Edit', desc: 'Refine content in editor' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-white to-[#FAF7F3]/50 border border-[#3E2F20]/10"
                  >
                    <div className="p-2 rounded-lg bg-[#E8A87C]/10">
                      <item.icon className="h-4 w-4 text-[#E8A87C]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#3E2F20]">{item.title}</div>
                      <div className="text-xs text-[#3E2F20]/60">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Editor Section */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full flex flex-col border-[#3E2F20]/10 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-5 w-5 text-[#E8A87C]" />
                  <CardTitle className="text-lg text-[#3E2F20]">Resume Editor</CardTitle>
                </div>
                <CardDescription className="text-xs text-[#3E2F20]/70">
                  Refine your resume here. Use the AI tools to improve it.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    disabled={isLoading}
                    className="border-[#3E2F20]/20 hover:border-[#E8A87C] hover:bg-[#FAF7F3] transition-all duration-300"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
              <motion.div
                className="flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Upload your resume or paste its content here..."
                  className="flex-1 w-full h-full text-sm p-4 font-mono bg-white border-[#3E2F20]/10 focus:border-[#E8A87C] rounded-xl transition-all duration-300"
                  style={{ minHeight: 'calc(100vh - 250px)' }}
                  disabled={isLoading}
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
