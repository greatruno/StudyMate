# StudyMate Troubleshooting & Diagnostic Guide

## Common Issues & Resolution Matrix

| Symptom / Error | Cause | Solution |
| :--- | :--- | :--- |
| **`429 Rate Limit Exceeded`** | Client hit rate limit threshold (120 req/min general, 30 req/min AI) | Wait `retryAfterSeconds` specified in response header or optimize request frequency. |
| **`PayloadTooLargeError`** | Uploaded document exceeds 15MB limit | Ensure file size is under 15MB or compress base64 before upload. |
| **`Gemini API Error / 503`** | Transient Google GenAI service unavailability | The server automatically retries with exponential backoff and falls back to flash models. Check `GEMINI_API_KEY` in `.env`. |
| **`Port 3000 In Use`** | Server process already running | Terminate lingering node processes with `pkill -f node` or `restart_dev_server`. |
| **`Missing OpenAPI Spec`** | `/docs/openapi.json` file missing | Run `npm run verify:all` or check `docs/openapi.json`. |
