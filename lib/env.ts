// Bootstrap .env BEFORE any other lib module reads process.env.
// ES module imports are hoisted and execute in order — importing this file
// first in server.ts guarantees dotenv.config() runs before modules like
// lib/supabase/admin.ts evaluate their module-level const/process.env reads.
import dotenv from 'dotenv';
dotenv.config();
