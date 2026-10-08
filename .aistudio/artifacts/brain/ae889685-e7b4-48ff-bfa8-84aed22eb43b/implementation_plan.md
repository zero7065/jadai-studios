# Architectural Blueprint: Living Atmospheres, Bento Matrix, Sanctuary Vault, Canva-Grade Document Editor & PRIME Guide Bee

A comprehensive, zero-compromise architectural specification designed to deliver complete production-grade logic for every requested feature: living CSS-only atmospheric section backdrops, an asymmetric Bento Grid suite with animated micro-previews, a full-featured Canva-grade document editor with AI suggestion highlights and 30-step undo/redo, the redesigned "Sanctuary" vault menu, WCAG AA compliant typography contrast, and the floating interactive PRIME Guide Bee navigation assistant with Groq intelligence.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural plan integrates all user directives, clarified choices, and rigorous engineering requirements:
> - **Forge Document Editor Engine (Canva-Grade Precision)**:
>   - Replaces basic viewers with a full-fledged 4K pixel-perfect interactive canvas layout.
>   - Every detected block, paragraph, title, and checkbox is an independently selectable, editable, movable element with real-time text editing, font-size adjustment, and style controls.
>   - **AI Alignment & Edit Suggestions**: In-line AI intelligence analyzes the document layout, detects alignment drift, suggests copywriting enhancements, and highlights areas for improvement with visual amber/gold halos. Users can type custom refinement prompts (e.g., *"Make tone authoritative and align signatures"*) to auto-adjust content.
>   - **30-Step Bi-Directional History Engine**: Complete snapshot stack tracking up to 15 undo steps and 15 redo steps for any text change, bounding box move, checkbox toggle, or layout tweak.
>   - **Multi-Format High-Fidelity Export**: Production export to clean vector-accurate PDF, structured JSON layout schema, and 4K high-res PNG.
> - **WCAG AA Luminous Contrast & Zero-Seam Flow**:
>   - Muted golds (`#8a6e2a` at 4.21:1) are elevated to luminous `#D4AF37` (9.71:1) and radiant `#E5C158` (11.4:1), strictly surpassing the WCAG AA 4.5:1 minimum on `#050404`.
>   - Purged all accidental white divider lines (`gold-separator-line` high-contrast seams and default browser borders) for smooth, seamless void transitions between sections.
> - **Living CSS-Only Atmospheric Backgrounds**:
>   - Fixed, non-scrolling keyframe animations for all 8 views (Home, Tools/Playground, Book of Lies, Marketplace, Community/Hub, Signal, About/Studio, Admin) utilizing `transform` and `opacity` only, backed by `@media (prefers-reduced-motion: reduce)`.
> - **Asymmetric Bento Grid System (Playground)**:
>   - 12-column CSS grid (FORGE 7-col featured, PRIME Oracle 5-col top, MIRAGE 5-col bottom, and SENTINEL 12-col slim full-width) featuring live CSS animations for each tool.
> - **"The Sanctuary" Redesigned Vault Menu**:
>   - Renamed from Vault to **The Sanctuary**, purged Admin Recovery Lounge completely, introduced translucent glassy bubble display with sector navigation cues, and a movable trigger knob.
> - **Floating PRIME Guide Bee (`/components/prime/GuideBee.tsx`)**:
>   - Circular floating assistant (36px mobile / 44px desktop) with Metatron sigil, playful AI moods (curious, excited, zen), 4s onboarding tooltip, slide-up chat console with Groq LLM routing and fallback, DOM target highlighting (`.prime-target`), and persistent localStorage memory (`prime_guide_context`).

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Equips FORGE with a full-scale Canva-grade document studio: parses uploaded PDFs, Word docs, and images into high-resolution canvas layers where text and checkboxes are directly editable, supported by AI layout/copy suggestions and a 30-step undo/redo stack.
  2. Guarantees 100% WCAG AA compliance across navigation, hero, and all studio surfaces by upgrading text contrast and removing abrasive white separator lines.
  3. Deploys fixed, non-scrolling living atmospheric backgrounds per section, creating an enigmatic, breathing digital environment using pure CSS.
  4. Redesigns the studio tools section into a responsive 12-column Bento Grid with live micro-animations for each instrument.
  5. Refactors the vault menu into "The Sanctuary" with confined glassy bubble display chambers and draggable positioning.
  6. Deploys the floating PRIME Guide Bee assistant across all pages, offering playful interactive presence, smart navigation guidance, DOM element highlighting, and persistent session memory.
- **Target Audience**: Discerning creators, architects, and technical founders who demand sensory luxury, flawless accessibility, and fluid modern software interactions.
- **Key Value**: 100% crash resistance, real interactive document editing, delightful AI discovery, and unified atmospheric depth.

