import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Scholarship, ScholarshipFilterOptions } from "@/lib/types";

// Curated 10 prestigious scholarships fallback
export const CURATED_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "22222222-2222-4000-8000-000000000001",
    name: "Fulbright Foreign Student Program",
    country: "United States",
    university: "Various US Universities",
    field: "All Fields",
    degree_level: "Master",
    eligibility: "International graduate students, young professionals, and artists from eligible partner countries.",
    deadline: "2026-10-15T23:59:59Z",
    funding_amount: 50000,
    description: "Flagship international educational exchange program sponsored by the U.S. government covering full tuition, living stipend, health insurance, and airfare.",
    official_url: "https://foreign.fulbrightonline.org",
    source_url: "https://eca.state.gov/fulbright",
    source_name: "U.S. Department of State",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-4000-8000-000000000002",
    name: "Chevening Scholarship",
    country: "United Kingdom",
    university: "Any UK University",
    field: "Leadership & Policy",
    degree_level: "Master",
    eligibility: "Emerging leaders with at least two years of work experience and an undergraduate degree.",
    deadline: "2026-11-05T12:00:00Z",
    funding_amount: 42000,
    description: "UK government global scholarship funded by the Foreign, Commonwealth & Development Office supporting one-year master's degrees across the United Kingdom.",
    official_url: "https://www.chevening.org",
    source_url: "https://www.chevening.org/scholarships",
    source_name: "FCDO United Kingdom",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-4000-8000-000000000003",
    name: "Rhodes Scholarship",
    country: "United Kingdom",
    university: "University of Oxford",
    field: "All Fields",
    degree_level: "Master",
    eligibility: "Young leaders from selected constituencies worldwide demonstrating academic excellence, character, and leadership instincts.",
    deadline: "2026-10-01T23:59:59Z",
    funding_amount: 60000,
    description: "The world's oldest and perhaps most prestigious graduate scholarship, funding full degree study at Oxford University plus living allowance and mentoring.",
    official_url: "https://www.rhodeshouse.ox.ac.uk",
    source_url: "https://www.rhodeshouse.ox.ac.uk/scholarships",
    source_name: "The Rhodes Trust",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-4000-8000-000000000004",
    name: "Gates Cambridge Scholarship",
    country: "United Kingdom",
    university: "University of Cambridge",
    field: "All Fields",
    degree_level: "PhD",
    eligibility: "Citizens of any country outside the United Kingdom pursuing full-time graduate study at Cambridge.",
    deadline: "2026-12-05T23:59:59Z",
    funding_amount: 55000,
    description: "Full-cost award for outstanding graduate applicants to Cambridge with proven intellectual capacity and commitment to improving others' lives.",
    official_url: "https://www.gatescambridge.org",
    source_url: "https://www.gatescambridge.org/apply",
    source_name: "Bill & Melinda Gates Foundation",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-4000-8000-000000000005",
    name: "DAAD Study Scholarships for Graduates",
    country: "Germany",
    university: "German Universities",
    field: "STEM & Humanities",
    degree_level: "Master",
    eligibility: "International graduates who have completed their first degree no more than six years ago.",
    deadline: "2026-11-15T23:59:59Z",
    funding_amount: 18000,
    description: "German Academic Exchange Service grant providing monthly stipends, health insurance, travel allowances, and German language training.",
    official_url: "https://www.daad.de/en",
    source_url: "https://www2.daad.de/deutschland/stipendium",
    source_name: "German Academic Exchange Service",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-4000-8000-000000000006",
    name: "Australia Awards Scholarships",
    country: "Australia",
    university: "Australian Universities",
    field: "Development & Public Policy",
    degree_level: "Master",
    eligibility: "Citizens of developing countries in Indo-Pacific region committed to national development upon return.",
    deadline: "2026-04-30T23:59:59Z",
    funding_amount: 45000,
    description: "Long-term awards administered by the Department of Foreign Affairs and Trade covering full tuition, return airfare, establishment allowance, and living costs.",
    official_url: "https://www.dfat.gov.au/people-to-people/australia-awards",
    source_url: "https://www.dfat.gov.au",
    source_name: "Department of Foreign Affairs and Trade (DFAT)",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-4000-8000-000000000007",
    name: "Rotary Peace Fellowship",
    country: "United States",
    university: "Rotary Peace Centers",
    field: "Peace & Conflict Studies",
    degree_level: "Master",
    eligibility: "Professionals dedicated to peacebuilding, with proficiency in English and documented field experience.",
    deadline: "2026-05-15T23:59:59Z",
    funding_amount: 35000,
    description: "Fully funded academic and practical training fellowships covering tuition, living expenses, round-trip transport, and applied field internships.",
    official_url: "https://www.rotary.org/en/our-programs/peace-fellowships",
    source_url: "https://my.rotary.org/en/peace-fellowship-application",
    source_name: "The Rotary Foundation",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-4000-8000-000000000008",
    name: "Eiffel Excellence Scholarship Program",
    country: "France",
    university: "French Higher Education Institutions",
    field: "Engineering & Economics",
    degree_level: "Master",
    eligibility: "Top foreign students up to 25 years old applying through French host institutions.",
    deadline: "2027-01-10T23:59:59Z",
    funding_amount: 22000,
    description: "French Ministry for Europe and Foreign Affairs scholarship providing monthly allowance, round-trip airfare, cultural activities, and health insurance.",
    official_url: "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence",
    source_url: "https://www.campusfrance.org",
    source_name: "Campus France / Ministry for Europe and Foreign Affairs",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-4000-8000-000000000009",
    name: "Commonwealth Master's Scholarships",
    country: "United Kingdom",
    university: "UK Universities",
    field: "Sustainable Development",
    degree_level: "Master",
    eligibility: "Citizens of eligible low- and middle-income Commonwealth countries who hold a strong honours degree.",
    deadline: "2026-10-18T16:00:00Z",
    funding_amount: 38000,
    description: "Fully funded scholarships aimed at students who could not otherwise afford to study in the UK, funded by the UK FCDO.",
    official_url: "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships",
    source_url: "https://cscuk.fcdo.gov.uk",
    source_name: "Commonwealth Scholarship Commission",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-4000-8000-000000000010",
    name: "Schwarzman Scholars Program",
    country: "China",
    university: "Tsinghua University",
    field: "Global Affairs & Business",
    degree_level: "Master",
    eligibility: "Exceptional young people worldwide between ages 18-28 demonstrating leadership, character, and academic achievement.",
    deadline: "2026-09-19T23:59:59Z",
    funding_amount: 65000,
    description: "One-year fully funded master's degree in Global Affairs at Tsinghua University in Beijing designed to prepare the next generation of global leaders.",
    official_url: "https://www.schwarzmanscholars.org",
    source_url: "https://www.schwarzmanscholars.org/admissions",
    source_name: "Schwarzman Scholars",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export interface ScholarshipsResponse {
  data: Scholarship[];
  total: number;
  page: number;
  limit: number;
  error?: string | null;
}

