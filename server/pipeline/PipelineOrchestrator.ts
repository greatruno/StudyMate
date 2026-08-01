/**
 * PipelineOrchestrator.ts
 * Asynchronous Document Processing Pipeline Orchestrator.
 * Coordinates execution across:
 *   1. ExtractionService
 *   2. CleaningService
 *   3. MetadataService
 *   4. ChunkingService
 * Manages processing_status state machine and records audit logs and database chunks.
 */

import path from "path";
import fs from "fs";
import { extractionService, ExtractionResult } from "./services/ExtractionService.js";
import { cleaningService, CleaningResult } from "./services/CleaningService.js";
import { metadataService, DocumentMetadata } from "./services/MetadataService.js";
import { chunkingService, ChunkingResult, SemanticChunk } from "./services/ChunkingService.js";
import { embeddingService } from "./services/EmbeddingService.js";
import pkg from "pg";
const { Client } = pkg;

export type ProcessingStatus = "uploaded" | "extracting" | "cleaning" | "analyzing" | "chunking" | "embedding" | "indexed" | "ready" | "completed" | "failed";

export interface PipelineProgress {
  documentId: string;
  status: ProcessingStatus;
  currentStep: string;
  progressPercent: number;
  extractedLength?: number;
  cleanedLength?: number;
  metadata?: DocumentMetadata;
  chunksCount?: number;
  processingTimeMs?: number;
  processingError?: string;
  logs: string[];
}

function getDbClient() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  return new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
}

export class PipelineOrchestrator {
  private activePipelines = new Map<string, PipelineProgress>();

  constructor() {
    this.initDatabaseSchema().catch(console.error);
  }

  private async initDatabaseSchema() {
    const client = getDbClient();
    if (!client) return;
    try {
      await client.connect();
      await client.query(`
        ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS processing_error TEXT;

        CREATE TABLE IF NOT EXISTS public.document_chunks (
          id TEXT PRIMARY KEY,
          document_id TEXT NOT NULL,
          user_id UUID NOT NULL,
          chunk_number INT NOT NULL,
          heading TEXT,
          content TEXT NOT NULL,
          token_count INT DEFAULT 0,
          character_count INT DEFAULT 0,
          page_reference INT DEFAULT 1,
          chunk_type TEXT DEFAULT 'explanation',
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_doc_chunks_doc_id ON public.document_chunks(document_id);
      `);
    } catch (err) {
      console.warn("⚠️ Warning initializing document_chunks schema:", err);
    } finally {
      try { await client.end(); } catch (e) {}
    }
  }

