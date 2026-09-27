"use client";

import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { Banner, Card, PageHeader } from "@/components/ui/layout";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { ThemePreference, UserSettings } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const { session, settings, persist, logout, subscription } = useAdmitMind();
  const router = useRouter();
  const [msg, setMsg] = useState("");
  if (!settings) return null;

  function save(patch: Partial<UserSettings>) {
    repositories.updateSettings(persist, session!.userId, patch);
    setMsg("Saved.");
  }

  return (
    <div>
      <PageHeader title="Settings" />
      {msg ? <div className="mb-4"><Banner tone="ok">{msg}</Banner></div> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-2">
          <h3 className="font-semibold">Account</h3>
          <p className="text-sm text-ink-500">{session?.email}</p>
          <p className="text-xs text-ink-400">Auth mode: {isSupabaseConfigured() ? "Supabase" : "local (development)"}</p>
        </Card>
        <Card className="space-y-2">
          <h3 className="font-semibold">Security</h3>
          <p className="text-sm text-ink-500">Change passwords via Forgot password. Enable MFA after connecting Supabase Auth.</p>
        </Card>
        <Card className="space-y-3">
          <h3 className="font-semibold">Notifications</h3>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked={settings.notificationsEnabled} onChange={(e) => save({ notificationsEnabled: e.target.checked })} />
            Product notifications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked={settings.deadlineReminders} onChange={(e) => save({ deadlineReminders: e.target.checked })} />
            Deadline reminders
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked={settings.streakReminders} onChange={(e) => save({ streakReminders: e.target.checked })} />
            Streak reminders
          </label>
        </Card>
        <Card>
          <h3 className="font-semibold">Appearance</h3>
          <Field label="Theme">
            <Select defaultValue={settings.appearance} onChange={(e) => save({ appearance: e.target.value as ThemePreference })}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark (tokens reserved)</option>
            </Select>
          </Field>
        </Card>
        <Card>
          <h3 className="font-semibold">AI preferences</h3>
          <Field label="Tone">
            <Select defaultValue={settings.aiTone} onChange={(e) => save({ aiTone: e.target.value as UserSettings["aiTone"] })}>
              <option value="concise">Concise</option>
              <option value="detailed">Detailed</option>
              <option value="socratic">Socratic</option>
            </Select>
          </Field>
        </Card>
        <Card>
          <h3 className="font-semibold">Privacy</h3>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked={settings.shareAnalytics} onChange={(e) => save({ shareAnalytics: e.target.checked })} />
            Share anonymous product analytics (off by default)
          </label>
        </Card>
        <Card>
          <h3 className="font-semibold">Subscription</h3>
          <p className="text-sm">{subscription?.plan} · {subscription?.status} · provider {subscription?.provider}</p>
        </Card>
        <Card>
          <h3 className="font-semibold">Logout</h3>
          <Button
            variant="danger"
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
          >
            Sign out
          </Button>
        </Card>
      </div>
    </div>
  );
}
