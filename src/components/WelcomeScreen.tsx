import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Sparkles, 
  FileUp, 
  ArrowRight, 
  BookOpen, 
  Zap, 
  Loader2, 
  Brain, 
  Award, 
  Target, 
  Compass, 
  ChevronRight,
  BookOpenCheck,
  CheckCircle2,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import { DocumentItem, UserAccount } from "../types";

interface WelcomeScreenProps {
  currentUser: UserAccount;
  setDocuments: (docs: DocumentItem[]) => void;
  setSelectedDocId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  addStudyMinutes: (mins: number) => void;
}

interface WelcomeData {
  welcomeMessage: string;
  recommendedStarterTopics: { title: string; description: string; content: string }[];
  suggestedQuizzes: string[];
  learningPath: string[];
}

export default function WelcomeScreen({
  currentUser,
  setDocuments,
  setSelectedDocId,
  setActiveTab,
  addStudyMinutes
}: WelcomeScreenProps) {
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilingSubject, setCompilingSubject] = useState("");
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null);
  const [isLoadingWelcome, setIsLoadingWelcome] = useState(true);

  // Retrieve user field for fallback naming
  const getProfileField = () => {
    if (!currentUser || !currentUser.academicProfile) return "General Academics";
    const profile = currentUser.academicProfile;
    return profile.primaryField === "Other" 
      ? (profile.customField || "Custom Discipline") 
      : profile.primaryField;
  };

  useEffect(() => {
    const fetchWelcomePacket = async () => {
      setIsLoadingWelcome(true);
      try {
        const profilePayload = currentUser?.academicProfile || {
          role: currentUser?.role || "student",
          academicCategory: "Computing",
          primaryField: "Computer Science",
          learningGoals: "Master key definitions, perform active recall, and pass with distinction.",
          experienceLevel: "Intermediate",
          preferredLearningStyle: "Mixed"
        };

        const res = await fetch("/api/generate/academic-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: profilePayload,
            username: currentUser?.displayName || currentUser?.username || "Learner"
          })
        });

        if (res.ok) {
          const data = await res.json();
          setWelcomeData(data);
        } else {
          throw new Error("Could not construct welcome packets.");
        }
      } catch (err) {
        console.warn("Welcome packet generation failed, loading local fallback structure", err);
        const fieldName = getProfileField();
        
        setWelcomeData({
          welcomeMessage: `Welcome to StudyMate, ${currentUser?.displayName || currentUser?.username || "Learner"}! We have customized your academic workspace for ${fieldName}. Preparing your active learning path and memory tools...`,
          recommendedStarterTopics: [
            {
              title: `Foundations of ${fieldName}`,
              description: "A comprehensive introduction to core methodologies, definitions, and essential starting points.",
              content: `${fieldName} is a vital field of academic and professional practice. To master it, learners must focus on core terminologies, fundamental principles, and practical case applications. StudyMate will automatically organize your notes and structure active learning decks to make reviewing highly intuitive and efficient.`
            },
            {
              title: `Core Methodology & Theory of ${fieldName}`,
              description: "Explore the critical frameworks, analytical tools, and conceptual structures used by experts.",
              content: `Competency in ${fieldName} requires familiarity with its structural methods, theoretical frameworks, and research techniques. Actively recall these concepts with custom quizzes and electronic flashcards to translate theory into practical capability.`
            },
            {
              title: `Modern Trends & Future Directions`,
              description: `Understand the intersection of technology, modern data, and future trajectories in ${fieldName}.`,
              content: `Stay ahead by studying how artificial intelligence, cloud computation, and digital workflows are impacting ${fieldName}. Formulate structured goals to prepare yourself for real-world scenarios and advanced exam configurations.`
            }
          ],
          suggestedQuizzes: [
            `Mastery: Foundational ${fieldName}`,
            `Review: Key Methodologies in ${fieldName}`,
            `Applications: Real-world ${fieldName}`
          ],
          learningPath: [
            "Deconstruct core vocabulary and terminologies",
            "Establish fundamental conceptual schemas",
            "Apply practical theories to structured exercises",
            "Synthesize comprehensive active recall databases"
          ]
        });
      } finally {
        setIsLoadingWelcome(false);
      }
    };

    fetchWelcomePacket();
  }, [currentUser]);

  const handleQuickCompile = async (topic: { title: string; content: string }) => {
    setIsCompiling(true);
    setCompilingSubject(topic.title);
    setErrorMessage("");

    try {
      // Step 0: Index and parse content to get a document ID on the server
      setLoadingStep("0. Extracting and indexing text sections...");
      const parseRes = await fetch("/api/parse-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: topic.content,
          fileName: topic.title
        })
      });
      if (!parseRes.ok) throw new Error("Failed to index content");
      const parseData = await parseRes.json();
      const documentId = parseData.documentId;

      // Step 1: Summary Generation
      setLoadingStep("1. Decomposing topics and building Summary structure...");
      const summaryRes = await fetch("/api/generate/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, content: topic.content })
      });
      if (!summaryRes.ok) throw new Error(await summaryRes.text() || "Failed to generate summary");
      const summaryData = await summaryRes.json();

      // Step 2: Quiz Generation
      setLoadingStep("2. Drafting conceptual Multiple Choice Quizzes...");
      const quizRes = await fetch("/api/generate/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, content: topic.content })
      });
      if (!quizRes.ok) throw new Error("Failed to generate quizzes");
      const quizData = await quizRes.json();

      // Step 3: Flashcards Generation
      setLoadingStep("3. Engineering active-recall flashcard prompts...");
      const flashcardRes = await fetch("/api/generate/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, content: topic.content })
      });
      if (!flashcardRes.ok) throw new Error("Failed to generate flashcards");
      const flashcardData = await flashcardRes.json();

      // Create new document item
      const newDoc: DocumentItem = {
        id: documentId,
        title: topic.title,
        content: topic.content,
        uploadedAt: new Date().toISOString(),
        wordCount: topic.content.trim().split(/\s+/).length,
        summary: summaryData,
        quiz: quizData.questions,
        flashcards: flashcardData.flashcards
      };

      setDocuments([newDoc]);
      setSelectedDocId(newDoc.id);
      addStudyMinutes(15);
      setActiveTab("home");
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        error.message || "Failed to compile the study materials. Please verify your GEMINI_API_KEY connection."
      );
      setIsCompiling(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]" id="welcome-screen">
      {isCompiling ? (
        /* Compilation Loader overlay */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 text-white rounded-3xl p-8 lg:p-12 text-center border border-slate-800 shadow-xl max-w-xl w-full space-y-6 py-16"
        >
          <div className="relative flex justify-center">
            <div className="absolute inset-0 m-auto h-20 w-20 bg-indigo-500/20 rounded-full blur-xl" />
            <Loader2 className="h-14 w-14 text-indigo-400 animate-spin relative z-10" />
          </div>
          
          <div className="space-y-3">
            <h4 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              Compiling {compilingSubject}...
            </h4>
            <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest bg-indigo-950/50 border border-indigo-900/40 inline-block px-3 py-1 rounded-full">
              Powered by StudyMate
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-left max-w-md mx-auto space-y-2.5">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
              <p className="font-mono truncate">{loadingStep}</p>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              We are utilizing StudyMate's advanced reasoning models to analyze this tailored introduction, identify core concepts, generate study guides, draft quizzes, and prepare active flashcards.
            </p>
          </div>
        </motion.div>
      ) : (
        /* Standard General Welcome Screen */
        <div className="w-full space-y-8 lg:space-y-12 animate-fade-in text-left">
          
          {/* Header & Personal Greeting Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  StudyMate Workspace
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Hello, {currentUser?.displayName || currentUser?.username || "Learner"}
              </h2>

              {isLoadingWelcome ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  <span className="font-medium">Personalizing academic layout for {getProfileField()}...</span>
                </div>
              ) : (
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {welcomeData?.welcomeMessage}
                </p>
              )}
            </div>

            {/* Profile Overview Pill Grid */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-gray-150 min-w-[240px] space-y-2 shrink-0">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">AI Academic Profile</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 font-bold text-gray-700 truncate">
                  Role: <span className="text-indigo-600 capitalize">{currentUser?.academicProfile?.role || "Student"}</span>
                </div>
                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 font-bold text-gray-700 truncate">
                  Style: <span className="text-indigo-600 capitalize">{currentUser?.academicProfile?.preferredLearningStyle || "Mixed"}</span>
                </div>
                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 font-bold text-gray-700 truncate col-span-2">
                  Field: <span className="text-indigo-600">{getProfileField()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Personalization Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Hand Column: Direct File Upload Prominent Trigger */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="lg:col-span-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-lg flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />
              
              <div className="space-y-4 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                  <FileUp className="h-3 w-3" />
                  Your Study Material
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Compile Your Syllabus</h3>
                <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  Support for PDF, Word (.docx), Plain Text (.txt), and Markdown (.md). Upload your actual lecture slides, textbook notes, or research papers to unlock full AI summaries, custom multiple-choice quizzes, and recall flashcard decks.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("upload")}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 relative z-10 group"
              >
                Upload & Analyze Document
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Right Hand Column: Dynamic AI-Generated Study Starters */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-black text-gray-950 tracking-tight flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                    Recommended Study Starters
                  </h3>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Tailored introduction topics</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Get started immediately without uploading files. Select an AI-tailored study starter below. Our engine will instantly compile a mock study suite with a conceptual summary, active recall flashcards, and a generated test.
                </p>
              </div>

              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 leading-relaxed flex items-start gap-2 animate-shake">
                  <span className="font-bold">Error:</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
                {isLoadingWelcome ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 h-56 flex flex-col justify-between animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                        <div className="h-3 bg-gray-200 rounded-md w-1/2" />
                        <div className="h-12 bg-gray-200 rounded-md w-full" />
                      </div>
                      <div className="h-8 bg-gray-200 rounded-xl w-full" />
                    </div>
                  ))
                ) : (
                  welcomeData?.recommendedStarterTopics.map((topic, index) => {
                    const TopicIcon = index === 0 ? BookOpen : index === 1 ? Target : Compass;
                    const colors = [
                      "from-emerald-500 to-teal-600 bg-emerald-50 text-emerald-700",
                      "from-amber-500 to-orange-600 bg-amber-50 text-amber-700",
                      "from-indigo-500 to-violet-600 bg-indigo-50 text-indigo-700"
                    ];
                    return (
                      <motion.div
                        key={topic.title}
                        whileHover={{ y: -2 }}
                        className="bg-slate-50/70 hover:bg-white p-4.5 rounded-2xl border border-gray-150 hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between h-[252px] text-left group"
                      >
                        <div className="space-y-2.5">
                          <div className={`p-1.5 rounded-lg w-fit ${colors[index % 3]}`}>
                            <TopicIcon className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                              MODULE {index + 1}
                            </span>
                            <h4 className="text-xs font-black text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                              {topic.title}
                            </h4>
                          </div>
                          <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-4">
                            {topic.description}
                          </p>
                        </div>

                        <button
                          onClick={() => handleQuickCompile(topic)}
                          className="mt-3 w-full py-2 px-3 bg-white hover:bg-slate-900 hover:text-white border border-gray-200 hover:border-slate-900 text-gray-700 rounded-lg font-bold text-[9px] transition-all uppercase tracking-wider flex items-center justify-center gap-1 group-hover:border-indigo-200"
                        >
                          Instant Study
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Underbar: Goal Milestones & Pathway Tracker */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            {/* Learning Goals Checkers */}
            <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-indigo-600" />
                Target Practice Goals
              </h4>
              <div className="space-y-2.5">
                {isLoadingWelcome ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-50 rounded-lg animate-pulse" />
                  ))
                ) : (
                  welcomeData?.suggestedQuizzes.map((quiz, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-gray-100 text-[11px]">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-semibold text-gray-700 leading-snug">{quiz}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Custom Interactive Pathway Progression */}
            <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-indigo-600 animate-pulse" />
                Your Recommended Mastery Path
              </h4>
              
              <div className="relative pl-4 space-y-4 border-l-2 border-indigo-100 ml-2">
                {isLoadingWelcome ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-6 bg-gray-50 rounded-lg animate-pulse" />
                  ))
                ) : (
                  welcomeData?.learningPath.map((step, idx) => (
                    <div key={idx} className="relative text-[11px] font-sans">
                      <span className="absolute -left-[25px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 border border-indigo-200 text-[9px] font-bold text-indigo-700">
                        {idx + 1}
                      </span>
                      <p className="font-semibold text-gray-800 leading-normal">{step}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
