import React, { useState, useEffect } from "react";
import {
  Building,
  Layers,
  Award,
  Calendar,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Globe,
  Mail,
  MapPin,
  Palette,
  BarChart2,
  ShieldCheck,
  Megaphone
} from "lucide-react";
import {
  AcademicInstitution,
  AcademicFaculty,
  AcademicDepartment,
  AcademicProgramme,
  AcademicSession,
  AcademicSemester,
  InstitutionBranding,
  InstitutionalMetrics
} from "../../types";

export default function InstitutionAdminPortal() {
  const [activeAdminTab, setActiveAdminTab] = useState<"profile" | "faculties" | "departments" | "programmes" | "sessions" | "branding" | "metrics">("profile");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // States
  const [institution, setInstitution] = useState<AcademicInstitution | null>(null);
  const [faculties, setFaculties] = useState<AcademicFaculty[]>([]);
  const [departments, setDepartments] = useState<AcademicDepartment[]>([]);
  const [programmes, setProgrammes] = useState<AcademicProgramme[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [semesters, setSemesters] = useState<AcademicSemester[]>([]);
  const [branding, setBranding] = useState<InstitutionBranding>({
    primaryColor: "#4F46E5",
    secondaryColor: "#0EA5E9",
    tagline: "Empowering Next-Generation Academic Excellence with Intelligent RAG & AI Workspace",
    campusAddress: "100 Academy Avenue, Science & Tech Campus",
    contactEmail: "admin@university.edu",
    websiteUrl: "https://studymate.academy",
    portalAnnouncement: "🎉 Semester Registration is currently open! Ensure all core prerequisites are verified."
  });
  const [metrics, setMetrics] = useState<InstitutionalMetrics | null>(null);

  // Modal / Form States
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ name: "", code: "", deanName: "" });

  const [showAddDept, setShowAddDept] = useState(false);
  const [deptForm, setDeptForm] = useState({ facultyId: "", name: "", code: "", headOfDepartment: "" });

  const [showAddProg, setShowAddProg] = useState(false);
  const [progForm, setProgForm] = useState({ departmentId: "", name: "", code: "", degreeType: "B.Sc." as const, durationYears: 4 });

  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({ sessionName: "", startDate: "", endDate: "", isCurrent: true });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [instRes, facRes, deptRes, progRes, sessRes, semRes, brandRes, metRes] = await Promise.all([
        fetch("/api/v1/academic/institutions").then(r => r.json()),
        fetch("/api/v1/academic/faculties").then(r => r.json()),
        fetch("/api/v1/academic/departments").then(r => r.json()),
        fetch("/api/v1/academic/programmes").then(r => r.json()),
        fetch("/api/v1/academic/sessions").then(r => r.json()),
        fetch("/api/v1/academic/semesters").then(r => r.json()),
        fetch("/api/v1/academic/branding").then(r => r.json()),
        fetch("/api/v1/academic/analytics").then(r => r.json())
      ]);

      if (instRes.success && instRes.data?.length > 0) setInstitution(instRes.data[0]);
      if (facRes.success) setFaculties(facRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (progRes.success) setProgrammes(progRes.data);
      if (sessRes.success) setSessions(sessRes.data);
      if (semRes.success) setSemesters(semRes.data);
      if (brandRes.success) setBranding(brandRes.data);
      if (metRes.success) setMetrics(metRes.data);
    } catch (err: any) {
      console.error("Error fetching institution admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/academic/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branding)
      }).then(r => r.json());

      if (res.success) {
        setStatusMsg({ type: "success", text: "Institutional branding updated successfully!" });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Failed to update branding." });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name || !facultyForm.code) return;
    try {
      const res = await fetch("/api/v1/academic/faculties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...facultyForm, institutionId: institution?.id || "inst_1" })
      }).then(r => r.json());

      if (res.success) {
        setFaculties([...faculties, res.data]);
        setShowAddFaculty(false);
        setFacultyForm({ name: "", code: "", deanName: "" });
        setStatusMsg({ type: "success", text: "Faculty added successfully!" });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Failed to add faculty." });
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code || !deptForm.facultyId) return;
    try {
      const res = await fetch("/api/v1/academic/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deptForm)
      }).then(r => r.json());

      if (res.success) {
        setDepartments([...departments, res.data]);
        setShowAddDept(false);
        setDeptForm({ facultyId: "", name: "", code: "", headOfDepartment: "" });
        setStatusMsg({ type: "success", text: "Department added successfully!" });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Failed to add department." });
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.sessionName || !sessionForm.startDate) return;
    try {
      const res = await fetch("/api/v1/academic/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionForm)
      }).then(r => r.json());

      if (res.success) {
        setSessions([...sessions, res.data]);
        setShowAddSession(false);
        setSessionForm({ sessionName: "", startDate: "", endDate: "", isCurrent: false });
        setStatusMsg({ type: "success", text: "Academic Session created!" });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Failed to create session." });
    }
  };

  return (
    <div className="space-y-6" id="institution-admin-portal">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> Institution Administration Portal
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
              {institution?.name || "Federal University of Technology"}
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl font-medium">
              Manage institution profiles, faculties, departments, academic sessions, branding, and high-level academic metrics.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Faculties</p>
              <p className="text-xl font-black text-indigo-400">{faculties.length}</p>
            </div>
            <div className="px-4 py-2 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Departments</p>
              <p className="text-xl font-black text-emerald-400">{departments.length}</p>
            </div>
            <div className="px-4 py-2 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Students</p>
              <p className="text-xl font-black text-amber-400">{metrics?.totalEnrolledStudents || 1420}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border ${statusMsg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
          {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 pb-1">
        {[
          { id: "profile", label: "Profile & Campus", icon: Building },
          { id: "faculties", label: "Faculties & Schools", icon: Layers },
          { id: "departments", label: "Departments", icon: Award },
          { id: "programmes", label: "Programmes", icon: Users },
          { id: "sessions", label: "Academic Sessions", icon: Calendar },
          { id: "branding", label: "Branding & Portal", icon: Palette },
          { id: "metrics", label: "Institutional Metrics", icon: BarChart2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive ? "bg-indigo-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: PROFILE & CAMPUS */}
      {activeAdminTab === "profile" && (
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Institution Information</h3>
              <p className="text-xs text-gray-500 font-medium">Core metadata and administrative details for this institution.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
              Verified Accreditation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-gray-150 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Institution Name</span>
              <p className="text-base font-black text-gray-900">{institution?.name || "Federal University of Technology"}</p>
              <p className="text-xs text-gray-600">Code: <span className="font-bold">{institution?.code || "FUT"}</span> | Type: <span className="font-bold">{institution?.type || "University"}</span></p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-gray-150 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Campus Location & Contact</span>
              <p className="text-xs font-semibold text-gray-800 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {branding.campusAddress}</p>
              <p className="text-xs font-semibold text-gray-800 flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-indigo-500" /> {branding.contactEmail}</p>
              <p className="text-xs font-semibold text-gray-800 flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-indigo-500" /> {branding.websiteUrl}</p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: FACULTIES */}
      {activeAdminTab === "faculties" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Faculties & Schools ({faculties.length})</h3>
            <button
              onClick={() => setShowAddFaculty(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Faculty
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faculties.map((fac) => (
              <div key={fac.id} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3 hover:border-indigo-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                    {fac.code}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Faculty</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900">{fac.name}</h4>
                <p className="text-xs text-gray-500">Dean: <span className="font-semibold text-gray-800">{fac.deanName || "Unassigned"}</span></p>
              </div>
            ))}
          </div>

          {/* Modal */}
          {showAddFaculty && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 border border-gray-200 shadow-xl">
                <h4 className="text-base font-bold text-gray-900">Add New Faculty</h4>
                <form onSubmit={handleAddFaculty} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-gray-700 mb-1">Faculty Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Faculty of Engineering & Technology"
                      value={facultyForm.name}
                      onChange={e => setFacultyForm({ ...facultyForm, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FET"
                      value={facultyForm.code}
                      onChange={e => setFacultyForm({ ...facultyForm, code: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Dean Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Prof. Nikola Tesla"
                      value={facultyForm.deanName}
                      onChange={e => setFacultyForm({ ...facultyForm, deanName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setShowAddFaculty(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer">Save Faculty</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: DEPARTMENTS */}
      {activeAdminTab === "departments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Academic Departments ({departments.length})</h3>
            <button
              onClick={() => setShowAddDept(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                    {dept.code}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900">{dept.name}</h4>
                <p className="text-xs text-gray-500">HOD: <span className="font-semibold text-gray-800">{dept.headOfDepartment || "Unassigned"}</span></p>
              </div>
            ))}
          </div>

          {showAddDept && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 border border-gray-200 shadow-xl">
                <h4 className="text-base font-bold text-gray-900">Add New Department</h4>
                <form onSubmit={handleAddDepartment} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-gray-700 mb-1">Faculty</label>
                    <select
                      required
                      value={deptForm.facultyId}
                      onChange={e => setDeptForm({ ...deptForm, facultyId: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Faculty...</option>
                      {faculties.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Department Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Computer Science"
                      value={deptForm.name}
                      onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Department Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CSC"
                      value={deptForm.code}
                      onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Head of Department (HOD)</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Grace Hopper"
                      value={deptForm.headOfDepartment}
                      onChange={e => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setShowAddDept(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer">Save Department</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 4: PROGRAMMES */}
      {activeAdminTab === "programmes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Academic Degree Programmes ({programmes.length})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programmes.map((prog) => (
              <div key={prog.id} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
                    {prog.degreeType}
                  </span>
                  <span className="text-xs text-gray-500 font-bold">{prog.durationYears} Years Duration</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900">{prog.name}</h4>
                <p className="text-xs text-gray-500">Programme Code: <span className="font-semibold text-gray-800">{prog.code}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: ACADEMIC SESSIONS */}
      {activeAdminTab === "sessions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Academic Sessions & Calendars</h3>
            <button
              onClick={() => setShowAddSession(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Session
            </button>
          </div>

          <div className="space-y-3">
            {sessions.map((sess) => (
              <div key={sess.id} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-gray-900">{sess.sessionName}</h4>
                    {sess.isCurrent && (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase">
                        Current Active Session
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Dates: {sess.startDate} to {sess.endDate}</p>
                </div>

                <div className="flex items-center gap-2">
                  {!sess.isCurrent && (
                    <button
                      onClick={async () => {
                        await fetch(`/api/v1/academic/sessions/${sess.id}/activate`, { method: "PATCH" });
                        fetchAdminData();
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Set Active Session
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showAddSession && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 border border-gray-200 shadow-xl">
                <h4 className="text-base font-bold text-gray-900">Create Academic Session</h4>
                <form onSubmit={handleAddSession} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-gray-700 mb-1">Session Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2025/2026"
                      value={sessionForm.sessionName}
                      onChange={e => setSessionForm({ ...sessionForm, sessionName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        value={sessionForm.startDate}
                        onChange={e => setSessionForm({ ...sessionForm, startDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        required
                        value={sessionForm.endDate}
                        onChange={e => setSessionForm({ ...sessionForm, endDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setShowAddSession(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer">Save Session</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 6: BRANDING & PORTAL */}
      {activeAdminTab === "branding" && (
        <form onSubmit={handleSaveBranding} className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900">Institutional Branding & Announcements</h3>
            <p className="text-xs text-gray-500 font-medium">Configure institution colors, taglines, and portal broadcasts.</p>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={branding.tagline}
                onChange={e => setBranding({ ...branding, tagline: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 flex items-center gap-1.5"><Megaphone className="w-3.5 h-3.5 text-amber-500" /> Portal Broadcast Announcement</label>
              <textarea
                rows={2}
                value={branding.portalAnnouncement || ""}
                onChange={e => setBranding({ ...branding, portalAnnouncement: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Campus Address</label>
                <input
                  type="text"
                  value={branding.campusAddress}
                  onChange={e => setBranding({ ...branding, campusAddress: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={branding.contactEmail}
                  onChange={e => setBranding({ ...branding, contactEmail: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Save Branding Settings
            </button>
          </div>
        </form>
      )}

      {/* SUB-VIEW 7: INSTITUTIONAL METRICS */}
      {activeAdminTab === "metrics" && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Students</span>
              <p className="text-2xl font-black text-indigo-600">{metrics.totalEnrolledStudents}</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Lecturers</span>
              <p className="text-2xl font-black text-emerald-600">{metrics.totalActiveLecturers}</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Avg Class Attendance</span>
              <p className="text-2xl font-black text-amber-600">{metrics.averageClassAttendanceRate}%</p>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Assignment Completion</span>
              <p className="text-2xl font-black text-teal-600">{metrics.averageAssignmentCompletionRate}%</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Departmental Academic Performance</h4>
            <div className="space-y-3">
              {metrics.departmentPerformance.map((dept, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-gray-150 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <p className="font-bold text-gray-900">{dept.departmentName} ({dept.departmentCode})</p>
                    <p className="text-gray-500">{dept.studentsCount} Students Enrolled</p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-600 font-black text-base">{dept.avgGpa} CGPA</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Average GPA</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
