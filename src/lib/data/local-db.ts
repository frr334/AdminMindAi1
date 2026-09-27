import { SAMPLE_SCHOLARSHIPS, SAMPLE_UNIVERSITIES } from "@/lib/data/catalog";
import type { ID } from "@/lib/types";

export function getUniversity(id: ID) {
  return SAMPLE_UNIVERSITIES.find((u) => u.id === id);
}

export function getScholarship(id: ID) {
  return SAMPLE_SCHOLARSHIPS.find((s) => s.id === id);
}

export { SAMPLE_UNIVERSITIES, SAMPLE_SCHOLARSHIPS };