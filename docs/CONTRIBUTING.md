# StudyMate Contribution Guidelines

This document outlines the coding standards, repository conventions, pull request workflows, and code review expectations required to contribute to StudyMate.

---

## 💻 Coding Standards & Conventions

### 1. Naming Conventions
- **Files & Directories**:
  - React components: PascalCase (e.g., `WelcomeScreen.tsx`).
  - Helper libraries and configuration files: camelCase or kebab-case (e.g., `server.ts`, `vite.config.ts`).
- **Variables & Functions**:
  - Variable and function names: `camelCase` (e.g., `updateAnalytics`).
  - Constants and configuration options: `UPPER_SNAKE_CASE` (e.g., `USERS_DIR`, `ACADEMIC_CATEGORIES`).
  - TypeScript types and interfaces: `PascalCase` (e.g., `DocumentItem`, `UserAccount`).

### 2. Component Structure
React components must follow a consistent layout structure for readability:
1. **Imports**: Group imports into logical blocks (standard React hooks, icon sets, typescript contracts, sub-components).
2. **Interface Declarations**: Specify explicit typing prop contracts above the function definition.
3. **Component Definition**: Export the function directly as a named export.
4. **Hooks Initialization**: Place state variables and context hooks at the very top of the function body.
5. **Helper Event Functions**: Nest specialized event and callback functions (e.g. `handleQuickCompile`) immediately after state definitions.
6. **JSX Render Tree**: Return semantic, accessible JSX tags. Use clean CSS layout utilities.

### 3. Styling Guidelines
- Use **Tailwind CSS** classes directly inside markup. Do not use custom inline CSS styles or write local CSS files unless absolutely necessary.
- Build responsive designs from mobile-up, using mobile-first utility classes (`sm:`, `md:`, `lg:`).

---

## 📝 Commit Message Formats

We enforce the **Conventional Commits** standard to automate changelog generation. Commit messages must be structured as follows:

```
<type>(<scope>): <short descriptive summary>
```

### Approved Commit Types:
- `feat`: A new user-facing feature.
- `fix`: A bug fix.
- `docs`: Documentation-only changes.
- `style`: Code layout formatting changes (semicolons, spacing, etc.) that do not affect logic.
- `refactor`: Structural changes that neither fix a bug nor add a feature.
- `perf`: Code changes that optimize speed, efficiency, or memory.
- `test`: Adding or correcting tests.
- `chore`: Internal infrastructure updates (dependency updates, tool config, etc.).

### Example Commit:
```text
feat(auth): integrate bcrypt password hashing on register route
```

---

## 🚀 Pull Request & Review Workflow

### 1. Branch Strategy
- Main branch: `main`. This reflects the production-ready code.
- Feature branches: `feature/short-description` or `bugfix/issue-description`. Create branches from `main`.

### 2. Pull Request Guidelines
- Provide a summary describing the changes, the files modified, and verification screenshots of visual alterations.
- All code changes must pass TypeScript compilation checks and ESLint validation rules before submission.
  ```bash
  npm run lint
  ```

### 3. Code Review Expectations
- At least **one peer review approval** is required before merging into `main`.
- Focus reviews on:
  - Type safety (no usage of `any`).
  - Proper error handling (try-catch safety blocks around external endpoints).
  - Component performance (avoiding infinite re-renders or heavy calculations in rendering paths).
  - Design compliance (Tailwind styles, visual consistency, alignment, typography).
