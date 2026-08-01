/**
 * GroundedChatService.ts
 * Implements Retrieval-Augmented Generation (RAG) Grounded Chat Engine using Google GenAI SDK.
 * Workflow: Question -> Embed -> Vector Search -> Context Builder -> Grounded Gemini Generation -> Citation Attachment.
 */

import { GoogleGenAI } from "@google/genai";
import { vectorSearchService, VectorSearchResult } from "./VectorSearchService.js";
import { contextBuilderService, BuiltContext } from "./ContextBuilderService.js";
import { citationService, CitationSource } from "./CitationService.js";
import { memoryService } from "../../services/MemoryService.js";

export interface GroundedChatOptions {
  question: string;
  userId: string;
  documentId?: string;
  topK?: number;
  tutorMode?: "explain" | "deep" | "exam";
  studentLevel?: "beginner" | "intermediate" | "advanced" | "elite";
  chatHistory?: { role: string; text: string }[];
}

export interface GroundedChatResponse {
  answer: string;
  answerWithCitations: string;
  groundedInDocuments: boolean;
  retrievedChunksCount: number;
  sources: CitationSource[];
  citationsFormatted: string;
  searchLatencyMs: number;
  totalLatencyMs: number;
}

export class GroundedChatService {
  private aiClient: GoogleGenAI | null = null;

