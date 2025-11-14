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
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AppLogo } from '@/lib/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const navLinks = (isMobile = false) => (
    <nav className="grid items-start gap-2">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const link = (
          <Link href={item.href}>
            <span
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                isActive ? 'bg-accent text-accent-foreground' : 'transparent',
                isMobile && 'text-lg'
              )}
            >
              <item.icon className="mr-4 h-5 w-5" />
              <span>{item.label}</span>
            </span>
          </Link>
        );

        if (isMobile) {
            return link;
        }

        return (
            <TooltipProvider key={item.href}>
                <Tooltip>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                        {item.label}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );

      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden h-full w-64 flex-col border-r bg-card sm:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <AppLogo className="h-6 w-6" />
            <span>CareerSprint AI</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
            <div className="flex-1 p-2">{navLinks()}</div>
        </div>
      </aside>
      <header className="flex h-16 items-center gap-4 border-b bg-card px-4 sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <div className="flex h-16 items-center border-b px-6">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold"
              >
                <AppLogo className="h-6 w-6" />
                <span>CareerSprint AI</span>
              </Link>
            </div>
            <div className="grid gap-4 py-4">{navLinks(true)}</div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
