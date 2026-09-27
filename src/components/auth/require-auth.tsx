"use client";

import { useAdmitMind } from "@/lib/state/admitmind-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status, session, profile } = useAdmitMind();
  const router = useRouter();

  useEffect(() => {
    if (status !== "ready") return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (profile && !profile.onboardingComplete && !window.location.pathname.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [status, session, profile, router]);

  if (status !== "ready" || !session) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-200 border-t-ink-600" />
      </div>
    );
  }
  return <>{children}</>;
}
