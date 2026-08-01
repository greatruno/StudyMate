/**
 * AcademicIntelligenceDomain.ts
 * Domain Layer for Phase 3.2 Academic Intelligence Engine.
 * 
 * PURE TYPESCRIPT DOMAIN LOGIC:
 * - Zero Express dependencies
 * - Zero Database / Repository queries
 * - Pure mathematical algorithms & domain rules for GPA, CGPA, Quality Points,
 *   Graduation Classification, Academic Standing, Degree Progress, Course Retake,
 *   Graduation Requirements, and What-if Simulations.
 */

export interface GradeDefinition {
  letterGrade: string;
  gradePoint: number;
  minScore: number;
  maxScore: number;
  remark: string;
}

export interface GradingScale {
  id: string;
  name: string;
  maxPoint: number; // e.g. 5.0 or 4.0
  grades: GradeDefinition[];
}

export interface CourseScoreInput {
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  score?: number;
  letterGrade?: string;
  category?: "Core" | "Elective" | "Required" | "General";
}

export interface CalculatedCourseResult {
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  score: number;
  letterGrade: string;
  gradePoint: number;
  qualityPoints: number;
  category: "Core" | "Elective" | "Required" | "General";
  passed: boolean;
}

export interface SemesterGPACalculation {
  totalRegisteredCredits: number;
  totalPassedCredits: number;
  totalFailedCredits: number;
  totalQualityPoints: number;
  gpa: number;
  averageScore: number;
  courseResults: CalculatedCourseResult[];
}

export interface OverallCGPACalculation {
  totalQualityPoints: number;
  totalEarnedCredits: number;
  totalAttemptedCredits: number;
  cgpa: number;
  academicStanding: string;
  graduationClass: string;
}

export interface GraduationClassDefinition {
  className: string; // e.g. "First Class Honours"
  minCGPA: number;
  maxCGPA: number;
}

export interface AcademicStandingPolicy {
  standingName: string; // e.g. "Good Standing", "Probation"
  minCGPA: number;
  description: string;
}

export interface GraduationRequirementRule {
  minTotalCredits: number;
  minCoreCredits: number;
  minElectiveCredits: number;
  minGeneralCredits: number;
  minCGPA: number;
}

export interface RequirementCheckResult {
  isEligible: boolean;
  status: "Eligible" | "Almost Eligible" | "Not Eligible";
  passedMinCredits: boolean;
  passedCoreCredits: boolean;
  passedElectiveCredits: boolean;
  passedGeneralCredits: boolean;
  passedMinCGPA: boolean;
  hasOutstandingFailedCourses: boolean;
  reasons: string[];
  recommendations: string[];
}

export interface DegreeProgressBreakdown {
  totalRequiredCredits: number;
  completedCredits: number;
  remainingCredits: number;
  completionPercentage: number;
  coreCompleted: number;
  coreRequired: number;
  electiveCompleted: number;
  electiveRequired: number;
  generalCompleted: number;
  generalRequired: number;
}

export interface WhatIfSimulationInput {
  currentTotalQualityPoints: number;
  currentTotalCredits: number;
  hypotheticalCourses: CourseScoreInput[];
}

export interface WhatIfSimulationResult {
  currentCGPA: number;
  simulatedSemesterGPA: number;
  projectedQualityPoints: number;
  projectedTotalCredits: number;
  projectedCGPA: number;
  cgpaDelta: number; // e.g. +0.15
  currentGraduationClass: string;
  projectedGraduationClass: string;
  classImproved: boolean;
  recommendations: string[];
}

export interface CourseRetakeImpact {
  courseCode: string;
  previousAttempts: Array<{ semesterName: string; grade: string; gradePoint: number }>;
  latestGrade: string;
  highestGrade: string;
  unitsRecovered: number;
  qualityPointsGained: number;
}

// DEFAULT 5.0 GRADING SCALE (Standard Nigerian & International 5-Point System)
export const DEFAULT_5_POINT_SCALE: GradingScale = {
  id: "scale_5_point",
  name: "5.0 Grading System (A-F)",
  maxPoint: 5.0,
  grades: [
    { letterGrade: "A", gradePoint: 5.0, minScore: 70, maxScore: 100, remark: "Excellent" },
    { letterGrade: "B", gradePoint: 4.0, minScore: 60, maxScore: 69, remark: "Very Good" },
    { letterGrade: "C", gradePoint: 3.0, minScore: 50, maxScore: 59, remark: "Good" },
    { letterGrade: "D", gradePoint: 2.0, minScore: 45, maxScore: 49, remark: "Fair" },
    { letterGrade: "E", gradePoint: 1.0, minScore: 40, maxScore: 44, remark: "Pass" },
    { letterGrade: "F", gradePoint: 0.0, minScore: 0, maxScore: 39, remark: "Fail" },
  ],
};

