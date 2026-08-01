/**
 * AcademicRepository.ts
 * In-memory / persistent store repository for Phase 3.1 Academic Management Subsystem.
 * Manages Institutions, Faculties, Departments, Programmes, Sessions, Semesters,
 * Courses, Course Categories, Course Registrations, and Student Academic Profiles.
 */

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: "University" | "Polytechnic" | "College" | "Institute";
  country: string;
  logoUrl?: string;
}

export interface Faculty {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  deanName?: string;
}

export interface Department {
  id: string;
  facultyId: string;
  name: string;
  code: string;
  headOfDepartment?: string;
}

export interface Programme {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  degreeType: "B.Sc." | "B.A." | "B.Eng." | "M.Sc." | "Ph.D." | "HND" | "ND";
  durationYears: number;
}

export interface AcademicSession {
  id: string;
  sessionName: string; // e.g. "2024/2025"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface AcademicSemester {
  id: string;
  sessionId: string;
  semesterType: "First" | "Second" | "Summer";
  name: string; // e.g. "First Semester 2024/2025"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
}

export interface Course {
  id: string;
  code: string; // e.g. "CSC 201"
  title: string; // e.g. "Data Structures and Algorithms"
  creditUnit: number; // e.g. 3
  level: number; // e.g. 100, 200, 300, 400, 500
  semester: "First" | "Second" | "Summer";
  departmentId: string;
  facultyId: string;
  programmeId: string;
  status: "Core" | "Elective" | "Required" | "General";
  prerequisites: string[]; // Course codes or IDs
  description?: string;
}

export interface CourseRegistration {
  id: string;
  userId: string;
  sessionId: string;
  semesterId: string;
  courseId: string;
  status: "registered" | "approved" | "dropped";
  registeredAt: string;
}

export interface StudentAcademicProfile {
  userId: string;
  institutionId: string;
  institutionName: string;
  facultyId: string;
  facultyName: string;
  departmentId: string;
  departmentName: string;
  programmeId: string;
  programmeName: string;
  matricNumber: string;
  entryYear: number;
  graduationYear: number;
  currentLevel: number;
  currentSemester: "First" | "Second" | "Summer";
  academicStatus: "active" | "graduated" | "suspended" | "probation";
  updatedAt: string;
}

// Default Seed Data for Academic Management Subsystem
const DEFAULT_INSTITUTIONS: Institution[] = [
  { id: "inst_1", name: "Federal University of Technology", code: "FUT", type: "University", country: "Nigeria" },
  { id: "inst_2", name: "Metropolitan State University", code: "MSU", type: "University", country: "United States" },
  { id: "inst_3", name: "Imperial Institute of Science & Technology", code: "IIST", type: "University", country: "United Kingdom" },
];

const DEFAULT_FACULTIES: Faculty[] = [
  { id: "fac_1", institutionId: "inst_1", name: "Faculty of Computing & Information Technology", code: "FCIT", deanName: "Prof. Alan Turing" },
  { id: "fac_2", institutionId: "inst_1", name: "Faculty of Engineering & Technology", code: "FET", deanName: "Prof. Nikola Tesla" },
  { id: "fac_3", institutionId: "inst_1", name: "Faculty of Science", code: "FSC", deanName: "Prof. Marie Curie" },
  { id: "fac_4", institutionId: "inst_1", name: "Faculty of Management Sciences", code: "FMS", deanName: "Dr. Peter Drucker" },
];

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: "dept_1", facultyId: "fac_1", name: "Computer Science", code: "CSC", headOfDepartment: "Dr. Grace Hopper" },
  { id: "dept_2", facultyId: "fac_1", name: "Software Engineering", code: "SEN", headOfDepartment: "Dr. Margaret Hamilton" },
  { id: "dept_3", facultyId: "fac_1", name: "Cybersecurity", code: "CYB", headOfDepartment: "Dr. Bruce Schneier" },
  { id: "dept_4", facultyId: "fac_2", name: "Electrical & Electronics Engineering", code: "EEE", headOfDepartment: "Engr. Claude Shannon" },
  { id: "dept_5", facultyId: "fac_2", name: "Mechanical Engineering", code: "MEE", headOfDepartment: "Dr. James Watt" },
];

