import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { AppData, DailyEntry, Subject, Chapter, Habit, Mistake, AppSettings, DayStatus } from '../types';
import { getTodayString } from '../lib/utils';
import { computeAllScores, ScoreBreakdown } from '../lib/disciplineScore';

const DEFAULT_SUBJECTS: Subject[] = [
 { id: '1', name: 'Physics' },
 { id: '2', name: 'Chemistry' },
 { id: '3', name: 'Biology' },
 { id: '4', name: 'Other' },
];

const DEFAULT_HABITS: Habit[] = [
 { id: 'h1', name: 'Study 5 hours' },
 { id: 'h2', name: 'Revision' },
 { id: 'h3', name: 'Questions practice' },
 { id: 'h4', name: 'No procrastination' },
 { id: 'h5', name: 'Sleep discipline' },
 { id: 'h6', name: 'Wake discipline' },
];

const DEFAULT_SETTINGS: AppSettings = {
 minStudyHours: 5,
 subtitle: 'Show up. No matter what.',
 enableScoreFeedback: true,
 reducedMotion: false,
};

const DEFAULT_DATA: AppData = {
 settings: DEFAULT_SETTINGS,
 entries: {},
 subjects: DEFAULT_SUBJECTS,
 chapters: [],
 habits: DEFAULT_HABITS,
 mistakes: [],
};

interface AppContextType {
 data: AppData;
 updateSettings: (settings: Partial<AppSettings>) => void;
 saveEntry: (entry: DailyEntry) => void;
 addSubject: (subject: Subject) => void;
 updateSubject: (subject: Subject) => void;
 deleteSubject: (id: string) => void;
 addChapter: (chapter: Chapter) => void;
 updateChapter: (chapter: Chapter) => void;
 deleteChapter: (id: string) => void;
 addHabit: (habit: Habit) => void;
 updateHabit: (habit: Habit) => void;
 deleteHabit: (id: string) => void;
 addMistake: (mistake: Mistake) => void;
 updateMistake: (mistake: Mistake) => void;
 deleteMistake: (id: string) => void;
 resetData: () => void;
 importData: (data: AppData) => void;
 calculateDayStatus: (entry: Partial<DailyEntry>) => DayStatus;
 scoreData: {
 totalXP: number;
 dateScores: Record<string, ScoreBreakdown>;
 };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [data, setData] = useState<AppData>(() => {
 try {
 const stored = localStorage.getItem('dear_s_data');
 if (stored) {
 return JSON.parse(stored);
 }
 } catch (e) {
 console.error('Error loading data', e);
 }
 return DEFAULT_DATA;
 });

 useEffect(() => {
 localStorage.setItem('dear_s_data', JSON.stringify(data));
 }, [data]);

 const scoreData = useMemo(() => {
 return computeAllScores(data.entries, data.chapters, data.habits);
 }, [data.entries, data.chapters, data.habits]);

 const updateSettings = (settings: Partial<AppSettings>) => {
 setData((prev) => ({ ...prev, settings: { ...prev.settings, ...settings } }));
 };

 const calculateDayStatus = (entry: Partial<DailyEntry>): DayStatus => {
 if (!entry.studyHours && Object.values(entry.habits || {}).every(v => !v)) return 'EMPTY';
 
 // Win logic: met min hours + target completed + at least 2 habits
 const hours = entry.studyHours || 0;
 const targetDone = entry.targetCompleted || false;
 const habitsCompleted = Object.values(entry.habits || {}).filter(Boolean).length;
 
 if (hours >= data.settings.minStudyHours && targetDone && habitsCompleted >= 2) {
 return 'WIN';
 }
 
 if (hours > 0 || habitsCompleted > 0) {
 return 'PARTIAL';
 }
 
 return 'LOSE';
 };

 const saveEntry = (entry: DailyEntry) => {
 setData((prev) => ({
 ...prev,
 entries: { ...prev.entries, [entry.date]: entry },
 }));
 };

