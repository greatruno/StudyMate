import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  Sparkles,
  Award,
  Clock,
  BookOpen,
  Brain,
  AlertCircle,
  X,
  CheckCheck,
} from "lucide-react";
import { NotificationItem } from "../../types";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  onNavigateTab,
}) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredList = notifications.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "reminder":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "due":
        return <Brain className="w-4 h-4 text-amber-500" />;
      case "result":
        return <Award className="w-4 h-4 text-emerald-500" />;
      case "recommendation":
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case "unlock":
        return <Award className="w-4 h-4 text-purple-500" />;
      case "academic":
        return <BookOpen className="w-4 h-4 text-teal-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPriorityBadge = (priority: NotificationItem["priority"]) => {
    if (priority === "high") {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
          High
        </span>
      );
    }
    if (priority === "medium") {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Medium
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        Normal
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6 bg-slate-950/40 backdrop-blur-xs">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
        >
          {/* HEADER */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Notification Center
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px]">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAllRead}
                title="Mark all as read"
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SEARCH & FILTER BAR */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white border border-transparent focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-[11px] scrollbar-none">
              {[
                { id: "all", label: "All" },
                { id: "due", label: "Due Cards" },
                { id: "reminder", label: "Reminders" },
                { id: "recommendation", label: "AI Suggestions" },
                { id: "result", label: "Quiz Results" },
                { id: "academic", label: "Academic" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap ${
                    filterType === f.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* NOTIFICATIONS LIST */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">No notifications match your filter</p>
                <p className="text-[11px] mt-1">You are all caught up!</p>
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all flex items-start gap-3 relative ${
                    !item.isRead
                      ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        onClick={() => {
                          if (!item.isRead) onMarkRead(item.id);
                          if (item.actionTab) {
                            onNavigateTab(item.actionTab);
                            onClose();
                          }
                        }}
                        className="text-xs font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {item.title}
                      </h4>
                      {getPriorityBadge(item.priority)}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                      <span>{item.timestamp}</span>

                      <div className="flex items-center gap-2">
                        {!item.isRead && (
                          <button
                            onClick={() => onMarkRead(item.id)}
                            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteNotification(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