const DEFAULT_PROGRAMMES: Programme[] = [
  { id: "prog_1", departmentId: "dept_1", name: "B.Sc. Computer Science", code: "BSC-CSC", degreeType: "B.Sc.", durationYears: 4 },
  { id: "prog_2", departmentId: "dept_2", name: "B.Sc. Software Engineering", code: "BSC-SEN", degreeType: "B.Sc.", durationYears: 4 },
  { id: "prog_3", departmentId: "dept_3", name: "B.Sc. Cybersecurity", code: "BSC-CYB", degreeType: "B.Sc.", durationYears: 4 },
  { id: "prog_4", departmentId: "dept_4", name: "B.Eng. Electrical Engineering", code: "BENG-EEE", degreeType: "B.Eng.", durationYears: 5 },
];

const DEFAULT_SESSIONS: AcademicSession[] = [
  { id: "sess_1", sessionName: "2023/2024", startDate: "2023-09-15", endDate: "2024-06-30", isCurrent: false },
  { id: "sess_2", sessionName: "2024/2025", startDate: "2024-09-15", endDate: "2025-06-30", isCurrent: true },
  { id: "sess_3", sessionName: "2025/2026", startDate: "2025-09-15", endDate: "2026-06-30", isCurrent: false },
];

const DEFAULT_SEMESTERS: AcademicSemester[] = [
  { id: "sem_1", sessionId: "sess_2", semesterType: "First", name: "First Semester 2024/2025", startDate: "2024-09-15", endDate: "2025-01-31", isCurrent: true },
  { id: "sem_2", sessionId: "sess_2", semesterType: "Second", name: "Second Semester 2024/2025", startDate: "2025-02-15", endDate: "2025-06-30", isCurrent: false },
  { id: "sem_3", sessionId: "sess_2", semesterType: "Summer", name: "Summer Semester 2024/2025", startDate: "2025-07-01", endDate: "2025-08-31", isCurrent: false },
];

const DEFAULT_CATEGORIES: CourseCategory[] = [
  { id: "cat_1", name: "Departmental Core", description: "Mandatory major courses required for degree qualification." },
  { id: "cat_2", name: "Faculty Required", description: "Required courses across all departments in the faculty." },
  { id: "cat_3", name: "General Studies (GST)", description: "Institutional general education and life skills requirements." },
  { id: "cat_4", name: "Elective", description: "Optional specialized interest courses." },
];