---

## 2. User Experience & Visual Design

### 1. Canva-Grade Document Editor Studio (`/modules/forge/lib/` & `Editor.tsx`)
- **4K Pixel-Perfect Canvas Architecture**:
  - Documents render onto an interactive layer stack: Background Document Image Layer $\rightarrow$ Editable Text & Checkbox Canvas $\rightarrow$ AI Suggestion Highlight Overlay $\rightarrow$ Selection & Transform Bounds.
- **Direct Element Manipulation**:
  - Double-click any text box to edit copy in-place with real-time typography adjustments (font family, font size, color, alignment).
  - Click any checkbox or checklist item to toggle state with instantaneous visual state feedback.
  - Drag and snap bounding boxes to adjust layout alignment with visual grid snapping lines.
- **AI Layout & Copywriting Assistant**:
  - **Auto-Audit Mode**: PRIME AI inspects the document structure, identifying misaligned margins, typos, weak phrasing, or unbalanced spacing.
  - **Suggestion Overlay**: Highlights detected improvement areas with glowing amber outlines and floating pill tooltips (e.g., *"Improve clarity: Change 'In regards to' to 'Regarding'"*).
  - **Prompt-Driven Modifications**: A top bar AI prompt input (*"Rewrite paragraph 2 to sound executive and tighten header spacing"*) executes real text and layout transformations.
  - **Accept / Dismiss**: One-click actions to adopt suggestions into the document or dismiss them.
- **30-Step Bi-Directional Snapshot Stack**:
  - `undoStack`: Array storing up to 15 prior states (document elements, text values, checkbox states, positions).
  - `redoStack`: Array storing up to 15 forward states.
  - Keyboard shortcuts (`Ctrl+Z` / `Cmd+Z` for undo, `Ctrl+Y` / `Cmd+Shift+Z` for redo) + dedicated Reverse (Undo) and Return (Redo) buttons in the editor toolbar with live state counters (`Undo (12) / Redo (3)`).
- **Export Engine**:
  - Export to Vector PDF (preserving editable text layers).
  - Export to 4K PNG raster (300 DPI scale).
  - Export to structured JSON schema for programmatic re-import.

### 2. WCAG AA Contrast Audit & Seam Elimination
- **Contrast Remediation**:
  - `#050404` Background Luminance: `0.00126`
  - Old `#8a6e2a` Luminance: `0.166` $\rightarrow$ Ratio `4.21:1` ❌ (Fails WCAG AA for normal text)
  - Elevated `#D4AF37` (Luminous Gold): Luminance `0.448` $\rightarrow$ Ratio `9.71:1` ✅ (Exceeds WCAG AAA)
  - Elevated `#E5C158` (Radiant Amber): Luminance `0.534` $\rightarrow$ Ratio `11.4:1` ✅ (Exceeds WCAG AAA)
  - Elevated `#C9A84C` (Studio Primary Gold): Luminance `0.385` $\rightarrow$ Ratio `8.48:1` ✅ (Exceeds WCAG AA)
- **Eliminating In-between Seams**:
  - Removed high-contrast horizontal divider lines and white borders between sections (`gold-separator-line` high-contrast seams and default browser borders).
  - Replaced with subtle vertical gradient fades (`linear-gradient(to bottom, transparent, rgba(201,168,76,0.03), transparent)`).

