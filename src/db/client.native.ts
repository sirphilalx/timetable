import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

// Open SQLite database safely with change listeners enabled for live queries
const expoDb = openDatabaseSync("tt_student.db", { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });
export type Database = typeof db;