const DEFAULT_COURSES: Course[] = [
  // 100 Level Courses
  {
    id: "crs_101",
    code: "CSC 101",
    title: "Introduction to Computer Science",
    creditUnit: 3,
    level: 100,
    semester: "First",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Core",
    prerequisites: [],
    description: "Overview of computing, binary systems, computer architecture, and basic problem solving."
  },
  {
    id: "crs_102",
    code: "MTH 101",
    title: "Elementary Mathematics I (Algebra & Trigonometry)",
    creditUnit: 3,
    level: 100,
    semester: "First",
    departmentId: "dept_1",
    facultyId: "fac_3",
    programmeId: "prog_1",
    status: "Required",
    prerequisites: [],
    description: "Sets, quadratic equations, mathematical induction, matrices, complex numbers, and trigonometry."
  },
  {
    id: "crs_103",
    code: "GST 101",
    title: "Use of English & Communication Skills",
    creditUnit: 2,
    level: 100,
    semester: "First",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "General",
    prerequisites: [],
    description: "Grammar, academic essay writing, comprehension, and oral communication."
  },
  {
    id: "crs_104",
    code: "PHY 101",
    title: "General Physics I (Mechanics & Heat)",
    creditUnit: 3,
    level: 100,
    semester: "First",
    departmentId: "dept_1",
    facultyId: "fac_3",
    programmeId: "prog_1",
    status: "Required",
    prerequisites: [],
    description: "Vectors, kinematics, Newton's laws, energy, momentum, thermodynamics, and fluid mechanics."
  },
  {
    id: "crs_105",
    code: "CSC 102",
    title: "Introduction to Problem Solving & C Programming",
    creditUnit: 3,
    level: 100,
    semester: "Second",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Core",
    prerequisites: ["CSC 101"],
    description: "Algorithms, flowcharts, variables, pointers, functions, and structured C programming."
  },
  {
    id: "crs_106",
    code: "MTH 102",
    title: "Elementary Mathematics II (Calculus)",
    creditUnit: 3,
    level: 100,
    semester: "Second",
    departmentId: "dept_1",
    facultyId: "fac_3",
    programmeId: "prog_1",
    status: "Required",
    prerequisites: ["MTH 101"],
    description: "Limits, continuity, differentiation, integration, and applications of calculus."
  },

  // 200 Level Courses
  {
    id: "crs_201",
    code: "CSC 201",
    title: "Data Structures & Algorithms",
    creditUnit: 3,
    level: 200,
    semester: "First",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Core",
    prerequisites: ["CSC 102"],
    description: "Arrays, linked lists, stacks, queues, trees, graphs, sorting, searching, and time complexity."
  },
  {
    id: "crs_202",
    code: "CSC 203",
    title: "Object-Oriented Programming (Java/C++)",
    creditUnit: 3,
    level: 200,
    semester: "First",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Core",
    prerequisites: ["CSC 102"],
    description: "Classes, objects, inheritance, polymorphism, encapsulation, abstraction, and design patterns."
  },
  {
    id: "crs_203",
    code: "MTH 201",
    title: "Discrete Mathematics",
    creditUnit: 3,
    level: 200,
    semester: "First",
    departmentId: "dept_1",
    facultyId: "fac_3",
    programmeId: "prog_1",
    status: "Required",
    prerequisites: ["MTH 101"],
    description: "Logic, set theory, combinatorics, graph theory, relations, and proof techniques."
  },
  {
    id: "crs_204",
    code: "CSC 202",
    title: "Computer Architecture & Organization",
    creditUnit: 3,
    level: 200,
    semester: "Second",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Core",
    prerequisites: ["CSC 101"],
    description: "CPU registers, ALUs, memory hierarchy, assembly language, and instruction sets."
  },
  {
    id: "crs_205",
    code: "CSC 204",
    title: "Database Management Systems I",
    creditUnit: 3,
    level: 200,
    semester: "Second",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Core",
    prerequisites: ["CSC 201"],
    description: "ER diagrams, relational model, SQL queries, normalization, transactions, and indexing."
  },

  // 300 Level Courses
  {
    id: "crs_301",
    code: "CSC 301",
    title: "Operating Systems & Systems Programming",
    creditUnit: 3,
    level: 300,
    semester: "First",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Core",
    prerequisites: ["CSC 202"],
    description: "Processes, threads, CPU scheduling, deadlocks, memory management, and file systems."
  },
  {
    id: "crs_302",
    code: "CSC 303",
    title: "Software Engineering & Architecture",
    creditUnit: 3,
    level: 300,
    semester: "First",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Core",
    prerequisites: ["CSC 203"],
    description: "SDLC methodologies, Agile, UML modeling, testing, maintenance, and software quality assurance."
  },
  {
    id: "crs_303",
    code: "CSC 305",
    title: "Artificial Intelligence & Machine Learning",
    creditUnit: 3,
    level: 300,
    semester: "First",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Elective",
    prerequisites: ["CSC 201", "MTH 201"],
    description: "Search algorithms, knowledge representation, neural networks, supervised/unsupervised learning."
  },
  {
    id: "crs_304",
    code: "CSC 302",
    title: "Computer Networks & Communications",
    creditUnit: 3,
    level: 300,
    semester: "Second",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Core",
    prerequisites: ["CSC 202"],
    description: "OSI and TCP/IP models, routing, switching, IP addressing, HTTP, DNS, and network security."
  },

  // 400 Level Courses
  {
    id: "crs_401",
    code: "CSC 401",
    title: "Compiler Construction & Formal Languages",
    creditUnit: 3,
    level: 400,
    semester: "First",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Core",
    prerequisites: ["CSC 201"],
    description: "Lexical analysis, parsing, syntax-directed translation, symbol tables, and code generation."
  },
  {
    id: "crs_402",
    code: "CSC 499",
    title: "Final Year B.Sc. Capstone Research Project",
    creditUnit: 6,
    level: 400,
    semester: "Second",
    departmentId: "dept_1",
    facultyId: "fac_1",
    programmeId: "prog_1",
    status: "Core",
    prerequisites: ["CSC 303"],
    description: "Independent research project, design, implementation, documentation, and oral defense."
  },
];

