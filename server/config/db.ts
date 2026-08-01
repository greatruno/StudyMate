import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

/**
 * Type-safe definition for database configuration.
 */
export interface DatabaseConfig {
  databaseUrl: string;
}

/**
 * Validates direct database connection configuration (PostgreSQL / Supabase connection string).
 */
export function validateDatabaseConfig(): { isValid: boolean; config: Partial<DatabaseConfig>; error?: string } {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      isValid: false,
      config: {},
      error: "DATABASE_URL environment variable is missing."
    };
  }

  // Basic sanity check to ensure it starts with standard postgres connection schemes
  if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
    return {
      isValid: false,
      config: { databaseUrl },
      error: "DATABASE_URL has an invalid connection format. It must start with postgres:// or postgresql://"
    };
  }

  return {
    isValid: true,
    config: { databaseUrl }
  };
}

/**
 * Parses and returns safe connection credentials and connection parameters.
 * Throws clean, actionable errors if variables are misconfigured.
 */
export function getDatabaseConfig(): DatabaseConfig {
  const { isValid, config, error } = validateDatabaseConfig();

  if (!isValid || !config.databaseUrl) {
    throw new Error(
      `Database connection could not be established. ${error || "Configuration is invalid."} ` +
      `Please verify your database connection credentials in your .env or system settings.`
    );
  }

  return {
    databaseUrl: config.databaseUrl
  };
}

/**
 * Connection pool configuration helper.
 * Provides standard pooled limits and timeout settings for relational connectors (e.g. pg / drizzle / pg-pool).
 */
export function getDbPoolOptions() {
  return {
    max: 10,                 // Maximum number of clients in pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error if connection takes longer than 2 seconds
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  };
}
