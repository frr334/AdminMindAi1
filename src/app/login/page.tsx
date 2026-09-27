"use client";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Banner } from "@/components/ui/layout";
import { signIn } from "@/lib/services/auth-service";
import { isEmail } from "@/lib/utils";
import { useAdmitMind } from "@/lib/state/admitmind-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAdmitMind();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!isEmail(email)) return setError("Enter a valid email.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (!res.ok) return setError(res.message);
    await refresh();
    router.replace("/");
  }

  return (
    <main className="auth-grid grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
        <Logo />
        <h1 className="mt-6 font-display text-3xl text-ink-800">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-500">Sign in to continue your applications and study streak.</p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </Field>
          {error ? <Banner tone="warn">{error}</Banner> : null}
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="mt-6 flex justify-between text-sm">
          <Link className="text-ink-500 hover:text-ink-800" href="/forgot-password">
            Forgot password
          </Link>
          <Link className="font-semibold text-ink-700" href="/signup">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
