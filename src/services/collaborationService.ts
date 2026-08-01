import {
  StudyGroup,
  GroupChatMessage,
  SharedDocument,
  GroupCollaborativeNote,
  GroupFlashcardDeck,
  GroupQuiz,
  GroupStudySession,
  GroupActivityItem,
  GroupInvitation,
  GroupJoinRequest,
  SharedAnnotation,
  DocumentVersion,
  NoteComment,
  FlashcardEditSuggestion,
  UserAccount
} from "../types";

const GROUPS_STORAGE_KEY = "studymate_groups_v2";
const CHAT_MESSAGES_KEY = "studymate_group_chats_v2";
const SHARED_DOCS_KEY = "studymate_shared_docs_v2";
const GROUP_NOTES_KEY = "studymate_group_notes_v2";
const GROUP_DECKS_KEY = "studymate_group_decks_v2";
const GROUP_QUIZZES_KEY = "studymate_group_quizzes_v2";
const GROUP_SESSIONS_KEY = "studymate_group_sessions_v2";
const GROUP_INVITES_KEY = "studymate_group_invites_v2";

// Repository Layer for Real-Time Collaboration State Management
export class CollaborationRepository {
  // Load groups
  static getGroups(): StudyGroup[] {
    try {
      const data = localStorage.getItem(GROUPS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error("Error reading groups:", err);
    }
    // Initial Seed Data
    const seedGroups: StudyGroup[] = [
      {
        id: "group-med-1",
        name: "USMLE Step 1 - Anatomy & Renal Pathology",
        description: "Active recall study group for high-yield renal pathophysiology and cranial nerves anatomy. Daily quizzes and shared notes.",
        subject: "Medicine",
        avatarEmoji: "🩺",
        visibility: "public",
        creatorUsername: "admin",
        ownerUsername: "admin",
        moderatorUsernames: ["admin", "medical_pro"],
        memberUsernames: ["admin", "runoguy", "medical_pro", "sarah_j"],
        memberRoles: {
          admin: "owner",
          medical_pro: "moderator",
          runoguy: "member",
          sarah_j: "member"
        },
        sharedDocumentIds: ["shared-doc-1"],
        discussionsCount: 4,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
        activityFeed: [
          {
            id: "act-1",
            groupId: "group-med-1",
            actorUsername: "admin",
            actorDisplayName: "Dr. Admin",
            type: "doc_uploaded",
            text: "Uploaded 'Renal Pathophysiology & Nephrons Summary (v2)' to shared library",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
          },
          {
            id: "act-2",
            groupId: "group-med-1",
            actorUsername: "medical_pro",
            actorDisplayName: "Alex M.D.",
            type: "session_scheduled",
            text: "Scheduled live study session 'Glomerular Filtration Rate Review'",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
          }
        ]
      },
      {
        id: "group-cs-1",
        name: "Distributed Systems & Raft Consensus",
        description: "Exploring consensus protocols (Raft, Paxos, Multi-Paxos), vector clocks, and high-performance backend architectures.",
        subject: "Computer Science",
        avatarEmoji: "💻",
        visibility: "public",
        creatorUsername: "runoguy",
        ownerUsername: "runoguy",
        moderatorUsernames: ["runoguy"],
        memberUsernames: ["runoguy", "coder_sam", "tech_lead"],
        memberRoles: {
          runoguy: "owner",
          coder_sam: "member",
          tech_lead: "member"
        },
        sharedDocumentIds: ["shared-doc-2"],
        discussionsCount: 2,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        activityFeed: [
          {
            id: "act-3",
            groupId: "group-cs-1",
            actorUsername: "runoguy",
            actorDisplayName: "Runo Guy",
            type: "note_created",
            text: "Created collaborative note 'Raft Leader Election & Term Rules'",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
          }
        ]
      },
      {
        id: "group-chem-1",
        name: "Organic Chemistry Reaction Mechanisms",
        description: "Mastering SN1 vs SN2, E1 vs E2 eliminations, electrophilic aromatic substitution, and NMR spectroscopy interpretation.",
        subject: "Chemistry",
        avatarEmoji: "🧪",
        visibility: "private",
        creatorUsername: "sarah_j",
        ownerUsername: "sarah_j",
        moderatorUsernames: ["sarah_j"],
        memberUsernames: ["sarah_j", "runoguy"],
        memberRoles: {
          sarah_j: "owner",
          runoguy: "member"
        },
        sharedDocumentIds: [],
        discussionsCount: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        activityFeed: []
      }
    ];

    this.saveGroups(seedGroups);
    return seedGroups;
  }

  static saveGroups(groups: StudyGroup[]): void {
    try {
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
    } catch (err) {
      console.error("Error saving groups:", err);
    }
  }

  // Load chat messages by groupId
  static getChatMessages(groupId: string): GroupChatMessage[] {
    try {
      const data = localStorage.getItem(`${CHAT_MESSAGES_KEY}_${groupId}`);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error("Error reading chat messages:", err);
    }

    // Default Seed Chat for medical group
    if (groupId === "group-med-1") {
      const seedMessages: GroupChatMessage[] = [
        {
          id: "msg-1",
          groupId: "group-med-1",
          senderUsername: "admin",
          senderDisplayName: "Dr. Admin",
          senderAvatarEmoji: "🩺",
          text: "Welcome everyone! Please check out our uploaded Renal Pathophysiology summary in the Shared Documents tab before tonight's live study session.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          isPinned: true,
          reactions: [{ emoji: "👍", usernames: ["runoguy", "medical_pro"] }]
        },
        {
          id: "msg-2",
          groupId: "group-med-1",
          senderUsername: "medical_pro",
          senderDisplayName: "Alex M.D.",
          senderAvatarEmoji: "👨‍⚕️",
          text: "Thanks! What is the primary differentiator between Nephrotic and Nephritic syndromes on urinalysis?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
        },
        {
          id: "msg-3",
          groupId: "group-med-1",
          senderUsername: "runoguy",
          senderDisplayName: "Runo Guy",
          senderAvatarEmoji: "🚀",
          text: "Nephrotic presents with severe proteinuria (>3.5g/day), hypoalbuminemia, and edema, while Nephritic presents with hematuria (RBC casts) and hypertension!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          replyToId: "msg-2",
          replyToText: "What is the primary differentiator between Nephrotic and Nephritic syndromes on urinalysis?",
          replyToSender: "Alex M.D.",
          reactions: [{ emoji: "👏", usernames: ["admin", "medical_pro"] }]
        }
      ];
      this.saveChatMessages(groupId, seedMessages);
      return seedMessages;
    }

    return [];
  }

  static saveChatMessages(groupId: string, messages: GroupChatMessage[]): void {
    try {
      localStorage.setItem(`${CHAT_MESSAGES_KEY}_${groupId}`, JSON.stringify(messages));
    } catch (err) {
      console.error("Error saving chat messages:", err);
    }
  }

  // Collaborative Notes
  static getGroupNotes(groupId: string): GroupCollaborativeNote[] {
    try {
      const data = localStorage.getItem(`${GROUP_NOTES_KEY}_${groupId}`);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error("Error reading notes:", err);
    }

    if (groupId === "group-med-1") {
      const seedNotes: GroupCollaborativeNote[] = [
        {
          id: "note-1",
          groupId: "group-med-1",
          title: "High-Yield Cranial Nerves Exit Foramina & Clinical Palsies",
          content: "# Cranial Nerves Master Outline\n\n- **CN I (Olfactory)**: Cribriform plate\n- **CN II (Optic)**: Optic canal\n- **CN III, IV, V1, VI**: Superior orbital fissure\n- **V2**: Foramen rotundum\n- **V3**: Foramen ovale\n\n### Clinical Correlates\n- **CN III Palsy**: Eye down and out, ptosis, dilated pupil.\n- **CN VII Palsy (Bell's Palsy)**: Ipsilateral facial weakness involving forehead.",
          creatorUsername: "admin",
          lastEditedByUsername: "runoguy",
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          isPinned: true,
          checklists: [
            { id: "chk-1", text: "Memorize CN I - VI exits", completed: true },
            { id: "chk-2", text: "Memorize CN VII - XII exits", completed: false },
            { id: "chk-3", text: "Review Horner's Syndrome vs CN III lesion", completed: false }
          ],
          codeBlocks: [],
          equations: [
            { id: "eq-1", latex: "GFR = \\frac{U_{Inulin} \\times V}{P_{Inulin}}", explanation: "Glomerular Filtration Rate calculation using Inulin clearance." }
          ],
          comments: [
            {
              id: "comm-1",
              authorUsername: "runoguy",
              authorDisplayName: "Runo Guy",
              authorAvatarEmoji: "🚀",
              text: "Great summary! Added the GFR equation block below.",
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
              resolved: false
            }
          ],
          mentions: ["@admin", "@medical_pro"]
        }
      ];
      this.saveGroupNotes(groupId, seedNotes);
      return seedNotes;
    }

    return [];
  }

  static saveGroupNotes(groupId: string, notes: GroupCollaborativeNote[]): void {
    try {
      localStorage.setItem(`${GROUP_NOTES_KEY}_${groupId}`, JSON.stringify(notes));
    } catch (err) {
      console.error("Error saving notes:", err);
    }
  }

  // Group Study Sessions
  static getGroupSessions(groupId: string): GroupStudySession[] {
    try {
      const data = localStorage.getItem(`${GROUP_SESSIONS_KEY}_${groupId}`);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error("Error reading sessions:", err);
    }

    if (groupId === "group-med-1") {
      const seedSessions: GroupStudySession[] = [
        {
          id: "session-1",
          groupId: "group-med-1",
          groupName: "USMLE Step 1 - Anatomy & Renal Pathology",
          title: "Glomerular Pathology & Nephrotic Syndromes Deep Dive",
          description: "25-minute Pomodoro study sprint with live review of minimal change disease, FSGS, and membranous nephropathy.",
          scheduledStartTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          durationMinutes: 45,
          status: "scheduled",
          createdByUsername: "admin",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
          attendees: [
            { username: "admin", displayName: "Dr. Admin", avatarEmoji: "🩺", status: "attending" },
            { username: "runoguy", displayName: "Runo Guy", avatarEmoji: "🚀", status: "attending" },
            { username: "medical_pro", displayName: "Alex M.D.", avatarEmoji: "👨‍⚕️", status: "attending" }
          ],
          agenda: [
            { id: "ag-1", itemText: "5-min intro and syllabus check", completed: false },
            { id: "ag-2", itemText: "25-min Pomodoro review of shared notes", completed: false },
            { id: "ag-3", itemText: "10-min active recall group quiz", completed: false },
            { id: "ag-4", itemText: "Generate AI meeting recap", completed: false }
          ],
          pomodoroConfig: {
            workMinutes: 25,
            breakMinutes: 5,
            currentCycle: 1
          }
        }
      ];
      this.saveGroupSessions(groupId, seedSessions);
      return seedSessions;
    }

    return [];
  }

  static saveGroupSessions(groupId: string, sessions: GroupStudySession[]): void {
    try {
      localStorage.setItem(`${GROUP_SESSIONS_KEY}_${groupId}`, JSON.stringify(sessions));
    } catch (err) {
      console.error("Error saving sessions:", err);
    }
  }

  // Decks & Quizzes
  static getGroupDecks(groupId: string): GroupFlashcardDeck[] {
    try {
      const data = localStorage.getItem(`${GROUP_DECKS_KEY}_${groupId}`);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error("Error reading group decks:", err);
    }
    return [];
  }

  static saveGroupDecks(groupId: string, decks: GroupFlashcardDeck[]): void {
    try {
      localStorage.setItem(`${GROUP_DECKS_KEY}_${groupId}`, JSON.stringify(decks));
    } catch (err) {
      console.error("Error saving group decks:", err);
    }
  }

  static getGroupQuizzes(groupId: string): GroupQuiz[] {
    try {
      const data = localStorage.getItem(`${GROUP_QUIZZES_KEY}_${groupId}`);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error("Error reading group quizzes:", err);
    }
    return [];
  }

  static saveGroupQuizzes(groupId: string, quizzes: GroupQuiz[]): void {
    try {
      localStorage.setItem(`${GROUP_QUIZZES_KEY}_${groupId}`, JSON.stringify(quizzes));
    } catch (err) {
      console.error("Error saving group quizzes:", err);
    }
  }

  // Pending Invitations for user
  static getUserInvitations(username: string): GroupInvitation[] {
    try {
      const data = localStorage.getItem(`${GROUP_INVITES_KEY}_${username}`);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error("Error reading invites:", err);
    }
    return [];
  }

  static saveUserInvitations(username: string, invites: GroupInvitation[]): void {
    try {
      localStorage.setItem(`${GROUP_INVITES_KEY}_${username}`, JSON.stringify(invites));
    } catch (err) {
      console.error("Error saving invites:", err);
    }
  }
}
