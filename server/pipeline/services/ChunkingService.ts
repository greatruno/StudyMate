/**
 * ChunkingService.ts
 * Semantic Chunking Service.
 * Breaks down documents along logical semantic boundaries (headings, paragraph groups,
 * concepts, explanations, formulas, exercises, tables, code blocks) instead of fixed token sizes.
 */

import crypto from "crypto";

export interface SemanticChunk {
  chunk_id: string;
  document_id: string;
  chunk_number: number;
  heading: string;
  content: string;
  chunk_type: "heading" | "concept" | "explanation" | "procedure" | "formula" | "exercise" | "table" | "code";
  token_count: number;
  character_count: number;
  page_reference: number;
  metadata: {
    sectionLevel?: number;
    parentHeading?: string;
    hasMath?: boolean;
    hasCode?: boolean;
    keyTerms?: string[];
    lineRange?: [number, number];
  };
}

export interface ChunkingResult {
  chunks: SemanticChunk[];
  totalChunkCount: number;
  averageChunkTokenCount: number;
  chunkingLog: string;
}

export class ChunkingService {
  /**
   * Semantically chunk cleaned text into structured logical blocks
   */
  public generateSemanticChunks(
    cleanedText: string,
    documentId: string,
    totalEstimatedPages: number = 1
  ): ChunkingResult {
    if (!cleanedText || !cleanedText.trim()) {
      return {
        chunks: [],
        totalChunkCount: 0,
        averageChunkTokenCount: 0,
        chunkingLog: "No text available for semantic chunking."
      };
    }

    const lines = cleanedText.split("\n");
    const chunks: SemanticChunk[] = [];
    let chunkNumber = 1;

    let currentHeading = "General Content";
    let currentHeadingLevel = 1;
    let currentBuffer: string[] = [];
    let startLineIndex = 0;
    let inCodeBlock = false;
    let inTable = false;

    const flushBuffer = (
      overrideType?: SemanticChunk["chunk_type"],
      customHeading?: string
    ) => {
      if (currentBuffer.length === 0) return;

      const content = currentBuffer.join("\n").trim();
      if (!content) return;

      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const tokenCount = Math.ceil(wordCount * 1.3); // Approximate token count
      const characterCount = content.length;

      // Classify semantic chunk type
      const chunkType = overrideType || this.classifyChunkType(content);

      // Estimate page number based on line index relative to total lines
      const totalLines = lines.length || 1;
      const avgLine = (startLineIndex + (startLineIndex + currentBuffer.length)) / 2;
      const pageReference = Math.min(
        totalEstimatedPages,
        Math.max(1, Math.ceil((avgLine / totalLines) * totalEstimatedPages))
      );

      // Extract key terms inside chunk
      const keyTerms = this.extractKeyTerms(content);

      const chunkId = `chk_${documentId}_${chunkNumber}_${crypto.randomBytes(3).toString("hex")}`;

      chunks.push({
        chunk_id: chunkId,
        document_id: documentId,
        chunk_number: chunkNumber++,
        heading: customHeading || currentHeading,
        content,
        chunk_type: chunkType,
        token_count: tokenCount,
        character_count: characterCount,
        page_reference: pageReference,
        metadata: {
          sectionLevel: currentHeadingLevel,
          parentHeading: currentHeading,
          hasMath: /\\begin|\\int|\$\$|\$[^\$]+\$/.test(content),
          hasCode: /```|function|class|import|def|var|let|const/.test(content),
          keyTerms,
          lineRange: [startLineIndex, startLineIndex + currentBuffer.length]
        }
      });

      currentBuffer = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle Code Block boundary
      if (trimmed.startsWith("```")) {
        if (!inCodeBlock) {
          // Flush existing text before starting code block
          flushBuffer();
          inCodeBlock = true;
          startLineIndex = i;
          currentBuffer.push(line);
        } else {
          // End code block
          currentBuffer.push(line);
          inCodeBlock = false;
          flushBuffer("code");
        }
        continue;
      }

      if (inCodeBlock) {
        currentBuffer.push(line);
        continue;
      }

      // Handle Markdown Heading or Slide Heading
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      const isSlideHeader = trimmed.startsWith("--- Slide ");

      if (headingMatch || isSlideHeader) {
        // Heading boundary: flush preceding paragraph group
        flushBuffer();

        if (headingMatch) {
          currentHeadingLevel = headingMatch[1].length;
          currentHeading = headingMatch[2].trim();
        } else if (isSlideHeader) {
          currentHeadingLevel = 1;
          currentHeading = trimmed.replace(/---/g, "").trim();
        }

        startLineIndex = i;
        currentBuffer.push(line);
        // Flush heading itself as a heading-type chunk
        flushBuffer("heading");
        continue;
      }

      // Handle Table boundary
      if (/^\|.*\|$/.test(trimmed) || /^[\+-]{3,}/.test(trimmed)) {
        if (!inTable) {
          flushBuffer();
          inTable = true;
          startLineIndex = i;
        }
        currentBuffer.push(line);
        continue;
      } else if (inTable) {
        inTable = false;
        flushBuffer("table");
      }

      // Handle Paragraph / Concept / Formula Boundaries
      if (trimmed === "") {
        // Empty line signifies logical paragraph group boundary
        if (currentBuffer.length > 0) {
          flushBuffer();
        }
        continue;
      }

      if (currentBuffer.length === 0) {
        startLineIndex = i;
      }

      currentBuffer.push(line);

      // If buffer accumulated substantial semantic size (~120-200 words), flush at sentence boundary
      const bufferWordCount = currentBuffer.join(" ").split(/\s+/).filter(Boolean).length;
      if (bufferWordCount >= 180 && /[.\?!:]\s*$/.test(trimmed)) {
        flushBuffer();
      }
    }

    // Flush any remaining content
    flushBuffer();

    const totalTokenCount = chunks.reduce((acc, c) => acc + c.token_count, 0);
    const averageChunkTokenCount = chunks.length > 0 ? Math.round(totalTokenCount / chunks.length) : 0;

    return {
      chunks,
      totalChunkCount: chunks.length,
      averageChunkTokenCount,
      chunkingLog: `Semantically chunked document into ${chunks.length} logical blocks (average ${averageChunkTokenCount} tokens/chunk).`
    };
  }

  private classifyChunkType(content: string): SemanticChunk["chunk_type"] {
    const lower = content.toLowerCase();

    if (/^(#{1,6}\s+|--- slide)/i.test(content)) return "heading";

    // Formulas & Math
    if (/\\begin|\\int|\\sum|\\frac|\$\$.*?\$\$|equation|theorem/i.test(content)) {
      return "formula";
    }

    // Code blocks
    if (/```|def |function |class |import |public static void/i.test(content)) {
      return "code";
    }

    // Tables
    if (/^\|.*\|/m.test(content)) return "table";

    // Exercises & Questions
    if (/\b(question|exercise|problem|practice|quiz|test|what is|how to|explain why)\b/i.test(lower) || /\?\s*$/.test(content)) {
      return "exercise";
    }

    // Concepts & Definitions
    if (/\b(definition|defined as|refers to|concept|means that|key term|principle)\b/i.test(lower)) {
      return "concept";
    }

    // Procedures & Instructions
    if (/\b(step \d+|first,|second,|finally,|procedure|algorithm|process|instructions)\b/i.test(lower)) {
      return "procedure";
    }

    return "explanation";
  }

  private extractKeyTerms(content: string): string[] {
    const words = content.match(/\b[A-Z][a-zA-Z]{3,}\b|\b[a-z]{6,}\b/g) || [];
    const counts = new Map<string, number>();

    const stopWords = new Set(["section", "chapter", "example", "figure", "number", "following", "content", "system"]);

    words.forEach((w) => {
      const lower = w.toLowerCase();
      if (!stopWords.has(lower)) {
        counts.set(w, (counts.get(w) || 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])
      .slice(0, 5);
  }
}

export const chunkingService = new ChunkingService();
