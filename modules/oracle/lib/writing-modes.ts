/**
 * JADAI STUDIOS — ORACLE WRITER'S ROOM
 * Writing Modes, Style Guide Invariants, Scaffolds & IndexedDB Memory
 */

export type WritingModeId = 'ghostwrite' | 'story' | 'resume' | 'article' | 'letter' | 'book';

export type ToneId = 'warm' | 'direct' | 'formal' | 'casual' | 'poetic' | 'cunning';

export interface WritingModeConfig {
  id: WritingModeId;
  label: string;
  tagline: string;
  description: string;
  promptDirective: string;
  starterPlaceholder: string;
}

export interface WritingTemplate {
  id: string;
  title: string;
  category: WritingModeId;
  description: string;
  scaffoldText: string;
}

export interface WriterMemoryProfile {
  youWrite: string[];
  youAvoid: string[];
  recurringThemes: string[];
  voiceProfile: {
    primaryTone: ToneId;
    avgSentenceLength: 'short' | 'medium' | 'varied';
    vocabularyLevel: 'crisp-minimal' | 'elevated' | 'philosophical';
    cadenceScore: number;
  };
  totalSessions: number;
  lastUpdated: string;
}

export const WRITING_MODES: Record<WritingModeId, WritingModeConfig> = {
  ghostwrite: {
    id: 'ghostwrite',
    label: 'Ghostwrite',
    tagline: 'Write in your authentic sovereign voice',
    description: 'Learns your cadence, rhythm, vocabulary, and ideological stance. Disappears behind your name.',
    promptDirective: 'Adopt the authentic voice of the writer. Write with rhythmic contrast—short sentences for weight, longer sentences for breath. Use specific sensory images over abstract claims. Never sound corporate, sycophantic, or robotic. Spare with em-dashes. Never use "It\'s not X, it\'s Y" or "Not just X, but Y".',
    starterPlaceholder: 'Start pouring your raw thoughts, premises, or voice fragments here...',
  },
  story: {
    id: 'story',
    label: 'Story',
    tagline: 'Fiction, scenes, and novel chapters',
    description: 'Craft immersive fictional worlds with tension, subtext, sharp dialogue, and visceral pacing.',
    promptDirective: 'You are crafting narrative fiction. Anchor every sentence in physical space, immediate sensory texture, and internal tension. Write dialogue that wounds or conceals. No exposition dumps. Show character friction through action and silences.',
    starterPlaceholder: 'Set the room, the hour, or the secret someone is keeping...',
  },
  resume: {
    id: 'resume',
    label: 'Resume',
    tagline: 'High-impact professional narrative',
    description: 'Transform passive job duty lists into quantified architectural achievements and sovereign authority.',
    promptDirective: 'Write authoritative, quantified professional prose. Focus on architectural ownership, systems delivered, capital saved, and undeniable outcomes. Strong action verbs, zero corporate buzzword fluff like "synergized" or "passionate team player".',
    starterPlaceholder: 'Paste your current experience, metrics, or career milestones...',
  },
  article: {
    id: 'article',
    label: 'Article',
    tagline: 'High-signal essays, blogs & op-eds',
    description: 'Provocative first-principles essays that hook early, argue rigorously, and leave lasting resonance.',
    promptDirective: 'Write a definitive, high-signal essay. Open with an undeniable observation or provocative contradiction. Advance the argument with empirical clarity and philosophical depth. End with a takeaway that re-anchors the reader\'s worldview.',
    starterPlaceholder: 'State your core thesis or the contrarian belief you want to prove...',
  },
  letter: {
    id: 'letter',
    label: 'Letter',
    tagline: 'Formal correspondence & personal dispatches',
    description: 'From high-stakes negotiation letters to intimate letters of gratitude and sovereign memos.',
    promptDirective: 'Compose an exact, dignified dispatch. Strike the precise balance of warmth, dignity, and unambiguous intent. Every line must move the recipient closer to clarity.',
    starterPlaceholder: 'To [Recipient Name],\n\nI am writing concerning...',
  },
  book: {
    id: 'book',
    label: 'Book',
    tagline: 'Long-form manuscript & chapter management',
    description: 'Multi-chapter structural pacing, continuity tracking, and Book of Lies philosophical density.',
    promptDirective: 'You are co-authoring a timeless manuscript. Balance narrative momentum with deep philosophical resonance. Maintain scene continuity, thematic leitmotifs, and deliberate rhythm.',
    starterPlaceholder: 'Book Title // Chapter I\n\nBegin the opening passage...',
  },
};

