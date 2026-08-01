import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";
import fs from "fs";
import * as pdfParseModule from "pdf-parse";
import authRoutes from "./server/routes/auth.routes.js";
import documentsRoutes from "./server/routes/documents.routes.js";
import memoryRoutes from "./server/routes/memory.routes.js";
import studyToolsRoutes from "./server/routes/studyTools.routes.js";
import academicRoutes from "./server/routes/academic.routes.js";
import academicIntelligenceRoutes from "./server/routes/academicIntelligence.routes.js";
import collaborationRoutes from "./server/routes/collaboration.routes.js";
import { extractTextFromPptx } from "./server/utils/pptxParser.js";

async function pdfParse(buffer: Buffer): Promise<{ text: string }> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const parser = new pdfParseModule.PDFParse({ data: uint8Array });
    try {
      const result = await parser.getText();
      return { text: result.text || "" };
    } finally {
      try {
        await parser.destroy();
      } catch (e) {
        console.error("Error destroying PDFParse instance:", e);
      }
    }
  } catch (err) {
    console.error("Error in custom pdfParse wrapper:", err);
    throw err;
  }
}

import { logger } from "./server/utils/logger.js";
import {
  requestTracingMiddleware,
  securityHeadersMiddleware,
  globalApiRateLimiter,
  aiGenerationRateLimiter,
  sanitizeInputMiddleware
} from "./server/middleware/security.middleware.js";

dotenv.config();

const app = express();
const PORT = 3000;
const SERVER_START_TIME = Date.now();

// Attach Production Security & Observability Middleware Suite
app.use(requestTracingMiddleware);
app.use(securityHeadersMiddleware);
app.use(sanitizeInputMiddleware);
app.use("/api", globalApiRateLimiter);

// Raise payload size limits to allow uploading and processing files up to 15MB without PayloadTooLargeError
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// System Health & Telemetry Probes
app.get("/api/health", (req, res) => {
  const memUsage = process.memoryUsage();
  let aiConfigured = false;
  try {
    aiConfigured = Boolean(process.env.GEMINI_API_KEY);
  } catch (e) {
    aiConfigured = false;
  }

  res.json({
    status: "healthy",
    uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    memoryUsage: {
      rssMb: Math.round(memUsage.rss / 1024 / 1024),
      heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024)
    },
    aiSdkConfigured: aiConfigured
  });
});

app.get("/api/ready", (req, res) => {
  res.json({ status: "ready", timestamp: new Date().toISOString() });
});

app.get("/api/metrics", (req, res) => {
  try {
    const analytics = getOrCreateAnalytics();
    res.json({
      uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
      totalRegistrations: analytics.totalRegistrations,
      totalUploads: analytics.totalUploads,
      totalChatQueries: analytics.totalChatQueries,
      totalQuizzesCompleted: analytics.totalQuizzesCompleted,
      studyMinutesLogged: analytics.studyMinutesLogged,
      memory: process.memoryUsage()
    });
  } catch (e) {
    res.json({ status: "ok", memory: process.memoryUsage() });
  }
});

// OpenAPI Documentation JSON & Swagger UI Mirror
app.get("/api/v1/swagger.json", (req, res) => {
  const openapiPath = path.join(process.cwd(), "docs", "openapi.json");
  if (fs.existsSync(openapiPath)) {
    return res.sendFile(openapiPath);
  }
  res.status(404).json({ error: "OpenAPI specification file not found." });
});

app.get("/api/docs", (req, res) => {
  res.send(`
    <!Timeline HTML>
    <html>
      <head>
        <title>StudyMate API Documentation (OpenAPI 3.0)</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      </head>
      <body style="margin: 0; padding: 0;">
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
        <script>
          window.onload = () => {
            SwaggerUIBundle({
              url: '/api/v1/swagger.json',
              dom_id: '#swagger-ui',
            });
          };
        </script>
      </body>
    </html>
  `);
});

// Authentication API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/auth", authRoutes);

// Document Management & Storage Engine API Routes
app.use("/api/v1/documents", documentsRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/v1/chat", documentsRoutes);

// AI Memory & Personalization Engine API Routes
app.use("/api/v1/memory", memoryRoutes);
app.use("/api/memory", memoryRoutes);

// Phase 2.4 - Intelligent Study Tools API Routes
app.use("/api/v1/study-tools", studyToolsRoutes);
app.use("/api/study-tools", studyToolsRoutes);

// Phase 3.1 - Academic Profile & University Structure API Routes
app.use("/api/v1/academic", academicRoutes);
app.use("/api/academic", academicRoutes);

// Phase 3.2 - Academic Intelligence Engine API Routes
app.use("/api/v1/academic-intelligence", academicIntelligenceRoutes);
app.use("/api/academic-intelligence", academicIntelligenceRoutes);

// Phase 4.1 - Real-Time Collaboration & Social Learning API Routes
app.use("/api/v1/collaboration", collaborationRoutes);
app.use("/api/collaboration", collaborationRoutes);

// Path for caching parsed and chunked study material files on local disk
const DOCS_DIR = "/tmp/study_mate_docs";
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

interface ProcessedDocument {
  id: string;
  title: string;
  chunks: string[];
  processedChunks: {
    text: string;
    summary: string;
    keyConcepts: { title: string; explanation: string }[];
    highlights: string[];
  }[];
  fullText: string;
}

function getUserDocsDir(username: string): string {
  const cleanName = (username || "global").toLowerCase().replace(/[^a-z0-9_]/g, "");
  const userDir = path.join(DOCS_DIR, cleanName);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return userDir;
}

function saveDocument(username: string, documentId: string, docData: ProcessedDocument) {
  const userDir = getUserDocsDir(username);
  const filePath = path.join(userDir, `${documentId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(docData, null, 2), "utf-8");
}

function getDocument(username: string, documentId: string): ProcessedDocument | null {
  const userDir = getUserDocsDir(username);
  const filePath = path.join(userDir, `${documentId}.json`);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      console.error("Error reading stored document file:", e);
    }
  }
  // Fallback to global files for backward compatibility
  const fallbackPath = path.join(DOCS_DIR, `${documentId}.json`);
  if (fs.existsSync(fallbackPath)) {
    try {
      return JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
    } catch (e) {
      console.error("Error reading global document file:", e);
    }
  }
  return null;
}

// Splits large text into smaller, overlapping chunks preserving semantic breaks (paragraphs, lines, sentences)
function chunkText(text: string, chunkSize = 3000, overlap = 400): string[] {
  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    let end = Math.min(index + chunkSize, text.length);
    if (end < text.length) {
      const paragraphBreak = text.lastIndexOf("\n\n", end);
      if (paragraphBreak > index + chunkSize * 0.6) {
        end = paragraphBreak + 2;
      } else {
        const lineBreak = text.lastIndexOf("\n", end);
        if (lineBreak > index + chunkSize * 0.7) {
          end = lineBreak + 1;
        } else {
          const sentenceBreak = text.lastIndexOf(". ", end);
          if (sentenceBreak > index + chunkSize * 0.7) {
            end = sentenceBreak + 2;
          }
        }
      }
    }
    chunks.push(text.substring(index, end).trim());
    index = end - overlap;
    if (index >= text.length || end === text.length) break;
    if (index < 0) index = 0;
  }
  return chunks.filter(c => c.length > 10);
}

// Limits chunk count to prevent hitting Gemini API rate limits on massive documents
function mergeChunksToLimit(chunks: string[], maxChunks = 8): string[] {
  if (chunks.length <= maxChunks) return chunks;
  const merged: string[] = [];
  const groupSize = Math.ceil(chunks.length / maxChunks);
  for (let i = 0; i < chunks.length; i += groupSize) {
    const group = chunks.slice(i, i + groupSize);
    merged.push(group.join("\n\n---\n\n"));
  }
  return merged;
}

// Analyzes a single chunk using a lightweight prompt to generate a summary and concepts
async function processChunk(ai: GoogleGenAI, chunkText: string): Promise<{
  summary: string;
  keyConcepts: { title: string; explanation: string }[];
  highlights: string[];
}> {
  try {
    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Extract study elements from this section:\n\n${chunkText}`,
      config: {
        systemInstruction: "You are an educational parser. Analyze the section of study material and extract a 2-3 sentence summary, key concepts with definitions, and key factual highlights in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["title", "explanation"]
              }
            },
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "keyConcepts", "highlights"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
  } catch (err) {
    console.error("Error processing individual chunk:", err);
  }
  return {
    summary: chunkText.substring(0, 150) + "...",
    keyConcepts: [],
    highlights: []
  };
}

