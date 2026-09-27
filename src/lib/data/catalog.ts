import type { Scholarship, University } from "@/lib/types";

/**
 * SAMPLE/DEMO DATA ONLY.
 * These are fictional university and scholarship records for UI development and testing.
 * They do NOT represent real institutions or awards.
 * Production data should come from Supabase: universities and scholarships tables.
 */

export const SAMPLE_UNIVERSITIES: University[] = [
  {
    id: "demo_uni_harborview",
    name: "Harborview Collegiate Institute (Sample)",
    country: "United Kingdom",
    city: "Brighton",
    ranking: 150,
    acceptance_rate: 0.25,
    tuition_usd: 25000,
    website: "https://example.edu",
    description: "This is a fictional university for demonstration purposes only.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo_uni_northridge",
    name: "Northridge School of Science (Sample)",
    country: "United States",
    city: "Denver",
    ranking: 75,
    acceptance_rate: 0.35,
    tuition_usd: 45000,
    website: "https://example.edu",
    description: "Fictional STEM-focused university for testing.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SAMPLE_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "demo_sch_horizon",
    name: "Horizon Merit Award (Sample)",
    country: "United Kingdom",
    university: "Harborview Collegiate Institute",
    field: "Any",
    degree_level: "Bachelor",
    eligibility: "Fictional merit scholarship for demonstration.",
    deadline: "2026-12-01T00:00:00Z",
    funding_amount: 8000,
    description: "This is a sample scholarship record for testing only. Not a real award.",
    official_url: "https://example.edu",
    source_url: null,
    source_name: "Demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo_sch_stem",
    name: "Northridge STEM Access Grant (Sample)",
    country: "United States",
    university: "Northridge School of Science",
    field: "STEM",
    degree_level: "Bachelor",
    eligibility: "Fictional STEM scholarship for demonstration.",
    deadline: "2026-01-02T00:00:00Z",
    funding_amount: 12000,
    description: "Sample scholarship record for UI testing only.",
    official_url: "https://example.edu",
    source_url: null,
    source_name: "Demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
