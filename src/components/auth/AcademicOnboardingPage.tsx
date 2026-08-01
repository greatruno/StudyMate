import React, { useState } from "react";
import { GraduationCap, BookOpen, Target, Sparkles, Check, ArrowRight, Award, Compass, Brain } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { AcademicProfile } from "../../types";

interface AcademicOnboardingPageProps {
  onComplete: () => void;
}

const CATEGORIES: Record<string, string[]> = {
  "Science & Medicine": ["Biology", "Chemistry", "Physics", "General Medicine", "Pharmacology", "Nursing"],
  "Technology & Computing": ["Computer Science", "Software Engineering", "Artificial Intelligence", "Cybersecurity", "Data Science", "Web Development"],
  "Engineering & Math": ["Mechanical Engineering", "Electrical Engineering", "Calculus & Algebra", "Civil Engineering", "Statistics"],
  "Business & Economics": ["Accounting", "Corporate Finance", "Economics", "Marketing", "Management", "Business Analytics"],
  "Humanities & Social Sciences": ["Psychology", "History", "Philosophy", "Political Science", "Sociology", "Law & Legal Studies"],
  "Languages & Creative Arts": ["English Literature", "Spanish", "Graphic Design", "Architecture", "Fine Arts", "Music"]
};

const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "First Class", "Distinction"];
const STYLE_OPTIONS: { value: "Visual" | "Reading/Writing" | "Practical" | "Mixed"; label: string; desc: string }[] = [
  { value: "Visual", label: "Visual & Diagrams", desc: "Mindmaps, flowcharts, infographics, and spatial concept summaries." },
  { value: "Reading/Writing", label: "Reading & Text Notes", desc: "Structured bullet points, chapter outlines, and written summaries." },
  { value: "Practical", label: "Active Recall & Quizzes", desc: "Flashcard repetition, practice problem sets, and Socratic questioning." },
  { value: "Mixed", label: "Balanced Multimodal", desc: "Custom blend of visual diagrams, smart quizzes, and chat tutoring." }
];

export default function AcademicOnboardingPage({ onComplete }: AcademicOnboardingPageProps) {
  const { completeOnboarding, user } = useAuth();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("Technology & Computing");
  const [field, setField] = useState("Computer Science");
  const [targetGrade, setTargetGrade] = useState("A+");
  const [studyGoalHours, setStudyGoalHours] = useState(8);
  const [learningStyle, setLearningStyle] = useState<"Visual" | "Reading/Writing" | "Practical" | "Mixed">("Mixed");
  const [learningGoals, setLearningGoals] = useState("Master core syllabus topics, maintain top GPA, and prepare for exams with active recall.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async () => {
    setIsSubmitting(true);
    const profileData: Partial<AcademicProfile> = {
      role: user?.role || "student",
      academicCategory: category,
      primaryField: field,
      learningGoals,
      experienceLevel: "Intermediate",
      preferredLearningStyle: learningStyle
    };

    await completeOnboarding(profileData);
    setIsSubmitting(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Progress header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Academic Onboarding</h1>
              <p className="text-xs text-slate-400">Personalize StudyMate for your specific discipline</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
            <span>Step {step} of 3</span>
          </div>
        </div>

        {/* Step 1: Category & Field */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">What is your primary academic domain?</h2>
              <p className="text-xs text-slate-400 mt-1">StudyMate tailors Socratic AI prompts to your specific field.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Academic Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.keys(CATEGORIES).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setField(CATEGORIES[cat][0]);
                    }}
                    className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      category === cat
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                        : "bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Primary Major or Subject Field</label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {(CATEGORIES[category] || []).map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Next: Academic Targets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Targets & Goals */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Set your academic targets</h2>
              <p className="text-xs text-slate-400 mt-1">Configure study goals and grade ambitions.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Target Grade Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADE_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setTargetGrade(g)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        targetGrade === g
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/50"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Weekly Goal ({studyGoalHours} Hours)
                </label>
                <input
                  type="range"
                  min={2}
                  max={30}
                  step={1}
                  value={studyGoalHours}
                  onChange={(e) => setStudyGoalHours(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                  <span>2 hrs (Light)</span>
                  <span>15 hrs (Moderate)</span>
                  <span>30 hrs (Intense)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Learning Goal Statement</label>
              <textarea
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-6 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm rounded-2xl cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Next: Learning Style</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Learning Style */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Select preferred learning style</h2>
              <p className="text-xs text-slate-400 mt-1">StudyMate auto-generates content formats matching your learning preference.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {STYLE_OPTIONS.map((style) => (
                <div
                  key={style.value}
                  onClick={() => setLearningStyle(style.value)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    learningStyle === style.value
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                      : "bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      learningStyle === style.value ? "border-indigo-400 bg-indigo-500" : "border-slate-600"
                    }`}
                  >
                    {learningStyle === style.value && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">{style.label}</div>
                    <div className="text-xs text-slate-400 leading-relaxed mt-0.5">{style.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3.5 px-6 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm rounded-2xl cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Complete Setup & Enter StudyMate</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
