# AI Assistance & Coding Guidelines for StudyMate

This document establishes the instructions, architectural boundaries, safety principles, and coding standards for AI Coding Agents and AI Studio systems collaborating on the StudyMate codebase.

---

## 🎯 Coding Philosophy & Architecture Consistency

### 1. Maintain Monolithic Integrity First
- In the prototype phase, keep Express API routes centered in `server.ts` and React components under `/src`. Do not create secondary background architectures or independent microservices unless explicitly requested.
- **Strict Decoupling**: Separate shared structures into `/src/types.ts` early. Keep React component states decoupled, clean, and highly modular.

### 2. Standardized Type Safety
- All new files **must** be written in TypeScript with explicit types.
- Avoid using `any`. Use strict interfaces to model data shapes.
- Import standard React type hooks (`React.FC`, `MouseEvent`, etc.) where applicable.

---

## 🛡️ AI Safety & Prompt Engineering Standards

### 1. Server-Side API Security (Critical)
- **Zero Client-Side Keys**: Never write code that exposes the `GEMINI_API_KEY` or any other sensitive secret keys (e.g., database URLs, payment provider keys) to the client browser.
- All AI model requests must go through server-side endpoints in `server.ts` using the `@google/genai` library, with the client calling the Express backend to get responses.

### 2. Robust Error Guardrails
- AI integration handlers must be wrapped in `try-catch` blocks.
- If the Gemini API fails, times out, or receives bad input, the backend must return clean JSON error codes (e.g., `500`) instead of crashing the server thread.
- Provide clean fallback data or descriptive error notifications in the UI when external API services are down.

---

## 🎨 Visual Identity & Frontend Requirements

### 1. Typography & Colors
- StudyMate's primary interface is designed with a sleek, minimalist **high-contrast theme**.
- Default font family must align with **Inter** for system UI, paired with **JetBrains Mono** or **Fira Code** for code blocks, diagnostics, and structured status elements.
- Never use random gradients, distracting shadows, or overly vibrant primary colors unless requested. Stick to clean slate-whites, off-black charcoals, and deep royal indigo accents.

### 2. Mobile-First & Accessibility (A11y)
- **Adaptive Prefixing**: All React layouts must utilize responsive Tailwind prefixing (`sm:`, `md:`, `lg:`, `xl:`) to guarantee layouts scale beautifully from small mobile screens to widescreen monitors.
- **Touch Targets**: Ensure buttons, dropdown selectors, and card targets have a minimum touch container area of `44px` on mobile displays.
- **Semantic HTML**: Use correct semantic structures (`<main>`, `<header>`, `<nav>`, `<section>`). All custom interactive buttons or forms must have unique HTML `id` values to enable testing and scripting.
- **Color Contrast**: Ensure text contrast meets WCAG AA standards (minimum contrast ratio of 4.5:1).

---

## ⚡ Performance Expectations
- **Efficient Re-renders**: Prevent unnecessary React re-renders. Avoid inserting un-memoized arrays, objects, or inline functions into dependency lists of `useEffect`.
- **Payload Limits**: Avoid syncing monolithic objects inside requests. Only write API endpoints that exchange the specific delta fields needed to update state.
- **Asset Streaming**: Optimize PDF/Word text parsing. Complete intensive file parses asynchronously or use loading overlays to notify users of processing progress.