  /**
   * Run asynchronous document processing pipeline
   */
  public async processDocumentAsync(
    documentId: string,
    userId: string,
    buffer: Buffer,
    fileName: string,
    mimeType?: string,
    ownerEmail?: string
  ): Promise<PipelineProgress> {
    const startTime = Date.now();
    const logs: string[] = [];

    const progress: PipelineProgress = {
      documentId,
      status: "uploaded",
      currentStep: "Pipeline Initialized",
      progressPercent: 5,
      logs,
      processingTimeMs: 0
    };

    this.activePipelines.set(documentId, progress);
    logs.push(`[${new Date().toISOString()}] Triggered processing pipeline for document "${fileName}" (${documentId}).`);

    try {
      // -------------------------------------------------------------
      // Step 1: Extraction Service
      // -------------------------------------------------------------
      progress.status = "extracting";
      progress.currentStep = "Extracting raw text from document binary";
      progress.progressPercent = 20;
      await this.updateDocumentDbStatus(documentId, userId, "extracting");

      logs.push(`[${new Date().toISOString()}] Step 1: Extracting text from ${fileName}...`);
      const extraction: ExtractionResult = await extractionService.extractText(buffer, fileName, mimeType);
      progress.extractedLength = extraction.rawText.length;
      logs.push(`[${new Date().toISOString()}] Extraction finished. ${extraction.extractionLog}`);

      // -------------------------------------------------------------
      // Step 2: Cleaning Service
      // -------------------------------------------------------------
      progress.status = "cleaning";
      progress.currentStep = "Cleaning text and removing page/header noise";
      progress.progressPercent = 45;
      await this.updateDocumentDbStatus(documentId, userId, "cleaning");

      logs.push(`[${new Date().toISOString()}] Step 2: Cleaning extracted text...`);
      const cleaning: CleaningResult = cleaningService.cleanText(extraction.rawText);
      progress.cleanedLength = cleaning.cleanedCharCount;
      logs.push(`[${new Date().toISOString()}] Cleaning finished. ${cleaning.cleaningLog}`);

      // -------------------------------------------------------------
      // Step 3: Metadata Service (Structure & Academic Field Analysis)
      // -------------------------------------------------------------
      progress.status = "analyzing";
      progress.currentStep = "Detecting document structure and extracting metadata";
      progress.progressPercent = 70;
      await this.updateDocumentDbStatus(documentId, userId, "analyzing");

      logs.push(`[${new Date().toISOString()}] Step 3: Analyzing structure & metadata...`);
      const metadata: DocumentMetadata = metadataService.generateMetadata(
        cleaning.cleanedText,
        fileName,
        extraction.estimatedPageCount
      );
      progress.metadata = metadata;
      logs.push(`[${new Date().toISOString()}] Metadata generated: Field=${metadata.academicField}, Subject=${metadata.subject}, Headings=${metadata.structure.headingsCount}, Difficulty=${metadata.estimatedDifficulty}.`);

      // -------------------------------------------------------------
      // Step 4: Semantic Chunking Service
      // -------------------------------------------------------------
      progress.status = "chunking";
      progress.currentStep = "Generating semantic chunks based on logical boundaries";
      progress.progressPercent = 75;
      await this.updateDocumentDbStatus(documentId, userId, "chunking");

      logs.push(`[${new Date().toISOString()}] Step 4: Semantically chunking cleaned text...`);
      const chunking: ChunkingResult = chunkingService.generateSemanticChunks(
        cleaning.cleanedText,
        documentId,
        extraction.estimatedPageCount
      );
      progress.chunksCount = chunking.totalChunkCount;
      logs.push(`[${new Date().toISOString()}] Semantic chunking completed: ${chunking.chunkingLog}`);

      // Save raw chunks to DB
      await this.saveChunksToDatabase(documentId, userId, chunking.chunks);

      // -------------------------------------------------------------
      // Step 5: Vector Embeddings Generation (EmbeddingService)
      // -------------------------------------------------------------
      progress.status = "embedding";
      progress.currentStep = "Generating vector embeddings for semantic chunks (text-embedding-004)";
      progress.progressPercent = 90;
      await this.updateDocumentDbStatus(documentId, userId, "embedding");

      logs.push(`[${new Date().toISOString()}] Step 5: Generating vector embeddings for ${chunking.chunks.length} chunks...`);
      const embedRes = await embeddingService.embedDocumentChunks(documentId, userId, chunking.chunks);
      logs.push(`[${new Date().toISOString()}] Embeddings generated: ${embedRes.embeddedCount} embedded, ${embedRes.failedCount} failed in ${embedRes.durationMs}ms.`);

      progress.status = "indexed";
      await this.updateDocumentDbStatus(documentId, userId, "indexed");

      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;

      progress.status = "ready";
      progress.currentStep = "Document Knowledge Indexed & RAG Ready";
      progress.progressPercent = 100;
      progress.processingTimeMs = processingTimeMs;

      logs.push(`[${new Date().toISOString()}] Pipeline completed successfully in ${processingTimeMs}ms. Status: ready.`);

      // Update Postgres DB
      await this.finalizeDocumentDb(documentId, userId, metadata, processingTimeMs);

      // Save local disk cache for fast pipeline inspection
      this.cachePipelineResultOnDisk(documentId, userId, progress, chunking.chunks, cleaning.cleanedText, ownerEmail);

      return progress;
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown processing error";
      const endTime = Date.now();

      progress.status = "failed";
      progress.currentStep = "Processing Failed";
      progress.processingError = errorMessage;
      progress.processingTimeMs = endTime - startTime;
      logs.push(`[${new Date().toISOString()}] ❌ PIPELINE FAILED: ${errorMessage}`);

      await this.updateDocumentDbError(documentId, userId, errorMessage);
      this.cachePipelineResultOnDisk(documentId, userId, progress, [], "", ownerEmail);

      return progress;
    }
  }

