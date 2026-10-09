# 04 — THE MODULE SYSTEM (SPECIFICATION v1.2)

The Jadai Studios module system lets future tools, services, and AI products plug in without touching existing routers.

---

## The Core Concept

A module is a self-contained feature unit. It owns its:

1. **Metadata & Access Rules** (`index.ts` via `defineModule()`)
2. **User Interface** (`page.tsx`)
3. **Backend API Handlers** (`api/`)
4. **Internal Config & Secrets** (`README.md`)

---

## Anatomy of a Module

```
/modules/
└── [my-feature]/
    ├── index.ts        # Exports JadaiModule via defineModule()
    ├── page.tsx        # React client component
    ├── api/
    │   └── action.ts   # Pure TypeScript handler functions
    └── README.md       # Operational notes
```

### The Definition Contract (`index.ts`)

```typescript
import { defineModule } from '../../lib/modules/defineModule';
import FeaturePage from './page';
import { handleAction } from './api/action';

export const featureModule = defineModule({
  slug: 'my-feature',
  name: 'My Custom Feature',
  description: 'High-leverage engineering tool.',
  icon: 'Terminal',            // Lucide icon name
  version: '1.0.0',
  status: 'active',            // 'active' | 'beta' | 'coming_soon' | 'disabled'
  requiredTier: 'free',        // 'free' | 'foundation' | 'voice' | 'architecture' | 'prime'
  component: FeaturePage,
  routes: {
    page: '/my-feature',
    api: { action: handleAction },
  },
});

export default featureModule;
```

`defineModule` validates `slug`, `name`, and `component` at import time — a broken definition fails loudly in development, not silently at runtime.

### The API Handler Contract (`api/action.ts`)

```typescript
export async function handleAction({ action, body, query, userId, userTier, isAdmin, ip }: {
  action: string;
  body: any;
  query: Record<string, string>;
  userId?: string;
  userTier?: string;
  isAdmin?: boolean;
  ip?: string;
}) {
  // ...
  return { success: true, data: {...} };        // or
  return { status: 403, success: false, error: 'Not allowed', code: 'FORBIDDEN' };
}
```

---

## How to Add a New Module (In 3 Minutes)

1. **Copy the reference template:**
   ```bash
   cp -r modules/_template modules/my-tool
   ```
2. **Configure the definition** in `modules/my-tool/index.ts`: set `slug`, `name`, `requiredTier`, and wire your `api/` handlers into `routes.api`.
3. **Register in the registry** — add two lines to `lib/modules/modules.config.ts`:
   ```typescript
   import myToolModule from '../../modules/my-tool';

   export const JADAI_MODULES: Record<string, JadaiModule> = {
     // ...
     'my-tool': myToolModule,
   };
   ```
4. **Done.**
   - `POST /api/modules/my-tool` with `{ "action": "..." }` dispatches your handler with per-IP rate limiting (60/min), tier gating, and `module_usage` telemetry.
   - The UI mounts wherever `src/App.tsx` routes to its `component` (add a `case '/my-tool':` entry in the public route table if it deserves a top-level URL).

### Currently Registered (14)

`forge`, `mirage`, `sentinel`, `diagnostic`, `oracle`, `dream-forge`, `resume-editor`, `doc-analyzer`, `growth-maker`, `template-market`, `hub`, `book-of-lies`, `career-board`, `_template`.

---

## How to Remove a Module

1. Delete the folder: `rm -rf modules/my-tool`
2. Remove its import + line from `lib/modules/modules.config.ts`.
3. Remove any `case '/my-tool':` entry in `src/App.tsx`.
4. No other routers break — unknown slugs return a clean 404.

---

## Telemetry

Every handler invocation logs to `module_usage`: `action`, `user_id`/`ip`, `duration_ms`, `tokens_used`, `ai_provider`, `success`, `error`. Inspect from the Admin Lounge diagnostics or directly in Supabase.
