import React, { useState } from "react";
import { 
  FileUp, 
  FileText, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Loader2, 
  BookOpen, 
  AlertCircle 
} from "lucide-react";
import { DocumentItem, UserAccount } from "../types";
import DocumentUploadEngine from "./documents/DocumentUploadEngine";
import PipelineInspector from "./documents/PipelineInspector";

interface UploadViewProps {
  documents: DocumentItem[];
  setDocuments: (docs: DocumentItem[]) => void;
  setSelectedDocId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  addStudyMinutes: (mins: number) => void;
  currentUser: UserAccount | null;
}

const PRESETS = [
  {
    title: "Organic Chemistry: Carbon Structures",
    subject: "Chemistry",
    content: "Organic chemistry is the scientific study of the structure, properties, composition, reactions, and preparation of carbon-containing compounds, which include not only hydrocarbons but also compounds with any number of other elements, including hydrogen, nitrogen, oxygen, halogens, phosphorus, silicon, and sulfur. Carbon is unique because it can form four stable covalent bonds with other carbon atoms or different elements, creating complex chains, rings, and three-dimensional configurations. The simplest organic molecules are alkanes (single bonds, saturated), alkenes (at least one double bond, unsaturated), and alkynes (at least one triple bond). A functional group is a specific group of atoms within a molecule that is responsible for a characteristic chemical reaction of that molecule. Examples include the hydroxyl group (-OH) found in alcohols, carboxyl group (-COOH) in organic acids, and amino group (-NH2) in amines."
  },
  {
    title: "World History: Ancient Rome Rise and Fall",
    subject: "History",
    content: "The history of the Roman Empire covers the history of ancient Rome from the fall of the Roman Republic in 27 BC to the eventual collapse of the Western Roman Empire in 476 AD. Rome transitioned from a republic to an empire under Augustus Caesar following years of civil war. Augustus initiated the Pax Romana, a two-century-long period of relative peace and stability that allowed trade to flourish and culture to spread. Roman engineering achieved marvels such as stone aqueducts, deep paved roads, and concrete monuments like the Colosseum. However, the empire grew too large to manage efficiently from one central city. In 285 AD, Emperor Diocletian partitioned the empire into Western and Eastern administrative halves. The Western Empire suffered from constant barbarian incursions, systemic economic inflation, high tax burdens, and political assassinations, culminating in 476 AD when Odoacer deposed the last western emperor, Romulus Augustulus. The Eastern portion, centered in Constantinople, survived as the Byzantine Empire for another thousand years."
  },
  {
    title: "Physics 102: Electromagnetic Spectrum",
    subject: "Physics",
    content: "The electromagnetic spectrum is the entire distribution of electromagnetic radiation according to frequency or wavelength. Although all electromagnetic waves travel at the speed of light in a vacuum (approximately 300,000 kilometers per second), they have a wide range of frequencies, wavelengths, and photon energies. The spectrum is classified into seven major regions in order of increasing frequency and decreasing wavelength: Radio Waves (used in broadcasting and communications), Microwaves (used in radar and cooking), Infrared Radiation (emitted as thermal energy), Visible Light (the narrow band detectable by the human eye, from red to violet), Ultraviolet Radiation (emitted by the sun, responsible for sunburns), X-Rays (high energy, used in medical imaging), and Gamma Rays (highest frequency, produced by nuclear reactions and cosmic events). Shorter wavelengths carry higher photon energy and can cause cellular damage via ionization."
  }
];

