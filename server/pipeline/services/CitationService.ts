/**
 * CitationService.ts
 * Formats, attaches, and verifies precise document citations for Grounded RAG responses.
 */

export interface CitationSource {
  documentId: string;
  documentTitle: string;
  pageReference: number;
  heading: string;
  chunkNumber: number;
}

export class CitationService {
  /**
   * Formats a list of citation sources into a clean markdown reference block.
   */
  public formatCitations(sources: CitationSource[]): string {
    if (!sources || sources.length === 0) {
      return "";
    }

    // Deduplicate identical sources
    const uniqueMap = new Map<string, CitationSource>();
    for (const src of sources) {
      const key = `${src.documentTitle}_p${src.pageReference}_c${src.chunkNumber}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, src);
      }
    }

    const citationsList = Array.from(uniqueMap.values());

    const formattedLines = citationsList.map((src, idx) => {
      const title = src.documentTitle || "Study Material";
      const page = src.pageReference || 1;
      const section = src.heading && src.heading !== "Section" ? src.heading : "Main Section";
      const chunk = src.chunkNumber || 1;

      return `**[Citation ${idx + 1}]**\n• Source: **${title}**\n• Page: **${page}**\n• Section: **${section}**\n• Chunk: **${chunk}**`;
    });

    return `\n\n---\n### 📚 Verified Citations & Study Material References\n\n${formattedLines.join("\n\n")}`;
  }

  /**
   * Attaches formatted citations to an AI response if citations are present and not already formatted.
   */
  public attachCitationsToAnswer(answer: string, sources: CitationSource[]): {
    answerWithCitations: string;
    formattedCitationBlock: string;
    sourcesCount: number;
  } {
    if (!sources || sources.length === 0) {
      return {
        answerWithCitations: answer,
        formattedCitationBlock: "",
        sourcesCount: 0,
      };
    }

    const formattedCitationBlock = this.formatCitations(sources);
    
    // Avoid appending duplicate citation blocks if AI already included citation headers
    let finalAnswer = answer.trim();
    if (!finalAnswer.includes("Verified Citations") && !finalAnswer.includes("📚 Citation")) {
      finalAnswer += formattedCitationBlock;
    }

    return {
      answerWithCitations: finalAnswer,
      formattedCitationBlock,
      sourcesCount: sources.length,
    };
  }
}

export const citationService = new CitationService();
