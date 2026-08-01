import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  Search,
  Building,
  Award,
  Layers,
  Sparkles,
  AlertCircle,
  Clock,
  Printer,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  X,
  FileText
} from "lucide-react";
import {
  AcademicInstitution,
  AcademicFaculty,
  AcademicDepartment,
  AcademicProgramme,
  AcademicSession,
  AcademicSemester,
  AcademicCourse,
  StudentAcademicProfile,
  AcademicDashboardSummary,
  RegisteredCourseWithDetails
} from "../../types";

import AcademicIntelligenceDashboard from "./AcademicIntelligenceDashboard";
import InstitutionAdminPortal from "./InstitutionAdminPortal";
import LecturerPortal from "./LecturerPortal";
import AILecturerAssistantView from "./AILecturerAssistantView";
import InstitutionalAnalyticsView from "./InstitutionalAnalyticsView";
import { UserCheck, Bot, BarChart2 } from "lucide-react";

type SubTab = "intelligence" | "dashboard" | "profile" | "courses" | "sessions" | "registration" | "admin" | "lecturer" | "ai_assistant" | "analytics";

export default function AcademicManagementView() {

  const [activeSubTab, setActiveSubTab] = useState<SubTab>("intelligence");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [summary, setSummary] = useState<AcademicDashboardSummary | null>(null);
  const [profile, setProfile] = useState<StudentAcademicProfile | null>(null);
  const [institutions, setInstitutions] = useState<AcademicInstitution[]>([]);
  const [faculties, setFaculties] = useState<AcademicFaculty[]>([]);
  const [departments, setDepartments] = useState<AcademicDepartment[]>([]);
  const [programmes, setProgrammes] = useState<AcademicProgramme[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [semesters, setSemesters] = useState<AcademicSemester[]>([]);
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourseWithDetails[]>([]);

  // Filter states for Course Catalog
  const [courseSearch, setCourseSearch] = useState("");
  const [courseLevelFilter, setCourseLevelFilter] = useState<number | "all">("all");
  const [courseSemesterFilter, setCourseSemesterFilter] = useState<string>("all");
  const [courseStatusFilter, setCourseStatusFilter] = useState<string>("all");

  // Add Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AcademicCourse | null>(null);
  const [courseForm, setCourseForm] = useState({
    code: "",
    title: "",
    creditUnit: 3,
    level: 200,
    semester: "First" as "First" | "Second" | "Summer",
    status: "Core" as "Core" | "Elective" | "Required" | "General",
    prerequisites: "",
    description: ""
  });

  // Add Session Modal State
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    sessionName: "",
    startDate: "",
    endDate: "",
    isCurrent: false
  });

  // Profile Form state
  const [profileForm, setProfileForm] = useState<Partial<StudentAcademicProfile>>({});

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [
        dashRes,
        profRes,
        instRes,
        facRes,
        deptRes,
        progRes,
        sessRes,
        semRes,
        crsRes,
        regRes
      ] = await Promise.all([
        fetch("/api/v1/academic/dashboard").then((r) => r.json()),
        fetch("/api/v1/academic/profile").then((r) => r.json()),
        fetch("/api/v1/academic/institutions").then((r) => r.json()),
        fetch("/api/v1/academic/faculties").then((r) => r.json()),
        fetch("/api/v1/academic/departments").then((r) => r.json()),
        fetch("/api/v1/academic/programmes").then((r) => r.json()),
        fetch("/api/v1/academic/sessions").then((r) => r.json()),
        fetch("/api/v1/academic/semesters").then((r) => r.json()),
        fetch("/api/v1/academic/courses").then((r) => r.json()),
        fetch("/api/v1/academic/registrations").then((r) => r.json())
      ]);

      if (dashRes.success) setSummary(dashRes.data);
      if (profRes.success) {
        setProfile(profRes.data);
        setProfileForm(profRes.data);
      }
      if (instRes.success) setInstitutions(instRes.data);
      if (facRes.success) setFaculties(facRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (progRes.success) setProgrammes(progRes.data);
      if (sessRes.success) setSessions(sessRes.data);
      if (semRes.success) setSemesters(semRes.data);
      if (crsRes.success) setCourses(crsRes.data);
      if (regRes.success) setRegisteredCourses(regRes.data);
    } catch (err: any) {
      console.error("Error fetching academic data:", err);
      setErrorMsg("Failed to load academic data from backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/v1/academic/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      }).then((r) => r.json());

      if (res.success) {
        setProfile(res.data);
        setSuccessMsg("Academic profile updated successfully!");
        fetchAcademicData();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const payload = {
      ...courseForm,
      prerequisites: courseForm.prerequisites
        ? courseForm.prerequisites.split(",").map((p) => p.trim())
        : [],
      departmentId: profile?.departmentId || "dept_1",
      facultyId: profile?.facultyId || "fac_1",
      programmeId: profile?.programmeId || "prog_1"
    };

    try {
      const url = editingCourse
        ? `/api/v1/academic/courses/${editingCourse.id}`
        : "/api/v1/academic/courses";
      const method = editingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then((r) => r.json());

      if (res.success) {
        setSuccessMsg(editingCourse ? "Course updated!" : "Course created!");
        setShowAddCourseModal(false);
        setEditingCourse(null);
        setCourseForm({
          code: "",
          title: "",
          creditUnit: 3,
          level: 200,
          semester: "First",
          status: "Core",
          prerequisites: "",
          description: ""
        });
        fetchAcademicData();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || "Failed to save course.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save course.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/v1/academic/courses/${courseId}`, {
        method: "DELETE"
      }).then((r) => r.json());

      if (res.success) {
        setSuccessMsg("Course deleted.");
        fetchAcademicData();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || "Failed to delete course.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleRegisterCourse = async (courseId: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/v1/academic/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      }).then((r) => r.json());

      if (res.success) {
        setSuccessMsg(`Course registered! (${res.data.course.code})`);
        fetchAcademicData();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || "Course registration failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register course.");
    } finally {
      setLoading(false);
    }
  };

  const handleDropCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to drop this course registration?")) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/academic/registrations/${courseId}`, {
        method: "DELETE"
      }).then((r) => r.json());

      if (res.success) {
        setSuccessMsg("Course dropped.");
        fetchAcademicData();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || "Failed to drop course.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/v1/academic/sessions/${sessionId}/activate`, {
        method: "PATCH"
      }).then((r) => r.json());

      if (res.success) {
        setSuccessMsg("Academic session activated.");
        fetchAcademicData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleActivateSemester = async (semesterId: string) => {
    try {
      const res = await fetch(`/api/v1/academic/semesters/${semesterId}/activate`, {
        method: "PATCH"
      }).then((r) => r.json());

      if (res.success) {
        setSuccessMsg("Semester activated.");
        fetchAcademicData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/academic/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionForm)
      }).then((r) => r.json());

      if (res.success) {
        setSuccessMsg("New academic session added.");
        setShowAddSessionModal(false);
        setSessionForm({ sessionName: "", startDate: "", endDate: "", isCurrent: false });
        fetchAcademicData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    if (courseSearch) {
      const q = courseSearch.toLowerCase();
      const matchSearch =
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    if (courseLevelFilter !== "all" && c.level !== courseLevelFilter) return false;
    if (courseSemesterFilter !== "all" && c.semester !== courseSemesterFilter) return false;
    if (courseStatusFilter !== "all" && c.status.toLowerCase() !== courseStatusFilter.toLowerCase())
      return false;
    return true;
  });

  const totalRegisteredUnits = registeredCourses.reduce((acc, r) => acc + r.course.creditUnit, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <GraduationCap className="h-4 w-4 text-indigo-400" />
              <span>Phase 3.1 — Academic Intelligence Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Academic Management & University Structure
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Central academic registry for institutions, departments, degree programmes, courses, semester registrations, and academic profiling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAcademicData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
              <span>Sync Registry</span>
            </button>

            <button
              onClick={() => setActiveSubTab("registration")}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>Course Registration</span>
            </button>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          {[
            { id: "intelligence", label: "Academic Intelligence Engine ✨", icon: Sparkles },
            { id: "dashboard", label: "Academic Dashboard", icon: Award },
            { id: "admin", label: "Institution Admin", icon: Building },
            { id: "lecturer", label: "Lecturer Portal", icon: UserCheck },
            { id: "ai_assistant", label: "AI Lecturer Assistant", icon: Bot },
            { id: "analytics", label: "Institutional Analytics", icon: BarChart2 },
            { id: "profile", label: "Student Profile", icon: GraduationCap },
            { id: "courses", label: "Course Catalog", icon: BookOpen },
            { id: "sessions", label: "Sessions & Semesters", icon: Calendar },
            { id: "registration", label: "Course Registration", icon: CheckCircle2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* NOTIFICATION MESSAGES */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SUBTAB CONTENT VIEWS */}

      {/* INSTITUTION ADMIN PORTAL */}
      {activeSubTab === "admin" && <InstitutionAdminPortal />}

      {/* LECTURER PORTAL */}
      {activeSubTab === "lecturer" && <LecturerPortal />}

      {/* AI LECTURER ASSISTANT */}
      {activeSubTab === "ai_assistant" && <AILecturerAssistantView />}

      {/* INSTITUTIONAL ANALYTICS */}
      {activeSubTab === "analytics" && <InstitutionalAnalyticsView />}

      {/* 0. ACADEMIC INTELLIGENCE ENGINE SUBVIEW */}
      {activeSubTab === "intelligence" && (
        <AcademicIntelligenceDashboard />
      )}


      {/* 1. ACADEMIC DASHBOARD SUBVIEW */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {/* TOP STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                <span>Registered Units</span>
                <BookOpen className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalRegisteredUnits} <span className="text-xs text-gray-400 font-medium">/ 24 units</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalRegisteredUnits / 24) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                <span>Enrolled Courses</span>
                <Layers className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{registeredCourses.length}</div>
              <p className="text-[11px] text-gray-500">Active for {summary?.currentSemester?.name || "Current Semester"}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                <span>Current Level & Semester</span>
                <GraduationCap className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {profile?.currentLevel || 200} Level ({profile?.currentSemester || "First"})
              </div>
              <p className="text-[11px] text-gray-500">{profile?.programmeName || "Computer Science"}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                <span>Degree Progress</span>
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{summary?.levelProgressPercentage || 50}%</div>
              <p className="text-[11px] text-gray-500">Expected Graduation: {profile?.graduationYear || 2026}</p>
            </div>
          </div>

          {/* ACADEMIC PROFILE & ACTIVE SESSION SUMMARY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Active Course Registrations</h2>
                  <p className="text-xs text-gray-500">Courses enrolled for the current academic session & semester</p>
                </div>
                <button
                  onClick={() => setActiveSubTab("registration")}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage Registrations</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {registeredCourses.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <BookOpen className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">No courses registered for this semester yet.</p>
                  <button
                    onClick={() => setActiveSubTab("registration")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 cursor-pointer"
                  >
                    Register Courses Now
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {registeredCourses.map((reg) => (
                    <div key={reg.registration.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                            {reg.course.code}
                          </span>
                          <span className="text-xs font-semibold text-gray-900">{reg.course.title}</span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          {reg.course.level} Level • {reg.course.semester} Semester • {reg.course.status} Course
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                          {reg.course.creditUnit} Units
                        </span>
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">
                          {reg.registration.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STUDENT CARD & STRUCTURE */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-md relative overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{profile?.matricNumber || "CSC/2022/0481"}</h3>
                    <p className="text-xs text-indigo-300 font-medium">{profile?.programmeName}</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Institution:</span>
                    <span className="font-semibold text-white">{profile?.institutionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Faculty:</span>
                    <span className="font-semibold text-white">{profile?.facultyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-semibold text-white">{profile?.departmentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entry / Grad Year:</span>
                    <span className="font-semibold text-white">
                      {profile?.entryYear} - {profile?.graduationYear}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Academic Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold capitalize">
                      {profile?.academicStatus}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSubTab("profile")}
                  className="w-full mt-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                >
                  Edit Profile Information
                </button>
              </div>

              {/* SESSION NOTICE */}
              <div className="p-5 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span>Current Academic Calendar</span>
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Session: <strong>{summary?.currentSession?.sessionName || "2024/2025"}</strong> | Semester:{" "}
                  <strong>{summary?.currentSemester?.name || "First Semester"}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENT PROFILE SUBVIEW */}
      {activeSubTab === "profile" && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">Student Academic Profile</h2>
            <p className="text-xs text-gray-500">
              Configure your institutional affiliation, matriculation details, and current academic standing.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Institution</label>
                <select
                  value={profileForm.institutionId || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, institutionId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Faculty</label>
                <select
                  value={profileForm.facultyId || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, facultyId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Department</label>
                <select
                  value={profileForm.departmentId || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, departmentId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Programme</label>
                <select
                  value={profileForm.programmeId || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, programmeId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.degreeType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Matriculation Number</label>
                <input
                  type="text"
                  value={profileForm.matricNumber || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, matricNumber: e.target.value })}
                  placeholder="e.g. CSC/2022/0481"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Academic Status</label>
                <select
                  value={profileForm.academicStatus || "active"}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      academicStatus: e.target.value as "active" | "graduated" | "suspended" | "probation"
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                  <option value="probation">Academic Probation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Entry Year</label>
                <input
                  type="number"
                  value={profileForm.entryYear || 2022}
                  onChange={(e) => setProfileForm({ ...profileForm, entryYear: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Expected Graduation Year</label>
                <input
                  type="number"
                  value={profileForm.graduationYear || 2026}
                  onChange={(e) => setProfileForm({ ...profileForm, graduationYear: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Current Level</label>
                <select
                  value={profileForm.currentLevel || 200}
                  onChange={(e) => setProfileForm({ ...profileForm, currentLevel: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value={100}>100 Level</option>
                  <option value={200}>200 Level</option>
                  <option value={300}>300 Level</option>
                  <option value={400}>400 Level</option>
                  <option value={500}>500 Level</option>
                  <option value={700}>700 Level (PGD)</option>
                  <option value={800}>800 Level (Masters)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Current Semester</label>
                <select
                  value={profileForm.currentSemester || "First"}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      currentSemester: e.target.value as "First" | "Second" | "Summer"
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                  <option value="Summer">Summer Semester</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/30"
              >
                {loading ? "Saving Profile..." : "Save Academic Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. COURSE CATALOG SUBVIEW */}
      {activeSubTab === "courses" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Institutional Course Catalog</h2>
                <p className="text-xs text-gray-500">
                  Search, manage, and inspect departmental and faculty course offerings
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCourse(null);
                  setCourseForm({
                    code: "",
                    title: "",
                    creditUnit: 3,
                    level: 200,
                    semester: "First",
                    status: "Core",
                    prerequisites: "",
                    description: ""
                  });
                  setShowAddCourseModal(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Course</span>
              </button>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search course code or title..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <select
                  value={courseLevelFilter}
                  onChange={(e) =>
                    setCourseLevelFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Levels</option>
                  <option value={100}>100 Level</option>
                  <option value={200}>200 Level</option>
                  <option value={300}>300 Level</option>
                  <option value={400}>400 Level</option>
                  <option value={500}>500 Level</option>
                </select>
              </div>

              <div>
                <select
                  value={courseSemesterFilter}
                  onChange={(e) => setCourseSemesterFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Semesters</option>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                  <option value="Summer">Summer Semester</option>
                </select>
              </div>

              <div>
                <select
                  value={courseStatusFilter}
                  onChange={(e) => setCourseStatusFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="core">Core</option>
                  <option value="elective">Elective</option>
                  <option value="required">Required</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </div>

          {/* COURSE LISTING TABLE */}
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Course Code & Title</th>
                    <th className="p-4">Credit Units</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Semester</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Prerequisites</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No courses found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 space-y-0.5">
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] border border-indigo-100">
                              {c.code}
                            </span>
                            <span>{c.title}</span>
                          </div>
                          {c.description && <p className="text-[11px] text-gray-500 line-clamp-1">{c.description}</p>}
                        </td>
                        <td className="p-4 font-semibold text-gray-800">{c.creditUnit} Units</td>
                        <td className="p-4 text-gray-600">{c.level} L</td>
                        <td className="p-4 text-gray-600">{c.semester}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              c.status === "Core"
                                ? "bg-purple-50 text-purple-700 border border-purple-100"
                                : c.status === "Elective"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {c.prerequisites.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {c.prerequisites.map((p, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px]">
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">None</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCourse(c);
                              setCourseForm({
                                code: c.code,
                                title: c.title,
                                creditUnit: c.creditUnit,
                                level: c.level,
                                semester: c.semester,
                                status: c.status,
                                prerequisites: c.prerequisites.join(", "),
                                description: c.description || ""
                              });
                              setShowAddCourseModal(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteCourse(c.id)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACADEMIC SESSIONS & SEMESTERS SUBVIEW */}
      {activeSubTab === "sessions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SESSIONS PANEL */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Academic Sessions</h2>
                <p className="text-xs text-gray-500">Manage yearly academic calendars</p>
              </div>
              <button
                onClick={() => setShowAddSessionModal(true)}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 cursor-pointer flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>New Session</span>
              </button>
            </div>

            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    s.isCurrent ? "bg-indigo-50/50 border-indigo-200 shadow-xs" : "bg-gray-50/50 border-gray-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{s.sessionName}</span>
                      {s.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {s.startDate} to {s.endDate}
                    </p>
                  </div>

                  {!s.isCurrent && (
                    <button
                      onClick={() => handleActivateSession(s.id)}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Set Active
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SEMESTERS PANEL */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Academic Semesters</h2>
                <p className="text-xs text-gray-500">Configure active learning term</p>
              </div>
            </div>

            <div className="space-y-3">
              {semesters.map((sem) => (
                <div
                  key={sem.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    sem.isCurrent ? "bg-emerald-50/50 border-emerald-200 shadow-xs" : "bg-gray-50/50 border-gray-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{sem.name}</span>
                      {sem.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          CURRENT TERM
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {sem.semesterType} Semester • {sem.startDate} to {sem.endDate}
                    </p>
                  </div>

                  {!sem.isCurrent && (
                    <button
                      onClick={() => handleActivateSemester(sem.id)}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Set Active
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. COURSE REGISTRATION HUB SUBVIEW */}
      {activeSubTab === "registration" && (
        <div className="space-y-6">
          {/* REGISTRATION METER & BANNER */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Official Course Registration Hub</h2>
              <p className="text-xs text-indigo-200">
                Register courses for Level {profile?.currentLevel} ({profile?.currentSemester} Semester)
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-6 shrink-0">
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-300">Total Credit Units</p>
                <p className="text-xl font-extrabold text-white">
                  {totalRegisteredUnits} <span className="text-xs font-medium text-slate-400">/ 24 Max</span>
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="h-4 w-4" />
                <span>Print Course Form</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* REGISTERED COURSES TABLE */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-sm text-gray-900">Registered Course Slip</h3>
                <span className="text-xs font-medium text-gray-500">{registeredCourses.length} Courses</span>
              </div>

              {registeredCourses.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-6 text-center">No courses registered yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {registeredCourses.map((reg) => (
                    <div key={reg.registration.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600">{reg.course.code}</span>
                          <span className="text-xs font-semibold text-gray-900">{reg.course.title}</span>
                        </div>
                        <p className="text-[11px] text-gray-500">{reg.course.creditUnit} Credit Units</p>
                      </div>

                      <button
                        onClick={() => handleDropCourse(reg.course.id)}
                        className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Drop
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AVAILABLE COURSES TO REGISTER */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-sm text-gray-900">Available Courses</h3>
                <span className="text-xs text-gray-500">Level {profile?.currentLevel}</span>
              </div>

              <div className="divide-y divide-gray-100 max-h-[450px] overflow-y-auto pr-2">
                {courses
                  .filter((c) => c.level === (profile?.currentLevel || 200))
                  .map((course) => {
                    const isAlreadyReg = registeredCourses.some((r) => r.course.id === course.id);
                    return (
                      <div key={course.id} className="py-3.5 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-gray-800">{course.code}</span>
                            <span className="text-xs font-semibold text-gray-900">{course.title}</span>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            {course.creditUnit} Units • {course.status} Course
                          </p>
                        </div>

                        {isAlreadyReg ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                            Registered
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRegisterCourse(course.id)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
                          >
                            + Register
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT COURSE MODAL */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </h3>
              <button onClick={() => setShowAddCourseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSC 301"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Credit Units</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={courseForm.creditUnit}
                    onChange={(e) => setCourseForm({ ...courseForm, creditUnit: parseInt(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: parseInt(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={100}>100 L</option>
                    <option value={200}>200 L</option>
                    <option value={300}>300 L</option>
                    <option value={400}>400 L</option>
                    <option value={500}>500 L</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Semester</label>
                  <select
                    value={courseForm.semester}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        semester: e.target.value as "First" | "Second" | "Summer"
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="First">First</option>
                    <option value="Second">Second</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={courseForm.status}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        status: e.target.value as "Core" | "Elective" | "Required" | "General"
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                    <option value="Required">Required</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Prerequisites (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. CSC 102, MTH 101"
                  value={courseForm.prerequisites}
                  onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Course objectives, topics, and overview..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SESSION MODAL */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-gray-900">Add Academic Session</h3>
              <button onClick={() => setShowAddSessionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Session Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026/2027"
                  value={sessionForm.sessionName}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={sessionForm.startDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={sessionForm.endDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddSessionModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