### 3. Living Atmospheric Backgrounds Matrix (CSS-Only)
```
┌─────────────────┬────────────────────────────────────────────────────────────────────────┐
│ SECTION / ROUTE │ CSS-ONLY LIVING ATMOSPHERE SPECIFICATION                               │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ HOME            │ radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.06), #05) │
│                 │ + 20 floating golden CSS particles (4px, 15-25s orbit, 0.3 opacity)    │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ TOOLS / PLAY    │ #050404 + 60px × 60px gold grid (3% opacity)                          │
│                 │ + slow horizontal radial scan line (4s top-to-bottom loop, 3% opacity) │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ BOOK OF LIES    │ radial-gradient(ellipse 60% 40% at 50% 50%, rgba(192,57,43,0.08), #05)│
│                 │ + breathing pulse animation (scale 1.0 -> 1.15 -> 1.0, 8s ease cycle)  │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ MARKETPLACE     │ linear-gradient(135deg, #050404 0%, #0a0908 50%, #050404 100%)         │
│                 │ + 4% paper grain + 2 floating horizontal 1px light beams (20s loop)    │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ COMMUNITY / HUB │ #050404 + 15 constellation stars with SVG connecting geometric rays    │
│                 │ drifting smoothly over 30s loop at 2% opacity                          │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ SIGNAL          │ #050404 + 6 vertical falling data streams of gold alphanumeric chars   │
│                 │ (JetBrains Mono 0.5rem, 0.04 opacity, 8s loop, Matrix aesthetic)       │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ ABOUT / STUDIO  │ radial-gradient(ellipse 100% 80% at 50% 100%, rgba(201,168,76,0.04))  │
│                 │ + single slow-rotating Metatron sigil centered (40% opacity, 120s)     │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ ADMIN           │ #050404 + static fine 40px grid (1% gold opacity, zero motion)         │
└─────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### 4. Bento Grid System (Desktop 12-Col, Tablet 6-Col, Mobile 2-Col)
```
┌───────────────────────────────────────────────┬────────────────────────────────────────┐
│ FORGE (Document Engine)                       │ PRIME ORACLE (AI Partner)              │
│ Cols 1–7, Rows 1–2 (Large Featured)           │ Cols 8–12, Row 1 (Medium)              │
│ • Accent: Deep Gold (#C9A84C)                 │ • Accent: Soft Violet (#8b5cf6)        │
│ • Live Preview: 3 lines grey parsing bars     │ • Live Preview: 3 cyclic speech bubbles│
│ • Drag-drop zone: "Drop a PDF here to try →"  │ • Quota: "3 free / Unlimited Pro"      │
│                                               ├────────────────────────────────────────┤
│                                               │ MIRAGE (Image Generation)              │
│                                               │ Cols 8–12, Row 2 (Medium)              │
│                                               │ • Accent: Warm Crimson (#C0392B)       │
│                                               │ • Live Preview: 3 gradient shimmer box │
│                                               │ • Preview input: "Type a prompt →"     │
├───────────────────────────────────────────────┴────────────────────────────────────────┤
│ SENTINEL (Site Health Diagnostics)                                                     │
│ Cols 1–12, Row 3 (Full Width Slim)                                                     │
│ • Accent: Electric Teal (#0891b2)                                                      │
│ • Live Preview: 4-segment gauge (Performance / SEO / Accessibility / Security)         │
│ • Embedded URL scanner input + "Run Scan" trigger                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5. "The Sanctuary" Redesigned Vault Menu
- **Translucent Bubble Display**: Confined modal container with frosted glass backing (`backdrop-blur-3xl`, `rgba(10,9,8,0.85)`).
- **Zero Admin Recovery Footprint**: Purged `Recovery Terminal` and admin console links from options.
- **Sector Navigation Indications**: Sector indicators (`Chamber 01: Strategy`, `Chamber 02: Systems`, `Chamber 03: Commerce & Voice`), item count badges, and quick keyboard hotkeys (`ESC` close, `/` search).
- **Movable Draggable Trigger**: Floating dial button on the right edge with fluid drag positioning and subtle golden halo pulse.

### 6. Floating PRIME Guide Bee (`/components/prime/GuideBee.tsx`)
- **Dimensions & Placement**: 36px mobile / 44px desktop floating circular element, docked at bottom-right (24px offset), floating safely above mobile docks.
- **Visuals**: Radial gradient (gold center `#C9A84C` fading to crimson edge `#C0392B`), centered 18px Metatron sigil SVG, soft box-shadow glow, and gentle 3-second floating bob animation.
- **Proactive Tooltip**: Appears after 4 seconds on first load: *"Need help finding something? Tap me ⬡"*, auto-dismissing after 5 seconds or upon tap.
- **Chat Expansion & Highlight Navigation**:
  - Slides up into a sleek 300px × 400px glass panel.
  - User asks query $\rightarrow$ PRIME responds in $\le 2$ sentences via Groq (`llama-3.3-70b-versatile`) with offline deterministic fallback.
  - Automatically highlights target DOM element with `.prime-target` (`prime-jiggle` + `prime-glow` animation) and smoothly navigates after an 800ms preview delay.
- **Persistent Memory**: Retains conversation thread in `localStorage['prime_guide_context']` (up to 20 messages, loading last 5 on restart).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Featured Vector Canvas vs Read-Only Image Overlay in FORGE**
  - *Chosen Approach*: Implement an interactive vector canvas layer over the original document layout with editable text boxes, interactive checkboxes, and a 30-step snapshot stack.
  - *Why*: Delivers an authentic Canva-grade editing experience where users can modify copy, fix layout, check boxes, and apply AI suggestions directly rather than viewing a static screenshot.
- **Decision 2: In-Memory Snapshot Stack with 15/15 Limits**
  - *Chosen Approach*: Efficient state-diff snapshot array capped at 15 reverse (undo) and 15 forward (redo) entries.
  - *Why*: Protects browser memory from bloating on large documents while ensuring complete undo/redo guarantees for all edits.
- **Decision 3: CSS-Only Atmospheric Backgrounds vs Canvas/Three.js**
  - *Chosen Approach*: Pure CSS gradients, SVG masks, and keyframe animations (`transform` and `opacity` only) rendered in a fixed layer.
  - *Why*: Guarantees 60fps across mobile devices, zero memory leaks, zero WebGL context loss, and instantaneous page load times without adding external bundle weight.
- **Decision 4: Contrast Upgrade via Palette Tuning (Preserving Dark Void Mystique)**
  - *Chosen Approach*: Replace muted dim golds (`#8a6e2a`, `#6b5520`) with luminous `#D4AF37` and `#E5C158` for text, while keeping dark void depth (`#050404`).
  - *Why*: Delivers strict WCAG AA 4.5:1 (scoring 9.7:1 and 11.4:1) while preserving the luxurious dark gold atmosphere without washing out the screen.

---

## 4. Technical Architecture & Component Mapping

### Component & Background Layering Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         APP ROOT (src/App.tsx)                         │
│                                                                        │
│   Layer 0: LivingAtmosphere (Fixed, z-0, route-aware CSS keyframes)   │
│   • Home (Particles)       • Tools (Grid & Scanline)                   │
│   • Book of Lies (Pulse)   • Marketplace (Light Beams)                 │
│   • Community (Stars)      • Signal (Data Stream Columns)              │
│   • About (Metatron Sigil) • Admin (Clean Grid)                        │
│                                                                        │
│   Layer 1: Main Application Surfaces (z-1)                             │
│   ├── Nav (WCAG AA Contrast, 18px icons, Logo 5-tap trigger)           │
│   ├── Active Canonical View:                                           │
│   │   ├── Home View (Hero + BentoGrid + Social Proof)                  │
│   │   ├── Tools View (Bento Grid Suite + Dynamic Tool Modules)         │
│   │   ├── FORGE Studio (/components/forge/Editor.tsx)                  │
│   │   │   ├── 4K Interactive Vector Canvas & Layer Stack               │
│   │   │   ├── Editable Text Blocks & Interactive Checkboxes            │
│   │   │   ├── 30-Step Undo / Redo Snapshot Engine                      │
│   │   │   └── AI Suggestion Overlay & Prompt Edit Bar                  │
│   │   └── Canon / Market / Community / Signal Views                    │
│   └── Footer (Clean Studio Creed, 1100px max-width)                   │
│                                                                        │
│   Layer 2: Interactive Floating HUD Elements (z-100+)                  │
│   ├── The Sanctuary (VaultMenu - Glassy Bubbles, Movable Knob)         │
│   └── GuideBee (/components/prime/GuideBee.tsx - Groq AI Assistant)    │
│       ├── Floating Metatron Orb + Tooltip                              │
│       ├── Compact Slide-up Console                                     │
│       └── .prime-target DOM Highlighter                                │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Implementation Mapping
1. **`components/forge/Editor.tsx`**:
   - Upgraded to a complete Canva-grade editor with 4K canvas rendering, in-place text editing, interactive checkboxes, 30-step undo/redo stack (`undoStack`/`redoStack`), and AI suggestion overlays.
2. **`modules/forge/lib/convert.ts`**:
   - Extracts structured bounding boxes, checkboxes, and layout layers with normalized coordinates and typography metadata.
3. **`modules/forge/api/suggest.ts`**:
   - API handler for AI document analysis, layout suggestions, copy refinements, and prompt-driven transformations.
4. **`components/ui/LivingAtmosphere.tsx`**:
   - Route-aware fixed background orchestrator rendering the 8 CSS-only atmospheric presets.
5. **`components/sections/BentoGrid.tsx`**:
   - 12-column asymmetric grid housing FORGE, PRIME Oracle, MIRAGE, and SENTINEL with CSS live-previews.
6. **`components/prime/GuideBee.tsx`**:
   - Floating assistant with bobbing animation, Metatron SVG, tooltip, chat panel, Groq LLM integration, and DOM highlighting.
7. **`components/layout/VaultMenu.tsx`**:
   - Renamed to "The Sanctuary", removed Admin Recovery, added chamber indications and translucent glassy bubble display.
8. **`app/globals.css`**:
   - Injected keyframes (`prime-jiggle`, `prime-glow`, `scanline`, `dataStreamFall`, `bentoBars`, `sigilRotate120`, `lightBeamDrift`).
   - Upgraded muted gold tokens to `#D4AF37` / `#E5C158` for WCAG AA compliance.
   - Removed horizontal seam borders.
9. **`src/App.tsx`**:
   - Mounted `LivingAtmosphere` as the global background and integrated `GuideBee` across all pages.
