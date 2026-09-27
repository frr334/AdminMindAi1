"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Card, PageHeader } from "@/components/ui/layout";
import { SAMPLE_SCHOLARSHIPS, SAMPLE_UNIVERSITIES } from "@/lib/data/catalog";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { EducationLevel, UniversitySize } from "@/lib/types";

export default function ProfilePage() {
  const { session, profile, persist, db } = useAdmitMind();
  if (!profile) return null;
  const savedUnis = db.savedUniversities.filter((s) => s.userId === session!.userId);
  const savedSch = db.scholarshipsSaved.filter((s) => s.userId === session!.userId);

  return (
    <div>
      <PageHeader title="Profile" description="Academic identity used for matching, scholarships, and study defaults." />
      <form
        className="grid gap-4 lg:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          repositories.updateProfile(persist, session!.userId, {
            fullName: String(fd.get("fullName")),
            country: String(fd.get("country")),
            intendedMajor: String(fd.get("intendedMajor")),
            intendedUniversityCountry: String(fd.get("intendedUniversityCountry")),
            gpa: String(fd.get("gpa")),
            educationLevel: String(fd.get("educationLevel")) as EducationLevel,
            preferredSize: String(fd.get("preferredSize")) as UniversitySize,
            preferredLocation: String(fd.get("preferredLocation")),
            academicInterests: String(fd.get("academicInterests")).split(",").map((s) => s.trim()).filter(Boolean),
            careerInterests: String(fd.get("careerInterests")).split(",").map((s) => s.trim()).filter(Boolean),
            testScores: {
              sat: Number(fd.get("sat")) || null,
              act: Number(fd.get("act")) || null,
              ielts: Number(fd.get("ielts")) || null,
              toefl: Number(fd.get("toefl")) || null,
            },
          });
        }}
      >
        <Card className="space-y-3">
          <h3 className="font-semibold">Identity</h3>
          <Field label="Name"><Input name="fullName" defaultValue={profile.fullName} /></Field>
          <Field label="Country"><Input name="country" defaultValue={profile.country} /></Field>
          <Field label="Education level">
            <Select name="educationLevel" defaultValue={profile.educationLevel}>
              <option value="high_school">High school</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="masters">Master’s</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </Select>
          </Field>
        </Card>
        <Card className="space-y-3">
          <h3 className="font-semibold">Academics & tests</h3>
          <Field label="Major"><Input name="intendedMajor" defaultValue={profile.intendedMajor} /></Field>
          <Field label="Target country"><Input name="intendedUniversityCountry" defaultValue={profile.intendedUniversityCountry} /></Field>
          <Field label="GPA"><Input name="gpa" defaultValue={profile.gpa} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="SAT"><Input name="sat" defaultValue={profile.testScores.sat ?? ""} /></Field>
            <Field label="ACT"><Input name="act" defaultValue={profile.testScores.act ?? ""} /></Field>
            <Field label="IELTS"><Input name="ielts" defaultValue={profile.testScores.ielts ?? ""} /></Field>
            <Field label="TOEFL"><Input name="toefl" defaultValue={profile.testScores.toefl ?? ""} /></Field>
          </div>
        </Card>
        <Card className="space-y-3 lg:col-span-2">
          <h3 className="font-semibold">Preferences</h3>
          <Field label="Campus size">
            <Select name="preferredSize" defaultValue={profile.preferredSize}>
              <option value="no_preference">No preference</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </Select>
          </Field>
          <Field label="Location"><Input name="preferredLocation" defaultValue={profile.preferredLocation} /></Field>
          <Field label="Academic interests"><Input name="academicInterests" defaultValue={profile.academicInterests.join(", ")} /></Field>
          <Field label="Career interests"><Textarea name="careerInterests" defaultValue={profile.careerInterests.join(", ")} /></Field>
          <Button type="submit">Save profile</Button>
        </Card>
      </form>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-semibold">Saved universities</h3>
          <ul className="mt-2 text-sm">
            {savedUnis.map((s) => {
              const u = SAMPLE_UNIVERSITIES.find((x) => x.id === s.universityId);
              return <li key={s.id}>{u?.name}</li>;
            })}
          </ul>
        </Card>
        <Card>
          <h3 className="font-semibold">Saved scholarships</h3>
          <ul className="mt-2 text-sm">
            {savedSch.map((s) => {
              const sc = SAMPLE_SCHOLARSHIPS.find((x) => x.id === s.scholarshipId);
              return <li key={s.id}>{sc?.name} · {s.status}</li>;
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
