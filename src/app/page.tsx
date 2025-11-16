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
  Brain,
  BarChart3,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  Quote,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLogo } from '@/lib/icons';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <FileText className="h-7 w-7" />,
    title: 'Smart Resume Analysis',
    description:
      'Our AI instantly parses your resume to understand your skills, experience, and career trajectory with precision.',
  },
  {
    icon: <Search className="h-7 w-7" />,
    title: 'Job Match Intelligence',
    description:
      'Analyze any job posting to identify exact requirements, skill demands, and cultural fit indicators.',
  },
  {
    icon: <GitCompareArrows className="h-7 w-7" />,
    title: 'Personalized Gap Analysis',
    description:
      'See exactly where you stand and what skills to develop for your target role with visual clarity.',
  },
  {
    icon: <MessageSquare className="h-7 w-7" />,
    title: 'Adaptive Mock Interviews',
    description:
      'Practice with AI-generated questions tailored to your experience level and target position.',
  },
  {
    icon: <Brain className="h-7 w-7" />,
    title: 'Real-Time Feedback',
    description:
      'Get instant, detailed evaluation on your answers with actionable suggestions for improvement.',
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    title: 'Career Progress Tracking',
    description:
      'Monitor your readiness score over time and watch your preparation journey unfold with detailed analytics.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Upload Your Resume',
    description: 'Share your current resume in PDF format and let our AI understand your professional background.',
  },
  {
    number: '02',
    title: 'Add Job Description',
    description: 'Paste the job posting you are targeting and we will analyze what the role truly requires.',
  },
  {
    number: '03',
    title: 'Practice & Improve',
    description: 'Complete personalized mock interviews and receive detailed feedback on every answer.',
  },
  {
    number: '04',
    title: 'Land Your Dream Job',
    description: 'Walk into interviews confident, prepared, and ready to showcase your best self.',
  },
];

const testimonials = [
  {
    quote: "CareerSprint helped me identify exactly what I needed to work on. Within three weeks, I landed my dream role at a top tech company.",
    author: "Sarah Chen",
    role: "Senior Product Manager",
    company: "Tech Startup",
  },
  {
    quote: "The mock interview feature is incredibly realistic. It is like having a personal career coach available 24/7.",
    author: "Michael Rodriguez",
    role: "Software Engineer",
    company: "Fortune 500",
  },
  {
    quote: "I went from feeling unprepared to completely confident. The skill gap analysis was a game-changer for my job search.",
    author: "Emily Watson",
    role: "Data Scientist",
    company: "AI Research Lab",
  },
  {
    quote: "The personalized learning path made all the difference. I knew exactly what to study and in what order.",
    author: "David Park",
    role: "UX Designer",
    company: "Design Agency",
  },
];


