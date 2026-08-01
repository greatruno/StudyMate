/**
 * VectorSearchService.ts
 * Performs vector similarity search (cosine similarity) on document chunk embeddings for RAG queries.
 */

import { embeddingService } from "./EmbeddingService.js";
import pkg from "pg";
const { Client } = pkg;

export interface VectorSearchResult {
  chunkId: string;
  documentId: string;
  documentTitle?: string;
  chunkNumber: number;
  heading: string;
  content: string;
  pageReference: number;
  similarityScore: number;
  tokenCount: number;
  chunkType?: string;
}

export interface VectorSearchOptions {
  documentId?: string;
  userId: string;
  topK?: number;
  minSimilarityScore?: number;
}

function getDbClient() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  return new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
}

/**
 * Calculates cosine similarity between two numeric vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  const sim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, sim)); // clamp between 0 and 1
}

export class VectorSearchService {
  /**
   * Search relevant chunks for a user question using vector embedding cosine similarity
   */
  public async search(query: string, options: VectorSearchOptions): Promise<{
    query: string;
    topK: number;
    latencyMs: number;
    results: VectorSearchResult[];
  }> {
    const startTime = Date.now();
    const topK = options.topK || 5;
    const minScore = options.minSimilarityScore || 0.1;

    console.log(`🔍 [VectorSearchService] Searching query: "${query}" (topK: ${topK}, docId: ${options.documentId || "all"})...`);

    // 1. Generate query embedding vector
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    const results: VectorSearchResult[] = [];

    // 2. Fetch chunks from Postgres DB
    const dbClient = getDbClient();
    if (dbClient) {
      try {
        await dbClient.connect();

        let sql = `
          SELECT c.id, c.document_id, c.chunk_number, c.heading, c.content,
                 c.page_reference, c.token_count, c.chunk_type, c.embedding,
                 d.file_name as document_title
          FROM public.document_chunks c
          LEFT JOIN public.documents d ON c.document_id = d.id
          WHERE c.user_id = $1 AND c.embedding IS NOT NULL
        `;
        const params: any[] = [options.userId];

        if (options.documentId) {
          sql += ` AND c.document_id = $2`;
          params.push(options.documentId);
        }

        const queryRes = await dbClient.query(sql, params);

        for (const row of queryRes.rows) {
          let chunkVector: number[] = [];
          if (Array.isArray(row.embedding)) {
            chunkVector = row.embedding;
          } else if (typeof row.embedding === "string") {
            try { chunkVector = JSON.parse(row.embedding); } catch (e) {}
          } else if (row.embedding && typeof row.embedding === "object") {
            chunkVector = row.embedding;
          }

          if (chunkVector && chunkVector.length > 0) {
            const score = cosineSimilarity(queryEmbedding, chunkVector);
            if (score >= minScore) {
              results.push({
                chunkId: row.id,
                documentId: row.document_id,
                documentTitle: row.document_title || "Document",
                chunkNumber: row.chunk_number,
                heading: row.heading || "Section",
                content: row.content,
                pageReference: row.page_reference || 1,
                similarityScore: Math.round(score * 1000) / 1000,
                tokenCount: row.token_count || 0,
                chunkType: row.chunk_type,
              });
            }
          }
        }
      } catch (dbErr) {
        console.warn("⚠️ Postgres vector search query issue:", dbErr);
      } finally {
        try { await dbClient.end(); } catch (e) {}
      }
    }

    // Sort descending by similarity score
    results.sort((a, b) => b.similarityScore - a.similarityScore);
    const topResults = results.slice(0, topK);

    const latencyMs = Date.now() - startTime;
    console.log(`✅ [VectorSearchService] Found ${topResults.length} relevant chunks in ${latencyMs}ms. Top score: ${topResults[0]?.similarityScore || 0}`);

    return {
      query,
      topK,
      latencyMs,
      results: topResults,
    };
  }
}

export const vectorSearchService = new VectorSearchService();
