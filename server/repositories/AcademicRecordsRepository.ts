/**
 * AcademicRecordsRepository.ts
 * Repository Layer for Phase 3.2 Academic Intelligence Engine.
 * 
 * Single source of truth for:
 * - Semester Result Records
 * - Historical Grades & Credit Units
 * - Course Attempts & Retake Logs
 * - Student Custom Grading Scales
 * - Degree Requirements Config
 */

import { GradingScale, DEFAULT_5_POINT_SCALE } from "../domain/AcademicIntelligenceDomain";

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
  sessionId: string; // e.g. "2023/2024"
  semesterId: string; // e.g. "1st Semester" or "2nd Semester"
  level: string; // e.g. "100 Level"
  courses: StoredCourseGrade[];
  totalRegisteredCredits: number;
  totalPassedCredits: number;
  totalQualityPoints: number;
  gpa: number;
  runningCGPA: number;
  createdAt: string;
}

export interface StudentAcademicConfig {
  userId: string;
  gradingScale: GradingScale;
  targetGraduationClass: string;
  requiredCoreCredits: number;
  requiredElectiveCredits: number;
  requiredGeneralCredits: number;
  totalDegreeCredits: number;
}

// In-Memory Database Store for Academic Records
class AcademicRecordsRepository {
  private semesterRecords: Map<string, SemesterRecord[]> = new Map();
  private studentConfigs: Map<string, StudentAcademicConfig> = new Map();

  constructor() {
    this.seedDefaultStudentData("default_user");
  }

