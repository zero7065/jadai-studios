# 04 — THE MODULE SYSTEM (SPECIFICATION v1.1)

The Jadai Studios module system ensures that future tools, services, and AI products plug into the foundation without touching existing code or modifying global routers.

---

## The Core Concept

A module is a self-contained feature unit. It owns its:
1. **Metadata & Access Rules** (`index.ts`)
2. **User Interface** (`page.tsx`)
3. **Backend API Handlers** (`api/`)
4. **Internal Config & Secrets**

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
import { defineModule } from '@/lib/modules/defineModule';
import FeaturePage from './page';
import { handleAction } from './api/action';

export const featureModule = defineModule({
  slug: 'my-feature',
  name: 'My Custom Feature',
  description: 'High-leverage engineering tool.',
  icon: 'Terminal',
  version: '1.0.0',
  status: 'active',
  requiredTier: 'foundation', // 'free' | 'foundation' | 'voice' | 'architecture' | 'prime'
  component: FeaturePage,
  routes: {
    page: '/my-feature',
    api: {
      action: handleAction,
    },
  },
});

export default featureModule;
```

---

## How to Add a New Module (In 3 Minutes)

1. **Copy the Reference Template:**
   ```bash
   cp -r modules/_template modules/my-tool
   ```
2. **Configure Definition:**
   Open `modules/my-tool/index.ts` and set your `slug`, `name`, `requiredTier`, and API actions.
3. **Register in Registry:**
   Open `/lib/modules/modules.config.ts` and append:
   ```typescript
   import myToolModule from '@/modules/my-tool';

   export const JADAI_MODULES = {
     // ...
     'my-tool': myToolModule,
   };
   ```
4. **Done.**
   - URL `/my-tool` immediately renders your module page with tier gating.
   - API endpoint `/api/modules/my-tool?action=action` immediately routes to your handler with IP rate limiting and telemetry logging.

---

## How to Remove a Module

1. Delete the folder: `rm -rf modules/my-tool`
2. Remove the single line from `/lib/modules/modules.config.ts`.
3. No router files are broken. The platform returns 404 cleanly.