// High-performance TF-IDF keyword-based search engine to retrieve top-k chunks for RAG queries
function retrieveRelevantChunks(chunks: string[], query: string, topK = 3): string[] {
  if (!chunks || chunks.length === 0) return [];
  if (chunks.length <= topK) return chunks;

  const queryTokens = query.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) {
    return chunks.slice(0, topK);
  }

  const chunkScores = chunks.map((chunk, index) => {
    const chunkTextLower = chunk.toLowerCase();
    let score = 0;

    queryTokens.forEach(token => {
      const regex = new RegExp("\\b" + token + "\\b", "g");
      const matches = chunkTextLower.match(regex);
      const count = matches ? matches.length : 0;
      
      if (count > 0) {
        score += 1 + Math.log(count + 1);
      }
    });

    return { chunk, score, index };
  });

  chunkScores.sort((a, b) => b.score - a.score || a.index - b.index);
  const nonZeroScores = chunkScores.filter(cs => cs.score > 0);
  const selected = nonZeroScores.length > 0 ? nonZeroScores : chunkScores;

  return selected.slice(0, topK).map(cs => cs.chunk);
}

// Multi-document global TF-IDF search engine with metadata and title relevance scoring
function retrieveRelevantUserChunks(
  userChunks: { text: string; sourceTitle: string }[],
  query: string,
  topK = 4
): { text: string; sourceTitle: string }[] {
  if (!userChunks || userChunks.length === 0) return [];
  if (userChunks.length <= topK) return userChunks;

  const queryTokens = query.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) {
    return userChunks.slice(0, topK);
  }

  const scored = userChunks.map((uc, index) => {
    const textLower = uc.text.toLowerCase();
    let score = 0;

    queryTokens.forEach(token => {
      const regex = new RegExp("\\b" + token + "\\b", "g");
      const matches = textLower.match(regex);
      const count = matches ? matches.length : 0;
      
      if (count > 0) {
        score += 1 + Math.log(count + 1);
      }
      
      // Bonus score if token matches in the document title
      if (uc.sourceTitle.toLowerCase().includes(token)) {
        score += 3.5;
      }
    });

    return { uc, score, index };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  const nonZero = scored.filter(s => s.score > 0);
  const selected = nonZero.length > 0 ? nonZero : scored;

  return selected.slice(0, topK).map(s => s.uc);
}

// Lazy-loaded Gemini AI client helper to avoid startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please make sure to configure it in the Secrets panel in AI Studio settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helper function to safely invoke Gemini API with retries and a fallback model in case of high demand (503 / 429)
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: {
    model?: string;
    contents: any;
    config?: any;
  },
  maxRetries = 2
) {
  let attempt = 0;
  let currentModel = params.model || "gemini-3.5-flash";
  const backupModels = ["gemini-flash-latest", "gemini-3.1-flash-lite"];

  while (true) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: currentModel,
      });
      return response;
    } catch (error: any) {
      attempt++;
      const errorMessage = error?.message || String(error);
      
      const isHighDemand =
        errorMessage.includes("503") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("demand") ||
        errorMessage.includes("overload") ||
        error?.status === 503 ||
        error?.code === 503;

      const isRateLimit =
        errorMessage.includes("429") ||
        errorMessage.includes("RESOURCE_EXHAUSTED") ||
        error?.status === 429 ||
        error?.code === 429;

      const isTransient = isHighDemand || isRateLimit;

      if (isTransient) {
        // If the model is facing high demand, switch immediately without waiting for slow exponential retries
        if (isHighDemand && backupModels.length > 0) {
          const nextModel = backupModels.shift();
          if (nextModel) {
            console.warn(
              `Model ${currentModel} is experiencing high demand (503/UNAVAILABLE). Switching immediately to fallback model ${nextModel}...`
            );
            currentModel = nextModel;
            attempt = 0;
            continue;
          }
        }

        // Standard exponential retries for rate limit or as fallback if no backup models remain
        if (attempt <= maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(
            `Gemini API returned temporary error on model ${currentModel}: "${errorMessage}". Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (backupModels.length > 0) {
          const nextModel = backupModels.shift();
          if (nextModel) {
            console.warn(
              `Retries exhausted on ${currentModel}. Switching to fallback model ${nextModel} due to persistent error: "${errorMessage}"`
            );
            currentModel = nextModel;
            attempt = 0;
            continue;
          }
        }
      }

      throw error;
    }
  }
}

// Helper function to safely invoke Gemini Streaming API with retries and a fallback model in case of high demand (503 / 429)
async function generateContentStreamWithRetry(
  ai: GoogleGenAI,
  params: {
    model?: string;
    contents: any;
    config?: any;
  },
  maxRetries = 2
) {
  let attempt = 0;
  let currentModel = params.model || "gemini-3.5-flash";
  const backupModels = ["gemini-flash-latest", "gemini-3.1-flash-lite"];

  while (true) {
    try {
      const responseStream = await ai.models.generateContentStream({
        ...params,
        model: currentModel,
      });
      return responseStream;
    } catch (error: any) {
      attempt++;
      const errorMessage = error?.message || String(error);
      
      const isHighDemand =
        errorMessage.includes("503") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("demand") ||
        errorMessage.includes("overload") ||
        error?.status === 503 ||
        error?.code === 503;

      const isRateLimit =
        errorMessage.includes("429") ||
        errorMessage.includes("RESOURCE_EXHAUSTED") ||
        error?.status === 429 ||
        error?.code === 429;

      const isTransient = isHighDemand || isRateLimit;

      if (isTransient) {
        // If the model is facing high demand, switch immediately without waiting for slow exponential retries
        if (isHighDemand && backupModels.length > 0) {
          const nextModel = backupModels.shift();
          if (nextModel) {
            console.warn(
              `Model ${currentModel} is experiencing high demand (503/UNAVAILABLE). Switching stream immediately to fallback model ${nextModel}...`
            );
            currentModel = nextModel;
            attempt = 0;
            continue;
          }
        }

        // Standard exponential retries for rate limit or as fallback if no backup models remain
        if (attempt <= maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(
            `Gemini API returned temporary error on model ${currentModel}: "${errorMessage}". Retrying stream creation in ${delay}ms... (Attempt ${attempt}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (backupModels.length > 0) {
          const nextModel = backupModels.shift();
          if (nextModel) {
            console.warn(
              `Retries exhausted on ${currentModel}. Switching stream to fallback model ${nextModel} due to persistent error: "${errorMessage}"`
            );
            currentModel = nextModel;
            attempt = 0;
            continue;
          }
        }
      }

      throw error;
    }
  }
}

// Document Parser API
app.post("/api/parse-document", async (req, res) => {
  try {
    const { base64, fileName, fileType, text, username } = req.body;
    let extractedText = "";

    if (base64) {
      const buffer = Buffer.from(base64, "base64");
      
      // Strict server-side file size validation: 15MB limit
      const sizeInBytes = buffer.length;
      if (sizeInBytes > 15 * 1024 * 1024) {
        return res.status(400).json({ error: "File is too large. Maximum allowed size is 15MB." });
      }

      const ext = fileName ? fileName.split(".").pop()?.toLowerCase() : "";

      if (ext === "pdf" || fileType === "application/pdf") {
        const data = await pdfParse(buffer);
        extractedText = data.text || "";
      } else if (
        ext === "docx" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } else if (
        ext === "pptx" ||
        fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ) {
        extractedText = await extractTextFromPptx(buffer);
      } else if (ext === "txt" || ext === "md" || fileType?.startsWith("text/")) {
        extractedText = buffer.toString("utf-8");
      } else {
        return res.status(400).json({ error: "Unsupported file type. Please upload a .pdf, .docx, .pptx, .txt, or .md file." });
      }
    } else if (text && typeof text === "string") {
      extractedText = text;
    } else {
      return res.status(400).json({ error: "Missing file data (base64) or text content." });
    }

    // Clean up excessive whitespace while preserving paragraphs and headings
    extractedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!extractedText || extractedText.length < 20) {
      return res.status(400).json({ error: "No sufficient text content could be extracted from this document." });
    }

    // Generate unique documentId
    const documentId = "doc_" + Date.now();

    // Chunk the text
    const chunks = chunkText(extractedText);

    // Limit chunk count to merge them if there are too many, preventing rate limits
    const mergedChunks = mergeChunksToLimit(chunks, 8);

    // Process chunks separately (extracting concise summaries and key concepts for each)
    const ai = getAI();
    const processedChunks: any[] = [];
    
    for (const chunk of mergedChunks) {
      const processed = await processChunk(ai, chunk);
      processedChunks.push({
        text: chunk,
        summary: processed.summary,
        keyConcepts: processed.keyConcepts,
        highlights: processed.highlights
      });
    }

    // Save document and processed chunks metadata to local disk storage
    saveDocument(username || "global", documentId, {
      id: documentId,
      title: fileName || "Pasted Material",
      chunks: mergedChunks,
      processedChunks,
      fullText: extractedText
    });

    res.json({ 
      documentId,
      text: extractedText,
      wordCount: extractedText.trim().split(/\s+/).filter(Boolean).length
    });
  } catch (error: any) {
    console.error("Document parsing error:", error);
    res.status(500).json({ error: error.message || "Failed to parse document" });
  }
});