 const addSubject = (subject: Subject) => {
 setData((prev) => ({ ...prev, subjects: [...prev.subjects, subject] }));
 };

 const updateSubject = (subject: Subject) => {
 setData((prev) => ({
 ...prev,
 subjects: prev.subjects.map((s) => (s.id === subject.id ? subject : s)),
 }));
 };

 const deleteSubject = (id: string) => {
 setData((prev) => ({
 ...prev,
 subjects: prev.subjects.filter((s) => s.id !== id),
 chapters: prev.chapters.filter((c) => c.subjectId !== id),
 }));
 };

 const addChapter = (chapter: Chapter) => {
 setData((prev) => ({ ...prev, chapters: [...prev.chapters, chapter] }));
 };

 const updateChapter = (chapter: Chapter) => {
 // auto-mark completion logic
 let newStatus = chapter.status;
 const allDone = chapter.lectureDone && chapter.notesDone && chapter.questionsDone;
 if (allDone && newStatus !== 'Completed') {
 newStatus = 'Completed';
 }
 
 let finalChapter = { ...chapter, status: newStatus };
 
 // Give bonus points immediately upon completion today
 if (finalChapter.status === 'Completed' && !finalChapter.awardedBonusDate) {
 finalChapter.awardedBonusDate = getTodayString();
 }

 setData((prev) => ({
 ...prev,
 chapters: prev.chapters.map((c) => (c.id === finalChapter.id ? finalChapter : c)),
 }));
 };

 const deleteChapter = (id: string) => {
 setData((prev) => ({
 ...prev,
 chapters: prev.chapters.filter((c) => c.id !== id),
 }));
 };

 const addHabit = (habit: Habit) => {
 setData((prev) => ({ ...prev, habits: [...prev.habits, habit] }));
 };

 const updateHabit = (habit: Habit) => {
 setData((prev) => ({
 ...prev,
 habits: prev.habits.map((h) => (h.id === habit.id ? habit : h)),
 }));
 };

 const deleteHabit = (id: string) => {
 setData((prev) => {
 const newEntries = { ...prev.entries };
 Object.keys(newEntries).forEach(date => {
 const entry = newEntries[date];
 if (entry.habits && entry.habits[id] !== undefined) {
 const newHabits = { ...entry.habits };
 delete newHabits[id];
 newEntries[date] = { ...entry, habits: newHabits };
 }
 });
 return {
 ...prev,
 habits: prev.habits.filter((h) => h.id !== id),
 entries: newEntries,
 };
 });
 };

 const addMistake = (mistake: Mistake) => {
 setData((prev) => ({ ...prev, mistakes: [...(prev.mistakes || []), mistake] }));
 };

 const updateMistake = (mistake: Mistake) => {
 setData((prev) => ({
 ...prev,
 mistakes: (prev.mistakes || []).map((m) => (m.id === mistake.id ? mistake : m)),
 }));
 };

 const deleteMistake = (id: string) => {
 setData((prev) => ({
 ...prev,
 mistakes: (prev.mistakes || []).filter((m) => m.id !== id),
 }));
 };

 const resetData = () => {
 setData(DEFAULT_DATA);
 };

 const importData = (importedData: AppData) => {
 setData(importedData);
 };

 return (
 <AppContext.Provider
 value={{
 data,
 updateSettings,
 saveEntry,
 addSubject,
 updateSubject,
 deleteSubject,
 addChapter,
 updateChapter,
 deleteChapter,
 addHabit,
 updateHabit,
 deleteHabit,
 addMistake,
 updateMistake,
 deleteMistake,
 resetData,
 importData,
 calculateDayStatus,
 scoreData
 }}
 >
 {children}
 </AppContext.Provider>
 );
};

export const useAppContext = () => {
 const context = useContext(AppContext);
 if (!context) {
 throw new Error('useAppContext must be used within an AppProvider');
 }
 return context;
};
