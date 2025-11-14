import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Mock Interview" />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