  /**
   * Get real-time pipeline status for a document
   */
  public getPipelineStatus(documentId: string): PipelineProgress | null {
    return this.activePipelines.get(documentId) || null;
  }

  private async updateDocumentDbStatus(documentId: string, userId: string, status: ProcessingStatus) {
    const client = getDbClient();
    if (!client || !userId) return;
    try {
      await client.connect();
      await client.query(
        `UPDATE public.documents SET status = $1, processing_status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`,
        [status, documentId, userId]
      );
    } catch (e) {
      console.warn(`⚠️ Failed updating document status '${status}' in DB:`, e);
    } finally {
      try { await client.end(); } catch (e) {}
    }
  }

  private async updateDocumentDbError(documentId: string, userId: string, errorMsg: string) {
    const client = getDbClient();
    if (!client || !userId) return;
    try {
      await client.connect();
      await client.query(
        `UPDATE public.documents SET status = 'failed', processing_status = 'failed', processing_error = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`,
        [errorMsg, documentId, userId]
      );
    } catch (e) {
      console.warn("⚠️ Failed updating document error in DB:", e);
    } finally {
      try { await client.end(); } catch (e) {}
    }
  }

  private async saveChunksToDatabase(documentId: string, userId: string, chunks: SemanticChunk[]) {
    const client = getDbClient();
    if (!client || !userId) return;

    try {
      await client.connect();
      // Clear any prior chunks for this document
      await client.query(`DELETE FROM public.document_chunks WHERE document_id = $1 AND user_id = $2`, [documentId, userId]);

      for (const chk of chunks) {
        await client.query(
          `INSERT INTO public.document_chunks (
            id, document_id, user_id, chunk_number, heading, content, token_count, character_count, page_reference, chunk_type, metadata, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
          [
            chk.chunk_id,
            documentId,
            userId,
            chk.chunk_number,
            chk.heading,
            chk.content,
            chk.token_count,
            chk.character_count,
            chk.page_reference,
            chk.chunk_type,
            JSON.stringify(chk.metadata)
          ]
        );
      }
    } catch (err) {
      console.warn("⚠️ Error saving chunks to Postgres DB:", err);
    } finally {
      try { await client.end(); } catch (e) {}
    }
  }

  private async finalizeDocumentDb(documentId: string, userId: string, metadata: DocumentMetadata, processingTimeMs: number) {
    const client = getDbClient();
    if (!client || !userId) return;

    try {
      await client.connect();
      await client.query(
        `UPDATE public.documents
         SET status = 'completed',
             processing_status = 'completed',
             processing_error = NULL,
             metadata = $1,
             updated_at = NOW()
         WHERE id = $2 AND user_id = $3`,
        [JSON.stringify({ ...metadata, processingTimeMs }), documentId, userId]
      );
    } catch (err) {
      console.warn("⚠️ Error finalizing document DB state:", err);
    } finally {
      try { await client.end(); } catch (e) {}
    }
  }

  private cachePipelineResultOnDisk(
    documentId: string,
    userId: string,
    progress: PipelineProgress,
    chunks: SemanticChunk[],
    cleanedText: string,
    ownerEmail?: string
  ) {
    try {
      const dir = path.join("/tmp/study_mate_docs", userId || "guest");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filePath = path.join(dir, `${documentId}_pipeline.json`);
      fs.writeFileSync(
        filePath,
        JSON.stringify(
          {
            documentId,
            userId,
            ownerEmail,
            progress,
            chunks,
            cleanedTextSnippet: cleanedText.substring(0, 1000)
          },
          null,
          2
        ),
        "utf-8"
      );
    } catch (e) {
      console.warn("⚠️ Failed caching pipeline result to local disk:", e);
    }
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();
