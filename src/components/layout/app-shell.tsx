import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
