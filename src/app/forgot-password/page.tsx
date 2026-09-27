"use client";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Banner } from "@/components/ui/layout";
import { requestPasswordReset } from "@/lib/services/auth-service";
import { isEmail } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!isEmail(email)) return setError("Enter a valid email.");
    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);
    setMessage(res.message);
    if (res.ok) setTimeout(() => router.push("/reset-password"), 600);
  }

  return (
    <main className="auth-grid grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
        <Logo />
        <h1 className="mt-6 font-display text-3xl">Reset password</h1>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          {error ? <Banner tone="warn">{error}</Banner> : null}
          {message ? <Banner tone="ok">{message}</Banner> : null}
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Working…" : "Continue"}
          </Button>
        </form>
        <Link className="mt-6 inline-block text-sm text-ink-500" href="/login">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