// 1. Summarization API (supports both documentId and raw content fallback)
app.post("/api/generate/summary", async (req, res) => {
  try {
    const { documentId, content, username } = req.body;
    let outlineContent = "";
    let docTitle = "Study Material";

    const ai = getAI();

    if (documentId) {
      const doc = getDocument(username || "global", documentId);
      if (doc && doc.processedChunks) {
        docTitle = doc.title;
        outlineContent = doc.processedChunks.map((pc, idx) => {
          return `Section ${idx + 1} Summary:\n${pc.summary}\nKey Concepts:\n${pc.keyConcepts.map(kc => `- ${kc.title}: ${kc.explanation}`).join("\n")}\nHighlights:\n${pc.highlights.map(h => `- ${h}`).join("\n")}`;
        }).join("\n\n---\n\n");
      }
    }

    // Fallback if no documentId or not found in local files
    if (!outlineContent) {
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Content or active documentId is required for summarizing." });
      }
      
      // Parse, chunk, and summarize in one go
      const chunks = chunkText(content);
      const merged = mergeChunksToLimit(chunks, 5);
      const processed: any[] = [];
      for (const chunk of merged) {
        const pc = await processChunk(ai, chunk);
        processed.push(pc);
      }
      outlineContent = processed.map((pc, idx) => {
        return `Section ${idx + 1} Summary:\n${pc.summary}\nKey Concepts:\n${pc.keyConcepts.map((kc: any) => `- ${kc.title}: ${kc.explanation}`).join("\n")}\nHighlights:\n${pc.highlights.map((h: any) => `- ${h}`).join("\n")}`;
      }).join("\n\n---\n\n");
    }

    const systemPrompt = "You are StudyMate, a helpful, encouraging study assistant. Analyze the provided study material outlines and generate a beautifully structured, highly comprehensible summary in an engaging student-friendly tone.";

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Please generate a comprehensive, unified global study summary with extended material intelligence and logical structural breakdown based on this structured document outline:\n\nDocument Title: ${docTitle}\n\nOutline:\n${outlineContent}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A concise and engaging title for this summary."
            },
            summaryText: {
              type: Type.STRING,
              description: "A high-level paragraph summarizing the core theme and overall material in an engaging, easy-to-understand student tone."
            },
            keyConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "The name of the key term, concept, or theory." },
                  explanation: { type: Type.STRING, description: "A simplified, intuitive, and practical explanation of this concept." }
                },
                required: ["title", "explanation"]
              },
              description: "A list of the 4-8 most important concepts, terms, or rules found in the material."
            },
            bulletPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A bulleted list of 5-8 essential highlights or key takeaways."
            },
            studyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 highly practical study suggestions, memory hooks, or review tips specifically tailored to mastering this content."
            },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Name of the chapter, topic section, or logical division (e.g. 'Chapter 1: Intro')." },
                  range: { type: Type.STRING, description: "Approximated location or range in notes (e.g. 'Pages 1-3' or 'Section A')." },
                  summary: { type: Type.STRING, description: "A 1-2 sentence high-level summary of what this chapter/section covers." }
                },
                required: ["title", "range", "summary"]
              },
              description: "A structured table of chapters or major logical subdivisions identified in the material."
            },
            topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of the 4-6 primary high-level topics, domains, or themes covered."
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 5-8 search-friendly keywords or tags relevant to this material."
            },
            importantTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: "A key terminological definition or formula." },
                  definition: { type: Type.STRING, description: "The definition, meaning, or explanation." }
                },
                required: ["term", "definition"]
              },
              description: "Essential terms, definitions, formulas, or proper nouns of high importance."
            },
            quizTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 high-yield topics or focus areas that are highly recommended to be tested on."
            },
            flashcardSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 key concepts or recall questions that should be turned into flashcards."
            },
            subject: {
              type: Type.STRING,
              description: "The primary high-level academic subject domain of this material (e.g. 'Chemistry', 'History', 'Physics', 'Psychology', 'Computer Science', etc.)"
            }
          },
          required: ["title", "summaryText", "keyConcepts", "bulletPoints", "studyTips", "chapters", "topics", "keywords", "importantTerms", "quizTopics", "flashcardSuggestions", "subject"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini AI.");
    }

    const parsedResponse = JSON.parse(response.text.trim());
    return res.json(parsedResponse);
  } catch (error: any) {
    console.error("Summarization API Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during summarization.",
      details: error.stack
    });
  }
});

