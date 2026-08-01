import React, { useState, useEffect } from "react";
import { PersistentAIPanel } from "./PersistentAIPanel";
import { WorkspaceTabsBar, WorkspaceTab } from "./WorkspaceTabsBar";
import { DocumentReaderWorkspace } from "./DocumentReaderWorkspace";
import { ProductivityToolbar } from "./ProductivityToolbar";
import { ToastNotification, ToastMessage } from "./ToastNotification";
import { DocumentItem, UserAccount } from "../../types";

interface MasterUnifiedWorkspaceProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  currentUser: UserAccount | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  renderCenterContent: (currentTab: string) => React.ReactNode;
  onOpenCommandPalette: () => void;
}

export const MasterUnifiedWorkspace: React.FC<MasterUnifiedWorkspaceProps> = ({
  documents,
  selectedDocId,
  setSelectedDocId,
  currentUser,
  activeTab,
  setActiveTab,
  renderCenterContent,
  onOpenCommandPalette,
}) => {
  // Session Recovery State from localStorage
  const [openTabs, setOpenTabs] = useState<WorkspaceTab[]>(() => {
    try {
      const saved = localStorage.getItem("studymate_workspace_open_tabs");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: "tab-dashboard", title: "Workspace Dashboard", type: "home" },
      { id: "tab-intelligence", title: "Academic Intelligence", type: "academic-intelligence" },
      { id: "tab-summaries", title: "AI Summaries", type: "summaries" },
    ];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("studymate_workspace_active_tab_id");
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return "tab-dashboard";
  });

  const [isAIPanelCollapsed, setIsAIPanelCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("studymate_workspace_ai_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [highlightedText, setHighlightedText] = useState<string>("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0] || null;

  // Persist Workspace Session
  useEffect(() => {
    try {
      localStorage.setItem("studymate_workspace_open_tabs", JSON.stringify(openTabs));
      localStorage.setItem("studymate_workspace_active_tab_id", activeTabId);
      localStorage.setItem("studymate_workspace_ai_collapsed", JSON.stringify(isAIPanelCollapsed));
    } catch (e) {
      console.error(e);
    }
  }, [openTabs, activeTabId, isAIPanelCollapsed]);

  // Sync external navigation changes into tab bar
  useEffect(() => {
    const existing = openTabs.find((t) => t.type === activeTab);
    if (!existing) {
      let title = "Study Section";
      if (activeTab === "home") title = "Workspace Dashboard";
      else if (activeTab === "library") title = "Study Library";
      else if (activeTab === "chat") title = "AI Study Chat";
      else if (activeTab === "summaries") title = "AI Summaries";
      else if (activeTab === "flashcards") title = "Flashcards";
      else if (activeTab === "quiz") title = "Practice Quizzes";
      else if (activeTab === "practice-exams") title = "Practice Exams";
      else if (activeTab === "revision") title = "Revision Packs";
      else if (activeTab === "academic-intelligence") title = "Academic Intelligence";
      else if (activeTab === "planner") title = "Study Planner";
      else if (activeTab === "knowledge-base") title = "Knowledge Base";

      const newTab: WorkspaceTab = {
        id: `tab-${activeTab}-${Date.now()}`,
        title,
        type: activeTab,
        docId: selectedDocId || undefined,
      };

      setOpenTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    } else {
      setActiveTabId(existing.id);
    }
  }, [activeTab]);

  const handleShowToast = (
    title: string,
    message?: string,
    type: "success" | "info" | "warning" = "success"
  ) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}`,
      title,
      message,
      type,
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    const target = openTabs.find((t) => t.id === tabId);
    if (target) {
      if (target.docId) setSelectedDocId(target.docId);
      setActiveTab(target.type);
    }
  };

  const handleCloseTab = (tabId: string) => {
    if (openTabs.length <= 1) return;
    const filtered = openTabs.filter((t) => t.id !== tabId);
    setOpenTabs(filtered);

    if (activeTabId === tabId) {
      const fallback = filtered[filtered.length - 1];
      setActiveTabId(fallback.id);
      setActiveTab(fallback.type);
      if (fallback.docId) setSelectedDocId(fallback.docId);
    }
  };

  const handleNavigateTabWithDoc = (targetType: string, docId?: string) => {
    if (docId) setSelectedDocId(docId);
    setActiveTab(targetType);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* PRODUCTIVITY TOOLBAR */}
      <ProductivityToolbar
        documents={documents}
        activeDoc={activeDoc}
        onSelectDoc={(docId, tab = "home") => {
          setSelectedDocId(docId);
          setActiveTab(tab);
        }}
        onNavigateTab={handleNavigateTabWithDoc}
      />

      {/* VS CODE WORKSPACE MULTI-TAB BAR */}
      <WorkspaceTabsBar
        openTabs={openTabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTabClick={onOpenCommandPalette}
      />

      {/* MAIN SPLIT WORKSPACE BODY */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* CENTER MAIN WORKSPACE CANVAS */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 min-w-0 scrollbar-thin">
          {activeTab === "doc-reader" && activeDoc ? (
            <DocumentReaderWorkspace
              document={activeDoc}
              onTextHighlight={(txt) => setHighlightedText(txt)}
              onShowToast={handleShowToast}
              onNavigateTab={handleNavigateTabWithDoc}
            />
          ) : (
            renderCenterContent(activeTab)
          )}
        </div>

        {/* DOCKED RIGHT AI TUTOR & SMART CONTEXT PANEL */}
        <PersistentAIPanel
          isCollapsed={isAIPanelCollapsed}
          onToggleCollapse={() => setIsAIPanelCollapsed((prev) => !prev)}
          activeDoc={activeDoc}
          documents={documents}
          currentUser={currentUser}
          highlightedText={highlightedText}
          activeTabName={activeTab}
          onNavigateTab={handleNavigateTabWithDoc}
          onShowToast={handleShowToast}
        />
      </div>

      {/* TOAST NOTIFICATION OVERLAY */}
      <ToastNotification
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
};
