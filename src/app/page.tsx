'use client';

import {
  FileText,
  Search,
  GitCompareArrows,
  MessageSquare,
  ClipboardCheck,
  TrendingUp,
  MoveRight,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/lib/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Resume Parsing',
    description:
      'Upload your PDF resume and let our AI extract your skills, experience, and tech stack in seconds.',
  },
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: 'Job Description Analysis',
    description:
      'Paste any job description to instantly identify key requirements, technologies, and role difficulty.',
  },
  {
    icon: <GitCompareArrows className="h-8 w-8 text-primary" />,
    title: 'Skill Gap Analysis',
    description:
      'Visualize the gap between your resume and the job, highlighting matched skills and areas for improvement.',
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: 'AI Interview Questions',
    description:
      'Receive a custom-generated set of technical, fundamental, and scenario-based questions for mock interviews.',
  },
  {
    icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
    title: 'Answer Evaluation',
    description:
      'Get instant AI-powered feedback on your answers, scored on accuracy, depth, clarity, and relevance.',
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: 'Progress Tracking',
    description:
      'Monitor your readiness score, track session history, and identify weak areas to focus your preparation.',
  },
];

const stats = [
  { icon: <Sparkles className="h-6 w-6" />, value: '10K+', label: 'Users Prepared' },
  { icon: <Target className="h-6 w-6" />, value: '95%', label: 'Success Rate' },
  { icon: <Zap className="h-6 w-6" />, value: '50K+', label: 'Mock Interviews' },
];

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image-1');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <div ref={containerRef} className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      {/* Glassmorphic Header */}
      <motion.header
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="container flex h-16 items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <AppLogo className="h-6 w-6" />
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                CareerSprint AI
              </span>
            </Link>
          </motion.div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" asChild>
                  <Link href="/auth">Login</Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/20"
                >
                  <Link href="/auth">Get Started</Link>
                </Button>
              </motion.div>
            </nav>
          </div>
        </div>
      </motion.header>

      <main className="flex-1">
        {/* Hero Section */}
        <motion.section 
          className="container py-20 md:py-32 lg:py-40"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col items-start gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <motion.div
                  className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">AI-Powered Career Platform</span>
                </motion.div>
              </motion.div>

              <motion.h1
                className="text-5xl font-extrabold tracking-tighter md:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                Land Your{' '}
                <span className="bg-gradient-to-r from-primary via-violet-600 to-blue-600 bg-clip-text text-transparent">
                  Dream Job
                </span>{' '}
                Faster with AI
              </motion.h1>

              <motion.p
                className="max-w-xl text-xl text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                CareerSprint AI analyzes your resume against job descriptions,
                identifies skill gaps, and generates personalized mock
                interviews to get you job-ready.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(var(--primary), 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" asChild className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-xl shadow-primary/20 text-base px-8">
                    <Link href="/auth">
                      Start Your Career Sprint <MoveRight className="ml-2" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="text-base px-8">
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="flex flex-wrap gap-8 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Hero Image with enhanced animations */}
            {heroImage && (
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.9, delay: 0.4 }}
              >
                <motion.div
                  className="relative overflow-hidden rounded-2xl shadow-2xl"
                  whileHover={{
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: 5,
                    boxShadow: '0 25px 50px -12px rgba(var(--primary), 0.4)',
                  }}
                  transition={{ duration: 0.4 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-violet-600/20 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    width={700}
                    height={500}
                    className="w-full object-cover"
                    data-ai-hint={heroImage.imageHint}
                    priority
                  />
                </motion.div>

                {/* Decorative elements */}
                <motion.div
                  className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary to-violet-600 opacity-20 blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 opacity-20 blur-2xl"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Features Section */}
        <section id="features" className="container py-20 md:py-32">
          <motion.div
            className="mx-auto flex max-w-2xl flex-col items-center text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium">Powerful Features</span>
            </motion.div>
            <h2 className="text-4xl font-extrabold tracking-tighter md:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Your Personal AI Career Coach
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From resume to interview, we provide the tools you need to
              succeed at every step.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="flex flex-col h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
                    <CardHeader>
                      <motion.div
                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-violet-600/10 text-primary"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          className="container py-20 md:py-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-violet-600 to-blue-600 p-12 md:p-16 shadow-2xl">
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
              animate={{
                backgroundPosition: ['0px 0px', '30px 30px'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <motion.h2
                className="text-4xl font-extrabold tracking-tighter text-white md:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Ready to Sprint Towards Your Career Goals?
              </motion.h2>
              <motion.p
                className="mt-4 text-lg text-white/90"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Join thousands of professionals who accelerated their career with AI-powered preparation.
              </motion.p>
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    asChild
                    className="bg-white text-primary hover:bg-white/90 shadow-xl text-base px-8"
                  >
                    <Link href="/auth">
                      Get Started for Free <MoveRight className="ml-2" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              &copy; {new Date().getFullYear()} CareerSprint AI. All rights reserved.
            </motion.p>
            <motion.div
              className="flex items-center gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