export const WRITING_TEMPLATES: WritingTemplate[] = [
  {
    id: 'tmpl-blog',
    title: 'High-Signal Blog Post',
    category: 'article',
    description: 'The Hook → The Friction → The Framework → The Resolution',
    scaffoldText: `# [Compelling Title: The Law of First Foundations]

## The Provocation (The Hook)
Most teams fail not because they lacked velocity, but because they ran at full speed toward a cliff. [State the core paradox in 2 crisp sentences.]

## The Unexamined Lie (The Friction)
For the past five years, industry dogma taught us that [Common Assumption]. But under stress, that assumption collapses. Here is what actually happens:
- Observation 1: [Concrete failure mode]
- Observation 2: [Hidden cost]

## The Sovereign Architecture (The Framework)
Instead of optimizing the symptom, re-engineer the bedrock:
1. **The Floor**: [First-principles rule]
2. **The Guardrail**: [Invariant that cannot be breached]
3. **The Proof**: [Observable outcome]

## The Conclusion & Call to Action
Do not build glass walls before your concrete cures. If you are building for the next decade, build the floor first.`,
  },
  {
    id: 'tmpl-essay',
    title: 'Philosophical Architecture Essay',
    category: 'article',
    description: 'Thesis → Antithesis → Empirical Evidence → Synthesis',
    scaffoldText: `# [Title: On Technical Sovereignty and Borrowed Ground]

### Thesis
A craftsman who cannot explain every layer of their machine is not an owner; they are a tenant awaiting eviction.

### The Problem of Premature Abstraction
When convenience replaces understanding, fragility becomes inevitable. We trade three hours of initial setup for three years of silent dependency debt.

### Evidence from the Highland Foundry
Consider systems built under resource constraints. When electricity flickers and bandwidth is rationed, only software that owns its local state survives.

### The Synthesis
Depth is not the enemy of speed; it is its only durable guarantee. To build different, one must first be willing to think first.`,
  },
  {
    id: 'tmpl-story',
    title: 'Short Story Scene Matrix',
    category: 'story',
    description: 'Sensory Hook → Rising Action → The Turn → Resonance',
    scaffoldText: `# Scene Title: The Cold at Terminus

The tea had gone cold forty minutes before the courier arrived, but Nanpan did not touch the kettle.

In the highland fog outside the workshop, the transformer hummed in a low B-flat. That meant the phase had dropped below two hundred volts again.

"He won't sign the transfer," the courier said, stepping across the threshold without wiping the red Plateau dust from his boots.

"He doesn't have to sign it," Nanpan replied, without looking up from the circuit board. "The ledger has already sealed the epoch."

The silence that followed was heavy with metal shavings and old grievances.`,
  },
  {
    id: 'tmpl-letter',
    title: 'Executive Strategic Dispatch',
    category: 'letter',
    description: 'Header → Context → Core Proposal → Terms & Close',
    scaffoldText: `To: [Recipient Executive / Partner]
From: Jadai Studios HQ, Jos
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Subject: Strategic Partnership Framework — Bedrock Infrastructure

Dear [Recipient Name],

I am writing directly to address our shared objective regarding [Key Objective or Initiative].

Over the past quarter, we observed that [Key Insight or Friction Point]. Rather than continuing with temporary stopgaps, we propose a sovereign partnership structured around three pillars:

1. **Clear Ownership**: All code, schemas, and assets remain unencumbered property of your firm.
2. **Deterministic SLAs**: Sub-50ms execution across edge endpoints with zero third-party telemetry leak.
3. **Dual-Currency Settlement**: Direct settlement via verified payment channels without currency drag.

We are prepared to deploy initial staging by [Target Date]. Let us schedule a 20-minute alignment briefing this Thursday at 2:00 PM WAT.

With respect and discipline,

[Your Name]
Principal Systems Architect, Jadai Studios`,
  },
  {
    id: 'tmpl-resume',
    title: 'Lead Systems Architect Resume',
    category: 'resume',
    description: 'Executive Summary → Core Invariants → Experience → Stack',
    scaffoldText: `# [YOUR NAME]
**Principal Software Architect & Systems Craftsman**
[City, Country] • [Email] • [Portfolio URL] • [GitHub/X]

---

### EXECUTIVE SUMMARY
Systems engineer specializing in high-throughput distributed applications, zero-telemetry local-first architectures, and multi-tier AI failover pipelines. Proven record of designing 20+ table relational schemas with idempotent Row-Level Security and reducing cloud infrastructure costs by 68%.

---

### CORE EXPERTISE
- **Architectures**: Local-First IndexedDB, Edge Computing, PostgreSQL RLS, WebSockets, PWAs
- **Inference**: Multi-Tier AI Gateway (Groq LPU primary to Gemini fallback to SHA-256 cache)
- **Languages & Frameworks**: TypeScript, React 19, Next.js, Node.js, Express, Tailwind CSS

---

### PROFESSIONAL EXPERIENCE
**Principal Architect** | Jadai Studios (2024 – Present)
- Engineered high-precision developer platform serving 18,000+ monthly requests with sub-40ms edge TTFB.
- Built Canva-grade document vector engine (FORGE) and multi-model visual synthesis suite (MIRAGE).
- Implemented dual-currency Paystack checkout pipeline with cryptographic HMAC-SHA512 webhook validation.

**Senior Full-Stack Engineer** | [Previous Company] (2022 – 2024)
- Redesigned core customer database from fragmented NoSQL to PostgreSQL with row-level security.
- Scaled background worker throughput by 400% through queue partitioning.

---

### EDUCATION & CREDENTIALS
- B.Sc. Computer Science / Systems Engineering
- Advanced Cryptographic Data Structures Certification`,
  },
  {
    id: 'tmpl-chapter',
    title: 'Novel Chapter Framework',
    category: 'book',
    description: 'Scene Setting → Objective → Complication → The Cliffhanger',
    scaffoldText: `# ACT II // CHAPTER FOUR: THE ARCHITECT'S CONFESSION

### 1. Scene Setting
The wind off the Shere Hills carried the smell of rain that wouldn't fall. The workshop lanterns flickered against the raw granite wall.

### 2. The Inciting Tension
Every measurement on the brass vernier caliper showed the pillar was four millimeters out of plumb. Four millimeters was the difference between a cathedral and an avalanche.

### 3. The Dialogue
"Tear it down," Jesse said.
"We're three weeks behind schedule," replied the stonecutter. "Nobody will notice four millimeters."
"Gravity will."

### 4. The Rising Action & Turn
Jesse took the sledgehammer from the rack. The iron head was cold. He didn't raise it against the stonecutter—he swung it directly into the keystone they had spent two months carving.

### 5. Cliffhanger Ending
As the dust settled, something metallic clicked inside the cavity of the broken stone. It wasn't granite. It was a brass cylinder marked with the sigil of a kingdom that fell three hundred years ago.`,
  },
];

