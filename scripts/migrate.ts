// Load environment variables and run Better Auth migration
import { execSync } from "node:child_process";

// The env vars are already loaded by bun
console.log("Running Better Auth migration...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "***configured***" : "NOT SET");

execSync("bunx @better-auth/cli migrate", {
	stdio: "inherit",
	env: process.env,
});
