import { UserNav } from '@/components/user-nav';

type HeaderProps = {
    title: string;
    children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-[#3E2F20]/10 bg-gradient-to-r from-white to-[#FAF7F3] px-4 sm:px-6">
        <h1 className="text-lg font-semibold md:text-2xl bg-gradient-to-r from-[#3E2F20] to-[#E8A87C] bg-clip-text text-transparent">{title}</h1>
        <div className="flex items-center gap-4">
            {children}
            <UserNav />
        </div>
    </header>
  );
}
