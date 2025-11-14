import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';

export default function LearningPathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Your Learning Path" />
        <main className="flex flex-1 flex-col bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
