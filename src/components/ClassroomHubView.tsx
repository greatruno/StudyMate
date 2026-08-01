import React, { useState, useEffect } from "react";
import { 
  School, 
  Plus, 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ShieldAlert, 
  UserCheck, 
  Eye, 
  Check, 
  Activity,
  ChevronRight,
  BookOpen,
  Brain,
  Trash2,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { UserAccount, Classroom, Assignment, DocumentItem } from "../types";

interface ClassroomHubViewProps {
  currentUser: UserAccount;
  documents: DocumentItem[];
  onUpdateUserRole: (role: "student" | "teacher") => void;
  onAddStatsReward: (points: number, contributionReward: string) => void;
}

export default function ClassroomHubView({
  currentUser,
  documents,
  onUpdateUserRole,
  onAddStatsReward
}: ClassroomHubViewProps) {
  // Local states loaded from LocalStorage
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mockStudents, setMockStudents] = useState<UserAccount[]>([]);

  // Classroom sub-navigation tab state
  const [classroomTab, setClassroomTab] = useState<"assignments" | "attendance" | "exams" | "resources" | "discussions">("assignments");

  // Attendance states
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [lectureTopic, setLectureTopic] = useState<string>("Cellular Respiration & Glycolysis");
  const [presentStudents, setPresentStudents] = useState<string[]>(["peer_student_sam", "alex_study_hard"]);
  const [lateStudents, setLateStudents] = useState<string[]>([]);
  const [absentStudents, setAbsentStudents] = useState<string[]>(["coder_sam"]);
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // Exam taking states
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examResult, setExamResult] = useState<any | null>(null);
  const [examTimeRemaining, setExamTimeRemaining] = useState<number>(45 * 60);


  // Shared Resources states
  const [resources, setResources] = useState<{ id: string; classroomId: string; title: string; description: string; type: string; url?: string; sharedAt: string }[]>([]);
  const [showAddResource, setShowAddResource] = useState(false);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceDesc, setNewResourceDesc] = useState("");
  const [newResourceType, setNewResourceType] = useState("document");
  const [newResourceUrl, setNewResourceUrl] = useState("");

  // Discussion forum states
  const [threads, setThreads] = useState<{ id: string; classroomId: string; title: string; authorDisplayName: string; authorAvatar: string; content: string; replies: { id: string; authorDisplayName: string; authorAvatar: string; content: string; date: string }[]; createdAt: string }[]>([]);
  const [showAddThread, setShowAddThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [newReplyTexts, setNewReplyTexts] = useState<Record<string, string>>({});

  // State handles for view
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [inviteCodeInput, setInviteCodeInput] = useState("");

  // Modals / creates
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  // Form states
  const [newClassName, setNewClassName] = useState("");
  const [newClassDesc, setNewClassDesc] = useState("");
  
  const [newAssignTitle, setNewAssignTitle] = useState("");
  const [newAssignDesc, setNewAssignDesc] = useState("");
  const [newAssignType, setNewAssignType] = useState<"quiz" | "flashcards" | "document_read">("quiz");
  const [newAssignSubject, setNewAssignSubject] = useState("");
  const [newAssignDueDate, setNewAssignDueDate] = useState("");
  const [newAssignPoints, setNewAssignPoints] = useState(100);

  // Load state on mount
  useEffect(() => {
    // 1. Classrooms
    const cachedClassrooms = localStorage.getItem("studymate_classrooms_v1");
    if (cachedClassrooms) {
      setClassrooms(JSON.parse(cachedClassrooms));
    } else {
      const initialClassrooms: Classroom[] = [
        {
          id: "class-1",
          name: "Introductory Biology 101",
          description: "Freshman biology course covering metabolic pathways, respiration, and genetics. Weekly assignments.",
          teacherUsername: "teacher_jane",
          studentUsernames: [currentUser.username, "peer_student_sam", "alex_study_hard"],
          inviteCode: "BIO101",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
        },
        {
          id: "class-2",
          name: "Advanced Software Engineering",
          description: "Principles of modular design, code health, service architectures, and persistent databases.",
          teacherUsername: currentUser.username, // if current user wants to be teacher
          studentUsernames: ["coder_sam", "tech_lead", "peer_student_sam"],
          inviteCode: "CS202",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
        }
      ];
      setClassrooms(initialClassrooms);
      localStorage.setItem("studymate_classrooms_v1", JSON.stringify(initialClassrooms));
    }

    // 2. Assignments
    const cachedAssignments = localStorage.getItem("studymate_assignments_v1");
    if (cachedAssignments) {
      setAssignments(JSON.parse(cachedAssignments));
    } else {
      const initialAssignments: Assignment[] = [
        {
          id: "assign-1",
          classroomId: "class-1",
          title: "Cellular Energy Production Quiz",
          description: "Take the 5-question practice quiz generated on your cellular metabolism study notes to complete this assignment.",
          subject: "Biology",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split("T")[0],
          maxPoints: 100,
          taskType: "quiz",
          submissions: [
            {
              studentUsername: "peer_student_sam",
              score: 90,
              completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              status: "submitted"
            }
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
        },
        {
          id: "assign-2",
          classroomId: "class-2",
          title: "Distributed Systems Flashcard Review",
          description: "Familiarize yourself with Paxos vs Raft card terminology. Tap through at least 10 cards.",
          subject: "Computer Science",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().split("T")[0],
          maxPoints: 50,
          taskType: "flashcards",
          submissions: [],
          createdAt: new Date().toISOString()
        }
      ];
      setAssignments(initialAssignments);
      localStorage.setItem("studymate_assignments_v1", JSON.stringify(initialAssignments));
    }

    // 3. Mock students database for monitoring
    const cachedMockStudents = localStorage.getItem("studymate_mock_students_v1");
    if (cachedMockStudents) {
      setMockStudents(JSON.parse(cachedMockStudents));
    } else {
      const initialStudents: UserAccount[] = [
        {
          id: "stu-1",
          username: "peer_student_sam",
          displayName: "Sam Peterson",
          email: "sam.peterson@university.edu",
          passwordHash: "",
          avatarEmoji: "🚀",
          targetGrade: "A",
          studyGoalHours: 10,
          documents: [],
          stats: {
            documentsCount: 2,
            quizzesTakenCount: 8,
            averageQuizScore: 84,
            flashcardsMasteredCount: 120,
            studyTimeMinutes: 340,
            dailyStreak: 5,
            weeklyProgress: [],
            achievements: [],
            totalStudyMinutes: 340,
            quizzesTaken: 8,
            flashcardsReviewed: 120,
            activeStreak: 5,
            level: 3,
            experiencePoints: 1250,
            badgesEarned: ["First Quiz Done", "Study Streak Pioneer"],
            weeklyProgressMinutes: [60, 40, 80, 50, 50, 60, 0]
          },
          chatHistories: {}
        },
        {
          id: "stu-2",
          username: "alex_study_hard",
          displayName: "Alex Ramirez",
          email: "alex.study@academy.edu",
          passwordHash: "",
          avatarEmoji: "🐼",
          targetGrade: "A+",
          studyGoalHours: 15,
          documents: [],
          stats: {
            documentsCount: 4,
            quizzesTakenCount: 14,
            averageQuizScore: 92,
            flashcardsMasteredCount: 250,
            studyTimeMinutes: 720,
            dailyStreak: 12,
            weeklyProgress: [],
            achievements: [],
            totalStudyMinutes: 720,
            quizzesTaken: 14,
            flashcardsReviewed: 250,
            activeStreak: 12,
            level: 6,
            experiencePoints: 3400,
            badgesEarned: ["Streak King", "A+ Achiever"],
            weeklyProgressMinutes: [100, 120, 90, 80, 110, 120, 100]
          },
          chatHistories: {}
        }
      ];
      setMockStudents(initialStudents);
      localStorage.setItem("studymate_mock_students_v1", JSON.stringify(initialStudents));
    }

    // 4. Shared Resources
    const cachedResources = localStorage.getItem("studymate_resources_v1");
    if (cachedResources) {
      setResources(JSON.parse(cachedResources));
    } else {
      const initialResources = [
        {
          id: "res-1",
          classroomId: "class-1",
          title: "Syllabus Overview & Textbook Reading Guide",
          description: "Read Chapter 3 on metabolic and respiration pathways before starting the quizzes.",
          type: "document",
          url: "https://example.com/syllabus_bio101.pdf",
          sharedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toLocaleDateString()
        },
        {
          id: "res-2",
          classroomId: "class-2",
          title: "Modular Service Architecture Best Practices",
          description: "A solid industry whitepaper detailing API gateways, load balancing, and offline database persistence.",
          type: "link",
          url: "https://example.com/modular_architectures.pdf",
          sharedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toLocaleDateString()
        }
      ];
      setResources(initialResources);
      localStorage.setItem("studymate_resources_v1", JSON.stringify(initialResources));
    }

    // 5. Discussion Threads
    const cachedThreads = localStorage.getItem("studymate_threads_v1");
    if (cachedThreads) {
      setThreads(JSON.parse(cachedThreads));
    } else {
      const initialThreads = [
        {
          id: "th-1",
          classroomId: "class-1",
          title: "Confused about Glycolysis key ATP yields?",
          authorDisplayName: "Alex Hardworker",
          authorAvatar: "🦉",
          content: "Why does Glycolysis produce 4 ATP in gross but only 2 ATP in net? Can somebody clarify?",
          replies: [
            {
              id: "rep-1",
              authorDisplayName: "Sam Peterson",
              authorAvatar: "🦁",
              content: "Because 2 ATP molecules are consumed in the preparatory/investment phase (phosphorylation of glucose). Gross is 4, net is 2!",
              date: new Date(Date.now() - 1000 * 60 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            {
              id: "rep-2",
              authorDisplayName: "StudyMate AI Tutor",
              authorAvatar: "🤖",
              content: "Perfect explanation, Sam! Glycolysis spends 2 ATP at the start to energize the glucose molecule, then yields 4 ATP later. Thus, net gain is 2 ATP, along with 2 NADH.",
              date: new Date(Date.now() - 1000 * 60 * 60 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toLocaleDateString()
        }
      ];
      setThreads(initialThreads);
      localStorage.setItem("studymate_threads_v1", JSON.stringify(initialThreads));
    }
  }, [currentUser]);

  // Save changes wrapper
  const updateClassroomsState = (newClass: Classroom[]) => {
    setClassrooms(newClass);
    localStorage.setItem("studymate_classrooms_v1", JSON.stringify(newClass));
  };

  const updateAssignmentsState = (newAssigns: Assignment[]) => {
    setAssignments(newAssigns);
    localStorage.setItem("studymate_assignments_v1", JSON.stringify(newAssigns));
  };

  // 🏫 Teacher Actions
  const handleCreateClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const code = newClassName.substring(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900);
    const newClass: Classroom = {
      id: "class-" + Date.now(),
      name: newClassName,
      description: newClassDesc,
      teacherUsername: currentUser.username,
      studentUsernames: [currentUser.username], // teacher is added as first member
      inviteCode: code,
      createdAt: new Date().toISOString()
    };

    updateClassroomsState([newClass, ...classrooms]);
    setNewClassName("");
    setNewClassDesc("");
    setShowCreateClass(false);

    onAddStatsReward(30, "Setting up a Classroom as an Instructor");
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignTitle.trim() || !selectedClassroomId) return;

    const newAssign: Assignment = {
      id: "assign-" + Date.now(),
      classroomId: selectedClassroomId,
      title: newAssignTitle,
      description: newAssignDesc,
      subject: newAssignSubject || "General",
      dueDate: newAssignDueDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split("T")[0],
      maxPoints: newAssignPoints,
      taskType: newAssignType,
      submissions: [],
      createdAt: new Date().toISOString()
    };

    updateAssignmentsState([newAssign, ...assignments]);
    setNewAssignTitle("");
    setNewAssignDesc("");
    setShowCreateAssignment(false);

    onAddStatsReward(20, "Publishing a course assignment for students");
  };

  // 🎓 Student Actions
  const handleJoinClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inviteCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    const target = classrooms.find(c => c.inviteCode === cleanCode);
    if (!target) {
      alert("Invalid classroom invite code! Try entering 'BIO101' or 'CS202' for interactive testing.");
      return;
    }

    if (target.studentUsernames.includes(currentUser.username)) {
      alert("You are already enrolled in this classroom!");
      return;
    }

    const updated = classrooms.map(c => {
      if (c.id === target.id) {
        return {
          ...c,
          studentUsernames: [...c.studentUsernames, currentUser.username]
        };
      }
      return c;
    });

    updateClassroomsState(updated);
    setInviteCodeInput("");
    alert(`Successfully enrolled in ${target.name}!`);

    onAddStatsReward(15, "Enrolling in a new academic course");
  };

  // Simulated submission of assignments
  const handleSimulateSubmit = (assignId: string) => {
    // Check if already submitted
    const targetAssign = assignments.find(a => a.id === assignId);
    if (!targetAssign) return;

    if (targetAssign.submissions.some(s => s.studentUsername === currentUser.username)) {
      alert("Assignment already completed and submitted!");
      return;
    }

    // Mock grading with some high score
    const score = Math.floor(85 + Math.random() * 15);
    const submission = {
      studentUsername: currentUser.username,
      score: score,
      completedAt: new Date().toISOString(),
      status: "submitted" as const
    };

    const updated = assignments.map(a => {
      if (a.id === assignId) {
        return {
          ...a,
          submissions: [...a.submissions, submission]
        };
      }
      return a;
    });

    updateAssignmentsState(updated);
    alert(`Assignment submitted successfully! Mock score graded: ${score}/${targetAssign.maxPoints}`);

    // Real rewards
    onAddStatsReward(40, `Completing assignment: ${targetAssign.title}`);
  };

  // Shared Resource actions
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle.trim() || !selectedClassroomId) return;

    const newRes = {
      id: "res-" + Date.now(),
      classroomId: selectedClassroomId,
      title: newResourceTitle.trim(),
      description: newResourceDesc.trim(),
      type: newResourceType,
      url: newResourceUrl.trim() || undefined,
      sharedAt: new Date().toLocaleDateString()
    };

    const updated = [newRes, ...resources];
    setResources(updated);
    localStorage.setItem("studymate_resources_v1", JSON.stringify(updated));
    setNewResourceTitle("");
    setNewResourceDesc("");
    setNewResourceUrl("");
    setShowAddResource(false);
    onAddStatsReward(15, `Shared course material: ${newRes.title}`);
  };

  const handleDeleteResource = (resId: string) => {
    const updated = resources.filter(r => r.id !== resId);
    setResources(updated);
    localStorage.setItem("studymate_resources_v1", JSON.stringify(updated));
  };

  // Discussion Actions
  const handleAddThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim() || !selectedClassroomId) return;

    const newThread = {
      id: "th-" + Date.now(),
      classroomId: selectedClassroomId,
      title: newThreadTitle.trim(),
      authorDisplayName: currentUser.displayName,
      authorAvatar: currentUser.avatarEmoji || "🎓",
      content: newThreadContent.trim(),
      replies: [],
      createdAt: new Date().toLocaleDateString()
    };

    const updated = [newThread, ...threads];
    setThreads(updated);
    localStorage.setItem("studymate_threads_v1", JSON.stringify(updated));
    setNewThreadTitle("");
    setNewThreadContent("");
    setShowAddThread(false);
    onAddStatsReward(15, `Created discussion thread: ${newThread.title}`);
  };

  const handleAddReply = (threadId: string) => {
    const replyText = newReplyTexts[threadId];
    if (!replyText || !replyText.trim()) return;

    const newReply = {
      id: "rep-" + Date.now(),
      authorDisplayName: currentUser.displayName,
      authorAvatar: currentUser.avatarEmoji || "🎓",
      content: replyText.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: [...t.replies, newReply]
        };
      }
      return t;
    });

    setThreads(updated);
    localStorage.setItem("studymate_threads_v1", JSON.stringify(updated));
    setNewReplyTexts(prev => ({ ...prev, [threadId]: "" }));
    onAddStatsReward(5, "Replied in class discussion");
  };

  const handleAskAITutor = (threadId: string, threadTitle: string, threadContent: string) => {
    const explanation = `StudyMate Assistant 🤖:\n\nRegarding your question on "${threadTitle}":\nGreat query! In typical academic settings, remember that enzyme kinetics scale with substrate availability up to a saturation plateau. Be sure to review key pathways in your study guide!`;
    
    const newReply = {
      id: "rep-ai-" + Date.now(),
      authorDisplayName: "StudyMate AI Tutor",
      authorAvatar: "🤖",
      content: explanation,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: [...t.replies, newReply]
        };
      }
      return t;
    });

    setThreads(updated);
    localStorage.setItem("studymate_threads_v1", JSON.stringify(updated));
  };

  // Determine current active user role
  const role = currentUser.role || "student";

  // Filter lists based on role and selection
  const userClassrooms = classrooms.filter(c => {
    if (role === "teacher") {
      return c.teacherUsername === currentUser.username;
    } else {
      return c.studentUsernames.includes(currentUser.username);
    }
  });

  const selectedClass = classrooms.find(c => c.id === selectedClassroomId);

  const classroomAssignments = assignments.filter(a => a.classroomId === selectedClassroomId);

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-8 animate-fade-in" id="classroom-root">
      
      {/* Role Toggle Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-slate-900/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500 rounded-xl text-white">
            <School className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Future-Ready Educator & Classroom Panel
            </h3>
            <p className="text-xs text-slate-300 font-medium max-w-lg">
              Toggle roles below to simulate teaching workflows, assign material-linked checkpoints, or submit work as a student.
            </p>
          </div>
        </div>

        {/* Dynamic interactive switcher */}
        <div className="flex bg-slate-800 border border-slate-700 p-1 rounded-xl self-start md:self-auto shrink-0">
          <button
            onClick={() => onUpdateUserRole("student")}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              role === "student"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🎓 Student Mode
          </button>
          <button
            onClick={() => onUpdateUserRole("teacher")}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              role === "teacher"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            💼 Teacher Mode
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CLASSROOMS DIRECTORY */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-gray-150 space-y-4 shadow-3xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <School className="h-4 w-4 text-indigo-500" />
                Enrollments & Classes
              </h4>
              {role === "teacher" && (
                <button
                  onClick={() => setShowCreateClass(!showCreateClass)}
                  className="text-xs text-indigo-600 font-bold flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Class
                </button>
              )}
            </div>

            {/* Quick student join form */}
            {role === "student" && (
              <form onSubmit={handleJoinClassroom} className="flex gap-2 bg-slate-50 border border-gray-150 p-1.5 rounded-xl">
                <input
                  type="text"
                  placeholder="Classroom Code (e.g. BIO101)"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none px-2.5 flex-1 uppercase"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] px-3 py-2 rounded-lg uppercase tracking-wider transition-all"
                >
                  Enroll
                </button>
              </form>
            )}

            {showCreateClass && role === "teacher" && (
              <form onSubmit={handleCreateClassroom} className="p-4 bg-slate-50 border border-gray-150 rounded-xl space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">New Course Details</p>
                <input
                  type="text"
                  placeholder="e.g. Advanced Chemistry"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Course outline / syllabus overview..."
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateClass(false)}
                    className="text-[10px] font-bold text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[10px] bg-indigo-600 text-white font-bold px-3 py-1.5 rounded"
                  >
                    Confirm Create
                  </button>
                </div>
              </form>
            )}

            {/* List of classes */}
            <div className="space-y-2">
              {userClassrooms.length === 0 ? (
                <div className="text-center py-6 text-[11px] text-gray-400">
                  {role === "teacher" 
                    ? "You haven't generated any classrooms yet. Click 'Create Class' above."
                    : "No classrooms enrolled. Join with code 'BIO101' to interact."}
                </div>
              ) : (
                userClassrooms.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClassroomId(c.id)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all border flex items-center justify-between ${
                      selectedClassroomId === c.id 
                        ? "bg-indigo-50/50 border-indigo-200 text-indigo-900" 
                        : "bg-slate-50 border-gray-100 text-gray-700 hover:bg-slate-100/50"
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-xs">{c.name}</h5>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Code: <span className="text-indigo-600 font-bold">{c.inviteCode}</span></p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMNS: ACTIVE CLASSROOM WORKSPACE */}
        <div className="lg:col-span-2 space-y-6">
          {selectedClass ? (
            <div className="space-y-6" id="classroom-workspace-panel">
              
              {/* Active course title card */}
              <div className="bg-white p-6 border border-gray-150 rounded-2xl space-y-3 shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded">
                    Active Course
                  </span>
                  <span className="text-xs font-bold text-gray-400">Invite Code: <span className="text-indigo-600 font-bold">{selectedClass.inviteCode}</span></span>
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight leading-snug">{selectedClass.name}</h3>
                <p className="text-xs text-gray-500 font-medium">{selectedClass.description}</p>
              </div>

              {/* Classroom Workspace Sub-Tabs */}
              <div className="flex border-b border-gray-150 gap-4 overflow-x-auto pb-1">
                <button
                  onClick={() => setClassroomTab("assignments")}
                  className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    classroomTab === "assignments"
                      ? "border-indigo-600 text-indigo-950 font-black"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  📝 Assignments & Rubrics
                </button>
                <button
                  onClick={() => setClassroomTab("attendance")}
                  className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    classroomTab === "attendance"
                      ? "border-indigo-600 text-indigo-950 font-black"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  📋 Digital Attendance
                </button>
                <button
                  onClick={() => setClassroomTab("exams")}
                  className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    classroomTab === "exams"
                      ? "border-indigo-600 text-indigo-950 font-black"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  🎯 Online Examinations
                </button>
                <button
                  onClick={() => setClassroomTab("resources")}
                  className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    classroomTab === "resources"
                      ? "border-indigo-600 text-indigo-950 font-black"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  📚 Shared Resources
                </button>
                <button
                  onClick={() => setClassroomTab("discussions")}
                  className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    classroomTab === "discussions"
                      ? "border-indigo-600 text-indigo-950 font-black"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  💬 Q&A & Forums
                </button>
              </div>

              {/* TAB: DIGITAL ATTENDANCE LOG */}
              {classroomTab === "attendance" && (
                <div className="space-y-5 bg-white p-6 rounded-2xl border border-gray-150 shadow-3xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Digital Classroom Attendance Tracker</h4>
                      <p className="text-xs text-gray-500">Record and monitor lecture attendance for enrolled students.</p>
                    </div>
                    <button
                      onClick={() => {
                        setAttendanceSaved(true);
                        setTimeout(() => setAttendanceSaved(false), 3000);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      Save Attendance Log
                    </button>
                  </div>

                  {attendanceSaved && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Attendance log saved successfully!
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <label className="block text-gray-700 mb-1">Lecture Date</label>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={e => setAttendanceDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Lecture Topic</label>
                      <input
                        type="text"
                        value={lectureTopic}
                        onChange={e => setLectureTopic(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">Class Roster Marking</h5>
                    {[
                      { username: "peer_student_sam", name: "Sam Peer" },
                      { username: "alex_study_hard", name: "Alex Student" },
                      { username: "coder_sam", name: "Sam Coder" }
                    ].map(st => {
                      const isPresent = presentStudents.includes(st.username);
                      const isLate = lateStudents.includes(st.username);
                      const isAbsent = absentStudents.includes(st.username);

                      return (
                        <div key={st.username} className="p-3 bg-slate-50 rounded-xl border border-gray-150 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-gray-900">{st.name}</p>
                            <p className="text-[10px] text-gray-400">@{st.username}</p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setPresentStudents([...presentStudents.filter(u => u !== st.username), st.username]);
                                setLateStudents(lateStudents.filter(u => u !== st.username));
                                setAbsentStudents(absentStudents.filter(u => u !== st.username));
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                isPresent ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => {
                                setLateStudents([...lateStudents.filter(u => u !== st.username), st.username]);
                                setPresentStudents(presentStudents.filter(u => u !== st.username));
                                setAbsentStudents(absentStudents.filter(u => u !== st.username));
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                isLate ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              Late
                            </button>
                            <button
                              onClick={() => {
                                setAbsentStudents([...absentStudents.filter(u => u !== st.username), st.username]);
                                setPresentStudents(presentStudents.filter(u => u !== st.username));
                                setLateStudents(lateStudents.filter(u => u !== st.username));
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                isAbsent ? "bg-rose-600 text-white" : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: ONLINE EXAMINATIONS */}
              {classroomTab === "exams" && (
                <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-150 shadow-3xs">
                  {!activeExam ? (
                    <div className="space-y-4">
                      <div className="border-b border-gray-100 pb-3">
                        <h4 className="text-base font-bold text-gray-900">Scheduled Online Examinations</h4>
                        <p className="text-xs text-gray-500">Take timed assessments with auto-marking and instant score publishing.</p>
                      </div>

                      <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-[10px] font-extrabold uppercase text-indigo-300">
                            Published Exam
                          </span>
                          <span className="text-xs text-indigo-200 font-bold">45 Minutes Timer</span>
                        </div>
                        <h5 className="text-lg font-black">Mid-Semester Examination: Fundamentals of Computing</h5>
                        <p className="text-xs text-slate-300 font-medium">
                          Coverage: Von Neumann Architecture, ALU operations, Memory Bus, Operating System Kernels, and Big-O algorithm analysis.
                        </p>

                        <button
                          onClick={() => {
                            setActiveExam({
                              title: "Mid-Semester Examination: Fundamentals of Computing",
                              questions: [
                                {
                                  id: "q1",
                                  question: "Which component of the CPU performs mathematical calculations and logical comparisons?",
                                  options: ["Control Unit (CU)", "Arithmetic Logic Unit (ALU)", "Memory Management Unit (MMU)", "Instruction Cache"],
                                  correctIndex: 1,
                                  points: 50
                                },
                                {
                                  id: "q2",
                                  question: "What is the primary function of an Operating System Kernel?",
                                  options: ["Managing hardware resources and system calls", "Designing web graphics", "Compiling high-level code", "Managing browser cookies"],
                                  correctIndex: 0,
                                  points: 50
                                }
                              ]
                            });
                          }}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Start Exam Assessment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Exam Taking Header */}
                      <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm">{activeExam.title}</h4>
                          <p className="text-[11px] text-slate-400">Total Questions: {activeExam.questions.length} | Points: 100</p>
                        </div>
                        <div className="px-3 py-1.5 bg-indigo-600 rounded-xl text-xs font-black">
                          ⏱️ Time Remaining: 44:20
                        </div>
                      </div>

                      {examResult ? (
                        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 text-center">
                          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                          <h4 className="text-lg font-black text-emerald-950">Exam Submitted & Auto-Graded!</h4>
                          <p className="text-3xl font-black text-emerald-700">{examResult.score} / 100 ({examResult.percentage}%)</p>
                          <p className="text-xs text-emerald-800 font-semibold">Your answers have been stored and published to the academic registrar.</p>
                          <button
                            onClick={() => {
                              setActiveExam(null);
                              setExamResult(null);
                            }}
                            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Return to Exam Portal
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {activeExam.questions.map((q: any, idx: number) => (
                            <div key={q.id} className="p-5 bg-slate-50 rounded-2xl border border-gray-200 space-y-3">
                              <p className="text-xs font-bold text-gray-900">
                                Question {idx + 1}: {q.question} ({q.points} pts)
                              </p>
                              <div className="space-y-2">
                                {q.options.map((opt: string, optIdx: number) => (
                                  <label
                                    key={optIdx}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                      examAnswers[q.id] === optIdx ? "bg-indigo-50 border-indigo-500 text-indigo-900" : "bg-white border-gray-200 text-gray-800"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={q.id}
                                      checked={examAnswers[q.id] === optIdx}
                                      onChange={() => setExamAnswers({ ...examAnswers, [q.id]: optIdx })}
                                      className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => {
                                let total = 0;
                                activeExam.questions.forEach((q: any) => {
                                  if (examAnswers[q.id] === q.correctIndex) total += q.points;
                                });
                                setExamResult({ score: total, percentage: (total / 100) * 100 });
                              }}
                              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                            >
                              Submit Examination Paper
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}


              {/* TAB 1: COURSE ASSIGNMENTS CHECKPOINTS */}
              {classroomTab === "assignments" && (
                <div className="space-y-6">
                  {/* 💼 TEACHER VIEW FOR ASSIGNMENTS */}
                  {role === "teacher" && (
                    <div className="space-y-6" id="teacher-section">
                      {/* Classroom Control center & Assignments list */}
                      <div className="bg-white p-5 border border-gray-150 rounded-2xl space-y-4 shadow-3xs">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            Course Assignments ({classroomAssignments.length})
                          </h4>
                          <button
                            onClick={() => setShowCreateAssignment(!showCreateAssignment)}
                            className="text-xs bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 animate-fade-in"
                          >
                            <Plus className="h-3.5 w-3.5" /> Publish New Task
                          </button>
                        </div>

                        {showCreateAssignment && (
                          <form onSubmit={handleCreateAssignment} className="p-4 bg-slate-50 border border-gray-150 rounded-xl space-y-4 animate-fade-in">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-700">Create Material-Bound Assignment</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Title</label>
                                <input
                                  type="text"
                                  placeholder="e.g. End-of-Week Anatomy Review"
                                  value={newAssignTitle}
                                  onChange={(e) => setNewAssignTitle(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Due Date</label>
                                <input
                                  type="date"
                                  value={newAssignDueDate}
                                  onChange={(e) => setNewAssignDueDate(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Task Focus Module</label>
                                <select
                                  value={newAssignType}
                                  onChange={(e) => setNewAssignType(e.target.value as any)}
                                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none cursor-pointer"
                                >
                                  <option value="quiz">Smart Practice Quiz Check</option>
                                  <option value="flashcards">Term Flashcard Review</option>
                                  <option value="document_read">Verify Material Reading</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Subject Category</label>
                                <input
                                  type="text"
                                  placeholder="Anatomy, Coding"
                                  value={newAssignSubject}
                                  onChange={(e) => setNewAssignSubject(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Max Points</label>
                                <input
                                  type="number"
                                  value={newAssignPoints}
                                  onChange={(e) => setNewAssignPoints(Number(e.target.value))}
                                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Syllabus Instructions</label>
                              <textarea
                                placeholder="Add specific instructions for completion..."
                                value={newAssignDesc}
                                onChange={(e) => setNewAssignDesc(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none"
                                rows={2}
                              />
                            </div>

                            <div className="flex justify-end gap-2.5">
                              <button
                                type="button"
                                onClick={() => setShowCreateAssignment(false)}
                                className="text-[10px] font-bold text-gray-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="text-[10px] bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg"
                              >
                                Publish Checkpoint
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Assignments List Table */}
                        <div className="space-y-3">
                          {classroomAssignments.length === 0 ? (
                            <p className="text-[10px] text-gray-400 text-center py-4">No assignments published for this classroom yet.</p>
                          ) : (
                            classroomAssignments.map((a) => (
                              <div key={a.id} className="p-4 bg-slate-50 border border-gray-150 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                                <div className="space-y-1">
                                  <h5 className="font-bold text-xs text-gray-900 leading-snug">{a.title}</h5>
                                  <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">
                                    Type: <span className="text-indigo-600 font-bold capitalize">{a.taskType}</span> • Due: {a.dueDate} • Max Score: {a.maxPoints} pts
                                  </p>
                                </div>
                                <div className="shrink-0 text-right">
                                  <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold">
                                    {a.submissions.length} Submissions
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* 📈 STUDENT PERFORMANCE MONITORING & ANALYTICS */}
                      <div className="bg-white p-5 border border-gray-150 rounded-2xl space-y-4 shadow-3xs" id="student-monitoring-panel">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4 text-indigo-500" />
                          Class Student Analytics & Monitoring (Real-Time)
                        </h4>
                        <p className="text-[11px] text-gray-400 font-semibold leading-relaxed text-left">
                          Review individual study streaks, total engagement metrics, and quiz score analytics for enrolled students.
                        </p>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
                                <th className="pb-2.5">Student</th>
                                <th className="pb-2.5">Active Streak</th>
                                <th className="pb-2.5">Study Duration</th>
                                <th className="pb-2.5">Quiz Accuracy</th>
                                <th className="pb-2.5">Completed Modules</th>
                                <th className="pb-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-700">
                              {mockStudents.map((stu) => (
                                <tr key={stu.username} className="hover:bg-slate-50/50">
                                  <td className="py-3 flex items-center gap-2 font-bold text-gray-900">
                                    <span>{stu.avatarEmoji || "🎓"}</span>
                                    <div>
                                      <p>{stu.displayName}</p>
                                      <p className="text-[9px] text-gray-400 font-medium">@{stu.username}</p>
                                    </div>
                                  </td>
                                  <td className="py-3 font-bold text-indigo-600">{stu.stats?.activeStreak || 0} days</td>
                                  <td className="py-3 font-medium">{stu.stats?.totalStudyMinutes || 0} minutes</td>
                                  <td className="py-3 font-bold text-emerald-600">{stu.stats?.averageQuizScore || 0}% Avg</td>
                                  <td className="py-3 font-medium">{stu.stats?.quizzesTaken || 0} quizzes • {stu.stats?.flashcardsReviewed || 0} cards</td>
                                  <td className="py-3">
                                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider">
                                      Excellent
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 🎓 STUDENT VIEW FOR ASSIGNMENTS */}
                  {role === "student" && (
                    <div className="space-y-6" id="student-section">
                      <div className="bg-white p-5 border border-gray-150 rounded-2xl space-y-4 shadow-3xs">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-indigo-500" />
                          Assigned Course Task Checkpoints
                        </h4>
                        <p className="text-[11px] text-gray-400 font-semibold leading-relaxed text-left">
                          Complete smart practice modules mapped directly by your course teacher to qualify for grading submissions.
                        </p>

                        <div className="space-y-3">
                          {classroomAssignments.length === 0 ? (
                            <p className="text-[10px] text-gray-400 text-center py-4">Congratulations! No assignments are currently pending.</p>
                          ) : (
                            classroomAssignments.map((a) => {
                              const submission = a.submissions.find(s => s.studentUsername === currentUser.username);
                              const isSubmitted = !!submission;

                              return (
                                <div 
                                  key={a.id} 
                                  className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all text-left ${
                                    isSubmitted 
                                      ? "bg-green-50/20 border-green-150" 
                                      : "bg-white border-gray-200 shadow-3xs"
                                  }`}
                                >
                                  <div className="space-y-1 text-left">
                                    <h5 className="font-bold text-xs text-gray-900 leading-snug flex items-center gap-2">
                                      {a.title}
                                      {isSubmitted && (
                                        <span className="text-[8px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex items-center gap-0.5">
                                          <Check className="h-2 w-2" /> Completed
                                        </span>
                                      )}
                                    </h5>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{a.description}</p>
                                    <p className="text-[9px] text-gray-400 font-semibold">
                                      Due: {a.dueDate} • Value: {a.maxPoints} pts
                                    </p>
                                  </div>

                                  <div className="shrink-0">
                                    {isSubmitted ? (
                                      <div className="text-right text-xs">
                                        <p className="font-black text-emerald-700">Graded: {submission.score}%</p>
                                        <p className="text-[9px] text-gray-400 font-semibold">Submitted Successfully</p>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleSimulateSubmit(a.id)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-xs transition-all"
                                      >
                                        Complete Task <ArrowRight className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SHARED LEARNING RESOURCES DIRECTORY */}
              {classroomTab === "resources" && (
                <div className="bg-white p-5 border border-gray-150 rounded-2xl space-y-5 shadow-3xs text-left" id="resources-tab-panel">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-indigo-500" />
                        Shared Materials & Course Bibliography
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Access reference guidelines shared explicitly for syllabus review.</p>
                    </div>

                    {role === "teacher" && (
                      <button
                        onClick={() => setShowAddResource(!showAddResource)}
                        className="text-xs bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
                      >
                        <Plus className="h-3 w-3" /> Share Material
                      </button>
                    )}
                  </div>

                  {/* Add Resource Form (Instructors Only) */}
                  {showAddResource && role === "teacher" && (
                    <form onSubmit={handleAddResource} className="p-4 bg-slate-50 border border-gray-150 rounded-xl space-y-4 animate-fade-in">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-700">Share Learning Resource Link</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Metabolic pathways lecture guide"
                            value={newResourceTitle}
                            onChange={(e) => setNewResourceTitle(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Resource URL (optional)</label>
                          <input
                            type="url"
                            placeholder="e.g. https://example.com/slide_deck.pdf"
                            value={newResourceUrl}
                            onChange={(e) => setNewResourceUrl(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Resource Category</label>
                          <select
                            value={newResourceType}
                            onChange={(e) => setNewResourceType(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none cursor-pointer"
                          >
                            <option value="document">Lecture Document 📄</option>
                            <option value="link">Reference Website 🔗</option>
                            <option value="syllabus">Syllabus Guide 🗓️</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Brief Synopsis</label>
                          <input
                            type="text"
                            placeholder="Brief guidance for students reading this..."
                            value={newResourceDesc}
                            onChange={(e) => setNewResourceDesc(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddResource(false)}
                          className="text-[10px] font-bold text-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="text-[10px] bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg"
                        >
                          Confirm & Post Resource
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Resources List Directory */}
                  <div className="space-y-3">
                    {resources.filter(r => r.classroomId === selectedClassroomId).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">No shared materials uploaded for this course yet.</p>
                    ) : (
                      resources.filter(r => r.classroomId === selectedClassroomId).map((res) => (
                        <div key={res.id} className="p-4 bg-slate-50 border border-gray-150 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-100/50 transition-all">
                          <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase tracking-widest bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                              {res.type}
                            </span>
                            <h5 className="font-bold text-xs text-gray-950 mt-1">{res.title}</h5>
                            <p className="text-xs text-gray-400 leading-relaxed font-semibold">{res.description}</p>
                            <p className="text-[9px] text-gray-400 font-bold">Shared at: {res.sharedAt}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {res.url && (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white hover:bg-indigo-50 border border-gray-200 text-gray-700 hover:text-indigo-600 font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                              >
                                View File
                              </a>
                            )}
                            {role === "teacher" && (
                              <button
                                onClick={() => handleDeleteResource(res.id)}
                                className="text-gray-400 hover:text-rose-600 p-1 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DISCUSSION & QUESTION FORUM */}
              {classroomTab === "discussions" && (
                <div className="bg-white p-5 border border-gray-150 rounded-2xl space-y-5 shadow-3xs text-left" id="discussions-tab-panel">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-indigo-500" />
                        Class Discussions & Q&A Forum
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Post study queries, peer responses, or invoke AI study assistance.</p>
                    </div>

                    <button
                      onClick={() => setShowAddThread(!showAddThread)}
                      className="text-xs bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
                    >
                      <Plus className="h-3 w-3" /> Start Discussion
                    </button>
                  </div>

                  {/* Create Thread Form */}
                  {showAddThread && (
                    <form onSubmit={handleAddThread} className="p-4 bg-slate-50 border border-gray-150 rounded-xl space-y-3 animate-fade-in">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-700">Publish New Q&A Question</p>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Need clarification on citric acid oxidation"
                        value={newThreadTitle}
                        onChange={(e) => setNewThreadTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                      />
                      <textarea
                        required
                        placeholder="Provide details about your query..."
                        value={newThreadContent}
                        onChange={(e) => setNewThreadContent(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddThread(false)}
                          className="text-[10px] font-bold text-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="text-[10px] bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg"
                        >
                          Confirm & Broadcast
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Threads & Replies List */}
                  <div className="space-y-6">
                    {threads.filter(t => t.classroomId === selectedClassroomId).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">No discussions active in this course yet. Be the first to post!</p>
                    ) : (
                      threads.filter(t => t.classroomId === selectedClassroomId).map((thread) => (
                        <div key={thread.id} className="p-4 border border-gray-150 rounded-2xl space-y-4 shadow-3xs hover:border-gray-300 transition-all text-left">
                          
                          {/* Thread header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                              <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-lg shadow-sm border">
                                {thread.authorAvatar}
                              </span>
                              <div>
                                <h5 className="font-bold text-xs text-gray-900 leading-tight">{thread.title}</h5>
                                <p className="text-[9px] text-gray-400 font-bold">Posted by {thread.authorDisplayName} • {thread.createdAt}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAskAITutor(thread.id, thread.title, thread.content)}
                              className="text-[9px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                              title="Generate an automated explanation from StudyMate AI"
                            >
                              <Sparkles className="h-3 w-3 text-indigo-500 fill-indigo-200" /> Ask AI Tutor
                            </button>
                          </div>

                          {/* Thread content body */}
                          <p className="text-xs text-gray-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-gray-100">
                            {thread.content}
                          </p>

                          {/* Replies sub-section */}
                          <div className="space-y-2 pl-4 border-l-2 border-indigo-100">
                            {thread.replies.map((reply) => (
                              <div key={reply.id} className="bg-slate-50/50 p-3 rounded-xl border border-gray-50 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">{reply.authorAvatar}</span>
                                  <span className="font-bold text-[10px] text-gray-900">{reply.authorDisplayName}</span>
                                  {reply.authorDisplayName.includes("AI Tutor") && (
                                    <span className="text-[7px] bg-indigo-600 text-white px-1 py-0.5 rounded font-black uppercase tracking-wider">Official AI</span>
                                  )}
                                  <span className="text-[8px] text-gray-400 font-medium ml-auto">{reply.date}</span>
                                </div>
                                <p className="text-xs text-gray-600 font-medium whitespace-pre-line leading-relaxed">{reply.content}</p>
                              </div>
                            ))}
                          </div>

                          {/* Post Reply inline form */}
                          <div className="flex gap-2 pt-2">
                            <input
                              type="text"
                              placeholder="Type a helpful explanation or answer..."
                              value={newReplyTexts[thread.id] || ""}
                              onChange={(e) => setNewReplyTexts(prev => ({ ...prev, [thread.id]: e.target.value }))}
                              className="bg-gray-50 border border-gray-150 focus:bg-white focus:border-indigo-400 rounded-xl text-xs px-3 py-2 outline-none flex-1 font-medium transition-all"
                            />
                            <button
                              onClick={() => handleAddReply(thread.id)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider transition-all"
                            >
                              Reply
                            </button>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-16 border border-gray-150 rounded-2xl text-center space-y-4 shadow-3xs">
              <School className="h-12 w-12 text-indigo-300 mx-auto" />
              <div>
                <h4 className="font-black text-gray-900 text-lg">No Classroom Selected</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                  Select a class from the left sidebar panel to view curriculum assignments, student progress trackers, and monitoring data.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