export const TONE_OPTIONS: Array<{ id: ToneId; label: string; desc: string }> = [
  { id: 'warm', label: 'Warm', desc: 'Approachable, generous, human connection' },
  { id: 'direct', label: 'Direct', desc: 'Unsparing, crisp, zero filler words' },
  { id: 'formal', label: 'Formal', desc: 'Diplomatic, elevated, high-court precision' },
  { id: 'casual', label: 'Casual', desc: 'Colloquial, effortless, conversational' },
  { id: 'poetic', label: 'Poetic', desc: 'Lyrical, cadence-focused, vivid imagery' },
  { id: 'cunning', label: 'Cunning', desc: 'Subtextual, sharp, psychologically acute' },
];

// ============================================================================
// INDEXEDDB WRITER MEMORY STORAGE
// ============================================================================

const DB_NAME = 'jadai_writer_room_db';
const DB_VERSION = 1;
const STORE_NAME = 'writer_memory';

export async function openWriterDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return null;

  return new Promise((resolve) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('Could not open Writer Room IndexedDB, using fallback.');
      resolve(null);
    };
  });
}

const DEFAULT_MEMORY_PROFILE: WriterMemoryProfile = {
  youWrite: [
    'First-principles clarity and technical grounding',
    'Sensory and physical metaphors over empty corporate abstractions',
    'Short, weight-bearing declarations followed by expansive reasoning',
    'Direct address with high personal integrity',
  ],
  youAvoid: [
    'Corporate buzzwords ("synergy", "paradigm shift", "circle back")',
    'Hedging phrases ("I think that maybe we could consider")',
    'Formulaic AI tropes ("It\'s not just X, but Y")',
    'Gratuitous exclamation marks and synthetic optimism',
  ],
  recurringThemes: [
    'Building the floor',
    'Offline durability',
    'Technical sovereignty',
    'Craftsmanship under constraint',
    'Truth in systems',
  ],
  voiceProfile: {
    primaryTone: 'direct',
    avgSentenceLength: 'varied',
    vocabularyLevel: 'philosophical',
    cadenceScore: 92,
  },
  totalSessions: 1,
  lastUpdated: new Date().toISOString(),
};

