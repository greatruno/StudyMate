export interface KeyConcept {
  title: string;
  explanation: string;
}

export interface SummaryData {
  title: string;
  summaryText: string;
  keyConcepts: KeyConcept[];
  bulletPoints: string[];
  studyTips: string[];
  subject?: string;
  // Extended Material Intelligence & Pipeline metadata fields
  chapters?: { title: string; range: string; summary: string }[];
  topics?: string[];
  keywords?: string[];
  importantTerms?: { term: string; definition: string }[];
  quizTopics?: string[];
  flashcardSuggestions?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  type?: string;
  correctShortAnswer?: string;
}

export interface Flashcard {
  front: string;
  back: string;
  concept: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  uploadedAt: string;
  wordCount: number;
  subject?: string;
  summary?: SummaryData;
  quiz?: QuizQuestion[];
  flashcards?: Flashcard[];
  paragraphs?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  iconName: string; // corresponding to Lucide icon names
}

export interface QuizAttempt {
  id: string;
  documentId: string;
  documentTitle: string;
  subject: string;
  score: number; // percentage (0-100)
  totalQuestions: number;
  correctAnswers: number;
  takenAt: string;
}

export interface StudyStats {
  documentsCount: number;
  quizzesTakenCount: number;
  averageQuizScore: number;
  flashcardsMasteredCount: number;
  studyTimeMinutes: number;
  dailyStreak: number;
  weeklyProgress: { day: string; minutes: number }[];
  achievements: Achievement[];
  quizHistory?: QuizAttempt[];
  completedTopics?: string[]; // topic/chapter names marked as completed
  experiencePoints?: number;
  level?: number;
  activeStreak?: number;
  badgesEarned?: string[];
  totalStudyMinutes?: number;
  quizzesTaken?: number;
  flashcardsReviewed?: number;
  weeklyProgressMinutes?: number[];
}

export interface AcademicProfile {
  role: string;
  academicCategory: string;
  primaryField: string;
  customField?: string;
  learningGoals: string;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced";
  preferredLearningStyle: "Visual" | "Reading/Writing" | "Practical" | "Mixed";
  customWelcomeMessage?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  avatarEmoji: string;
  targetGrade: string;
  studyGoalHours: number;
  documents: DocumentItem[];
  stats: StudyStats;
  chatHistories: Record<string, ChatMessage[]>;
  academicProfile?: AcademicProfile;
  studyPlan?: {
    examDate: string;
    dailyHours: number;
    subjects: string[];
    difficulty: string;
    weeks: {
      weekNumber: number;
      focus: string;
      days: {
        dayName: string;
        topics: string[];
        durationMinutes: number;
        completed: boolean;
        recommendation: string;
      }[];
    }[];
    createdAt: string;
  };
  role?: "student" | "teacher" | "admin";
  subscription?: "free" | "premium";
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  avatarEmoji?: string;
  visibility?: "public" | "private";
  creatorUsername: string;
  ownerUsername?: string;
  moderatorUsernames?: string[];
  memberUsernames: string[];
  memberRoles?: Record<string, "owner" | "moderator" | "member">;
  joinRequests?: GroupJoinRequest[];
  invitations?: GroupInvitation[];
  activityFeed?: GroupActivityItem[];
  sharedDocumentIds: string[]; // references SharedDocument ids
  discussionsCount: number;
  createdAt: string;
}

export interface GroupJoinRequest {
  id: string;
  groupId: string;
  groupName: string;
  username: string;
  displayName: string;
  avatarEmoji?: string;
  message?: string;
  timestamp: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;
  invitedUsername: string;
  invitedBy: string;
  status: "pending" | "accepted" | "declined";
  timestamp: string;
}

