/**
 * StudyMate Domain Engine: GPA & Academic Risk Calculations
 */

export function calculateGpaPoints(gradeLetter: string): number {
  const g = gradeLetter.trim().toUpperCase();
  switch (g) {
    case "A+":
    case "A":
      return 4.0;
    case "A-":
      return 3.7;
    case "B+":
      return 3.3;
    case "B":
      return 3.0;
    case "B-":
      return 2.7;
    case "C+":
      return 2.3;
    case "C":
      return 2.0;
    case "C-":
      return 1.7;
    case "D+":
      return 1.3;
    case "D":
      return 1.0;
    case "F":
    default:
      return 0.0;
  }
}

export function getAcademicStanding(cgpa: number): string {
  if (cgpa >= 3.5) return "First Class Honors / Dean's List";
  if (cgpa >= 3.0) return "Second Class Upper Division";
  if (cgpa >= 2.4) return "Second Class Lower Division";
  if (cgpa >= 2.0) return "Third Class Division";
  if (cgpa >= 1.5) return "Academic Probation Warning";
  return "Critical Academic Suspension Risk";
}

export function evaluateAtRiskStudent(metrics: {
  attendancePct: number;
  quizAvg: number;
  assignmentsSubmittedPct: number;
}): { riskLevel: "low" | "medium" | "high" | "critical"; recommendedIntervention: string } {
  const { attendancePct, quizAvg, assignmentsSubmittedPct } = metrics;

  if (attendancePct < 60 || quizAvg < 50 || assignmentsSubmittedPct < 60) {
    return {
      riskLevel: "critical",
      recommendedIntervention: "Schedule urgent 1-on-1 advisor counseling session and mandate peer tutoring participation."
    };
  }

  if (attendancePct < 75 || quizAvg < 65 || assignmentsSubmittedPct < 75) {
    return {
      riskLevel: "high",
      recommendedIntervention: "Issue academic warning email and assign remedial problem sets."
    };
  }

  if (attendancePct < 85 || quizAvg < 75) {
    return {
      riskLevel: "medium",
      recommendedIntervention: "Recommend study group participation and supplementary office hours."
    };
  }

  return {
    riskLevel: "low",
    recommendedIntervention: "Student is performing on target. Maintain current study rhythm."
  };
}
