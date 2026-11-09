import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import * as schema from "./schema";
import migrations from "../../drizzle/migrations";

// Open SQLite database with change listener enabled for live reactive queries
export const expoDb = openDatabaseSync("tt_student.db", { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });
export type Database = typeof db;

// Run bundled SQLite migrations in a transaction on app startup
export async function runMigrations(): Promise<void> {
  await migrate(db, migrations);
  try {
    expoDb.execSync("ALTER TABLE students ADD COLUMN username text;");
  } catch {
    // Column already exists
  }
  try {
    expoDb.execSync("ALTER TABLE students ADD COLUMN avatar_url text;");
  } catch {
    // Column already exists
  }
}