export interface GroupActivityItem {
  id: string;
  groupId: string;
  actorUsername: string;
  actorDisplayName?: string;
  type: "member_joined" | "doc_uploaded" | "session_scheduled" | "note_created" | "chat_pinned" | "deck_created" | "quiz_created";
  text: string;
  timestamp: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  url?: string;
  content?: string;
  fileType: "pdf" | "docx" | "image" | "text" | "other";
  size?: string;
}

export interface ChatReaction {
  emoji: string;
  usernames: string[];
}

export interface GroupChatMessage {
  id: string;
  groupId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatarEmoji: string;
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  replyToId?: string;
  replyToText?: string;
  replyToSender?: string;
  reactions?: ChatReaction[];
  isPinned?: boolean;
  isEdited?: boolean;
  readByUsernames?: string[];
}

export interface DocumentVersion {
  version: number;
  title: string;
  updatedAt: string;
  updatedBy: string;
  changesSummary: string;
  content: string;
}

export interface SharedAnnotation {
  id: string;
  docId: string;
  authorUsername: string;
  authorDisplayName: string;
  selectedText: string;
  comment: string;
  createdAt: string;
  color?: string;
}

export interface SharedDocument {
  id: string;
  originalDocId: string;
  title: string;
  content: string;
  subject: string;
  ownerUsername: string;
  privacy: "private" | "group" | "public";
  groupIds?: string[];
  uploadedAt: string;
  wordCount: number;
  downloadsCount: number;
  starsCount: number;
  starredByUsernames?: string[];
  versionHistory?: DocumentVersion[];
  sharedAnnotations?: SharedAnnotation[];
  permission?: "view" | "comment" | "edit";
  courseTopic?: string;
}

export interface NoteChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface NoteCodeBlock {
  id: string;
  language: string;
  code: string;
}

export interface NoteEquation {
  id: string;
  latex: string;
  explanation: string;
}

export interface NoteComment {
  id: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarEmoji: string;
  text: string;
  createdAt: string;
  resolved: boolean;
}

export interface GroupCollaborativeNote {
  id: string;
  groupId: string;
  title: string;
  content: string;
  creatorUsername: string;
  lastEditedByUsername: string;
  updatedAt: string;
  checklists?: NoteChecklistItem[];
  codeBlocks?: NoteCodeBlock[];
  equations?: NoteEquation[];
  comments?: NoteComment[];
  mentions?: string[];
  courseTopic?: string;
  isPinned?: boolean;
}

export interface FlashcardEditSuggestion {
  id: string;
  cardIndex: number;
  suggestedFront: string;
  suggestedBack: string;
  suggestedConcept: string;
  authorUsername: string;
  authorDisplayName: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
}

export interface GroupFlashcardDeck {
  id: string;
  groupId: string;
  title: string;
  subject: string;
  creatorUsername: string;
  flashcards: Flashcard[];
  suggestedEdits?: FlashcardEditSuggestion[];
  votes: number;
  votedUsernames: string[];
  versionHistory?: Array<{ version: number; updatedAt: string; updatedBy: string }>;
  createdAt: string;
}

export interface GroupQuiz {
  id: string;
  groupId: string;
  title: string;
  subject: string;
  creatorUsername: string;
  questions: QuizQuestion[];
  votes: number;
  votedUsernames: string[];
  versionHistory?: Array<{ version: number; updatedAt: string; updatedBy: string }>;
  createdAt: string;
}

export interface SessionAgendaItem {
  id: string;
  itemText: string;
  completed: boolean;
  assignedTo?: string;
}

export interface SessionAttendee {
  username: string;
  displayName: string;
  avatarEmoji: string;
  joinedAt?: string;
  status: "attending" | "declined" | "present";
}

export interface GroupStudySession {
  id: string;
  groupId: string;
  groupName?: string;
  title: string;
  description?: string;
  scheduledStartTime: string;
  durationMinutes: number;
  status: "scheduled" | "active" | "completed";
  attendees: SessionAttendee[];
  agenda: SessionAgendaItem[];
  pomodoroConfig?: {
    workMinutes: number;
    breakMinutes: number;
    currentCycle: number;
  };
  sessionNotes?: string;
  aiRecap?: {
    summary: string;
    actionItems: string[];
    topicsCovered: string[];
    recommendedNextTopics: string[];
  };
  createdByUsername: string;
  createdAt: string;
}

