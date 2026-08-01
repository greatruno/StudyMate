/**
 * AcademicService.ts
 * Service layer for Phase 3.1 Academic Management Subsystem.
 * Enforces business logic, prerequisite checks, credit unit limits, and dashboard statistics.
 */

import {
  academicRepository,
  Institution,
  Faculty,
  Department,
  Programme,
  AcademicSession,
  AcademicSemester,
  CourseCategory,
  Course,
  CourseRegistration,
  StudentAcademicProfile,
} from "../repositories/AcademicRepository.js";

export interface AcademicDashboardSummary {
  profile: StudentAcademicProfile;
  currentSession: AcademicSession | null;
  currentSemester: AcademicSemester | null;
  totalCoursesCount: number;
  activeRegisteredCourses: Array<{
    registration: CourseRegistration;
    course: Course;
  }>;
  totalRegisteredUnits: number;
  maxUnitLimit: number;
  registrationStatus: "not_started" | "in_progress" | "submitted" | "approved";
  levelProgressPercentage: number;
}

export class AcademicService {
  /**
   * Get Student Academic Profile
   */
  public async getProfile(userId: string): Promise<StudentAcademicProfile> {
    return academicRepository.getStudentProfile(userId);
  }

  /**
   * Update Student Academic Profile
   */
  public async updateProfile(
    userId: string,
    updates: Partial<StudentAcademicProfile>
  ): Promise<StudentAcademicProfile> {
    return academicRepository.updateStudentProfile(userId, updates);
  }

  /**
   * Get Institutions
   */
  public async getInstitutions(): Promise<Institution[]> {
    return academicRepository.getInstitutions();
  }

  public async addInstitution(data: Omit<Institution, "id">): Promise<Institution> {
    return academicRepository.addInstitution(data);
  }

  /**
   * Get Faculties
   */
  public async getFaculties(institutionId?: string): Promise<Faculty[]> {
    return academicRepository.getFaculties(institutionId);
  }

  public async addFaculty(data: Omit<Faculty, "id">): Promise<Faculty> {
    return academicRepository.addFaculty(data);
  }

  /**
   * Get Departments
   */
  public async getDepartments(facultyId?: string): Promise<Department[]> {
    return academicRepository.getDepartments(facultyId);
  }

  public async addDepartment(data: Omit<Department, "id">): Promise<Department> {
    return academicRepository.addDepartment(data);
  }

  /**
   * Get Programmes
   */
  public async getProgrammes(departmentId?: string): Promise<Programme[]> {
    return academicRepository.getProgrammes(departmentId);
  }

  public async addProgramme(data: Omit<Programme, "id">): Promise<Programme> {
    return academicRepository.addProgramme(data);
  }

  /**
   * Sessions
   */
  public async getSessions(): Promise<AcademicSession[]> {
    return academicRepository.getSessions();
  }

  public async getCurrentSession(): Promise<AcademicSession | undefined> {
    return academicRepository.getCurrentSession();
  }

  public async addSession(data: Omit<AcademicSession, "id">): Promise<AcademicSession> {
    return academicRepository.addSession(data);
  }

  public async activateSession(id: string): Promise<AcademicSession | undefined> {
    return academicRepository.setCurrentSession(id);
  }

  /**
   * Semesters
   */
  public async getSemesters(sessionId?: string): Promise<AcademicSemester[]> {
    return academicRepository.getSemesters(sessionId);
  }

  public async getCurrentSemester(): Promise<AcademicSemester | undefined> {
    return academicRepository.getCurrentSemester();
  }

  public async addSemester(data: Omit<AcademicSemester, "id">): Promise<AcademicSemester> {
    return academicRepository.addSemester(data);
  }

  public async activateSemester(id: string): Promise<AcademicSemester | undefined> {
    return academicRepository.setCurrentSemester(id);
  }

  /**
   * Course Categories
   */
  public async getCategories(): Promise<CourseCategory[]> {
    return academicRepository.getCategories();
  }

  /**
   * Courses
   */
  public async getCourses(filter?: {
    level?: number;
    semester?: string;
    departmentId?: string;
    status?: string;
    search?: string;
  }): Promise<Course[]> {
    return academicRepository.getCourses(filter);
  }

  public async getCourseById(id: string): Promise<Course | undefined> {
    return academicRepository.getCourseById(id);
  }

  public async createCourse(data: Omit<Course, "id">): Promise<Course> {
    // Validate required fields
    if (!data.code || !data.title || !data.creditUnit || !data.level || !data.semester) {
      throw new Error("Missing required course fields: code, title, creditUnit, level, semester");
    }
    return academicRepository.addCourse(data);
  }

  public async updateCourse(id: string, updates: Partial<Course>): Promise<Course | undefined> {
    return academicRepository.updateCourse(id, updates);
  }

  public async deleteCourse(id: string): Promise<boolean> {
    return academicRepository.deleteCourse(id);
  }

  /**
   * Course Registration Logic
   */
  public async getRegistrations(userId: string, sessionId?: string, semesterId?: string) {
    const regs = academicRepository.getRegistrations(userId, sessionId, semesterId);
    // Attach course details
    const activeRegs = regs
      .filter((r) => r.status !== "dropped")
      .map((r) => {
        const course = academicRepository.getCourseById(r.courseId);
        return {
          registration: r,
          course: course || {
            id: r.courseId,
            code: "UNKNOWN",
            title: "Course Details Unavailable",
            creditUnit: 0,
            level: 100,
            semester: "First",
            departmentId: "",
            facultyId: "",
            programmeId: "",
            status: "Core",
            prerequisites: [],
          },
        };
      });

    return activeRegs;
  }

