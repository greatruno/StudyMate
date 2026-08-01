/**
 * collaboration.routes.ts
 * Express API routes for Phase 4.1 - Real-Time Collaboration & Social Learning Platform.
 */

import { Router, Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";

const router = Router();

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in AI Studio settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Helper with retries
async function generateContentWithRetry(ai: GoogleGenAI, params: any) {
  let attempt = 0;
  let model = params.model || "gemini-3.5-flash";
  const backups = ["gemini-flash-latest", "gemini-3.1-flash-lite"];

  while (true) {
    try {
      return await ai.models.generateContent({ ...params, model });
    } catch (err: any) {
      attempt++;
      if (attempt <= 2 && backups.length > 0) {
        model = backups.shift() || model;
        continue;
      }
      throw err;
    }
  }
}

/**
 * POST /api/v1/collaboration/group-ai/tutor
 * Grounded Group AI Tutor query route
 */
router.post("/group-ai/tutor", async (req: Request, res: Response) => {
  try {
    const { groupName, query, sharedDocuments, recentChat, notes } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required for Group AI Tutor." });
    }

    const ai = getAI();

    const formattedDocs = (sharedDocuments || []).map((d: any, i: number) => 
      `Document ${i + 1} ["${d.title}"]: ${d.content ? d.content.substring(0, 1500) : "No text content"}`
    ).join("\n\n---\n\n");

    const formattedNotes = (notes || []).map((n: any, i: number) =>
      `Note ${i + 1} ["${n.title}"]: ${n.content ? n.content.substring(0, 1500) : "Empty note"}`
    ).join("\n\n---\n\n");

    const formattedChat = (recentChat || []).slice(-8).map((m: any) =>
      `${m.senderDisplayName || m.senderUsername}: ${m.text}`
    ).join("\n");

    const systemPrompt = `You are StudyMate's Group AI Tutor for the study group "${groupName || "Study Group"}".
Your goal is to answer questions for members of this study group strictly grounded in their shared documents, collaborative notes, and group discussions.
Always cite your source materials when answering (e.g. "According to Document 1..." or "As noted in your study note...").
Provide clear, educational, and structured explanations with bullet points and practical analogies.`;

    const userPrompt = `
STUDENT GROUP QUERY:
"${query}"

GROUP SHARED DOCUMENTS:
${formattedDocs || "No documents uploaded to this group yet."}

GROUP COLLABORATIVE NOTES:
${formattedNotes || "No collaborative notes created yet."}

RECENT GROUP CHAT DISCUSSION:
${formattedChat || "No recent chat history."}

Please provide a grounded, comprehensive answer, referencing the group materials where relevant.
`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt
      }
    });

    return res.json({
      success: true,
      answer: response.text || "I was unable to process your query against the group materials.",
      groundedSources: (sharedDocuments || []).map((d: any) => d.title)
    });
  } catch (err: any) {
    console.error("Group AI Tutor Error:", err);
    return res.status(500).json({ error: err.message || "Failed to query Group AI Tutor." });
  }
});

/**
 * POST /api/v1/collaboration/group-ai/recap-session
 * AI-generated Study Session Recap
 */
router.post("/group-ai/recap-session", async (req: Request, res: Response) => {
  try {
    const { sessionTitle, sessionNotes, agenda, attendees } = req.body;
    const ai = getAI();

    const prompt = `
Study Session Title: "${sessionTitle || "Study Session"}"

Attendees Present: ${(attendees || []).map((a: any) => a.displayName || a.username).join(", ") || "Group members"}

Agenda Covered:
${(agenda || []).map((ag: any) => `- [${ag.completed ? "X" : " "}] ${ag.itemText}`).join("\n")}

Session Workspace Notes & Chat:
${sessionNotes || "No notes logged during session."}

Generate a structured study session recap in JSON format.
`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are StudyMate's AI Session Secretary. Synthesize the study session into a concise summary, key topics covered, action items for next session, and recommended follow-up topics.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            topicsCovered: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedNextTopics: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "topicsCovered", "actionItems", "recommendedNextTopics"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return res.json({ success: true, recap: parsed });
  } catch (err: any) {
    console.error("Session Recap Error:", err);
    return res.status(500).json({ error: err.message || "Could not generate session recap." });
  }
});

/**
 * POST /api/v1/collaboration/group-ai/summarize-discussion
 * Summarize live group chat / discussions
 */
router.post("/group-ai/summarize-discussion", async (req: Request, res: Response) => {
  try {
    const { groupName, messages } = req.body;
    const ai = getAI();

    const formattedMessages = (messages || []).map((m: any) => `${m.senderDisplayName || m.senderUsername}: ${m.text}`).join("\n");

    const prompt = `
Group Name: "${groupName || "Study Group"}"
Chat Messages:
${formattedMessages || "No messages provided."}

Summarize key study points discussed in this chat conversation.
`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are StudyMate's AI Group Coach. Extract 3-5 high-yield key takeaways and questions answered in the discussion.",
      }
    });

    return res.json({ success: true, summary: response.text || "No summary available." });
  } catch (err: any) {
    console.error("Summarize Discussion Error:", err);
    return res.status(500).json({ error: err.message || "Failed to summarize discussion." });
  }
});

export default router;
