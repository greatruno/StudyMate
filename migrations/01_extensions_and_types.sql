-- Migration 01: PostgreSQL Extensions & Custom Types
-- Phase 1.1 StudyMate Production Database Implementation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verification Notice
COMMENT ON EXTENSION "vector" IS 'Vector search extension for AI document embeddings';