export interface DiscussionReply {
  id: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarEmoji: string;
  text: string;
  votes: number;
  votedUsernames?: string[];
  isHelpful: boolean;
  createdAt: string;
}

export interface DiscussionThread {
  id: string;
  title: string;
  text: string;
  subject: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarEmoji: string;
  votes: number;
  votedUsernames?: string[];
  replies: DiscussionReply[];
  groupId?: string; // empty if public
  isResolved: boolean;
  aiSummary?: string;
  createdAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  description: string;
  teacherUsername: string;
  studentUsernames: string[];
  inviteCode: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  maxPoints: number;
  taskType: "quiz" | "flashcards" | "document_read";
  taskConfig?: {
    documentId?: string;
    numQuestions?: number;
    completionTarget?: number;
  };
  submissions: {
    studentUsername: string;
    score: number;
    completedAt: string;
    status: "submitted" | "late" | "missing";
  }[];
  createdAt: string;
}

// Phase 3.1 Academic Management Subsystem Interfaces
export interface AcademicInstitution {
  id: string;
  name: string;
  code: string;
  type: "University" | "Polytechnic" | "College" | "Institute";
  country: string;
  logoUrl?: string;
}

export interface AcademicFaculty {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  deanName?: string;
}

export interface AcademicDepartment {
  id: string;
  facultyId: string;
  name: string;
  code: string;
  headOfDepartment?: string;
}

export interface AcademicProgramme {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  degreeType: "B.Sc." | "B.A." | "B.Eng." | "M.Sc." | "Ph.D." | "HND" | "ND";
  durationYears: number;
}

