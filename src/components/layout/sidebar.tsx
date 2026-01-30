"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Globe,
  Briefcase,
  ClipboardList,
  Eye,
  Settings,
  Menu,
  X,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/analyze", label: "Analyze", icon: Search },
  { href: "/macro", label: "Macro", icon: Globe },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/decisions", label: "Decisions", icon: ClipboardList },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-sand-800 bg-sand-950 px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-400" />
          <span className="font-display text-xl text-white">Invest</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-sand-300 hover:bg-sand-800 hover:text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-sand-950/80 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-sand-950 transition-transform lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-sand-800 px-6 lg:h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-400" />
            <span className="font-display text-2xl text-white">Invest</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  {item.disabled ? (
                    <span
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                        "text-sand-600 cursor-not-allowed"
                      )}
                    >
                      <Icon size={20} />
                      <span className="flex flex-col">
                        <span>{item.label}</span>
                        <span className="text-xs text-sand-700">
                          Coming soon
                        </span>
                      </span>
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary-600 text-white"
                          : "text-sand-300 hover:bg-sand-800 hover:text-white"
                      )}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sand-800 p-4 space-y-3">
          <div className="rounded-lg bg-sand-900 px-3 py-2">
            <p className="text-xs text-sand-400">Framework</p>
            <p className="font-medium text-primary-400">Buffett + Dalio</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start gap-3 text-sand-400 hover:bg-sand-800 hover:text-white"
          >
            <LogOut size={20} />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