  private getAI(): GoogleGenAI {
    if (!this.aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return this.aiClient;
  }

  /**
   * Executes a Grounded RAG Chat query with full retrieval, context building, AI generation, and citations.
   */
  public async query(options: GroundedChatOptions): Promise<GroundedChatResponse> {
    const startTime = Date.now();
    const { question, userId, documentId, topK = 5, tutorMode = "explain", studentLevel = "intermediate" } = options;

    console.log(`🤖 [GroundedChatService] Processing grounded query: "${question}" (docId: ${documentId || "all"}, level: ${studentLevel})`);

    // 1. Perform Vector Similarity Search
    const searchRes = await vectorSearchService.search(question, {
      userId,
      documentId,
      topK,
      minSimilarityScore: 0.15,
    });

    const searchLatencyMs = searchRes.latencyMs;
    const retrievedChunks = searchRes.results;

    // 2. Build Context & Retrieve Learner Memory Profile
    const builtContext: BuiltContext = contextBuilderService.buildContext(retrievedChunks);
    const hasSufficientContext = retrievedChunks.length > 0 && builtContext.formattedContextText !== "NO_DOCUMENTS_RETRIEVED";

    // Asynchronously extract new memories from user question
    memoryService.extractAndSaveMemory(userId, question, "chat_query").catch(() => {});

    // Retrieve active Learner Profile
    const profile = await memoryService.getLearnerProfile(userId).catch(() => null);

    const memoryFactsText = profile?.persistentMemories
      ? profile.persistentMemories.map(m => `• [${m.memoryType.toUpperCase()}] ${m.topic}: ${m.content}`).join("\n")
      : "• No custom memory facts recorded yet.";

    // 3. Construct Personalized System Prompt
    const systemPrompt = `You are StudyMate, an expert personalized academic tutor and AI study assistant.
Your top priority is grounding your answers in the user's provided study material context, tailored specifically to the learner's evolving personal profile.

LEARNER ACADEMIC PROFILE:
- Major / Degree: ${profile?.academicField || "General Studies"}
- Skill Level: ${studentLevel}
- Preferred Explanation Style: ${profile?.preferredExplanationStyle || "Step-by-step with practical examples"}
- Known Weak Topics: ${profile?.weakTopics.join(", ") || "None flagged yet"}
- Known Strong Topics: ${profile?.strongTopics.join(", ") || "None"}

PERSISTENT LEARNING MEMORY FACTS:
${memoryFactsText}

STRICT GROUNDING & PERSONALIZATION RULES:
1. Prioritize facts, definitions, formulas, and explanations explicitly stated in the provided Study Material Context below.
2. Adapt explanation depth to the learner's preferred style (${profile?.preferredExplanationStyle || "clear and structured"}). If learner struggles with weak topics (e.g., ${profile?.weakTopics[0] || "complex math"}), offer an extra step-by-step breakdown or practical analogy.
3. If the user's question CANNOT be answered using the uploaded study materials, state clearly as the very first sentence:
   "I couldn't find enough information in your uploaded study materials."
4. After stating that, you MAY provide additional helpful information in a distinct, separate section explicitly labeled:
   "**General Knowledge**"
5. Keep your explanations highly structured and clear. Use bullet points and bold headers.`;

    const userPromptText = `
USER QUESTION:
${question}

STUDY MATERIAL CONTEXT RETRIEVED FROM USER'S DOCUMENTS:
${builtContext.formattedContextText}

Please answer the question according to the strict grounding rules above.
`;

    // 4. Generate Content with Gemini AI
    const ai = this.getAI();
    let rawAnswer = "";
    let groundedInDocuments = hasSufficientContext;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPromptText,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2, // Low temperature for factual precision
        },
      });

      rawAnswer = response.text || "I was unable to process your query against the study materials.";
      if (rawAnswer.includes("couldn't find enough information in your uploaded study materials")) {
        groundedInDocuments = false;
      }
    } catch (err: any) {
      console.error("❌ GroundedChatService Gemini API error:", err);
      rawAnswer = `I encountered an error analyzing your study materials: ${err?.message || "Internal AI Error"}`;
      groundedInDocuments = false;
    }

    // 5. Attach Citations using CitationService
    const citationSources: CitationSource[] = builtContext.sourcesUsed;
    const citationResult = citationService.attachCitationsToAnswer(
      rawAnswer,
      groundedInDocuments ? citationSources : []
    );

    const totalLatencyMs = Date.now() - startTime;

    return {
      answer: rawAnswer,
      answerWithCitations: citationResult.answerWithCitations,
      groundedInDocuments,
      retrievedChunksCount: retrievedChunks.length,
      sources: citationSources,
      citationsFormatted: citationResult.formattedCitationBlock,
      searchLatencyMs,
      totalLatencyMs,
    };
  }

  /**
   * Stream a Grounded RAG Chat query with citations appended at the end
   */
  public async streamQuery(
    options: GroundedChatOptions,
    onChunk: (textChunk: string) => void
  ): Promise<GroundedChatResponse> {
    const startTime = Date.now();
    const { question, userId, documentId, topK = 5, tutorMode = "explain", studentLevel = "intermediate" } = options;

    // 1. Vector Search
    const searchRes = await vectorSearchService.search(question, {
      userId,
      documentId,
      topK,
      minSimilarityScore: 0.15,
    });

    const searchLatencyMs = searchRes.latencyMs;
    const retrievedChunks = searchRes.results;

    // 2. Build Context & Retrieve Learner Profile
    const builtContext: BuiltContext = contextBuilderService.buildContext(retrievedChunks);
    const hasSufficientContext = retrievedChunks.length > 0 && builtContext.formattedContextText !== "NO_DOCUMENTS_RETRIEVED";

    memoryService.extractAndSaveMemory(userId, question, "chat_stream").catch(() => {});
    const streamProfile = await memoryService.getLearnerProfile(userId).catch(() => null);

    // 3. Personalized System Prompt
    const systemPrompt = `You are StudyMate, an expert personalized academic tutor and AI study assistant.
Your top priority is grounding your answers in the user's provided study material context, tailored specifically to the learner's personal profile.

LEARNER ACADEMIC PROFILE:
- Major / Degree: ${streamProfile?.academicField || "General Studies"}
- Skill Level: ${studentLevel}
- Preferred Explanation Style: ${streamProfile?.preferredExplanationStyle || "Step-by-step with practical examples"}
- Known Weak Topics: ${streamProfile?.weakTopics.join(", ") || "None"}

STRICT GROUNDING & PERSONALIZATION RULES:
1. Prioritize facts, definitions, formulas, and explanations explicitly stated in the provided Study Material Context below.
2. Adapt explanation depth to the learner's preferred style (${streamProfile?.preferredExplanationStyle || "clear and structured"}).
3. If the user's question CANNOT be answered using the uploaded study materials, state clearly as the very first sentence:
   "I couldn't find enough information in your uploaded study materials."
4. After stating that, you MAY provide additional helpful information in a distinct, separate section explicitly labeled:
   "**General Knowledge**"
5. Keep your explanations highly structured, clear, and adapted to the ${studentLevel} academic level.`;

    const userPromptText = `
USER QUESTION:
${question}

STUDY MATERIAL CONTEXT RETRIEVED FROM USER'S DOCUMENTS:
${builtContext.formattedContextText}

Please answer the question according to the strict grounding rules above.
`;

    // 4. Stream Gemini response
    const ai = this.getAI();
    let accumulatedText = "";

    try {
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: userPromptText,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text || "";
        if (text) {
          accumulatedText += text;
          onChunk(text);
        }
      }
    } catch (err: any) {
      const errText = `\n\n[Error retrieving study materials response: ${err?.message || "AI Stream Error"}]`;
      accumulatedText += errText;
      onChunk(errText);
    }

    const groundedInDocuments = hasSufficientContext && !accumulatedText.includes("couldn't find enough information in your uploaded study materials");

    // 5. Append citations at the end of the stream
    const citationSources: CitationSource[] = builtContext.sourcesUsed;
    let citationsFormatted = "";

    if (groundedInDocuments && citationSources.length > 0) {
      citationsFormatted = citationService.formatCitations(citationSources);
      onChunk(citationsFormatted);
    }

    const totalLatencyMs = Date.now() - startTime;

    return {
      answer: accumulatedText,
      answerWithCitations: accumulatedText + citationsFormatted,
      groundedInDocuments,
      retrievedChunksCount: retrievedChunks.length,
      sources: citationSources,
      citationsFormatted,
      searchLatencyMs,
      totalLatencyMs,
    };
  }
}

export const groundedChatService = new GroundedChatService();
