/**
 * MetadataService.ts
 * Module responsible for detecting document structural elements and extracting
 * comprehensive academic & technical metadata.
 */

export interface DocumentStructure {
  detectedTitle?: string;
  hasSubtitle: boolean;
  headingsCount: number;
  sectionsCount: number;
  tablesCount: number;
  codeBlocksCount: number;
  mathExpressionsCount: number;
  bulletListsCount: number;
  hasReferences: boolean;
  hasAppendices: boolean;
  detectedHeadings: { level: number; text: string; lineIndex: number }[];
}

export interface DocumentMetadata {
  title: string;
  author?: string;
  language: string;
  subject: string;
  academicField: string;
  keywords: string[];
  estimatedReadingTimeMinutes: number;
  estimatedDifficulty: "Beginner" | "Intermediate" | "Advanced" | "Specialized";
  pageCount: number;
  wordCount: number;
  characterCount: number;
  sectionCount: number;
  tableCount: number;
  imageCount: number;
  codeBlockCount: number;
  mathExpressionCount: number;
  uploadTimestamp: string;
  processingTimestamp: string;
  structure: DocumentStructure;
}

export class MetadataService {
  /**
   * Analyze cleaned text and build rich document metadata and structure summary
   */
  public generateMetadata(
    cleanedText: string,
    fileName: string,
    pageCount: number = 1,
    uploadTimestamp?: string
  ): DocumentMetadata {
    const lines = cleanedText.split("\n");
    const words = cleanedText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const characterCount = cleanedText.length;

    // Detect structure
    const structure = this.detectStructure(lines, fileName);

    // Title selection
    const title = structure.detectedTitle || fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

    // Estimate language
    const language = this.detectLanguage(cleanedText);

    // Classify academic domain & keywords
    const { academicField, subject, keywords } = this.classifyDomainAndKeywords(cleanedText, fileName);

    // Estimate difficulty level
    const estimatedDifficulty = this.calculateDifficulty(words, cleanedText);

    // Estimate reading time (average 200 words per minute)
    const estimatedReadingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

    const now = new Date().toISOString();

    return {
      title,
      language,
      subject,
      academicField,
      keywords,
      estimatedReadingTimeMinutes,
      estimatedDifficulty,
      pageCount,
      wordCount,
      characterCount,
      sectionCount: structure.sectionsCount,
      tableCount: structure.tablesCount,
      imageCount: (cleanedText.match(/!\[.*?\]\(.*?\)|\[Figure\s+\d+\]|\[Image\s+\d+\]/gi) || []).length,
      codeBlockCount: structure.codeBlocksCount,
      mathExpressionCount: structure.mathExpressionsCount,
      uploadTimestamp: uploadTimestamp || now,
      processingTimestamp: now,
      structure
    };
  }

