
// Compatibility types for legacy study-only screens. These are local-only models.
export type EducationLevel = "high_school" | "foundation" | "undergraduate" | "masters" | "phd" | "other";
export type UniversitySize = "small" | "medium" | "large" | "no_preference";
export type ThemePreference = "system" | "light" | "dark";
export interface StudyPlan { id: ID; userId: ID; subject: string; tasks: { id: ID; title: string; minutes: number; done: boolean }[]; createdAt: ISODate }
export interface QuizQuestion { id: ID; prompt: string; options: string[]; answer: string; topic: string }
export interface Quiz { id: ID; userId: ID; title: string; subject: string; questions: QuizQuestion[] }
export interface QuizAttempt { id: ID; userId: ID; quizId: ID; score: number; createdAt: ISODate }
export interface Deck { id: ID; userId: ID; name: string; subject: string }
export interface Exam { id: ID; userId: ID; name: string; subject?: string; examDate?: string; notes?: string }
export interface Palace { id: ID; userId: ID; name: string; description?: string; createdAt: ISODate }
export interface PalaceLocation { id: ID; palaceId: ID; name: string; concept: string; order: number }
export interface StudySession { id: ID; userId: ID; date: string; minutes: number; subject: string; source: string }
export interface Achievement { id: ID; title: string; description?: string; earnedAt?: ISODate }
export interface Conversation { id: ID; userId: ID; title: string; subject: string; difficulty: string }
export interface Message { id: ID; conversationId: ID; role: "user" | "assistant"; content: string; createdAt: ISODate }
export type TutorSubject = string;
export interface AppDatabase { [key: string]: unknown }
