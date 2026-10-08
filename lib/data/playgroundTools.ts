export interface PlaygroundTool {
  slug: string;
  name: string;
  shortTag: string;
  iconName: string;
  category: 'playground';
  status: 'Live' | 'In Build' | 'Coming Soon';
  guestLimitPerDay?: number;
  why: string;
  what: string;
  howSteps: string[];
  beforeAfter: {
    beforeLabel: string;
    beforeContent: string;
    afterLabel: string;
    afterContent: string;
  };
  promptTemplate: string;
  backgroundImage: string;
  previewGif: string;
  defaultInputLabel: string;
  defaultInputPlaceholder: string;
  mockResultGenerator: (input: string) => Promise<string> | string;
}

export const PLAYGROUND_TOOLS: PlaygroundTool[] = [
  {
    slug: 'forge',
    name: 'FORGE',
    shortTag: 'Canva-Style Doc & Media Engine',
    iconName: 'doc-analyzer',
    category: 'playground',
    status: 'Live',
    guestLimitPerDay: 5,
    why: 'Documents and media should not be rigid, trapped pixels. They should be living digital constructs.',
    what: 'Drag and drop documents, images, or PDFs (up to 50MB). Reconstruct layouts with OCR, reposition canvas elements, and export to PDF, HTML, or SVG.',
    howSteps: [
      'Upload file or choose a starting template',
      'AI OCR reconstructs typography, bounding boxes, and images',
      'Drag, resize, edit, and restyle directly on the interactive canvas',
      'Export high-resolution PDF or structured HTML/JSON markup'
    ],
    beforeAfter: {
      beforeLabel: 'Static Scanned Asset',
      beforeContent: 'Uneditable flat PDF or photo with blurry typography and fixed layout.',
      afterLabel: 'Living Canvas',
      afterContent: 'Fully editable vector shapes, reconstructed text blocks, and structured metadata.'
    },
    promptTemplate: `Analyze this layout and reconstruct it into structured, editable vector and text elements: [INSERT DOCUMENT DATA]`,
    backgroundImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Document description or paste text',
    defaultInputPlaceholder: 'Contract agreement, executive slide deck, or product one-pager...',
    mockResultGenerator: () => `FORGE RECONSTRUCTION COMPLETE: 6 editable text blocks, 2 images, 1 vector table detected.`
  },
  {
    slug: 'oracle',
    name: 'ORACLE',
    shortTag: 'PRIME Living Intelligence',
    iconName: 'oracle',
    category: 'playground',
    status: 'Live',
    guestLimitPerDay: 10,
    why: 'Chatbots provide answers. The Oracle provides architectural foresight.',
    what: 'Deep contextual reasoning engine with device memory, multi-provider AI fallback (Groq, Gemini, local), and voice-driven persona synthesis.',
    howSteps: [
      'Enter your inquiry or architectural problem',
      'Select reasoning depth (Fast, Strategic, Deep Reasoning)',
      'Inspect streaming reasoning with source citations',
      'Save memory item to device storage for persistent context'
    ],
    beforeAfter: {
      beforeLabel: 'Generic AI Assistant',
      beforeContent: 'Superficial canned responses with no memory of your architecture.',
      afterLabel: 'PRIME Oracle Intelligence',
      afterContent: 'Ruthless strategic clarity grounded in your persistent sovereign context.'
    },
    promptTemplate: `Act as Jadai Prime Architect. Formulate a sovereign solution for: [INSERT INQUIRY]`,
    backgroundImage: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Strategic Prompt or Query',
    defaultInputPlaceholder: 'Design a resilient fault-tolerant distributed sync engine...',
    mockResultGenerator: () => `ORACLE TRANSMISSION: Architecture synthesized with zero single points of failure.`
  },
  {
    slug: 'mirage',
    name: 'MIRAGE',
    shortTag: 'Neural Visual Studio',
    iconName: 'blueprint-sketcher',
    category: 'playground',
    status: 'Live',
    guestLimitPerDay: 5,
    why: 'Visuals without mathematical discipline are noise. Mirage produces sacred artifacts.',
    what: 'Text-to-image with multi-provider fallback (Pollinations, HF, Together), logo & brand kit generation, 3D interactive preview, and Jadai art styling.',
    howSteps: [
      'Enter visual prompt or select brand mode',
      'Choose sacred geometry style and aspect ratio',
      'Generate high-resolution artifact',
      'Inspect 3D lighting tilt and download PNG/SVG'
    ],
    beforeAfter: {
      beforeLabel: 'Standard Stock Imagery',
      beforeContent: 'Generic corporate vectors with repetitive generic shapes.',
      afterLabel: 'Jadai Sacred Artifact',
      afterContent: 'Atmospheric gold and obsidian lighting with mathematical sacred geometry.'
    },
    promptTemplate: `Jadai sovereign aesthetic: [PROMPT], 8k resolution, cinematic lighting, obsidian black, liquid gold filigree.`,
    backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Visual prompt or brand identity',
    defaultInputPlaceholder: 'Floating citadel above golden cloud sea with sacred geometry sigil...',
    mockResultGenerator: () => `MIRAGE ARTIFACT: Rendered at 2048x2048 with dual gold-crimson edge glow.`
  },
  {
    slug: 'sentinel',
    name: 'SENTINEL',
    shortTag: 'Diagnostic & Link Telemetry',
    iconName: 'diagnostic',
    category: 'playground',
    status: 'Live',
    guestLimitPerDay: 5,
    why: 'You cannot optimize or secure what you do not continuously measure.',
    what: 'Comprehensive health checks (PageSpeed, SSL, latency, axe-core accessibility), domain RDAP conflict detection, link cloaking, and branded QR codes.',
    howSteps: [
      'Enter URL or domain for audit or shortening',
      'Run multi-dimensional security and latency scan',
      'Review AI-generated remediation fix guide',
      'Generate cloaked short link and sacred QR code'
    ],
    beforeAfter: {
      beforeLabel: 'Vulnerable & Opaque',
      beforeContent: 'Unchecked security vulnerabilities, broken links, and slow DNS resolution.',
      afterLabel: 'Hardened & Measured',
      afterContent: 'Sub-100ms response times, 100/100 accessibility, and cryptographically cloaked links.'
    },
    promptTemplate: `Audit and harden the following endpoint: [INSERT URL]`,
    backgroundImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Target URL or Domain Name',
    defaultInputPlaceholder: 'https://example.com or companydomain.io',
    mockResultGenerator: () => `SENTINEL AUDIT COMPLETE: 96/100 Health Score. All 14 security headers verified.`
  },
  {
    slug: 'diagnostic',
    name: 'Diagnostic',
    shortTag: 'Health & Architecture Audit',
    iconName: 'diagnostic',
    category: 'playground',
    status: 'Live',
    guestLimitPerDay: 3,
    why: 'Your site is talking. This is how you listen.',
    what: 'Paste a URL or domain. I check your speed, security, mobile-friendliness, DNS latency, and give you a prioritized fix list.',
    howSteps: [
      'Paste your sovereign URL',
      'Click Run Diagnostic Scan',
      'Review the categorized health & vulnerability score',
      'Deploy the prioritized fix list to your codebase'
    ],
    beforeAfter: {
      beforeLabel: 'Unmonitored Website',
      beforeContent: 'Status: Blind. TTFB 1420ms. Missing CSP headers. Unoptimized payload 4.8MB. 3 vulnerability flags.',
      afterLabel: 'Post-Audit Architecture',
      afterContent: 'Status: Optimal. TTFB 180ms. Strict CSP + HSTS active. Zero unminified assets. 100/100 Core Web Vitals.'
    },
    promptTemplate: `Act as Jadai Prime Architect. Audit the following URL for performance bottlenecks, security postures, and mobile responsiveness: [INSERT URL]. Return an unvarnished audit with a 4-step remediation plan.`,
    backgroundImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Target URL or IP Address',
    defaultInputPlaceholder: 'https://example.com',
    mockResultGenerator: (url) => `DIAGNOSTIC REPORT FOR: ${url}
STATUS: OPERATIONAL (Score: 94/100)
- Edge Latency: 42ms (Lagos / London peering)
- Security: TLS 1.3 Active, HSTS enabled, CSP strict
- DOM Weight: 28KB (Pristine)
- Fix recommendation: Compress background SVG meshes for sub-30ms first paint.`
  },
  {
    slug: 'doc-analyzer',
    name: 'Doc Analyzer',
    shortTag: 'Contract & Thesis Intelligence',
    iconName: 'doc-analyzer',
    category: 'playground',
    status: 'Live',
    guestLimitPerDay: 2,
    why: 'Complexity hides compromises. Clarity enforces autonomy.',
    what: 'Upload or paste legal contracts, technical specifications, or investment agreements. I highlight hidden clauses, liability traps, and structural loopholes.',
    howSteps: [
      'Paste the text or terms of your agreement',
      'Select audit strictness (Standard vs Forensic)',
      'Inspect highlighted risk vectors and ambiguity flags',
      'Export the redline recommendations'
    ],
    beforeAfter: {
      beforeLabel: '40-Page Raw Agreement',
      beforeContent: 'Dense legalese concealing perpetual IP assignment and ambiguous 90-day indemnity liability.',
      afterLabel: 'PRIME Forensic Breakdown',
      afterContent: 'Clause 8.3 Flagged: High Risk. 2 Hidden IP assignments identified. Redlined amendment generated.'
    },
    promptTemplate: `Analyze this agreement with legal-technical precision. Extract: 1. Core Obligations, 2. Ambiguity & Trap Clauses, 3. Non-reciprocal indemnities, 4. Strategic counter-proposals: [INSERT TEXT]`,
    backgroundImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Document Content or Clause',
    defaultInputPlaceholder: 'Paste the terms of service, partnership clause, or contract excerpt here...',
    mockResultGenerator: (text) => `DOCUMENT AUDIT COMPLETE
- Risk Quotient: Moderate (2 traps detected)
- Critical Flag: Section 4.2 gives unilateral termination without cure period.
- Protective Counter: "Add standard 30-day written cure notice before cessation."`
  },
  {
    slug: 'link-shortener',
    name: 'Link Shortener',
    shortTag: 'Studio URL Engine',
    iconName: 'hub',
    category: 'playground',
    status: 'Live',
    guestLimitPerDay: 5,
    why: 'Every destination starts with an elegant signal.',
    what: 'Transform bloated affiliate links and long URLs into branded, lightning-fast Jadai dispatch vectors with built-in analytics.',
    howSteps: [
      'Paste your long destination URL',
      'Optionally assign a custom slug or keyword',
      'Generate your encrypted Jadai dispatch link',
      'Track referral telemetry without invasive tracking cookies'
    ],
    beforeAfter: {
      beforeLabel: 'Raw URL',
      beforeContent: 'https://cdn.platform.com/dist/v2/items/archive/ref?user=8491823&campaign=spring&trk_id=9941a87',
      afterLabel: 'Jadai Dispatch',
      afterContent: 'https://jadai.studio/s/quantum • Fast 12ms redirect, 0 trackers, QR signature included.'
    },
    promptTemplate: `Generate a privacy-preserving short URL slug with metadata verification for: [INSERT URL]`,
    backgroundImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Long Destination URL',
    defaultInputPlaceholder: 'https://mywebsite.com/very/long/complex/resource/path',
    mockResultGenerator: (url) => `SHORT LINK CREATED:
https://jadai.studio/s/${Math.random().toString(36).substring(2, 7)}
Destination: ${url}
Redirect Latency: ~14ms | Encryption: AES-256 routing`
  },
  {
    slug: 'gif-maker',
    name: 'GIF Maker',
    shortTag: 'Cinematic Loop Synthesizer',
    iconName: 'work',
    category: 'playground',
    status: 'Live',
    guestLimitPerDay: 1,
    why: 'Motion captures what static pixels leave to doubt.',
    what: 'Convert screen recordings, image bursts, or video snippets into featherweight, cinematic looping GIFs optimized for product launches.',
    howSteps: [
      'Upload clip or specify video frame sequence',
      'Set target FPS (15-60) and color quantization palette',
      'Crop focus zone and preview seamless loop points',
      'Export high-fidelity, sub-2MB visual asset'
    ],
    beforeAfter: {
      beforeLabel: 'Heavy 42MB MP4',
      beforeContent: 'Slow to load on mobile, buffering issues, clunky media controls required.',
      afterLabel: 'Silk-Smooth 1.4MB Looping GIF',
      afterContent: 'Instant playback, zero jitter, 60fps illusion with selective color quantization.'
    },
    promptTemplate: `Create an optimized looping GIF sequence from these keyframes with void-and-gold aesthetic: [SPECIFY FRAMES]`,
    backgroundImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Animation Description or Frame Script',
    defaultInputPlaceholder: 'e.g. Glowing gold particle burst rotating around a black vault dial',
    mockResultGenerator: (desc) => `GIF SYNTHESIZED:
Asset: ${desc.slice(0, 30)}...
Frames: 48 frames @ 24fps
Loop Mode: Seamless Ping-Pong
File Weight: 1.18 MB (Compressed with Jadai Void Quantizer)`
  },
  {
    slug: 'thumbnail-generator',
    name: 'Thumbnail Generator',
    shortTag: 'Click-Through Architecture',
    iconName: 'marketplace',
    category: 'playground',
    status: 'Live',
    why: 'The doorway determines whether anyone ever walks inside.',
    what: 'Design high-converting, cinematic social cards and video thumbnails using high-contrast typography, void backdrops, and gold highlights.',
    howSteps: [
      'Enter title and subject premise',
      'Select visual archetype (Cinematic, Technical, Minimalist)',
      'Preview with platform safe-zones (YouTube, X, LinkedIn)',
      'Download 4K crisp export ready for publishing'
    ],
    beforeAfter: {
      beforeLabel: 'Generic Stock Card',
      beforeContent: 'Blurry background, unreadable serif text on mobile, low CTR (< 2%).',
      afterLabel: 'Jadai Aeroluxe Thumbnail',
      afterContent: 'Cinzel bold typography, 3D golden glow accents, high-contrast silhouette (> 11% CTR).'
    },
    promptTemplate: `Generate a YouTube thumbnail composition for: [TITLE]. Include focal element, facial expression, backdrop lighting, and 3-word bold typography punchline.`,
    backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Headline / Episode Title',
    defaultInputPlaceholder: 'e.g. The Lie of Minimum Viable Product',
    mockResultGenerator: (title) => `THUMBNAIL BLUEPRINT GENERATED:
Primary Focus: "${title.toUpperCase()}"
Palette: Obsidian (#050404) + Imperial Gold (#C9A84C) + Sepia Highlight
Safe Zones: Verified for YouTube 16:9 and Twitter Card 1.91:1`
  },
  {
    slug: 'resume-editor',
    name: 'Resume Editor',
    shortTag: 'Career Narrative Engine',
    iconName: 'resume-editor',
    category: 'playground',
    status: 'Live',
    why: 'You are not a list of bullet points. You are an engineering trajectory.',
    what: 'Rewrite weak CV bullets into undeniable proof of impact. Aligns your narrative with top-tier sovereign roles.',
    howSteps: [
      'Paste your existing bullet points or job summary',
      'Select role target (Founder, Staff Engineer, Product Lead)',
      'Transform passive phrasing into quantifiable accomplishments',
      'Export formatted ATS-proof Markdown or PDF'
    ],
    beforeAfter: {
      beforeLabel: 'Passive CV Bullets',
      beforeContent: '"Responsible for maintaining web applications and participating in team meetings."',
      afterLabel: 'Jadai Impact',
      afterContent: '"Architected sub-50ms distributed cache reducing cloud egress by 42% across 180k daily sessions."'
    },
    promptTemplate: `Refactor this resume excerpt to use X-Y-Z formula (Accomplished [X], measured by [Y], by doing [Z]): [INSERT CV]`,
    backgroundImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Existing CV Bullet or Bio',
    defaultInputPlaceholder: 'Paste your current resume section or experience draft...',
    mockResultGenerator: (text) => `REFINED CAREER DOSSIER:
• Spearheaded architecture migration for: ${text.slice(0, 40)}
• Engineered resilient multi-tier fallback architecture, eliminating 99.8% of user-facing outages.
• Designed deterministic testing harness cutting QA release cycle from 4 days to 40 minutes.`
  },
  {
    slug: 'logo-designer',
    name: 'Logo Designer',
    shortTag: 'Sacred Sigil Studio',
    iconName: 'oracle',
    category: 'playground',
    status: 'Live',
    why: 'A mark is an oath etched into geometry.',
    what: 'Generate sacred geometry marks, minimalistic crests, and vector sigils built on mathematical grids.',
    howSteps: [
      'Enter brand name and core philosophical tension',
      'Choose sacred geometry foundation (Hexagonal, Metatron, Fibonacci)',
      'Preview on dark obsidian and architectural drafting paper',
      'Export SVG vectors with responsive scale lock'
    ],
    beforeAfter: {
      beforeLabel: 'Generic Clip-Art Icon',
      beforeContent: 'Unoriginal stock lightbulb icon without grid structure or memorable silhouette.',
      afterLabel: 'Sacred Sigil',
      afterContent: 'Golden ratio interlocking hexagonal bounds with concentric rings and crisp 0.5px line weight.'
    },
    promptTemplate: `Design a sacred geometry vector logo concept for: [BRAND]. Detail grid structure, symbolism, stroke width, and negative space geometry.`,
    backgroundImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Brand Name & Concept',
    defaultInputPlaceholder: 'e.g. Aether Dynamics — Orbital satellite logistics',
    mockResultGenerator: (brand) => `SIGIL SPECIFICATION FOR: ${brand}
- Geometry: Concentric Dodecagram with dual outer orbit rings
- Aspect: 1:1 Sacred Hexagonal Matrix
- Stroke: 1.5px gold hairline with 0.8 contrast ratio
- Vector Coordinates: Rendered to clean inline SVG blueprint`
  },
  {
    slug: 'writing-assistant',
    name: 'Writing Assistant',
    shortTag: 'Socratic Prose Polisher',
    iconName: 'book-of-lies',
    category: 'playground',
    status: 'Live',
    why: 'Fluff is the enemy of transmission. Cut until only truth remains.',
    what: 'Edit essays, dispatches, and public manifestos. Strips out corporate buzzwords, passive hedging, and AI clichés.',
    howSteps: [
      'Paste your draft or paragraph',
      'Toggle tone filter (Authoritative, Unforgiving, Socratic)',
      'Review side-by-side cadence and rhythm corrections',
      'Copy polished prose ready for publication'
    ],
    beforeAfter: {
      beforeLabel: 'Corporate Slop',
      beforeContent: '"In today’s fast-paced digital landscape, leveraging synergistic paradigm shifts is mission critical..."',
      afterLabel: 'Direct Studio Prose',
      afterContent: '"Build the floor first. When systems fail under pressure, only simple architecture survives."'
    },
    promptTemplate: `Rewrite this text to eliminate corporate jargon, filler, and throat-clearing. Keep it punchy, rhythmic, and authoritative: [INSERT DRAFT]`,
    backgroundImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Draft Paragraph to Hone',
    defaultInputPlaceholder: 'Paste your draft essay, article, or announcement here...',
    mockResultGenerator: (text) => `POLISHED PROSE:
${text.split('. ').map(s => s.trim()).filter(Boolean).slice(0, 2).join('. ')}.
No decoration. No hesitation. When the foundation holds, everything above it stands on bedrock.`
  },
  {
    slug: 'ghostwriter',
    name: 'Ghostwriter',
    shortTag: 'Executive Voice Synthesis',
    iconName: 'oracle',
    category: 'playground',
    status: 'Live',
    why: 'Leaders think in lightning; translation into words shouldn’t slow the storm.',
    what: 'Dictate or jot bullet thoughts. Ghostwriter crafts full-length authoritative articles and viral threads in your exact voice.',
    howSteps: [
      'Provide your voice samples or raw bullet notes',
      'Select output medium (X Thread, Substack Dispatch, LinkedIn Essay)',
      'Review synthesized draft formatted with dramatic pacing',
      'Make quick line edits and schedule distribution'
    ],
    beforeAfter: {
      beforeLabel: '3 Scrambled Voice Notes',
      beforeContent: '"Need to talk about why offshore teams fail when docs aren\'t clear and how we fixed it with tests."',
      afterLabel: 'High-Impact 7-Part Dispatch',
      afterContent: 'Full narrative thread with provocative hook, real metrics, and counter-intuitive takeaways.'
    },
    promptTemplate: `Act as high-level executive ghostwriter. Convert these bullet thoughts into a compelling 6-tweet thread or 500-word essay: [INSERT THOUGHTS]`,
    backgroundImage: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Raw Thoughts / Notes',
    defaultInputPlaceholder: 'Jot down raw thoughts, bullet points, or voice memo transcript...',
    mockResultGenerator: (notes) => `GHOSTWRITTEN DISPATCH:
Hook: Most builders mistake motion for progress. Here is what actually happened:
1. ${notes.slice(0, 60)}
2. We stopped debating edge cases and codified the invariant.
3. Within 14 days, throughput doubled while error rates plunged to zero.
Takeaway: Structure precedes speed.`
  },
  {
    slug: 'book-writer',
    name: 'Book Writer',
    shortTag: 'Manuscript Architecture',
    iconName: 'book-of-lies',
    category: 'playground',
    status: 'Live',
    why: 'A book is a cathedral of thought. Every chapter needs structural load calculations.',
    what: 'Outline, structure, and chapter-by-chapter draft full non-fiction books or serialized fiction with thematic depth.',
    howSteps: [
      'Define core thesis and the central lie you intend to demolish',
      'Generate a 12-chapter progression with rising thematic stakes',
      'Flesh out chapters with historical analogies and visceral scenes',
      'Export completed manuscript in publication-ready formats'
    ],
    beforeAfter: {
      beforeLabel: 'Blank Page & Vague Idea',
      beforeContent: 'An inspiring idea trapped in writer\'s block with no clear chapter structure.',
      afterLabel: 'Complete 12-Chapter Codex',
      afterContent: 'Comprehensive arc, thematic motifs, character dilemmas, and 45,000 words planned systematically.'
    },
    promptTemplate: `You are the Master Manuscript Architect. Outline a 10-chapter book exploring this theme: [THEME]. Provide chapter titles, central arguments, and narrative anchors.`,
    backgroundImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Book Theme & Target Lie',
    defaultInputPlaceholder: 'e.g. The Myth of Overnight Success in African Tech Ecosystems',
    mockResultGenerator: (theme) => `BOOK ARCHITECTURE BLUEPRINT:
Title: THE FOUNDATION PRINCIPLE
Theme: ${theme}
• Act I: The Illusion (Chapters 1-3) — Dismantling the false promise
• Act II: The Crucible (Chapters 4-7) — Surviving the valley of obscurity
• Act III: The Resilient Citadel (Chapters 8-10) — Enduring durability`
  },
  {
    slug: 'growth-maker',
    name: 'Growth Maker',
    shortTag: 'Distribution Flywheel',
    iconName: 'growth-maker',
    category: 'playground',
    status: 'Live',
    why: 'A masterpiece undiscovered is a tragic failure.',
    what: 'Develop organic growth engines, programmatic referral loops, and go-to-market funnels that don’t rely on paid ads.',
    howSteps: [
      'Input your product offering and customer profile',
      'Select growth vector (Viral Loop, SEO Matrix, Community Flywheel)',
      'Generate step-by-step 30-day distribution roadmap',
      'Execute tactical channel plays with real tracking benchmarks'
    ],
    beforeAfter: {
      beforeLabel: 'Burning Ad Budget',
      beforeContent: '$5,000 wasted on generic Google Ads with 0.8% conversion and 85% churn.',
      afterLabel: 'Organic Flywheel Loop',
      afterContent: 'Built-in product viral loops bringing 1.4x organic referrals per active user.'
    },
    promptTemplate: `Formulate an organic distribution strategy for: [PRODUCT]. Emphasize zero-ad-spend distribution flywheels, social engineering hooks, and retention loops.`,
    backgroundImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'Product Concept & Value Prop',
    defaultInputPlaceholder: 'e.g. Collaborative design suite for West African animators',
    mockResultGenerator: (prod) => `GROWTH STRATEGY BLUEPRINT:
Product: ${prod}
Vector 1: Open Source Starter Kernels (Top of Funnel)
Vector 2: Watermarked Asset Sharing (Organic Viral Coefficient: 1.34)
Vector 3: High-Signal Developer Bounties & Showcase Hall`
  },
  {
    slug: 'blueprint-sketcher',
    name: 'Blueprint Sketcher',
    shortTag: 'System Topology Modeler',
    iconName: 'diagnostic',
    category: 'playground',
    status: 'Live',
    why: 'If you cannot draw your architecture on a napkin, you do not understand it.',
    what: 'Turn text descriptions of software systems into clean ASCII and SVG architecture diagrams with database schemas and edge routing.',
    howSteps: [
      'Describe your software stack and user flow',
      'Select topology format (Microservices, Event-Driven, Modular Monolith)',
      'Inspect generated system diagram and latency boundaries',
      'Export vector diagram or Mermaid.js markup'
    ],
    beforeAfter: {
      beforeLabel: 'Unstructured Mental Model',
      beforeContent: 'Developers arguing over database write paths with conflicting assumptions.',
      afterLabel: 'Formal ASCII Topology',
      afterContent: 'Deterministic data flow diagram with explicit fallback nodes and clear service boundaries.'
    },
    promptTemplate: `Generate an ASCII and Mermaid.js architecture diagram for this system flow: [SYSTEM DESCRIPTION]`,
    backgroundImage: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80',
    previewGif: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&auto=format&fit=crop&q=80',
    defaultInputLabel: 'System Description',
    defaultInputPlaceholder: 'e.g. Next.js web client, Express proxy, Supabase DB, Redis cache, Paystack webhook',
    mockResultGenerator: (sys) => `SYSTEM TOPOLOGY FOR: ${sys.slice(0, 30)}
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│ Client (Web)│ ───>  │  Edge Proxy  │ ───>  │ Primary DB  │
└─────────────┘       └──────┬───────┘       └─────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  Fallback AI │
                      └──────────────┘`
  },
];

export function getPlaygroundTool(slug: string): PlaygroundTool | undefined {
  return PLAYGROUND_TOOLS.find((t) => t.slug === slug);
}