  private detectStructure(lines: string[], fileName: string): DocumentStructure {
    let detectedTitle: string | undefined;
    let headingsCount = 0;
    let tablesCount = 0;
    let codeBlocksCount = 0;
    let mathExpressionsCount = 0;
    let bulletListsCount = 0;
    let hasReferences = false;
    let hasAppendices = false;
    const detectedHeadings: { level: number; text: string; lineIndex: number }[] = [];

    let inCodeBlock = false;
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check code block markers (``` or indent)
      if (line.startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        if (inCodeBlock) codeBlocksCount++;
        continue;
      }

      // Check math expressions ($...$ or $$...$$ or \begin{equation})
      if (/\\begin\{(equation|align|matrix)\}/i.test(line) || /\$\$.*?\$\$/.test(line) || /\\[a-zA-Z]+\{[^}]+\}/.test(line)) {
        mathExpressionsCount++;
      }

      if (inCodeBlock) continue;

      // Check table markdown or ascii representation
      if (/^\|.*\|$/.test(line) || /^[\+-]{3,}/.test(line)) {
        if (!inTable) {
          tablesCount++;
          inTable = true;
        }
      } else {
        inTable = false;
      }

      // Check bullet lists
      if (/^[\*\-\+]\s+/.test(line) || /^\d+[\.\)]\s+/.test(line)) {
        bulletListsCount++;
      }

      // Check Headings (Markdown # or Slide headers or ALL CAPS lines)
      if (line.startsWith("#")) {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2].trim();
          headingsCount++;
          if (level === 1 && !detectedTitle && i < 15) {
            detectedTitle = text;
          }
          detectedHeadings.push({ level, text, lineIndex: i });
        }
      } else if (line.startsWith("--- Slide ")) {
        headingsCount++;
        detectedHeadings.push({ level: 1, text: line.replace(/---/g, "").trim(), lineIndex: i });
      } else if (
        line.length > 3 &&
        line.length < 80 &&
        line === line.toUpperCase() &&
        /^[A-Z0-9\s:\-\.,]+$/.test(line) &&
        !line.startsWith("HTTP")
      ) {
        headingsCount++;
        if (!detectedTitle && i < 10) detectedTitle = line;
        detectedHeadings.push({ level: 2, text: line, lineIndex: i });
      }

      // References & Appendices detection
      if (/^references$|^bibliography$/i.test(line)) hasReferences = true;
      if (/^appendix|^appendices$/i.test(line)) hasAppendices = true;
    }

    // Fallback title if none detected
    if (!detectedTitle && lines.length > 0) {
      const firstLine = lines.find((l) => l.trim().length > 3)?.trim();
      if (firstLine && firstLine.length < 100) {
        detectedTitle = firstLine.replace(/^#+\s*/, "");
      }
    }

    return {
      detectedTitle,
      hasSubtitle: lines.some((l, idx) => idx < 5 && l.length > 10 && l.length < 120),
      headingsCount,
      sectionsCount: Math.max(1, headingsCount),
      tablesCount,
      codeBlocksCount,
      mathExpressionsCount,
      bulletListsCount,
      hasReferences,
      hasAppendices,
      detectedHeadings
    };
  }

  private detectLanguage(text: string): string {
    const lower = text.toLowerCase();
    if (/\b(the|and|is|in|of|to|with|for|that|this)\b/.test(lower)) return "English";
    if (/\b(el|la|los|las|de|que|y|en|un|por)\b/.test(lower)) return "Spanish";
    if (/\b(le|la|les|de|un|une|et|dans|est)\b/.test(lower)) return "French";
    if (/\b(der|die|das|und|in|zu|den|mit|von)\b/.test(lower)) return "German";
    return "English";
  }

  private classifyDomainAndKeywords(text: string, fileName: string): { academicField: string; subject: string; keywords: string[] } {
    const lower = (text + " " + fileName).toLowerCase();
    const frequency = new Map<string, number>();

    // Stopwords list
    const stopWords = new Set([
      "the", "and", "is", "in", "it", "of", "to", "for", "with", "on", "at", "by", "from",
      "this", "that", "are", "was", "be", "has", "have", "an", "as", "or", "an", "can",
      "which", "also", "using", "used", "each", "other", "than", "more", "slide", "page"
    ]);

    const words = lower.match(/\b[a-z]{4,}\b/g) || [];
    words.forEach((w) => {
      if (!stopWords.has(w)) {
        frequency.set(w, (frequency.get(w) || 0) + 1);
      }
    });

    // Top keywords by frequency
    const sortedWords = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    const keywords = sortedWords.slice(0, 10);

    // Classify Academic Field & Subject
    if (/\b(algorithm|code|function|database|python|java|css|html|react|network|server|cpu|array|software)\b/.test(lower)) {
      return { academicField: "Technology & Computing", subject: "Computer Science & Software", keywords };
    }
    if (/\b(cell|dna|rna|gene|organism|protein|virus|bacteria|neuron|anatomy|disease|patient)\b/.test(lower)) {
      return { academicField: "Science & Medicine", subject: "Biology & Medicine", keywords };
    }
    if (/\b(integral|derivative|calculus|equation|matrix|theorem|vector|probability|statistic|algebra)\b/.test(lower)) {
      return { academicField: "Engineering & Math", subject: "Mathematics & Physics", keywords };
    }
    if (/\b(market|revenue|finance|capital|accounting|business|strategy|consumer|economics|asset)\b/.test(lower)) {
      return { academicField: "Business & Economics", subject: "Finance & Economics", keywords };
    }
    if (/\b(psychology|behavior|society|history|policy|government|culture|philosophy|law)\b/.test(lower)) {
      return { academicField: "Humanities & Social Sciences", subject: "Social Sciences & Humanities", keywords };
    }

    return {
      academicField: "General Academic Studies",
      subject: "Interdisciplinary Research",
      keywords
    };
  }

  private calculateDifficulty(words: string[], text: string): "Beginner" | "Intermediate" | "Advanced" | "Specialized" {
    if (words.length === 0) return "Beginner";

    // Measure average word length and long technical word density (>8 chars)
    let totalCharLen = 0;
    let longWords = 0;

    for (const w of words) {
      totalCharLen += w.length;
      if (w.length >= 8) longWords++;
    }

    const avgWordLength = totalCharLen / words.length;
    const longWordRatio = longWords / words.length;

    if (avgWordLength > 6.2 || longWordRatio > 0.28) return "Specialized";
    if (avgWordLength > 5.5 || longWordRatio > 0.20) return "Advanced";
    if (avgWordLength > 4.8 || longWordRatio > 0.12) return "Intermediate";
    return "Beginner";
  }
}

export const metadataService = new MetadataService();
