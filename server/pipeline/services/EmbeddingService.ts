/**
 * EmbeddingService.ts
 * Generates vector embeddings for semantic document chunks using Google GenAI API (text-embedding-004 / gemini-embedding-2-preview).
 * Handles batching, exponential retry, database storage, and status tracking.
 */

import { GoogleGenAI } from "@google/genai";
import { SemanticChunk } from "./ChunkingService.js";
import pkg from "pg";
const { Client } = pkg;

export interface ChunkEmbeddingResult {
  chunkId: string;
  embedding: number[];
  tokenCount?: number;
  error?: string;
}

export interface EmbeddingBatchProgress {
  totalChunks: number;
  embeddedChunks: number;
  failedChunks: number;
  averageEmbeddingTimeMs: number;
  totalDurationMs: number;
  model: string;
}

function getDbClient() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  return new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
}

export class EmbeddingService {
  private aiClient: GoogleGenAI | null = null;
  private defaultModel = "text-embedding-004";
  private fallbackModel = "gemini-embedding-2-preview";

  private getAI(): GoogleGenAI {
    if (!this.aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required for EmbeddingService.");
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
   * Generates a 768-dimensional vector embedding for a single text input.
   */
  public async generateEmbedding(text: string, maxRetries = 2): Promise<number[]> {
    const ai = this.getAI();
    let attempt = 0;
    let currentModel = this.defaultModel;

    const sanitizedText = text.trim();
    if (!sanitizedText) {
      return new Array(768).fill(0);
    }

    while (true) {
      try {
        const response: any = await ai.models.embedContent({
          model: currentModel,
          contents: sanitizedText,
        });

        const embeddingValues = response.embedding?.values || response.embeddings?.[0]?.values;
        if (embeddingValues && embeddingValues.length > 0) {
          return embeddingValues;
        }

        throw new Error("Empty embedding returned from Gemini API.");
      } catch (error: any) {
        attempt++;
        const errorMessage = error?.message || String(error);

        const isTransient =
          errorMessage.includes("503") ||
          errorMessage.includes("429") ||
          errorMessage.includes("UNAVAILABLE") ||
          errorMessage.includes("RESOURCE_EXHAUSTED");

        if (isTransient) {
          if (attempt <= maxRetries) {
            const delay = Math.pow(2, attempt) * 500;
            await new Promise((res) => setTimeout(res, delay));
            continue;
          }

          if (currentModel !== this.fallbackModel) {
            console.warn(`Switching embedding model from ${currentModel} to fallback ${this.fallbackModel}...`);
            currentModel = this.fallbackModel;
            attempt = 0;
            continue;
          }
        }

        console.error(`Failed to generate embedding for text snippet "${sanitizedText.substring(0, 40)}...":`, errorMessage);
        throw error;
      }
    }
  }

  /**
   * Embeds a list of semantic chunks in batches, saving embeddings into PostgreSQL document_chunks table.
   */
  public async embedDocumentChunks(
    documentId: string,
    userId: string,
    chunks: SemanticChunk[],
    options: { batchSize?: number; forceReembed?: boolean } = {}
  ): Promise<{
    embeddedCount: number;
    failedCount: number;
    durationMs: number;
    progress: EmbeddingBatchProgress;
  }> {
    const startTime = Date.now();
    const batchSize = options.batchSize || 4;
    let embeddedCount = 0;
    let failedCount = 0;
    let totalEmbeddingTimeMs = 0;

    console.log(`🚀 [EmbeddingService] Starting embedding generation for ${chunks.length} chunks (docId: ${documentId})...`);

    const dbClient = getDbClient();
    if (dbClient) {
      try {
        await dbClient.connect();
        // Ensure embedding columns exist in document_chunks
        await dbClient.query(`
          ALTER TABLE public.document_chunks ADD COLUMN IF NOT EXISTS embedding JSONB;
          ALTER TABLE public.document_chunks ADD COLUMN IF NOT EXISTS embedding_model TEXT;
          ALTER TABLE public.document_chunks ADD COLUMN IF NOT EXISTS embedding_timestamp TIMESTAMPTZ;
          ALTER TABLE public.document_chunks ADD COLUMN IF NOT EXISTS vector_version TEXT DEFAULT 'v1';
        `);
      } catch (err) {
        console.warn("⚠️ Warning checking embedding DB column:", err);
      }
    }

    // Process chunks in batch groups
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (chunk) => {
          const chunkStartTime = Date.now();
          const chunkId = (chunk as any).id || chunk.chunk_id || `${documentId}_chunk_${chunk.chunk_number}`;

          try {
            // Text to embed includes heading + content for maximum semantic ground
            const textToEmbed = chunk.heading
              ? `Heading: ${chunk.heading}\n\n${chunk.content}`
              : chunk.content;

            const embeddingVector = await this.generateEmbedding(textToEmbed);
            const chunkDuration = Date.now() - chunkStartTime;
            totalEmbeddingTimeMs += chunkDuration;

            // Store in Postgres DB
            if (dbClient) {
              await dbClient.query(
                `UPDATE public.document_chunks
                 SET embedding = $1::jsonb,
                     embedding_model = $2,
                     embedding_timestamp = NOW(),
                     vector_version = 'v1'
                 WHERE id = $3 AND user_id = $4`,
                [JSON.stringify(embeddingVector), this.defaultModel, chunkId, userId]
              );
            }

            // Update attached metadata on chunk object
            (chunk as any).metadata = {
              ...(chunk.metadata || {}),
              embeddingModel: this.defaultModel,
              embeddingTimestamp: new Date().toISOString(),
              embeddingLength: embeddingVector.length,
            };

            embeddedCount++;
          } catch (err: any) {
            failedCount++;
            console.error(`❌ Failed to embed chunk #${chunk.chunk_number} (${chunkId}):`, err?.message);
          }
        })
      );

      // Brief yield pause between batches to respect API quota limits
      if (i + batchSize < chunks.length) {
        await new Promise((res) => setTimeout(res, 200));
      }
    }

