/**
 * ExtractionService.ts
 * Module responsible for extracting raw readable text from supported document formats.
 * Supported: PDF, DOCX, PPTX, TXT, Markdown (.md)
 * Extensible for future formats: Images (OCR), Excel, EPUB.
 */

import mammoth from "mammoth";
import * as pdfParseModule from "pdf-parse";
import { extractTextFromPptx } from "../../utils/pptxParser.js";

export interface ExtractionResult {
  rawText: string;
  fileType: string;
  estimatedPageCount: number;
  extractionLog: string;
}

export class ExtractionService {
  /**
   * Extract text from buffer based on file extension / MIME type
   */
  public async extractText(buffer: Buffer, fileName: string, mimeType?: string): Promise<ExtractionResult> {
    if (!buffer || buffer.length === 0) {
      throw new Error("Empty document: Uploaded file contains 0 bytes.");
    }

    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    try {
      if (ext === "pdf" || mimeType === "application/pdf") {
        return await this.extractFromPdf(buffer, fileName);
      } else if (
        ext === "docx" ||
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        return await this.extractFromDocx(buffer, fileName);
      } else if (
        ext === "pptx" ||
        mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ) {
        return await this.extractFromPptx(buffer, fileName);
      } else if (ext === "txt" || ext === "md" || mimeType?.startsWith("text/")) {
        return this.extractFromPlainText(buffer, ext);
      } else {
        throw new Error(`Unsupported file type extension '.${ext}'. Supported formats: .pdf, .docx, .pptx, .txt, .md.`);
      }
    } catch (err: any) {
      if (err.message?.includes("Password") || err.message?.includes("encrypted")) {
        throw new Error(`Password-protected PDF: Unable to extract text without credentials.`);
      }
      if (err.message?.includes("Corrupted") || err.message?.includes("invalid") || err.message?.includes("zip")) {
        throw new Error(`Corrupted document: File binary structure is corrupted or unreadable.`);
      }
      throw err;
    }
  }

  private async extractFromPdf(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
    try {
      const uint8Array = new Uint8Array(buffer);
      const parser = new pdfParseModule.PDFParse({ data: uint8Array });
      let text = "";
      let pageCount = 1;

      try {
        const result = await parser.getText();
        text = result.text || "";
        pageCount = result.total || Math.max(1, Math.ceil(text.length / 2500));
      } finally {
        try {
          await parser.destroy();
        } catch (e) {}
      }

      if (!text.trim()) {
        throw new Error("Empty document: PDF contains no readable text layers (may be a scanned image or empty PDF).");
      }

      return {
        rawText: text,
        fileType: "pdf",
        estimatedPageCount: pageCount,
        extractionLog: `Successfully extracted ${text.length} characters across ${pageCount} PDF pages.`
      };
    } catch (err: any) {
      if (err.message?.includes("Empty document")) throw err;
      throw new Error(`PDF extraction failed: ${err.message || "Corrupted document"}`);
    }
  }

  private async extractFromDocx(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || "";

      if (!text.trim()) {
        throw new Error("Empty document: Word document contains no body text.");
      }

      const pageCount = Math.max(1, Math.ceil(text.length / 3000));

      return {
        rawText: text,
        fileType: "docx",
        estimatedPageCount: pageCount,
        extractionLog: `Successfully extracted ${text.length} characters from DOCX document.`
      };
    } catch (err: any) {
      if (err.message?.includes("Empty document")) throw err;
      throw new Error(`DOCX extraction failed: ${err.message || "Invalid file structure"}`);
    }
  }

  private async extractFromPptx(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
    try {
      const text = await extractTextFromPptx(buffer);
      if (!text.trim()) {
        throw new Error("Empty document: PowerPoint presentation contains no text frames.");
      }

      const slideCount = (text.match(/--- Slide \d+ ---/g) || []).length || Math.max(1, Math.ceil(text.length / 1500));

      return {
        rawText: text,
        fileType: "pptx",
        estimatedPageCount: slideCount,
        extractionLog: `Successfully extracted ${text.length} characters from ${slideCount} PPTX slides.`
      };
    } catch (err: any) {
      if (err.message?.includes("Empty document")) throw err;
      throw new Error(`PPTX extraction failed: ${err.message || "Corrupted presentation"}`);
    }
  }

  private extractFromPlainText(buffer: Buffer, ext: string): ExtractionResult {
    let text = "";
    try {
      text = buffer.toString("utf-8");
    } catch (e) {
      throw new Error("Unsupported encoding: Unable to decode plain text using UTF-8.");
    }

    if (!text.trim()) {
      throw new Error("Empty document: File contains only whitespace or is empty.");
    }

    const pageCount = Math.max(1, Math.ceil(text.length / 3000));

    return {
      rawText: text,
      fileType: ext === "md" ? "markdown" : "txt",
      estimatedPageCount: pageCount,
      extractionLog: `Successfully extracted ${text.length} characters from ${ext.toUpperCase()} text file.`
    };
  }
}

export const extractionService = new ExtractionService();
