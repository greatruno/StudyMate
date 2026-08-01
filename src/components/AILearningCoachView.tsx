import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Sparkles,
  Award,
  BookOpen,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Map as MapIcon,
  Search,
  Volume2,
  Mic,
  VolumeX,
  Sliders,
  Network,
  ArrowRight,
  ArrowLeft,
  Send,
  Loader2,
  ThumbsUp,
  Layers,
  Check,
  HelpCircle,
  FileText,
  Info,
  Timer,
  ChevronRight,
  Zap
} from "lucide-react";
import { DocumentItem, UserAccount, StudyStats, QuizQuestion } from "../types";
import AIMemoryDashboard from "./documents/AIMemoryDashboard.js";
import UnifiedStudyWorkspace from "./documents/UnifiedStudyWorkspace.js";

interface AILearningCoachViewProps {
  documents: DocumentItem[];
  currentUser: UserAccount;
  onAddStatsReward: (points: number, rewardLabel: string) => void;
}

type SubTab = "study_tools" | "memory" | "coach" | "exam" | "course" | "roadmap" | "research" | "voice" | "graph" | "settings";

export default function AILearningCoachView({
  documents,
  currentUser,
  onAddStatsReward
}: AILearningCoachViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("study_tools");

  // Global Adaptive Learning State
  const [teachingPersona, setTeachingPersona] = useState<"mentor" | "peer" | "sergeant" | "professor">("mentor");
  const [academicDifficulty, setAcademicDifficulty] = useState<"beginner" | "intermediate" | "advanced" | "elite">("intermediate");

  // 1. AI Personal Learning Coach State
  const [coachInsights, setCoachInsights] = useState<any>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [coachError, setCoachError] = useState("");

  // 2. AI Exam Simulator State
  const [examSelectedDocId, setExamSelectedDocId] = useState<string>("");
  const [examDifficulty, setExamDifficulty] = useState<string>("intermediate");
  const [examLength, setExamLength] = useState<number>(5);
  const [examQuestionTypes, setExamQuestionTypes] = useState<string[]>(["mcq", "true_false"]);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [examQuestions, setExamQuestions] = useState<QuizQuestion[]>([]);
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<number, any>>({});
  const [examShortAnswers, setExamShortAnswers] = useState<Record<number, string>>({});
  const [isExamActive, setIsExamActive] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState(0);
  const [examScoreResult, setExamScoreResult] = useState<any>(null);
  const examTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 3. AI Course Generator State
  const [courseGoal, setCourseGoal] = useState("");
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<any>(null);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [courseLessonsCompleted, setCourseLessonsCompleted] = useState<Record<string, boolean>>({});
  const [courseQuizAnswers, setCourseQuizAnswers] = useState<Record<string, number>>({});
  const [courseQuizSubmitted, setCourseQuizSubmitted] = useState<Record<string, boolean>>({});
  const [courseQuizScore, setCourseQuizScore] = useState<Record<string, number>>({});

  // 4. Career Skill Roadmap State
  const [careerGoal, setCareerGoal] = useState("");
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any>(null);
  const [completedMilestones, setCompletedMilestones] = useState<Record<number, boolean>>({});
  const [completedSkills, setCompletedSkills] = useState<Record<string, boolean>>({});

  // 5. AI Research Assistant State
  const [researchSelectedDocId, setResearchSelectedDocId] = useState<string>("");
  const [isAnalyzingResearch, setIsAnalyzingResearch] = useState(false);
  const [researchAnalysis, setResearchAnalysis] = useState<any>(null);
  const [researchQAMessages, setResearchQAMessages] = useState<any[]>([]);
  const [researchInput, setResearchInput] = useState("");
  const [isAskingResearch, setIsAskingResearch] = useState(false);

  // 6. Voice Learning Mode State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceOrbState, setVoiceOrbState] = useState<"idle" | "listening" | "speaking">("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceResponseText, setVoiceResponseText] = useState("");
  const [voiceHistory, setVoiceHistory] = useState<{ role: "user" | "coach"; text: string }[]>([]);
  const [isVoiceGenerating, setIsVoiceGenerating] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthesisUtteranceRef = useRef<any>(null);

  // 7. Knowledge Graph State
  const [selectedGraphNode, setSelectedGraphNode] = useState<any>(null);
  const [hoveredGraphNode, setHoveredGraphNode] = useState<any>(null);

  // Load diagnostic or stats-based analysis on coach tab open
  useEffect(() => {
    if (activeSubTab === "coach" && !coachInsights) {
      fetchCoachInsights();
    }
  }, [activeSubTab]);

  // Sync Adaptive settings to specific feature states
  useEffect(() => {
    setExamDifficulty(academicDifficulty);
  }, [academicDifficulty]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (examTimerRef.current) clearInterval(examTimerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // ----------------------------------------------------
  // 1. AI COACH INSIGHTS API
  // ----------------------------------------------------
  const fetchCoachInsights = async () => {
    setLoadingCoach(true);
    setCoachError("");
    try {
      const response = await fetch("/api/generate/learning-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats: currentUser.stats,
          documents,
          username: currentUser.displayName
        })
      });
      if (!response.ok) throw new Error("Could not load coach insights.");
      const data = await response.json();
      setCoachInsights(data);
    } catch (err: any) {
      setCoachError(err.message || "Failed to load dynamic coach insights.");
    } finally {
      setLoadingCoach(false);
    }
  };

  const handleApplyCoachRecommendation = (rec: any) => {
    if (rec.docId && documents.some(d => d.id === rec.docId)) {
      // Trigger a transition or selection
      setResearchSelectedDocId(rec.docId);
      setActiveSubTab("research");
    } else {
      setActiveSubTab("graph");
    }
  };

  // ----------------------------------------------------
  // 2. EXAM SIMULATOR LOGIC
  // ----------------------------------------------------
  const handleToggleExamType = (type: string) => {
    if (examQuestionTypes.includes(type)) {
      if (examQuestionTypes.length > 1) {
        setExamQuestionTypes(examQuestionTypes.filter(t => t !== type));
      }
    } else {
      setExamQuestionTypes([...examQuestionTypes, type]);
    }
  };

  const handleStartExam = async () => {
    if (!examSelectedDocId) return;
    setIsGeneratingExam(true);
    setExamQuestions([]);
    setExamAnswers({});
    setExamShortAnswers({});
    setExamScoreResult(null);

    try {
      const selectedDoc = documents.find(d => d.id === examSelectedDocId);
      const response = await fetch("/api/generate/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: examSelectedDocId,
          difficulty: examDifficulty,
          questionTypes: examQuestionTypes,
          numQuestions: examLength,
          username: currentUser.username
        })
      });
      if (!response.ok) throw new Error("Could not compile exam.");
      const data = await response.json();
      
      if (data.questions && data.questions.length > 0) {
        setExamQuestions(data.questions);
        setCurrentExamIndex(0);
        setIsExamActive(true);
        // Set timer based on question count: 90 seconds per question
        const totalSeconds = examLength * 90;
        setExamTimeLeft(totalSeconds);

        // Start countdown timer
        if (examTimerRef.current) clearInterval(examTimerRef.current);
        examTimerRef.current = setInterval(() => {
          setExamTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(examTimerRef.current!);
              handleAutoSubmitExam();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to compile practice exam. Please try again.");
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const handleSelectExamOption = (questionIdx: number, optionIdx: number) => {
    setExamAnswers({
      ...examAnswers,
      [questionIdx]: optionIdx
    });
  };

  const handleAutoSubmitExam = () => {
    setIsExamActive(false);
    if (examTimerRef.current) clearInterval(examTimerRef.current);
    calculateExamScore();
  };

  const calculateExamScore = () => {
    let correct = 0;
    const questionsList = examQuestions;
    const answeredCount = Object.keys(examAnswers).length + Object.keys(examShortAnswers).filter(k => examShortAnswers[Number(k)].trim() !== "").length;

    questionsList.forEach((q, idx) => {
      if (q.type === "short_answer") {
        // Simple heuristic - if student wrote something substantial, award partial/full credit or let them review
        const typed = examShortAnswers[idx] || "";
        if (typed.trim().length > 10) correct++;
      } else {
        if (examAnswers[idx] === q.correctOptionIndex) {
          correct++;
        }
      }
    });

    const percent = Math.round((correct / examLength) * 100);
    let grade = "F";
    if (percent >= 90) grade = "A";
    else if (percent >= 80) grade = "B";
    else if (percent >= 70) grade = "C";
    else if (percent >= 60) grade = "D";

    const result = {
      score: percent,
      totalQuestions: examLength,
      correctCount: correct,
      grade,
      answeredCount
    };

    setExamScoreResult(result);
    // Award experience points based on score
    const earnedXp = Math.round((correct * 30) + (percent >= 80 ? 100 : 30));
    onAddStatsReward(earnedXp, `Completed Practice Exam: Grade ${grade} (${percent}%)`);
  };

  const handleRestartExam = () => {
    setExamQuestions([]);
    setIsExamActive(false);
    setExamScoreResult(null);
    if (examTimerRef.current) clearInterval(examTimerRef.current);
  };

  // ----------------------------------------------------
  // 3. AI COURSE GENERATOR LOGIC
  // ----------------------------------------------------
  const handleGenerateCourse = async () => {
    if (!courseGoal.trim()) return;
    setIsGeneratingCourse(true);
    setGeneratedCourse(null);
    try {
      const response = await fetch("/api/generate/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: courseGoal,
          difficulty: academicDifficulty
        })
      });
      if (!response.ok) throw new Error("Could not compile course.");
      const data = await response.json();
      setGeneratedCourse(data);
      setActiveModuleIdx(0);
      setActiveLessonIdx(0);
      setCourseLessonsCompleted({});
      setCourseQuizAnswers({});
      setCourseQuizSubmitted({});
      setCourseQuizScore({});
    } catch (err) {
      console.error(err);
      alert("Failed to build course syllabus. Please try again.");
    } finally {
      setIsGeneratingCourse(false);
    }
  };

  const handleMarkLessonComplete = (modIdx: number, lesIdx: number) => {
    const key = `${modIdx}-${lesIdx}`;
    if (!courseLessonsCompleted[key]) {
      setCourseLessonsCompleted({
        ...courseLessonsCompleted,
        [key]: true
      });
      onAddStatsReward(20, `Completed Course Lesson: Module ${modIdx + 1}, Lesson ${lesIdx + 1}`);
    }
  };

  const handleSelectQuizOption = (modIdx: number, questionIdx: number, optionIdx: number) => {
    setCourseQuizAnswers({
      ...courseQuizAnswers,
      [`${modIdx}-${questionIdx}`]: optionIdx
    });
  };

  const handleSubmitModuleQuiz = (modIdx: number) => {
    const mod = generatedCourse.modules[modIdx];
    let correct = 0;
    mod.quiz.forEach((q: any, qIdx: number) => {
      const selected = courseQuizAnswers[`${modIdx}-${qIdx}`];
      if (selected === q.correctOptionIndex) {
        correct++;
      }
    });

    setCourseQuizSubmitted({
      ...courseQuizSubmitted,
      [modIdx]: true
    });
    setCourseQuizScore({
      ...courseQuizScore,
      [modIdx]: correct
    });

    onAddStatsReward(50 + (correct * 25), `Passed Module ${modIdx + 1} Quiz (${correct}/3 Correct)`);
  };

  // ----------------------------------------------------
  // 4. CAREER ROADMAP LOGIC
  // ----------------------------------------------------
  const handleGenerateRoadmap = async () => {
    if (!careerGoal.trim()) return;
    setIsGeneratingRoadmap(true);
    setGeneratedRoadmap(null);
    try {
      const response = await fetch("/api/generate/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerGoal: careerGoal
        })
      });
      if (!response.ok) throw new Error("Could not compile roadmap.");
      const data = await response.json();
      setGeneratedRoadmap(data);
      setCompletedMilestones({});
      setCompletedSkills({});
    } catch (err) {
      console.error(err);
      alert("Failed to generate career path. Please try again.");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleToggleSkill = (skill: string, milestoneIdx: number) => {
    const newSkillsState = {
      ...completedSkills,
      [skill]: !completedSkills[skill]
    };
    setCompletedSkills(newSkillsState);

    // If we newly completed a skill, reward experience
    if (newSkillsState[skill]) {
      onAddStatsReward(15, `Acquired Career Skill: ${skill}`);
    }

    // Check if all skills in milestone are acquired
    const milestone = generatedRoadmap.milestones[milestoneIdx];
    const allSkillsAcquired = milestone.skillsToAcquire.every((s: string) => newSkillsState[s]);
    if (allSkillsAcquired && !completedMilestones[milestoneIdx]) {
      setCompletedMilestones({
        ...completedMilestones,
        [milestoneIdx]: true
      });
      onAddStatsReward(100, `Achieved Career Stage Milestone: ${milestone.title}`);
    }
  };

  // ----------------------------------------------------
  // 5. AI RESEARCH ASSISTANT LOGIC
  // ----------------------------------------------------
  const handleAnalyzeResearch = async () => {
    if (!researchSelectedDocId) return;
    setIsAnalyzingResearch(true);
    setResearchAnalysis(null);
    setResearchQAMessages([]);
    try {
      const response = await fetch("/api/generate/research-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: researchSelectedDocId,
          username: currentUser.username
        })
      });
      if (!response.ok) throw new Error("Research analysis failed.");
      const data = await response.json();
      setResearchAnalysis(data);
      
      // Seed initial greeting message
      const doc = documents.find(d => d.id === researchSelectedDocId);
      setResearchQAMessages([
        {
          id: "init",
          role: "assistant",
          text: `👋 Greetings Scholar! I have concluded my deep intellectual analysis of **"${doc?.title}"**. 

I have parsed the document's academic methodologies, key claims, constraints, and core terminology. Feel free to explore the interactive review sheets above or ask me specific research-oriented questions about this publication here!`
        }
      ]);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze publication. Please try again.");
    } finally {
      setIsAnalyzingResearch(false);
    }
  };

  const handleSendResearchQuery = async () => {
    if (!researchInput.trim() || isAskingResearch) return;
    const query = researchInput;
    setResearchInput("");
    
    const newUserMsg = {
      id: Date.now().toString(),
      role: "user",
      text: query
    };
    setResearchQAMessages(prev => [...prev, newUserMsg]);
    setIsAskingResearch(true);

    try {
      // Use existing chat pipeline with active document context and professor settings
      const response = await fetch("/api/generate/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: researchSelectedDocId,
          messages: [{ role: "user", text: query }],
          username: currentUser.username,
          tutorMode: "deep", // Force deep study
          studentLevel: "advanced" // Force rigorous academic tone
        })
      });

      if (!response.ok) throw new Error();
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      
      const newAssistantMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: ""
      };
      setResearchQAMessages(prev => [...prev, newAssistantMsg]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;
          
          setResearchQAMessages(prev => prev.map(msg => {
            if (msg.id === newAssistantMsg.id) {
              return { ...msg, text: assistantText };
            }
            return msg;
          }));
        }
      }
    } catch (err) {
      console.error(err);
      setResearchQAMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          text: "⚠️ Apologies scholar, my connection was interrupted. Please ask your question again."
        }
      ]);
    } finally {
      setIsAskingResearch(false);
    }
  };

  // ----------------------------------------------------
  // 6. VOICE LEARNING MODE LOGIC
  // ----------------------------------------------------
  const handleToggleVoice = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      setVoiceOrbState("idle");
      stopListening();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      setIsVoiceActive(true);
      setVoiceOrbState("listening");
      setVoiceHistory([
        { role: "coach", text: "Hello! I am your StudyMate voice coach. Go ahead and speak. Ask me any question, and I will explain it out loud!" }
      ]);
      speakOutLoud("Hello! I am your StudyMate voice coach. Go ahead and speak. Ask me any question, and I will explain it out loud!");
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }
    
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setVoiceOrbState("listening");
    };

    rec.onresult = (e: any) => {
      const speechToText = e.results[0][0].transcript;
      setVoiceTranscript(speechToText);
      handleProcessVoiceQuery(speechToText);
    };

    rec.onerror = (e: any) => {
      console.error("Speech Recognition Error", e);
      setVoiceOrbState("idle");
    };

    rec.onend = () => {
      // Loop listening if still active and not speaking
      if (isVoiceActive && voiceOrbState !== "speaking") {
        try { rec.start(); } catch (err) {}
      }
    };

    recognitionRef.current = rec;
    try { rec.start(); } catch (err) {}
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
  };

  const handleProcessVoiceQuery = async (query: string) => {
    if (!query.trim()) return;
    setVoiceHistory(prev => [...prev, { role: "user", text: query }]);
    setIsVoiceGenerating(true);
    setVoiceOrbState("idle");
    stopListening();

    try {
      // Call standard tutoring API
      const response = await fetch("/api/generate/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", text: query }],
          tutorMode: teachingPersona === "mentor" ? "explain" : teachingPersona === "professor" ? "deep" : "exam",
          studentLevel: academicDifficulty,
          username: currentUser.username
        })
      });

      if (!response.ok) throw new Error();
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
        }
      }

      // Strip markdown tags before speaking
      const plainText = text.replace(/[*#`_\-]/g, "").trim();
      setVoiceResponseText(text);
      setVoiceHistory(prev => [...prev, { role: "coach", text }]);
      setIsVoiceGenerating(false);
      speakOutLoud(plainText);
    } catch (err) {
      console.error(err);
      setVoiceHistory(prev => [...prev, { role: "coach", text: "I'm sorry, I encountered a communication error. Please speak again." }]);
      setIsVoiceGenerating(false);
      speakOutLoud("I'm sorry, I encountered a communication error. Please speak again.");
    }
  };

  const speakOutLoud = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = teachingPersona === "sergeant" ? 1.2 : 1.0;
    utterance.pitch = teachingPersona === "peer" ? 1.1 : 0.95;

    utterance.onstart = () => {
      setVoiceOrbState("speaking");
    };

    utterance.onend = () => {
      setVoiceOrbState("listening");
      if (isVoiceActive) startListening();
    };

    utterance.onerror = () => {
      setVoiceOrbState("listening");
      if (isVoiceActive) startListening();
    };

    synthesisUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // ----------------------------------------------------
  // 7. KNOWLEDGE GRAPH VISUALIZATION
  // ----------------------------------------------------
  // Generate mock connected node network based on active study documents
  const generateGraphNodesAndLinks = () => {
    const nodes: any[] = [];
    const links: any[] = [];

    // Core central node
    nodes.push({
      id: "hub",
      label: "My Knowledge 🧠",
      type: "hub",
      val: 22,
      x: 350,
      y: 220,
      color: "#4f46e5"
    });

    if (documents.length === 0) {
      // Seed default sample biological and computer science nodes if database is empty
      const sampleSubjects = ["Biology", "Computer Science"];
      sampleSubjects.forEach((sub, sIdx) => {
        const subId = `sub_${sIdx}`;
        const angle = (sIdx * Math.PI) + (Math.PI / 4);
        const sx = 350 + Math.cos(angle) * 120;
        const sy = 220 + Math.sin(angle) * 120;

        nodes.push({
          id: subId,
          label: sub,
          type: "subject",
          val: 16,
          x: sx,
          y: sy,
          color: sIdx === 0 ? "#10b981" : "#ec4899",
          desc: `Academic focus area containing modules, flashcards, and resources.`
        });
        links.push({ source: "hub", target: subId });

        // Concepts for Biology
        if (sIdx === 0) {
          const concepts = ["DNA Double Helix", "Cellular Respiration", "Mitosis Div"];
          concepts.forEach((concept, cIdx) => {
            const cId = `con_b_${cIdx}`;
            const cAngle = angle - (Math.PI / 4) + (cIdx * (Math.PI / 4));
            const cx = sx + Math.cos(cAngle) * 90;
            const cy = sy + Math.sin(cAngle) * 90;
            nodes.push({
              id: cId,
              label: concept,
              type: "concept",
              val: 12,
              x: cx,
              y: cy,
              color: "#34d399",
              desc: `Essential physiological process detailing cellular lifecycle and structures.`,
              subject: "Biology"
            });
            links.push({ source: subId, target: cId });
          });
        } else {
          // Concepts for CS
          const concepts = ["Algorithms", "Object Oriented Design", "React Virtual DOM"];
          concepts.forEach((concept, cIdx) => {
            const cId = `con_cs_${cIdx}`;
            const cAngle = angle - (Math.PI / 4) + (cIdx * (Math.PI / 4));
            const cx = sx + Math.cos(cAngle) * 90;
            const cy = sy + Math.sin(cAngle) * 90;
            nodes.push({
              id: cId,
              label: concept,
              type: "concept",
              val: 12,
              x: cx,
              y: cy,
              color: "#f472b6",
              desc: `Core programmatic structures, computational optimizations, and software engineering.`,
              subject: "Computer Science"
            });
            links.push({ source: subId, target: cId });
          });
        }
      });
    } else {
      // Populate nodes based on real user documents and subjects
      const subjectsMap = new Map<string, string>();
      documents.forEach((doc, dIdx) => {
        const sub = doc.subject || doc.summary?.subject || "General Science";
        let subId = "";
        if (!subjectsMap.has(sub)) {
          subId = `sub_${subjectsMap.size}`;
          subjectsMap.set(sub, subId);
          
          // Position subject node radially around hub
          const totalSubs = 3; // layout buffer
          const angle = (subjectsMap.size * 2 * Math.PI) / totalSubs;
          const sx = 350 + Math.cos(angle) * 110;
          const sy = 220 + Math.sin(angle) * 110;

          nodes.push({
            id: subId,
            label: sub,
            type: "subject",
            val: 16,
            x: sx,
            y: sy,
            color: "#f59e0b",
            desc: `Subject: ${sub}`
          });
          links.push({ source: "hub", target: subId });
        } else {
          subId = subjectsMap.get(sub)!;
        }

        const docNodeId = `doc_${doc.id}`;
        // Radial offset around subject
        const docAngle = (dIdx * 2 * Math.PI) / Math.max(documents.length, 2);
        const subNode = nodes.find(n => n.id === subId);
        const dx = (subNode?.x || 350) + Math.cos(docAngle) * 70;
        const dy = (subNode?.y || 220) + Math.sin(docAngle) * 70;

        nodes.push({
          id: docNodeId,
          label: doc.title,
          type: "document",
          val: 14,
          x: dx,
          y: dy,
          color: "#3b82f6",
          desc: `Full Notes compile consisting of ${doc.wordCount} extracted words.`
        });
        links.push({ source: subId, target: docNodeId });

        // Extract and map actual concepts from summary
        const concepts = doc.summary?.keyConcepts || [];
        concepts.slice(0, 3).forEach((concept, cIdx) => {
          const conId = `con_${doc.id}_${cIdx}`;
          const conAngle = docAngle - (Math.PI / 4) + (cIdx * (Math.PI / 4));
          const cx = dx + Math.cos(conAngle) * 60;
          const cy = dy + Math.sin(conAngle) * 60;

          nodes.push({
            id: conId,
            label: concept.title,
            type: "concept",
            val: 10,
            x: cx,
            y: cy,
            color: "#10b981",
            desc: concept.explanation,
            subject: sub
          });
          links.push({ source: docNodeId, target: conId });
        });
      });
    }

    return { nodes, links };
  };

  const { nodes, links } = generateGraphNodesAndLinks();

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] bg-gray-50/50 p-4 lg:p-6" id="ai-coach-hub">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-1" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl -z-1" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-4 border border-indigo-500/30">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>StudyMate Advanced Intelligence</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
              Your Personal AI Learning Coach 🧠
            </h1>
            <p className="text-indigo-200 max-w-2xl text-sm lg:text-base leading-relaxed">
              Step into a complete, adaptive tutoring orbit. Customize your teacher's persona, take automated custom exams, map your career roadmap, and interact directly with a beautiful visual concept graph!
            </p>
          </div>
          
          {/* Quick Stats Capsule */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4 min-w-[220px]">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-indigo-200">StudyMate Status</p>
              <h3 className="font-bold text-lg text-white">Elite Scholar</h3>
              <p className="text-xs text-indigo-300 mt-0.5">Level {Math.floor((currentUser.stats.studyTimeMinutes || 0) / 100) + 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Control Rail */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-xs h-fit flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 mb-2">AI Intelligence Modules</p>

          <button
            onClick={() => setActiveSubTab("study_tools")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === "study_tools"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold"
                : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <Zap className="h-4.5 w-4.5 text-amber-400" />
              <span>Intelligent Study Tools</span>
            </div>
            <ChevronRight className={`h-4 w-4 ${activeSubTab === "study_tools" ? "rotate-90" : "opacity-40"}`} />
          </button>

          <button
            onClick={() => setActiveSubTab("memory")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === "memory"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold"
                : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <Brain className="h-4.5 w-4.5 text-amber-400" />
              <span>AI Memory & Profile</span>
            </div>
            <ChevronRight className={`h-4 w-4 ${activeSubTab === "memory" ? "rotate-90" : "opacity-40"}`} />
          </button>
          
          <button
            onClick={() => setActiveSubTab("coach")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === "coach"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-4.5 w-4.5" />
              <span>Personal Coach</span>
            </div>
            <ChevronRight className={`h-4 w-4 ${activeSubTab === "coach" ? "rotate-90" : "opacity-40"}`} />
          </button>

          <button
            onClick={() => setActiveSubTab("exam")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === "exam"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <Timer className="h-4.5 w-4.5" />
              <span>Exam Simulator</span>
            </div>
            <ChevronRight className={`h-4 w-4 ${activeSubTab === "exam" ? "rotate-90" : "opacity-40"}`} />
          </button>

          <button
            onClick={() => setActiveSubTab("course")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === "course"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-4.5 w-4.5" />
              <span>AI Course Builder</span>
            </div>
            <ChevronRight className={`h-4 w-4 ${activeSubTab === "course" ? "rotate-90" : "opacity-40"}`} />
          </button>

          <button
            onClick={() => setActiveSubTab("roadmap")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === "roadmap"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <MapIcon className="h-4.5 w-4.5" />
              <span>Career Roadmaps</span>
            </div>
            <ChevronRight className={`h-4 w-4 ${activeSubTab === "roadmap" ? "rotate-90" : "opacity-40"}`} />
          </button>

          <button
            onClick={() => setActiveSubTab("research")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === "research"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <Search className="h-4.5 w-4.5" />
              <span>Research Lab</span>
            </div>
            <ChevronRight className={`h-4 w-4 ${activeSubTab === "research" ? "rotate-90" : "opacity-40"}`} />
          </button>

          <button
            onClick={() => setActiveSubTab("voice")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === "voice"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <Volume2 className="h-4.5 w-4.5" />
              <span>Voice Orbit</span>
            </div>
            <ChevronRight className={`h-4 w-4 ${activeSubTab === "voice" ? "rotate-90" : "opacity-40"}`} />
          </button>

          <button
            onClick={() => setActiveSubTab("graph")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === "graph"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <Network className="h-4.5 w-4.5" />
              <span>Knowledge Graph</span>
            </div>
            <ChevronRight className={`h-4 w-4 ${activeSubTab === "graph" ? "rotate-90" : "opacity-40"}`} />
          </button>

          <button
            onClick={() => setActiveSubTab("settings")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === "settings"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sliders className="h-4.5 w-4.5" />
              <span>Adaptive Settings</span>
            </div>
            <ChevronRight className={`h-4 w-4 ${activeSubTab === "settings" ? "rotate-90" : "opacity-40"}`} />
          </button>
        </div>

        {/* Right Active Working Screen */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            
            {/* -1. UNIFIED INTELLIGENT STUDY WORKSPACE */}
            {activeSubTab === "study_tools" && (
              <motion.div
                key="study_tools"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <UnifiedStudyWorkspace documents={documents} />
              </motion.div>
            )}

            {/* 0. AI MEMORY & PERSONALIZATION DASHBOARD */}
            {activeSubTab === "memory" && (
              <motion.div
                key="memory"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AIMemoryDashboard />
              </motion.div>
            )}

            {/* 1. PERSONAL COACH TAB */}
            {activeSubTab === "coach" && (
              <motion.div
                key="coach"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8 shadow-xs flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Brain className="h-5.5 w-5.5 text-indigo-600" />
                    AI Personal Learning Coach
                  </h2>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Real-time diagnosis, weak-area targeting, and personalized study recommendations.
                  </p>
                </div>

                {loadingCoach ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                    <p className="text-sm text-gray-500">StudyMate is reviewing your academic history...</p>
                  </div>
                ) : coachError ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Failed to connect with Coach</p>
                      <p className="text-xs mt-0.5">{coachError}</p>
                    </div>
                  </div>
                ) : coachInsights ? (
                  <div className="flex flex-col gap-6">
                    {/* Coach Pep Talk card */}
                    <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-5 relative overflow-hidden">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                          SM
                        </div>
                        <div>
                          <h4 className="font-bold text-indigo-900 text-sm">Your Coach's Pep-Talk</h4>
                          <p className="text-indigo-950 text-xs lg:text-sm leading-relaxed mt-1 italic">
                            "{coachInsights.behaviorInsight}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Target Weak areas */}
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-3">Target Revision Focus Areas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coachInsights.weakAreas.map((wa: any, i: number) => (
                          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                                  {wa.subject}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">{wa.topic}</span>
                              </div>
                              <p className="text-gray-900 font-bold text-sm leading-snug">{wa.issue}</p>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-indigo-600 text-xs font-semibold">
                              <Sparkles className="h-3.5 w-3.5 shrink-0" />
                              <span className="leading-normal">{wa.remedy}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actionable Recommendations */}
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-3">Personalized Lesson Plan Tasks</h3>
                      <div className="flex flex-col gap-3">
                        {coachInsights.recommendations.map((rec: any, i: number) => (
                          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-100 transition-all">
                            <div className="flex gap-3.5">
                              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 h-fit">
                                <GraduationCap className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm">{rec.title}</h4>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">{rec.subject} • Recommendations</p>
                                <p className="text-xs text-gray-600 mt-1">{rec.reason}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleApplyCoachRecommendation(rec)}
                              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 self-end md:self-center"
                            >
                              <span>{rec.actionLabel}</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <p className="text-sm text-gray-500">Ready to build your AI Coach study diagnostics?</p>
                    <button onClick={fetchCoachInsights} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
                      Trigger Coach Diagnostic
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. EXAM SIMULATOR TAB */}
            {activeSubTab === "exam" && (
              <motion.div
                key="exam"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8 shadow-xs flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Timer className="h-5.5 w-5.5 text-indigo-600" />
                    AI Practice Exam Simulator
                  </h2>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Generate comprehensive practice examinations directly from your compiled study documents with ticking timers.
                  </p>
                </div>

                {!isExamActive && !examScoreResult && (
                  <div className="flex flex-col gap-6">
                    {/* Setup Screen */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left configuration */}
                      <div className="flex flex-col gap-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Study Document Base</label>
                        {documents.length === 0 ? (
                          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-100 text-xs">
                            ⚠️ You have no compiled study documents yet. Please compile some study documents in the Compile Notes tab first before attempting exams.
                          </div>
                        ) : (
                          <select
                            value={examSelectedDocId}
                            onChange={(e) => setExamSelectedDocId(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          >
                            <option value="">-- Choose Study Document --</option>
                            {documents.map(d => (
                              <option key={d.id} value={d.id}>{d.title} ({d.wordCount} words)</option>
                            ))}
                          </select>
                        )}

                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Academic Difficulty</label>
                        <div className="grid grid-cols-4 gap-2">
                          {["beginner", "intermediate", "advanced", "elite"].map(d => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setExamDifficulty(d)}
                              className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                examDifficulty === d
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                  : "border-gray-100 bg-gray-50/50 text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>

                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Exam Length</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[5, 10, 15].map(len => (
                            <button
                              key={len}
                              type="button"
                              onClick={() => setExamLength(len)}
                              className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                                examLength === len
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : "border-gray-100 bg-gray-50/50 text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              {len} Questions
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right configuration */}
                      <div className="flex flex-col gap-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Question Types Included</label>
                        <div className="flex flex-col gap-2.5">
                          {[
                            { id: "mcq", label: "Multiple Choice Questions", desc: "4 options with 1 precise answer" },
                            { id: "true_false", label: "True / False", desc: "Binary validation assessments" },
                            { id: "short_answer", label: "Conceptual Open Answer", desc: "Requires typed response with self-assessment keywords" },
                            { id: "scenario", label: "Scenario Based Analysis", desc: "Evaluates application of theories to realistic situations" }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleToggleExamType(t.id)}
                              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                                examQuestionTypes.includes(t.id)
                                  ? "bg-indigo-50 border-indigo-200"
                                  : "border-gray-100 hover:bg-gray-50/50"
                              }`}
                            >
                              <div className={`mt-0.5 h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                                examQuestionTypes.includes(t.id) ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 bg-white"
                              }`}>
                                {examQuestionTypes.includes(t.id) && <Check className="h-3 w-3 stroke-[3px]" />}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-xs">{t.label}</h4>
                                <p className="text-gray-400 text-xs mt-0.5">{t.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-50">
                      <button
                        onClick={handleStartExam}
                        disabled={!examSelectedDocId || isGeneratingExam}
                        className="px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isGeneratingExam ? (
                          <>
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                            <span>Compiling Examination...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4.5 w-4.5" />
                            <span>Begin Timed Practice Exam</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* TIMED MOCK EXAM VIEW */}
                {isExamActive && examQuestions.length > 0 && (
                  <div className="flex flex-col gap-6">
                    {/* Progress & Time Status */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span>Question {currentExamIndex + 1} of {examLength}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-indigo-600">{examDifficulty} Difficulty</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-extrabold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                        <Timer className="h-4.5 w-4.5 shrink-0" />
                        <span>{Math.floor(examTimeLeft / 60)}:{(examTimeLeft % 60).toString().padStart(2, "0")}</span>
                      </div>
                    </div>

                    {/* Progress line */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300"
                        style={{ width: `${((currentExamIndex + 1) / examLength) * 100}%` }}
                      />
                    </div>

                    {/* Active Question Panel */}
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full">
                        {examQuestions[currentExamIndex].type?.toUpperCase() || "MCQ"}
                      </span>
                      <h3 className="font-extrabold text-gray-900 text-base leading-snug mt-3">
                        {examQuestions[currentExamIndex].question}
                      </h3>

                      {/* Render Options */}
                      {examQuestions[currentExamIndex].type !== "short_answer" ? (
                        <div className="grid grid-cols-1 gap-3 mt-5">
                          {examQuestions[currentExamIndex].options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectExamOption(currentExamIndex, oIdx)}
                              className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                                examAnswers[currentExamIndex] === oIdx
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                                  : "border-gray-100 hover:bg-gray-50/50 text-gray-700"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`h-6 w-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                                  examAnswers[currentExamIndex] === oIdx ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-5 flex flex-col gap-3">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type your conceptual response:</label>
                          <textarea
                            value={examShortAnswers[currentExamIndex] || ""}
                            onChange={(e) => setExamShortAnswers({ ...examShortAnswers, [currentExamIndex]: e.target.value })}
                            placeholder="Explain your conceptual understanding, supporting with keywords..."
                            className="w-full min-h-[120px] bg-white border border-gray-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>
                      )}
                    </div>

                    {/* Footer Nav Controls */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <button
                        onClick={() => setCurrentExamIndex(prev => Math.max(prev - 1, 0))}
                        disabled={currentExamIndex === 0}
                        className="px-4.5 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </button>

                      {currentExamIndex + 1 < examLength ? (
                        <button
                          onClick={() => setCurrentExamIndex(prev => prev + 1)}
                          className="px-4.5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-all flex items-center gap-1"
                        >
                          <span>Next</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleAutoSubmitExam}
                          className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-all shadow-md"
                        >
                          Submit Examination
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* RESULTS VIEW */}
                {examScoreResult && (
                  <div className="flex flex-col gap-6">
                    {/* Score Summary Card */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="h-20 w-20 rounded-full bg-indigo-600 border-[3px] border-indigo-400 flex flex-col items-center justify-center shrink-0 shadow-lg">
                          <span className="text-xs text-indigo-200 leading-none">GRADE</span>
                          <span className="text-3xl font-extrabold text-white leading-tight">{examScoreResult.grade}</span>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-base">Practice Exam Completed!</h3>
                          <p className="text-slate-400 text-xs mt-0.5">Performance Analysis Report</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="text-xs text-slate-300">
                              Score: <span className="text-indigo-400 font-bold">{examScoreResult.score}%</span>
                            </div>
                            <div className="h-1 w-1 rounded-full bg-slate-600" />
                            <div className="text-xs text-slate-300">
                              Accuracy: <span className="text-green-400 font-bold">{examScoreResult.correctCount}/{examScoreResult.totalQuestions} Correct</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleRestartExam}
                        className="px-4.5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 self-start md:self-center border border-white/5"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Take Another Exam</span>
                      </button>
                    </div>

                    {/* Socratic Review Sheet */}
                    <div className="flex flex-col gap-4">
                      <h3 className="font-bold text-gray-900 text-sm">Socratic Question Breakdown</h3>
                      <div className="flex flex-col gap-4">
                        {examQuestions.map((q, idx) => {
                          const answerOpt = examAnswers[idx];
                          const shortAnswer = examShortAnswers[idx] || "";
                          const isCorrect = q.type === "short_answer" ? shortAnswer.trim().length > 10 : answerOpt === q.correctOptionIndex;

                          return (
                            <div key={idx} className="bg-white border border-gray-100 p-4.5 rounded-2xl shadow-xs">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Question {idx + 1}</span>
                                  <h4 className="font-bold text-gray-900 text-sm leading-snug mt-1">{q.question}</h4>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                                  isCorrect ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                }`}>
                                  {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                  <span>{isCorrect ? "Correct" : "Needs Work"}</span>
                                </span>
                              </div>

                              {/* Student vs correct answer breakdown */}
                              {q.type !== "short_answer" ? (
                                <div className="mt-3.5 flex flex-col gap-1.5 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                  <div className="text-xs text-gray-600">
                                    Your Choice: <span className={`font-semibold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                      {answerOpt !== undefined ? q.options[answerOpt] : "No Answer"}
                                    </span>
                                  </div>
                                  {!isCorrect && (
                                    <div className="text-xs text-gray-600">
                                      Correct Option: <span className="font-semibold text-green-600">{q.options[q.correctOptionIndex]}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="mt-3.5 flex flex-col gap-2.5 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                                  <div className="text-xs text-gray-600">
                                    Your response: <span className="font-semibold text-gray-800 block mt-1 bg-white p-2 border border-gray-100 rounded-lg">{shortAnswer || "None"}</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Ideal answers contain keywords: <span className="font-semibold text-indigo-600 block mt-1">{q.correctShortAnswer}</span>
                                  </div>
                                </div>
                              )}

                              {/* Socratic explanation */}
                              <div className="mt-3.5 pt-3 border-t border-gray-50 text-xs text-gray-500 leading-normal flex items-start gap-1.5">
                                <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                <span>{q.explanation}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. AI COURSE BUILDER TAB */}
            {activeSubTab === "course" && (
              <motion.div
                key="course"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8 shadow-xs flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <GraduationCap className="h-5.5 w-5.5 text-indigo-600" />
                    AI Course syllabus Builder
                  </h2>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Enter any learning goal (e.g. Master Docker, Biology of Cells) and let StudyMate generate a custom syllabus with lesson plans, exercises, and quizzes!
                  </p>
                </div>

                {!generatedCourse ? (
                  <div className="flex flex-col gap-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">What is your target learning goal?</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={courseGoal}
                        onChange={(e) => setCourseGoal(e.target.value)}
                        placeholder="e.g., Master React Server Components & Streaming"
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      <button
                        onClick={handleGenerateCourse}
                        disabled={!courseGoal.trim() || isGeneratingCourse}
                        className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                      >
                        {isGeneratingCourse ? (
                          <>
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                            <span>Building...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4.5 w-4.5" />
                            <span>Build Syllabus</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Syllabus sidebar index */}
                    <div className="md:col-span-1 border-r border-gray-50 pr-4 flex flex-col gap-5">
                      <div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                          AI Syllabus
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-base leading-tight mt-2">{generatedCourse.title}</h3>
                        <p className="text-gray-500 text-xs mt-1">{generatedCourse.description}</p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Modules</p>
                        {generatedCourse.modules.map((mod: any, mIdx: number) => (
                          <div key={mIdx} className="flex flex-col gap-1 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-gray-800 text-xs">M{mIdx + 1}: {mod.title}</h4>
                            <div className="flex flex-col gap-1 mt-1">
                              {mod.lessons.map((les: any, lIdx: number) => {
                                const isSelected = activeModuleIdx === mIdx && activeLessonIdx === lIdx;
                                return (
                                  <button
                                    key={lIdx}
                                    onClick={() => {
                                      setActiveModuleIdx(mIdx);
                                      setActiveLessonIdx(lIdx);
                                    }}
                                    className={`text-left text-[11px] px-2 py-1 rounded-md transition-all font-medium flex items-center justify-between ${
                                      isSelected ? "bg-indigo-600 text-white font-bold" : "text-gray-500 hover:bg-gray-100"
                                    }`}
                                  >
                                    <span>L{lIdx + 1}: {les.title}</span>
                                    {courseLessonsCompleted[`${mIdx}-${lIdx}`] && (
                                      <Check className={`h-3 w-3 ${isSelected ? "text-white" : "text-green-600"}`} />
                                    )}
                                  </button>
                                );
                              })}
                              
                              {/* Modules custom quiz & exercise tab */}
                              <button
                                onClick={() => {
                                  setActiveModuleIdx(mIdx);
                                  setActiveLessonIdx(99); // 99 as custom assessment index
                                }}
                                className={`text-left text-[11px] px-2 py-1 rounded-md transition-all font-semibold flex items-center justify-between ${
                                  activeModuleIdx === mIdx && activeLessonIdx === 99 ? "bg-indigo-600 text-white" : "text-indigo-600 hover:bg-indigo-50"
                                }`}
                              >
                                <span>Quiz & Exercise {mIdx + 1}</span>
                                {courseQuizSubmitted[mIdx] && <Check className="h-3 w-3" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setGeneratedCourse(null)}
                        className="mt-4 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Syllabus Generator</span>
                      </button>
                    </div>

                    {/* Active lesson or Assessment workspace */}
                    <div className="md:col-span-2">
                      {activeLessonIdx !== 99 ? (
                        <div className="flex flex-col gap-4">
                          <div className="border-b border-gray-50 pb-3 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Module {activeModuleIdx + 1} • Lesson {activeLessonIdx + 1}
                              </span>
                              <h3 className="font-extrabold text-gray-900 text-lg">
                                {generatedCourse.modules[activeModuleIdx].lessons[activeLessonIdx].title}
                              </h3>
                            </div>
                            
                            <button
                              onClick={() => handleMarkLessonComplete(activeModuleIdx, activeLessonIdx)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                                courseLessonsCompleted[`${activeModuleIdx}-${activeLessonIdx}`]
                                  ? "bg-green-50 text-green-600 border border-green-100"
                                  : "bg-indigo-600 text-white hover:bg-indigo-700"
                              }`}
                            >
                              <Check className="h-3.5 w-3.5 stroke-[3px]" />
                              <span>{courseLessonsCompleted[`${activeModuleIdx}-${activeLessonIdx}`] ? "Completed" : "Complete lesson"}</span>
                            </button>
                          </div>

                          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line prose max-w-none">
                            {generatedCourse.modules[activeModuleIdx].lessons[activeLessonIdx].content}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          {/* Exercises & Quizzes tab */}
                          <div className="bg-indigo-50/40 p-4.5 rounded-2xl border border-indigo-100/50">
                            <h4 className="font-extrabold text-indigo-900 text-sm flex items-center gap-1.5">
                              <Award className="h-4.5 w-4.5" />
                              Module Exercise: {generatedCourse.modules[activeModuleIdx].exercise.title}
                            </h4>
                            <p className="text-indigo-950 text-xs mt-1.5 leading-relaxed">
                              {generatedCourse.modules[activeModuleIdx].exercise.description}
                            </p>
                            <div className="flex flex-col gap-1.5 mt-3">
                              {generatedCourse.modules[activeModuleIdx].exercise.steps.map((st: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-indigo-950">
                                  <span className="h-4.5 w-4.5 rounded bg-indigo-200/50 text-indigo-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <span>{st}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Interactive Quiz */}
                          <div>
                            <h3 className="font-extrabold text-gray-900 text-sm mb-3">Module Quiz Assessment</h3>
                            <div className="flex flex-col gap-4">
                              {generatedCourse.modules[activeModuleIdx].quiz.map((q: any, qIdx: number) => {
                                const ansKey = `${activeModuleIdx}-${qIdx}`;
                                const selected = courseQuizAnswers[ansKey];
                                const isSubmitted = courseQuizSubmitted[activeModuleIdx];
                                const isCorrect = selected === q.correctOptionIndex;

                                return (
                                  <div key={qIdx} className="bg-white border border-gray-100 p-4 rounded-xl shadow-xs">
                                    <h5 className="font-bold text-gray-900 text-xs leading-snug">{qIdx + 1}. {q.question}</h5>
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                      {q.options.map((opt: string, oIdx: number) => {
                                        const isSelected = selected === oIdx;
                                        let btnClass = "border-gray-100 bg-gray-50/50 hover:bg-gray-100 text-gray-700";
                                        
                                        if (isSelected && !isSubmitted) btnClass = "bg-indigo-600 border-indigo-600 text-white";
                                        if (isSubmitted) {
                                          if (oIdx === q.correctOptionIndex) btnClass = "bg-green-500 border-green-500 text-white";
                                          else if (isSelected) btnClass = "bg-red-500 border-red-500 text-white";
                                        }

                                        return (
                                          <button
                                            key={oIdx}
                                            onClick={() => !isSubmitted && handleSelectQuizOption(activeModuleIdx, qIdx, oIdx)}
                                            className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${btnClass}`}
                                          >
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {isSubmitted && (
                                      <p className="text-[10px] text-gray-500 mt-2 italic leading-normal border-t border-gray-50 pt-1.5">
                                        💡 Explanation: {q.explanation}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {!courseQuizSubmitted[activeModuleIdx] ? (
                              <button
                                onClick={() => handleSubmitModuleQuiz(activeModuleIdx)}
                                className="mt-5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                              >
                                Submit Quiz Answers
                              </button>
                            ) : (
                              <div className="mt-5 p-4 bg-green-50 border border-green-100 rounded-xl text-center">
                                <p className="text-green-800 text-xs font-bold">
                                  Assessment Passed! Score: {courseQuizScore[activeModuleIdx]}/3 Correct
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. CAREER ROADMAPS TAB */}
            {activeSubTab === "roadmap" && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8 shadow-xs flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <MapIcon className="h-5.5 w-5.5 text-indigo-600" />
                    Career Skill Roadmaps
                  </h2>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Generate structured career advancement roadmaps mapped out with project portfolios and checkable skill sets!
                  </p>
                </div>

                {!generatedRoadmap ? (
                  <div className="flex flex-col gap-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">What is your career dream goal?</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={careerGoal}
                        onChange={(e) => setCareerGoal(e.target.value)}
                        placeholder="e.g., Full Stack Cloud Architect or Surgical Nurse"
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      <button
                        onClick={handleGenerateRoadmap}
                        disabled={!careerGoal.trim() || isGeneratingRoadmap}
                        className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                      >
                        {isGeneratingRoadmap ? (
                          <>
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                            <span>Plotting...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4.5 w-4.5" />
                            <span>Plot Roadmap</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Roadmap Summary Banner */}
                    <div className="bg-indigo-50/50 rounded-2xl p-4.5 border border-indigo-100/30">
                      <h3 className="font-extrabold text-indigo-900 text-sm">Strategic Career: {generatedRoadmap.careerGoal}</h3>
                      <p className="text-indigo-950 text-xs leading-relaxed mt-1">{generatedRoadmap.summary}</p>
                    </div>

                    {/* Milestone Progress Path */}
                    <div className="flex flex-col gap-4 relative pl-8 before:content-[''] before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-100">
                      {generatedRoadmap.milestones.map((mil: any, mIdx: number) => {
                        const isMilestoneDone = completedMilestones[mIdx];
                        return (
                          <div key={mIdx} className="relative">
                            {/* Animated glowing checkpoint orb */}
                            <div className={`absolute -left-8 top-1 h-7.5 w-7.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              isMilestoneDone ? "bg-green-600 border-green-600 text-white shadow-md" : "bg-white border-indigo-300 text-indigo-600 animate-pulse"
                            }`}>
                              {isMilestoneDone ? <Check className="h-4 w-4 stroke-[3px]" /> : <span className="text-[10px] font-bold">{mIdx + 1}</span>}
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{mil.stage}</span>
                                  <h4 className="font-extrabold text-gray-900 text-base leading-snug">{mil.title}</h4>
                                  <p className="text-gray-500 text-xs mt-0.5">{mil.timeEstimate} completion target</p>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                  isMilestoneDone ? "bg-green-50 text-green-600 border border-green-100" : "bg-yellow-50 text-yellow-600 border border-yellow-100"
                                }`}>
                                  {isMilestoneDone ? "Stage Mastered" : "Active Stage"}
                                </span>
                              </div>
                              <p className="text-gray-600 text-xs leading-relaxed">{mil.description}</p>

                              {/* Interactive Skill mapping checklist */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-50">
                                <div>
                                  <h5 className="font-bold text-gray-900 text-xs mb-2">Checkable Skills to Master:</h5>
                                  <div className="flex flex-col gap-2">
                                    {mil.skillsToAcquire.map((sk: string, sIdx: number) => (
                                      <button
                                        key={sIdx}
                                        onClick={() => handleToggleSkill(sk, mIdx)}
                                        className={`text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                                          completedSkills[sk]
                                            ? "bg-green-50 border-green-100 text-green-700"
                                            : "border-gray-100 hover:bg-gray-50 text-gray-600"
                                        }`}
                                      >
                                        <span>{sk}</span>
                                        <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                                          completedSkills[sk] ? "bg-green-600 border-green-600 text-white" : "border-gray-300"
                                        }`}>
                                          {completedSkills[sk] && <Check className="h-3 w-3" />}
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h5 className="font-bold text-gray-900 text-xs mb-2">Hands-on Portfolio Projects:</h5>
                                  <div className="flex flex-col gap-2">
                                    {mil.projects.map((proj: string, pIdx: number) => (
                                      <div key={pIdx} className="bg-indigo-50/20 border border-indigo-100/20 p-3 rounded-xl flex gap-2">
                                        <Award className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                                        <div>
                                          <h6 className="font-bold text-indigo-950 text-xs leading-tight">{proj}</h6>
                                          <p className="text-[10px] text-indigo-400 mt-0.5">Recommended portfolio highlight</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-50">
                      <button
                        onClick={() => setGeneratedRoadmap(null)}
                        className="px-4.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl text-xs font-bold transition-all"
                      >
                        Reset & Plot New Path
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 5. AI RESEARCH LAB TAB */}
            {activeSubTab === "research" && (
              <motion.div
                key="research"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8 shadow-xs flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Search className="h-5.5 w-5.5 text-indigo-600" />
                    AI Academic Research Lab
                  </h2>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Deep publication analyzing: extract academic methodologies, claims, validities, constraints, and chat with files.
                  </p>
                </div>

                {!researchAnalysis ? (
                  <div className="flex flex-col gap-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Study Publication</label>
                    <div className="flex gap-3">
                      {documents.length === 0 ? (
                        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-100 text-xs w-full">
                          ⚠️ You have no compiled study materials yet. Please compile research notes or papers in the Compile Notes tab first before analyzing.
                        </div>
                      ) : (
                        <select
                          value={researchSelectedDocId}
                          onChange={(e) => setResearchSelectedDocId(e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        >
                          <option value="">-- Choose Study Document --</option>
                          {documents.map(d => (
                            <option key={d.id} value={d.id}>{d.title} ({d.wordCount} words)</option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={handleAnalyzeResearch}
                        disabled={!researchSelectedDocId || isAnalyzingResearch}
                        className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                      >
                        {isAnalyzingResearch ? (
                          <>
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                            <span>Analyzing Paper...</span>
                          </>
                        ) : (
                          <>
                            <Search className="h-4.5 w-4.5" />
                            <span>Analyze Research</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Synthesis & Abstract review */}
                    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Scholarly Synthesis</span>
                      <h3 className="font-extrabold text-white text-base mt-1">Research Executive Briefing</h3>
                      <p className="text-slate-300 text-xs lg:text-sm leading-relaxed mt-2.5 whitespace-pre-line">
                        {researchAnalysis.synthesis}
                      </p>
                    </div>

                    {/* Methodologies, Claims, limitations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Methodology */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs flex flex-col gap-2">
                        <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b border-gray-50 pb-2 mb-1.5 uppercase tracking-wider text-indigo-600">
                          <Sliders className="h-4 w-4" />
                          Scientific Methodology
                        </h4>
                        <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">
                          {researchAnalysis.methodology}
                        </p>
                      </div>

                      {/* Claims & Findings */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs flex flex-col gap-2">
                        <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b border-gray-50 pb-2 mb-1.5 uppercase tracking-wider text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Extracted Claims & Findings
                        </h4>
                        <div className="flex flex-col gap-2">
                          {researchAnalysis.keyClaims.map((claim: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-normal">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                              <span>{claim}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Study Limitations */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs flex flex-col gap-2">
                        <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b border-gray-50 pb-2 mb-1.5 uppercase tracking-wider text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          validity Threats & Limitations
                        </h4>
                        <div className="flex flex-col gap-2">
                          {researchAnalysis.limitations.map((lim: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-normal">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                              <span>{lim}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Specialized Glossary */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs flex flex-col gap-2">
                        <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5 border-b border-gray-50 pb-2 mb-1.5 uppercase tracking-wider text-blue-600">
                          <Info className="h-4 w-4" />
                          Key Academic Glossary
                        </h4>
                        <div className="flex flex-col gap-2.5 max-h-[160px] overflow-y-auto">
                          {researchAnalysis.entities.map((ent: any, i: number) => (
                            <div key={i} className="text-xs">
                              <span className="font-bold text-gray-800 block">{ent.name}</span>
                              <span className="text-gray-500 font-medium leading-normal block mt-0.5">{ent.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Scholarly Q&A chat */}
                    <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
                      <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Chat with Publication Context</h4>
                      
                      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4.5 min-h-[160px] max-h-[250px] overflow-y-auto flex flex-col gap-3">
                        {researchQAMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-2xl text-xs max-w-[85%] leading-normal ${
                              msg.role === "user"
                                ? "bg-indigo-600 text-white ml-auto"
                                : "bg-white border border-gray-100 text-gray-800"
                            }`}
                          >
                            <span className="whitespace-pre-line">{msg.text}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2.5">
                        <input
                          type="text"
                          value={researchInput}
                          onChange={(e) => setResearchInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendResearchQuery()}
                          placeholder="Ask the Assistant specific questions about the paper..."
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                        <button
                          onClick={handleSendResearchQuery}
                          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-50">
                      <button
                        onClick={() => setResearchAnalysis(null)}
                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl text-xs font-bold transition-all"
                      >
                        Reset Academic Parser
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 6. VOICE LEARNING ORBIT TAB */}
            {activeSubTab === "voice" && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8 shadow-xs flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Volume2 className="h-5.5 w-5.5 text-indigo-600" />
                    Conversational Voice Learning Orbit
                  </h2>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Enter hands-free voice conversational mode. Speak questions and listen to spoken AI tutor explanations in real-time.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center py-12 gap-8">
                  {/* Glowing Animated Pulse Orb */}
                  <div className="relative flex items-center justify-center">
                    {isVoiceActive && (
                      <>
                        <div className={`absolute h-40 w-40 rounded-full bg-indigo-500/10 animate-ping duration-1000 ${
                          voiceOrbState === "speaking" ? "bg-green-500/10" : ""
                        }`} />
                        <div className={`absolute h-32 w-32 rounded-full bg-indigo-400/20 animate-pulse duration-1000 ${
                          voiceOrbState === "listening" ? "bg-pink-400/20" : ""
                        }`} />
                      </>
                    )}
                    <button
                      onClick={handleToggleVoice}
                      className={`h-24 w-24 rounded-full flex items-center justify-center shadow-lg transition-all border-4 relative z-10 ${
                        isVoiceActive
                          ? voiceOrbState === "listening"
                            ? "bg-indigo-600 border-indigo-400 text-white animate-bounce"
                            : "bg-green-600 border-green-400 text-white"
                          : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {isVoiceActive ? (
                        voiceOrbState === "listening" ? (
                          <Mic className="h-10 w-10 animate-pulse" />
                        ) : (
                          <Volume2 className="h-10 w-10 animate-pulse" />
                        )
                      ) : (
                        <Play className="h-10 w-10 stroke-[2.5px]" />
                      )}
                    </button>
                  </div>

                  {/* Status label */}
                  <div className="text-center">
                    <h4 className="font-extrabold text-gray-900 text-sm">
                      {isVoiceActive
                        ? voiceOrbState === "listening"
                          ? "🎙️ System Listening... Speak Clearly!"
                          : "🔊 StudyMate speaking..."
                        : "Voice Learning Orbit Offline"}
                    </h4>
                    <p className="text-xs text-gray-400 max-w-sm mt-1">
                      {isVoiceActive
                        ? "Say your query like: 'Can you explain cellular meiosis double division?'"
                        : "Click the orb to start a hands-free, real-time audio chat session."}
                    </p>
                  </div>

                  {/* Transcription synchronized logs box */}
                  <div className="w-full max-w-md bg-gray-50 border border-gray-100 rounded-2xl p-4.5 flex flex-col gap-3 min-h-[160px] max-h-[220px] overflow-y-auto">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Live synchronized Dialog</p>
                    {voiceHistory.map((item, idx) => (
                      <div key={idx} className="text-xs leading-normal">
                        <span className={`font-bold block ${item.role === "user" ? "text-indigo-600" : "text-gray-800"}`}>
                          {item.role === "user" ? "You Speak:" : "StudyMate:"}
                        </span>
                        <span className="text-gray-600 font-medium block mt-0.5">{item.text}</span>
                      </div>
                    ))}
                    {isVoiceGenerating && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 italic">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Tutor is formulating response...</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. KNOWLEDGE GRAPH VISUALIZER TAB */}
            {activeSubTab === "graph" && (
              <motion.div
                key="graph"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8 shadow-xs flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Network className="h-5.5 w-5.5 text-indigo-600" />
                    Concept Knowledge Graph
                  </h2>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Interactive canvas connecting your library subjects, summaries, and key concepts. Click nodes to expand detail cards!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Visual SVG map stage */}
                  <div className="md:col-span-3 bg-slate-950 rounded-2xl h-[450px] relative overflow-hidden border border-slate-900 shadow-inner">
                    <div className="absolute top-3.5 left-3.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                      Interactive Visual Network
                    </div>
                    
                    <svg className="w-full h-full cursor-grab active:cursor-grabbing">
                      {/* Lines/Links */}
                      {links.map((link, lIdx) => {
                        const sourceNode = nodes.find(n => n.id === link.source);
                        const targetNode = nodes.find(n => n.id === link.target);
                        if (!sourceNode || !targetNode) return null;

                        return (
                          <line
                            key={lIdx}
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke="#334155"
                            strokeWidth="1.5"
                            strokeOpacity="0.45"
                          />
                        );
                      })}

                      {/* Floating glowing nodes */}
                      {nodes.map((node) => {
                        const isSelected = selectedGraphNode?.id === node.id;
                        const isHovered = hoveredGraphNode?.id === node.id;
                        
                        return (
                          <g
                            key={node.id}
                            transform={`translate(${node.x}, ${node.y})`}
                            onClick={() => setSelectedGraphNode(node)}
                            onMouseEnter={() => setHoveredGraphNode(node)}
                            onMouseLeave={() => setHoveredGraphNode(null)}
                            className="cursor-pointer transition-all duration-300"
                          >
                            {/* Inner glowing halo on selection/hover */}
                            {(isSelected || isHovered) && (
                              <circle
                                r={node.val + 8}
                                fill={node.color}
                                fillOpacity="0.15"
                                className="animate-ping"
                              />
                            )}
                            <circle
                              r={node.val}
                              fill={node.color}
                              stroke={isSelected ? "#ffffff" : "transparent"}
                              strokeWidth="2.5"
                              filter="drop-shadow(0px 0px 4px rgba(0,0,0,0.5))"
                            />
                            {/* Short text tags */}
                            <text
                              y={node.val + 14}
                              textAnchor="middle"
                              fill="#94a3b8"
                              fontSize="9"
                              fontWeight="bold"
                              className="pointer-events-none select-none text-[8px] tracking-tight"
                            >
                              {node.label.length > 14 ? node.label.substring(0, 12) + "..." : node.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Sidebar card reader */}
                  <div className="md:col-span-1 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Concept Node Reader</p>
                    {selectedGraphNode ? (
                      <div className="flex flex-col gap-3.5">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: selectedGraphNode.color }} />
                          <h4 className="font-extrabold text-gray-900 text-sm leading-snug">{selectedGraphNode.label}</h4>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 w-fit uppercase">
                          {selectedGraphNode.type}
                        </span>
                        
                        {selectedGraphNode.subject && (
                          <div className="text-xs text-gray-500 font-medium">
                            Academic Domain: <span className="text-gray-700 font-semibold">{selectedGraphNode.subject}</span>
                          </div>
                        )}

                        <p className="text-gray-600 text-xs leading-relaxed border-t border-gray-100 pt-3">
                          {selectedGraphNode.desc || "Interactive node representing vital structural concepts or documents in your study base directory."}
                        </p>
                        
                        {selectedGraphNode.type === "concept" && (
                          <button
                            onClick={() => {
                              setActiveSubTab("voice");
                              speakOutLoud(`Explaining concept: ${selectedGraphNode.label}. ${selectedGraphNode.desc}`);
                            }}
                            className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            <Volume2 className="h-4 w-4" />
                            <span>Voice explain concept</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                        <Info className="h-8 w-8 text-gray-300" />
                        <p className="text-xs text-gray-400 leading-normal">
                          Click any floating node on the knowledge web to review definitions and explore connected files!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. ADAPTIVE SETTINGS TAB */}
            {activeSubTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-3xl border border-gray-100 p-6 lg:p-8 shadow-xs flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Sliders className="h-5.5 w-5.5 text-indigo-600" />
                    Adaptive Learning Configurations
                  </h2>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Customize your StudyMate AI teaching persona, pace style, and baseline academic standard.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Teacher Personas */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">AI Teacher Persona Profile</label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[
                        { id: "mentor", title: "Socratic Mentor 🌸", desc: "Patient, breaks topics down, asks conceptual check questions, uses analogies." },
                        { id: "peer", title: "Casual Peer 🤝", desc: "Relaxed friendly vocabulary, encouraging tone, casual explanation hooks." },
                        { id: "sergeant", title: "Drill Sergeant ⚡", desc: "Rigorous direct speed, high density, focuses strictly on core formula memorizations." },
                        { id: "professor", title: "Professor Academic 🎓", desc: "Intellectually sophisticated, utilizes professional terminology, explores validity threats." }
                      ].map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setTeachingPersona(p.id);
                            onAddStatsReward(10, `Adjusted teaching persona to ${p.title}`);
                          }}
                          className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                            teachingPersona === p.id
                              ? "bg-indigo-50 border-indigo-200 text-indigo-950"
                              : "border-gray-100 hover:bg-gray-50/50"
                          }`}
                        >
                          <h4 className="font-extrabold text-xs">{p.title}</h4>
                          <p className="text-gray-400 text-[10.5px] leading-relaxed">{p.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Baseline Standard */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Baseline Academic Standard</label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[
                        { id: "beginner", label: "Beginner", desc: "High clarity recall definitions, minimal pre-assumed vocabulary." },
                        { id: "intermediate", label: "Intermediate", desc: "Balanced conceptual explanation, logical application problems." },
                        { id: "advanced", label: "Advanced Scholar", desc: "Technical analytical deep-dives, professional standard terminology." },
                        { id: "elite", label: "Expert / PhD standard", desc: "Extremely rigorous theoretical comparisons, boundary assessments." }
                      ].map((std: any) => (
                        <button
                          key={std.id}
                          onClick={() => {
                            setAcademicDifficulty(std.id);
                            onAddStatsReward(10, `Set baseline standard to ${std.label}`);
                          }}
                          className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                            academicDifficulty === std.id
                              ? "bg-indigo-50 border-indigo-200 text-indigo-950"
                              : "border-gray-100 hover:bg-gray-50/50"
                          }`}
                        >
                          <h4 className="font-extrabold text-xs">{std.label}</h4>
                          <p className="text-gray-400 text-[10.5px] leading-relaxed">{std.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-indigo-50/20 border border-indigo-100/30 p-4 rounded-2xl flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-950 leading-relaxed">
                      💡 **Adaptive Syncing is Active!** Your selected teacher persona and academic baseline are synchronized across the entire StudyMate ecosystem. All summaries, quizzes, chat responses, and voice guides generated from now on will align to your selected standards automatically.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