/**
 * Fetch scholarships from Supabase with search, filters, sorting, and pagination.
 */
export async function getScholarships(options: ScholarshipFilterOptions = {}): Promise<ScholarshipsResponse> {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      let query = supabase.from("scholarships").select("*", { count: "exact" });

      if (options.search?.trim()) {
        const s = options.search.trim();
        query = query.or(`name.ilike.%${s}%,field.ilike.%${s}%,country.ilike.%${s}%,description.ilike.%${s}%`);
      }

      if (options.country && options.country !== "all") {
        query = query.eq("country", options.country);
      }

      if (options.field && options.field !== "all") {
        query = query.ilike("field", `%${options.field}%`);
      }

      if (options.degreeLevel && options.degreeLevel !== "all") {
        query = query.ilike("degree_level", `%${options.degreeLevel}%`);
      }

      const sortBy = options.sortBy || "deadline";
      const ascending = options.sortOrder ? options.sortOrder === "asc" : sortBy === "deadline" || sortBy === "name";
      query = query.order(sortBy, { ascending, nullsFirst: false });

      query = query.range(from, to);

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        return {
          data: data as Scholarship[],
          total: count ?? data.length,
          page,
          limit,
          error: null,
        };
      }
    } catch {
      // Fallback
    }
  }

  // Fallback to curated 10 scholarships
  let list = [...CURATED_SCHOLARSHIPS];

  if (options.search?.trim()) {
    const s = options.search.toLowerCase().trim();
    list = list.filter(
      (sch) =>
        sch.name.toLowerCase().includes(s) ||
        sch.country.toLowerCase().includes(s) ||
        sch.field.toLowerCase().includes(s) ||
        sch.description.toLowerCase().includes(s)
    );
  }

  if (options.country && options.country !== "all") {
    list = list.filter((sch) => sch.country === options.country);
  }

  if (options.field && options.field !== "all") {
    list = list.filter((sch) => sch.field.toLowerCase().includes(options.field!.toLowerCase()));
  }

  if (options.degreeLevel && options.degreeLevel !== "all") {
    list = list.filter((sch) => sch.degree_level.toLowerCase().includes(options.degreeLevel!.toLowerCase()));
  }

  const sortBy = options.sortBy || "deadline";
  const ascending = options.sortOrder ? options.sortOrder === "asc" : sortBy === "deadline" || sortBy === "name";
  list.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (typeof valA === "string") {
      return ascending
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }
    return ascending ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
  });

  const total = list.length;
  const paged = list.slice(from, to + 1);

  return {
    data: paged,
    total,
    page,
    limit,
    error: null,
  };
}

