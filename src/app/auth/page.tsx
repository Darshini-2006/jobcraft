'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Chrome, ArrowLeft, Sparkles } from 'lucide-react';
import { AppLogo } from '@/lib/icons';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: error.message || 'Invalid email or password.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      toast({
        title: 'Account Created!',
        description: 'Welcome to JobCraft AI.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Failed to create account.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Welcome!',
        description: 'You have successfully signed in with Google.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign In Failed',
        description: error.message || 'Failed to sign in with Google.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F3] p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#E8A87C]/20 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#D4B68A]/20 blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Back to Home Link */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#3E2F20]/70 hover:text-[#3E2F20] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Link href="/" className="flex items-center gap-3">
            <AppLogo className="h-12 w-12 text-[#3E2F20]" />
            <span className="text-3xl font-bold text-[#3E2F20]">JobCraft</span>
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-[#E8A87C]/10 px-4 py-1.5 border border-[#E8A87C]/20">
            <Sparkles className="h-4 w-4 text-[#E8A87C]" />
            <p className="text-sm font-medium text-[#3E2F20]">
              AI-powered career preparation
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white border border-[#3E2F20]/10 p-1">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-[#3E2F20] data-[state=active]:text-white rounded-lg"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-[#3E2F20] data-[state=active]:text-white rounded-lg"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card className="border-[#3E2F20]/10 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-bold text-[#3E2F20]">Welcome Back</CardTitle>
                  <CardDescription className="text-[#3E2F20]/60">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleEmailSignIn}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-[#3E2F20] font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-[#3E2F20]/50" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="a@gmail.com"
                          className="pl-10 border-[#3E2F20]/20 focus:border-[#E8A87C] focus:ring-[#E8A87C] bg-white"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-[#3E2F20] font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-[#3E2F20]/50" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 border-[#3E2F20]/20 focus:border-[#E8A87C] focus:ring-[#E8A87C] bg-white"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button
                      type="submit"
                      className="w-full bg-[#3E2F20] hover:bg-[#3E2F20]/90 text-white shadow-lg"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[#3E2F20]/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-[#3E2F20]/60">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-[#3E2F20]/20 text-[#3E2F20] hover:bg-[#3E2F20]/5"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <Chrome className="mr-2 h-4 w-4" />
                      Sign in with Google
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="border-[#3E2F20]/10 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-bold text-[#3E2F20]">Create Account</CardTitle>
                  <CardDescription className="text-[#3E2F20]/60">
                    Sign up to start your career preparation journey
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleEmailSignUp}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-[#3E2F20] font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-[#3E2F20]/50" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10 border-[#3E2F20]/20 focus:border-[#E8A87C] focus:ring-[#E8A87C] bg-white"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-[#3E2F20] font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-[#3E2F20]/50" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="a@gmail.com"
                          className="pl-10 border-[#3E2F20]/20 focus:border-[#E8A87C] focus:ring-[#E8A87C] bg-white"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-[#3E2F20] font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-[#3E2F20]/50" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 border-[#3E2F20]/20 focus:border-[#E8A87C] focus:ring-[#E8A87C] bg-white"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          required
                          minLength={6}
                        />
                      </div>
                      <p className="text-xs text-[#3E2F20]/60">
                        Must be at least 6 characters
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button
                      type="submit"
                      className="w-full bg-[#3E2F20] hover:bg-[#3E2F20]/90 text-white shadow-lg"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[#3E2F20]/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-[#3E2F20]/60">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-[#3E2F20]/20 text-[#3E2F20] hover:bg-[#3E2F20]/5"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <Chrome className="mr-2 h-4 w-4" />
                      Sign up with Google
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.p
          className="text-center text-sm text-[#3E2F20]/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          By continuing, you agree to our{' '}
          <Link href="#" className="underline hover:text-[#3E2F20] font-medium">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="underline hover:text-[#3E2F20] font-medium">
            Privacy Policy
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