export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F3]">
      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 border-b border-[#3E2F20]/10 bg-[#FAF7F3]/95 backdrop-blur-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <AppLogo className="h-8 w-8 text-[#3E2F20]" />
              <span className="text-xl font-semibold text-[#3E2F20]">CareerSprint</span>
            </Link>

            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  asChild
                  className="hidden text-[#3E2F20] hover:bg-[#3E2F20]/5 sm:inline-flex"
                >
                  <Link href="/auth">Sign In</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  asChild
                  className="bg-[#3E2F20] text-white shadow-lg shadow-[#3E2F20]/20 hover:bg-[#3E2F20]/90"
                >
                  <Link href="/auth">Get Started Free</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Left Content */}
            <motion.div
              className="flex flex-col gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col gap-6">
                <Badge className="w-fit border-[#D4B68A] bg-[#D4B68A]/10 text-[#3E2F20] hover:bg-[#D4B68A]/20">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  AI-Powered Career Platform
                </Badge>

                <h1 className="text-5xl font-bold leading-tight tracking-tight text-[#3E2F20] lg:text-6xl xl:text-7xl">
                  Prepare Smarter,
                  <br />
                  <span className="text-[#E8A87C]">Land Faster</span>
                </h1>

                <p className="text-xl leading-relaxed text-[#3E2F20]/70 lg:text-2xl">
                  Master your next interview with AI-powered mock sessions, personalized feedback, and targeted skill development.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    asChild
                    className="w-full bg-[#3E2F20] px-8 py-6 text-base font-medium text-white shadow-xl shadow-[#3E2F20]/25 hover:bg-[#3E2F20]/90 sm:w-auto"
                  >
                    <Link href="/auth">
                      Start Practicing Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-[#3E2F20]/20 px-8 py-6 text-base font-medium text-[#3E2F20] hover:border-[#3E2F20]/40 hover:bg-[#3E2F20]/5 sm:w-auto"
                  >
                    Watch Demo
                  </Button>
                </motion.div>
              </div>

              {/* Stats */}
              <div className="mt-8 flex flex-wrap gap-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#3E2F20]">15,000+</span>
                  <span className="text-sm text-[#3E2F20]/60">Professionals Prepared</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#3E2F20]">94%</span>
                  <span className="text-sm text-[#3E2F20]/60">Interview Success Rate</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#3E2F20]">50K+</span>
                  <span className="text-sm text-[#3E2F20]/60">Mock Sessions Completed</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D4B68A]/20 to-[#E8A87C]/20 p-12 shadow-2xl">
                <motion.div
                  className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#E8A87C]/30 blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 10, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
                <motion.div
                  className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-[#D4B68A]/30 blur-3xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -10, 0],
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
                <div className="relative space-y-6">
                  <motion.div
                    className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8A87C]/20">
                      <Brain className="h-6 w-6 text-[#3E2F20]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#3E2F20]/60">Readiness Score</div>
                      <p className="text-xs text-[#3E2F20]/70 mt-1">AI-powered assessment tracking</p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4B68A]/20">
                      <Target className="h-6 w-6 text-[#3E2F20]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#3E2F20]/60">Skill Gap Analysis</div>
                      <p className="text-xs text-[#3E2F20]/70 mt-1">Identify skills to develop</p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8A87C]/10">
                      <BarChart3 className="h-6 w-6 text-[#3E2F20]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#3E2F20]/60">Progress Tracking</div>
                      <p className="text-xs text-[#3E2F20]/70 mt-1">Monitor learning journey</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-[#3E2F20]/10 bg-white py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              className="mx-auto mb-16 max-w-3xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 border-[#D4B68A] bg-[#D4B68A]/10 text-[#3E2F20]">
                <Zap className="mr-2 h-3.5 w-3.5" />
                Powerful Features
              </Badge>
              <h2 className="mb-6 text-4xl font-bold text-[#3E2F20] lg:text-5xl">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-[#3E2F20]/70">
                Comprehensive tools designed to transform your interview preparation from overwhelming to organized.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <Card className="group h-full border-[#3E2F20]/10 bg-[#FAF7F3] shadow-sm transition-all hover:shadow-xl hover:shadow-[#3E2F20]/5">
                    <CardHeader className="pb-4">
                      <motion.div
                        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8A87C]/20 text-[#3E2F20]"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <CardTitle className="text-xl font-semibold text-[#3E2F20]">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-relaxed text-[#3E2F20]/70">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-[#FAF7F3] py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              className="mx-auto mb-16 max-w-3xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 border-[#D4B68A] bg-[#D4B68A]/10 text-[#3E2F20]">
                <Target className="mr-2 h-3.5 w-3.5" />
                Simple Process
              </Badge>
              <h2 className="mb-6 text-4xl font-bold text-[#3E2F20] lg:text-5xl">
                Four Steps to Interview Success
              </h2>
              <p className="text-lg text-[#3E2F20]/70">
                Our streamlined approach gets you from preparation to offer letter faster than ever.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  className="flex gap-6"
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8A87C]/20 text-2xl font-bold text-[#3E2F20]">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-2xl font-semibold text-[#3E2F20]">{step.title}</h3>
                    <p className="text-lg leading-relaxed text-[#3E2F20]/70">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="border-y border-[#3E2F20]/10 bg-white py-24">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              className="mx-auto mb-16 max-w-3xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 border-[#D4B68A] bg-[#D4B68A]/10 text-[#3E2F20]">
                <Users className="mr-2 h-3.5 w-3.5" />
                Success Stories
              </Badge>
              <h2 className="mb-6 text-4xl font-bold text-[#3E2F20] lg:text-5xl">
                Loved by Professionals Worldwide
              </h2>
              <p className="text-lg text-[#3E2F20]/70">
                Join thousands who've transformed their careers with CareerSprint.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="h-full border-[#3E2F20]/10 bg-[#FAF7F3] shadow-sm">
                    <CardContent className="flex flex-col gap-6 p-8">
                      <Quote className="h-10 w-10 text-[#E8A87C]/40" />
                      <p className="text-lg leading-relaxed text-[#3E2F20]/80">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8A87C]/20 text-lg font-semibold text-[#3E2F20]">
                          {testimonial.author.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#3E2F20]">{testimonial.author}</div>
                          <div className="text-sm text-[#3E2F20]/60">
                            {testimonial.role} at {testimonial.company}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-[#E8A87C] text-[#E8A87C]" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-[#3E2F20]/10 bg-gradient-to-br from-[#3E2F20] to-[#2A1F15] py-24 text-white">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-4xl text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                Ready to Ace Your Next Interview?
              </h2>
              <p className="mb-10 text-xl text-white/80">
                Join over 15,000 professionals who've accelerated their careers with AI-powered preparation.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    asChild
                    className="w-full bg-white px-8 py-6 text-base font-medium text-[#3E2F20] shadow-xl hover:bg-white/90 sm:w-auto"
                  >
                    <Link href="/auth">
                      Start Your Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-white/30 bg-transparent px-8 py-6 text-base font-medium text-white hover:bg-white/10 sm:w-auto"
                  >
                    Schedule a Demo
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3E2F20]/10 bg-white">
        <div className="container mx-auto px-6 py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link href="/" className="mb-6 flex items-center space-x-3">
                <AppLogo className="h-8 w-8 text-[#3E2F20]" />
                <span className="text-xl font-semibold text-[#3E2F20]">CareerSprint</span>
              </Link>
              <p className="mb-6 max-w-sm text-[#3E2F20]/70">
                Empowering professionals to master interviews and accelerate their careers with AI-powered preparation.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E2F20]/5 text-[#3E2F20] transition-colors hover:bg-[#3E2F20]/10"
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E2F20]/5 text-[#3E2F20] transition-colors hover:bg-[#3E2F20]/10"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#3E2F20]">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#3E2F20]">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#3E2F20]">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#3E2F20]/70 hover:text-[#3E2F20]">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-[#3E2F20]/10 pt-8">
            <p className="text-center text-sm text-[#3E2F20]/60">
              © {new Date().getFullYear()} CareerSprint AI. All rights reserved. Built with care for your career success.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
