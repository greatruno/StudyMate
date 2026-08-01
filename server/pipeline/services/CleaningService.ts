/**
 * CleaningService.ts
 * Module responsible for cleaning and normalizing extracted text:
 * - Removes duplicate whitespace and control characters
 * - Removes page numbers, repeated headers & footers
 * - Normalizes quotes, dashes, spacing, and paragraph boundaries
 */

export interface CleaningResult {
  cleanedText: string;
  originalCharCount: number;
  cleanedCharCount: number;
  linesRemovedCount: number;
  cleaningLog: string;
}

export class CleaningService {
  /**
   * Clean raw text from documents
   */
  public cleanText(rawText: string): CleaningResult {
    if (!rawText) {
      return {
        cleanedText: "",
        originalCharCount: 0,
        cleanedCharCount: 0,
        linesRemovedCount: 0,
        cleaningLog: "No text provided for cleaning."
      };
    }

    const originalCharCount = rawText.length;
    let lines = rawText.split(/\r?\n/);
    const initialLineCount = lines.length;

    // 1. Remove repeated header / footer patterns
    const headerFooterCounts = new Map<string, number>();
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length > 5 && trimmed.length < 80) {
        headerFooterCounts.set(trimmed, (headerFooterCounts.get(trimmed) || 0) + 1);
      }
    });

    // Identify repeated lines that appear more than 3 times (likely headers/footers)
    const repeatedPatterns = new Set<string>();
    headerFooterCounts.forEach((count, pattern) => {
      if (count >= 4) {
        repeatedPatterns.add(pattern);
      }
    });

    // Filter lines
    const cleanedLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Remove invalid unicode / control characters (keep newlines and standard unicode)
      line = line.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");

      // Normalize unicode quotes and dashes
      line = line
        .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
        .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
        .replace(/[\u2013\u2014\u2015]/g, "-")
        .replace(/\u00A0/g, " "); // non-breaking space to standard space

      const trimmed = line.trim();

      // Check if line is a page number or footer
      if (this.isPageNumberOrFooter(trimmed)) {
        continue;
      }

      // Check if line is a repeated header/footer
      if (repeatedPatterns.has(trimmed)) {
        continue;
      }

      cleanedLines.push(line);
    }

    // 2. Normalize paragraph spacing and consecutive empty lines
    let cleanedText = cleanedLines.join("\n");

    // Replace 3+ consecutive newlines with double newline (paragraph boundary)
    cleanedText = cleanedText.replace(/\n{3,}/g, "\n\n");

    // Replace multiple spaces/tabs with single space (except leading indentation for code/lists)
    cleanedText = cleanedText
      .split("\n")
      .map((l) => {
        const indentMatch = l.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : "";
        const rest = l.substring(indent.length).replace(/[ \t]+/g, " ");
        return indent + rest;
      })
      .join("\n")
      .trim();

    const cleanedCharCount = cleanedText.length;
    const linesRemovedCount = initialLineCount - cleanedLines.length;

    return {
      cleanedText,
      originalCharCount,
      cleanedCharCount,
      linesRemovedCount,
      cleaningLog: `Cleaned text: removed ${linesRemovedCount} noise lines/page numbers/headers. Reduced from ${originalCharCount} to ${cleanedCharCount} characters.`
    };
  }

  private isPageNumberOrFooter(line: string): boolean {
    if (!line) return false;

    // Pattern: "Page 1", "Page 1 of 12", "1 / 15", "- 4 -", "[ 5 ]", "Page 10/24"
    if (/^page\s+\d+(\s+(of|\/)\s+\d+)?$/i.test(line)) return true;
    if (/^\d+\s*[\/\-]\s*\d+$/.test(line)) return true;
    if (/^[\-\[\(]\s*\d+\s*[\-\]\)]$/.test(line)) return true;
    if (/^\d+$/.test(line) && line.length <= 3) return true;

    return false;
  }
}

export const cleaningService = new CleaningService();
