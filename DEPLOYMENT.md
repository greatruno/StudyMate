# StudyMate Deployment & Containerization Guide

## Production Environment Setup

### 1. Environment Variables (`.env`)
```env
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Production Build Commands
```bash
# Clean previous artifacts
npm run clean

# Type checking & linting
npm run lint

# Execute automated tests
npm run test

# Bundle frontend assets & backend server
npm run build

# Pre-flight release verification
npm run pre-release
```

### 3. Execution
```bash
npm start
# Server listens on 0.0.0.0:3000
```
