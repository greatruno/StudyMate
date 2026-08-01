import { DocumentItem, StudyStats } from "./types";

export const SAMPLE_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_STATS: StudyStats = {
  documentsCount: 0,
  quizzesTakenCount: 0,
  averageQuizScore: 0,
  flashcardsMasteredCount: 0,
  studyTimeMinutes: 0,
  dailyStreak: 0,
  weeklyProgress: [
    { day: "Mon", minutes: 0 },
    { day: "Tue", minutes: 0 },
    { day: "Wed", minutes: 0 },
    { day: "Thu", minutes: 0 },
    { day: "Fri", minutes: 0 },
    { day: "Sat", minutes: 0 },
    { day: "Sun", minutes: 0 }
  ],
  achievements: [
    {
      id: "first_upload",
      title: "Knowledge Collector",
      description: "Uploaded your first set of lecture notes or textbook chapters.",
      unlocked: false,
      iconName: "FileUp"
    },
    {
      id: "quiz_champion",
      title: "Quiz Crusader",
      description: "Scored 100% on any generated conceptual quiz.",
      unlocked: false,
      iconName: "Award"
    },
    {
      id: "flashcard_master",
      title: "Memory Wizard",
      description: "Studied and completed a full deck of active recall flashcards.",
      unlocked: false,
      iconName: "BrainCircuit"
    },
    {
      id: "streak_3",
      title: "Consistent Learner",
      description: "Maintained a 3-day active study streak.",
      unlocked: false,
      iconName: "Flame"
    },
    {
      id: "streak_7",
      title: "Unstoppable Force",
      description: "Maintain a 7-day active study streak.",
      unlocked: false,
      iconName: "Zap"
    }
  ]
};

