#!/usr/bin/env node
/**
 * Local Development Server
 *
 * Runs the Hono backend server for local development.
 * Start with: npm run backend
 */

import { serve } from "@hono/node-server";
import app from "./hono";

const port = parseInt(process.env.PORT || "8081", 10);

console.log(`🚀 Starting Loops backend server...`);
console.log(`📡 Server running on http://localhost:${port}`);
console.log(`🔌 tRPC endpoint: http://localhost:${port}/api/trpc`);
console.log(`\n✨ Ready to accept requests!\n`);

serve({
  fetch: app.fetch,
  port,
});