  public async registerCourse(
    userId: string,
    courseId: string,
    sessionId?: string,
    semesterId?: string
  ): Promise<{ registration: CourseRegistration; course: Course; totalUnits: number }> {
    const course = academicRepository.getCourseById(courseId);
    if (!course) {
      throw new Error(`Course with ID or code '${courseId}' not found.`);
    }

    const currentSess = sessionId ? { id: sessionId } : academicRepository.getCurrentSession();
    const currentSem = semesterId ? { id: semesterId } : academicRepository.getCurrentSemester();

    if (!currentSess || !currentSem) {
      throw new Error("Active academic session and semester must be defined before course registration.");
    }

    // Calculate current registered units
    const currentRegs = await this.getRegistrations(userId, currentSess.id, currentSem.id);
    const totalCurrentUnits = currentRegs.reduce((acc, curr) => acc + curr.course.creditUnit, 0);

    const MAX_UNITS_PER_SEMESTER = 24;
    if (totalCurrentUnits + course.creditUnit > MAX_UNITS_PER_SEMESTER) {
      throw new Error(
        `Credit unit limit exceeded! Current: ${totalCurrentUnits} units. Adding ${course.code} (${course.creditUnit} units) exceeds maximum limit of ${MAX_UNITS_PER_SEMESTER} units.`
      );
    }

    const registration = academicRepository.registerCourse(userId, course.id, currentSess.id, currentSem.id);

    return {
      registration,
      course,
      totalUnits: totalCurrentUnits + course.creditUnit,
    };
  }

  public async dropCourse(
    userId: string,
    courseId: string,
    sessionId?: string,
    semesterId?: string
  ): Promise<boolean> {
    const currentSess = sessionId ? { id: sessionId } : academicRepository.getCurrentSession();
    const currentSem = semesterId ? { id: semesterId } : academicRepository.getCurrentSemester();

    if (!currentSess || !currentSem) {
      throw new Error("Active academic session and semester required to drop course.");
    }

    return academicRepository.dropCourse(userId, courseId, currentSess.id, currentSem.id);
  }

  /**
   * Academic Dashboard Summary Generator
   */
  public async getDashboardSummary(userId: string): Promise<AcademicDashboardSummary> {
    const profile = await this.getProfile(userId);
    const currentSession = (await this.getCurrentSession()) || null;
    const currentSemester = (await this.getCurrentSemester()) || null;

    const allCourses = await this.getCourses();
    const totalCoursesCount = allCourses.length;

    let activeRegisteredCourses: Array<{ registration: CourseRegistration; course: Course }> = [];
    if (currentSession && currentSemester) {
      activeRegisteredCourses = await this.getRegistrations(userId, currentSession.id, currentSemester.id);
    }

    const totalRegisteredUnits = activeRegisteredCourses.reduce((acc, r) => acc + r.course.creditUnit, 0);

    // Calculate level progress (e.g. level 200 out of 400 = 50%)
    const programme = academicRepository.getProgrammes().find((p) => p.id === profile.programmeId);
    const durationYears = programme ? programme.durationYears : 4;
    const maxLevel = durationYears * 100;
    const levelProgressPercentage = Math.min(100, Math.round((profile.currentLevel / maxLevel) * 100));

    const registrationStatus =
      activeRegisteredCourses.length === 0
        ? "not_started"
        : activeRegisteredCourses.some((r) => r.registration.status === "approved")
        ? "approved"
        : "in_progress";

    return {
      profile,
      currentSession,
      currentSemester,
      totalCoursesCount,
      activeRegisteredCourses,
      totalRegisteredUnits,
      maxUnitLimit: 24,
      registrationStatus,
      levelProgressPercentage,
    };
  }

  // --- PHASE 4.2 SERVICE METHODS ---
  public async getBranding() { return academicRepository.getBranding(); }
  public async updateBranding(updates: any) { return academicRepository.updateBranding(updates); }
  
  public async getLecturerMaterials(courseCode?: string) { return academicRepository.getLecturerMaterials(courseCode); }
  public async addLecturerMaterial(data: any) { return academicRepository.addLecturerMaterial(data); }
  public async deleteLecturerMaterial(id: string) { return academicRepository.deleteLecturerMaterial(id); }

  public async getAttendanceRecords(classroomId?: string) { return academicRepository.getAttendanceRecords(classroomId); }
  public async addAttendanceRecord(record: any) { return academicRepository.addAttendanceRecord(record); }

  public async getQuestionBank(courseCode?: string) { return academicRepository.getQuestionBank(courseCode); }
  public async addQuestionBankItem(item: any) { return academicRepository.addQuestionBankItem(item); }

  public async getScheduledExams(classroomId?: string) { return academicRepository.getScheduledExams(classroomId); }
  public async createExam(exam: any) { return academicRepository.createExam(exam); }
  public async submitExam(submission: any) { return academicRepository.submitExam(submission); }
  public async getExamSubmissions(examId?: string) { return academicRepository.getExamSubmissions(examId); }

  public async getAtRiskAlerts() { return academicRepository.getAtRiskAlerts(); }
  public async getInstitutionalMetrics() { return academicRepository.getInstitutionalMetrics(); }
}

export const academicService = new AcademicService();

