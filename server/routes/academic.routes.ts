/**
 * academic.routes.ts
 * Express router for Phase 3.1 Academic Management Subsystem.
 * Provides RESTful API endpoints at /api/v1/academic/*
 */

import { Router, Request, Response } from "express";
import { academicService } from "../services/AcademicService.js";

const router = Router();

// Helper to extract active user ID
const getUserId = (req: Request): string => {
  const headerUser = req.headers["x-user-id"];
  if (typeof headerUser === "string" && headerUser.trim().length > 0) {
    return headerUser.trim();
  }
  return "guest";
};

// 1. DASHBOARD
router.get("/dashboard", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const summary = await academicService.getDashboardSummary(userId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to fetch academic dashboard" });
  }
});

// 2. STUDENT ACADEMIC PROFILE
router.get("/profile", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const profile = await academicService.getProfile(userId);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Failed to fetch student profile" });
  }
});

router.post("/profile", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const updated = await academicService.updateProfile(userId, req.body);
    res.json({ success: true, data: updated, message: "Academic profile updated successfully" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Failed to update profile" });
  }
});

// 3. INSTITUTIONS
router.get("/institutions", async (req: Request, res: Response) => {
  try {
    const data = await academicService.getInstitutions();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/institutions", async (req: Request, res: Response) => {
  try {
    const data = await academicService.addInstitution(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 4. FACULTIES
router.get("/faculties", async (req: Request, res: Response) => {
  try {
    const institutionId = req.query.institutionId as string | undefined;
    const data = await academicService.getFaculties(institutionId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/faculties", async (req: Request, res: Response) => {
  try {
    const data = await academicService.addFaculty(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 5. DEPARTMENTS
router.get("/departments", async (req: Request, res: Response) => {
  try {
    const facultyId = req.query.facultyId as string | undefined;
    const data = await academicService.getDepartments(facultyId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/departments", async (req: Request, res: Response) => {
  try {
    const data = await academicService.addDepartment(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 6. PROGRAMMES
router.get("/programmes", async (req: Request, res: Response) => {
  try {
    const departmentId = req.query.departmentId as string | undefined;
    const data = await academicService.getProgrammes(departmentId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/programmes", async (req: Request, res: Response) => {
  try {
    const data = await academicService.addProgramme(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 7. SESSIONS
router.get("/sessions", async (req: Request, res: Response) => {
  try {
    const data = await academicService.getSessions();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/sessions", async (req: Request, res: Response) => {
  try {
    const data = await academicService.addSession(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

router.patch("/sessions/:id/activate", async (req: Request, res: Response) => {
  try {
    const data = await academicService.activateSession(req.params.id);
    res.json({ success: true, data, message: "Academic session activated" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 8. SEMESTERS
router.get("/semesters", async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId as string | undefined;
    const data = await academicService.getSemesters(sessionId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/semesters", async (req: Request, res: Response) => {
  try {
    const data = await academicService.addSemester(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

router.patch("/semesters/:id/activate", async (req: Request, res: Response) => {
  try {
    const data = await academicService.activateSemester(req.params.id);
    res.json({ success: true, data, message: "Semester activated" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 9. COURSE CATEGORIES
router.get("/course-categories", async (req: Request, res: Response) => {
  try {
    const data = await academicService.getCategories();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 10. COURSES
router.get("/courses", async (req: Request, res: Response) => {
  try {
    const filter = {
      level: req.query.level ? parseInt(req.query.level as string) : undefined,
      semester: req.query.semester as string | undefined,
      departmentId: req.query.departmentId as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    };
    const data = await academicService.getCourses(filter);
    res.json({ success: true, data, count: data.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.get("/courses/:id", async (req: Request, res: Response) => {
  try {
    const course = await academicService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }
    res.json({ success: true, data: course });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/courses", async (req: Request, res: Response) => {
  try {
    const data = await academicService.createCourse(req.body);
    res.status(201).json({ success: true, data, message: "Course created successfully" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

router.put("/courses/:id", async (req: Request, res: Response) => {
  try {
    const data = await academicService.updateCourse(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }
    res.json({ success: true, data, message: "Course updated successfully" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

router.delete("/courses/:id", async (req: Request, res: Response) => {
  try {
    const success = await academicService.deleteCourse(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: "Course not found or could not be deleted" });
    }
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 11. COURSE REGISTRATIONS
router.get("/registrations", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const sessionId = req.query.sessionId as string | undefined;
    const semesterId = req.query.semesterId as string | undefined;
    const data = await academicService.getRegistrations(userId, sessionId, semesterId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/registrations", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { courseId, sessionId, semesterId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, error: "courseId is required for registration" });
    }
    const result = await academicService.registerCourse(userId, courseId, sessionId, semesterId);
    res.status(201).json({ success: true, data: result, message: "Course registered successfully" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Course registration failed" });
  }
});

router.delete("/registrations/:courseId", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const courseId = req.params.courseId;
    const sessionId = req.query.sessionId as string | undefined;
    const semesterId = req.query.semesterId as string | undefined;
    const success = await academicService.dropCourse(userId, courseId, sessionId, semesterId);
    res.json({ success, message: success ? "Course dropped successfully" : "Course registration not found" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 12. INSTITUTION BRANDING & PROFILE
router.get("/branding", async (req: Request, res: Response) => {
  try {
    const data = await academicService.getBranding();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/branding", async (req: Request, res: Response) => {
  try {
    const data = await academicService.updateBranding(req.body);
    res.json({ success: true, data, message: "Branding updated successfully" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 13. LECTURER COURSE MATERIALS
router.get("/lecturer-materials", async (req: Request, res: Response) => {
  try {
    const courseCode = req.query.courseCode as string | undefined;
    const data = await academicService.getLecturerMaterials(courseCode);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/lecturer-materials", async (req: Request, res: Response) => {
  try {
    const data = await academicService.addLecturerMaterial(req.body);
    res.status(201).json({ success: true, data, message: "Lecturer material uploaded" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

router.delete("/lecturer-materials/:id", async (req: Request, res: Response) => {
  try {
    const success = await academicService.deleteLecturerMaterial(req.params.id);
    res.json({ success, message: success ? "Material deleted" : "Material not found" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 14. CLASSROOM ATTENDANCE LOGS
router.get("/attendance", async (req: Request, res: Response) => {
  try {
    const classroomId = req.query.classroomId as string | undefined;
    const data = await academicService.getAttendanceRecords(classroomId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/attendance", async (req: Request, res: Response) => {
  try {
    const data = await academicService.addAttendanceRecord(req.body);
    res.status(201).json({ success: true, data, message: "Attendance record saved" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 15. QUESTION BANK
router.get("/question-bank", async (req: Request, res: Response) => {
  try {
    const courseCode = req.query.courseCode as string | undefined;
    const data = await academicService.getQuestionBank(courseCode);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/question-bank", async (req: Request, res: Response) => {
  try {
    const data = await academicService.addQuestionBankItem(req.body);
    res.status(201).json({ success: true, data, message: "Question added to question bank" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 16. EXAMS & ASSESSMENTS
router.get("/exams", async (req: Request, res: Response) => {
  try {
    const classroomId = req.query.classroomId as string | undefined;
    const data = await academicService.getScheduledExams(classroomId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.post("/exams", async (req: Request, res: Response) => {
  try {
    const data = await academicService.createExam(req.body);
    res.status(201).json({ success: true, data, message: "Exam scheduled and published" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

router.post("/exams/:id/submit", async (req: Request, res: Response) => {
  try {
    const examId = req.params.id;
    const submission = { examId, ...req.body };
    const data = await academicService.submitExam(submission);
    res.status(201).json({ success: true, data, message: "Exam submitted and auto-graded successfully" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 17. INSTITUTION ANALYTICS & AT-RISK DIAGNOSTICS
router.get("/analytics", async (req: Request, res: Response) => {
  try {
    const data = await academicService.getInstitutionalMetrics();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

router.get("/at-risk-students", async (req: Request, res: Response) => {
  try {
    const data = await academicService.getAtRiskAlerts();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 18. AI LECTURER ASSISTANT
router.post("/ai-lecturer-assistant", async (req: Request, res: Response) => {
  try {
    const { taskType, topic, courseCode, textContent } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY is required for AI Lecturer Assistant." });
    }

    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    let systemPrompt = "You are StudyMate AI Lecturer Assistant, an expert academic content creator and pedagogical analyst for university professors and lecturers.";
    let userPrompt = "";

    if (taskType === "lecture_notes") {
      userPrompt = `Generate comprehensive, highly structured lecture notes for course ${courseCode || "General"} on topic: "${topic || "Core Principles"}". Include learning objectives, theoretical foundations, key formulas/code blocks, and review questions.`;
    } else if (taskType === "slide_outline") {
      userPrompt = `Generate a slide deck outline (10 slides) for course ${courseCode || "General"} on topic: "${topic || "Core Principles"}". Each slide must have a title, bullet points, and speaker notes.`;
    } else if (taskType === "rubric") {
      userPrompt = `Generate a 4-criteria grading rubric for an assignment on topic: "${topic || "Research Project"}". Provide criterion name, max points, and descriptive expectations.`;
    } else if (taskType === "exam_questions") {
      userPrompt = `Generate 5 challenging exam questions (3 MCQs, 2 Short Answer) with full explanations and answer keys for topic: "${topic || "Academic Assessment"}".`;
    } else {
      userPrompt = `Analyze student performance and generate a pedagogical intervention plan for course ${courseCode || "General"}.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: { systemInstruction: systemPrompt }
    });

    res.json({
      success: true,
      data: {
        taskType,
        topic,
        result: response.text || "AI Assistant generated lecture material successfully."
      }
    });
  } catch (err: any) {
    console.error("AI Lecturer Assistant Error:", err);
    res.status(500).json({ success: false, error: err?.message || "AI Assistant failed to generate content." });
  }
});

export default router;

