'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FilePenLine,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  ClipboardList,
  Search,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AppLogo } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/analysis/new',
    icon: Search,
    label: 'New Analysis',
  },
  {
    href: '/interview/session',
    icon: MessageSquare,
    label: 'Mock Interview',
  },
  {
    href: '/learning-path',
    icon: ClipboardList,
    label: 'Learning Path',
  },
  {
    href: '/resume/edit',
    icon: FilePenLine,
    label: 'Resume Editor',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const navLinks = (isMobile = false) => (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => {
        const isActive = pathname.startsWith(item.href);
        
        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ x: 4 }}
          >
            <Link href={item.href}>
              <span
                className={cn(
                  'group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden',
                  isActive 
                    ? 'bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] text-white shadow-lg' 
                    : 'text-[#3E2F20] hover:bg-[#FAF7F3] hover:shadow-md',
                  isMobile && 'text-base py-4'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId={isMobile ? "mobile-active-pill" : "active-pill"}
                    className="absolute inset-0 bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <motion.div
                  className={cn(
                    "relative z-10 flex items-center w-full",
                    isActive && "text-white"
                  )}
                  whileHover={{ scale: 1.02 }}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 transition-transform duration-300",
                    isActive && "text-white"
                  )} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  )}
                </motion.div>
              </span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden h-full w-64 flex-col border-r border-[#3E2F20]/10 bg-gradient-to-b from-white to-[#FAF7F3] sm:flex relative overflow-hidden">
        {/* Decorative background elements */}
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E8A87C]/10 to-transparent rounded-bl-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#D4B68A]/10 to-transparent rounded-tr-full"
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        <div className="flex h-16 items-center border-b border-[#3E2F20]/10 px-6 relative z-10">
          <Link href="/" className="flex items-center gap-2 font-bold group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <AppLogo className="h-7 w-7 text-[#E8A87C]" />
            </motion.div>
            <span className="text-base bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent">
              JobCraft AI
            </span>
            <Sparkles className="h-4 w-4 text-[#E8A87C] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-6 px-4 relative z-10">
          {navLinks()}
        </div>

        {/* Bottom accent */}
        <motion.div 
          className="p-4 border-t border-[#3E2F20]/10 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-[#E8A87C]/10 to-[#D4B68A]/10 rounded-xl p-3 border border-[#E8A87C]/20">
            <p className="text-xs text-[#3E2F20]/70 font-medium">
              AI-powered career prep ✨
            </p>
          </div>
        </motion.div>
      </aside>
      
      <header className="flex h-16 items-center gap-4 border-b border-[#3E2F20]/10 bg-gradient-to-r from-white to-[#FAF7F3] px-4 sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              variant="outline"
              className="border-[#3E2F20]/20 hover:bg-[#FAF7F3] hover:border-[#E8A87C] transition-all duration-300"
            >
              <Menu className="h-6 w-6 text-[#3E2F20]" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col bg-gradient-to-b from-white to-[#FAF7F3] border-[#3E2F20]/10">
            <div className="flex h-16 items-center border-b border-[#3E2F20]/10 px-6">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold"
              >
                <AppLogo className="h-7 w-7 text-[#E8A87C]" />
                <span className="bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent">
                  JobCraft AI
                </span>
              </Link>
            </div>
            <div className="grid gap-3 py-6 px-2">{navLinks(true)}</div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
