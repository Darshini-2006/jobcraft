import { UserNav } from '@/components/user-nav';

type HeaderProps = {
    title: string;
    children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
        <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
        <div className="flex items-center gap-4">
            {children}
            <UserNav />
        </div>
    </header>
  );
}
