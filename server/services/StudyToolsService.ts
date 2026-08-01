/**
 * StudyToolsService.ts
 * Core domain service for Phase 2.4 - Intelligent Study Tools.
 * Generates grounded, personalized study artifacts using Gemini 3.6 Flash / 3.1 Pro & Learner Memory Engine.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { vectorSearchService } from "../pipeline/services/VectorSearchService.js";
import { contextBuilderService } from "../pipeline/services/ContextBuilderService.js";
import { memoryService } from "./MemoryService.js";

export interface StudyToolRequestBase {
  documentId?: string;
  userId: string;
  studentLevel?: "beginner" | "intermediate" | "advanced" | "elite";
}

// ----------------------------------------------------
// Interfaces for Features
// ----------------------------------------------------

export interface SummaryOptions extends StudyToolRequestBase {
  summaryType: "executive" | "chapter" | "section" | "revision_sheet" | "key_takeaways" | "definitions" | "formula_sheet" | "timeline";
  length: "short" | "medium" | "detailed";
  topicFocus?: string;
}

export interface FlashcardItem {
  id: string;
  cardType: "definition" | "concept" | "formula" | "code" | "scenario" | "image_placeholder";
  question: string;
  answer: string;
  explanation: string;
  tags: string[];
  formula?: string;
  codeSnippet?: string;
  scenario?: string;
  imagePlaceholderPrompt?: string;
  sm2Data: {
    easinessFactor: number;
    intervalDays: number;
    repetitions: number;
    nextReviewDate: string;
  };
}

export interface FlashcardOptions extends StudyToolRequestBase {
  cardCount?: number;
  cardTypes?: ("definition" | "concept" | "formula" | "code" | "scenario" | "image_placeholder")[];
}

export interface QuizQuestionItem {
  id: string;
  type: "multiple_choice" | "true_false" | "fill_blank" | "short_answer" | "essay";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

export interface QuizOptions extends StudyToolRequestBase {
  questionCount?: number;
  questionTypes?: ("multiple_choice" | "true_false" | "fill_blank" | "short_answer" | "essay")[];
  difficulty?: "easy" | "medium" | "hard" | "adaptive";
  topicFocus?: string;
}

export interface PracticeExamOptions extends StudyToolRequestBase {
  examType: "30min" | "1hour" | "past_question" | "mock" | "departmental";
  timedMinutes?: number;
  subjectTitle?: string;
}

export interface PracticeExam {
  id: string;
  examTitle: string;
  subject: string;
  timeLimitMinutes: number;
  totalMarks: number;
  instructions: string[];
  sections: {
    sectionTitle: string;
    instructions: string;
    questions: QuizQuestionItem[];
  }[];
}

export interface ExamSubmission {
  examId: string;
  userId: string;
  answers: Record<string, string>; // questionId -> user answer
  timeSpentSeconds: number;
}

export interface ExamPerformanceReport {
  scorePercentage: number;
  grade: "A" | "B" | "C" | "D" | "F";
  passed: boolean;
  totalMarksEarned: number;
  totalMarksPossible: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  questionResults: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    marksAwarded: number;
    feedback: string;
  }[];
}

export interface NotesOptions extends StudyToolRequestBase {
  noteFormat: "lecture" | "revision" | "condensed" | "exam" | "bullet" | "mind";
  topicFocus?: string;
}

export interface ConceptMapNode {
  id: string;
  label: string;
  type: "main" | "subtopic" | "concept" | "prerequisite";
  description: string;
  masteryLevel: number; // 0 - 100
}

export interface ConceptMapEdge {
  id: string;
  source: string;
  target: string;
  label: string; // e.g., "depends on", "leads to", "contains"
  relationType: "prerequisite" | "hierarchy" | "causal" | "example";
}

export interface ConceptMap {
  topicTitle: string;
  nodes: ConceptMapNode[];
  edges: ConceptMapEdge[];
  recommendedLearningOrder: string[];
}

export interface RevisionPack {
  id: string;
  title: string;
  generatedAt: string;
  executiveSummary: string;
  flashcards: FlashcardItem[];
  quiz: QuizQuestionItem[];
  formulaSheet: string[];
  importantDefinitions: { term: string; definition: string }[];
  commonMistakes: string[];
  likelyExamQuestions: { question: string; modelAnswer: string }[];
  revisionChecklist: { id: string; item: string; completed: boolean }[];
}

export interface TutorModeOptions extends StudyToolRequestBase {
  query: string;
  mode: "teacher" | "beginner" | "expert" | "exam_coach" | "practical" | "step_by_step" | "analogy" | "eli5" | "socratic" | "interview_prep";
}

export interface LearningSession {
  id: string;
  sessionTitle: string;
  estimatedMinutes: number;
  phases: {
    phaseNumber: number;
    title: string; // Warm-up, Concept, Example, Practice, Quiz, Reflection, Recommendation
    durationMinutes: number;
    content: string;
    interactivePrompt?: string;
    quizQuestions?: QuizQuestionItem[];
  }[];
}

// ----------------------------------------------------
// Service Class Implementation
// ----------------------------------------------------

export class StudyToolsService {
  private aiClient: GoogleGenAI | null = null;

  private getAI(): GoogleGenAI {
    if (!this.aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required.");
      }
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { "User-Agent": "aistudio-build" },
        },
      });
    }
    return this.aiClient;
  }

  /**
   * Helper: Retrieve grounded document context & learner memory profile
   */
  private async getGroundedContextAndProfile(userId: string, documentId?: string, queryFocus?: string) {
    const query = queryFocus || "key concepts definitions formulas exam topics study materials";
    const searchRes = await vectorSearchService.search(query, {
      userId,
      documentId,
      topK: 10,
    }).catch(() => ({ results: [] }));

    const builtContext = contextBuilderService.buildContext(searchRes.results, 4000);
    const profile = await memoryService.getLearnerProfile(userId).catch(() => null);

    const contextText = builtContext.formattedContextText !== "NO_DOCUMENTS_RETRIEVED"
      ? builtContext.formattedContextText
      : "General Academic Materials";

    const profileText = `
LEARNER PERSONAL PROFILE:
- Degree/Major: ${profile?.academicField || "General Studies"}
- Preferred Style: ${profile?.preferredExplanationStyle || "Step-by-step with practical examples"}
- Weak Topics: ${profile?.weakTopics?.join(", ") || "None recorded"}
- Strong Topics: ${profile?.strongTopics?.join(", ") || "None"}
- Known Facts: ${profile?.persistentMemories?.map(m => `[${m.topic}]: ${m.content}`).join("; ") || "None"}
`;

    return { contextText, profileText, profile };
  }

  // ====================================================
  // FEATURE 1: AI Summary Generator
  // ====================================================
  public async generateSummary(options: SummaryOptions): Promise<{ summaryText: string; metadata: any }> {
    const ai = this.getAI();
    const { contextText, profileText } = await this.getGroundedContextAndProfile(
      options.userId,
      options.documentId,
      options.topicFocus || options.summaryType
    );

    const prompt = `
Generate a grounded, highly structured study summary.

SUMMARY TYPE: ${options.summaryType.toUpperCase()}
DESIRED LENGTH: ${options.length.toUpperCase()}

${profileText}

STUDY MATERIAL CONTEXT:
${contextText}

INSTRUCTIONS:
1. Base all facts strictly on the provided study materials.
2. Structure output cleanly using Markdown headers, bullet points, bold key terms, and highlighted callout blocks.
3. Tailor explanation depth to the learner's degree level and preferred style.
4. Include a "Key Takeaways" section at the bottom.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return {
      summaryText: response.text || "Failed to generate summary.",
      metadata: {
        type: options.summaryType,
        length: options.length,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  // ====================================================
  // FEATURE 2: Smart Flashcard Generator (with SM-2)
  // ====================================================
  public async generateFlashcards(options: FlashcardOptions): Promise<FlashcardItem[]> {
    const ai = this.getAI();
    const cardCount = options.cardCount || 8;
    const requestedTypes = options.cardTypes?.length
      ? options.cardTypes
      : ["definition", "concept", "formula", "code", "scenario", "image_placeholder"];

    const { contextText, profileText } = await this.getGroundedContextAndProfile(
      options.userId,
      options.documentId,
      "definitions formulas concepts code scenarios"
    );

    const prompt = `
Generate exactly ${cardCount} high-yield smart flashcards for an academic student based on the uploaded materials.

ALLOWED CARD TYPES: ${requestedTypes.join(", ")}

${profileText}

STUDY MATERIAL CONTEXT:
${contextText}

OUTPUT REQUIREMENTS:
Return a JSON array of flashcard objects matching this exact JSON schema:
[
  {
    "cardType": "definition | concept | formula | code | scenario | image_placeholder",
    "question": "Clear, precise front side prompt",
    "answer": "Accurate, concise back side answer",
    "explanation": "Detailed pedagogical breakdown",
    "tags": ["topic", "tag"],
    "formula": "LaTeX or plain formula string if formula card, else empty",
    "codeSnippet": "Code snippet string if code card, else empty",
    "scenario": "Problem situation string if scenario card, else empty",
    "imagePlaceholderPrompt": "Descriptive visual diagram prompt if image_placeholder, else empty"
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      const parsed = JSON.parse(response.text || "[]");
      const today = new Date().toISOString().split("T")[0];

      return parsed.map((item: any, idx: number) => ({
        id: `fc_${Date.now()}_${idx}`,
        cardType: item.cardType || "concept",
        question: item.question || "Question",
        answer: item.answer || "Answer",
        explanation: item.explanation || "",
        tags: Array.isArray(item.tags) ? item.tags : ["study"],
        formula: item.formula || "",
        codeSnippet: item.codeSnippet || "",
        scenario: item.scenario || "",
        imagePlaceholderPrompt: item.imagePlaceholderPrompt || "",
        sm2Data: {
          easinessFactor: 2.5,
          intervalDays: 1,
          repetitions: 0,
          nextReviewDate: today,
        },
      }));
    } catch (e) {
      console.error("Failed to parse flashcards JSON:", e);
      return [];
    }
  }

  /**
   * Calculates next review date based on SM-2 spaced repetition algorithm
   * Grade: 0 (total failure) to 5 (perfect recall)
   */
  public calculateSM2NextReview(
    currentEF: number,
    currentInterval: number,
    repetitions: number,
    grade: number
  ) {
    let nextEF = currentEF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (nextEF < 1.3) nextEF = 1.3;

    let nextInterval = 1;
    let nextRepetitions = repetitions;

    if (grade >= 3) {
      if (repetitions === 0) {
        nextInterval = 1;
      } else if (repetitions === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(currentInterval * nextEF);
      }
      nextRepetitions = repetitions + 1;
    } else {
      nextRepetitions = 0;
      nextInterval = 1;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextInterval);

    return {
      easinessFactor: Math.round(nextEF * 100) / 100,
      intervalDays: nextInterval,
      repetitions: nextRepetitions,
      nextReviewDate: nextDate.toISOString().split("T")[0],
    };
  }

  // ====================================================
  // FEATURE 3: AI Quiz Generator
  // ====================================================
  public async generateQuiz(options: QuizOptions): Promise<QuizQuestionItem[]> {
    const ai = this.getAI();
    const questionCount = options.questionCount || 5;
    const difficulty = options.difficulty || "adaptive";
    const types = options.questionTypes?.length
      ? options.questionTypes
      : ["multiple_choice", "true_false", "short_answer"];

    const { contextText, profileText, profile } = await this.getGroundedContextAndProfile(
      options.userId,
      options.documentId,
      options.topicFocus || "key exam questions concept checks"
    );

    const prompt = `
Generate a high-quality academic quiz with ${questionCount} questions grounded in the study materials.

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
ALLOWED TYPES: ${types.join(", ")}

${profileText}

STUDY MATERIAL CONTEXT:
${contextText}

REQUIREMENTS:
1. Ground every question directly in facts from the study material context.
2. If difficulty is "adaptive", target the learner's known weak topics: ${profile?.weakTopics?.join(", ") || "general topics"}.
3. Every question MUST include a comprehensive "explanation" detailing why the answer is correct and why other options are wrong.

Return JSON array matching this schema:
[
  {
    "type": "multiple_choice | true_false | fill_blank | short_answer | essay",
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"], // Optional for non-MCQ
    "correctAnswer": "Exact string of correct answer",
    "explanation": "Clear step-by-step breakdown",
    "hint": "Subtle hint to guide student",
    "difficulty": "easy | medium | hard",
    "topic": "Specific subtopic"
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    try {
      const parsed = JSON.parse(response.text || "[]");
      return parsed.map((q: any, idx: number) => ({
        id: `qz_${Date.now()}_${idx}`,
        type: q.type || "multiple_choice",
        question: q.question || "",
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || "Grounded explanation provided.",
        hint: q.hint || "",
        difficulty: q.difficulty || "medium",
        topic: q.topic || "General",
      }));
    } catch (e) {
      console.error("Failed to parse quiz JSON:", e);
      return [];
    }
  }

  // ====================================================
  // FEATURE 4: Practice Exam Generator & Auto Marker
  // ====================================================
  public async generatePracticeExam(options: PracticeExamOptions): Promise<PracticeExam> {
    const ai = this.getAI();
    const timedMinutes = options.timedMinutes || (options.examType === "30min" ? 30 : 60);

    const { contextText, profileText } = await this.getGroundedContextAndProfile(
      options.userId,
      options.documentId,
      "exam questions final test departmental assessment"
    );

    const prompt = `
Create a realistic practice examination for an academic course.

EXAM MODE: ${options.examType.toUpperCase()}
TIME LIMIT: ${timedMinutes} minutes
COURSE/SUBJECT: ${options.subjectTitle || "Academic Coursework"}

${profileText}

STUDY MATERIAL CONTEXT:
${contextText}

STRUCTURE:
Section A: Multiple Choice & Short Answer (Knowledge & Recall)
Section B: Scenario & Problem Solving (Application)

Return JSON object matching this schema:
{
  "examTitle": "${options.subjectTitle || "Course"} Practice Exam - ${options.examType.toUpperCase()}",
  "subject": "${options.subjectTitle || "General Studies"}",
  "timeLimitMinutes": ${timedMinutes},
  "totalMarks": 100,
  "instructions": [
    "Answer all questions carefully.",
    "Time limit is strictly enforced.",
    "Explain all steps where applicable."
  ],
  "sections": [
    {
      "sectionTitle": "Section A: Core Concepts",
      "instructions": "Attempt all multiple choice and short answer questions.",
      "questions": [
        {
          "id": "ex_q1",
          "type": "multiple_choice",
          "question": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Why A is correct",
          "hint": "Hint",
          "difficulty": "medium",
          "topic": "Topic"
        }
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return {
        id: `exam_${Date.now()}`,
        examTitle: parsed.examTitle || "Academic Practice Exam",
        subject: parsed.subject || "General",
        timeLimitMinutes: parsed.timeLimitMinutes || timedMinutes,
        totalMarks: parsed.totalMarks || 100,
        instructions: parsed.instructions || ["Read carefully before answering."],
        sections: parsed.sections || [],
      };
    } catch (e) {
      console.error("Failed to parse exam JSON:", e);
      throw new Error("Failed to generate practice exam structure.");
    }
  }

  public async gradeExamSubmission(submission: ExamSubmission, questionsList: QuizQuestionItem[]): Promise<ExamPerformanceReport> {
    let totalMarksPossible = questionsList.length * 10;
    let totalMarksEarned = 0;
    const results: any[] = [];
    const strengthsSet = new Set<string>();
    const weaknessesSet = new Set<string>();

    for (const q of questionsList) {
      const userAns = (submission.answers[q.id] || "").trim();
      const correctAns = (q.correctAnswer || "").trim();

      const isExactMatch = userAns.toLowerCase() === correctAns.toLowerCase();
      let marksAwarded = isExactMatch ? 10 : 0;
      let feedback = isExactMatch ? "Correct answer!" : `Incorrect. Expected: ${correctAns}`;

      if (isExactMatch) {
        totalMarksEarned += 10;
        strengthsSet.add(q.topic);
      } else {
        weaknessesSet.add(q.topic);
      }

      results.push({
        questionId: q.id,
        question: q.question,
        userAnswer: userAns || "[No Answer Provided]",
        correctAnswer: correctAns,
        isCorrect: isExactMatch,
        marksAwarded,
        feedback,
      });
    }

    const pct = totalMarksPossible > 0 ? Math.round((totalMarksEarned / totalMarksPossible) * 100) : 0;
    let grade: "A" | "B" | "C" | "D" | "F" = "F";
    if (pct >= 85) grade = "A";
    else if (pct >= 70) grade = "B";
    else if (pct >= 60) grade = "C";
    else if (pct >= 50) grade = "D";

    // Trigger memory update for weak topics asynchronously
    if (weaknessesSet.size > 0) {
      memoryService.saveMemoryFact(submission.userId, {
        memoryType: "weakness",
        topic: Array.from(weaknessesSet)[0],
        content: `Needs revision on ${Array.from(weaknessesSet).join(", ")} based on practice exam result.`,
        source: "exam_result",
      }).catch(() => {});
    }

    return {
      scorePercentage: pct,
      grade,
      passed: pct >= 50,
      totalMarksEarned,
      totalMarksPossible,
      strengths: Array.from(strengthsSet),
      weaknesses: Array.from(weaknessesSet),
      recommendations: [
        pct < 70 ? "Review the formula sheet and key definitions." : "Great job! Keep practicing advanced questions.",
        "Take a timed 15-minute quiz on identified weak topics.",
      ],
      questionResults: results,
    };
  }

  // ====================================================
  // FEATURE 5: AI Notes Generator (Printable PDF ready)
  // ====================================================
  public async generateNotes(options: NotesOptions): Promise<{ notesMarkdown: string; printableHtml: string }> {
    const ai = this.getAI();
    const { contextText, profileText } = await this.getGroundedContextAndProfile(
      options.userId,
      options.documentId,
      options.topicFocus || options.noteFormat
    );

    const prompt = `
Generate comprehensive academic notes from the uploaded study material.

NOTE FORMAT: ${options.noteFormat.toUpperCase()}

${profileText}

STUDY MATERIAL CONTEXT:
${contextText}

INSTRUCTIONS:
1. Format with clean Markdown headers (#, ##, ###), LaTeX formulas, callout blocks (> **Exam Tip:** ...), and bold definitions.
2. Structure logically with an Overview, Core Concepts, Step-by-Step Breakdown, Key Formulas/Definitions, and Summary.
3. Ensure layout is ready for print/export to PDF.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const md = response.text || "No notes generated.";
    const printableHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
        <h1 style="border-bottom: 2px solid #6366f1; padding-bottom: 8px;">Academic Study Notes (${options.noteFormat.toUpperCase()})</h1>
        <div style="line-height: 1.6;">${md.replace(/\n/g, "<br/>")}</div>
      </div>
    `;

    return { notesMarkdown: md, printableHtml };
  }

  // ====================================================
  // FEATURE 6: Concept Map Generator
  // ====================================================
  public async generateConceptMap(options: StudyToolRequestBase & { topicFocus?: string }): Promise<ConceptMap> {
    const ai = this.getAI();
    const { contextText, profileText } = await this.getGroundedContextAndProfile(
      options.userId,
      options.documentId,
      options.topicFocus || "topics hierarchy prerequisites graph"
    );

    const prompt = `
Generate a hierarchical concept map representation of the course topics found in the study material.

${profileText}

STUDY MATERIAL CONTEXT:
${contextText}

OUTPUT SCHEMA (JSON):
{
  "topicTitle": "Main Subject Title",
  "nodes": [
    {
      "id": "node_1",
      "label": "Core Subject",
      "type": "main | subtopic | concept | prerequisite",
      "description": "Brief summary",
      "masteryLevel": 75
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_1",
      "target": "node_2",
      "label": "requires understanding of",
      "relationType": "prerequisite | hierarchy | causal | example"
    }
  ],
  "recommendedLearningOrder": ["node_1", "node_2"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return {
        topicTitle: parsed.topicTitle || "Subject Overview",
        nodes: parsed.nodes || [],
        edges: parsed.edges || [],
        recommendedLearningOrder: parsed.recommendedLearningOrder || [],
      };
    } catch (e) {
      console.error("Failed to parse concept map JSON:", e);
      return { topicTitle: "Concept Map", nodes: [], edges: [], recommendedLearningOrder: [] };
    }
  }

  // ====================================================
  // FEATURE 7: Revision Pack Generator
  // ====================================================
  public async generateRevisionPack(options: StudyToolRequestBase): Promise<RevisionPack> {
    const [summary, flashcards, quiz] = await Promise.all([
      this.generateSummary({ ...options, summaryType: "revision_sheet", length: "detailed" }),
      this.generateFlashcards({ ...options, cardCount: 8 }),
      this.generateQuiz({ ...options, questionCount: 5, difficulty: "adaptive" }),
    ]);

    const ai = this.getAI();
    const { contextText } = await this.getGroundedContextAndProfile(options.userId, options.documentId, "formulas definitions mistakes exam questions");

    const prompt = `
Generate supplemental revision pack data for uploaded materials.

CONTEXT:
${contextText}

OUTPUT JSON:
{
  "formulaSheet": ["Formula 1 - Description", "Formula 2 - Description"],
  "importantDefinitions": [{"term": "Term 1", "definition": "Definition 1"}],
  "commonMistakes": ["Pitfall 1 to avoid in exams", "Pitfall 2"],
  "likelyExamQuestions": [{"question": "Exam Q1", "modelAnswer": "Model answer 1"}],
  "revisionChecklist": [{"id": "chk_1", "item": "Review Core Theorem 1", "completed": false}]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    let extraData: any = {};
    try {
      extraData = JSON.parse(response.text || "{}");
    } catch (e) {}

    return {
      id: `revpack_${Date.now()}`,
      title: "Complete Master Revision Pack",
      generatedAt: new Date().toISOString(),
      executiveSummary: summary.summaryText,
      flashcards,
      quiz,
      formulaSheet: extraData.formulaSheet || [],
      importantDefinitions: extraData.importantDefinitions || [],
      commonMistakes: extraData.commonMistakes || [],
      likelyExamQuestions: extraData.likelyExamQuestions || [],
      revisionChecklist: extraData.revisionChecklist || [],
    };
  }

  // ====================================================
  // FEATURE 8: AI Tutor Modes
  // ====================================================
  public async queryTutorMode(options: TutorModeOptions): Promise<{ answer: string; mode: string }> {
    const ai = this.getAI();
    const { contextText, profileText } = await this.getGroundedContextAndProfile(options.userId, options.documentId, options.query);

    const modeInstructions: Record<string, string> = {
      teacher: "Act as an encouraging, structured university lecturer.",
      beginner: "Assume zero prior knowledge. Use high simplicity, foundational definitions, and friendly tone.",
      expert: "Provide deep, rigorous academic explanation with full technical terminology and mathematical proofs.",
      exam_coach: "Focus heavily on how this topic is tested in exams, marking criteria, and common traps.",
      practical: "Use real-world industrial and laboratory case studies to demonstrate practical applications.",
      step_by_step: "Break down the solution into numbered sequential steps with clear logical transitions.",
      analogy: "Explain the entire concept using an engaging real-world everyday analogy.",
      eli5: "Explain like I'm 5 years old using simple everyday concepts.",
      socratic: "Do not give direct answers immediately. Ask guiding questions to help the student derive the answer.",
      interview_prep: "Frame the question as a top tech/industry technical interview question with STAR response guidance.",
    };

    const modePrompt = modeInstructions[options.mode] || modeInstructions.teacher;

    const prompt = `
${modePrompt}

${profileText}

STUDY MATERIAL CONTEXT:
${contextText}

STUDENT QUESTION:
"${options.query}"

ANSWER REQUIREMENT:
Provide a grounded response following the chosen mode (${options.mode.toUpperCase()}) and personalized for the student.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return {
      answer: response.text || "No response generated.",
      mode: options.mode,
    };
  }

  // ====================================================
  // FEATURE 9: Guided Learning Session Generator
  // ====================================================
  public async generateLearningSession(options: StudyToolRequestBase & { durationMinutes?: number }): Promise<LearningSession> {
    const ai = this.getAI();
    const duration = options.durationMinutes || 45;

    const { contextText, profileText } = await this.getGroundedContextAndProfile(options.userId, options.documentId, "guided study session syllabus");

    const prompt = `
Design a structured, interactive 7-phase guided learning study session of ${duration} minutes.

PHASES REQUIRED:
1. Warm-up Review (Quick recall)
2. Concept Teaching (Main topic explanation)
3. Practical Examples (Real world walkthrough)
4. Practice Questions (Self-test exercises)
5. Quiz Check
6. Reflection (Self-assessment)
7. Revision Recommendation

${profileText}

STUDY MATERIAL CONTEXT:
${contextText}

OUTPUT JSON:
{
  "sessionTitle": "Mastery Session - Subject",
  "estimatedMinutes": ${duration},
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Warm-up Review",
      "durationMinutes": 5,
      "content": "Recall core concepts from previous lesson",
      "interactivePrompt": "What is the primary function of..."
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return {
        id: `session_${Date.now()}`,
        sessionTitle: parsed.sessionTitle || "Guided Study Session",
        estimatedMinutes: parsed.estimatedMinutes || duration,
        phases: parsed.phases || [],
      };
    } catch (e) {
      console.error("Failed to parse learning session JSON:", e);
      throw new Error("Failed to generate guided learning session.");
    }
  }
}

export const studyToolsService = new StudyToolsService();
