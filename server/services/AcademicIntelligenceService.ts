/**
 * AcademicIntelligenceService.ts
 * Service Layer for Phase 3.2 Academic Intelligence Engine.
 * 
 * Orchestrates Domain Layer logic and AcademicRecordsRepository.
 * Returns clean structured DTOs for frontend consumption & API responses.
 */

import {
  AcademicIntelligenceDomain,
  GradingScale,
  CourseScoreInput,
  WhatIfSimulationResult,
  RequirementCheckResult,
  DegreeProgressBreakdown,
  CalculatedCourseResult,
} from "../domain/AcademicIntelligenceDomain";

import {
  academicRecordsRepository,
  SemesterRecord,
  StoredCourseGrade,
} from "../repositories/AcademicRecordsRepository";

export interface AcademicDashboardDTO {
  currentGPA: number;
  currentCGPA: number;
  totalQualityPoints: number;
  earnedCredits: number;
  attemptedCredits: number;
  creditsRemaining: number;
  degreeCompletionPercentage: number;
  academicStanding: string;
  predictedGraduationClass: string;
  totalSemestersRecorded: number;
  failedCoursesCount: number;
  outstandingFailedCourses: string[];
  gradingScaleName: string;
  maxGradePoint: number;
  latestSemester: SemesterRecord | null;
  semesterHistory: Array<{
    id: string;
    level: string;
    sessionId: string;
    semesterId: string;
    gpa: number;
    runningCGPA: number;
    credits: number;
  }>;
}

export interface TranscriptDTO {
  institutionName: string;
  faculty: string;
  department: string;
  programme: string;
  studentName: string;
  matricNumber: string;
  entryYear: string;
  graduatingYear: string;
  gradingScaleName: string;
  maxPoint: number;
  totalEarnedCredits: number;
  totalQualityPoints: number;
  finalCGPA: number;
  graduationClass: string;
  academicStanding: string;
  issueDate: string;
  semesters: SemesterRecord[];
}

export interface CourseRetakeSummaryDTO {
  retakenCoursesCount: number;
  activeCarryOversCount: number;
  qualityPointsRecovered: number;
  activeCarryOverCodes: string[];
  retakeDetails: Array<{
    courseCode: string;
    courseTitle: string;
    creditUnit: number;
    attempts: Array<{
      sessionId: string;
      semesterId: string;
      score: number;
      letterGrade: string;
      gradePoint: number;
      passed: boolean;
    }>;
    status: "Cleared" | "Pending Carry Over";
    gradeDifference: number; // Quality points delta
  }>;
}

export class AcademicIntelligenceService {
  /**
   * Get comprehensive Academic Dashboard metrics.
   */
  public getDashboard(userId: string): AcademicDashboardDTO {
    const config = academicRecordsRepository.getStudentConfig(userId);
    const records = academicRecordsRepository.getSemesterRecords(userId);

    let totalQualityPoints = 0;
    let totalEarnedCredits = 0;

    const allCourses: CalculatedCourseResult[] = [];
    const coursePassMap: Map<string, boolean> = new Map();
    const latestSemester = records.length > 0 ? records[records.length - 1] : null;

    records.forEach((sem) => {
      totalQualityPoints += sem.totalQualityPoints;
      totalEarnedCredits += sem.totalPassedCredits;

      sem.courses.forEach((c) => {
        allCourses.push(c);
        if (c.passed) {
          coursePassMap.set(c.courseCode, true);
        } else if (!coursePassMap.has(c.courseCode)) {
          coursePassMap.set(c.courseCode, false);
        }
      });
    });

    const cgpaResult = AcademicIntelligenceDomain.calculateCGPA(
      totalQualityPoints,
      totalEarnedCredits
    );

    const progress = AcademicIntelligenceDomain.calculateDegreeProgress(allCourses, {
      core: config.requiredCoreCredits,
      elective: config.requiredElectiveCredits,
      general: config.requiredGeneralCredits,
      total: config.totalDegreeCredits,
    });

    const outstandingFailedCourses = Array.from(coursePassMap.entries())
      .filter(([_, passed]) => !passed)
      .map(([code]) => code);

    const semesterHistory = records.map((r) => ({
      id: r.id,
      level: r.level,
      sessionId: r.sessionId,
      semesterId: r.semesterId,
      gpa: r.gpa,
      runningCGPA: r.runningCGPA,
      credits: r.totalRegisteredCredits,
    }));

    return {
      currentGPA: latestSemester ? latestSemester.gpa : 0,
      currentCGPA: cgpaResult.cgpa,
      totalQualityPoints: cgpaResult.totalQualityPoints,
      earnedCredits: totalEarnedCredits,
      attemptedCredits: totalEarnedCredits,
      creditsRemaining: progress.remainingCredits,
      degreeCompletionPercentage: progress.completionPercentage,
      academicStanding: cgpaResult.academicStanding,
      predictedGraduationClass: cgpaResult.graduationClass,
      totalSemestersRecorded: records.length,
      failedCoursesCount: outstandingFailedCourses.length,
      outstandingFailedCourses,
      gradingScaleName: config.gradingScale.name,
      maxGradePoint: config.gradingScale.maxPoint,
      latestSemester,
      semesterHistory,
    };
  }