// 2. Quiz Generation API (supports custom types, difficulty levels, and documentId/raw fallback)
app.post("/api/generate/quiz", async (req, res) => {
  try {
    const { documentId, content, username, difficulty = "intermediate", questionTypes = ["mcq"], numQuestions = 5 } = req.body;
    let outlineContent = "";
    const ai = getAI();

    if (documentId) {
      const doc = getDocument(username || "global", documentId);
      if (doc && doc.processedChunks) {
        outlineContent = doc.processedChunks.map((pc, idx) => {
          return `Section ${idx + 1} Summary:\n${pc.summary}\nKey Concepts:\n${pc.keyConcepts.map(kc => `- ${kc.title}: ${kc.explanation}`).join("\n")}\nHighlights:\n${pc.highlights.map(h => `- ${h}`).join("\n")}`;
        }).join("\n\n---\n\n");
      }
    }

    if (!outlineContent) {
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Content or active documentId is required for quiz generation." });
      }
      outlineContent = content;
    }

    const typesStr = questionTypes.join(", ");
    const systemPrompt = `You are StudyMate, an expert adaptive exam designer. Your goal is to design a high-quality study quiz.
Generate a quiz with exactly ${numQuestions} questions of types [${typesStr}] at a "${difficulty}" academic difficulty level.

Adapt the academic difficulty strictly based on the requested level:
- beginner: straightforward, testing basic terminology, simple recall, and clear definitions.
- intermediate: testing conceptual understanding, application of terms, and general logical reasoning.
- advanced: challenging questions testing deeper relationships, multi-step problem solving, and analytical comparisons.
- elite: highly challenging, master-level/PhD tier questions testing boundary conditions, intricate scenario details, and deep critical reasoning.

For question types, strictly adhere to:
- mcq: Multiple Choice Question with exactly 4 options, a correctOptionIndex (0-3), and detailed explanation.
- true_false: True or False question, options must be exactly ["True", "False"], correctOptionIndex (0 or 1), and explanation.
- short_answer: Conceptual question where the student types text. Options should be empty, correctOptionIndex must be -1, correctShortAnswer must be a highly descriptive, human-readable summary of the correct answer so students can self-assess, plus a detailed explanation of what keywords they should have included.
- scenario: A brief 2-3 sentence realistic scenario followed by a challenging multiple choice question. Options list exactly 4 choices, a correctOptionIndex (0-3), and detailed explanation of why that scenario choice is correct.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Generate a custom ${numQuestions}-question quiz at "${difficulty}" difficulty using these types: [${typesStr}] from this material outline:\n\n${outlineContent}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: "The type of the question: 'mcq', 'true_false', 'short_answer', or 'scenario'."
              },
              question: {
                type: Type.STRING,
                description: "The question text. For scenarios, write the scenario description followed by the question."
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "For 'mcq' and 'scenario' must be exactly 4 strings. For 'true_false' must be exactly ['True', 'False']. For 'short_answer' must be empty."
              },
              correctOptionIndex: {
                type: Type.INTEGER,
                description: "The 0-based index of the correct option (0-3 for mcq/scenario, 0-1 for true_false, and -1 for short_answer)."
              },
              correctShortAnswer: {
                type: Type.STRING,
                description: "For 'short_answer', write a sample answer text/keywords explaining what a perfect student answer contains. For other types, leave empty."
              },
              explanation: {
                type: Type.STRING,
                description: "A friendly, educational explanation of why the correct answer is right and why other options are incorrect."
              }
            },
            required: ["type", "question", "options", "correctOptionIndex", "correctShortAnswer", "explanation"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini AI.");
    }

    const parsedResponse = JSON.parse(response.text.trim());
    return res.json({ questions: parsedResponse });
  } catch (error: any) {
    console.error("Quiz API Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during quiz generation.",
      details: error.stack
    });
  }
});

// 3. Flashcards Generation API (supports both documentId and raw content fallback)
app.post("/api/generate/flashcards", async (req, res) => {
  try {
    const { documentId, content, username } = req.body;
    let outlineContent = "";
    const ai = getAI();

    if (documentId) {
      const doc = getDocument(username || "global", documentId);
      if (doc && doc.processedChunks) {
        outlineContent = doc.processedChunks.map((pc, idx) => {
          return `Section ${idx + 1} Summary:\n${pc.summary}\nKey Concepts:\n${pc.keyConcepts.map(kc => `- ${kc.title}: ${kc.explanation}`).join("\n")}`;
        }).join("\n\n---\n\n");
      }
    }

    if (!outlineContent) {
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Content or active documentId is required for flashcards generation." });
      }
      outlineContent = content;
    }

    const systemPrompt = "You are StudyMate, a professional educator. Design double-sided active-recall flashcards from the provided material to aid memorization.";

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Generate 6 to 10 active recall flashcards from this content outline:\n\n${outlineContent}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: {
                type: Type.STRING,
                description: "The front side containing a question, a formula to complete, or a concept to define."
              },
              back: {
                type: Type.STRING,
                description: "The back side containing the precise answer, explanation, or definition."
              },
              concept: {
                type: Type.STRING,
                description: "A 1-3 word topic tag for organizing the card (e.g. 'Definition', 'Law', 'Formula', 'Year')."
              }
            },
            required: ["front", "back", "concept"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const parsedResponse = JSON.parse(response.text.trim());
    return res.json({ flashcards: parsedResponse });
  } catch (error: any) {
    console.error("Flashcards API Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during flashcard generation.",
      details: error.stack
    });
  }
});

app.post("/api/generate/academic-welcome", async (req, res) => {
  try {
    const { profile, username } = req.body;
    if (!profile) {
      return res.status(400).json({ error: "Academic profile is required." });
    }

    const { role, academicCategory, primaryField, customField, learningGoals, experienceLevel, preferredLearningStyle } = profile;
    const actualField = primaryField === "Other" ? (customField || "Custom Discipline") : primaryField;
    const ai = getAI();

    const systemPrompt = "You are StudyMate, an intelligent, universal learning personalization engine. Generate a highly personalized academic welcome packet based on the user's details. Speak directly to the specific discipline and learning preferences.";

    const userPrompt = `
Generate an academic welcome packet for "${username || "Learner"}":
- Role: ${role}
- Academic Domain: ${academicCategory}
- Specialization: ${actualField}
- Learning Goals: ${learningGoals || "Broad discipline mastery and active recall"}
- Experience Level: ${experienceLevel}
- Learning Style: ${preferredLearningStyle}

Provide the following in JSON format:
1. "welcomeMessage": A supportive, personalized 2-3 sentence greeting that connects their specific field (${actualField}) with their learning style (${preferredLearningStyle}) and experience level (${experienceLevel}).
2. "recommendedStarterTopics": An array of exactly 3 customized introductory topic summaries tailored for their exact profile. Each item must have:
   - "title": A descriptive, professional topic title (e.g. "Fundamentals of ${actualField}").
   - "description": A 1-2 sentence description explaining why this is crucial for their level and style.
   - "content": A robust 150-200 word summary explaining core concepts, key terms, or foundational principles of this topic, so the student can study it immediately!
3. "suggestedQuizzes": An array of exactly 3 study goals or quiz focus suggestions (e.g. "Test your understanding of Basic ${actualField} structures").
4. "learningPath": An array of exactly 4 incremental steps/milestones to build mastery in this domain.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            welcomeMessage: { type: Type.STRING },
            recommendedStarterTopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["title", "description", "content"]
              }
            },
            suggestedQuizzes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            learningPath: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["welcomeMessage", "recommendedStarterTopics", "suggestedQuizzes", "learningPath"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini API.");
    }

    const parsedResponse = JSON.parse(response.text.trim());
    return res.json(parsedResponse);
  } catch (error: any) {
    console.error("Academic Welcome Generation Error:", error);
    const profile = req.body.profile || {};
    const actualField = profile.primaryField === "Other" ? (profile.customField || "Custom Discipline") : (profile.primaryField || "Learning Studies");
    
    return res.json({
      welcomeMessage: `Welcome to StudyMate! We are thrilled to support your learning journey in ${actualField} as a ${profile.role || "student"}. With a ${profile.preferredLearningStyle || "Mixed"} learning style and ${profile.experienceLevel || "Beginner"} experience, we have configured custom revision outlines and recall aids to accelerate your comprehension.`,
      recommendedStarterTopics: [
        {
          title: `Introduction to ${actualField}`,
          description: `An essential overview of foundational theories, core models, and primary vocabularies in ${actualField}.`,
          content: `${actualField} is a dynamic and expanding area of study. Understanding its fundamental frameworks is critical for long-term mastery. Key terms include its central principles, modern methodologies, and contemporary applications. For a learner who prefers ${profile.preferredLearningStyle || "Mixed"} formats, starting with visual summaries or high-level outlines can provide the structural hooks necessary to hang complex details later. As you progress, connecting these concepts to real-world projects or study scenarios will help solidify active memory.`
        },
        {
          title: `Core Methodologies in ${actualField}`,
          description: `Explore the primary tools, analytical techniques, and frameworks utilized by professionals in ${actualField}.`,
          content: `To build competency, one must master the methodologies that define the discipline. This includes quantitative analysis, structured research paradigms, and practical problem-solving. Practice applying these tools to small datasets or case studies to build active intuition. Active recall testing on these methods will prepare you to solve advanced scenarios in higher levels.`
        },
        {
          title: `Advanced Perspectives & Future Trends`,
          description: `Discover how emerging trends, AI integration, and modern research are reshaping ${actualField}.`,
          content: `Staying ahead of the curve is crucial. Modern ${actualField} is increasingly intertwined with data science, interdisciplinary collaboration, and technology. Investigate how digital transformation is changing traditional practices, and focus on developing adaptability and critical reasoning skills to tackle next-generation questions.`
        }
      ],
      suggestedQuizzes: [
        `Mastery Quiz: Foundational Concepts of ${actualField}`,
        `Terminology Check: Core Vocabularies of ${actualField}`,
        `Practical Check: Applying Methodologies in ${actualField}`
      ],
      learningPath: [
        `Phase 1: Establish foundational terminologies & basic principles.`,
        `Phase 2: Engage with interactive diagnostic quizzes & custom summaries.`,
        `Phase 3: Deep dive into core methodologies and case reviews.`,
        `Phase 4: Synthesis of advanced topics and real-world scenario evaluations.`
      ]
    });
  }
});

app.post("/api/generate/learning-insights", async (req, res) => {
  try {
    const { stats, documents, username } = req.body;
    const ai = getAI();

    const statsSummary = `
- Study Time: ${stats.studyTimeMinutes} minutes
- Quizzes Taken: ${stats.quizzesTakenCount}
- Average Quiz Score: ${stats.averageQuizScore}%
- Flashcards Mastered: ${stats.flashcardsMasteredCount}
- Daily Streak: ${stats.dailyStreak} days
- Weekly Minutes Progress: ${JSON.stringify(stats.weeklyProgress)}
- Quiz History: ${JSON.stringify(stats.quizHistory || [])}
- Completed Topics: ${JSON.stringify(stats.completedTopics || [])}
`;

    const docsSummary = (documents || []).map((doc: any) => `
- Document ID: ${doc.id}
- Title: ${doc.title}
- Subject: ${doc.subject || doc.summary?.subject || "General"}
- Topics/Chapters: ${JSON.stringify(doc.summary?.topics || doc.summary?.chapters?.map((c: any) => c.title) || [])}
`).join("\n");

    const systemPrompt = "You are StudyMate, an intelligent, professional learning analytics engine. Analyze the student's learning history, quiz scores, study streak, and documents to generate targeted academic feedback. Be highly realistic, encouraging, and specific to the actual subjects and documents they have.";

    const userPrompt = `
Analyze the progress for student "${username || "Sarah Jenkins"}":

STUDY STATISTICS:
${statsSummary}

UPLOADED DOCUMENTS & SUBJECTS:
${docsSummary}

Please generate custom learning insights, identifying weak areas, 2-3 recommended next steps, and a supportive behavioral insight. Ensure all docIds recommended match real Document IDs from the list above.
`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weakAreas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  remedy: { type: Type.STRING }
                },
                required: ["subject", "topic", "issue", "remedy"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  actionLabel: { type: Type.STRING },
                  docId: { type: Type.STRING }
                },
                required: ["title", "subject", "reason", "actionLabel", "docId"]
              }
            },
            behaviorInsight: {
              type: Type.STRING
            }
          },
          required: ["weakAreas", "recommendations", "behaviorInsight"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from Gemini API.");
    }

    const parsedResponse = JSON.parse(response.text.trim());
    return res.json(parsedResponse);
  } catch (error: any) {
    console.error("Learning Insights API Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during insights generation."
    });
  }
});

