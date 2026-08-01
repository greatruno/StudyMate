import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Upload,
  Calendar,
  Clock,
  Radio,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Video,
  FileSpreadsheet,
  Megaphone,
  UserCheck
} from "lucide-react";
import { AcademicCourse, LecturerCourseMaterial } from "../../types";

export default function LecturerPortal() {
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>("CSC 101");
  const [materials, setMaterials] = useState<LecturerCourseMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Material Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: "",
    type: "lecture_notes" as const,
    description: "",
    url: ""
  });

  // Broadcast Announcement State
  const [announcementText, setAnnouncementText] = useState("");
  const [announcements, setAnnouncements] = useState<Array<{ id: string; date: string; text: string }>>([
    {
      id: "ann_1",
      date: new Date().toISOString().split("T")[0],
      text: "📢 Reminder: Mid-Semester exam preparation notes for CPU Architecture have been uploaded. Review Von Neumann bottlenecks."
    }
  ]);

  useEffect(() => {
    fetchCoursesAndMaterials();
  }, [selectedCourseCode]);

  const fetchCoursesAndMaterials = async () => {
    setLoading(true);
    try {
      const [crsRes, matRes] = await Promise.all([
        fetch("/api/v1/academic/courses").then(r => r.json()),
        fetch(`/api/v1/academic/lecturer-materials?courseCode=${encodeURIComponent(selectedCourseCode)}`).then(r => r.json())
      ]);

      if (crsRes.success) setCourses(crsRes.data);
      if (matRes.success) setMaterials(matRes.data);
    } catch (err: any) {
      console.error("Error fetching lecturer portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.title) return;
    setLoading(true);
    try {
      const selectedCourse = courses.find(c => c.code === selectedCourseCode);
      const res = await fetch("/api/v1/academic/lecturer-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse?.id || "crs_101",
          courseCode: selectedCourseCode,
          uploadedByUsername: "dr_grace_hopper",
          ...materialForm
        })
      }).then(r => r.json());

      if (res.success) {
        setMaterials([res.data, ...materials]);
        setShowUploadModal(false);
        setMaterialForm({ title: "", type: "lecture_notes", description: "", url: "" });
        setStatusMsg({ type: "success", text: "Course material uploaded successfully!" });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Failed to upload material." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/academic/lecturer-materials/${id}`, { method: "DELETE" }).then(r => r.json());
      if (res.success) {
        setMaterials(materials.filter(m => m.id !== id));
        setStatusMsg({ type: "success", text: "Material removed." });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Failed to delete material." });
    }
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    const newAnn = {
      id: `ann_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      text: announcementText.trim()
    };
    setAnnouncements([newAnn, ...announcements]);
    setAnnouncementText("");
    setStatusMsg({ type: "success", text: "Class broadcast announcement published!" });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="space-y-6" id="lecturer-portal">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 lg:p-8 text-white border border-indigo-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-widest">
              <UserCheck className="w-3.5 h-3.5" /> Lecturer & Teaching Assistant Portal
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
              Course Management & Resource Hub
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl font-medium">
              Upload course notes, slides, syllabi, audio/video links, publish announcements, and manage student learning materials.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-indigo-950/80 p-3 rounded-2xl border border-indigo-800/80">
            <span className="text-xs font-bold text-indigo-200">Active Course:</span>
            <select
              value={selectedCourseCode}
              onChange={e => setSelectedCourseCode(e.target.value)}
              className="bg-indigo-900 text-white font-bold text-xs p-2 rounded-xl border border-indigo-700 focus:outline-none"
            >
              {courses.map(c => (
                <option key={c.id} value={c.code}>{c.code} — {c.title}</option>
              ))}
              {courses.length === 0 && <option value="CSC 101">CSC 101 — Intro to Computer Science</option>}
            </select>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border ${statusMsg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
          {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Course Materials List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" /> Course Materials for {selectedCourseCode} ({materials.length})
            </h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Upload Material
            </button>
          </div>

          <div className="space-y-3">
            {materials.map((mat) => (
              <div key={mat.id} className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-200 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-100 uppercase">
                      {mat.type.replace("_", " ")}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{mat.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">{mat.description}</p>
                  <p className="text-[10px] text-gray-400 font-bold">Uploaded on {new Date(mat.uploadedAt).toLocaleDateString()} by {mat.uploadedByUsername}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteMaterial(mat.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {materials.length === 0 && (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                <FileText className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-600">No materials uploaded for {selectedCourseCode} yet.</p>
                <p className="text-[11px] text-gray-400">Click 'Upload Material' to post notes, slides, or syllabus.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Class Broadcast & Schedule */}
        <div className="space-y-6">
          {/* Class Broadcast */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" /> Broadcast Class Announcement
            </h4>

            <form onSubmit={handleSendAnnouncement} className="space-y-3 text-xs font-semibold">
              <textarea
                rows={3}
                required
                placeholder="Type an urgent announcement or assignment note for enrolled students..."
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Publish Broadcast
              </button>
            </form>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-[10px] font-bold uppercase text-gray-400">Recent Class Announcements</span>
              {announcements.map(ann => (
                <div key={ann.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900 space-y-1">
                  <p className="font-medium">{ann.text}</p>
                  <p className="text-[10px] text-amber-600 font-bold">{ann.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Office Hours & Schedule */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Office Hours & Lecture Schedule
            </h4>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-gray-150 text-xs font-semibold space-y-2">
              <div className="flex justify-between items-center text-gray-800">
                <span>Tuesdays & Thursdays</span>
                <span className="text-indigo-600 font-bold">10:00 AM - 12:00 PM</span>
              </div>
              <p className="text-[11px] text-gray-500">Location: Faculty Building Block C, Office 304 / Virtual Room</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 border border-gray-200 shadow-xl">
            <h4 className="text-base font-bold text-gray-900">Upload Course Material ({selectedCourseCode})</h4>
            <form onSubmit={handleUploadMaterial} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture Notes 02: Stack & Queue Applications"
                  value={materialForm.title}
                  onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Material Type</label>
                <select
                  value={materialForm.type}
                  onChange={e => setMaterialForm({ ...materialForm, type: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="lecture_notes">Lecture Notes</option>
                  <option value="slides">Presentation Slides</option>
                  <option value="syllabus">Course Syllabus</option>
                  <option value="audio_video">Audio / Video Lecture Link</option>
                  <option value="assignment">Assignment / Practice Prompt</option>
                  <option value="question_bank">Question Bank Reference</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Key concepts covered or preparation requirements..."
                  value={materialForm.description}
                  onChange={e => setMaterialForm({ ...materialForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Resource URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or https://youtube.com/..."
                  value={materialForm.url}
                  onChange={e => setMaterialForm({ ...materialForm, url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer">Upload Material</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
