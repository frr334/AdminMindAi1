"use client";

import { Logo } from "@/components/brand/logo";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Compass,
  FileText,
  GraduationCap,
  Home,
  Layers,
  LogOut,
  Menu,
  Mic,
  PenLine,
  Sparkles,
  User,
  X,
  CreditCard,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/admissions/universities", label: "Universities", icon: GraduationCap },
  { href: "/admissions/scholarships", label: "Scholarships", icon: Sparkles },
  { href: "/admissions/applications", label: "Applications", icon: ClipboardList },
  { href: "/admissions/essays", label: "Essays", icon: PenLine },
  { href: "/study/flashcards", label: "Flashcards", icon: CreditCard },
  { href: "/admissions/deadlines", label: "Deadlines", icon: CalendarDays },
];

const secondaryNav = [
  { href: "/admissions/matching", label: "University Matching", icon: Compass },
  { href: "/admissions/recommendations", label: "Recommendations", icon: Layers },
  { href: "/admissions/interviews", label: "Interview Practice", icon: Mic },
  { href: "/admissions/personal-statement", label: "Personal Statement", icon: FileText },
];

function NavItem({
  href,
  label,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  onClick?: () => void;
}) {
  const path = usePathname();
  const active = path === href || (href !== "/dashboard" && path.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-ink-500 text-white shadow-sm"
          : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-ink-500")} />
      <span>{label}</span>
    </Link>
  );
}

function Sidebar() {
  const { profile, logout } = useAdmitMind();

  return (
    <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-ink-100 bg-white p-5 lg:flex">
      <div>
        <div className="flex items-center justify-between pb-6 pt-1">
          <Link href="/dashboard" className="focus:outline-none">
            <Logo />
          </Link>
        </div>

        <nav className="space-y-6">
          <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
              Core Platform
            </p>
            <div className="space-y-1">
              {primaryNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-500">
              Admissions Tools
            </p>
            <div className="space-y-1">
              {secondaryNav.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div className="border-t border-ink-100 pt-4">
        <NavItem href="/profile" label="Profile & Settings" icon={User} />
        <div className="mt-3 flex items-center justify-between rounded-xl bg-paper px-3 py-2.5">
          <div className="min-w-0 flex-1 pr-2">
            <p className="truncate text-xs font-semibold text-ink-800">
              {profile?.full_name || "AdmitMind Student"}
            </p>
            <p className="truncate text-[11px] text-ink-400">
              {profile?.email || "Student Workspace"}
            </p>
          </div>
          <button
            onClick={() => void logout()}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-white hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAdmitMind();
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = usePathname();

  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-paper text-ink-800">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
            <Link href="/dashboard" className="focus:outline-none">
              <Logo />
            </Link>
            <button
              aria-label="Open navigation menu"
              className="rounded-xl p-2 text-ink-700 hover:bg-ink-50 focus:outline-none"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </header>

          {/* Mobile Drawer */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <div
                className="h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-ink-100 pb-4">
                  <Logo />
                  <button
                    aria-label="Close navigation menu"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-1 text-ink-500 hover:bg-ink-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  <div>
                    <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
                      Core Platform
                    </p>
                    <div className="space-y-1">
                      {primaryNav.map((item) => (
                        <NavItem
                          key={item.href}
                          {...item}
                          onClick={() => setMobileOpen(false)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-500">
                      Admissions Tools
                    </p>
                    <div className="space-y-1">
                      {secondaryNav.map((item) => (
                        <NavItem
                          key={item.href}
                          {...item}
                          onClick={() => setMobileOpen(false)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-ink-100 pt-4">
                    <NavItem
                      href="/profile"
                      label="Profile & Settings"
                      icon={User}
                      onClick={() => setMobileOpen(false)}
                    />
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        void logout();
                      }}
                      className="mt-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 px-4 py-6 sm:px-8 pb-20 lg:pb-8">{children}</main>

          {/* Mobile Bottom Navigation Bar */}
          <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-ink-100 bg-white/95 px-2 py-2 shadow-lg backdrop-blur lg:hidden">
            {[
              { href: "/dashboard", label: "Home", icon: Home },
              { href: "/admissions/universities", label: "Unis", icon: GraduationCap },
              { href: "/admissions/applications", label: "Apps", icon: ClipboardList },
              { href: "/study/flashcards", label: "Flashcards", icon: CreditCard },
              { href: "/profile", label: "Profile", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const active =
                path === item.href ||
                (item.href !== "/dashboard" && path.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-1 text-[11px] font-medium transition-colors",
                    active ? "text-ink-600 font-semibold" : "text-ink-400 hover:text-ink-600"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "text-ink-600")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </RequireAuth>
  );
}
