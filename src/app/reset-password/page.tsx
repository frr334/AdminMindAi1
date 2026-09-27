"use client";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Banner } from "@/components/ui/layout";
import { completePasswordReset } from "@/lib/services/auth-service";
import { isEmail } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("admitmind.reset.email");
    if (stored) setEmail(stored);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!isEmail(email)) return setError("Enter a valid email.");
    if (password.length < 8) return setError("Use at least 8 characters.");
    setLoading(true);
    const res = await completePasswordReset(email, password);
    setLoading(false);
    if (!res.ok) return setError(res.message);
    setOk(res.message);
    setTimeout(() => router.push("/login"), 800);
  }

  return (
    <main className="auth-grid grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
        <Logo />
        <h1 className="mt-6 font-display text-3xl">Choose a new password</h1>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="New password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </Field>
          {error ? <Banner tone="warn">{error}</Banner> : null}
          {ok ? <Banner tone="ok">{ok}</Banner> : null}
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Saving…" : "Update password"}
          </Button>
        </form>
        <Link className="mt-6 inline-block text-sm text-ink-500" href="/login">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