export interface AcademicSession {
  id: string;
  sessionName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface AcademicSemester {
  id: string;
  sessionId: string;
  semesterType: "First" | "Second" | "Summer";
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
}

export interface AcademicCourse {
  id: string;
  code: string;
  title: string;
  creditUnit: number;
  level: number;
  semester: "First" | "Second" | "Summer";
  departmentId: string;
  facultyId: string;
  programmeId: string;
  status: "Core" | "Elective" | "Required" | "General";
  prerequisites: string[];
  description?: string;
}

export interface CourseRegistrationItem {
  id: string;
  userId: string;
  sessionId: string;
  semesterId: string;
  courseId: string;
  status: "registered" | "approved" | "dropped";
  registeredAt: string;
}

export interface RegisteredCourseWithDetails {
  registration: CourseRegistrationItem;
  course: AcademicCourse;
}

export interface StudentAcademicProfile {
  userId: string;
  institutionId: string;
  institutionName: string;
  facultyId: string;
  facultyName: string;
  departmentId: string;
  departmentName: string;
  programmeId: string;
  programmeName: string;
  matricNumber: string;
  entryYear: number;
  graduationYear: number;
  currentLevel: number;
  currentSemester: "First" | "Second" | "Summer";
  academicStatus: "active" | "graduated" | "suspended" | "probation";
  updatedAt: string;
}

export interface AcademicDashboardSummary {
  profile: StudentAcademicProfile;
  currentSession: AcademicSession | null;
  currentSemester: AcademicSemester | null;
  totalCoursesCount: number;
  activeRegisteredCourses: RegisteredCourseWithDetails[];
  totalRegisteredUnits: number;
  maxUnitLimit: number;
  registrationStatus: "not_started" | "in_progress" | "submitted" | "approved";
  levelProgressPercentage: number;
}

// Phase 3.4 Unified Workspace & Navigation System Interfaces
export interface WorkspaceWidget {
  id: string;
  type: "timer" | "chats" | "planner" | "velocity" | "flashcards" | "suggestions" | "cgpa" | "uploads" | "calendar";
  title: string;
  isVisible: boolean;
  isPinned: boolean;
  gridSpan: "full" | "half" | "third";
  order: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: "reminder" | "due" | "result" | "recommendation" | "unlock" | "system" | "academic";
  priority: "low" | "medium" | "high";
  actionTab?: string;
}

export interface ThemeSettings {
  mode: "light" | "dark" | "system";
  highContrast: boolean;
  reducedMotion: boolean;
  largeFontMode: boolean;
}

export interface GlobalSearchResultItem {
  id: string;
  title: string;
  snippet: string;
  category: "document" | "summary" | "flashcard" | "quiz" | "chat" | "planner" | "course" | "transcript" | "memory" | "action";
  tabTarget: string;
  meta?: string;
}

export interface GradeDefinition {
  letterGrade: string;
  gradePoint: number;
  minScore: number;
  maxScore: number;
  remark: string;
}

export interface GradingScale {
  id: string;
  name: string;
  maxPoint: number;
  grades: GradeDefinition[];
}

export interface StoredCourseGrade {
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  score: number;
  letterGrade: string;
  gradePoint: number;
  qualityPoints: number;
  category: "Core" | "Elective" | "Required" | "General";
  passed: boolean;
  attemptNumber: number;
}

export interface SemesterRecord {
  id: string;
  userId: string;
  sessionId: string;
  semesterId: string;
  level: string;
  courses: StoredCourseGrade[];
  totalRegisteredCredits: number;
  totalPassedCredits: number;
  totalQualityPoints: number;
  gpa: number;
  runningCGPA: number;
  createdAt: string;
}

export interface AcademicIntelligenceDashboardData {
  currentGPA: number;
  currentCGPA: number;
  totalQualityPoints: number;
  earnedCredits: number;
  attemptedCredits: number;
  creditsRemaining: number;
  degreeCompletionPercentage: number;
  academicStanding: string;
  predictedGraduationClass: string;
  totalSemestersRecorded: number;
  failedCoursesCount: number;
  outstandingFailedCourses: string[];
  gradingScaleName: string;
  maxGradePoint: number;
  latestSemester: SemesterRecord | null;
  semesterHistory: Array<{
    id: string;
    level: string;
    sessionId: string;
    semesterId: string;
    gpa: number;
    runningCGPA: number;
    credits: number;
  }>;
}

export interface TranscriptData {
  institutionName: string;
  faculty: string;
  department: string;
  programme: string;
  studentName: string;
  matricNumber: string;
  entryYear: string;
  graduatingYear: string;
  gradingScaleName: string;
  maxPoint: number;
  totalEarnedCredits: number;
  totalQualityPoints: number;
  finalCGPA: number;
  graduationClass: string;
  academicStanding: string;
  issueDate: string;
  semesters: SemesterRecord[];
}

export interface DegreeProgressBreakdown {
  totalRequiredCredits: number;
  completedCredits: number;
  remainingCredits: number;
  completionPercentage: number;
  coreCompleted: number;
  coreRequired: number;
  electiveCompleted: number;
  electiveRequired: number;
  generalCompleted: number;
  generalRequired: number;
}

export interface GraduationEligibilityResult {
  isEligible: boolean;
  status: "Eligible" | "Almost Eligible" | "Not Eligible";
  passedMinCredits: boolean;
  passedCoreCredits: boolean;
  passedElectiveCredits: boolean;
  passedGeneralCredits: boolean;
  passedMinCGPA: boolean;
  hasOutstandingFailedCourses: boolean;
  reasons: string[];
  recommendations: string[];
}

export interface WhatIfSimulationResult {
  currentCGPA: number;
  simulatedSemesterGPA: number;
  projectedQualityPoints: number;
  projectedTotalCredits: number;
  projectedCGPA: number;
  cgpaDelta: number;
  currentGraduationClass: string;
  projectedGraduationClass: string;
  classImproved: boolean;
  recommendations: string[];
}

export interface CourseRetakeSummary {
  retakenCoursesCount: number;
  activeCarryOversCount: number;
  qualityPointsRecovered: number;
  activeCarryOverCodes: string[];
  retakeDetails: Array<{
    courseCode: string;
    courseTitle: string;
    creditUnit: number;
    attempts: Array<{
      sessionId: string;
      semesterId: string;
      score: number;
      letterGrade: string;
      gradePoint: number;
      passed: boolean;
    }>;
    status: "Cleared" | "Pending Carry Over";
    gradeDifference: number;
  }>;
}

// Phase 4.2 Institution & Classroom Management Platform Interfaces
export interface InstitutionBranding {
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  campusAddress: string;
  contactEmail: string;
  websiteUrl: string;
  portalAnnouncement?: string;
}

export interface LecturerCourseMaterial {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  type: "lecture_notes" | "slides" | "syllabus" | "audio_video" | "assignment" | "question_bank";
  description: string;
  url?: string;
  uploadedByUsername: string;
  uploadedAt: string;
  fileSize?: string;
  downloadsCount: number;
}

export interface ClassroomAttendanceRecord {
  id: string;
  classroomId: string;
  date: string;
  lectureTopic: string;
  studentUsernamesPresent: string[];
  studentUsernamesLate: string[];
  studentUsernamesAbsent: string[];
  recordedByUsername: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  maxPoints: number;
  description: string;
}

export interface SubmissionVersion {
  versionNumber: number;
  submittedAt: string;
  content: string;
  fileUrl?: string;
  comment?: string;
  rubricScores?: Record<string, number>;
  feedback?: string;
  gradedByUsername?: string;
  gradedAt?: string;
  finalScore?: number;
}

export interface AdvancedAssignmentSubmission {
  id: string;
  assignmentId: string;
  studentUsername: string;
  studentDisplayName: string;
  status: "draft" | "submitted" | "graded" | "returned";
  currentVersion: number;
  versions: SubmissionVersion[];
  lateMinutes?: number;
}

export interface QuestionBankItem {
  id: string;
  courseCode: string;
  type: "mcq" | "short_answer" | "essay" | "true_false";
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  sampleAnswer?: string;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "elite";
  topicTag: string;
  points: number;
}

export interface ScheduledExam {
  id: string;
  courseId: string;
  courseCode: string;
  classroomId: string;
  title: string;
  instructions: string;
  durationMinutes: number;
  totalPoints: number;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  questions: QuestionBankItem[];
  randomizeQuestions: boolean;
  createdAt: string;
}

export interface ExamSubmissionResult {
  id: string;
  examId: string;
  studentUsername: string;
  studentDisplayName: string;
  answers: Record<string, string | number>;
  score: number;
  percentage: number;
  status: "in_progress" | "submitted" | "graded";
  submittedAt: string;
  timeTakenMinutes: number;
  feedback?: string;
}

export interface AtRiskStudentAlert {
  id: string;
  studentUsername: string;
  studentDisplayName: string;
  courseCode: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  attendancePercentage: number;
  averageQuizScore: number;
  missingAssignmentsCount: number;
  reasons: string[];
  recommendedIntervention: string;
}

export interface InstitutionalMetrics {
  totalFaculties: number;
  totalDepartments: number;
  totalProgrammes: number;
  totalEnrolledStudents: number;
  totalActiveLecturers: number;
  averageClassAttendanceRate: number;
  averageAssignmentCompletionRate: number;
  gradeDistributionCurve: {
    gradeA: number;
    gradeB: number;
    gradeC: number;
    gradeD: number;
    gradeF: number;
  };
  departmentPerformance: Array<{
    departmentCode: string;
    departmentName: string;
    studentsCount: number;
    avgGpa: number;
  }>;
}