  /**
   * Seed rich realistic academic history for a student.
   */
  public seedDefaultStudentData(userId: string) {
    if (this.semesterRecords.has(userId)) return;

    const record100L_1: SemesterRecord = {
      id: "sem_100_1",
      userId,
      sessionId: "2022/2023",
      semesterId: "1st Semester",
      level: "100 Level",
      totalRegisteredCredits: 18,
      totalPassedCredits: 18,
      totalQualityPoints: 84.0,
      gpa: 4.67,
      runningCGPA: 4.67,
      createdAt: new Date().toISOString(),
      courses: [
        { courseCode: "CSC 101", courseTitle: "Introduction to Computer Science", creditUnit: 3, score: 82, letterGrade: "A", gradePoint: 5.0, qualityPoints: 15.0, category: "Core", passed: true, attemptNumber: 1 },
        { courseCode: "MTH 101", courseTitle: "General Mathematics I", creditUnit: 3, score: 75, letterGrade: "A", gradePoint: 5.0, qualityPoints: 15.0, category: "Core", passed: true, attemptNumber: 1 },
        { courseCode: "PHY 101", courseTitle: "General Physics I", creditUnit: 3, score: 68, letterGrade: "B", gradePoint: 4.0, qualityPoints: 12.0, category: "Core", passed: true, attemptNumber: 1 },
        { courseCode: "CHM 101", courseTitle: "General Chemistry I", creditUnit: 3, score: 71, letterGrade: "A", gradePoint: 5.0, qualityPoints: 15.0, category: "Core", passed: true, attemptNumber: 1 },
        { courseCode: "GST 101", courseTitle: "Use of English & Communication", creditUnit: 2, score: 65, letterGrade: "B", gradePoint: 4.0, qualityPoints: 8.0, category: "General", passed: true, attemptNumber: 1 },
        { courseCode: "GST 103", courseTitle: "Nigerian Peoples and Culture", creditUnit: 2, score: 78, letterGrade: "A", gradePoint: 5.0, qualityPoints: 10.0, category: "General", passed: true, attemptNumber: 1 },
        { courseCode: "CSC 103", courseTitle: "Computer Workshop Practice", creditUnit: 2, score: 85, letterGrade: "A", gradePoint: 5.0, qualityPoints: 9.0, category: "Elective", passed: true, attemptNumber: 1 },
      ],
    };

    const record100L_2: SemesterRecord = {
      id: "sem_100_2",
      userId,
      sessionId: "2022/2023",
      semesterId: "2nd Semester",
      level: "100 Level",
      totalRegisteredCredits: 19,
      totalPassedCredits: 16,
      totalQualityPoints: 81.0,
      gpa: 4.26,
      runningCGPA: 4.46,
      createdAt: new Date().toISOString(),
      courses: [
        { courseCode: "CSC 102", courseTitle: "Introduction to Problem Solving & C", creditUnit: 3, score: 88, letterGrade: "A", gradePoint: 5.0, qualityPoints: 15.0, category: "Core", passed: true, attemptNumber: 1 },
        { courseCode: "MTH 102", courseTitle: "General Mathematics II (Calculus)", creditUnit: 3, score: 62, letterGrade: "B", gradePoint: 4.0, qualityPoints: 12.0, category: "Core", passed: true, attemptNumber: 1 },
        { courseCode: "PHY 102", courseTitle: "General Physics II (Electricity)", creditUnit: 3, score: 58, letterGrade: "C", gradePoint: 3.0, qualityPoints: 9.0, category: "Core", passed: true, attemptNumber: 1 },
        { courseCode: "CHM 102", courseTitle: "General Chemistry II", creditUnit: 3, score: 38, letterGrade: "F", gradePoint: 0.0, qualityPoints: 0.0, category: "Core", passed: false, attemptNumber: 1 },
        { courseCode: "GST 102", courseTitle: "Philosophy & Logic", creditUnit: 2, score: 73, letterGrade: "A", gradePoint: 5.0, qualityPoints: 10.0, category: "General", passed: true, attemptNumber: 1 },
        { courseCode: "CSC 104", courseTitle: "Digital Logic Design Basics", creditUnit: 3, score: 84, letterGrade: "A", gradePoint: 5.0, qualityPoints: 15.0, category: "Elective", passed: true, attemptNumber: 1 },
        { courseCode: "GST 104", courseTitle: "Use of Library & Study Skills", creditUnit: 2, score: 90, letterGrade: "A", gradePoint: 5.0, qualityPoints: 10.0, category: "General", passed: true, attemptNumber: 1 },
      ],
    };

    const record200L_1: SemesterRecord = {
      id: "sem_200_1",
      userId,
      sessionId: "2023/2024",
      semesterId: "1st Semester",
      level: "200 Level",
      totalRegisteredCredits: 20,
      totalPassedCredits: 20,
      totalQualityPoints: 92.0,
      gpa: 4.60,
      runningCGPA: 4.51,
      createdAt: new Date().toISOString(),
      courses: [
        { courseCode: "CSC 201", courseTitle: "Data Structures & Algorithms", creditUnit: 3, score: 86, letterGrade: "A", gradePoint: 5.0, qualityPoints: 15.0, category: "Core", passed: true, attemptNumber: 1 },
        { courseCode: "CSC 203", courseTitle: "Object Oriented Programming in Java", creditUnit: 3, score: 89, letterGrade: "A", gradePoint: 5.0, qualityPoints: 15.0, category: "Core", passed: true, attemptNumber: 1 },
        { courseCode: "MTH 201", courseTitle: "Linear Algebra I", creditUnit: 3, score: 67, letterGrade: "B", gradePoint: 4.0, qualityPoints: 12.0, category: "Core", passed: true, attemptNumber: 1 },
        { courseCode: "CHM 102", courseTitle: "General Chemistry II (Retake)", creditUnit: 3, score: 76, letterGrade: "A", gradePoint: 5.0, qualityPoints: 15.0, category: "Core", passed: true, attemptNumber: 2 },
        { courseCode: "GST 201", courseTitle: "Peace Studies & Conflict Resolution", creditUnit: 2, score: 72, letterGrade: "A", gradePoint: 5.0, qualityPoints: 10.0, category: "General", passed: true, attemptNumber: 1 },
        { courseCode: "STA 201", courseTitle: "Statistics for Physical Sciences", creditUnit: 3, score: 63, letterGrade: "B", gradePoint: 4.0, qualityPoints: 12.0, category: "Elective", passed: true, attemptNumber: 1 },
        { courseCode: "CSC 205", courseTitle: "Operating Systems Fundamentals", creditUnit: 3, score: 70, letterGrade: "A", gradePoint: 5.0, qualityPoints: 13.0, category: "Core", passed: true, attemptNumber: 1 },
      ],
    };

    this.semesterRecords.set(userId, [record100L_1, record100L_2, record200L_1]);

    this.studentConfigs.set(userId, {
      userId,
      gradingScale: DEFAULT_5_POINT_SCALE,
      targetGraduationClass: "First Class Honours",
      requiredCoreCredits: 90,
      requiredElectiveCredits: 18,
      requiredGeneralCredits: 12,
      totalDegreeCredits: 120,
    });
  }

  public getSemesterRecords(userId: string): SemesterRecord[] {
    this.seedDefaultStudentData(userId);
    return this.semesterRecords.get(userId) || [];
  }

  public getSemesterRecordById(userId: string, recordId: string): SemesterRecord | undefined {
    const records = this.getSemesterRecords(userId);
    return records.find((r) => r.id === recordId);
  }

  public saveSemesterRecord(userId: string, record: SemesterRecord): SemesterRecord {
    const records = this.getSemesterRecords(userId);
    const existingIndex = records.findIndex((r) => r.id === record.id);
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    this.semesterRecords.set(userId, records);
    return record;
  }

  public getStudentConfig(userId: string): StudentAcademicConfig {
    this.seedDefaultStudentData(userId);
    return (
      this.studentConfigs.get(userId) || {
        userId,
        gradingScale: DEFAULT_5_POINT_SCALE,
        targetGraduationClass: "First Class Honours",
        requiredCoreCredits: 90,
        requiredElectiveCredits: 18,
        requiredGeneralCredits: 12,
        totalDegreeCredits: 120,
      }
    );
  }

  public saveStudentConfig(userId: string, config: Partial<StudentAcademicConfig>): StudentAcademicConfig {
    const current = this.getStudentConfig(userId);
    const updated = { ...current, ...config };
    this.studentConfigs.set(userId, updated);
    return updated;
  }
}

export const academicRecordsRepository = new AcademicRecordsRepository();
