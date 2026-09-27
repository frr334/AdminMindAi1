"use client";

import { Logo } from "@/components/brand/logo";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SplashPage() {
  const { status, session, profile } = useAdmitMind();
  const router = useRouter();

  useEffect(() => {
    if (status !== "ready") return;
    const t = setTimeout(() => {
      if (!session) router.replace("/login");
      else if (!profile?.onboardingComplete) router.replace("/onboarding");
      else router.replace("/dashboard");
    }, 900);
    return () => clearTimeout(t);
  }, [status, session, profile, router]);

  return (
    <main className="auth-grid grid min-h-screen place-items-center px-6">
      <div className="flex flex-col items-center text-center">
        <Logo />
        <p className="mt-6 max-w-sm font-display text-2xl text-ink-800">From first shortlist to exam day.</p>
        <p className="mt-2 text-sm text-ink-500">Admissions and studying, in one calm workspace.</p>
        <div className="mt-10 h-10 w-10 animate-spin rounded-full border-2 border-ink-200 border-t-gold-300" />
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-ink-400">Checking session</p>
      </div>
    </main>
  );
}
