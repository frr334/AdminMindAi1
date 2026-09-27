export type ID = string;
export type ISODate = string;

export type DegreeLevel = "Bachelor" | "Master" | "PhD" | "Other";
export type ApplicationStatus =
  | "Planning"
  | "Researching"
  | "Preparing"
  | "Submitted"
  | "Interview"
  | "Accepted"
  | "Rejected"
  | "Withdrawn";

export type PriorityLevel = 1 | 2 | 3; // 1: High, 2: Medium, 3: Low

export type RecommendationStatus =
  | "not_requested"
  | "requested"
  | "accepted"
  | "submitted"
  | "follow_up_needed";

export type ScholarshipTrackStatus =
  | "saved"
  | "preparing"
  | "submitted"
  | "awarded"
  | "not_awarded";

export type DeadlineKind =
  | "university"
  | "scholarship"
  | "test"
  | "recommendation"
  | "personal";

export interface Session {
  userId: ID;
  email: string;
  createdAt: ISODate;
  expiresAt: ISODate;
}

export interface UserRecord {
  id: ID;
  email: string;
  createdAt: ISODate;
}

/**
 * public.profiles schema
 */
export interface Profile {
  id: ID;
  full_name: string | null;
  email: string | null;
  country: string | null;
  graduation_year: number | null;
  intended_major: string | null;
  target_countries: string[] | null;
  subscription_plan: string | null;
  onboarding_completed: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

/**
 * public.universities schema
 */
export interface University {
  id: ID;
  name: string;
  country: string;
  city: string | null;
  ranking: number | null;
  acceptance_rate: number | null;
  tuition_usd: number | null;
  website: string | null;
  description: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

/**
 * public.saved_universities schema
 */
export interface SavedUniversity {
  id: ID;
  user_id: ID;
  university_id: ID;
  created_at: ISODate;
  university?: University;
}

/**
 * public.scholarships schema
 */
export interface Scholarship {
  id: ID;
  name: string;
  country: string;
  university: string | null;
  field: string;
  degree_level: string;
  eligibility: string;
  deadline: ISODate | null;
  funding_amount: number | null;
  description: string;
  official_url: string | null;
  source_url: string | null;
  source_name: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

/**
 * public.saved_scholarships schema
 */
export interface SavedScholarship {
  id: ID;
  user_id: ID;
  scholarship_id: ID;
  status: string | null;
  created_at: ISODate;
  scholarship?: Scholarship;
}

/**
 * public.applications schema
 */
export interface Application {
  id: ID;
  user_id: ID;
  university_name: string | null;
  country: string | null;
  degree_type: string | null;
  application_deadline: string | null;
  application_status: string;
  notes: string | null;
  priority_level: number | null;
  deadline: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
  tasks?: ApplicationTask[];
}

/**
 * public.application_tasks schema
 */
export interface ApplicationTask {
  id: ID;
  application_id: ID;
  title: string;
  completed: boolean;
  due_date: string | null;
  created_at: ISODate;
}

/**
 * public.deadlines schema
 */
export interface DeadlineItem {
  id: ID;
  user_id: ID;
  title: string;
  kind: string;
  due_at: ISODate;
  notes: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

/**
 * public.essay_reviews schema
 */
export interface EssayReview {
  id: ID;
  user_id: ID;
  title: string | null;
  essay_text: string | null;
  ai_feedback: string | null;
  overall_score: number | null;
  created_at: ISODate;
  updated_at: ISODate;
}

/**
 * public.flashcards schema
 */
export interface Flashcard {
  id: ID;
  user_id: ID;
  question: string;
  answer: string;
  subject: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

/**
 * public.recommendations schema
 */
export interface Recommendation {
  id: ID;
  user_id: ID;
  recommender_name: string;
  institution: string | null;
  email: string | null;
  requested_at: ISODate | null;
  deadline: ISODate | null;
  status: string;
  notes: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

/**
 * Interview coaching structures
 */
export interface InterviewSession {
  id: ID;
  userId: ID;
  universityName: string;
  program: string;
  startedAt: ISODate;
  completedAt?: ISODate | null;
  questions: {
    id: ID;
    prompt: string;
    answer: string;
    feedback?: InterviewFeedback | null;
  }[];
}

export interface InterviewFeedback {
  source: "local_heuristic" | "ai_api";
  clarity: string;
  structure: string;
  relevance: string;
  specificity: string;
  confidence: string;
}

/**
 * User Settings representation
 */
export interface UserSettings {
  userId: ID;
  notificationsEnabled: boolean;
  deadlineReminders: boolean;
  streakReminders: boolean;
  appearance: "system" | "light" | "dark";
  aiTone: "concise" | "detailed" | "socratic";
  shareAnalytics: boolean;
  updatedAt: ISODate;
}

/**
 * University filter and search options
 */
export interface UniversityFilterOptions {
  search?: string;
  country?: string;
  city?: string;
  sortBy?: "ranking" | "tuition_usd" | "acceptance_rate" | "name";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Scholarship filter and search options
 */
export interface ScholarshipFilterOptions {
  search?: string;
  country?: string;
  field?: string;
  degreeLevel?: string;
  sortBy?: "deadline" | "funding_amount" | "name";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
