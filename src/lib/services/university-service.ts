import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { University, UniversityFilterOptions } from "@/lib/types";

// Curated 25 universities fallback in case DB table is being seeded
export const CURATED_UNIVERSITIES: University[] = [
  {
    id: "11111111-1111-4000-8000-000000000001",
    name: "Harvard University",
    country: "United States",
    city: "Cambridge",
    ranking: 1,
    acceptance_rate: 0.034,
    tuition_usd: 57200,
    website: "https://www.harvard.edu",
    description: "Historic Ivy League research university world-renowned for law, medicine, business, government, and liberal arts.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000002",
    name: "University of Oxford",
    country: "United Kingdom",
    city: "Oxford",
    ranking: 2,
    acceptance_rate: 0.145,
    tuition_usd: 38500,
    website: "https://www.ox.ac.uk",
    description: "Oldest university in the English-speaking world, featuring a collegiate system with intensive tutorial-based instruction.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000003",
    name: "Stanford University",
    country: "United States",
    city: "Stanford",
    ranking: 3,
    acceptance_rate: 0.039,
    tuition_usd: 58700,
    website: "https://www.stanford.edu",
    description: "Premier research powerhouse in Silicon Valley known for innovation, entrepreneurship, engineering, and interdisciplinary study.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000004",
    name: "Massachusetts Institute of Technology",
    country: "United States",
    city: "Cambridge",
    ranking: 4,
    acceptance_rate: 0.040,
    tuition_usd: 59750,
    website: "https://www.mit.edu",
    description: "Global benchmark for science, artificial intelligence, robotics, economics, and architectural innovation.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000005",
    name: "University of Cambridge",
    country: "United Kingdom",
    city: "Cambridge",
    ranking: 5,
    acceptance_rate: 0.160,
    tuition_usd: 37000,
    website: "https://www.cam.ac.uk",
    description: "Distinguished institution producing transformative discoveries in mathematics, physics, computing, and literature.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000006",
    name: "Imperial College London",
    country: "United Kingdom",
    city: "London",
    ranking: 6,
    acceptance_rate: 0.115,
    tuition_usd: 41000,
    website: "https://www.imperial.ac.uk",
    description: "World-leading STEM and business university situated in London with exceptional biomedical and tech research.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000007",
    name: "ETH Zurich",
    country: "Switzerland",
    city: "Zurich",
    ranking: 7,
    acceptance_rate: 0.270,
    tuition_usd: 1600,
    website: "https://ethz.ch",
    description: "Continental Europe's premier science and technology university offering world-class engineering at affordable public tuition.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000008",
    name: "University of Toronto",
    country: "Canada",
    city: "Toronto",
    ranking: 8,
    acceptance_rate: 0.430,
    tuition_usd: 44000,
    website: "https://www.utoronto.ca",
    description: "Canada's flagship university acclaimed for machine learning, medical advances, humanities, and international student diversity.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000009",
    name: "National University of Singapore",
    country: "Singapore",
    city: "Singapore",
    ranking: 9,
    acceptance_rate: 0.070,
    tuition_usd: 22000,
    website: "https://www.nus.edu.sg",
    description: "Asia's top-ranked comprehensive university known for computing, biomedical research, Asian studies, and global exchange.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000010",
    name: "University of Melbourne",
    country: "Australia",
    city: "Melbourne",
    ranking: 10,
    acceptance_rate: 0.700,
    tuition_usd: 32000,
    website: "https://www.unimelb.edu.au",
    description: "Australia's highest-ranked institution pioneering the Melbourne Model with broad undergraduate studies and specialist graduate degrees.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000011",
    name: "Princeton University",
    country: "United States",
    city: "Princeton",
    ranking: 11,
    acceptance_rate: 0.044,
    tuition_usd: 59700,
    website: "https://www.princeton.edu",
    description: "Distinguished Ivy League university renowned for profound undergraduate focus, senior theses, and generous need-based aid.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000012",
    name: "Yale University",
    country: "United States",
    city: "New Haven",
    ranking: 12,
    acceptance_rate: 0.046,
    tuition_usd: 62250,
    website: "https://www.yale.edu",
    description: "Ivy League institution distinguished by residential college communities, drama, law, arts, and environmental science.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000013",
    name: "California Institute of Technology",
    country: "United States",
    city: "Pasadena",
    ranking: 13,
    acceptance_rate: 0.030,
    tuition_usd: 60800,
    website: "https://www.caltech.edu",
    description: "Ultra-selective STEM institution operating NASA JPL and maintaining an extraordinary Nobel laureate per capita ratio.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000014",
    name: "Columbia University",
    country: "United States",
    city: "New York",
    ranking: 14,
    acceptance_rate: 0.039,
    tuition_usd: 65500,
    website: "https://www.columbia.edu",
    description: "New York City Ivy League leader famous for its Core Curriculum, international relations, journalism, and finance connections.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000015",
    name: "University College London",
    country: "United Kingdom",
    city: "London",
    ranking: 15,
    acceptance_rate: 0.120,
    tuition_usd: 34000,
    website: "https://www.ucl.ac.uk",
    description: "London's global research university known for neuroscience, architecture, education, economics, and law.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000016",
    name: "University of Edinburgh",
    country: "United Kingdom",
    city: "Edinburgh",
    ranking: 16,
    acceptance_rate: 0.350,
    tuition_usd: 30500,
    website: "https://www.ed.ac.uk",
    description: "Ancient Scottish university steeped in Enlightenment history, pioneering artificial intelligence and clinical sciences.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000017",
    name: "University of Tokyo",
    country: "Japan",
    city: "Tokyo",
    ranking: 17,
    acceptance_rate: 0.340,
    tuition_usd: 5200,
    website: "https://www.u-tokyo.ac.jp",
    description: "Japan's foremost national university with elite programs in physics, engineering, policy, and East Asian civilization.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000018",
    name: "Tsinghua University",
    country: "China",
    city: "Beijing",
    ranking: 18,
    acceptance_rate: 0.020,
    tuition_usd: 4800,
    website: "https://www.tsinghua.edu.cn",
    description: "China's top engineering and computer science university, cultivating future leaders in global technology and public policy.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000019",
    name: "McGill University",
    country: "Canada",
    city: "Montreal",
    ranking: 19,
    acceptance_rate: 0.390,
    tuition_usd: 24000,
    website: "https://www.mcgill.ca",
    description: "Renowned bilingual-city Canadian institution celebrated for medicine, neuroscience, music, and international culture.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000020",
    name: "Technical University of Munich",
    country: "Germany",
    city: "Munich",
    ranking: 20,
    acceptance_rate: 0.250,
    tuition_usd: 2000,
    website: "https://www.tum.de",
    description: "Germany's leading University of Excellence at the center of Europe's mobility, automotive, and tech startup ecosystem.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000021",
    name: "Australian National University",
    country: "Australia",
    city: "Canberra",
    ranking: 21,
    acceptance_rate: 0.350,
    tuition_usd: 33500,
    website: "https://www.anu.edu.au",
    description: "Australia's national university located in Canberra, recognized for national policy, climate science, and astronomy.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000022",
    name: "Seoul National University",
    country: "South Korea",
    city: "Seoul",
    ranking: 22,
    acceptance_rate: 0.140,
    tuition_usd: 6500,
    website: "https://en.snu.ac.kr",
    description: "South Korea's undisputed academic flagship with world-leading electronics, semiconductor research, and medicine.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000023",
    name: "EPFL",
    country: "Switzerland",
    city: "Lausanne",
    ranking: 23,
    acceptance_rate: 0.280,
    tuition_usd: 1600,
    website: "https://www.epfl.ch",
    description: "Dynamic Swiss polytechnic overlooking Lake Geneva with leading labs in robotics, neuroprosthetics, and clean energy.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000024",
    name: "University of British Columbia",
    country: "Canada",
    city: "Vancouver",
    ranking: 24,
    acceptance_rate: 0.520,
    tuition_usd: 39000,
    website: "https://www.ubc.ca",
    description: "Pacific Rim research center situated on a stunning coastal campus, renowned for forestry, sustainability, and software engineering.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4000-8000-000000000025",
    name: "King's College London",
    country: "United Kingdom",
    city: "London",
    ranking: 25,
    acceptance_rate: 0.130,
    tuition_usd: 31000,
    website: "https://www.kcl.ac.uk",
    description: "Central London powerhouse with historic contributions to DNA discovery, healthcare, international security, and jurisprudence.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export interface UniversitiesResponse {
  data: University[];
  total: number;
  page: number;
  limit: number;
  error?: string | null;
}

/**
 * Fetch universities from Supabase with search, filters, sorting, and pagination.
 */
export async function getUniversities(options: UniversityFilterOptions = {}): Promise<UniversitiesResponse> {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      let query = supabase.from("universities").select("*", { count: "exact" });

      if (options.search?.trim()) {
        const s = options.search.trim();
        query = query.or(`name.ilike.%${s}%,city.ilike.%${s}%,country.ilike.%${s}%`);
      }

      if (options.country && options.country !== "all") {
        query = query.eq("country", options.country);
      }

      if (options.city && options.city !== "all") {
        query = query.eq("city", options.city);
      }

      const sortBy = options.sortBy || "ranking";
      const ascending = options.sortOrder ? options.sortOrder === "asc" : sortBy === "name" || sortBy === "ranking";
      query = query.order(sortBy, { ascending, nullsFirst: false });

      query = query.range(from, to);

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        return {
          data: data as University[],
          total: count ?? data.length,
          page,
          limit,
          error: null,
        };
      }
    } catch {
      // Fall through to curated fallback if remote query failed
    }
  }

  // Graceful fallback to verified curated 25 universities if DB is being seeded or unreachable
  let list = [...CURATED_UNIVERSITIES];

  if (options.search?.trim()) {
    const s = options.search.toLowerCase().trim();
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        (u.city && u.city.toLowerCase().includes(s)) ||
        u.country.toLowerCase().includes(s)
    );
  }

  if (options.country && options.country !== "all") {
    list = list.filter((u) => u.country === options.country);
  }

  if (options.city && options.city !== "all") {
    list = list.filter((u) => u.city === options.city);
  }

  const sortBy = options.sortBy || "ranking";
  const ascending = options.sortOrder ? options.sortOrder === "asc" : sortBy === "name" || sortBy === "ranking";
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
 * Search universities with a quick string query.
 */
