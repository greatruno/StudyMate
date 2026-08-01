import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  User,
  Mail,
  Lock,
  Check,
  ArrowRight,
  Shield,
  Coins,
  Globe,
  Users,
  TrendingUp,
  FileText,
  Brain,
  Award,
  Activity,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  Sparkle,
  Menu,
  X
} from "lucide-react";
import { UserAccount } from "../types";
import { PRECOMPILED_DOCUMENTS } from "../presets_data";

interface AuthPortalProps {
  onLoginSuccess: (user: UserAccount) => void;
}

const AVATAR_OPTIONS = ["🎓", "🧠", "🔬", "🔭", "🎨", "✍️", "💻", "🧬", "📚", "🦁", "🦊", "🦉"];
const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "First Class", "Distinction", "Pass"];
const ROLE_OPTIONS = [
  { value: "student", label: "Student Learner", desc: "Gain conceptual Socratic tutoring, generate quizzes, and master active recall deck builders." },
  { value: "teacher", label: "Educator / Lecturer", desc: "Create classroom rosters, issue reading outlines, track learning progress, and review analytics." },
  { value: "admin", label: "School Administrator", desc: "Manage institutional safety policies, audit AI usage logs, enforce zero telemetry training data." }
];
const FOCUS_OPTIONS = ["Science & Medicine", "Technology & Coding", "Mathematics & Quant", "Humanities & History", "Business & Economics", "General Academics"];

const ACADEMIC_CATEGORIES: Record<string, string[]> = {
  "Science": ["Biology", "Chemistry", "Physics", "Environmental Science", "Astronomy", "Geology"],
  "Technology": ["Information Technology", "Cybersecurity", "Data Science", "Web Development", "Artificial Intelligence", "Robotics"],
  "Engineering": ["Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Chemical Engineering", "Aerospace Engineering", "Biomedical Engineering"],
  "Mathematics": ["Algebra", "Calculus", "Statistics", "Geometry", "Discrete Mathematics", "Pure Mathematics"],
  "Medicine & Health": ["Nursing", "General Medicine", "Pharmacology", "Public Health", "Dentistry", "Physical Therapy"],
  "Business & Finance": ["Accounting", "Corporate Finance", "Marketing", "Management", "Entrepreneurship", "Economics"],
  "Law": ["Criminal Law", "Corporate Law", "International Law", "Constitutional Law", "Environmental Law", "Human Rights Law"],
  "Arts & Humanities": ["History", "Philosophy", "English Literature", "Art History", "Musicology", "Archaeology"],
  "Education": ["Elementary Education", "Secondary Education", "Special Education", "Curriculum Design", "Higher Education", "Educational Technology"],
  "Computing": ["Computer Science", "Software Engineering", "Algorithms", "Database Systems", "Computer Networks", "Human-Computer Interaction"],
  "Social Sciences": ["Psychology", "Sociology", "Anthropology", "Political Science", "Human Geography", "Criminology"],
  "Religion & Theology": ["Comparative Religion", "Biblical Studies", "Islamic Studies", "Theology & Ethics", "Philosophy of Religion"],
  "Languages": ["Linguistics", "Spanish Language", "French Language", "Mandarin Chinese", "German Language", "English as a Second Language"],
  "Creative Fields": ["Graphic Design", "Creative Writing", "Film & Media", "Fine Arts", "Architecture", "Photography"],
  "Skilled Trades": ["Automotive Technology", "Electrical Apprenticeship", "Carpentry", "Plumbing", "Culinary Arts", "Welding"]
};

