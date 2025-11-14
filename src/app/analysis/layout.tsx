import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';

export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title="Job Analysis" />
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