    if (dbClient) {
      try {
        await dbClient.end();
      } catch (e) {}
    }

    const totalDurationMs = Date.now() - startTime;
    const avgTime = embeddedCount > 0 ? Math.round(totalEmbeddingTimeMs / embeddedCount) : 0;

    console.log(`✅ [EmbeddingService] Completed embedding for doc ${documentId}: ${embeddedCount} embedded, ${failedCount} failed in ${totalDurationMs}ms.`);

    const progress: EmbeddingBatchProgress = {
      totalChunks: chunks.length,
      embeddedChunks: embeddedCount,
      failedChunks: failedCount,
      averageEmbeddingTimeMs: avgTime,
      totalDurationMs,
      model: this.defaultModel,
    };

    return {
      embeddedCount,
      failedCount,
      durationMs: totalDurationMs,
      progress,
    };
  }

  /**
   * Fetch embedding status for a given document
   */
  public async getEmbeddingStatus(
    documentId: string,
    userId: string
  ): Promise<{
    totalChunks: number;
    embeddedChunks: number;
    failedChunks: number;
    model: string;
    vectorVersion: string;
  }> {
    const dbClient = getDbClient();
    if (!dbClient) {
      return { totalChunks: 0, embeddedChunks: 0, failedChunks: 0, model: this.defaultModel, vectorVersion: "v1" };
    }

    try {
      await dbClient.connect();
      const res = await dbClient.query(
        `SELECT
           COUNT(*) as total,
           COUNT(embedding) as embedded,
           COUNT(*) - COUNT(embedding) as pending
         FROM public.document_chunks
         WHERE document_id = $1 AND user_id = $2`,
        [documentId, userId]
      );

      const total = parseInt(res.rows[0]?.total || "0", 10);
      const embedded = parseInt(res.rows[0]?.embedded || "0", 10);
      const pending = parseInt(res.rows[0]?.pending || "0", 10);

      return {
        totalChunks: total,
        embeddedChunks: embedded,
        failedChunks: pending,
        model: this.defaultModel,
        vectorVersion: "v1",
      };
    } catch (err) {
      console.warn("⚠️ Embedding status DB query error:", err);
      return { totalChunks: 0, embeddedChunks: 0, failedChunks: 0, model: this.defaultModel, vectorVersion: "v1" };
    } finally {
      try { await dbClient.end(); } catch (e) {}
    }
  }
}

export const embeddingService = new EmbeddingService();