export async function loadWriterMemory(): Promise<WriterMemoryProfile> {
  try {
    const db = await openWriterDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get('profile');

        req.onsuccess = () => {
          if (req.result?.data) {
            resolve(req.result.data);
          } else {
            resolve(DEFAULT_MEMORY_PROFILE);
          }
        };
        req.onerror = () => resolve(DEFAULT_MEMORY_PROFILE);
      });
    }
  } catch (err) {
    console.warn('IndexedDB read error:', err);
  }

  // LocalStorage fallback
  try {
    const local = localStorage.getItem('jadai_writer_memory_profile');
    if (local) return JSON.parse(local);
  } catch {}

  return DEFAULT_MEMORY_PROFILE;
}

export async function saveWriterMemory(profile: WriterMemoryProfile): Promise<void> {
  try {
    const db = await openWriterDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ key: 'profile', data: profile, updated: new Date().toISOString() });
    }
  } catch (err) {
    console.warn('IndexedDB write error:', err);
  }

  try {
    localStorage.setItem('jadai_writer_memory_profile', JSON.stringify(profile));
  } catch {}
}

export async function recordAcceptedSuggestion(keywordOrPattern: string): Promise<void> {
  const current = await loadWriterMemory();
  if (!current.youWrite.includes(keywordOrPattern) && keywordOrPattern.length > 5) {
    current.youWrite.unshift(keywordOrPattern);
    if (current.youWrite.length > 12) current.youWrite.pop();
    current.totalSessions += 1;
    current.lastUpdated = new Date().toISOString();
    await saveWriterMemory(current);
  }
}

export async function recordRejectedSuggestion(rejectedTopic: string): Promise<void> {
  const current = await loadWriterMemory();
  if (!current.youAvoid.includes(rejectedTopic) && rejectedTopic.length > 5) {
    current.youAvoid.unshift(rejectedTopic);
    if (current.youAvoid.length > 12) current.youAvoid.pop();
    current.lastUpdated = new Date().toISOString();
    await saveWriterMemory(current);
  }
}
