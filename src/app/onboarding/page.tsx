"use client";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Banner } from "@/components/ui/layout";
import { repositories, useAdmitMind } from "@/lib/state/admitmind-store";
import type { DegreeLevel, EducationLevel, UniversitySize } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const steps = ["You", "Academics", "Preferences", "Goals"] as const;

type FormState = {
  fullName: string;
  age: string;
  country: string;
  educationLevel: EducationLevel;
  graduationYear: string;
  intendedUniversityCountry: string;
  intendedMajor: string;
  gpa: string;
  sat: string;
  act: string;
  ielts: string;
  toefl: string;
  budgetUsd: string;
  preferredSize: UniversitySize;
  preferredLocation: string;
  academicInterests: string;
  careerInterests: string;
  interestedCountries: string;
  consideringUniversities: string;
  desiredDegree: DegreeLevel;
  enrollTerm: string;
};

const defaultFormState: FormState = {
  fullName: "",
  age: "",
  country: "",
  educationLevel: "high_school",
  graduationYear: "",
  intendedUniversityCountry: "",
  intendedMajor: "",
  gpa: "",
  sat: "",
  act: "",
  ielts: "",
  toefl: "",
  budgetUsd: "",
  preferredSize: "no_preference",
  preferredLocation: "",
  academicInterests: "",
  careerInterests: "",
  interestedCountries: "",
  consideringUniversities: "",
  desiredDegree: "bachelor",
  enrollTerm: "",
};

type ProfileType = ReturnType<typeof useAdmitMind>["profile"];

function createFormStateFromProfile(profile: ProfileType): FormState {
  if (!profile) return defaultFormState;
  
    return {
      fullName: profile.fullName ?? "",
      age: profile.age?.toString() ?? "",
      country: profile.country ?? "",
      educationLevel: (profile.educationLevel ?? "high_school") as EducationLevel,
      graduationYear: profile.graduationYear?.toString() ?? "",
      intendedUniversityCountry: profile.intendedUniversityCountry ?? "",
      intendedMajor: profile.intendedMajor ?? "",
      gpa: profile.gpa ?? "",
      sat: profile.testScores?.sat?.toString() ?? "",
      act: profile.testScores?.act?.toString() ?? "",
      ielts: profile.testScores?.ielts?.toString() ?? "",
      toefl: profile.testScores?.toefl?.toString() ?? "",
      budgetUsd: profile.budgetUsd?.toString() ?? "",
      preferredSize: (profile.preferredSize ?? "no_preference") as UniversitySize,
      preferredLocation: profile.preferredLocation ?? "",
      academicInterests: profile.academicInterests?.join(", ") ?? "",
      careerInterests: profile.careerInterests?.join(", ") ?? "",
      interestedCountries: profile.interestedCountries?.join(", ") ?? "",
      consideringUniversities: profile.consideringUniversities?.join(", ") ?? "",
      desiredDegree: (profile.desiredDegree ?? "bachelor") as DegreeLevel,
      enrollTerm: profile.enrollTerm ?? "",
    };
  }

