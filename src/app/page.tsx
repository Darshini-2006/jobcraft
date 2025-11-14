import {
  FileText,
  Search,
  GitCompareArrows,
  MessageSquare,
  ClipboardCheck,
  TrendingUp,
  MoveRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/lib/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image-1');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AppLogo className="h-6 w-6" />
            <span className="font-bold">CareerSprint AI</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-16 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div className="flex flex-col items-start gap-6">
              <h1 className="text-4xl font-extrabold tracking-tighter md:text-5xl lg:text-6xl">
                Land Your Dream Job Faster with AI
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                CareerSprint AI analyzes your resume against job descriptions,
                identifies skill gaps, and generates personalized mock
                interviews to get you job-ready.
              </p>
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Start Your Career Sprint <MoveRight className="ml-2" />
                </Link>
              </Button>
            </div>
            {heroImage && (
              <div className="overflow-hidden rounded-xl">
                 <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="w-full object-cover"
                  data-ai-hint={heroImage.imageHint}
                />
              </div>
            )}
          </div>
        </section>

        <section id="features" className="container py-16 md:py-24">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 className="text-3xl font-extrabold tracking-tighter md:text-4xl">
              Your Personal AI Career Coach
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From resume to interview, we provide the tools you need to
              succeed at every step.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CareerSprint AI. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