  /**
   * Get official Academic Transcript data structure.
   */
  public getTranscript(userId: string): TranscriptDTO {
    const config = academicRecordsRepository.getStudentConfig(userId);
    const records = academicRecordsRepository.getSemesterRecords(userId);

    let totalQualityPoints = 0;
    let totalEarnedCredits = 0;

    records.forEach((sem) => {
      totalQualityPoints += sem.totalQualityPoints;
      totalEarnedCredits += sem.totalPassedCredits;
    });

    const cgpaResult = AcademicIntelligenceDomain.calculateCGPA(
      totalQualityPoints,
      totalEarnedCredits
    );

    return {
      institutionName: "FEDERAL UNIVERSITY OF TECHNOLOGY & INNOVATION",
      faculty: "School of Information & Communication Technology",
      department: "Department of Computer Science & Artificial Intelligence",
      programme: "B.Tech Computer Science",
      studentName: "Alexander Emmanuel Vance",
      matricNumber: "FUT/2022/CSC/1094",
      entryYear: "2022",
      graduatingYear: "2026 (Projected)",
      gradingScaleName: config.gradingScale.name,
      maxPoint: config.gradingScale.maxPoint,
      totalEarnedCredits,
      totalQualityPoints: cgpaResult.totalQualityPoints,
      finalCGPA: cgpaResult.cgpa,
      graduationClass: cgpaResult.graduationClass,
      academicStanding: cgpaResult.academicStanding,
      issueDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      semesters: records,
    };
  }

  /**
   * Get Degree Progress & Requirements Checklist
   */
  public getDegreeProgress(userId: string) {
    const config = academicRecordsRepository.getStudentConfig(userId);
    const records = academicRecordsRepository.getSemesterRecords(userId);

    const allCourses: CalculatedCourseResult[] = [];
    const coursePassMap: Map<string, boolean> = new Map();

    let totalQP = 0;
    let totalCredits = 0;

    records.forEach((r) => {
      totalQP += r.totalQualityPoints;
      totalCredits += r.totalPassedCredits;
      r.courses.forEach((c) => {
        allCourses.push(c);
        if (c.passed) coursePassMap.set(c.courseCode, true);
        else if (!coursePassMap.has(c.courseCode)) coursePassMap.set(c.courseCode, false);
      });
    });

    const cgpa = totalCredits > 0 ? Math.round((totalQP / totalCredits) * 100) / 100 : 0;

    const progress = AcademicIntelligenceDomain.calculateDegreeProgress(allCourses, {
      core: config.requiredCoreCredits,
      elective: config.requiredElectiveCredits,
      general: config.requiredGeneralCredits,
      total: config.totalDegreeCredits,
    });

    const outstandingFailed = Array.from(coursePassMap.entries())
      .filter(([_, passed]) => !passed)
      .map(([code]) => code);

    const eligibility = AcademicIntelligenceDomain.checkGraduationEligibility(
      cgpa,
      progress,
      outstandingFailed,
      {
        minTotalCredits: config.totalDegreeCredits,
        minCoreCredits: config.requiredCoreCredits,
        minElectiveCredits: config.requiredElectiveCredits,
        minGeneralCredits: config.requiredGeneralCredits,
        minCGPA: 1.5,
      }
    );

    return {
      progress,
      eligibility,
      cgpa,
      outstandingFailed,
    };
  }

