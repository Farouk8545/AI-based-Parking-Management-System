import dotenv from "dotenv";
import fs from "fs";
import pool from "./src/db.js";

// Load environment earlier (db.js also loads it) but keep here for safety
dotenv.config();

export async function setupDatabase() {
  try {
    console.log("🔧 Setting up database...");

    const sql = fs.readFileSync("database-setup.sql", "utf8");
    await pool.query(sql);

    console.log("✅ Database setup completed successfully!");

    // Test the connection
    const result = await pool.query("SELECT COUNT(*) as slot_count FROM parking_slots");
    console.log(`🅿️  Parking slots in database: ${result.rows[0].slot_count}`);
  } catch (error) {
    // Log full error for easier debugging in remote environments
    console.error("❌ Database setup failed:", error && error.message ? error.message : error);
    // Don't call process.exit here — let the caller decide how to handle failures.
    throw error;
  }
}

// Only run automatically when explicitly requested via env var
if (process.env.RUN_DB_SETUP === "true") {
  setupDatabase().catch(() => {});
}
