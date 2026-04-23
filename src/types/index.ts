export type DayStatus = 'WIN' | 'LOSE' | 'PARTIAL' | 'EMPTY';

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  studyHours: number;
  moodBefore: string;
  moodAfter: string;
  notes: string;
  targetText: string;
  targetCompleted: boolean;
  habits: Record<string, boolean>; // habitId -> completed
  status: DayStatus;
}

export interface Subject {
  id: string;
  name: string;
}

export type ChapterStatus = 'Not Started' | 'In Progress' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High';

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  status: ChapterStatus;
  priority: Priority;
  remarks: string;
  lectureDone: boolean;
  notesDone: boolean;
  questionsDone: boolean;
  testDone: boolean;
  rev1Done: boolean;
  rev2Done: boolean;
  rev3Done: boolean;
  awardedBonusDate?: string; // YYYY-MM-DD for scoring
}

export interface Habit {
  id: string;
  name: string;
}

export interface AppSettings {
  minStudyHours: number;
  subtitle: string;
  enableScoreFeedback: boolean;
  reducedMotion: boolean;
}

export interface Letter {
  id: string;
  text: string;
  type: 'future' | 'reality' | 'support';
  createdAt: number;
}

export type ErrorType = 'Conceptual' | 'Formula' | 'Careless' | 'Memory' | 'Interpretation';
export type ErrorSeverity = 'Low' | 'Medium' | 'High';
export type ErrorStatus = 'Unresolved' | 'Resolved';

export interface StudyError {
  id: string;
  subjectId: string;
  chapterId: string;
  topic?: string;
  title: string;
  whatWentWrong: string;
  whyItHappened: string;
  correction: string;
  status: ErrorStatus;
  errorType: ErrorType;
  severity: ErrorSeverity;
  reviewCount: number;
  isRepeated: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppData {
  settings: AppSettings;
  entries: Record<string, DailyEntry>;
  subjects: Subject[];
  chapters: Chapter[];
  habits: Habit[];
  studyErrors: StudyError[];
}