// DEFAULT 4.0 GRADING SCALE (Standard US & Global 4-Point System)
export const DEFAULT_4_POINT_SCALE: GradingScale = {
  id: "scale_4_point",
  name: "4.0 Grading System (A-F)",
  maxPoint: 4.0,
  grades: [
    { letterGrade: "A", gradePoint: 4.0, minScore: 90, maxScore: 100, remark: "Excellent" },
    { letterGrade: "B", gradePoint: 3.0, minScore: 80, maxScore: 89, remark: "Good" },
    { letterGrade: "C", gradePoint: 2.0, minScore: 70, maxScore: 79, remark: "Satisfactory" },
    { letterGrade: "D", gradePoint: 1.0, minScore: 60, maxScore: 69, remark: "Poor" },
    { letterGrade: "F", gradePoint: 0.0, minScore: 0, maxScore: 59, remark: "Fail" },
  ],
};

// DEFAULT GRADUATION CLASSES FOR 5.0 SCALE
export const DEFAULT_5_POINT_CLASSES: GraduationClassDefinition[] = [
  { className: "First Class Honours", minCGPA: 4.5, maxCGPA: 5.0 },
  { className: "Second Class Honours (Upper Division)", minCGPA: 3.5, maxCGPA: 4.49 },
  { className: "Second Class Honours (Lower Division)", minCGPA: 2.4, maxCGPA: 3.49 },
  { className: "Third Class Honours", minCGPA: 1.5, maxCGPA: 2.39 },
  { className: "Pass", minCGPA: 1.0, maxCGPA: 1.49 },
  { className: "Fail / Ineligible", minCGPA: 0.0, maxCGPA: 0.99 },
];

// DEFAULT ACADEMIC STANDING POLICIES
export const DEFAULT_STANDING_POLICIES: AcademicStandingPolicy[] = [
  { standingName: "Excellent Standing (First Class)", minCGPA: 4.5, description: "Student is performing with exceptional distinction." },
  { standingName: "Good Academic Standing", minCGPA: 2.5, description: "Student meets all institutional academic expectations." },
  { standingName: "Academic Warning", minCGPA: 1.5, description: "CGPA is below standard; close monitoring advised." },
  { standingName: "Academic Probation", minCGPA: 1.0, description: "Student is on probation and must raise CGPA to avoid withdrawal." },
  { standingName: "Recommended for Withdrawal", minCGPA: 0.0, description: "Student CGPA falls below minimum statutory retention requirement." },
];

export class AcademicIntelligenceDomain {
  /**
   * Resolve a raw score (0-100) or letter grade into GradeDefinition using active GradingScale.
   */
  public static resolveGrade(
    input: { score?: number; letterGrade?: string },
    scale: GradingScale = DEFAULT_5_POINT_SCALE
  ): GradeDefinition {
    if (input.letterGrade) {
      const match = scale.grades.find(
        (g) => g.letterGrade.toUpperCase() === input.letterGrade?.toUpperCase()
      );
      if (match) return match;
    }

    const score = input.score !== undefined ? input.score : 0;
    const matchScore = scale.grades.find(
      (g) => score >= g.minScore && score <= g.maxScore
    );

    if (matchScore) return matchScore;

    // Fallback lowest grade
    return scale.grades[scale.grades.length - 1] || {
      letterGrade: "F",
      gradePoint: 0,
      minScore: 0,
      maxScore: 39,
      remark: "Fail",
    };
  }

  /**
   * Calculate Semester GPA and Quality Points from an array of course scores/grades.
   */
  public static calculateSemesterGPA(
    courses: CourseScoreInput[],
    scale: GradingScale = DEFAULT_5_POINT_SCALE
  ): SemesterGPACalculation {
    let totalRegisteredCredits = 0;
    let totalPassedCredits = 0;
    let totalFailedCredits = 0;
    let totalQualityPoints = 0;
    let sumScores = 0;

    const courseResults: CalculatedCourseResult[] = courses.map((course) => {
      const gradeDef = this.resolveGrade({ score: course.score, letterGrade: course.letterGrade }, scale);
      const qualityPoints = course.creditUnit * gradeDef.gradePoint;
      const passed = gradeDef.gradePoint > 0;

      totalRegisteredCredits += course.creditUnit;
      if (passed) {
        totalPassedCredits += course.creditUnit;
      } else {
        totalFailedCredits += course.creditUnit;
      }

      totalQualityPoints += qualityPoints;
      sumScores += course.score !== undefined ? course.score : (gradeDef.minScore + gradeDef.maxScore) / 2;

      return {
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        creditUnit: course.creditUnit,
        score: course.score || 0,
        letterGrade: gradeDef.letterGrade,
        gradePoint: gradeDef.gradePoint,
        qualityPoints,
        category: course.category || "Core",
        passed,
      };
    });

    const gpa = totalRegisteredCredits > 0 ? totalQualityPoints / totalRegisteredCredits : 0;
    const averageScore = courses.length > 0 ? sumScores / courses.length : 0;

    return {
      totalRegisteredCredits,
      totalPassedCredits,
      totalFailedCredits,
      totalQualityPoints: Math.round(totalQualityPoints * 100) / 100,
      gpa: Math.round(gpa * 100) / 100,
      averageScore: Math.round(averageScore * 10) / 10,
      courseResults,
    };
  }