const DEFAULT_REGISTRATIONS: CourseRegistration[] = [
  { id: "reg_1", userId: "guest", sessionId: "sess_2", semesterId: "sem_1", courseId: "crs_201", status: "approved", registeredAt: "2024-09-20T10:00:00Z" },
  { id: "reg_2", userId: "guest", sessionId: "sess_2", semesterId: "sem_1", courseId: "crs_202", status: "approved", registeredAt: "2024-09-20T10:05:00Z" },
  { id: "reg_3", userId: "guest", sessionId: "sess_2", semesterId: "sem_1", courseId: "crs_203", status: "registered", registeredAt: "2024-09-20T10:10:00Z" },
];

const DEFAULT_PROFILE: StudentAcademicProfile = {
  userId: "guest",
  institutionId: "inst_1",
  institutionName: "Federal University of Technology",
  facultyId: "fac_1",
  facultyName: "Faculty of Computing & Information Technology",
  departmentId: "dept_1",
  departmentName: "Computer Science",
  programmeId: "prog_1",
  programmeName: "B.Sc. Computer Science",
  matricNumber: "CSC/2022/0481",
  entryYear: 2022,
  graduationYear: 2026,
  currentLevel: 200,
  currentSemester: "First",
  academicStatus: "active",
  updatedAt: new Date().toISOString(),
};

export class AcademicRepository {
  private institutions: Institution[] = [...DEFAULT_INSTITUTIONS];
  private faculties: Faculty[] = [...DEFAULT_FACULTIES];
  private departments: Department[] = [...DEFAULT_DEPARTMENTS];
  private programmes: Programme[] = [...DEFAULT_PROGRAMMES];
  private sessions: AcademicSession[] = [...DEFAULT_SESSIONS];
  private semesters: AcademicSemester[] = [...DEFAULT_SEMESTERS];
  private categories: CourseCategory[] = [...DEFAULT_CATEGORIES];
  private courses: Course[] = [...DEFAULT_COURSES];
  private registrations: CourseRegistration[] = [...DEFAULT_REGISTRATIONS];
  private profiles: Map<string, StudentAcademicProfile> = new Map();

  constructor() {
    this.profiles.set("guest", { ...DEFAULT_PROFILE });
  }

  // --- INSTITUTIONS ---
  public getInstitutions(): Institution[] {
    return this.institutions;
  }

  public addInstitution(inst: Omit<Institution, "id">): Institution {
    const newInst: Institution = { ...inst, id: `inst_${Date.now()}` };
    this.institutions.push(newInst);
    return newInst;
  }

  // --- FACULTIES ---
  public getFaculties(institutionId?: string): Faculty[] {
    if (institutionId) {
      return this.faculties.filter((f) => f.institutionId === institutionId);
    }
    return this.faculties;
  }

  public addFaculty(fac: Omit<Faculty, "id">): Faculty {
    const newFac: Faculty = { ...fac, id: `fac_${Date.now()}` };
    this.faculties.push(newFac);
    return newFac;
  }

  // --- DEPARTMENTS ---
  public getDepartments(facultyId?: string): Department[] {
    if (facultyId) {
      return this.departments.filter((d) => d.facultyId === facultyId);
    }
    return this.departments;
  }