export default function AuthPortal({ onLoginSuccess }: AuthPortalProps) {
  // Navigation & Screen States
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Registration / Onboarding Steps
  const [onboardingStep, setOnboardingStep] = useState(1); // 1: Credentials, 2: Academic Role & Persona, 3: Study Goals

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🎓");
  const [targetGrade, setTargetGrade] = useState("A+");
  const [studyGoalHours, setStudyGoalHours] = useState(5);
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "admin">("student");
  const [selectedFocus, setSelectedFocus] = useState("Science & Medicine");
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium" | "institution">("free");
  
  // Custom Academic Profile Builder states
  const [academicCategory, setAcademicCategory] = useState("Science");
  const [primaryField, setPrimaryField] = useState("Biology");
  const [customField, setCustomField] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [preferredLearningStyle, setPreferredLearningStyle] = useState<"Visual" | "Reading/Writing" | "Practical" | "Mixed">("Mixed");
  const [learningGoals, setLearningGoals] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fallback DB seeding/retrieval for offline robustness
  const getUsersDB = (): Record<string, UserAccount> => {
    try {
      const data = localStorage.getItem("studymate_users_v1");
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const saveUsersDB = (db: Record<string, UserAccount>) => {
    localStorage.setItem("studymate_users_v1", JSON.stringify(db));
  };

  const seedDemoUser = () => {
    const db = getUsersDB();
    if (!db["guest"]) {
      const demoUser: UserAccount = {
        id: "user_guest",
        username: "guest",
        email: "demo@studymate.edu",
        passwordHash: "password",
        displayName: "Sarah Jenkins",
        avatarEmoji: "🦉",
        targetGrade: "A+",
        studyGoalHours: 6,
        role: "student",
        subscription: "free",
        documents: PRECOMPILED_DOCUMENTS,
        academicProfile: {
          role: "student",
          academicCategory: "Computing",
          primaryField: "Computer Science",
          learningGoals: "Excel in final exams and build conceptual frameworks for advanced systems design.",
          experienceLevel: "Intermediate",
          preferredLearningStyle: "Mixed"
        },
        stats: {
          documentsCount: PRECOMPILED_DOCUMENTS.length,
          quizzesTakenCount: 4,
          averageQuizScore: 85,
          flashcardsMasteredCount: 12,
          studyTimeMinutes: 135,
          dailyStreak: 4,
          weeklyProgress: [
            { day: "Mon", minutes: 30 },
            { day: "Tue", minutes: 45 },
            { day: "Wed", minutes: 15 },
            { day: "Thu", minutes: 0 },
            { day: "Fri", minutes: 45 },
            { day: "Sat", minutes: 0 },
            { day: "Sun", minutes: 0 }
          ],
          achievements: [
            {
              id: "first_upload",
              title: "Knowledge Collector",
              description: "Uploaded your first set of lecture notes or textbook chapters.",
              unlocked: true,
              unlockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              iconName: "FileUp"
            },
            {
              id: "quiz_champion",
              title: "Quiz Crusader",
              description: "Scored 100% on any generated conceptual quiz.",
              unlocked: true,
              unlockedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
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
              unlocked: true,
              unlockedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              iconName: "Flame"
            }
          ]
        },
        chatHistories: {}
      };
      db["guest"] = demoUser;
      saveUsersDB(db);
    }
    return db["guest"];
  };

  // True Server API: handle login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    const normUsername = username.trim().toLowerCase();
    if (!normUsername || !password) {
      setErrorMsg("Please provide both your registered username/email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: normUsername, password })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Authentication failed.");
      }

      const verifiedUser: UserAccount = await response.json();
      
      // Sync browser session local cache
      localStorage.setItem("studymate_active_user_v1", JSON.stringify(verifiedUser));
      const db = getUsersDB();
      db[verifiedUser.username] = verifiedUser;
      saveUsersDB(db);

      setSuccessMsg("Logged in successfully! Provisioning study desk...");
      setTimeout(() => {
        onLoginSuccess(verifiedUser);
      }, 700);

    } catch (err: any) {
      console.warn("Server login error, falling back to local database...", err);
      // Fallback local lookup
      const db = getUsersDB();
      let foundLocal: UserAccount | null = null;
      if (db[normUsername] && db[normUsername].passwordHash === password) {
        foundLocal = db[normUsername];
      } else {
        const userList = Object.values(db);
        const matched = userList.find(u => u.email.toLowerCase() === normUsername && u.passwordHash === password);
        if (matched) foundLocal = matched;
      }

      if (foundLocal) {
        setSuccessMsg("Offline Authentication successful. Accessing local dashboard cache...");
        localStorage.setItem("studymate_active_user_v1", JSON.stringify(foundLocal));
        setTimeout(() => {
          onLoginSuccess(foundLocal!);
        }, 800);
      } else {
        setErrorMsg(err.message || "Invalid credentials. Try using 'guest' and 'password'!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // True Server API: register new account
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    const normUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!normUsername || !email.trim() || !password) {
      setErrorMsg("Required username, email, and password credentials are missing.");
      setIsLoading(false);
      return;
    }

    const profilePayload = {
      role: selectedRole,
      academicCategory,
      primaryField,
      customField: primaryField === "Other" ? customField.trim() : undefined,
      learningGoals: learningGoals.trim(),
      experienceLevel,
      preferredLearningStyle
    };

    try {
      // 1. Submit registration to Node Server user database
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: normUsername,
          email: email.trim().toLowerCase(),
          password,
          displayName: displayName.trim() || username.trim(),
          avatarEmoji,
          targetGrade,
          studyGoalHours,
          role: selectedRole,
          subscription: selectedPlan,
          focus: primaryField === "Other" ? customField.trim() : primaryField,
          academicProfile: profilePayload
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Could not register new profile on server.");
      }

      const createdUser: UserAccount = await response.json();
      
      // Initialize with empty documents as per study discipline onboarding guidelines
      createdUser.documents = [];
      createdUser.stats.documentsCount = 0;
      
      // Update browser local storage
      localStorage.setItem("studymate_active_user_v1", JSON.stringify(createdUser));
      const db = getUsersDB();
      db[createdUser.username] = createdUser;
      saveUsersDB(db);

      setSuccessMsg("Account provisioned on secure servers! Launching StudyMate workspace...");
      setTimeout(() => {
        onLoginSuccess(createdUser);
      }, 900);

    } catch (err: any) {
      console.warn("Server register fallback to local database...", err);
      // Fallback local registration
      const db = getUsersDB();
      if (db[normUsername]) {
        setErrorMsg("Username is already taken locally.");
        setIsLoading(false);
        return;
      }

      const newUser: UserAccount = {
        id: "user_" + Date.now(),
        username: normUsername,
        email: email.trim().toLowerCase(),
        passwordHash: password,
        displayName: displayName.trim() || username.trim(),
        avatarEmoji,
        targetGrade,
        studyGoalHours,
        role: selectedRole,
        subscription: selectedPlan,
        documents: [],
        academicProfile: profilePayload,
        stats: {
          documentsCount: 0,
          quizzesTakenCount: 0,
          averageQuizScore: 0,
          flashcardsMasteredCount: 0,
          studyTimeMinutes: 0,
          dailyStreak: 1,
          weeklyProgress: [
            { day: "Mon", minutes: 0 }, { day: "Tue", minutes: 0 }, { day: "Wed", minutes: 0 },
            { day: "Thu", minutes: 0 }, { day: "Fri", minutes: 0 }, { day: "Sat", minutes: 0 }, { day: "Sun", minutes: 0 }
          ],
          achievements: []
        },
        chatHistories: {}
      };

      db[normUsername] = newUser;
      saveUsersDB(db);
      localStorage.setItem("studymate_active_user_v1", JSON.stringify(newUser));

      setSuccessMsg("Local offline account set up. Directing to workspace...");
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 950);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = seedDemoUser();
    setSuccessMsg("Entering workspace with Demo Account. Loading analytics charts...");
    setTimeout(() => {
      onLoginSuccess(demoUser);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white" id="auth-portal-landing">
      
      {/* 1. Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900 z-50">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setShowAuthForm(false); setMobileMenuOpen(false); }}>
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            StudyMate
          </span>
          <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
            Learning Platform
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
          <a href="#features" onClick={() => setShowAuthForm(false)} className="hover:text-white transition-colors">Features</a>
          <a href="#monetization" onClick={() => setShowAuthForm(false)} className="hover:text-white transition-colors">Pricing Plans</a>
          <a href="#security" onClick={() => setShowAuthForm(false)} className="hover:text-white transition-colors">Security & Privacy</a>
          <a href="#stats" onClick={() => setShowAuthForm(false)} className="hover:text-white transition-colors">Live Stats</a>
        </nav>

        {/* Action buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => {
              setIsSignUp(false);
              setShowAuthForm(true);
            }}
            className="text-xs font-bold text-slate-200 hover:text-white px-3 py-2 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setOnboardingStep(1);
              setShowAuthForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/15"
          >
            Register Account
          </button>
        </div>

        {/* Mobile Hamburger Menu Icon */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-200 hover:text-white p-2 focus:outline-none transition-all cursor-pointer"
            id="mobile-menu-toggle"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-900 px-6 py-4 space-y-4 animate-fade-in z-40">
          <nav className="flex flex-col gap-3 text-sm font-bold text-slate-400">
            <a 
              href="#features" 
              onClick={() => { setShowAuthForm(false); setMobileMenuOpen(false); }} 
              className="hover:text-white transition-colors py-1"
            >
              Features
            </a>
            <a 
              href="#monetization" 
              onClick={() => { setShowAuthForm(false); setMobileMenuOpen(false); }} 
              className="hover:text-white transition-colors py-1"
            >
              Pricing Plans
            </a>
            <a 
              href="#security" 
              onClick={() => { setShowAuthForm(false); setMobileMenuOpen(false); }} 
              className="hover:text-white transition-colors py-1"
            >
              Security & Privacy
            </a>
            <a 
              href="#stats" 
              onClick={() => { setShowAuthForm(false); setMobileMenuOpen(false); }} 
              className="hover:text-white transition-colors py-1"
            >
              Live Stats
            </a>
          </nav>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
            <button
              onClick={() => {
                setIsSignUp(false);
                setShowAuthForm(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-850 rounded-xl transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setOnboardingStep(1);
                setShowAuthForm(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
            >
              Register Account
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Content Area */}
      <main className="flex-grow flex items-center justify-center relative overflow-hidden">
        
        {/* Abstract Glowing Gradients in Background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

        {!showAuthForm ? (
          /* ================= SAAS LANDING PAGE ================= */
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-24 z-10 animate-fade-in">
            
            {/* HERO SECTION */}
            <div className="text-center w-full max-w-3xl mx-auto space-y-6 pt-6 px-2 sm:px-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10.5px] font-black tracking-widest uppercase">
                <Sparkle className="h-3 w-3 animate-spin" /> Next-Generation Academy Engine
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08]">
                Go Beyond AI Chatboxes.<br/>
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
                  Master Any Syllabus.
                </span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                StudyMate synthesizes textbook chapters, research drafts, and course materials into structured conceptual summaries, active recall flashcards, and adaptive, self-improving exams.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full">
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setOnboardingStep(1);
                    setShowAuthForm(true);
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Build Free Study Room</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleDemoLogin}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs tracking-wider uppercase rounded-2xl transition-all border border-slate-800 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Evaluate Instantly</span>
                  <Award className="h-4 w-4 text-emerald-400" />
                </button>
              </div>

              {/* Core numbers showcase */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10" id="stats">
                {[
                  { value: "450K+", label: "Courses Synthesized" },
                  { value: "1.2M+", label: "Flashcards Created" },
                  { value: "98.8%", label: "Academic Accuracy" },
                  { value: "Zero", label: "Telemetry Tracking" }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/60 border border-slate-850 p-4.5 rounded-2xl">
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* BENTO PRODUCT GRID */}
            <div id="features" className="space-y-8">
              <div className="text-center space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">PRODUCT PORTFOLIO</p>
                <h2 className="text-2xl md:text-3xl font-black text-white">Commercial-Grade Architecture</h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">Engineered to support secure institutional diagnostics, unified advisor systems, and private file hierarchies.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Brain,
                    title: "Specialist Agents",
                    desc: "Toggle seamlessly between Learning Tutor (Analogies), Research Assistant (APA citations), Exam Coach, and Career Guide personas with unified thread retention.",
                    badge: "Multi-Role"
                  },
                  {
                    icon: Shield,
                    title: "Academic Integrity Shield",
                    desc: "Scan document originality against reference publications, receive constructive plagiarism remedies, and generate publication-ready MLA/Chicago citations.",
                    badge: "Security"
                  },
                  {
                    icon: Users,
                    title: "Institutional Diagnostics",
                    desc: "Instructors manage cohorts, track aggregated course averages, identify curriculum conceptual gaps, and dispatch structured assignments.",
                    badge: "Enterprise"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-850 p-6.5 rounded-2xl relative overflow-hidden group hover:border-slate-750 transition-colors">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="absolute top-4 right-4 text-[9px] font-black tracking-wider uppercase text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full bg-slate-950">
                      {item.badge}
                    </span>
                    <h3 className="text-base font-extrabold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* MONETIZATION COMPARE CARDS */}
            <div id="monetization" className="space-y-8">
              <div className="text-center space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest font-mono">FINANCIAL TIERS</p>
                <h2 className="text-2xl md:text-3xl font-black text-white">Choose Your Plan</h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">Get started for free or unlock elite, institutional-grade tutoring resources.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* FREE */}
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Free Tier</span>
                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-500">Starter</span>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-white">$0</span>
                      <span className="text-xs text-slate-500"> / Free Forever</span>
                    </div>
                    <p className="text-xs text-slate-400">Evaluate basic tools with 3 files upload limits and basic study guides.</p>
                    <ul className="space-y-2 pt-4 text-[11px] text-slate-400">
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Max 3 document compilations</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> General Socratic Tutor access</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Standard interactive quiz formats</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlan("free");
                      setIsSignUp(true);
                      setOnboardingStep(1);
                      setShowAuthForm(true);
                    }}
                    className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-extrabold text-xs rounded-xl transition-all"
                  >
                    Select Free Starter
                  </button>
                </div>

                {/* PREMIUM */}
                <div className="bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-950 border-2 border-indigo-500 p-6 rounded-2xl flex flex-col justify-between relative shadow-xl shadow-indigo-600/5">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-widest rounded-full">
                    RECOMMENDED
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-400">Premium Plan</span>
                      <span className="text-[9px] uppercase font-black tracking-widest text-indigo-300">Elite Student</span>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-white">$12</span>
                      <span className="text-xs text-slate-400"> / monthly billing</span>
                    </div>
                    <p className="text-xs text-slate-300">Unlock absolute conceptual mastery with unlimited AI processing and original drafts.</p>
                    <ul className="space-y-2 pt-4 text-[11px] text-slate-300">
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> **Unlimited** document compiles</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> All **4 Specialist Agents** enabled</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> Full Plagiarism scan & citation generator</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" /> Advanced weekly schedules & tracking</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlan("premium");
                      setIsSignUp(true);
                      setOnboardingStep(1);
                      setShowAuthForm(true);
                    }}
                    className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
                  >
                    Upgrade to Premium Elite
                  </button>
                </div>

                {/* INSTITUTIONAL */}
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">Institutional Plan</span>
                      <span className="text-[9px] uppercase font-black tracking-widest text-emerald-500">School / Enterprise</span>
                    </div>
                    <div>
                      <span className="text-3xl font-black text-white">$149</span>
                      <span className="text-xs text-slate-500"> / monthly admin</span>
                    </div>
                    <p className="text-xs text-slate-400">Empower full departments with safe academic integrations and student progress analytics.</p>
                    <ul className="space-y-2 pt-4 text-[11px] text-slate-400">
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Roster student imports (up to 100)</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Classroom summaries & assignments builder</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Zero LLM model training guarantees</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Custom cohort diagnostic visualizers</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlan("institution");
                      setIsSignUp(true);
                      setOnboardingStep(1);
                      setShowAuthForm(true);
                    }}
                    className="w-full mt-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all"
                  >
                    Select Institution Enterprise
                  </button>
                </div>
              </div>
            </div>

            {/* SECURITY ASSURANCES */}
            <div id="security" className="bg-slate-900/40 border border-slate-850 rounded-3xl p-8 lg:p-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Shield className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xl font-black text-white">Your Intellectual Property is Locked.</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  StudyMate enforces bank-grade data security protocols. None of your submitted notes, essays, drafts, or quizzes are shared, cached in public databases, or used to train third-party machine learning models.
                </p>
              </div>
              <div className="shrink-0 flex flex-wrap gap-3">
                <span className="text-[10px] uppercase font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-indigo-400" /> AES-256 Encrypted
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-indigo-400" /> FERPA Compliant
                </span>
              </div>
            </div>

          </div>
        ) : (
          /* ================= INTERACTIVE AUTH & STEP-BY-STEP ONBOARDING ================= */
          <div className="w-full max-w-5xl px-6 py-12 z-10 animate-fade-in" id="auth-panel-wrapper">
            <div className="bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
              
              {/* Branding Sidebar Info */}
              <div className="md:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-950 p-8 sm:p-10 text-slate-200 flex flex-col justify-between relative overflow-hidden border-r border-slate-850">
                <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-8">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowAuthForm(false)}>
                    <div className="p-2 bg-indigo-600 rounded-xl text-white">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-white">StudyMate</span>
                  </div>

                  {isSignUp ? (
                    <div className="space-y-4">
                      <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 font-mono">STEP-BY-STEP ONBOARDING</span>
                      <h2 className="text-xl font-extrabold text-white">Personalizing Your Academy Workspace</h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        To optimize conceptual tutoring limits and map relevant industry opportunities, fill out your onboarding guidelines.
                      </p>

                      {/* Onboarding steps progress indicator */}
                      <div className="flex items-center gap-2 pt-4">
                        {[1, 2, 3].map((step) => (
                          <div key={step} className="flex-1 flex flex-col gap-1.5">
                            <div className={`h-1.5 rounded-full transition-all ${
                              onboardingStep >= step ? "bg-indigo-500" : "bg-slate-800"
                            }`} />
                            <span className="text-[9px] font-bold text-slate-500">Step {step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400">SECURE LOGIN PROVISION</span>
                      <h2 className="text-xl font-extrabold text-white">Access Your Workspace</h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Sync your study logs, retrieve customized lesson plans, and resume chatbot sessions directly backed by production storage vaults.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t border-slate-850/80 space-y-3">
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                    <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Real-time Secure Server Database</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                    <Globe className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Offline-Ready Synchronization</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Forms Column */}
              <div className="md:col-span-7 p-8 sm:p-10 bg-slate-900/60 flex flex-col justify-center">
                <div className="max-w-md w-full mx-auto space-y-6">
                  
                  {/* Title Headers */}
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white">
                      {isSignUp ? `Academic Setup (Step ${onboardingStep} of 3)` : "Welcome back!"}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {isSignUp 
                        ? "Configure custom academic limits & roles." 
                        : "Sign in to launch your personal StudyMate study desk."}
                    </p>
                  </div>

                  {/* Feedback notifications */}
                  {errorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 animate-ping" />
                      <p>{errorMsg}</p>
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                      <p>{successMsg}</p>
                    </div>
                  )}

                  {/* 1. LOGIN FORM */}
                  {!isSignUp && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Username or Registered Email</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. guest or standard_student"
                            className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5"
                      >
                        {isLoading ? "Validating Account..." : "Sign In to Academy"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  )}

                  {/* 2. STEP-BY-STEP SIGNUP & ONBOARDING */}
                  {isSignUp && (
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-5 animate-fade-in">
                      
                      {/* STEP 1: Basic Credentials */}
                      {onboardingStep === 1 && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Username</label>
                            <input
                              type="text"
                              required
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="Choose alphanumeric username"
                              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address</label>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. sarah@academy.edu"
                              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Password</label>
                            <input
                              type="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="At least 5 characters"
                              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={!username || !email || !password}
                            onClick={() => setOnboardingStep(2)}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1"
                          >
                            <span>Next: Academic Profile</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {/* STEP 2: Academic Role, Persona & Focus Selection */}
                      {onboardingStep === 2 && (
                        <div className="space-y-4 animate-fade-in text-left">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Choose Academic Role</label>
                            <div className="flex flex-col gap-2">
                              {ROLE_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setSelectedRole(opt.value as any)}
                                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 ${
                                    selectedRole === opt.value
                                      ? "bg-indigo-600/10 border-indigo-500"
                                      : "bg-slate-950 border-slate-850 hover:bg-slate-900"
                                  }`}
                                >
                                  <span className="text-xs font-extrabold text-white">{opt.label}</span>
                                  <span className="text-[10px] text-slate-400 leading-normal">{opt.desc}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Academic Category</label>
                            <select
                              value={academicCategory}
                              onChange={(e) => {
                                const cat = e.target.value;
                                setAcademicCategory(cat);
                                if (cat && ACADEMIC_CATEGORIES[cat]) {
                                  setPrimaryField(ACADEMIC_CATEGORIES[cat][0]);
                                }
                              }}
                              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none cursor-pointer focus:border-indigo-500 transition-all"
                            >
                              {Object.keys(ACADEMIC_CATEGORIES).map((cat) => (
                                <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Primary Field / Discipline</label>
                            <select
                              value={primaryField}
                              onChange={(e) => setPrimaryField(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none cursor-pointer focus:border-indigo-500 transition-all"
                            >
                              {(ACADEMIC_CATEGORIES[academicCategory] || []).map((field) => (
                                <option key={field} value={field} className="bg-slate-950">{field}</option>
                              ))}
                              <option value="Other" className="bg-slate-950">Other / Not Listed</option>
                            </select>
                          </div>

                          {primaryField === "Other" && (
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Please specify your field of study or profession</label>
                              <input
                                type="text"
                                value={customField}
                                onChange={(e) => setCustomField(e.target.value)}
                                placeholder="e.g. Space Medicine, Astrobiology..."
                                className="w-full px-4 py-3 bg-slate-950 border border-indigo-900/60 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                                required
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Experience Level</label>
                              <select
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value as any)}
                                className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
                              >
                                <option value="Beginner">Beginner / Novice</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced / Expert</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Learning Style</label>
                              <select
                                value={preferredLearningStyle}
                                onChange={(e) => setPreferredLearningStyle(e.target.value as any)}
                                className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
                              >
                                <option value="Visual">Visual (Charts, Slides)</option>
                                <option value="Reading/Writing">Reading & Writing (Notes, Guides)</option>
                                <option value="Practical">Practical (Coding, Formulas)</option>
                                <option value="Mixed">Mixed (Balanced Multi-modal)</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setOnboardingStep(1)}
                              className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl"
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              onClick={() => setOnboardingStep(3)}
                              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                            >
                              <span>Next: Goals</span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: Learning Goals, Avatar & Confirm Subscription */}
                      {onboardingStep === 3 && (
                        <div className="space-y-4 animate-fade-in text-left">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Primary Learning Goals</label>
                            <textarea
                              value={learningGoals}
                              onChange={(e) => setLearningGoals(e.target.value)}
                              placeholder="e.g. Master core foundations, prepare for final tests, or review key terminology."
                              rows={2}
                              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold resize-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Display Name / Nickname</label>
                            <input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="e.g. Sarah Jenkins"
                              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Target Grade Goal</label>
                              <select
                                value={targetGrade}
                                onChange={(e) => setTargetGrade(e.target.value)}
                                className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
                              >
                                {GRADE_OPTIONS.map((g) => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Weekly Study Target</label>
                              <input
                                type="number"
                                min="1"
                                max="168"
                                value={studyGoalHours}
                                onChange={(e) => setStudyGoalHours(parseInt(e.target.value) || 5)}
                                className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none transition-all font-semibold"
                              />
                            </div>
                          </div>

                          {/* Avatar picker */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Choose Avatar</label>
                            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 border border-slate-850 rounded-xl">
                              {AVATAR_OPTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => setAvatarEmoji(emoji)}
                                  className={`h-8 w-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                                    avatarEmoji === emoji
                                      ? "bg-indigo-600 scale-110 text-white shadow"
                                      : "hover:bg-slate-900"
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Selected Plan Display */}
                          <div className="bg-indigo-950/20 border border-indigo-900/35 p-3 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <p className="font-extrabold text-white">Plan Selected: {selectedPlan.toUpperCase()}</p>
                              <p className="text-[10px] text-indigo-400">Can be simulated upgraded anytime inside.</p>
                            </div>
                            <span className="text-[9.5px] uppercase font-black bg-indigo-600 text-white px-2.5 py-1 rounded-lg">
                              {selectedPlan === "free" ? "Starter Free" : selectedPlan === "premium" ? "Elite Premium" : "School Admin"}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setOnboardingStep(2)}
                              className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl"
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              onClick={handleSignUpSubmit}
                              disabled={isLoading}
                              className="flex-grow-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                            >
                              {isLoading ? "Provisioning Workspace..." : "Register & Enter StudyMate"}
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                    </form>
                  )}

                  {/* Toggle Sign Up / Sign In mode */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg("");
                        setSuccessMsg("");
                        setIsSignUp(!isSignUp);
                        setOnboardingStep(1);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-all"
                    >
                      {isSignUp
                        ? "Already have an account? Sign In"
                        : "Don't have an account? Complete Onboarding"}
                    </button>
                  </div>

                  {/* OR separator */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">OR EVALUATE DEMO</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  {/* Demo Login Button */}
                  <button
                    onClick={handleDemoLogin}
                    className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-200 rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center gap-2 group overflow-hidden relative"
                    type="button"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                    <span>Launch Instantly as Guest (Evaluator Demo)</span>
                    <span className="text-[8px] uppercase font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-md">Guest</span>
                  </button>

                  <div className="text-center text-[10px] text-slate-500 font-medium leading-relaxed">
                    *The Demo Evaluator account skips signups, immediately preloading sample syllabus notes, active recall flashcards, and live study analytics for evaluation.
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 3. Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 backdrop-blur-sm py-8 z-25">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p className="text-center md:text-left">© 2026 StudyMate Learning Platform. All Rights Reserved. Secure AES-256 Workspace.</p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto text-center sm:text-left">
            <a href="#features" onClick={() => setShowAuthForm(false)} className="hover:text-slate-300 py-1 sm:py-0">Features</a>
            <a href="#monetization" onClick={() => setShowAuthForm(false)} className="hover:text-slate-300 py-1 sm:py-0">Billing Tiers</a>
            <a href="#security" onClick={() => setShowAuthForm(false)} className="hover:text-slate-300 py-1 sm:py-0">Privacy Safeguard</a>
            <button onClick={() => setShowAuthForm(!showAuthForm)} className="hover:text-slate-300 text-indigo-400 font-extrabold py-1 sm:py-0 cursor-pointer">
              {showAuthForm ? "Back to Homepage" : "Launch StudyMate Workspace"}
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