  /**
   * Calculate Cumulative GPA (CGPA) from accumulated Quality Points and Earned Credits.
   */
  public static calculateCGPA(
    totalQualityPoints: number,
    totalEarnedCredits: number,
    classes: GraduationClassDefinition[] = DEFAULT_5_POINT_CLASSES,
    policies: AcademicStandingPolicy[] = DEFAULT_STANDING_POLICIES
  ): OverallCGPACalculation {
    const cgpa = totalEarnedCredits > 0 ? totalQualityPoints / totalEarnedCredits : 0;
    const roundedCGPA = Math.round(cgpa * 100) / 100;

    const graduationClass = this.determineGraduationClass(roundedCGPA, classes);
    const academicStanding = this.determineAcademicStanding(roundedCGPA, policies);

    return {
      totalQualityPoints: Math.round(totalQualityPoints * 100) / 100,
      totalEarnedCredits,
      totalAttemptedCredits: totalEarnedCredits,
      cgpa: roundedCGPA,
      academicStanding,
      graduationClass,
    };
  }

  /**
   * Determine Graduation Class from CGPA
   */
  public static determineGraduationClass(
    cgpa: number,
    classes: GraduationClassDefinition[] = DEFAULT_5_POINT_CLASSES
  ): string {
    const matched = classes.find((c) => cgpa >= c.minCGPA && cgpa <= c.maxCGPA);
    if (matched) return matched.className;
    if (cgpa >= 4.5) return "First Class Honours";
    if (cgpa >= 3.5) return "Second Class Honours (Upper Division)";
    if (cgpa >= 2.4) return "Second Class Honours (Lower Division)";
    if (cgpa >= 1.5) return "Third Class Honours";
    if (cgpa >= 1.0) return "Pass";
    return "Fail / Ineligible";
  }

  /**
   * Determine Academic Standing from CGPA
   */
  public static determineAcademicStanding(
    cgpa: number,
    policies: AcademicStandingPolicy[] = DEFAULT_STANDING_POLICIES
  ): string {
    const matched = policies.find((p) => cgpa >= p.minCGPA);
    return matched ? matched.standingName : "Good Academic Standing";
  }

  /**
   * Calculate Degree Completion Progress percentage and credit breakdowns.
   */
  public static calculateDegreeProgress(
    completedCourses: CalculatedCourseResult[],
    requirements: { core: number; elective: number; general: number; total: number } = {
      core: 90,
      elective: 18,
      general: 12,
      total: 120,
    }
  ): DegreeProgressBreakdown {
    let coreCompleted = 0;
    let electiveCompleted = 0;
    let generalCompleted = 0;

    completedCourses.forEach((c) => {
      if (c.passed) {
        if (c.category === "Core" || c.category === "Required") coreCompleted += c.creditUnit;
        else if (c.category === "Elective") electiveCompleted += c.creditUnit;
        else if (c.category === "General") generalCompleted += c.creditUnit;
        else coreCompleted += c.creditUnit;
      }
    });

    const completedCredits = Math.min(requirements.total, coreCompleted + electiveCompleted + generalCompleted);
    const remainingCredits = Math.max(0, requirements.total - completedCredits);
    const completionPercentage = Math.min(100, Math.round((completedCredits / requirements.total) * 100));

    return {
      totalRequiredCredits: requirements.total,
      completedCredits,
      remainingCredits,
      completionPercentage,
      coreCompleted,
      coreRequired: requirements.core,
      electiveCompleted,
      electiveRequired: requirements.elective,
      generalCompleted,
      generalRequired: requirements.general,
    };
  }