export default function OnboardingPage() {
  const { profile, persist, status } = useAdmitMind();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(() =>
    createFormStateFromProfile(profile)
  );

  useEffect(() => {
    if (!profile) return;
    setForm(createFormStateFromProfile(profile));
  }, [profile]);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  if (status !== "ready") {
    return null;
  }

  if (!profile) {
    router.replace("/login");
    return null;
  }

  const split = (value: string): string[] => {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const savePartial = (complete: boolean): void => {
    if (!profile?.id) return;

    void repositories.updateProfile(persist, profile.id, {
      fullName: form.fullName.trim(),
      age: form.age ? Number(form.age) : null,
      country: form.country.trim(),
      educationLevel: form.educationLevel,
      graduationYear: form.graduationYear
        ? Number(form.graduationYear)
        : null,
      intendedUniversityCountry: form.intendedUniversityCountry.trim(),
      intendedMajor: form.intendedMajor.trim(),
      gpa: form.gpa.trim() || null,
      testScores: {
        sat: form.sat ? Number(form.sat) : null,
        act: form.act ? Number(form.act) : null,
        ielts: form.ielts ? Number(form.ielts) : null,
        toefl: form.toefl ? Number(form.toefl) : null,
      },
      budgetUsd: form.budgetUsd ? Number(form.budgetUsd) : null,
      preferredSize: form.preferredSize,
      preferredLocation: form.preferredLocation.trim(),
      academicInterests: split(form.academicInterests),
      careerInterests: split(form.careerInterests),
      interestedCountries: split(form.interestedCountries),
      consideringUniversities: split(form.consideringUniversities),
      desiredDegree: form.desiredDegree,
      enrollTerm: form.enrollTerm.trim(),
      onboardingComplete: complete,
    });
  };

  const next = (): void => {
    setError("");

    if (step === 0 && form.fullName.trim().length < 2) {
      setError("Name is required.");
      return;
    }

    if (step === 3 && !form.enrollTerm.trim()) {
      setError("Tell us when you plan to enroll.");
      return;
    }

    if (step < steps.length - 1) {
      savePartial(false);
      setStep((current) => current + 1);
      return;
    }

    savePartial(true);
    router.replace("/dashboard");
  };

  const setField = (key: keyof FormState, value: string): void => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <main className="auth-grid min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-8 shadow-card">
        <Logo />

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
          Step {step + 1} · {steps[step]}
        </p>

        <h1 className="mt-2 font-display text-3xl">
          Let&apos;s personalize AdmitMind
        </h1>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-50">
          <div
            className="h-full bg-ink-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-8 grid gap-4">
          {step === 0 && (
            <>
              <Field label="Name">
                <Input
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                />
              </Field>

              <Field label="Age">
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) => setField("age", e.target.value)}
                />
              </Field>

              <Field label="Country">
                <Input
                  value={form.country}
                  onChange={(e) => setField("country", e.target.value)}
                />
              </Field>

              <Field label="Current education level">
                <Select
                  value={form.educationLevel}
                  onChange={(e) =>
                    setField("educationLevel", e.target.value as EducationLevel)
                  }
                >
                  <option value="high_school">High school</option>
                  <option value="foundation">Foundation</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="masters">Master&apos;s</option>
                  <option value="phd">PhD</option>
                  <option value="other">Other</option>
                </Select>
              </Field>

              <Field label="Graduation year">
                <Input
                  type="number"
                  value={form.graduationYear}
                  onChange={(e) => setField("graduationYear", e.target.value)}
                />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Intended university country">
                <Input
                  value={form.intendedUniversityCountry}
                  onChange={(e) =>
                    setField("intendedUniversityCountry", e.target.value)
                  }
                />
              </Field>

              <Field label="Intended field / major">
                <Input
                  value={form.intendedMajor}
                  onChange={(e) => setField("intendedMajor", e.target.value)}
                />
              </Field>

              <Field label="GPA / grades">
                <Input
                  value={form.gpa}
                  onChange={(e) => setField("gpa", e.target.value)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="SAT">
                  <Input
                    type="number"
                    value={form.sat}
                    onChange={(e) => setField("sat", e.target.value)}
                  />
                </Field>

                <Field label="ACT">
                  <Input
                    type="number"
                    value={form.act}
                    onChange={(e) => setField("act", e.target.value)}
                  />
                </Field>

                <Field label="IELTS">
                  <Input
                    type="number"
                    step="0.5"
                    value={form.ielts}
                    onChange={(e) => setField("ielts", e.target.value)}
                  />
                </Field>

                <Field label="TOEFL">
                  <Input
                    type="number"
                    value={form.toefl}
                    onChange={(e) => setField("toefl", e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Annual budget (USD, optional)">
                <Input
                  type="number"
                  value={form.budgetUsd}
                  onChange={(e) => setField("budgetUsd", e.target.value)}
                />
              </Field>

              <Field label="Preferred university size">
                <Select
                  value={form.preferredSize}
                  onChange={(e) =>
                    setField("preferredSize", e.target.value as UniversitySize)
                  }
                >
                  <option value="no_preference">No preference</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </Select>
              </Field>

              <Field label="Preferred location type">
                <Input
                  placeholder="City, campus town, coastal…"
                  value={form.preferredLocation}
                  onChange={(e) =>
                    setField("preferredLocation", e.target.value)
                  }
                />
              </Field>

              <Field label="Academic interests" hint="Comma-separated">
                <Input
                  value={form.academicInterests}
                  onChange={(e) =>
                    setField("academicInterests", e.target.value)
                  }
                />
              </Field>

              <Field label="Career interests" hint="Comma-separated">
                <Input
                  value={form.careerInterests}
                  onChange={(e) => setField("careerInterests", e.target.value)}
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Field
                label="Which countries are you interested in?"
                hint="Comma-separated"
              >
                <Input
                  value={form.interestedCountries}
                  onChange={(e) =>
                    setField("interestedCountries", e.target.value)
                  }
                />
              </Field>

              <Field label="Universities you are considering">
                <Textarea
                  value={form.consideringUniversities}
                  onChange={(e) =>
                    setField("consideringUniversities", e.target.value)
                  }
                />
              </Field>

              <Field label="Degree you want">
                <Select
                  value={form.desiredDegree}
                  onChange={(e) =>
                    setField("desiredDegree", e.target.value as DegreeLevel)
                  }
                >
                  <option value="bachelor">Bachelor&apos;s</option>
                  <option value="master">Master&apos;s</option>
                  <option value="phd">PhD</option>
                  <option value="other">Other</option>
                </Select>
              </Field>

              <Field label="When do you plan to enroll?">
                <Input
                  placeholder="Fall 2027"
                  value={form.enrollTerm}
                  onChange={(e) => setField("enrollTerm", e.target.value)}
                />
              </Field>
            </>
          )}
        </div>

        {error ? (
          <div className="mt-4">
            <Banner tone="warn">{error}</Banner>
          </div>
        ) : null}

        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
          >
            Back
          </Button>

          <Button type="button" onClick={next}>
            {step === steps.length - 1 ? "Enter AdmitMind" : "Continue"}
          </Button>
        </div>
      </div>
    </main>
  );
}

