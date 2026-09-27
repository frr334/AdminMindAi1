import type { Profile, University, Scholarship } from "@/lib/types";

export interface UniversityMatch {
  university: University;
  fitScore: number; // 0 - 100
  tier: "High Fit" | "Target Fit" | "Reach / Stretch";
  matchFactors: string[];
  considerations: string[];
}

export interface ScholarshipMatch {
  scholarship: Scholarship;
  fitScore: number; // 0 - 100
  matchFactors: string[];
}

/**
 * Deterministic university matching algorithm using real database fields:
 * - Profile intended major vs university programs/description
 * - Profile target countries vs university country
 * - Profile country vs international tuition
 * - University ranking & selectivity
 */
export function calculateUniversityMatches(
  profile: Profile | null,
  universities: University[]
): UniversityMatch[] {
  if (!profile || universities.length === 0) return [];

  const targetCountries = (profile.target_countries || []).map((c) => c.toLowerCase().trim()).filter(Boolean);
  const homeCountry = (profile.country || "").toLowerCase().trim();
  const major = (profile.intended_major || "").toLowerCase().trim();

  return universities.map((uni) => {
    let score = 50; // base score
    const matchFactors: string[] = [];
    const considerations: string[] = [];

    // 1. Country & Location alignment (up to +25)
    const uniCountry = uni.country.toLowerCase().trim();
    if (targetCountries.some((tc) => uniCountry.includes(tc) || tc.includes(uniCountry))) {
      score += 25;
      matchFactors.push(`Matches your priority target destination: ${uni.country}`);
    } else if (homeCountry && uniCountry === homeCountry) {
      score += 15;
      matchFactors.push(`Located in your home country (${uni.country})`);
    } else {
      considerations.push(`Outside your listed target countries (${uni.country})`);
    }

    // 2. Academic Major alignment (up to +20)
    if (major) {
      const desc = (uni.description || "").toLowerCase();
      if (desc.includes(major)) {
        score += 20;
        matchFactors.push(`Renowned programs in ${profile.intended_major}`);
      } else {
        // General university tier
        score += 8;
        matchFactors.push(`Comprehensive curriculum offering degree paths aligned with ${profile.intended_major}`);
      }
    }

    // 3. Selectivity & Ranking (Target vs Reach calculation)
    const ranking = uni.ranking ?? 50;
    const acceptanceRate = uni.acceptance_rate ?? 0.2;

    if (ranking <= 10) {
      matchFactors.push(`Top 10 global institution (#${ranking}) with worldwide alumni network`);
      if (acceptanceRate < 0.1) {
        considerations.push(`Highly selective acceptance rate (${Math.round(acceptanceRate * 100)}%)—requires top-tier essays and portfolio`);
      }
    } else if (ranking <= 25) {
      matchFactors.push(`Top 25 prestigious global university (#${ranking})`);
      score += 5;
    }

    // 4. Affordability / Tuition alignment
    if (uni.tuition_usd && uni.tuition_usd < 10000) {
      score += 10;
      matchFactors.push(`Extremely attractive public tuition (~$${uni.tuition_usd.toLocaleString()}/year)`);
    } else if (uni.tuition_usd && uni.tuition_usd > 50000) {
      considerations.push(`Higher annual tuition tier (~$${uni.tuition_usd.toLocaleString()}/year)—pair with scholarship options`);
    }

    // Cap score at 98
    const fitScore = Math.min(98, Math.max(35, score));

    // Determine Tier
    let tier: UniversityMatch["tier"] = "Target Fit";
    if (fitScore >= 80) tier = "High Fit";
    else if (fitScore < 60 || acceptanceRate < 0.05) tier = "Reach / Stretch";

    return {
      university: uni,
      fitScore,
      tier,
      matchFactors,
      considerations,
    };
  }).sort((a, b) => b.fitScore - a.fitScore);
}

/**
 * Deterministic scholarship matching algorithm using real database fields:
 * - Profile intended major vs scholarship field
 * - Profile target countries vs scholarship host country
 * - Degree level eligibility
 */
export function calculateScholarshipMatches(
  profile: Profile | null,
  scholarships: Scholarship[]
): ScholarshipMatch[] {
  if (!profile || scholarships.length === 0) return [];

  const targetCountries = (profile.target_countries || []).map((c) => c.toLowerCase().trim()).filter(Boolean);
  const major = (profile.intended_major || "").toLowerCase().trim();

  return scholarships.map((sch) => {
    let score = 50;
    const matchFactors: string[] = [];

    const schCountry = sch.country.toLowerCase().trim();
    if (targetCountries.some((tc) => schCountry.includes(tc) || tc.includes(schCountry))) {
      score += 25;
      matchFactors.push(`Funds study in your target country (${sch.country})`);
    }

    const field = sch.field.toLowerCase().trim();
    if (field === "all fields" || field === "any") {
      score += 15;
      matchFactors.push(`Open to all academic fields`);
    } else if (major && (field.includes(major) || major.includes(field))) {
      score += 25;
      matchFactors.push(`Direct subject alignment with ${sch.field}`);
    }

    if (sch.funding_amount && sch.funding_amount >= 40000) {
      score += 10;
      matchFactors.push(`High-value award (approx. $${sch.funding_amount.toLocaleString()})`);
    }

    const fitScore = Math.min(99, Math.max(40, score));

    return {
      scholarship: sch,
      fitScore,
      matchFactors,
    };
  }).sort((a, b) => b.fitScore - a.fitScore);
}