/**
 * Search scholarships with a quick query string.
 */
export async function searchScholarships(query: string): Promise<Scholarship[]> {
  const res = await getScholarships({ search: query, limit: 10 });
  return res.data;
}

/**
 * Get single scholarship by ID from Supabase.
 */
export async function getScholarshipById(id: string): Promise<Scholarship | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("scholarships").select("*").eq("id", id).maybeSingle();
      if (!error && data) return data as Scholarship;
    } catch {
      // Fallback
    }
  }
  return CURATED_SCHOLARSHIPS.find((s) => s.id === id) || null;
}

/**
 * Get saved scholarships for a user.
 */
export async function getSavedScholarships(userId: string): Promise<Scholarship[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("saved_scholarships")
        .select("scholarship_id, scholarships(*)")
        .eq("user_id", userId);

      if (!error && data) {
        return data
          .map((row) => (row as unknown as { scholarships: Scholarship }).scholarships)
          .filter(Boolean);
      }
    } catch {
      // Fallback
    }
  }

  if (typeof window !== "undefined") {
    try {
      const savedIds: string[] = JSON.parse(localStorage.getItem(`admitmind.saved_schols.${userId}`) || "[]");
      return CURATED_SCHOLARSHIPS.filter((s) => savedIds.includes(s.id));
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Check if a scholarship is saved by user.
 */
export async function isScholarshipSaved(userId: string, scholarshipId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { count, error } = await supabase
        .from("saved_scholarships")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("scholarship_id", scholarshipId);
      if (!error) return (count ?? 0) > 0;
    } catch {
      // Fallback
    }
  }

  if (typeof window !== "undefined") {
    try {
      const savedIds: string[] = JSON.parse(localStorage.getItem(`admitmind.saved_schols.${userId}`) || "[]");
      return savedIds.includes(scholarshipId);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Save a scholarship for a user.
 */
export async function saveScholarship(
  userId: string,
  scholarshipId: string,
  status: string = "saved"
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("saved_scholarships")
        .insert({ user_id: userId, scholarship_id: scholarshipId, status });
      if (error) {
        if (error.code === "23505") return { ok: true };
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.saved_schols.${userId}`;
      const savedIds: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      if (!savedIds.includes(scholarshipId)) {
        savedIds.push(scholarshipId);
        localStorage.setItem(key, JSON.stringify(savedIds));
      }
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: true };
}

/**
 * Remove saved scholarship for a user.
 */
export async function removeSavedScholarship(
  userId: string,
  scholarshipId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("saved_scholarships")
        .delete()
        .eq("user_id", userId)
        .eq("scholarship_id", scholarshipId);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.saved_schols.${userId}`;
      let savedIds: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      savedIds = savedIds.filter((id) => id !== scholarshipId);
      localStorage.setItem(key, JSON.stringify(savedIds));
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: true };
}