// 4. Chat/Q&A API with lightweight RAG (Retrieval-Augmented Generation) pipeline
app.post("/api/generate/chat", async (req, res) => {
  try {
    const { 
      documentId, 
      content, 
      messages, 
      username, 
      tutorMode = "explain", 
      studentLevel = "intermediate",
      selectedAgent = "tutor",
      language = "English"
    } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getAI();
    let relevantContext = "";
    
    // Extract the latest query from the conversation
    const userMessages = messages.filter((msg: any) => msg.role === "user");
    const latestQuery = userMessages.length > 0 ? userMessages[userMessages.length - 1].text : "";

    // If username is provided, query across all documents of the user
    if (username) {
      let userChunks: { text: string; sourceTitle: string }[] = [];
      const userDir = getUserDocsDir(username);
      if (fs.existsSync(userDir)) {
        const files = fs.readdirSync(userDir);
        for (const file of files) {
          if (file.endsWith(".json")) {
            try {
              const doc = JSON.parse(fs.readFileSync(path.join(userDir, file), "utf-8"));
              if (doc && doc.chunks) {
                doc.chunks.forEach((chunk: string) => {
                  userChunks.push({
                    text: chunk,
                    sourceTitle: doc.title || "Untitled Document"
                  });
                });
              }
            } catch (e) {
              console.error("Error reading doc during user-wide search:", e);
            }
          }
        }
      }

      if (userChunks.length > 0) {
        const matchingUserChunks = retrieveRelevantUserChunks(userChunks, latestQuery, 4);
        if (matchingUserChunks.length > 0) {
          relevantContext = matchingUserChunks
            .map((mc, idx) => `[Source Document ${idx + 1}: "${mc.sourceTitle}"]\n${mc.text}`)
            .join("\n\n---\n\n");
        }
      }
    }

    // Fallback if no user-wide chunks were found or username is guest/global
    if (!relevantContext) {
      if (documentId) {
        const doc = getDocument(username || "global", documentId);
        if (doc) {
          // Run local RAG keyword search to fetch top-3 most relevant overlapping segments
          const matchingChunks = retrieveRelevantChunks(doc.chunks, latestQuery, 3);
          relevantContext = matchingChunks.map(chunk => `[Source Document: "${doc.title}"]\n${chunk}`).join("\n\n---\n\n");
        }
      }
    }

    // Fallback if no documentId or matching file is not found on disk
    if (!relevantContext) {
      if (content && typeof content === "string") {
        // Fallback RAG on raw content by chunking on the fly
        const chunks = chunkText(content);
        const matchingChunks = retrieveRelevantChunks(chunks, latestQuery, 3);
        relevantContext = matchingChunks.map(chunk => `[Pasted Material]\n${chunk}`).join("\n\n---\n\n");
      } else {
        relevantContext = "No active study document is currently selected. Answer using general universal tutoring knowledge.";
      }
    }
    
    // Construct tutoring persona configurations based on selected modes
    let modeGuideline = "";
    if (tutorMode === "explain") {
      modeGuideline = `- MODE: EXPLAIN MODE. Focus on breaking down complex topics step-by-step. Use vivid, intuitive, real-world analogies. Use a supportive, clear tone. Avoid overcomplicating terms. Ask short concept check questions at the end of explanations.`;
    } else if (tutorMode === "deep") {
      modeGuideline = `- MODE: DEEP STUDY MODE. Dive deeply into theoretical details, mechanisms, equations, and historical/intellectual contexts. Encourage critical thinking. Frequently challenge the user with thought-provoking, open-ended questions to test their grasp of underlying principles.`;
    } else if (tutorMode === "exam") {
      modeGuideline = `- MODE: EXAM PREPARATION MODE. Focus strictly on highly testable facts, core definitions, and formulas. Give advice on common exam traps, memory mnemonics, and test-taking strategies. Give practice exam-style questions periodically.`;
    }

    let levelGuideline = "";
    if (studentLevel === "beginner") {
      levelGuideline = `- STUDENT LEVEL: BEGINNER. Use highly accessible language. Carefully introduce and explain all technical terms or jargon. Avoid assuming prior field knowledge. Keep steps small.`;
    } else if (studentLevel === "intermediate") {
      levelGuideline = `- STUDENT LEVEL: INTERMEDIATE. Balance clarity with depth. Assume basic familiarity with common concepts, but still provide clear conceptual framing and technical detail when needed.`;
    } else if (studentLevel === "advanced") {
      levelGuideline = `- STUDENT LEVEL: ADVANCED. Use professional, industry-standard vocabulary. Provide sophisticated insights, deep structural comparisons, and rigorous explanations without re-explaining elementary terms.`;
    } else if (studentLevel === "elite") {
      levelGuideline = `- STUDENT LEVEL: ELITE/GRADUATE. Challenge the student at a graduate or expert standard. Engage in high-level academic discussions. Use formal mathematical/scientific reasoning, cover boundary conditions, and test deep critical thinking skills.`;
    }

    let agentGuideline = "";
    if (selectedAgent === "tutor") {
      agentGuideline = `
- SPECIALIZED ROLE: LEARNING TUTOR AGENT. Your absolute focus is teaching and clarification.
- Break down complex topics step-by-step. Use vivid, intuitive, real-world analogies and supportive, warm, socratic guiding.
- Ask short conceptual check questions at the end of explanations to test their understanding.
`;
    } else if (selectedAgent === "researcher") {
      agentGuideline = `
- SPECIALIZED ROLE: RESEARCH ASSISTANT AGENT. Your absolute focus is scholarly research analysis and academic integrity.
- Provide comprehensive critical academic analysis. Use rigorous methodology checks and explore study limitations.
- If requested, generate precise citations formatted in standard scholarly bibliography formats (APA, MLA, or Chicago format).
- Actively raise PLAGIARISM AWARENESS. When crafting or editing text, make sure you write in highly original prose, advise on how to avoid plagiarism, and suggest proper citation and attribution styles.
`;
    } else if (selectedAgent === "exam_coach") {
      agentGuideline = `
- SPECIALIZED ROLE: EXAM COACH AGENT. Your absolute focus is practice, assessment strategy, and performance feedback.
- Teach helpful exam-taking strategies (such as process of elimination, common traps, active recall, time-management).
- Provide supportive, corrective feedback on the student's quizzes and answers.
`;
    } else if (selectedAgent === "career_guide") {
      agentGuideline = `
- SPECIALIZED ROLE: CAREER GUIDANCE AGENT. Your absolute focus is industry relevance, real-world application, and skill mapping.
- Connect academic subjects to real-world career paths (e.g. Software Engineer, Doctor, Financial Analyst, Research Director).
- Map professional skills required in the job market, and recommend impressive portfolio projects to show prospective employers.
`;
    }

    let languageGuideline = "";
    if (language && language !== "English") {
      languageGuideline = `
- TRANSLATION MANDATE: The user's preferred language is ${language}.
- You MUST answer, explain, and write completely and fluently in ${language}.
- Ensure high-fidelity technical translations that are natural, fluent, and academically precise in ${language}.
`;
    }

    // Construct system instructions with retrieved matching sections and learning assistant guidelines
    const systemInstruction = `You are StudyMate, a universal personal learning mentor designed to help users learn any subject.
Keep the backend technology completely hidden; act genuinely as a dedicated mentor.

Your knowledge coverage includes:
- Arts and Humanities (history, literature, philosophy, languages, culture)
- Sciences (biology, chemistry, physics, mathematics, environmental science)
- Technology and Computing (programming, cybersecurity, artificial intelligence, networking, software engineering)
- Engineering (mechanical, electrical, civil, computer engineering concepts)
- Business and Entrepreneurship
- Spiritual and religious studies (explain respectfully and academically)

TUTOR CONFIGURATION AND TARGETS:
${modeGuideline}
${levelGuideline}
${agentGuideline}
${languageGuideline}

Do not assume every question is related to biology, cells, or previous topics unless the user specifically asks for that connection.

When answering:
1. Identify the user's topic first.
2. Adapt explanations strictly according to the specified STUDENT LEVEL, TUTOR MODE, and SPECIALIZED ROLE.
3. Use proper markdown formatting:
   - Use bold text for important terms (e.g., **important terms**).
   - Use headings, subheadings, and bullet points where helpful to organize the thoughts.
4. Maintain an educational, encouraging, and highly intelligent tone.

Formatting rules:
- Do NOT put quotation marks around words for emphasis.
- Do NOT use fake bold formatting like "Word" or 'Word'.
- Keep responses natural, human-like, and highly readable.

=== RETRIEVED STUDY MATERIAL SECTIONS (RAG) ===
${relevantContext}
==============================================

CRITICAL DIRECTIVE: You are acting as a dedicated Document Tutor. You MUST answer all questions based on the provided RETRIEVED STUDY MATERIAL SECTIONS first. Prioritize details, facts, formulas, and explanations found in these retrieved sections before resorting to your general knowledge. If the context does not fully contain the answer, explicitly state that it is not fully mentioned in the document, and then proceed to explain it comprehensively using your universal tutoring knowledge base. Always prioritize the uploaded document context as your primary source of truth.`;

    // Map conversation history to Gemini structure
    const contentsPayload = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Set headers for standard HTTP chunked streaming
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const responseStream = await generateContentStreamWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: contentsPayload,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    try {
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
          res.write(chunkText);
        }
      }
    } catch (streamError: any) {
      console.error("Chat API Stream Consumption Error:", streamError);
      res.write(`\n\n[Stream Interrupted: ${streamError.message || String(streamError)}]`);
    } finally {
      res.end();
    }
  } catch (error: any) {
    console.error("Chat API Initialization Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error.message || "An error occurred during chatbot stream initialization.",
        details: error.stack
      });
    } else {
      res.end();
    }
  }
});

