/**
 * studyTools.routes.ts
 * Express API routes for Phase 2.4 - Intelligent Study Tools.
 */

import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { studyToolsService } from "../services/StudyToolsService.js";

const router = Router();

/**
 * POST /api/v1/study-tools/summary
 * AI Summary Generator
 */
router.post("/summary", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const { documentId, summaryType = "executive", length = "medium", topicFocus } = req.body;

    const result = await studyToolsService.generateSummary({
      userId,
      documentId,
      summaryType,
      length,
      topicFocus,
    });

    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate summary." });
  }
});

/**
 * POST /api/v1/study-tools/flashcards
 * Smart Flashcard Generator
 */
router.post("/flashcards", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const { documentId, cardCount = 8, cardTypes } = req.body;

    const flashcards = await studyToolsService.generateFlashcards({
      userId,
      documentId,
      cardCount,
      cardTypes,
    });

    return res.json({ success: true, count: flashcards.length, flashcards });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate flashcards." });
  }
});

/**
 * POST /api/v1/study-tools/flashcards/review
 * Review a flashcard and recalculate SM-2 interval
 */
router.post("/flashcards/review", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentEF = 2.5, currentInterval = 1, repetitions = 0, grade = 4 } = req.body;

    const sm2 = studyToolsService.calculateSM2NextReview(
      Number(currentEF),
      Number(currentInterval),
      Number(repetitions),
      Number(grade)
    );

    return res.json({ success: true, sm2Data: sm2 });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update SM-2 schedule." });
  }
});

/**
 * POST /api/v1/study-tools/quiz
 * AI Quiz Generator
 */
router.post("/quiz", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const { documentId, questionCount = 5, questionTypes, difficulty = "adaptive", topicFocus } = req.body;

    const quiz = await studyToolsService.generateQuiz({
      userId,
      documentId,
      questionCount,
      questionTypes,
      difficulty,
      topicFocus,
    });

    return res.json({ success: true, count: quiz.length, quiz });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate quiz." });
  }
});

/**
 * POST /api/v1/study-tools/practice-exam
 * Practice Exam Generator
 */
router.post("/practice-exam", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const { documentId, examType = "1hour", timedMinutes, subjectTitle } = req.body;

    const exam = await studyToolsService.generatePracticeExam({
      userId,
      documentId,
      examType,
      timedMinutes,
      subjectTitle,
    });

    return res.json({ success: true, exam });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate practice exam." });
  }
});

/**
 * POST /api/v1/study-tools/practice-exam/grade
 * Practice Exam Auto-Marker & Performance Report
 */
router.post("/practice-exam/grade", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const { examId, answers, timeSpentSeconds, questionsList } = req.body;

    const report = await studyToolsService.gradeExamSubmission(
      { examId, userId, answers: answers || {}, timeSpentSeconds: timeSpentSeconds || 0 },
      questionsList || []
    );

    return res.json({ success: true, report });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to grade practice exam." });
  }
});

/**
 * POST /api/v1/study-tools/notes
 * AI Notes Generator
 */
router.post("/notes", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const { documentId, noteFormat = "lecture", topicFocus } = req.body;

    const notes = await studyToolsService.generateNotes({
      userId,
      documentId,
      noteFormat,
      topicFocus,
    });

    return res.json({ success: true, ...notes });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate notes." });
  }
});

/**
 * POST /api/v1/study-tools/concept-map
 * Concept Map Generator
 */
router.post("/concept-map", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const { documentId, topicFocus } = req.body;

    const conceptMap = await studyToolsService.generateConceptMap({
      userId,
      documentId,
      topicFocus,
    });

    return res.json({ success: true, conceptMap });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate concept map." });
  }
});

/**
 * POST /api/v1/study-tools/revision-pack
 * One-click Revision Pack Generator
 */
router.post("/revision-pack", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const { documentId } = req.body;

    const revisionPack = await studyToolsService.generateRevisionPack({
      userId,
      documentId,
    });

    return res.json({ success: true, revisionPack });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate revision pack." });
  }
});

/**
 * POST /api/v1/study-tools/tutor-mode
 * AI Tutor Modes Endpoint
 */
router.post("/tutor-mode", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const { query, mode = "teacher", documentId } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required for tutor mode." });
    }

    const result = await studyToolsService.queryTutorMode({
      userId,
      documentId,
      query,
      mode,
    });

    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to run tutor mode query." });
  }
});

/**
 * POST /api/v1/study-tools/learning-session
 * Guided Learning Session Generator
 */
router.post("/learning-session", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || "guest";
    const { documentId, durationMinutes = 45 } = req.body;

    const session = await studyToolsService.generateLearningSession({
      userId,
      documentId,
      durationMinutes,
    });

    return res.json({ success: true, session });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate learning session." });
  }
});

export default router;
