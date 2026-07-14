import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type LearnlyRuntime = typeof globalThis & {
  __LEARNLY_DB__?: D1Database;
};

export function getDb() {
  const database = (globalThis as LearnlyRuntime).__LEARNLY_DB__;

  if (!database) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. The Worker must attach it to the Learnly request runtime before a database route is handled."
    );
  }

  return drizzle(database, { schema });
}
