import pkg from "pg";
import fs from "fs";

const { Pool } = pkg;

// Railway automatically provides this
const DATABASE_URL = process.env.DATABASE_URL;

// Create a persistent connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function setupDatabase() {
  try {
    console.log("🔧 Setting up database...");

    const sql = fs.readFileSync("database-setup.sql", "utf8");
    await pool.query(sql);

    console.log("✅ Database setup completed successfully");

  } catch (error) {
    console.error("❌ Database setup failed");
    console.error(error.message);
    // IMPORTANT: do NOT exit the process
  }
}

// Export pool for queries later
export { pool };