  public addDepartment(dept: Omit<Department, "id">): Department {
    const newDept: Department = { ...dept, id: `dept_${Date.now()}` };
    this.departments.push(newDept);
    return newDept;
  }

  // --- PROGRAMMES ---
  public getProgrammes(departmentId?: string): Programme[] {
    if (departmentId) {
      return this.programmes.filter((p) => p.departmentId === departmentId);
    }
    return this.programmes;
  }

  public addProgramme(prog: Omit<Programme, "id">): Programme {
    const newProg: Programme = { ...prog, id: `prog_${Date.now()}` };
    this.programmes.push(newProg);
    return newProg;
  }

  // --- SESSIONS ---
  public getSessions(): AcademicSession[] {
    return this.sessions;
  }

  public getCurrentSession(): AcademicSession | undefined {
    return this.sessions.find((s) => s.isCurrent) || this.sessions[0];
  }

  public addSession(sess: Omit<AcademicSession, "id">): AcademicSession {
    if (sess.isCurrent) {
      this.sessions.forEach((s) => (s.isCurrent = false));
    }
    const newSess: AcademicSession = { ...sess, id: `sess_${Date.now()}` };
    this.sessions.push(newSess);
    return newSess;
  }

  public setCurrentSession(id: string): AcademicSession | undefined {
    let found: AcademicSession | undefined;
    this.sessions.forEach((s) => {
      if (s.id === id) {
        s.isCurrent = true;
        found = s;
      } else {
        s.isCurrent = false;
      }
    });
    return found;
  }

  // --- SEMESTERS ---
  public getSemesters(sessionId?: string): AcademicSemester[] {
    if (sessionId) {
      return this.semesters.filter((s) => s.sessionId === sessionId);
    }
    return this.semesters;
  }

  public getCurrentSemester(): AcademicSemester | undefined {
    return this.semesters.find((s) => s.isCurrent) || this.semesters[0];
  }

  public addSemester(sem: Omit<AcademicSemester, "id">): AcademicSemester {
    if (sem.isCurrent) {
      this.semesters.forEach((s) => (s.isCurrent = false));
    }
    const newSem: AcademicSemester = { ...sem, id: `sem_${Date.now()}` };
    this.semesters.push(newSem);
    return newSem;
  }

  public setCurrentSemester(id: string): AcademicSemester | undefined {
    let found: AcademicSemester | undefined;
    this.semesters.forEach((s) => {
      if (s.id === id) {
        s.isCurrent = true;
        found = s;
      } else {
        s.isCurrent = false;
      }
    });
    return found;
  }

  // --- COURSE CATEGORIES ---
  public getCategories(): CourseCategory[] {
    return this.categories;
  }

