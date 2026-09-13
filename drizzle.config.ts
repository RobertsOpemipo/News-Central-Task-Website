import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Explicitly point to .env.local
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is missing from .env.local");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});