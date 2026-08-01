import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:Agisiongreat091%40@db.scqkthphexihsyecgdew.supabase.co:5432/postgres";

// Clean any accidental "DATABASE_URL=" prefix or quotes
DATABASE_URL = DATABASE_URL.replace(/^DATABASE_URL=/i, '').replace(/^"|"$/g, '').trim();

console.log("DEBUG Cleaned DATABASE_URL host/masked:", DATABASE_URL.replace(/:[^:@]+@/, ":****@"));

if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL environment variable is not defined!");
  process.exit(1);
}

async function runMigrations() {
  console.log("🚀 Starting StudyMate Phase 1.1 Database Migration...");
  console.log(`🔗 Connecting to database...`);

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to PostgreSQL instance.");

    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`\n📋 Found ${files.length} migration files to execute:`);
    files.forEach(f => console.log(`   - ${f}`));

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      console.log(`\n⏳ Executing migration: ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await client.query(sql);
      console.log(`✅ Successfully applied: ${file}`);
    }

    console.log("\n==================================================");
    console.log("🔍 RUNNING COMPREHENSIVE DATABASE AUDIT & VERIFICATION");
    console.log("==================================================");

    // 1. Audit Enabled Extensions
    const extRes = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('pgcrypto', 'vector', 'uuid-ossp');
    `);
    console.log("\n1️⃣ ENABLED EXTENSIONS:");
    extRes.rows.forEach(r => console.log(`   ✓ ${r.extname} (v${r.extversion})`));

    // 2. Audit Public Tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log(`\n2️⃣ CREATED PUBLIC TABLES (${tablesRes.rows.length} total):`);
    tablesRes.rows.forEach((r, idx) => console.log(`   ${(idx + 1).toString().padStart(2, ' ')}. public.${r.table_name}`));

    // 3. Audit Indexes & Vector Index
    const indexRes = await client.query(`
      SELECT indexname, tablename, indexdef 
      FROM pg_indexes 
      WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `);
    console.log(`\n3️⃣ PERFORMANCE & VECTOR INDEXES (${indexRes.rows.length} created):`);
    indexRes.rows.forEach(r => {
      const isVector = r.indexdef.includes('hnsw') || r.indexdef.includes('vector');
      console.log(`   ✓ ${r.tablename}.${r.indexname} ${isVector ? '🧠 [VECTOR HNSW]' : '[B-TREE]'}`);
    });

    // 4. Audit RLS Status
    const rlsRes = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    console.log("\n4️⃣ ROW-LEVEL SECURITY (RLS) STATUS:");
    let rlsCount = 0;
    rlsRes.rows.forEach(r => {
      if (r.rowsecurity) rlsCount++;
      console.log(`   ${r.rowsecurity ? '🔒 [RLS ENABLED]' : '🔓 [PUBLIC]'} public.${r.tablename}`);
    });
    console.log(`   -> Total ${rlsCount} / ${rlsRes.rows.length} tables secured with RLS.`);

    // 5. Audit RLS Policies
    const policyRes = await client.query(`
      SELECT policyname, tablename, cmd 
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);
    console.log(`\n5️⃣ RLS ACCESS POLICIES (${policyRes.rows.length} active policies):`);
    policyRes.rows.forEach(r => console.log(`   ✓ [${r.cmd}] ${r.tablename} -> "${r.policyname}"`));

    // 6. Audit Triggers
    const triggerRes = await client.query(`
      SELECT trigger_name, event_object_schema, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE event_object_schema IN ('public', 'auth')
      ORDER BY event_object_table, trigger_name;
    `);
    console.log(`\n6️⃣ AUTOMATED TRIGGERS (${triggerRes.rows.length} active triggers):`);
    triggerRes.rows.forEach(r => console.log(`   ✓ ${r.event_object_schema}.${r.event_object_table} -> Trigger: ${r.trigger_name}`));

    // 7. Audit Storage Buckets
    const bucketRes = await client.query(`
      SELECT id, name, public, file_size_limit
      FROM storage.buckets
      ORDER BY id;
    `);
    console.log(`\n7️⃣ STORAGE BUCKETS (${bucketRes.rows.length} buckets configured):`);
    bucketRes.rows.forEach(r => console.log(`   📦 Bucket '${r.name}' (ID: ${r.id}, Public: ${r.public}, Max Size: ${(r.file_size_limit / 1024 / 1024).toFixed(0)}MB)`));

    console.log("\n==================================================");
    console.log("🎉 STUDYMATE PHASE 1.1 DATABASE IMPLEMENTATION COMPLETE!");
    console.log("==================================================\n");

  } catch (err) {
    console.error("\n❌ MIGRATION ERROR:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
