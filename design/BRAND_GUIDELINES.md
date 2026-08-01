# StudyMate Brand Guidelines

This document outlines the visual identity system, design assets, core colors, typography, and logo usage guidelines for StudyMate. This design system ensures consistent brand application across all platforms, marketing portals, and physical/digital touchpoints.

---

## 🎨 Visual Identity & Color System

StudyMate's identity is designed to feel **focused, calm, premium, and sophisticated**. It uses a dark slate backdrop accented by deep, intelligent indigos and vibrant cobalt highlights.

### 1. Primary Palette (Cosmic Indigo Theme)
Our primary palette defines the interface background, surfaces, and active states.

| Name | Hex Value | Purpose | CSS / Tailwind Equivalent |
| :--- | :--- | :--- | :--- |
| **Cosmic Dark** | `#090d16` | Main background & app canvas | `bg-slate-950` / `bg-slate-900` |
| **Surface Dark** | `#0f172a` | Cards, navigation bars, and panels | `bg-slate-900` / `bg-slate-800` |
| **Active Indigo** | `#4f46e5` | Key actions, hover states, selection overlays | `bg-indigo-600` / `text-indigo-600` |
| **Bright Accent** | `#6366f1` | Highlights, badges, successful indicators | `bg-indigo-500` / `text-indigo-500` |

### 2. Supportive Palette (High-Contrast Neutral)
This is used for high readability of text and UI elements.

| Name | Hex Value | Purpose | CSS / Tailwind Equivalent |
| :--- | :--- | :--- | :--- |
| **Text Primary** | `#f8fafc` | Primary titles, text fields, and major headers | `text-slate-50` |
| **Text Secondary**| `#94a3b8` | Subheadings, helper text, and secondary labels | `text-slate-400` |
| **Border Slate** | `#1e293b` | Borders, dividers, subtle containment lines | `border-slate-800` |

---

## ✍️ Typography Pairings

We utilize highly legible sans-serif and mono-spaced fonts that optimize the reading and study experience.

### 1. Sans-serif (Interface & Navigation)
- **Primary Font**: **Inter** (Google Fonts)
- **Usage**: Used for all UI text, body copies, settings forms, button labels, and dashboards.
- **Styling**: `font-sans antialiased text-slate-100 tracking-normal`

### 2. Display Headings (Title & Banners)
- **Primary Font**: **Space Grotesk** or **Outfit**
- **Usage**: Used for main page titles, welcome screens, section headings, and promotional items.
- **Styling**: `font-sans font-black tracking-tight text-white`

### 3. Monospace (Structured Data & Diagnostics)
- **Primary Font**: **JetBrains Mono** or **Fira Code**
- **Usage**: Used for statistics, numbers, progress values, source citations, card counts, and diagnostics logs.
- **Styling**: `font-mono text-xs text-indigo-400 tracking-wider`

---

## 🛡️ Iconography Guidelines

StudyMate icons must strictly align with a clean, vector aesthetic:
- **Library**: `lucide-react` exclusively. No raw SVG blocks or custom png files inside UI code.
- **Style**: Standard outline styles with a consistent default weight (`strokeWidth={2}`).
- **Key Associations**:
  - `GraduationCap`: Academic Welcome, Workspace, Studies.
  - `FileUp`: Document Uploads, Syllabus, Notes Ingestion.
  - `Brain`: Active Recall, Mind Maps, Flashcards.
  - `Target`: Quizzes, Examinations, Objectives.
  - `Sparkles`: Generative Actions, AI, Summary Compiling.

---

## 📐 Logo Guidelines

The StudyMate logo represents a stylized, intersecting network of neurons and learning vectors forming an abstract graduation cap.

- **Logo Construction**:
  - A clean, centered icon composed of three layered rings forming a book shape with a single star (representing comprehension) hovering above.
- **Clear Space Requirements**:
  - Keep a minimum space equal to 50% of the logo height around the icon to avoid visual clutter.
- **Incorrect Uses**:
  - Never stretch or skew the logo proportions.
  - Do not use low-contrast background backdrops.
  - Avoid dropping shadows or gradients behind the simple flat brand mark.
