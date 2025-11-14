import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Dashboard">
          <Button asChild>
            <Link href="/analysis/new">
              <Sparkles className="mr-2 h-4 w-4" />
              New Job Analysis
            </Link>
          </Button>
        </Header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
