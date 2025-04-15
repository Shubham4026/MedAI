import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, pool } from "../server/db";

async function runMigration() {
  console.log("Starting database schema push...");
  
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Schema push completed successfully!");
  } catch (error) {
    console.error("Schema push failed:", error);
  } finally {
    await pool.end();
  }
}

runMigration();