"use client";

import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/field";
import { Banner, Card, PageHeader } from "@/components/ui/layout";
import { AIService } from "@/lib/ai/ai-service";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { Conversation, Message, TutorSubject } from "@/lib/types";
import { nowIso, uid } from "@/lib/utils";
import { useMemo, useState } from "react";

const subjects: TutorSubject[] = ["mathematics","biology","chemistry","physics","economics","history","languages","other"];

export default function TutorPage() {
  const { session, db, persist, settings } = useAdmitMind();
  const convos = db.conversations.filter((c) => c.userId === session!.userId);
  const [activeId, setActiveId] = useState<string | null>(convos[0]?.id || null);
  const [subject, setSubject] = useState<TutorSubject>("mathematics");
  const [difficulty, setDifficulty] = useState<"intro" | "standard" | "advanced">("standard");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const active = convos.find((c) => c.id === activeId) || null;
  const messages = useMemo(() => db.messages.filter((m) => m.conversationId === activeId), [db.messages, activeId]);

  function newChat() {
    const c: Conversation = {
      id: uid(),
      userId: session!.userId,
      subject,
      difficulty,
      title: `${subject} · ${difficulty}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    repositories.saveConversation(persist, c);
    setActiveId(c.id);
  }

  async function send() {
    if (!active || !input.trim()) return;
    setBusy(true);
    setError("");
    const userMsg: Message = { id: uid(), conversationId: active.id, role: "user", content: input.trim(), createdAt: nowIso() };
    persist((d) => d.messages.push(userMsg));
    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    const res = await AIService.tutor({ subject: active.subject, difficulty: active.difficulty, messages: history, tone: settings?.aiTone });
    const assistant: Message = {
      id: uid(),
      conversationId: active.id,
      role: "assistant",
      content: res.ok
        ? (res.data as { reply: string }).reply
        : "The tutor backend is not connected. Your question is saved. Configure NEXT_PUBLIC_AI_API_URL and a server-side key to receive explanations.",
      createdAt: nowIso(),
      meta: { source: res.ok ? "ai_api" : "local", unavailable: !res.ok },
    };
    persist((d) => {
      d.messages.push(assistant);
      const row = d.conversations.find((c) => c.id === active.id);
      if (row) row.updatedAt = nowIso();
    });
    if (!res.ok) setError(res.message);
    setInput("");
    setBusy(false);
  }

  return (
    <div>
      <PageHeader eyebrow="Study" title="AI Tutor" description="Ask questions by subject and difficulty. Replies require a secured AI backend." />
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="space-y-2">
          <Field label="Subject">
            <Select value={subject} onChange={(e) => setSubject(e.target.value as TutorSubject)}>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Difficulty">
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
              <option value="intro">Intro</option>
              <option value="standard">Standard</option>
              <option value="advanced">Advanced</option>
            </Select>
          </Field>
          <Button className="w-full" onClick={newChat}>New conversation</Button>
          <div className="space-y-1 pt-2">
            {convos.map((c) => (
              <button key={c.id} onClick={() => setActiveId(c.id)} className="block w-full rounded-xl px-2 py-1 text-left text-sm hover:bg-ink-50">
                {c.title}
              </button>
            ))}
          </div>
        </Card>
        <Card className="flex min-h-[480px] flex-col">
          {!active ? <p className="text-sm text-ink-500">Start a conversation.</p> : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {messages.map((m) => (
                  <div key={m.id} className={m.role === "user" ? "ml-8 rounded-2xl bg-ink-500 p-3 text-sm text-white" : "mr-8 rounded-2xl bg-study-50 p-3 text-sm"}>
                    {m.content}
                    {m.meta?.unavailable ? <p className="mt-2 text-xs opacity-70">Placeholder — AI not connected</p> : null}
                  </div>
                ))}
              </div>
              {error ? <div className="mt-3"><Banner tone="warn">{error}</Banner></div> : null}
              <div className="mt-4 flex gap-2">
                <Textarea className="min-h-[72px]" value={input} onChange={(e) => setInput(e.target.value)} />
                <Button disabled={busy} onClick={send}>{busy ? "…" : "Send"}</Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