  // --- COURSES ---
  public getCourses(filter?: {
    level?: number;
    semester?: string;
    departmentId?: string;
    status?: string;
    search?: string;
  }): Course[] {
    let list = [...this.courses];
    if (filter?.level) {
      list = list.filter((c) => c.level === filter.level);
    }
    if (filter?.semester) {
      list = list.filter((c) => c.semester.toLowerCase() === filter.semester?.toLowerCase());
    }
    if (filter?.departmentId) {
      list = list.filter((c) => c.departmentId === filter.departmentId);
    }
    if (filter?.status) {
      list = list.filter((c) => c.status.toLowerCase() === filter.status?.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getCourseById(id: string): Course | undefined {
    return this.courses.find((c) => c.id === id || c.code.toLowerCase() === id.toLowerCase());
  }

  public addCourse(courseData: Omit<Course, "id">): Course {
    const newCourse: Course = { ...courseData, id: `crs_${Date.now()}` };
    this.courses.push(newCourse);
    return newCourse;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    const idx = this.courses.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.courses[idx] = { ...this.courses[idx], ...updates };
      return this.courses[idx];
    }
    return undefined;
  }

  public deleteCourse(id: string): boolean {
    const lenBefore = this.courses.length;
    this.courses = this.courses.filter((c) => c.id !== id);
    return this.courses.length < lenBefore;
  }

  // --- COURSE REGISTRATIONS ---
  public getRegistrations(userId: string, sessionId?: string, semesterId?: string): CourseRegistration[] {
    return this.registrations.filter((r) => {
      if (r.userId !== userId) return false;
      if (sessionId && r.sessionId !== sessionId) return false;
      if (semesterId && r.semesterId !== semesterId) return false;
      return true;
    });
  }

  public registerCourse(userId: string, courseId: string, sessionId: string, semesterId: string): CourseRegistration {
    // Check if already registered
    const existing = this.registrations.find(
      (r) => r.userId === userId && r.courseId === courseId && r.sessionId === sessionId && r.semesterId === semesterId
    );
    if (existing) {
      if (existing.status === "dropped") {
        existing.status = "registered";
        existing.registeredAt = new Date().toISOString();
      }
      return existing;
    }

    const reg: CourseRegistration = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      sessionId,
      semesterId,
      courseId,
      status: "registered",
      registeredAt: new Date().toISOString(),
    };
    this.registrations.push(reg);
    return reg;
  }

  public dropCourse(userId: string, courseId: string, sessionId: string, semesterId: string): boolean {
    const idx = this.registrations.findIndex(
      (r) => r.userId === userId && r.courseId === courseId && r.sessionId === sessionId && r.semesterId === semesterId
    );
    if (idx !== -1) {
      this.registrations[idx].status = "dropped";
      return true;
    }
    return false;
  }

  // --- PHASE 4.2 INSTITUTION & CLASSROOM EXTENSIONS ---
  private branding: any = {
    primaryColor: "#4F46E5",
    secondaryColor: "#0EA5E9",
    tagline: "Empowering Next-Generation Academic Excellence with Intelligent RAG & AI Workspace",
    campusAddress: "100 Academy Avenue, Science & Tech Campus",
    contactEmail: "admin@university.edu",
    websiteUrl: "https://studymate.academy",
    portalAnnouncement: "🎉 Semester Registration is currently open! Ensure all core prerequisites are verified before submitting course forms."
  };

  private lecturerMaterials: any[] = [
    {
      id: "mat_101",
      courseId: "crs_101",
      courseCode: "CSC 101",
      title: "Lecture Notes 01: Computer Architecture & Binary Logic",
      type: "lecture_notes",
      description: "Detailed breakdown of Von Neumann architecture, ALU principles, CPU registers, and instruction execution cycles.",
      uploadedByUsername: "dr_grace_hopper",
      uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      downloadsCount: 42
    },
    {
      id: "mat_102",
      courseId: "crs_101",
      courseCode: "CSC 101",
      title: "Slide Outline: Introduction to Data Structures",
      type: "slides",
      description: "High-level presentation covering Arrays, Linked Lists, Stacks, Queues, and Big-O notation complexity.",
      uploadedByUsername: "dr_grace_hopper",
      uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      downloadsCount: 68
    }
  ];

  private attendanceRecords: any[] = [
    {
      id: "att_1",
      classroomId: "class-1",
      date: new Date().toISOString().split("T")[0],
      lectureTopic: "Metabolic Pathways & Glycolysis Deep-Dive",
      studentUsernamesPresent: ["peer_student_sam", "alex_study_hard"],
      studentUsernamesLate: [],
      studentUsernamesAbsent: ["coder_sam"],
      recordedByUsername: "teacher_jane"
    }
  ];

  private rubrics: any[] = [
    {
      id: "rubric_1",
      assignmentId: "assign-1",
      criteria: [
        { id: "c1", name: "Conceptual Clarity", maxPoints: 30, description: "Demonstrates deep understanding of cellular respiration steps." },
        { id: "c2", name: "Methodological Precision", maxPoints: 40, description: "Accurate equations, ATP yields, and enzyme balance." },
        { id: "c3", name: "Formatting & Rigor", maxPoints: 30, description: "Clean structural organization and clear diagrams." }
      ]
    }
  ];

  private questionBank: any[] = [
    {
      id: "qb_1",
      courseCode: "CSC 101",
      type: "mcq",
      question: "Which component of the CPU performs mathematical calculations and logical comparisons?",
      options: ["Control Unit (CU)", "Arithmetic Logic Unit (ALU)", "Memory Management Unit (MMU)", "Instruction Cache"],
      correctOptionIndex: 1,
      explanation: "The Arithmetic Logic Unit (ALU) is responsible for executing digital arithmetic operations (addition, subtraction) and logical evaluations (AND, OR, NOT).",
      difficulty: "beginner",
      topicTag: "CPU Architecture",
      points: 10
    },
    {
      id: "qb_2",
      courseCode: "CSC 101",
      type: "short_answer",
      question: "Define Von Neumann bottleneck and briefly explain why it impacts computing throughput.",
      sampleAnswer: "The Von Neumann bottleneck occurs because data and instructions share the same bus, limiting memory transfer speed relative to CPU speed.",
      explanation: "A high-scoring answer specifies shared memory bus limits between CPU and RAM.",
      difficulty: "intermediate",
      topicTag: "Computer Architecture",
      points: 15
    }
  ];

  private scheduledExams: any[] = [
    {
      id: "exam_1",
      courseId: "crs_101",
      courseCode: "CSC 101",
      classroomId: "class-1",
      title: "Mid-Semester Examination: Fundamentals of Computing",
      instructions: "Read every question carefully. You have 45 minutes to complete the exam. Auto-marking applies on submission.",
      durationMinutes: 45,
      totalPoints: 100,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
      isPublished: true,
      questions: [
        {
          id: "qb_1",
          courseCode: "CSC 101",
          type: "mcq",
          question: "Which component of the CPU performs mathematical calculations and logical comparisons?",
          options: ["Control Unit (CU)", "Arithmetic Logic Unit (ALU)", "Memory Management Unit (MMU)", "Instruction Cache"],
          correctOptionIndex: 1,
          explanation: "The Arithmetic Logic Unit (ALU) performs arithmetic calculations.",
          difficulty: "beginner",
          topicTag: "CPU Architecture",
          points: 50
        },
        {
          id: "qb_3",
          courseCode: "CSC 101",
          type: "mcq",
          question: "What is the primary function of an Operating System Kernel?",
          options: ["Managing hardware resources and providing low-level system services", "Designing web graphics", "Compiling high-level code to bytecode", "Managing browser cookies"],
          correctOptionIndex: 0,
          explanation: "The kernel acts as the core bridge between hardware components and system processes.",
          difficulty: "beginner",
          topicTag: "Operating Systems",
          points: 50
        }
      ],
      randomizeQuestions: true,
      createdAt: new Date().toISOString()
    }
  ];

  private examSubmissions: any[] = [];

  private atRiskAlerts: any[] = [
    {
      id: "risk_1",
      studentUsername: "coder_sam",
      studentDisplayName: "Sam Coder",
      courseCode: "CSC 101",
      riskLevel: "medium",
      attendancePercentage: 65,
      averageQuizScore: 58,
      missingAssignmentsCount: 2,
      reasons: ["Attendance fell below 70% benchmark in metabolic lectures", "Missed Assignment 1 submission deadline"],
      recommendedIntervention: "Schedule 1-on-1 TA tutoring session and issue automated study planner reminder for CPU Architecture."
    }
  ];

  public getBranding() { return this.branding; }
  public updateBranding(updates: any) { this.branding = { ...this.branding, ...updates }; return this.branding; }
  public getLecturerMaterials(courseCode?: string) {
    if (courseCode) return this.lecturerMaterials.filter(m => m.courseCode === courseCode);
    return this.lecturerMaterials;
  }
  public addLecturerMaterial(data: any) {
    const item = { id: `mat_${Date.now()}`, ...data, uploadedAt: new Date().toISOString(), downloadsCount: 0 };
    this.lecturerMaterials.unshift(item);
    return item;
  }
  public deleteLecturerMaterial(id: string) {
    const lenBefore = this.lecturerMaterials.length;
    this.lecturerMaterials = this.lecturerMaterials.filter(m => m.id !== id);
    return this.lecturerMaterials.length < lenBefore;
  }
  public getAttendanceRecords(classroomId?: string) {
    if (classroomId) return this.attendanceRecords.filter(a => a.classroomId === classroomId);
    return this.attendanceRecords;
  }
  public addAttendanceRecord(record: any) {
    const item = { id: `att_${Date.now()}`, ...record };
    this.attendanceRecords.unshift(item);
    return item;
  }
  public getQuestionBank(courseCode?: string) {
    if (courseCode) return this.questionBank.filter(q => q.courseCode === courseCode);
    return this.questionBank;
  }
  public addQuestionBankItem(item: any) {
    const newItem = { id: `qb_${Date.now()}`, ...item };
    this.questionBank.unshift(newItem);
    return newItem;
  }
  public getScheduledExams(classroomId?: string) {
    if (classroomId) return this.scheduledExams.filter(e => e.classroomId === classroomId);
    return this.scheduledExams;
  }
  public createExam(exam: any) {
    const newExam = { id: `exam_${Date.now()}`, createdAt: new Date().toISOString(), ...exam };
    this.scheduledExams.unshift(newExam);
    return newExam;
  }
  public submitExam(submission: any) {
    const res = { id: `sub_${Date.now()}`, submittedAt: new Date().toISOString(), ...submission };
    this.examSubmissions.unshift(res);
    return res;
  }
  public getExamSubmissions(examId?: string) {
    if (examId) return this.examSubmissions.filter(s => s.examId === examId);
    return this.examSubmissions;
  }
  public getAtRiskAlerts() { return this.atRiskAlerts; }
  public getInstitutionalMetrics() {
    return {
      totalFaculties: this.faculties.length,
      totalDepartments: this.departments.length,
      totalProgrammes: this.programmes.length,
      totalEnrolledStudents: 1420,
      totalActiveLecturers: 84,
      averageClassAttendanceRate: 88.5,
      averageAssignmentCompletionRate: 91.2,
      gradeDistributionCurve: {
        gradeA: 34,
        gradeB: 42,
        gradeC: 16,
        gradeD: 5,
        gradeF: 3
      },
      departmentPerformance: [
        { departmentCode: "CSC", departmentName: "Computer Science", studentsCount: 420, avgGpa: 3.82 },
        { departmentCode: "SEN", departmentName: "Software Engineering", studentsCount: 310, avgGpa: 3.75 },
        { departmentCode: "CYB", departmentName: "Cybersecurity", studentsCount: 280, avgGpa: 3.68 },
        { departmentCode: "EEE", departmentName: "Electrical Engineering", studentsCount: 410, avgGpa: 3.54 }
      ]
    };
  }

  // --- STUDENT ACADEMIC PROFILE ---
  public getStudentProfile(userId: string): StudentAcademicProfile {
    let prof = this.profiles.get(userId);
    if (!prof) {
      prof = {
        ...DEFAULT_PROFILE,
        userId,
      };
      this.profiles.set(userId, prof);
    }
    return prof;
  }

  public updateStudentProfile(userId: string, updates: Partial<StudentAcademicProfile>): StudentAcademicProfile {
    const current = this.getStudentProfile(userId);
    const updated: StudentAcademicProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Auto update derived name fields if IDs change
    if (updates.institutionId) {
      const inst = this.institutions.find((i) => i.id === updates.institutionId);
      if (inst) updated.institutionName = inst.name;
    }
    if (updates.facultyId) {
      const fac = this.faculties.find((f) => f.id === updates.facultyId);
      if (fac) updated.facultyName = fac.name;
    }
    if (updates.departmentId) {
      const dept = this.departments.find((d) => d.id === updates.departmentId);
      if (dept) updated.departmentName = dept.name;
    }
    if (updates.programmeId) {
      const prog = this.programmes.find((p) => p.id === updates.programmeId);
      if (prog) updated.programmeName = prog.name;
    }

    this.profiles.set(userId, updated);
    return updated;
  }
}

export const academicRepository = new AcademicRepository();
