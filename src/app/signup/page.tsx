"use client";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Banner } from "@/components/ui/layout";
import { signUp } from "@/lib/services/auth-service";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import { isEmail } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const { refresh } = useAdmitMind();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (fullName.trim().length < 2) return setError("Please enter your name.");
    if (!isEmail(email)) return setError("Enter a valid email.");
    if (password.length < 8) return setError("Use at least 8 characters.");
    setLoading(true);
    const res = await signUp(email, password, fullName.trim());
    setLoading(false);
    if (!res.ok) return setError(res.message);
    await refresh();
    setInfo("Account created.");
    router.replace("/onboarding");
  }

  return (
    <main className="auth-grid grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
        <Logo />
        <h1 className="mt-6 font-display text-3xl">Create your workspace</h1>
        <p className="mt-2 text-sm text-ink-500">No demo accounts. You create a real local (or Supabase) user.</p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <Field label="Full name">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password" hint="At least 8 characters">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </Field>
          {error ? <Banner tone="warn">{error}</Banner> : null}
          {info ? <Banner tone="ok">{info}</Banner> : null}
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Creating…" : "Sign up"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-ink-500">
          Already have an account?{" "}
          <Link className="font-semibold text-ink-800" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