  /**
   * Course Retake & Carry-Over Analyzer
   */
  public getCourseRetakeAnalysis(userId: string): CourseRetakeSummaryDTO {
    const records = academicRecordsRepository.getSemesterRecords(userId);
    const courseHistoryMap: Map<
      string,
      {
        courseTitle: string;
        creditUnit: number;
        attempts: Array<{
          sessionId: string;
          semesterId: string;
          score: number;
          letterGrade: string;
          gradePoint: number;
          passed: boolean;
        }>;
      }
    > = new Map();

    records.forEach((sem) => {
      sem.courses.forEach((c) => {
        if (!courseHistoryMap.has(c.courseCode)) {
          courseHistoryMap.set(c.courseCode, {
            courseTitle: c.courseTitle,
            creditUnit: c.creditUnit,
            attempts: [],
          });
        }
        courseHistoryMap.get(c.courseCode)!.attempts.push({
          sessionId: sem.sessionId,
          semesterId: sem.semesterId,
          score: c.score,
          letterGrade: c.letterGrade,
          gradePoint: c.gradePoint,
          passed: c.passed,
        });
      });
    });

    const retakeDetails: CourseRetakeSummaryDTO["retakeDetails"] = [];
    const activeCarryOverCodes: string[] = [];
    let retakenCoursesCount = 0;
    let qualityPointsRecovered = 0;

    courseHistoryMap.forEach((data, courseCode) => {
      if (data.attempts.length > 1 || !data.attempts[data.attempts.length - 1].passed) {
        const lastAttempt = data.attempts[data.attempts.length - 1];
        const isCleared = lastAttempt.passed;

        if (data.attempts.length > 1) {
          retakenCoursesCount++;
          if (isCleared && data.attempts.length >= 2) {
            const initialFailedAttempt = data.attempts.find((a) => !a.passed);
            if (initialFailedAttempt) {
              qualityPointsRecovered +=
                (lastAttempt.gradePoint - initialFailedAttempt.gradePoint) * data.creditUnit;
            }
          }
        }

        if (!isCleared) {
          activeCarryOverCodes.push(courseCode);
        }

        const initialPoints = data.attempts[0].gradePoint * data.creditUnit;
        const finalPoints = lastAttempt.gradePoint * data.creditUnit;

        retakeDetails.push({
          courseCode,
          courseTitle: data.courseTitle,
          creditUnit: data.creditUnit,
          attempts: data.attempts,
          status: isCleared ? "Cleared" : "Pending Carry Over",
          gradeDifference: finalPoints - initialPoints,
        });
      }
    });

    return {
      retakenCoursesCount,
      activeCarryOversCount: activeCarryOverCodes.length,
      qualityPointsRecovered: Math.max(0, qualityPointsRecovered),
      activeCarryOverCodes,
      retakeDetails,
    };
  }

  /**
   * Run What-if Simulation
   */
  public runWhatIfSimulation(
    userId: string,
    hypotheticalCourses: CourseScoreInput[]
  ): WhatIfSimulationResult {
    const config = academicRecordsRepository.getStudentConfig(userId);
    const records = academicRecordsRepository.getSemesterRecords(userId);

    let currentQualityPoints = 0;
    let currentCredits = 0;

    records.forEach((sem) => {
      currentQualityPoints += sem.totalQualityPoints;
      currentCredits += sem.totalPassedCredits;
    });

    return AcademicIntelligenceDomain.simulateWhatIf(
      currentQualityPoints,
      currentCredits,
      hypotheticalCourses,
      config.gradingScale
    );
  }

  /**
   * Calculate arbitrary term GPA from course inputs (without saving).
   */
  public calculateTermGPA(userId: string, courses: CourseScoreInput[]) {
    const config = academicRecordsRepository.getStudentConfig(userId);
    return AcademicIntelligenceDomain.calculateSemesterGPA(courses, config.gradingScale);
  }

  /**
   * Save a new semester result or overwrite existing.
   */
  public saveSemesterResult(
    userId: string,
    payload: {
      sessionId: string;
      semesterId: string;
      level: string;
      courses: CourseScoreInput[];
    }
  ): SemesterRecord {
    const config = academicRecordsRepository.getStudentConfig(userId);
    const gpaResult = AcademicIntelligenceDomain.calculateSemesterGPA(
      payload.courses,
      config.gradingScale
    );

    const storedCourses: StoredCourseGrade[] = gpaResult.courseResults.map((c, idx) => ({
      ...c,
      attemptNumber: 1,
    }));

    // Calculate updated cumulative running CGPA
    const existingRecords = academicRecordsRepository.getSemesterRecords(userId);
    let totalQP = gpaResult.totalQualityPoints;
    let totalUnits = gpaResult.totalPassedCredits;

    existingRecords.forEach((r) => {
      totalQP += r.totalQualityPoints;
      totalUnits += r.totalPassedCredits;
    });

    const runningCGPA = totalUnits > 0 ? Math.round((totalQP / totalUnits) * 100) / 100 : 0;

    const newRecord: SemesterRecord = {
      id: `sem_${Date.now()}`,
      userId,
      sessionId: payload.sessionId,
      semesterId: payload.semesterId,
      level: payload.level,
      totalRegisteredCredits: gpaResult.totalRegisteredCredits,
      totalPassedCredits: gpaResult.totalPassedCredits,
      totalQualityPoints: gpaResult.totalQualityPoints,
      gpa: gpaResult.gpa,
      runningCGPA,
      createdAt: new Date().toISOString(),
      courses: storedCourses,
    };

    return academicRecordsRepository.saveSemesterRecord(userId, newRecord);
  }

  /**
   * Update active grading scale.
   */
  public updateGradingScale(userId: string, scale: GradingScale) {
    return academicRecordsRepository.saveStudentConfig(userId, { gradingScale: scale });
  }
}

export const academicIntelligenceService = new AcademicIntelligenceService();
