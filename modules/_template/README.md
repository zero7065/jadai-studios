# Jadai Module Template

This directory demonstrates how to create a new module for Jadai Studios.

## How to add a new module

1. Duplicate this `_template` folder and rename it to your module slug (e.g., `modules/my-tool`).
2. Update `index.ts` with your module's `slug`, `name`, `description`, `requiredTier`, and export.
3. Build your UI inside `page.tsx`.
4. Add your API logic inside `api/action.ts` (or create additional route handlers).
5. Register the module in `/lib/modules/modules.config.ts`.
6. Add the module row in `/lib/supabase/schema.sql` (if database persistence is required).

That's it. No router reconfiguration, no rewiring. The platform handles tier verification, rate limiting, logging, and error boundaries automatically.
