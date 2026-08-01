/**
 * academicIntelligence.routes.ts
 * REST API Routes for Phase 3.2 Academic Intelligence Engine.
 * Zero business logic inside route controllers. Delegates directly to AcademicIntelligenceService.
 */

import { Router, Request, Response } from "express";
import { academicIntelligenceService } from "../services/AcademicIntelligenceService";
import { DEFAULT_5_POINT_SCALE, DEFAULT_4_POINT_SCALE } from "../domain/AcademicIntelligenceDomain";

const router = Router();

// Middleware to extract user ID (defaulting to "default_user")
const getUserId = (req: Request): string => {
  return (req.headers["x-user-id"] as string) || "default_user";
};

/**
 * GET /dashboard
 * Returns comprehensive academic dashboard metrics.
 */
router.get("/dashboard", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const dashboard = academicIntelligenceService.getDashboard(userId);
    res.json({ success: true, data: dashboard });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /gpa
 * Returns latest semester GPA.
 */
router.get("/gpa", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const dashboard = academicIntelligenceService.getDashboard(userId);
    res.json({
      success: true,
      data: {
        currentGPA: dashboard.currentGPA,
        latestSemester: dashboard.latestSemester,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /cgpa
 * Returns overall CGPA and graduation class.
 */
router.get("/cgpa", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const dashboard = academicIntelligenceService.getDashboard(userId);
    res.json({
      success: true,
      data: {
        cgpa: dashboard.currentCGPA,
        totalQualityPoints: dashboard.totalQualityPoints,
        earnedCredits: dashboard.earnedCredits,
        predictedGraduationClass: dashboard.predictedGraduationClass,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /transcript
 * Returns official transcript layout data.
 */
router.get("/transcript", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const transcript = academicIntelligenceService.getTranscript(userId);
    res.json({ success: true, data: transcript });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /degree-progress
 * Returns degree progress & credit breakdown.
 */
router.get("/degree-progress", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const progressData = academicIntelligenceService.getDegreeProgress(userId);
    res.json({ success: true, data: progressData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /graduation-status
 * Returns graduation eligibility and rule validation details.
 */
router.get("/graduation-status", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const progressData = academicIntelligenceService.getDegreeProgress(userId);
    res.json({ success: true, data: progressData.eligibility });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /standing
 * Returns student's academic standing status.
 */
router.get("/standing", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const dashboard = academicIntelligenceService.getDashboard(userId);
    res.json({
      success: true,
      data: {
        academicStanding: dashboard.academicStanding,
        currentCGPA: dashboard.currentCGPA,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /retake-analysis
 * Returns course retake and carry-over history.
 */
router.get("/retake-analysis", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const retakeData = academicIntelligenceService.getCourseRetakeAnalysis(userId);
    res.json({ success: true, data: retakeData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /calculate
 * Pure on-the-fly semester GPA calculator (without saving).
 */
router.post("/calculate", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { courses } = req.body;
    if (!courses || !Array.isArray(courses)) {
      return res.status(400).json({ success: false, error: "Missing array of courses." });
    }
    const calculation = academicIntelligenceService.calculateTermGPA(userId, courses);
    res.json({ success: true, data: calculation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /semester-results
 * Save new semester results and recalculate running CGPA.
 */
router.post("/semester-results", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { sessionId, semesterId, level, courses } = req.body;
    if (!sessionId || !semesterId || !courses || !Array.isArray(courses)) {
      return res.status(400).json({ success: false, error: "Invalid semester payload." });
    }
    const record = academicIntelligenceService.saveSemesterResult(userId, {
      sessionId,
      semesterId,
      level: level || "100 Level",
      courses,
    });
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /simulate
 * Run What-If CGPA Simulation.
 */
router.post("/simulate", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { courses } = req.body;
    if (!courses || !Array.isArray(courses)) {
      return res.status(400).json({ success: false, error: "Missing hypothetical courses array." });
    }
    const simulationResult = academicIntelligenceService.runWhatIfSimulation(userId, courses);
    res.json({ success: true, data: simulationResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /grading-scale
 * Set or switch student's active grading scale (5.0 or 4.0 or custom).
 */
router.post("/grading-scale", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { scaleType, customScale } = req.body;
    let selectedScale = DEFAULT_5_POINT_SCALE;

    if (scaleType === "4.0") {
      selectedScale = DEFAULT_4_POINT_SCALE;
    } else if (scaleType === "custom" && customScale) {
      selectedScale = customScale;
    }

    const updatedConfig = academicIntelligenceService.updateGradingScale(userId, selectedScale);
    res.json({ success: true, data: updatedConfig });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /transcript/export
 * Export transcript metadata / payload for PDF print render.
 */
router.post("/transcript/export", (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const transcript = academicIntelligenceService.getTranscript(userId);
    res.json({
      success: true,
      data: {
        exportTimestamp: new Date().toISOString(),
        transcript,
        printableFormatted: true,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