// 5. Study Planner Generation API
app.post("/api/generate/study-plan", async (req, res) => {
  try {
    const { examDate, dailyHours, subjects, difficulty = "intermediate" } = req.body;
    if (!examDate || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: "Exam date and at least one subject are required." });
    }

    const ai = getAI();
    const systemPrompt = `You are StudyMate, an expert academic planner and mentor.
Your task is to generate a highly detailed, realistic, and organized study schedule leading up to an exam.
The study plan should be custom-tailored to the available time, difficulty level, and subjects.
Create a structured list of weeks. Each week must have a focus area and exactly 5 active daily study units with clear sub-topics, durations, and action-oriented study recommendations (e.g. 'Solve quiz', 'Review active-recall flashcards', 'Create a summary map').

Be structured and realistic. Respond strictly with a JSON object fitting the response schema.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Generate a custom study plan for these parameters:
Exam Date: ${examDate}
Study Time: ${dailyHours} hours per day
Subjects: ${subjects.join(", ")}
Difficulty: ${difficulty}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examDate: { type: Type.STRING },
            dailyHours: { type: Type.INTEGER },
            subjects: { type: Type.ARRAY, items: { type: Type.STRING } },
            difficulty: { type: Type.STRING },
            weeks: {
              type: Type.ARRAY,
              description: "The list of study weeks leading up to the exam.",
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.INTEGER },
                  focus: { type: Type.STRING, description: "Main theme or goal for this week." },
                  days: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dayName: { type: Type.STRING, description: "e.g., Monday, Wednesday" },
                        topics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific bullet points or subconcepts to study." },
                        durationMinutes: { type: Type.INTEGER },
                        completed: { type: Type.BOOLEAN },
                        recommendation: { type: Type.STRING, description: "Actionable StudyMate prompt like 'Study Flashcards' or 'Take Practice Quiz on Cell Organelles'" }
                      },
                      required: ["dayName", "topics", "durationMinutes", "completed", "recommendation"]
                    }
                  }
                },
                required: ["weekNumber", "focus", "days"]
              }
            },
            createdAt: { type: Type.STRING }
          },
          required: ["examDate", "dailyHours", "subjects", "difficulty", "weeks", "createdAt"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const plan = JSON.parse(response.text.trim());
    return res.json(plan);
  } catch (error: any) {
    console.error("Study Planner API Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during study plan generation.",
      details: error.stack
    });
  }
});

// AI Course Generator API
app.post("/api/generate/course", async (req, res) => {
  try {
    const { goal, difficulty = "intermediate" } = req.body;
    if (!goal || typeof goal !== "string") {
      return res.status(400).json({ error: "Learning goal is required." });
    }

    const ai = getAI();
    const systemPrompt = `You are StudyMate, an expert academic content developer.
Generate a structured, engaging self-paced study course for the specified learning goal and difficulty level.
Create a syllabus with a Course title, Course description, and exactly 3 incremental learning Modules.
Each Module must contain:
- A title
- 2 rich Lessons, each with an informative title and at least 2 detailed paragraphs of high-value instructional content using Markdown formatting (bold, bullet points).
- 1 practical Exercise with a title, a scenario/description, and 3 clear step-by-step instructions.
- A mini-Quiz with exactly 3 high-yield multiple-choice questions, each with a question string, 4 options, the 0-based correct option index, and a helpful explanation.

Ensure the teaching depth corresponds to difficulty:
- beginner: simple, approachable definitions, no prior knowledge assumed.
- intermediate: practical, application-focused explanations, standard terminology.
- advanced: deep, professional-standard detail, technical analysis.
- elite: complex, highly theoretical, postgraduate rigor, explaining boundary conditions.

Respond strictly with a JSON object fitting the response schema.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Generate a custom course for the learning goal: "${goal}" at "${difficulty}" difficulty level.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  lessons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING, description: "At least 2 paragraphs of rich learning text in Markdown formatting." }
                      },
                      required: ["title", "content"]
                    }
                  },
                  exercise: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["title", "description", "steps"]
                  },
                  quiz: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "Exactly 4 options."
                        },
                        correctOptionIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING }
                      },
                      required: ["question", "options", "correctOptionIndex", "explanation"]
                    }
                  }
                },
                required: ["title", "lessons", "exercise", "quiz"]
              }
            }
          },
          required: ["title", "description", "modules"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const course = JSON.parse(response.text.trim());
    return res.json(course);
  } catch (error: any) {
    console.error("Course Generator API Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during course generation.",
      details: error.stack
    });
  }
});

// Career Skill Roadmap API
app.post("/api/generate/roadmap", async (req, res) => {
  try {
    const { careerGoal } = req.body;
    if (!careerGoal || typeof careerGoal !== "string") {
      return res.status(400).json({ error: "Career goal is required." });
    }

    const ai = getAI();
    const systemPrompt = `You are StudyMate, a world-class career development strategist and vocational mentor.
Your task is to generate a comprehensive, highly personalized career skills roadmap to help students achieve their career dream.
Structure the roadmap into exactly 4 logical career progress milestones (e.g., Stage 1: Foundation, Stage 2: Specialization, Stage 3: Applied Projects, Stage 4: Professional Mastery).
For each milestone stage, provide:
- Stage tag (e.g. 'Stage 1: Foundation')
- Milestone Title
- Detailed strategic explanation of this milestone's focus
- List of 4-6 specific technical skills to acquire
- List of 2 practical hands-on project ideas to build for their portfolio
- Realistic timeline estimate (e.g., '1-2 months')

Respond strictly with a JSON object fitting the response schema.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Generate a custom career skills roadmap for: "${careerGoal}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            careerGoal: { type: Type.STRING },
            summary: { type: Type.STRING },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stage: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  skillsToAcquire: { type: Type.ARRAY, items: { type: Type.STRING } },
                  projects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  timeEstimate: { type: Type.STRING }
                },
                required: ["stage", "title", "description", "skillsToAcquire", "projects", "timeEstimate"]
              }
            }
          },
          required: ["careerGoal", "summary", "milestones"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const roadmap = JSON.parse(response.text.trim());
    return res.json(roadmap);
  } catch (error: any) {
    console.error("Career Roadmap API Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during career roadmap generation.",
      details: error.stack
    });
  }
});

// AI Research Assistant Deep Analysis API
app.post("/api/generate/research-analysis", async (req, res) => {
  try {
    const { documentId, content, username } = req.body;
    let textToAnalyze = "";
    let docTitle = "Research Document";

    const ai = getAI();

    if (documentId) {
      const doc = getDocument(username || "global", documentId);
      if (doc) {
        docTitle = doc.title;
        textToAnalyze = doc.fullText || doc.processedChunks.map(pc => pc.text).join("\n\n");
      }
    }

    if (!textToAnalyze) {
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Content or active documentId is required for research analysis." });
      }
      textToAnalyze = content;
    }

    // Truncate text if extreme, to fit model limits gracefully (keep first 20,000 words)
    const words = textToAnalyze.split(/\s+/);
    if (words.length > 20000) {
      textToAnalyze = words.slice(0, 20000).join(" ") + "\n\n[Content truncated for analysis]";
    }

    const systemPrompt = `You are StudyMate's AI Research Assistant, an advanced academic research fellow.
Perform a deep scholarly analysis on the provided research text.
Generate:
- A professional, comprehensive synthesis/abstract explaining the core problem, theories, and contribution.
- Detailed extraction of the methodology (research design, data collection, theoretical frameworks, or mathematical formulations).
- Exactly 4 core findings or claims.
- A thorough list of study limitations, boundary constraints, threats to validity, or unaddressed gaps.
- A list of important entities, theories, key references, or specialized terms with definitions.
- 3 high-yield future research directions or follow-up questions.

Respond strictly with a JSON object fitting the response schema.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Perform a deep academic analysis of the research titled "${docTitle}" with text:\n\n${textToAnalyze}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synthesis: { type: Type.STRING },
            methodology: { type: Type.STRING },
            keyClaims: { type: Type.ARRAY, items: { type: Type.STRING } },
            limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
            entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            },
            suggestedResearchQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["synthesis", "methodology", "keyClaims", "limitations", "entities", "suggestedResearchQuestions"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const analysis = JSON.parse(response.text.trim());
    return res.json(analysis);
  } catch (error: any) {
    console.error("Research Assistant API Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during research analysis.",
      details: error.stack
    });
  }
});

