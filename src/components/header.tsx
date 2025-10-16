import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="w-full border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="text-lg font-semibold">高専焼き POSシステム</div>
        <ThemeToggle />
      </div>
    </header>
  );
}
