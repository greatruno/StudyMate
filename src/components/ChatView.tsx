import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  BookOpen,
  Info,
  GraduationCap,
  Lightbulb,
  Award,
  Sliders
} from "lucide-react";
import { DocumentItem, ChatMessage, UserAccount } from "../types";

interface ChatViewProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  chatHistories: Record<string, ChatMessage[]>;
  setChatHistories: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
  currentUser: UserAccount | null;
}

const STARTER_PROMPTS = [
  "Explain the absolute hardest concept in this paper.",
  "Give me an intuitive, real-world analogy for these notes.",
  "Summarize this like I am 12 years old.",
  "Create a quick mnemonic or memory hook for the key terms."
];

export default function ChatView({
  documents,
  selectedDocId,
  setSelectedDocId,
  chatHistories,
  setChatHistories,
  currentUser
}: ChatViewProps) {
  const activeDoc = documents.find((doc) => doc.id === selectedDocId) || null;
  
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tutorMode, setTutorMode] = useState<"explain" | "deep" | "exam">("explain");
  const [studentLevel, setStudentLevel] = useState<"beginner" | "intermediate" | "advanced" | "elite">("intermediate");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Retrieve or initialize conversation history for the selected document
  const messages = (selectedDocId && chatHistories) ? chatHistories[selectedDocId] || [
    {
      id: "welcome-system",
      role: "model",
      text: `Hello! I'm StudyMate. I've thoroughly analyzed your notes on "${activeDoc?.title}". What would you like to explore first? I can explain formulas, clarify complex theories, or suggest memory tips!`,
      timestamp: new Date().toISOString()
    }
  ] : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !selectedDocId || !activeDoc || isLoading) return;

    const userMessageCount = messages.filter(m => m.role === "user").length;
    if (currentUser?.subscription === "free" && userMessageCount >= 5) {
      alert("⚠️ Free Tier AI Study Limit Reached (Max 5 AI queries per document). Please upgrade to a Premium Plan to enjoy unlimited high-fidelity chats, complete Voice Briefings, and custom specialized academic assistance!");
      return;
    }

    const userMessage: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      text: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    // Update local state with user's message immediately
    const updatedMessages = [...messages, userMessage];
    setChatHistories(prev => ({
      ...prev,
      [selectedDocId]: updatedMessages
    }));
    setInputText("");
    setIsLoading(true);

    try {
      // Package conversation payload (Gemini expects {role, text})
      const payloadMessages = updatedMessages.map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const response = await fetch("/api/generate/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocId,
          content: activeDoc.content,
          messages: payloadMessages,
          username: currentUser?.username || "global",
          tutorMode,
          studentLevel
        })
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to get AI response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (!reader) {
        throw new Error("No response body available for streaming.");
      }

      const aiMessageId = "msg_ai_" + Date.now();
      const initialAiMessage: ChatMessage = {
        id: aiMessageId,
        role: "model",
        text: "",
        timestamp: new Date().toISOString()
      };

      // Add the empty message to the history
      setChatHistories(prev => ({
        ...prev,
        [selectedDocId]: [...updatedMessages, initialAiMessage]
      }));

      let accumulatedText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setChatHistories(prev => {
          const history = prev[selectedDocId] || [];
          return {
            ...prev,
            [selectedDocId]: history.map(msg => 
              msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
            )
          };
        });
      }

    } catch (error: any) {
      console.error(error);
      const errorMessage = `⚠️ StudyMate could not complete this response. Error: ${error.message || "Unknown error"}. Please check your GEMINI_API_KEY environment variable.`;
      
      setChatHistories(prev => {
        const history = prev[selectedDocId] || [];
        const activeMsgIdx = history.findLastIndex(msg => msg.role === "model");
        
        if (activeMsgIdx !== -1 && history[activeMsgIdx].text === "") {
          // If the placeholder is completely empty, replace it with the error message
          return {
            ...prev,
            [selectedDocId]: history.map((msg, idx) => 
              idx === activeMsgIdx ? { ...msg, text: errorMessage } : msg
            )
          };
        } else if (activeMsgIdx !== -1) {
          // If we had some text streamed, append error annotation to the end
          return {
            ...prev,
            [selectedDocId]: history.map((msg, idx) => 
              idx === activeMsgIdx ? { ...msg, text: msg.text + `\n\n[Stream Interrupted: ${errorMessage}]` } : msg
            )
          };
        } else {
          // Fallback if no placeholder was added yet
          const errorMsgObj: ChatMessage = {
            id: "msg_error_" + Date.now(),
            role: "model",
            text: errorMessage,
            timestamp: new Date().toISOString()
          };
          return {
            ...prev,
            [selectedDocId]: [...updatedMessages, errorMsgObj]
          };
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  // 1. Empty documents state
  if (documents.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6 bg-white border border-gray-200 rounded-3xl shadow-sm animate-fade-in" id="chat-empty-docs">
        <MessageSquare className="h-14 w-14 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">No Study Documents Found</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          We need context to trigger smart tutoring. Please head over to the Upload section and compile some study materials first!
        </p>
      </div>
    );
  }

  // 2. No active document chosen state
  if (!activeDoc) {
    return (
      <div className="max-w-3xl mx-auto p-6 lg:p-8 space-y-6 animate-fade-in" id="chat-select-doc">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">AI Study Chatbot</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 block">
            Select a document below to start an interactive learning dialogue with StudyMate
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className="p-5 bg-white hover:bg-slate-50 border border-gray-200 hover:border-indigo-500/50 rounded-2xl text-left transition-all flex flex-col justify-between group h-44"
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                  Ready to Chat
                </span>
                <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {doc.title}
                </p>
              </div>
              <div className="flex items-center justify-between w-full border-t border-gray-100 pt-3 text-[11px] text-gray-400 font-semibold">
                <span>{doc.wordCount} Words</span>
                <span className="text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Chatbot <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-0 sm:p-4 lg:p-6 h-full flex flex-col" id="chat-view">
      
      {/* Target Doc Header Bar */}
      <div className="bg-white px-5 py-4 border-b sm:border border-gray-200 rounded-none sm:rounded-t-3xl flex items-center justify-between shadow-3xs shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {activeDoc.title}
            </h3>
            <p className="text-[11px] text-gray-400 font-medium">
              Conversing with StudyMate • {activeDoc.wordCount} words analyzed
            </p>
          </div>
        </div>
        
        {/* Switch Topic button */}
        <button
          onClick={() => setSelectedDocId(null)}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-bold tracking-tight shrink-0 px-3 py-1.5 bg-[#F8F9FF] rounded-lg transition-all"
        >
          Change Topic
        </button>
      </div>

      {/* Tutoring Configuration Ribbon */}
      <div className="bg-[#F8F9FF] border-x-0 sm:border-x border-b border-gray-200 px-5 py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-4 w-full justify-between">
          
          {/* Tutor Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 select-none">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              Tutor Mode:
            </span>
            <div className="flex gap-1 bg-white border border-gray-150 p-0.5 rounded-lg shadow-3xs">
              <button
                onClick={() => setTutorMode("explain")}
                className={`text-[9px] font-black px-2 py-1 rounded-md transition-all uppercase tracking-wider ${
                  tutorMode === "explain" 
                    ? "bg-indigo-600 text-white" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Explain Mode: Simplifies concepts with real-world analogies"
              >
                Explain
              </button>
              <button
                onClick={() => setTutorMode("deep")}
                className={`text-[9px] font-black px-2 py-1 rounded-md transition-all uppercase tracking-wider ${
                  tutorMode === "deep" 
                    ? "bg-indigo-600 text-white" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Deep Study: In-depth mechanisms & challenging dialogue"
              >
                Deep Study
              </button>
              <button
                onClick={() => setTutorMode("exam")}
                className={`text-[9px] font-black px-2 py-1 rounded-md transition-all uppercase tracking-wider ${
                  tutorMode === "exam" 
                    ? "bg-indigo-600 text-white" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Exam Prep: Core testable facts, drills & strategy"
              >
                Exam Prep
              </button>
            </div>
          </div>

          {/* Student Level Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 select-none">
              <GraduationCap className="h-3 w-3 text-indigo-500" />
              Student level:
            </span>
            <select
              value={studentLevel}
              onChange={(e) => setStudentLevel(e.target.value as any)}
              className="text-[9px] font-black text-gray-700 uppercase tracking-wider bg-white border border-gray-150 rounded-lg px-2.5 py-1 outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="elite">Elite/Expert</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Messages Screen */}
      <div className="flex-1 bg-white border-x-0 sm:border-x border-gray-200 p-4 sm:p-6 overflow-y-auto space-y-5 flex flex-col">
        
        {/* Instructions Banner */}
        <div className="p-3 bg-[#F8F9FF] border border-indigo-100/60 rounded-2xl flex items-start gap-2.5 text-[11px] text-indigo-950 leading-relaxed">
          <Info className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
          <p>
            StudyMate answers questions using your lecture text as the <strong>primary source of truth</strong>. Ask us to compare terms, list key formulas, or explain complex ideas!
          </p>
        </div>

        {/* Conversation Logs */}
        <div className="space-y-4 flex-1">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar Icon */}
                <div className={`h-8.5 w-8.5 rounded-full flex items-center justify-center shrink-0 font-bold text-xs select-none ${
                  isUser 
                    ? "bg-slate-900 text-slate-100" 
                    : "bg-indigo-600 text-white shadow-xs"
                }`}>
                  {isUser ? "S" : "AI"}
                </div>
                
                {/* Bubble */}
                <div className={`p-4 rounded-2xl leading-relaxed text-sm ${
                  isUser 
                    ? "bg-slate-900 text-slate-100 rounded-tr-none" 
                    : "bg-indigo-50/70 border border-indigo-100/50 text-indigo-950 rounded-tl-none font-medium"
                }`}>
                  <p className="whitespace-pre-line text-xs md:text-sm">
                    {msg.text}
                  </p>
                  <span className={`text-[9px] block mt-1.5 text-right font-semibold ${isUser ? "text-slate-400" : "text-indigo-400"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* AI Generating Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 max-w-[85%] mr-auto">
              <div className="h-8.5 w-8.5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs animate-bounce">
                AI
              </div>
              <div className="p-4 bg-indigo-50/50 border border-indigo-100/30 text-indigo-900 rounded-2xl rounded-tl-none text-xs font-semibold flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                Thinking and searching notes...
              </div>
            </div>
          )}

          {/* Auto Scroll anchor */}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Suggestion Starter Pills & Input Bar */}
      <div className="bg-white border-t sm:border border-gray-200 border-t-gray-150 p-4 rounded-none sm:rounded-b-3xl space-y-3 shrink-0 shadow-sm">
        
        {/* Suggestion row (only shows if conversation is short) */}
        {messages.length < 4 && !isLoading && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">
              Try asking:
            </span>
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-150 rounded-full text-[11px] text-gray-600 hover:text-indigo-800 transition-all font-medium text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Text Form */}
        <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ask StudyMate anything about your document..."
            className="w-full pl-5 pr-14 py-3.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            id="chat-message-input"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`absolute right-2 px-3.5 py-2 rounded-lg transition-all flex items-center justify-center ${
              inputText.trim() && !isLoading
                ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            id="chat-send-btn"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
