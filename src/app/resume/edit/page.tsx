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
import { FileCheck, Loader2, Save, UploadCloud, Sparkles, Wand2, FileText, Lightbulb, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { parseResumeSkills } from '@/ai/flows/parse-resume-skills';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ResumeSuggestion {
  type: 'success' | 'warning' | 'improvement';
  category: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export default function ResumeEditorPage() {
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [suggestions, setSuggestions] = useState<ResumeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const analyzeResume = (text: string): ResumeSuggestion[] => {
    const suggestions: ResumeSuggestion[] = [];
    const wordCount = text.trim().split(/\s+/).length;
    
    // Length analysis
    if (wordCount < 200) {
      suggestions.push({
        type: 'warning',
        category: 'Length',
        message: 'Resume seems short. Consider adding more details about your experience and skills.',
        priority: 'high'
      });
    } else if (wordCount > 1000) {
      suggestions.push({
        type: 'improvement',
        category: 'Length',
        message: 'Resume is lengthy. Consider condensing to 1-2 pages for better readability.',
        priority: 'medium'
      });
    } else {
      suggestions.push({
        type: 'success',
        category: 'Length',
        message: 'Good resume length. Optimal for quick review by recruiters.',
        priority: 'low'
      });
    }

    // Contact information
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text);
    const hasPhone = /(\+?\d{1,3}[-.\ s]?)?\(?\d{3}\)?[-.\ s]?\d{3}[-.\ s]?\d{4}/.test(text);
    
    if (!hasEmail) {
      suggestions.push({
        type: 'warning',
        category: 'Contact',
        message: 'Add a professional email address to your resume.',
        priority: 'high'
      });
    }
    if (!hasPhone) {
      suggestions.push({
        type: 'improvement',
        category: 'Contact',
        message: 'Include a phone number for direct contact.',
        priority: 'medium'
      });
    }

    // Skills section
    const hasSkillsSection = /skills?|technical|technologies|expertise/i.test(text);
    if (!hasSkillsSection) {
      suggestions.push({
        type: 'warning',
        category: 'Skills',
        message: 'Add a dedicated Skills section to highlight your technical abilities.',
        priority: 'high'
      });
    } else {
      suggestions.push({
        type: 'success',
        category: 'Skills',
        message: 'Skills section found. Great for ATS optimization!',
        priority: 'low'
      });
    }

    // Experience section
    const hasExperience = /experience|work history|employment/i.test(text);
    if (!hasExperience) {
      suggestions.push({
        type: 'improvement',
        category: 'Experience',
        message: 'Consider adding a Work Experience section with your professional background.',
        priority: 'high'
      });
    }

    // Action verbs
    const actionVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'designed', 'achieved', 'improved', 'increased'];
    const hasActionVerbs = actionVerbs.some(verb => new RegExp(`\\b${verb}`, 'i').test(text));
    
    if (!hasActionVerbs) {
      suggestions.push({
        type: 'improvement',
        category: 'Impact',
        message: 'Use strong action verbs (led, achieved, improved) to describe accomplishments.',
        priority: 'medium'
      });
    } else {
      suggestions.push({
        type: 'success',
        category: 'Impact',
        message: 'Good use of action verbs. Shows proactive experience.',
        priority: 'low'
      });
    }

    // Quantifiable achievements
    const hasNumbers = /\d+%|\d+\+|increased|decreased|saved|generated/i.test(text);
    if (!hasNumbers) {
      suggestions.push({
        type: 'improvement',
        category: 'Achievements',
        message: 'Add quantifiable metrics (e.g., "Increased sales by 30%") to showcase impact.',
        priority: 'high'
      });
    } else {
      suggestions.push({
        type: 'success',
        category: 'Achievements',
        message: 'Great! Quantifiable achievements make your impact clear.',
        priority: 'low'
      });
    }

    // Education section
    const hasEducation = /education|degree|university|college|bachelor|master/i.test(text);
    if (!hasEducation) {
      suggestions.push({
        type: 'improvement',
        category: 'Education',
        message: 'Include your educational background and qualifications.',
        priority: 'medium'
      });
    }

    // Professional links
    const hasLinkedIn = /linkedin\.com/i.test(text);
    const hasGitHub = /github\.com/i.test(text);
    
    if (!hasLinkedIn && !hasGitHub) {
      suggestions.push({
        type: 'improvement',
        category: 'Online Presence',
        message: 'Add professional links (LinkedIn, GitHub, Portfolio) to strengthen your profile.',
        priority: 'medium'
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const handleResumeParse = async (file: File) => {
    setIsLoading(true);
    try {
      const resumeDataUri = await fileToDataUri(file);
      const { fullText } = await parseResumeSkills({ resumeDataUri });
      if (fullText) {
        setResumeText(fullText);
        const analyzedSuggestions = analyzeResume(fullText);
        setSuggestions(analyzedSuggestions);
        setShowSuggestions(true);
        toast({
          title: 'Resume Analyzed',
          description: `Found ${analyzedSuggestions.length} suggestions to improve your resume.`,
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
        {/* Suggestions Section - Shows when resume is analyzed */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-3"
            >
              <Card className="border-[#3E2F20]/10 shadow-lg rounded-xl bg-gradient-to-br from-white via-[#FAF7F3]/30 to-white backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Lightbulb className="h-5 w-5 text-[#E8A87C]" />
                      </motion.div>
                      <CardTitle className="text-lg text-[#3E2F20]">
                        AI Resume Suggestions
                      </CardTitle>
                      <Badge variant="outline" className="ml-2 text-xs border-[#E8A87C] text-[#E8A87C]">
                        {suggestions.length} tips
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSuggestions(false)}
                      className="text-[#3E2F20]/60 hover:text-[#3E2F20]"
                    >
                      Hide
                    </Button>
                  </div>
                  <CardDescription className="text-xs text-[#3E2F20]/70">
                    Smart recommendations to make your resume stand out
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {suggestions.map((suggestion, idx) => {
                      const Icon = suggestion.type === 'success' 
                        ? CheckCircle2 
                        : suggestion.type === 'warning' 
                        ? AlertCircle 
                        : TrendingUp;
                      
                      const colorClasses = suggestion.type === 'success'
                        ? 'border-green-200 bg-green-50/50'
                        : suggestion.type === 'warning'
                        ? 'border-red-200 bg-red-50/50'
                        : 'border-[#E8A87C]/20 bg-[#FAF7F3]/50';

                      const iconColor = suggestion.type === 'success'
                        ? 'text-green-600'
                        : suggestion.type === 'warning'
                        ? 'text-red-600'
                        : 'text-[#E8A87C]';

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Alert className={`${colorClasses} border transition-all hover:shadow-md`}>
                            <Icon className={`h-4 w-4 ${iconColor}`} />
                            <AlertDescription className="mt-2">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="text-xs font-semibold text-[#3E2F20]">
                                  {suggestion.category}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] px-1.5 py-0 h-4 ${
                                    suggestion.priority === 'high' 
                                      ? 'border-red-300 text-red-700' 
                                      : suggestion.priority === 'medium'
                                      ? 'border-amber-300 text-amber-700'
                                      : 'border-green-300 text-green-700'
                                  }`}
                                >
                                  {suggestion.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-[#3E2F20]/80 leading-relaxed">
                                {suggestion.message}
                              </p>
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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
                {suggestions.length > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className="border-[#E8A87C]/30 text-[#E8A87C] hover:bg-[#E8A87C]/10 transition-all duration-300"
                    >
                      <Lightbulb className="mr-2 h-4 w-4" />
                      {showSuggestions ? 'Hide' : 'Show'} Tips
                      <Badge variant="secondary" className="ml-2 bg-[#E8A87C] text-white text-xs">
                        {suggestions.length}
                      </Badge>
                    </Button>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline"
                    size="sm"
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