  /**
   * Validate student graduation requirements and return eligibility status.
   */
  public static checkGraduationEligibility(
    cgpa: number,
    progress: DegreeProgressBreakdown,
    outstandingFailedCourses: string[],
    rules: GraduationRequirementRule = {
      minTotalCredits: 120,
      minCoreCredits: 90,
      minElectiveCredits: 18,
      minGeneralCredits: 12,
      minCGPA: 1.0,
    }
  ): RequirementCheckResult {
    const passedMinCredits = progress.completedCredits >= rules.minTotalCredits;
    const passedCoreCredits = progress.coreCompleted >= rules.minCoreCredits;
    const passedElectiveCredits = progress.electiveCompleted >= rules.minElectiveCredits;
    const passedGeneralCredits = progress.generalCompleted >= rules.minGeneralCredits;
    const passedMinCGPA = cgpa >= rules.minCGPA;
    const hasOutstandingFailedCourses = outstandingFailedCourses.length > 0;

    const reasons: string[] = [];
    const recommendations: string[] = [];

    if (!passedMinCredits) {
      reasons.push(`Total completed credits (${progress.completedCredits}) is below minimum requirement of ${rules.minTotalCredits} units.`);
      recommendations.push(`Register for ${rules.minTotalCredits - progress.completedCredits} additional credit units.`);
    }

    if (!passedCoreCredits) {
      reasons.push(`Core course credits (${progress.coreCompleted}) is below requirement of ${rules.minCoreCredits} units.`);
      recommendations.push(`Complete outstanding departmental core courses.`);
    }

    if (!passedMinCGPA) {
      reasons.push(`Current CGPA (${cgpa}) is below minimum graduation threshold of ${rules.minCGPA}.`);
      recommendations.push(`Retake failed or low-grade courses to boost Quality Points.`);
    }

    if (hasOutstandingFailedCourses) {
      reasons.push(`Student has ${outstandingFailedCourses.length} unpassed/failed course(s): ${outstandingFailedCourses.join(", ")}.`);
      recommendations.push(`Retake and pass all failed core courses before graduation clearance.`);
    }

    let status: "Eligible" | "Almost Eligible" | "Not Eligible" = "Not Eligible";
    let isEligible = false;

    if (passedMinCredits && passedCoreCredits && passedMinCGPA && !hasOutstandingFailedCourses) {
      status = "Eligible";
      isEligible = true;
    } else if (progress.remainingCredits <= 15 && passedMinCGPA && !hasOutstandingFailedCourses) {
      status = "Almost Eligible";
    }

    return {
      isEligible,
      status,
      passedMinCredits,
      passedCoreCredits,
      passedElectiveCredits,
      passedGeneralCredits,
      passedMinCGPA,
      hasOutstandingFailedCourses,
      reasons,
      recommendations,
    };
  }

  /**
   * What-If CGPA Simulator engine.
   * Simulates future course outcomes without mutating actual database records.
   */
  public static simulateWhatIf(
    currentQualityPoints: number,
    currentCredits: number,
    hypotheticalCourses: CourseScoreInput[],
    scale: GradingScale = DEFAULT_5_POINT_SCALE,
    classes: GraduationClassDefinition[] = DEFAULT_5_POINT_CLASSES
  ): WhatIfSimulationResult {
    const currentCGPA = currentCredits > 0 ? currentQualityPoints / currentCredits : 0;
    const currentClass = this.determineGraduationClass(currentCGPA, classes);

    const simSemester = this.calculateSemesterGPA(hypotheticalCourses, scale);

    const projectedQualityPoints = currentQualityPoints + simSemester.totalQualityPoints;
    const projectedTotalCredits = currentCredits + simSemester.totalRegisteredCredits;
    const projectedCGPA = projectedTotalCredits > 0 ? projectedQualityPoints / projectedTotalCredits : 0;

    const roundedCurrent = Math.round(currentCGPA * 100) / 100;
    const roundedProjected = Math.round(projectedCGPA * 100) / 100;
    const cgpaDelta = Math.round((roundedProjected - roundedCurrent) * 100) / 100;

    const projectedClass = this.determineGraduationClass(roundedProjected, classes);
    const classImproved = projectedClass !== currentClass && roundedProjected > roundedCurrent;

    const recommendations: string[] = [];
    if (cgpaDelta > 0) {
      recommendations.push(`Achieving this simulated GPA (${simSemester.gpa}) will raise your CGPA by +${cgpaDelta}.`);
    } else if (cgpaDelta < 0) {
      recommendations.push(`Warning: This hypothetical performance will lower your current CGPA by ${cgpaDelta}.`);
    } else {
      recommendations.push(`This scenario maintains your exact current CGPA at ${roundedProjected}.`);
    }

    if (classImproved) {
      recommendations.push(`🎉 Fantastic! This performance elevates your degree projection to ${projectedClass}!`);
    }

    return {
      currentCGPA: roundedCurrent,
      simulatedSemesterGPA: simSemester.gpa,
      projectedQualityPoints: Math.round(projectedQualityPoints * 100) / 100,
      projectedTotalCredits,
      projectedCGPA: roundedProjected,
      cgpaDelta,
      currentGraduationClass: currentClass,
      projectedGraduationClass: projectedClass,
      classImproved,
      recommendations,
    };
  }
}