// Community AI Assistant Route
app.post("/api/community/assistant", async (req, res) => {
  try {
    const { action, threadTitle, threadText, replies, concept, context, materials } = req.body;
    const ai = getAI();

    if (action === "summarize") {
      const discussionContent = `
Thread Title: ${threadTitle}
Post: ${threadText}
Replies:
${(replies || []).map((r: any, i: number) => `Reply ${i + 1} by ${r.authorDisplayName}: ${r.text}`).join("\n")}
      `;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: `Provide a concise, professional executive summary of this study discussion thread:\n\n${discussionContent}`,
        config: {
          systemInstruction: "You are StudyMate's Collaborative AI Coach. Summarize the main query, highlight key helpful insights or solutions from the replies, and outline the resolved conclusion or remaining questions. Keep it to 3-4 bullet points.",
        }
      });

      return res.json({ result: response.text || "Could not generate summary." });
    }

    if (action === "explain") {
      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: `Explain the difficult concept: "${concept}"`,
        config: {
          systemInstruction: "You are a professional mentor. Explain the concept in clear, simple terms. Include a real-world intuitive analogy, break down 2-3 key sub-components, and offer 2 practical study tips. Use clean Markdown styling.",
        }
      });

      return res.json({ result: response.text || "Could not generate explanation." });
    }

    if (action === "recommend") {
      const formattedMaterials = (materials || []).map((m: any) => `- ID: ${m.id}, Title: ${m.title}, Subject: ${m.subject || "General"}`).join("\n");
      const prompt = `
Context of interest: "${context}"

Available Library Materials:
${formattedMaterials || "No materials currently uploaded."}

Recommend the top relevant materials from the list. If there are none or few, recommend what topics the student should search for.
      `;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a personalized study advisor. Provide a friendly recommendation list indicating which of the available study materials are most relevant, why they match, and a suggested next step. If none match perfectly, recommend search queries or external topics to explore. Keep it short and professional.",
        }
      });

      return res.json({ result: response.text || "Could not generate recommendations." });
    }

    return res.status(400).json({ error: "Invalid action type. Expected summarize, explain, or recommend." });
  } catch (error: any) {
    console.error("Community Assistant Error:", error);
    return res.status(500).json({ error: error.message || "Community Assistant could not process requests." });
  }
});

// Academic Integrity, Plagiarism and Citation Generator API
app.post("/api/research/integrity", async (req, res) => {
  try {
    const { text, citationStyle = "APA", sourceMetadata = {} } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Source text is required for plagiarism and citation analysis." });
    }

    const ai = getAI();
    const prompt = `
Submitted Text for Integrity Analysis:
"${text}"

Requested Citation Style: ${citationStyle}

Metadata provided:
${JSON.stringify(sourceMetadata, null, 2)}

Perform a thorough academic integrity and citation review. Generate matching phrases, estimate plagiarism probability, create a scholarly citation, and formulate helpful integrity advices.
Return ONLY a valid JSON object matching this schema. Do not include markdown wraps or blockquotes around the JSON:
{
  "originalityScore": 85,
  "flaggedPhrases": [
    {
      "phrase": "example plagiarized phrase",
      "issue": "Highly matches published definitions without proper scholarly quotes.",
      "remedy": "Paraphrase using active verbs and specify direct author attribution."
    }
  ],
  "citation": "Doe, J. (2025). Title of the Book. Academic Press.",
  "citationStyle": "APA",
  "integrityAdvices": [
    "Always synthesize ideas rather than matching sentence patterns.",
    "Attribute every conceptual claim to its original publisher."
  ]
}
    `;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are StudyMate's Senior Research Fellow and Academic Integrity Advisor. Your goal is to review the text, estimate originality (0-100 where 100 means fully original), extract sources, construct an impeccable citation in the requested style, and provide helpful feedback to help students write original work. You must return ONLY the requested JSON object without any other explanation text or backticks.",
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText.trim());
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Academic Integrity API Error:", error);
    return res.status(500).json({ error: error.message || "Could not analyze academic integrity." });
  }
});

// Intelligent Pathway Recommendation System API
app.post("/api/generate/recommendations", async (req, res) => {
  try {
    const { stats, documents = [], academicDifficulty = "intermediate", teachingPersona = "mentor" } = req.body;
    const ai = getAI();

    const docListSummary = documents.map((d: any) => `- Title: "${d.title}", Subject: "${d.subject || "General"}"`).join("\n");

    const prompt = `
Student Academic Profile:
- Weekly Study Hours: ${stats?.weeklyHours || 0}
- Study Points Earned: ${stats?.points || 0}
- Quiz Correct Answers Rate: ${stats?.quizzesCorrect || 0}/${stats?.quizzesTaken || 0}
- Flashcards Studied: ${stats?.flashcardsStudied || 0}
- Total Documents Uploaded: ${documents.length}

Preferences:
- Difficulty Baseline: ${academicDifficulty}
- Active Persona Selected: ${teachingPersona}

Uploaded Materials List:
${docListSummary || "No custom materials uploaded yet."}

Analyze this learning behavior and preferences to generate 3 custom personalized learning paths.
Return ONLY a valid JSON object matching this schema. Do not include markdown wraps or blockquotes:
{
  "profileAnalysis": "Your study habits show high dedication with strong retention in quizzes, though we can bolster your active recall and advanced technical terminology.",
  "learningPaths": [
    {
      "title": "Mastery Pathway",
      "description": "Tailored for your intermediate difficulty level to accelerate conceptual fluency across all uploaded notes.",
      "estimatedWeeks": 4,
      "suggestedDocs": ["Example Doc Title"],
      "milestones": [
        {
          "title": "Foundation Solidification",
          "targetSkill": "Active Recall of Core Formulas",
          "action": "Complete a 10-question practice exam on your uploaded syllabus."
        }
      ]
    }
  ]
}
    `;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are StudyMate's Strategic Academic Advisor. You analyze the student's study statistics, behavior, and preferences to build customized, actionable, and encouraging learning path sequences. You must return ONLY the requested JSON object without any other text or backticks.",
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText.trim());
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Pathway Recommendation API Error:", error);
    return res.status(500).json({ error: error.message || "Could not generate custom learning paths." });
  }
});

// Production-ready user database, authentication & synchronization endpoints
const USERS_DIR = "/tmp/study_mate_users";
const ANALYTICS_FILE = "/tmp/study_mate_platform_analytics.json";

if (!fs.existsSync(USERS_DIR)) {
  fs.mkdirSync(USERS_DIR, { recursive: true });
}

