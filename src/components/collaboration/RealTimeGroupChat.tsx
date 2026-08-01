import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Smile,
  Pin,
  Search,
  CornerDownRight,
  MoreVertical,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  Download,
  X,
  Trash2,
  Edit2,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { GroupChatMessage, UserAccount, ChatAttachment } from "../../types";

interface RealTimeGroupChatProps {
  groupId: string;
  groupName: string;
  currentUser: UserAccount;
  messages: GroupChatMessage[];
  onSendMessage: (text: string, attachment?: ChatAttachment, replyTo?: GroupChatMessage) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onPinMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newText: string) => void;
}

export const RealTimeGroupChat: React.FC<RealTimeGroupChatProps> = ({
  groupId,
  groupName,
  currentUser,
  messages,
  onSendMessage,
  onAddReaction,
  onPinMessage,
  onDeleteMessage,
  onEditMessage
}) => {
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyingTo, setReplyingTo] = useState<GroupChatMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<ChatAttachment | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pinnedMessages = messages.filter((m) => m.isPinned);
  const filteredMessages = messages.filter((m) =>
    searchQuery.trim() === ""
      ? true
      : m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.senderDisplayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    onSendMessage(inputText.trim(), attachedFile || undefined, replyingTo || undefined);
    setInputText("");
    setAttachedFile(null);
    setReplyingTo(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.includes("pdf")
      ? "pdf"
      : file.type.includes("image")
      ? "image"
      : file.name.endsWith(".docx")
      ? "docx"
      : "text";

    const newAttachment: ChatAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      fileType,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      content: `Uploaded file content for ${file.name}`
    };

    setAttachedFile(newAttachment);
  };

  const handleSaveEdit = (msgId: string) => {
    if (editText.trim()) {
      onEditMessage(msgId, editText.trim());
    }
    setEditingMessageId(null);
  };

  const EMOJIS = ["👍", "❤️", "💡", "🔥", "👏", "🎓"];

  return (
    <div className="flex flex-col h-[680px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      
      {/* Top Header & Search Bar */}
      <div className="bg-slate-50 dark:bg-slate-800/80 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            💬
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">{groupName} Chat</h3>
            <span className="text-[10px] text-slate-500">{messages.length} messages</span>
          </div>
        </div>

        {/* Search Chat Messages */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div className="bg-indigo-50/80 dark:bg-indigo-950/40 px-5 py-2 border-b border-indigo-150 dark:border-indigo-900/40 flex items-center justify-between text-xs font-medium text-indigo-900 dark:text-indigo-200 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-bold text-[11px] shrink-0">Pinned:</span>
            <span className="truncate text-slate-700 dark:text-slate-300">
              "{pinnedMessages[pinnedMessages.length - 1].text}"
            </span>
          </div>
        </div>
      )}

      {/* Message Feed Container */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No messages found. Start the conversation!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderUsername === currentUser.username;
            const isEditing = editingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl group ${isMe ? "ml-auto flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm shrink-0">
                  {msg.senderAvatarEmoji || "🎓"}
                </div>

                {/* Message Bubble Container */}
                <div className={`space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                  
                  {/* Sender Header */}
                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isMe ? "justify-end" : ""}`}>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{msg.senderDisplayName}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  {/* Reply Quote Banner */}
                  {msg.replyToText && (
                    <div className="bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl text-xs border-l-2 border-indigo-500 text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-bold text-[10px] block text-indigo-600">
                        Replying to @{msg.replyToSender}:
                      </span>
                      <p className="line-clamp-1 italic">{msg.replyToText}</p>
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed relative space-y-2 ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60"
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 bg-white text-slate-900 rounded-lg text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="px-2 py-1 bg-emerald-500 text-white font-bold rounded text-[10px]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="px-2 py-1 bg-slate-400 text-white font-bold rounded text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* File Attachment */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {msg.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="p-2 bg-black/10 dark:bg-white/10 rounded-xl flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-4 h-4 shrink-0" />
                                  <span className="font-bold truncate text-[11px]">{att.name}</span>
                                </div>
                                <span className="text-[10px] opacity-75">{att.size}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* Reactions Pill Display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {msg.reactions.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => onAddReaction(msg.id, r.emoji)}
                            className="px-1.5 py-0.5 bg-white/20 dark:bg-slate-900/60 rounded-full text-[10px] font-bold flex items-center gap-1 border border-white/20"
                          >
                            <span>{r.emoji}</span>
                            <span>{r.usernames.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Toolbar on Hover */}
                  <div className={`flex items-center gap-1 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "justify-end" : ""}`}>
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => onAddReaction(msg.id, emoji)}
                        className="hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}

                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="hover:text-indigo-600 font-bold ml-1"
                      title="Reply"
                    >
                      <CornerDownRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onPinMessage(msg.id)}
                      className="hover:text-indigo-600 font-bold"
                      title="Pin Message"
                    >
                      <Pin className="w-3 h-3" />
                    </button>

                    {isMe && (
                      <>
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditText(msg.text);
                          }}
                          className="hover:text-indigo-600"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onDeleteMessage(msg.id)}
                          className="hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Banner */}
      {replyingTo && (
        <div className="bg-slate-100 dark:bg-slate-800 px-5 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-bold text-indigo-600">Replying to @{replyingTo.senderDisplayName}:</span>
            <span className="truncate text-slate-600 dark:text-slate-400">"{replyingTo.text}"</span>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attached File Preview */}
      {attachedFile && (
        <div className="bg-indigo-50 dark:bg-indigo-950/60 px-5 py-2 border-t border-indigo-150 dark:border-indigo-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-indigo-900 dark:text-indigo-200">{attachedFile.name}</span>
            <span className="text-[10px] text-slate-500">({attachedFile.size})</span>
          </div>
          <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Control Box */}
      <form onSubmit={handleSend} className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0">
        <label className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer text-slate-500">
          <Paperclip className="w-4 h-4" />
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>

        <input
          type="text"
          placeholder="Type a message or share study insights..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
        />

        <button
          type="submit"
          disabled={!inputText.trim() && !attachedFile}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-2xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