export async function searchUniversities(query: string): Promise<University[]> {
  const res = await getUniversities({ search: query, limit: 10 });
  return res.data;
}

/**
 * Get a single university by ID from Supabase.
 */
export async function getUniversityById(id: string): Promise<University | null> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("universities").select("*").eq("id", id).maybeSingle();
      if (!error && data) return data as University;
    } catch {
      // Fallback
    }
  }
  return CURATED_UNIVERSITIES.find((u) => u.id === id) || null;
}

/**
 * Get saved universities for a user.
 */
export async function getSavedUniversities(userId: string): Promise<University[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("saved_universities")
        .select("university_id, universities(*)")
        .eq("user_id", userId);

      if (!error && data) {
        return data
          .map((row) => (row as unknown as { universities: University }).universities)
          .filter(Boolean);
      }
    } catch {
      // Fallback
    }
  }

  // Local storage fallback for saved universities
  if (typeof window !== "undefined") {
    try {
      const savedIds: string[] = JSON.parse(localStorage.getItem(`admitmind.saved_unis.${userId}`) || "[]");
      return CURATED_UNIVERSITIES.filter((u) => savedIds.includes(u.id));
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Check if a university is saved by user.
 */
export async function isUniversitySaved(userId: string, universityId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { count, error } = await supabase
        .from("saved_universities")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("university_id", universityId);
      if (!error) return (count ?? 0) > 0;
    } catch {
      // Fallback
    }
  }

  if (typeof window !== "undefined") {
    try {
      const savedIds: string[] = JSON.parse(localStorage.getItem(`admitmind.saved_unis.${userId}`) || "[]");
      return savedIds.includes(universityId);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Save / bookmark a university for a user.
 */
export async function saveUniversity(userId: string, universityId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("saved_universities")
        .insert({ user_id: userId, university_id: universityId });
      if (error) {
        if (error.code === "23505") return { ok: true }; // already saved
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.saved_unis.${userId}`;
      const savedIds: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      if (!savedIds.includes(universityId)) {
        savedIds.push(universityId);
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
 * Remove saved / bookmark a university for a user.
 */
export async function removeSavedUniversity(
  userId: string,
  universityId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("saved_universities")
        .delete()
        .eq("user_id", userId)
        .eq("university_id", universityId);
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  if (typeof window !== "undefined") {
    try {
      const key = `admitmind.saved_unis.${userId}`;
      let savedIds: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      savedIds = savedIds.filter((id) => id !== universityId);
      localStorage.setItem(key, JSON.stringify(savedIds));
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: true };
}