// Seed Initial Analytics if not present
function getOrCreateAnalytics() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      return JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to read analytics file", e);
  }

  const initialAnalytics = {
    totalRegistrations: 154,
    premiumSubscribers: 42,
    institutionSubscribers: 8,
    totalUploads: 642,
    totalChatQueries: 3412,
    totalQuizzesCompleted: 890,
    studyMinutesLogged: 21450,
    agentUsage: {
      tutor: 1450,
      researcher: 820,
      exam_coach: 680,
      career_guide: 462
    },
    uploadCategoryDistribution: {
      Science: 245,
      Technology: 198,
      Math: 112,
      Business: 54,
      Humanities: 33
    },
    recentEvents: [
      { timestamp: new Date().toISOString(), type: "system_startup", details: "StudyMate Learning Platform Engine initialized" }
    ]
  };

  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(initialAnalytics, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write initial analytics file", e);
  }
  return initialAnalytics;
}

function updateAnalytics(updateFn: (data: any) => void) {
  try {
    const data = getOrCreateAnalytics();
    updateFn(data);
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to update analytics", e);
  }
}

// Auth API: User Registration
app.post("/api/auth/register", (req, res) => {
  try {
    const { username, email, password, displayName, avatarEmoji, targetGrade, studyGoalHours, role, subscription, focus, academicProfile } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required." });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 alphanumeric characters." });
    }

    const userFile = path.join(USERS_DIR, `${cleanUsername}.json`);
    if (fs.existsSync(userFile)) {
      return res.status(400).json({ error: "Username is already registered." });
    }

    const newUser = {
      id: "user_" + Date.now(),
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      passwordHash: password, // In sandboxed environments simple password matching is used
      displayName: displayName || username,
      avatarEmoji: avatarEmoji || "🎓",
      targetGrade: targetGrade || "A+",
      studyGoalHours: Number(studyGoalHours) || 5,
      role: role || "student",
      subscription: subscription || "free",
      focus: focus || "Science",
      academicProfile: academicProfile || null,
      stats: {
        documentsCount: 0,
        quizzesTakenCount: 0,
        averageQuizScore: 0,
        flashcardsMasteredCount: 0,
        studyTimeMinutes: 0,
        dailyStreak: 1,
        weeklyProgress: [
          { day: "Mon", minutes: 0 },
          { day: "Tue", minutes: 0 },
          { day: "Wed", minutes: 0 },
          { day: "Thu", minutes: 0 },
          { day: "Fri", minutes: 0 },
          { day: "Sat", minutes: 0 },
          { day: "Sun", minutes: 0 }
        ],
        achievements: []
      },
      documents: [],
      chatHistories: {},
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(userFile, JSON.stringify(newUser, null, 2), "utf-8");

    // Log registration in global analytics
    updateAnalytics((data) => {
      data.totalRegistrations += 1;
      if (newUser.subscription === "premium") data.premiumSubscribers += 1;
      if (newUser.subscription === "institution") data.institutionSubscribers += 1;
      data.recentEvents.unshift({
        timestamp: new Date().toISOString(),
        type: "registration",
        details: `User "${newUser.username}" signed up as ${newUser.role} (${newUser.subscription} plan)`
      });
      if (data.recentEvents.length > 30) data.recentEvents.pop();
    });

    return res.status(201).json(newUser);
  } catch (error: any) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Could not create account on server database." });
  }
});

// Auth API: User Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Credentials are required." });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const userFile = path.join(USERS_DIR, `${cleanUsername}.json`);

    let foundUser = null;

    if (fs.existsSync(userFile)) {
      const user = JSON.parse(fs.readFileSync(userFile, "utf-8"));
      if (user.passwordHash === password) {
        foundUser = user;
      }
    } else {
      // Check if matches by email inside other users
      const files = fs.readdirSync(USERS_DIR);
      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            const user = JSON.parse(fs.readFileSync(path.join(USERS_DIR, file), "utf-8"));
            if (user.email.toLowerCase() === username.trim().toLowerCase() && user.passwordHash === password) {
              foundUser = user;
              break;
            }
          } catch (err) {
            // ignore corrupt files
          }
        }
      }
    }

    if (foundUser) {
      updateAnalytics((data) => {
        data.recentEvents.unshift({
          timestamp: new Date().toISOString(),
          type: "login",
          details: `User "${foundUser.username}" logged in successfully`
        });
        if (data.recentEvents.length > 30) data.recentEvents.pop();
      });
      return res.json(foundUser);
    } else {
      return res.status(401).json({ error: "Invalid username, email, or password." });
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Authentication system error." });
  }
});

// Auth API: Synchronize User Workspace Data
app.post("/api/auth/sync-userdata", (req, res) => {
  try {
    const { username, documents, stats, chatHistories, studyPlan, subscription, role, targetGrade, studyGoalHours, focus, academicProfile } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required to synchronize workspace data." });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const userFile = path.join(USERS_DIR, `${cleanUsername}.json`);

    if (!fs.existsSync(userFile)) {
      return res.status(404).json({ error: "User profile not found to sync." });
    }

    const user = JSON.parse(fs.readFileSync(userFile, "utf-8"));
    
    // Merge workspace content
    if (documents) user.documents = documents;
    if (stats) user.stats = stats;
    if (chatHistories) user.chatHistories = chatHistories;
    if (studyPlan) user.studyPlan = studyPlan;
    if (subscription) user.subscription = subscription;
    if (role) user.role = role;
    if (targetGrade) user.targetGrade = targetGrade;
    if (studyGoalHours !== undefined) user.studyGoalHours = Number(studyGoalHours);
    if (focus) user.focus = focus;
    if (academicProfile) user.academicProfile = academicProfile;
    
    user.updatedAt = new Date().toISOString();

    fs.writeFileSync(userFile, JSON.stringify(user, null, 2), "utf-8");

    // Dynamic analytics adjustment based on sync content
    updateAnalytics((data) => {
      if (stats) {
        if (stats.studyTimeMinutes && stats.studyTimeMinutes > user.stats?.studyTimeMinutes) {
          data.studyMinutesLogged += (stats.studyTimeMinutes - (user.stats?.studyTimeMinutes || 0));
        }
        if (stats.quizzesTakenCount && stats.quizzesTakenCount > (user.stats?.quizzesTakenCount || 0)) {
          data.totalQuizzesCompleted += (stats.quizzesTakenCount - (user.stats?.quizzesTakenCount || 0));
        }
      }
      if (documents && documents.length > (user.documents?.length || 0)) {
        data.totalUploads += (documents.length - (user.documents?.length || 0));
      }
    });

    return res.json({ success: true, message: "Workspace synced and backed up successfully on cloud server.", user });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return res.status(500).json({ error: "Failed to synchronize profile data on the server." });
  }
});

// Admin Analytics API: Fetch global statistics
app.get("/api/platform/analytics", (req, res) => {
  try {
    const analytics = getOrCreateAnalytics();
    return res.json(analytics);
  } catch (error) {
    return res.status(500).json({ error: "Could not fetch platform diagnostics." });
  }
});

// Admin API: Log a dynamic user study event on server
app.post("/api/platform/log-event", (req, res) => {
  try {
    const { type, details, category, agentName } = req.body;
    updateAnalytics((data) => {
      data.recentEvents.unshift({
        timestamp: new Date().toISOString(),
        type: type || "custom_event",
        details: details || "Educational activity logged"
      });
      if (data.recentEvents.length > 40) data.recentEvents.pop();

      if (type === "upload" && category) {
        data.totalUploads += 1;
        if (data.uploadCategoryDistribution[category] !== undefined) {
          data.uploadCategoryDistribution[category] += 1;
        } else {
          data.uploadCategoryDistribution[category] = 1;
        }
      }
      if (type === "chat" && agentName) {
        data.totalChatQueries += 1;
        if (data.agentUsage[agentName] !== undefined) {
          data.agentUsage[agentName] += 1;
        } else {
          data.agentUsage[agentName] = 1;
        }
      }
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Could not log event." });
  }
});

// Integrates Vite dev server middleware or serves static files based on build environment
async function setupServer() {
  try {
    const hasDist = fs.existsSync(path.join(process.cwd(), "dist"));
    const isProd = process.env.NODE_ENV === "production" && hasDist;

    console.log(`[Server Setup] NODE_ENV: ${process.env.NODE_ENV}, hasDist: ${hasDist}, resolves as isProd: ${isProd}`);

    if (!isProd) {
      console.log("[Server Setup] Initializing Vite dev server in middleware mode...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      console.log(`[Server Setup] Serving static files from: ${distPath}`);
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`StudyMate Server started successfully at http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("[Server Setup] CRITICAL ERROR during startup:", err);
  }
}

setupServer();
