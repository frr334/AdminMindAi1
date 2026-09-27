"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Banner, Card, PageHeader } from "@/components/ui/layout";
import { buildStudyPlan } from "@/lib/analysis/local-engines";
import { AIService } from "@/lib/ai/ai-service";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { StudyPlan } from "@/lib/types";
import { formatDate, nowIso, uid } from "@/lib/utils";
import { useState } from "react";

export default function PlannerPage() {
  const { session, db, persist } = useAdmitMind();
  const plans = db.studyPlans.filter((p) => p.userId === session!.userId);
  const [subject, setSubject] = useState("Chemistry");
  const [examDate, setExamDate] = useState("");
  const [knowledge, setKnowledge] = useState("Developing");
  const [hours, setHours] = useState("8");
  const [grade, setGrade] = useState("A");
  const [topics, setTopics] = useState("stoichiometry, acids, organic");
  const [msg, setMsg] = useState("");

  async function generate() {
    if (!examDate) return setMsg("Set an exam date.");
    const topicList = topics.split(",").map((t) => t.trim()).filter(Boolean);
    const tasks = buildStudyPlan({ examDate, subject, hoursPerWeek: Number(hours) || 8, topics: topicList }).map((t) => ({
      ...t,
      id: uid(),
      done: false,
    }));
    const plan: StudyPlan = {
      id: uid(),
      userId: session!.userId,
      subject,
      examDate: new Date(examDate).toISOString(),
      currentKnowledge: knowledge,
      hoursPerWeek: Number(hours) || 8,
      targetGrade: grade,
      topics: topicList,
      tasks,
      createdAt: nowIso(),
    };
    repositories.savePlan(persist, plan);
    const ai = await AIService.generateStudyPlan(plan);
    setMsg(ai.ok ? "Plan saved. AI backend also returned a plan you can merge later." : `${ai.message} A local schedule was generated so you can edit tasks now.`);
  }

  return (
    <div>
      <PageHeader title="Study planner" description="Generate a calendar from exam date, hours, and topics. Edit any day." />
      <Card className="mb-6 grid gap-3 md:grid-cols-2">
        <Field label="Subject"><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
        <Field label="Exam date"><Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></Field>
        <Field label="Current knowledge"><Input value={knowledge} onChange={(e) => setKnowledge(e.target.value)} /></Field>
        <Field label="Hours per week"><Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} /></Field>
        <Field label="Target grade"><Input value={grade} onChange={(e) => setGrade(e.target.value)} /></Field>
        <Field label="Topics"><Textarea className="min-h-16" value={topics} onChange={(e) => setTopics(e.target.value)} /></Field>
        {msg ? <div className="md:col-span-2"><Banner>{msg}</Banner></div> : null}
        <Button onClick={generate}>Generate plan</Button>
      </Card>
      {plans.map((p) => (
        <Card key={p.id} className="mb-4">
          <p className="font-display text-xl">{p.subject} · exam {formatDate(p.examDate)}</p>
          <ul className="mt-3 space-y-2">
            {p.tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={t.done} onChange={() => persist((d) => {
                  const plan = d.studyPlans.find((x) => x.id === p.id);
                  const task = plan?.tasks.find((x) => x.id === t.id);
                  if (task) {
                    task.done = !task.done;
                    if (task.done) repositories.addStudyMinutes(persist, session!.userId, task.minutes || 20, p.subject, "planner");
                  }
                })} />
                <span className="w-24 text-ink-400">{formatDate(t.date)}</span>
                <span>{t.title}</span>
                <span className="text-xs uppercase text-ink-400">{t.kind}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
