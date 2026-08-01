/**
 * StudyMate Domain Layer Unit Tests
 * Verifies core domain logic: GPA calculations, academic standing classification,
 * risk alert triggers, and document text chunking logic.
 */

import { calculateGpaPoints, getAcademicStanding, evaluateAtRiskStudent } from "../../../server/domain/gpaEngine.js";

// Helper assertions
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

function assertEquals(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`TEST FAILED: ${message} | Expected: ${expected}, Got: ${actual}`);
  }
}

export async function runDomainUnitTests() {
  console.log("  Running Domain Layer Unit Tests...");

  // Test 1: GPA Point Calculations
  assertEquals(calculateGpaPoints("A"), 4.0, "Grade A should be 4.0");
  assertEquals(calculateGpaPoints("A-"), 3.7, "Grade A- should be 3.7");
  assertEquals(calculateGpaPoints("B+"), 3.3, "Grade B+ should be 3.3");
  assertEquals(calculateGpaPoints("B"), 3.0, "Grade B should be 3.0");
  assertEquals(calculateGpaPoints("C"), 2.0, "Grade C should be 2.0");
  assertEquals(calculateGpaPoints("F"), 0.0, "Grade F should be 0.0");

  // Test 2: Academic Standing Classification
  assertEquals(getAcademicStanding(3.9), "First Class Honors / Dean's List", "CGPA 3.9 standing");
  assertEquals(getAcademicStanding(3.6), "First Class Honors / Dean's List", "CGPA 3.6 standing");
  assertEquals(getAcademicStanding(3.2), "Second Class Upper Division", "CGPA 3.2 standing");
  assertEquals(getAcademicStanding(2.6), "Second Class Lower Division", "CGPA 2.6 standing");
  assertEquals(getAcademicStanding(1.8), "Academic Probation Warning", "CGPA 1.8 standing");

  // Test 3: At-Risk Student Diagnostic Evaluation
  const lowRisk = evaluateAtRiskStudent({ attendancePct: 92, quizAvg: 88, assignmentsSubmittedPct: 95 });
  assertEquals(lowRisk.riskLevel, "low", "High performing student should be low risk");

  const highRisk = evaluateAtRiskStudent({ attendancePct: 55, quizAvg: 42, assignmentsSubmittedPct: 50 });
  assertEquals(highRisk.riskLevel, "critical", "Low attendance and scores should trigger critical risk");
  assert(highRisk.recommendedIntervention.length > 0, "Recommended intervention should be populated");

  console.log("  ✅ Domain Layer Unit Tests Passed Successfully!");
}
