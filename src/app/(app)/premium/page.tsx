"use client";

import { Button } from "@/components/ui/button";
import { Banner, Card, PageHeader } from "@/components/ui/layout";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import { useState } from "react";

const FEATURES = [
  "Unlimited essay reviews",
  "Advanced university matching",
  "Personalized scholarship recommendations",
  "Unlimited flashcard generation",
  "AI interview practice",
  "SAT preparation",
  "ACT preparation",
  "IELTS preparation",
  "TOEFL preparation",
];

export default function PremiumPage() {
  const { session, subscription, persist } = useAdmitMind();
  const [msg, setMsg] = useState("");

  function placeholderSubscribe(plan: "premium_monthly" | "premium_yearly") {
    persist((d) => {
      const row = d.subscriptions.find((s) => s.userId === session!.userId);
      if (!row) return;
      row.plan = plan;
      row.status = "active";
      row.provider = "none";
      row.currentPeriodEnd = new Date(Date.now() + (plan === "premium_monthly" ? 30 : 365) * 86400000).toISOString();
    });
    setMsg("Local placeholder subscription only. Stripe is not configured, so no payment was taken.");
  }

  return (
    <div>
      <PageHeader
        title="AdmitMind Premium"
        description="Placeholder pricing. Checkout will attach to Stripe (or another provider) through a server route — never with a secret key in the browser."
      />
      {msg ? <div className="mb-4"><Banner tone="warn">{msg}</Banner></div> : null}
      <p className="mb-6 text-sm text-ink-500">Current plan: {subscription?.plan} ({subscription?.status})</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-widest text-ink-400">Monthly</p>
          <p className="mt-2 font-display text-4xl">$19<span className="text-lg">/mo</span></p>
          <p className="mt-1 text-sm text-ink-500">Placeholder</p>
          <Button className="mt-6 w-full" onClick={() => placeholderSubscribe("premium_monthly")}>Choose monthly</Button>
        </Card>
        <Card className="border-gold-200">
          <p className="text-xs uppercase tracking-widest text-gold-500">Yearly</p>
          <p className="mt-2 font-display text-4xl">$149<span className="text-lg">/yr</span></p>
          <p className="mt-1 text-sm text-ink-500">Placeholder · two months free vs monthly</p>
          <Button className="mt-6 w-full" variant="gold" onClick={() => placeholderSubscribe("premium_yearly")}>Choose yearly</Button>
        </Card>
      </div>
      <Card className="mt-8">
        <h3 className="font-display text-2xl">Included when billing is live</h3>
        <ul className="mt-4 grid gap-2 md:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f} className="text-sm">• {f}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