export default function UploadView({
  documents,
  setDocuments,
  setSelectedDocId,
  setActiveTab,
  addStudyMinutes,
  currentUser
}: UploadViewProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  
  // Progress, name, and parsing indicators
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [inspectDocId, setInspectDocId] = useState<string | null>(null);

  const processFile = (file: File) => {
    setErrorMessage("");
    setUploadProgress(0);
    setIsProcessingFile(true);
    setUploadedFileName(file.name);
    setUploadedDocId(null);

    // Max file size: 15MB
    const MAX_SIZE_MB = 15;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File is too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`);
      setIsProcessingFile(false);
      setUploadProgress(null);
      setUploadedFileName("");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedExtensions = ["pdf", "docx", "txt", "md"];
    if (!allowedExtensions.includes(ext)) {
      setErrorMessage("Unsupported file format. Please upload a .pdf, .docx, .txt, or .md file.");
      setIsProcessingFile(false);
      setUploadProgress(null);
      setUploadedFileName("");
      return;
    }

    // Automatically set the document title to the file name (stripped of extension)
    setTitle(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();

    // Track FileReader progress
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 40); // FileReader gets 40% of the bar
        setUploadProgress(percent);
      }
    };

    reader.onload = async (event) => {
      try {
        setUploadProgress(50); // 50% indicates read is complete, starting server/local extraction

        if (!event.target || !event.target.result) {
          throw new Error("Failed to read file.");
        }

        let text = "";

        // Parse server-side for all types to support chunking and local-storage RAG on the backend
        setUploadProgress(65); // Sending to server
        
        // Get base64 string from data URL
        const resultStr = event.target.result as string;
        const base64 = resultStr.split(",")[1];

        const response = await fetch("/api/parse-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            fileName: file.name,
            fileType: file.type,
            username: currentUser?.username || "global"
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          let parsedErr;
          try {
            parsedErr = JSON.parse(errText);
          } catch {
            parsedErr = { error: errText };
          }
          throw new Error(parsedErr.error || "Failed to extract text from file.");
        }

        const data = await response.json();
        text = data.text;
        const docId = data.documentId;
        
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(null), 1200);
        setContent(text);
        setUploadedDocId(docId);
        setIsProcessingFile(false);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "An error occurred while extracting file content.");
        setIsProcessingFile(false);
        setUploadProgress(null);
        setUploadedFileName("");
      }
    };

    reader.onerror = () => {
      setErrorMessage("Error reading file from disk.");
      setIsProcessingFile(false);
      setUploadProgress(null);
      setUploadedFileName("");
    };

    reader.readAsDataURL(file); // Always read as Data URL to easily parse on the server side
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setContent(preset.content);
    setUploadedDocId(null);
    setUploadedFileName("");
    setErrorMessage("");
  };

  const handleAnalyze = async () => {
    if (!title.trim()) {
      setErrorMessage("Please provide a title for your study material.");
      return;
    }
    if (!content.trim() || content.trim().length < 50) {
      setErrorMessage("Please paste or upload at least 50 characters of material to analyze.");
      return;
    }

    // Verify subscription level limits
    if (currentUser?.subscription !== "premium" && documents.length >= 3) {
      setErrorMessage("⚠️ Free Tier Limit: You have reached the limit of 3 study documents. Upgrade to StudyMate Premium in the Admin Panel to compile unlimited notes, unlock synthetic voice briefings, and access teacher classrooms!");
      return;
    }

    setErrorMessage("");
    setIsAnalyzing(true);
    
    try {
      let activeDocId = uploadedDocId;

      // If we don't have a document ID yet (e.g. pasted text, or preset selected, or text edited), register it first!
      if (!activeDocId) {
        setLoadingStep("Extracting and indexing text sections...");
        const parseRes = await fetch("/api/parse-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: content.trim(),
            fileName: title.trim(),
            username: currentUser?.username || "global"
          })
        });
        if (!parseRes.ok) {
          throw new Error(await parseRes.text() || "Failed to index text content.");
        }
        const parseData = await parseRes.json();
        activeDocId = parseData.documentId;
      }

      // Step 1: Summary Generation (pass documentId and restrict content body size to prevent PayloadTooLargeError)
      setLoadingStep("1. Decomposing topics and building Summary structure...");
      const summaryRes = await fetch("/api/generate/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          documentId: activeDocId, 
          content: content.length > 50000 ? "" : content,
          username: currentUser?.username || "global"
        })
      });
      if (!summaryRes.ok) throw new Error(await summaryRes.text() || "Failed to generate summary");
      const summaryData = await summaryRes.json();

      // Step 2: Quiz Generation
      setLoadingStep("2. Drafting conceptual Multiple Choice Quizzes...");
      const quizRes = await fetch("/api/generate/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          documentId: activeDocId, 
          content: content.length > 50000 ? "" : content,
          username: currentUser?.username || "global"
        })
      });
      if (!quizRes.ok) throw new Error("Failed to generate quizzes");
      const quizData = await quizRes.json();

      // Step 3: Flashcards Generation
      setLoadingStep("3. Engineering active-recall flashcard prompts...");
      const flashcardRes = await fetch("/api/generate/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          documentId: activeDocId, 
          content: content.length > 50000 ? "" : content,
          username: currentUser?.username || "global"
        })
      });
      if (!flashcardRes.ok) throw new Error("Failed to generate flashcards");
      const flashcardData = await flashcardRes.json();

      // Create new document item
      const newDoc: DocumentItem = {
        id: activeDocId || "doc_" + Date.now(),
        title: title.trim(),
        content: content.trim(),
        uploadedAt: new Date().toISOString(),
        wordCount: content.trim().split(/\s+/).length,
        summary: summaryData,
        quiz: quizData.questions,
        flashcards: flashcardData.flashcards
      };

      setDocuments([newDoc, ...documents]);
      setSelectedDocId(newDoc.id);
      addStudyMinutes(15); // Add XP study time

      // Success! Reset input fields and move back to main screen or show summary
      setTitle("");
      setContent("");
      setUploadedDocId(null);
      setActiveTab("home");
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Something went wrong during StudyMate document compilation.");
    } finally {
      setIsAnalyzing(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in space-y-8" id="upload-view">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-none">Compile Study Materials</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 block">
            Convert PDFs, text, or lectures into active studies
          </span>
        </div>
      </div>

      {isAnalyzing ? (
        /* Dynamic Loader Panel */
        <div className="bg-slate-900 text-white rounded-3xl p-10 text-center border border-slate-800 shadow-xl space-y-6 py-16 animate-pulse">
          <div className="relative flex justify-center">
            <div className="absolute inset-0 m-auto h-20 w-20 bg-indigo-500/20 rounded-full blur-xl" />
            <Loader2 className="h-14 w-14 text-indigo-400 animate-spin relative z-10" />
          </div>
          
          <div className="space-y-2 max-w-md mx-auto">
            <h4 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              StudyMate is reading...
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              We are utilizing StudyMate to ingest your notes, filter high-yield terms, extract formulas, and generate self-testing resources.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 max-w-lg mx-auto">
            <p className="text-xs text-indigo-300 font-mono text-left select-none">
              <span className="text-slate-500">$</span> {loadingStep}
            </p>
          </div>
        </div>
      ) : (
        /* Normal Form Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Upload and Input Panel (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
              
              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Lecture / Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="e.g. Physics 101: Newton's Laws"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                  id="doc-title-input"
                />
              </div>

              {/* Text Input Block */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Copy-Paste Lecture Text
                  </label>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {content ? content.trim().split(/\s+/).filter(Boolean).length : 0} words
                  </span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setUploadedDocId(null);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="Paste syllabus guidelines, transcriptions, textbook contents, raw lecture notes, or markdown files here..."
                  className="w-full h-64 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-sm leading-relaxed outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 font-sans"
                  id="doc-content-input"
                />
              </div>

              {/* Drag and Drop Zone or Progress indicator */}
              {isProcessingFile ? (
                <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-2xl p-6 text-center transition-all">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold text-indigo-950">Extracting content from your file...</p>
                  <p className="text-[10px] text-indigo-500 mt-1">Reading document format structure & analyzing layout</p>
                  
                  {uploadProgress !== null && (
                    <div className="mt-4 max-w-xs mx-auto">
                      <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600 mb-1">
                        <span>Progress</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-indigo-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : uploadedFileName ? (
                <div className="border-2 border-solid border-emerald-100 bg-emerald-50/30 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-950 truncate">{uploadedFileName}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Text successfully extracted</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFileName("");
                      setContent("");
                    }}
                    className="px-3 py-1.5 bg-white border border-emerald-200 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <DocumentUploadEngine
                  onUploadSuccess={(doc) => {
                    if (doc.filename) setUploadedFileName(doc.filename);
                    if (!title && doc.filename) {
                      setTitle(doc.filename.replace(/\.[^/.]+$/, ""));
                    }
                    if (doc.extractedTextSnippet) {
                      setContent(doc.extractedTextSnippet);
                    }
                    if (doc.id) {
                      setUploadedDocId(doc.id);
                      setInspectDocId(doc.id);
                    }
                  }}
                />
              )}

              {uploadedDocId && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Intelligent Document Pipeline Active</p>
                      <p className="text-[10px] text-slate-500">Transforming document into structured semantic chunks</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectDocId(uploadedDocId)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Inspect Pipeline
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-start gap-3 text-xs font-medium animate-shake">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Compilation Failed</p>
                    <p className="text-red-600 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setContent("");
                    setErrorMessage("");
                  }}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-2"
                >
                  Clear Fields
                </button>
                <button
                  onClick={handleAnalyze}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/10 transition-all"
                  id="compile-ai-btn"
                >
                  <Sparkles className="h-4 w-4" />
                  Analyze with StudyMate
                </button>
              </div>

            </div>
          </div>

          {/* Preset / Sample Data Selection (1 col) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-4">
                Instant Playgrounds
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Don't have your class notes handy? Try loading one of our pre-built high-yield scientific or historical lectures instantly!
              </p>

              <div className="space-y-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full p-3.5 bg-slate-50 hover:bg-indigo-50 border border-gray-150 hover:border-indigo-150 rounded-2xl text-left transition-all flex items-start gap-3 group"
                  >
                    <div className="p-2 bg-white border border-gray-200 rounded-xl text-gray-700 group-hover:text-indigo-600 transition-all shrink-0">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
                        {preset.subject}
                      </span>
                      <p className="text-xs font-bold text-gray-900 leading-tight mt-0.5 truncate max-w-[180px]">
                        {preset.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">
                        Click to pre-fill editor
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl text-white border border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">
                Student Tip: Maximize Accuracy
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                For optimal result generation:
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1.5 mt-2.5 list-disc pl-4">
                <li>Include important dates, formulas, and spelling of proper nouns.</li>
                <li>Write formulas in standard readable characters.</li>
                <li>Avoid uploading unstructured outlines or simple title indexes.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* Phase 2.2 Intelligent Document Processing Pipeline Inspector */}
      {inspectDocId && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <PipelineInspector
            documentId={inspectDocId}
            documentTitle={title || uploadedFileName || "Uploaded Document"}
            onClose={() => setInspectDocId(null)}
          />
        </div>
      )}

    </div>
  );
}
