/**
 * ContextBuilderService.ts
 * Assembles and optimizes retrieved document chunks into a structured, clean context block for Grounded RAG Generation.
 * Handles deduplication, heading hierarchy preservation, page reference tracking, and token budget management.
 */

import { VectorSearchResult } from "./VectorSearchService.js";

export interface BuiltContext {
  formattedContextText: string;
  includedChunkIds: string[];
  totalTokensApprox: number;
  sourcesUsed: {
    documentId: string;
    documentTitle: string;
    pageReference: number;
    heading: string;
    chunkNumber: number;
  }[];
}

export class ContextBuilderService {
  /**
   * Build an optimized context payload from retrieved search chunks
   */
  public buildContext(
    chunks: VectorSearchResult[],
    maxTokenBudget = 3500
  ): BuiltContext {
    if (!chunks || chunks.length === 0) {
      return {
        formattedContextText: "NO_DOCUMENTS_RETRIEVED",
        includedChunkIds: [],
        totalTokensApprox: 0,
        sourcesUsed: [],
      };
    }

    // 1. Deduplicate chunks by chunkId
    const seenChunkIds = new Set<string>();
    const uniqueChunks: VectorSearchResult[] = [];

    for (const chunk of chunks) {
      if (!seenChunkIds.has(chunk.chunkId)) {
        seenChunkIds.add(chunk.chunkId);
        uniqueChunks.push(chunk);
      }
    }

    // 2. Sort logically: Group by documentTitle/documentId, then by pageReference and chunkNumber
    uniqueChunks.sort((a, b) => {
      if (a.documentId !== b.documentId) {
        return (a.documentTitle || "").localeCompare(b.documentTitle || "");
      }
      if (a.pageReference !== b.pageReference) {
        return a.pageReference - b.pageReference;
      }
      return a.chunkNumber - b.chunkNumber;
    });

    // 3. Assemble formatted context block while respecting maxTokenBudget
    const contextBlocks: string[] = [];
    const includedChunkIds: string[] = [];
    const sourcesUsed: BuiltContext["sourcesUsed"] = [];
    let currentTokenEstimate = 0;

    for (const chunk of uniqueChunks) {
      // Rough token estimate: ~4 chars per token
      const chunkTokenEstimate = Math.ceil(chunk.content.length / 4) + 40;

      if (currentTokenEstimate + chunkTokenEstimate > maxTokenBudget && contextBlocks.length > 0) {
        console.warn(`[ContextBuilderService] Reached token limit budget (${maxTokenBudget}). Truncating remaining chunks.`);
        break;
      }

      const title = chunk.documentTitle || "Study Document";
      const heading = chunk.heading || "Section";
      const page = chunk.pageReference || 1;
      const scorePercent = Math.round((chunk.similarityScore || 0) * 100);

      const blockHeader = `--- SOURCE: "${title}" | Page: ${page} | Section: "${heading}" | Chunk #${chunk.chunkNumber} | Relevancy: ${scorePercent}% ---`;
      const blockBody = chunk.content;

      contextBlocks.push(`${blockHeader}\n${blockBody}`);
      includedChunkIds.push(chunk.chunkId);

      sourcesUsed.push({
        documentId: chunk.documentId,
        documentTitle: title,
        pageReference: page,
        heading,
        chunkNumber: chunk.chunkNumber,
      });

      currentTokenEstimate += chunkTokenEstimate;
    }

    const formattedContextText = contextBlocks.join("\n\n");

    return {
      formattedContextText,
      includedChunkIds,
      totalTokensApprox: currentTokenEstimate,
      sourcesUsed,
    };
  }
}

export const contextBuilderService = new ContextBuilderService();
