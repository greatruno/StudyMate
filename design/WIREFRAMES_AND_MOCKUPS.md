# StudyMate Wireframes & Interface Mockups

This document details the interface layout, structural wireframes, and responsive behaviors of the StudyMate application views.

---

## 🖥️ Monolithic Desktop Dashboard Layout

StudyMate uses an elegant high-contrast layout on desktop, split into a persistent Left-Hand Navigation Rail and an expansive Right-Hand Content Area.

```
┌────────────────────────────────────────────────────────────────────────┐
│ STUDYMATE                    [Alex Coder 🎓]  [5 Mins 🔥]  [150 XP ⭐] │
├───────────────┬────────────────────────────────────────────────────────┤
│ 🏠 Home       │ PERSONALIZED WORKSPACE GREETING                        │
│ 📂 Upload     │ "Hello Alex, preparing CS foundations path..."          │
│ 💬 Chat Tutor │                                                        │
│ 📊 Statistics │ ┌───────────────────┐ ┌──────────────────────────────┐ │
│ ⚙️ Settings   │ │ UPLOAD SYLLABUS   │ │ STUDY STARTERS               │ │
│               │ │ Drag PDF/Word     │ │ ┌─────────┐ ┌─────────┐      │ │
│               │ │ [Upload Button]   │ │ │ Topic A │ │ Topic B │      │ │
│               │ │                   │ │ └─────────┘ └─────────┘      │ │
│               │ └───────────────────┘ └──────────────────────────────┘ │
│               │                                                        │
│               │ ┌────────────────────────────────────────────────────┐ │
│               │ │ ACTIVE RECALL WEEKLY PROGRESS                      │ │
│               │ │ Mon [░░░░] Tue [░░░░░░] Wed [░░░] Thu [░░░░░░░░]   │ │
│               │ └────────────────────────────────────────────────────┘ │
└───────────────┴────────────────────────────────────────────────────────┘
```

### Key UI Containers:
1. **Left-Hand Navigation Rail**:
   - Fixed width (`w-64`), dark surface (`bg-slate-900` or `bg-slate-950`).
   - Hosts brand logo, navigation buttons with responsive icons, and active user metrics.
2. **Right-Hand Content Area**:
   - Fluid scrollable container (`flex-1 h-screen overflow-y-auto bg-slate-50`).
   - Standard bento-grid layout to display the personalized workspace greeting, upload box, starter subjects, and weekly progress charts.

---

## 📖 Revision Workspace Wireframe

When a study document is active, the content area transitions into a modular study suite.

```
┌────────────────────────────────────────────────────────────────────────┐
│ DOCUMENT: Intro_To_Algorithms.pdf                  [X Close Document]  │
├────────────────────────────────────────────────────────────────────────┤
│ [ SUMMARY ]         * [ ACTIVE QUIZ ]           [ FLASHCARDS ]         │
├────────────────────────────────────────────────────────────────────────┤
│ Key Concepts:                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 1. BIG O NOTATION                                                  │ │
│ │    - Describes the upper bound of an algorithm's execution time.     │ │
│ │    - Establishes mathematical scalability boundaries.                │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ Grounded Chat Assistant:                                               │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ AI: How can I help you study search complexities?                  │ │
│ │ User: Explain Binary Search vs Linear Search.                      │ │
│ │ [ Type a question to query document...                 ] [Send]    │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Modular Containers:
1. **Workspace Tabs**: Centered at the top, allowing the user to toggle between Summary, Quiz, and Flashcard views.
2. **Study Area**: Dedicated space for displaying the active summary, taking a multiple-choice quiz, or flipping active-recall flashcards.
3. **Grounded Chat Assistant Panel**: A toggleable side panel or footer tray allowing the user to chat with the document tutor without losing focus on their notes.

---

## 📱 Mobile Layout Adaptation (Responsive Wireframe)

On screens under `768px` (Tablets and Phones), the layout collapses into a single-column, touch-optimized experience.

```
┌──────────────────────────┐
│ STUDYMATE 🎓   [5 Mins 🔥]│ <-- Compact Header Bar
├──────────────────────────┤
│                          │
│ PERSONALIZED GREETING    │
│ "Hello Alex..."          │
│                          │
│ ┌──────────────────────┐ │
│ │ UPLOAD SYLLABUS      │ │
│ │ [ Upload Button ]    │ │ <-- Stacked Bento Items
│ └──────────────────────┘ │
│                          │
├──────────────────────────┤
│ [🏠]  [📂]  [💬]  [📊] [⚙️]│ <-- Sticky Bottom Navigation Bar
└──────────────────────────┘
```

### Mobile Layout Changes:
1. **Sticky Bottom Navigation**: Left-hand navigation rail is hidden and replaced with a mobile-optimized sticky bottom bar (`h-16 bg-slate-900 border-t`) with touch targets of at least 44px.
2. **Stacked Bento Elements**: Bento grids stack vertically (`grid-cols-1`) with generous padding (`px-4 py-6`) to prevent touch overlaps and make reading comfortable on small screens.
3. **Compact Top Header**: Display metrics (minutes studied, active streak) are collapsed into a compact top header bar (`h-12`).
