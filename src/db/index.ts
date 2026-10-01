import * as schema from "./schema";

// Supabase Postgres when DATABASE_URL is set; embedded PGlite in .pglite/ otherwise,
// so local dev needs no accounts.
function create() {
  const url = process.env.DATABASE_URL;
  if (url) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/node-postgres") as typeof import("drizzle-orm/node-postgres");
    return drizzle(url, { schema });
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/pglite") as typeof import("drizzle-orm/pglite");
  return drizzle(process.env.PGLITE_DIR ?? ".pglite", { schema }) as unknown as ReturnType<
    typeof import("drizzle-orm/node-postgres").drizzle<typeof schema>
  >;
}

const g = globalThis as unknown as { __db?: ReturnType<typeof create> };
export const db = (g.__db ??= create());
export { schema };
