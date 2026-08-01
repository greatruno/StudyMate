# StudyMate Changelog

All notable changes to the StudyMate project will be documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-07-03
### Added
- **Academic Profile Builder**: Integrated multi-discipline onboarding selection, supporting 15 high-level categories and over 90 custom academic subject fields.
- **Custom Specify-Field ("Other") Option**: Implemented custom field specifying to allow learners in niche fields (e.g. Astrobiology, Space Medicine) to input their primary discipline.
- **Academic Welcome Packets**: Wired personalized greeting cards and AI study starters on first-load based on onboarding profiles.
- **Workspace Welcome Modules**: Created click-to-compile mock study suites (summary, quiz, flashcard deck) allowing users to test active recall tools instantly without uploading custom files.
- **Engineering Documentation Center**: Created `/docs` directory to act as a permanent architectural reference.

---

## [0.1.0] - 2026-06-25
### Added
- **Initial Prototype**: Built standard AI Studio prototype with client-side dashboard tracking home, upload, chat, and stats views.
- **AI Synthesis Pipeline**: Connected server routes to Gemini API to auto-compile textbook summaries, dynamic quizzes, and flashcard sets.
- **Multi-Format Extraction**: Integrated server text extraction for PDF and Microsoft Word (.docx) uploads.
- **Volatile Storage Layer**: Setup local file-system writes inside `/tmp` for saving mock user profiles and document indexing during rapid workspace iterations.
- **Telemetry Charts**: Added visual Weekly Progress bar charts and achievements cards to track active study habits.
