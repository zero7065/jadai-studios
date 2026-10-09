'use client';

import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import EdgeGlow from '../ui/EdgeGlow';
import { useToast } from '../providers/ToastProvider';
import { useCurrency } from '../providers/CurrencyProvider';
import { StudioAudio } from '../../lib/watermark';
import { askPrime } from '../../lib/ai/memory';
import {
  Feather,
  BookOpen,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  RotateCcw,
  Sliders,
  Send,
  Eye,
  FileText,
  Clock,
  Flame,
  Coffee,
  Bookmark,
  Share2,
  Trash2,
  HelpCircle,
  Shield,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export type WritingStyleMode =
  | 'in-media-res'
  | 'shakespearean'
  | 'socratic-mirror'
  | 'novel-narrative'
  | 'executive-memoir'
  | 'philosophical-essay';

interface WritingBlueprint {
  id: WritingStyleMode;
  name: string;
  tagline: string;
  description: string;
  energy: string;
  structurePattern: string[];
  starterPrompts: string[];
  sampleOpening: {
    title: string;
    text: string;
  };
}

const WRITING_BLUEPRINTS: Record<WritingStyleMode, WritingBlueprint> = {
  'in-media-res': {
    id: 'in-media-res',
    name: 'Mid-Thought & Climax First',
    tagline: 'Start at the wreckage. Then backtrack through the fractured mosaic.',
    description: 'Begin mid-thought, mid-sentence, mid-explosion at the end. State the visceral reality first with sharp honesty, then unravel the fragments that led here. Highly engaging, motive-driven, impossible to put down.',
    energy: '⚡ Kinetic, Savage, Puzzle-Mosaic',
    structurePattern: [
      '1. The Fractured Climax (The fire is already burning; no prologue)',
      '2. Fragment I — The Unseen Compromise (How the first domino tipped)',
      '3. Fragment II — The Warning We Laughed At (The blind spot revealed)',
      '4. The Mirror Moment (The confrontation between ego and truth)',
      '5. The Resonant Strike (The loop closes; truth remains)',
    ],
    starterPrompts: [
      'The server was already on fire when the CEO tweeted about record quarterly resilience.',
      'We never spoke about the contract after the third glass of palm wine.',
      'I was holding the check for three million dollars, and my hands were shaking for all the wrong reasons.',
    ],
    sampleOpening: {
      title: 'The Ledger on the Asphalt',
      text: `The rain was already washing the ink into grey ribbons before either of us thought to pick up the briefcase. Three months of audited accounts, ninety-six thousand dollars in unsigned promissory notes, and the wet sound of tires hissing past on the Jos expressway.

"You knew the second offshore account was unregistered," she said, not looking at me. She was wiping water from the rim of her glasses with a linen handkerchief that was already soaked through.

"I knew the code compiled," I answered. That was the extent of my defense. That had always been the extent of it.

To understand why two grown engineers were kneeling in highland mud at two in the morning, you have to rewind eighty days to a rooftop in London where someone first said the word 'frictionless.' Every disaster begins with an adjective that sounds too polite to audit.`,
    },
  },

  'shakespearean': {
    id: 'shakespearean',
    name: 'Shakespearean Savage Tragicomedy',
    tagline: 'Poetic bite, lyrical venom, and fatal flaws laid bare.',
    description: 'High dramatic stakes coupled with savage wit. Internal soliloquies, razor-sharp dialogue, and tragic ironies where characters dig their own elegant graves with diamond shovels.',
    energy: '🎭 Eloquent, Biting, Theatrical Gravity',
    structurePattern: [
      '1. The Prologue of Ambition (The fatal desire announced)',
      '2. The Courtly Duel (Sharp dialogue masking ruthless intent)',
      '3. The Soliloquy in the Dark (The confession of cowardice or pride)',
      '4. The Reversal of Fortune (The trap springs on its maker)',
      '5. The Sarcastic Epilogue (The fool speaks the only lasting truth)',
    ],
    starterPrompts: [
      'To boast of code before the compiler speaks is to count widows before the drums are beat.',
      'He wore his equity like a cardinal’s robe, forgetting that robes burn fastest near the hearth.',
      'Speak not to me of scale, sweet architect, while thy north gate swings unhinged upon the wind.',
    ],
    sampleOpening: {
      title: 'The Duke of Floating Points',
      text: `He called himself an architect, yet the very stones beneath his slippers cried out in protest. For forty days and forty sleepless midnights, he had paced the gallery of the guildhall, reciting the virtues of his invisible tower.

"Behold," quoth he to the yawning apprentices, "a citadel so light it touches neither earth nor tax rolls! It floats upon the cloud of the emperor’s benevolence!"

"Ay, my lord," whispered the master mason, blowing lime-dust from his thumbs, "yet when the winter sleet arrives, where shall the scullery maids boil the porridge? Clouds make indifferent kitchens."

Pride hath this peculiar blindness: it mistaketh the size of its own shadow for the height of the sun. The duke laughed, signed the treasury bond with purple ink, and walked into the blizzard wearing nothing but his reputation.`,
    },
  },

  'socratic-mirror': {
    id: 'socratic-mirror',
    name: 'The Socratic Mirror (Book of Lies Style)',
    tagline: 'A ruthless, funny, intentional mirror held to human vanity.',
    description: 'Deep allegories and paradoxical truths. Short, unforgettable parables that strip away modern corporate, creative, and ego-driven delusions. Leaves the reader laughing, wincing, and reflecting.',
    energy: '🪞 Reflective, Savage Wit, Grounded Truth',
    structurePattern: [
      '1. The Apparent Success (The monument or boast displayed)',
      '2. The Inconvenient Constraint (Nature or reality taps on the door)',
      '3. The Anatomy of the Lie (Where vanity substituted for foundation)',
      '4. The Collapse / Unmasking (The quiet, unspectacular puncture)',
      '5. The Inscription (One unforgettable truth to build by)',
    ],
    starterPrompts: [
      'The sculptor spent forty years polishing his marble twin, then died of frostbite leaning against it.',
      'He had two million followers and not one friend who would lend him a tire wrench in the rain.',
      'We built an AI that could summarize a thousand books in a second, and forgot how to read one with an open heart.',
    ],
    sampleOpening: {
      title: 'The Merchant of Unbaked Bread',
      text: `In the market square of Old Kano, a baker opened a stall adorned with golden silk banners. His placards promised bread so light it would cure grief, baked with flour milled on the peaks of the Moon.

A line of eager merchants formed by sunrise, clutching copper coins.

"When may we taste the loaf?" an old weaver asked, sniffing the air, which smelled purely of sandalwood perfume and dried grass.

"To chew is vulgar," the baker smiled, adjusting his embroidered sash. "We sell the anticipated satisfaction of nourishment. True connoisseurs do not soil their teeth with gluten."

For three weeks, the baker grew wealthy on the imagination of hungry men. On the twenty-second day, a wandering beggar with empty eyes walked past the stall, picked up a decorative golden loaf, bit into it, and found it was hollow papier-mâché stuffed with cotton rags.

The crowd gasped. The beggar swallowed a mouthful of painted paper, wiped his chin, and said: "It has a pleasing texture, but it leaves the belly cold."

Never mistake the menu for the meal. The stomach is a merciless auditor.`,
    },
  },

  'novel-narrative': {
    id: 'novel-narrative',
    name: 'Modern Literary Fiction & Noir',
    tagline: 'Sensory atmosphere, rhythmic cadence, and unvarnished character truth.',
    description: 'Rich atmospheric storytelling with economic prose. Focuses on tension, subtext, sensory details of the room, and dialogue where what is unsaid carries the weight.',
    energy: '🌧 Cinematic, Atmospheric, Tight Prose',
    structurePattern: [
      '1. Sensory Anchor (The smell of coffee, rain on zinc, stale tobacco)',
      '2. The Lingering Friction (Two people in a room who know too much)',
      '3. The Escalating Stake (A choice that cannot be undone)',
      '4. The Quiet Revelation (A detail that changes the whole history)',
      '5. The Open Horizon (Life continues, altered forever)',
    ],
    starterPrompts: [
      'The neon sign outside the diner hummed in B-flat, exactly half a step out of tune with the rain.',
      'She knew he was lying because his hands were completely still. He only stayed still when he was calculating the exit.',
      'We kept the company running for six months after the money ran out, mostly out of spite and instant noodles.',
    ],
    sampleOpening: {
      title: 'The Highland Cold',
      text: `The generator outside the studio coughed twice and died just as the third chapter reached its climax. In Jos, silence is never empty; it is immediately filled by the wind dragging eucalyptus branches across corrugated zinc roofs.

David sat in the dark with the amber glow of his battery dying at seven percent.

"We have two candles in the kitchen," Aisha’s voice came from the doorway. She didn’t turn on her phone flashlight. In thirteen years together, neither of them needed a light to cross that hallway.

"The server didn't save the ending," he said.

"Good," she said, striking a match against the sulfur strip with a dry crack. The flame lit her cheekbones and the quiet amusement in her dark eyes. "The ending you had was too safe. Now write what actually happened."`,
    },
  },

  'executive-memoir': {
    id: 'executive-memoir',
    name: 'Executive Memoir & Ghostwritten Legacy',
    tagline: 'Capturing the raw authentic founder voice and private decisions.',
    description: 'Unfiltered lessons, battle scars, private board room moments, and personal principles. Transmutes chaotic life experience into a coherent, inspirational legacy manuscript.',
    energy: '🏆 Authoritative, Candid, Transformational',
    structurePattern: [
      '1. The Uncomfortable Premise (The consensus was wrong)',
      '2. The Crossroads Crisis (When everything was on the brink)',
      '3. The Unsung Decision (What I did when the room was silent)',
      '4. The Scar & The Lesson (What the failure cost me)',
      '5. The Blueprint for Tomorrow (What you can build with this)',
    ],
    starterPrompts: [
      'The day we signed the acquisition was the loneliest day of my professional career.',
      'Leadership is mostly telling people the truth they already know, but are terrified to say out loud.',
      'If you have never looked at your payroll spreadsheet with two days left and zero dollars in the bank, you have never truly run a company.',
    ],
    sampleOpening: {
      title: 'The Midnight Payroll',
      text: `Every founder remembers their third winter. Not the first—the first is pure adrenaline and naive optimism. It is the third winter, when the initial seed money is gone, your co-founder has begun taking calls from recruiters, and twenty-four people expect their direct deposit on Friday morning.

I was thirty-four years old, sitting in a parked Peugeot on the side of Yakubu Gowon Way, calculating whether my mother’s house deed could be leveraged without her knowing.

The easiest lie in entrepreneurship is the one you tell on LinkedIn. You post about 'exponential headwinds' and 'pivoting towards synergistic value.' But at 3:00 AM, in a cold car with the smell of exhaust, there are no synergies. There is only whether you have the stomach to face your team at 9:00 AM and tell them you made a mistake, or whether you find the money before the sun crests the plateau.

I found the money. But it cost me something I spent the next decade trying to buy back.`,
    },
  },

  'philosophical-essay': {
    id: 'philosophical-essay',
    name: 'Philosophical Polemic & Essay',
    tagline: 'Aphoristic discipline, moral clarity, and intellectual rigor.',
    description: 'Challenging modern dogmas with socratic precision. Clean deductive reasoning, unforgettable metaphors, and prose designed to endure beyond transient hype cycles.',
    energy: '🏛 Socratic, Crystalline, Unyielding',
    structurePattern: [
      '1. The Dogma Stated (What everyone foolishly believes)',
      '2. The Hidden Cost (The quiet decay it produces)',
      '3. The Counter-Invariant (The physical or moral law that refutes it)',
      '4. The Test of Fire (How this law behaves in the storm)',
      '5. The Call to Bedrock (How to stand firmly upon truth)',
    ],
    starterPrompts: [
      'We have created an entire economy of frictionless illusions because friction requires patience.',
      'A civilization that cannot read a 300-page book will soon be governed by slogans on 15-second videos.',
      'True wealth is not the capacity to purchase luxuries, but the sovereign ability to walk away from tables that cost your peace.',
    ],
    sampleOpening: {
      title: 'The Cult of Frictionless Air',
      text: `Modern software has declared war on resistance. Every product manager promises you a world without waiting, without learning curves, without the tactile weight of effort. Click here; receive dopamine. Swipe there; acquire debt.

Yet in nature, friction is not an error; it is the sole reason your feet do not slip uncontrollably across the ice.

When you remove all resistance from human life, you do not produce angels of leisure; you produce brittle, anxious spirits incapable of withstanding a mild breeze of contradiction. The muscle that is never strained atrophies. The mind that never labors through dense prose becomes a passive receptacle for whoever shouts loudest.

Build the floor with friction. Honor the stone that makes your palms bleed before it yields an arch.`,
    },
  },
};

const COMMISSION_SERVICES = [
  {
    id: 'full-book-ghostwriting',
    name: 'Complete Book Ghostwriting & Architecture',
    subtitle: 'From Unorganized Gists to a 200+ Page Masterpiece',
    turnaround: '8–12 Weeks',
    priceUsd: 2800,
    priceNgn: 4200000,
    features: [
      '10 In-depth audio interview sessions & voice transcription',
      'Novel or memoir-grade narrative structure (In-Media-Res or Classic)',
      'Complete 40,000–60,000 word polished manuscript',
      'Full copyright transfer: 100% owned by you with zero royalties taken',
      'Format ready for Amazon Kindle, IngramSpark & Hardcover print',
    ],
  },
  {
    id: 'story-foundry-coauthor',
    name: 'Narrative Polishing & Chapter Co-Authoring',
    subtitle: 'Give Your Draft Shakespearean Energy & Savage Wit',
    turnaround: '2–3 Weeks',
    priceUsd: 950,
    priceNgn: 1425000,
    features: [
      'Comprehensive line-by-line editorial rework of existing drafts',
      'Rewriting hooks to start mid-thought at the end',
      'Pacing audit, character dialogue sharpening & subtext injection',
      'Detailed narrative blueprint & structural punch-list',
    ],
  },
  {
    id: 'book-of-lies-commission',
    name: 'Custom Book of Lies Canon Chapter',
    subtitle: 'Your Personal Philosophy Inscribed into Sacred Sacred Lore',
    turnaround: '5–7 Days',
    priceUsd: 380,
    priceNgn: 570000,
    features: [
      'Custom Socratic allegory mirroring your specific life trial or startup',
      'Meteor-frame narrative structure with sacred geometry diagram',
      'Permanently bound into your private codex & downloadable artifact',
      'Savage, relatable, witty reflection on ego and foundation',
    ],
  },
];

export const WritingStudio: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const { formatDual, formatPrice } = useCurrency();

  // Active mode and workspace state
  const [activeMode, setActiveMode] = useState<WritingStyleMode>('in-media-res');
  const [activeTab, setActiveTab] = useState<'editor' | 'blueprints' | 'services' | 'codex'>('editor');

  // Story document state
  const [storyTitle, setStoryTitle] = useState('The Ledger on the Asphalt');
  const [storySubtitle, setStorySubtitle] = useState('A study in highland friction');
  const [storyContent, setStoryContent] = useState('');
  const [authorName, setAuthorName] = useState('Jehu Nanpan');
  const [genreTag, setGenreTag] = useState('In-Media-Res Fiction');

  // AI Assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Focus mode
  const [isZenMode, setIsZenMode] = useState(false);

  // Commission modal
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [commissionForm, setCommissionForm] = useState({ name: '', email: '', ideaBrief: '' });
  const [commissionSent, setCommissionSent] = useState(false);

  // Load draft from localStorage on mount (PWA continuity)
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('jadai_writing_studio_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.content) setStoryContent(parsed.content);
        if (parsed.title) setStoryTitle(parsed.title);
        if (parsed.subtitle) setStorySubtitle(parsed.subtitle);
        if (parsed.mode) setActiveMode(parsed.mode);
        if (parsed.author) setAuthorName(parsed.author);
      } else {
        // Load default starter sample
        setStoryContent(WRITING_BLUEPRINTS['in-media-res'].sampleOpening.text);
      }
    } catch {
      setStoryContent(WRITING_BLUEPRINTS['in-media-res'].sampleOpening.text);
    }
  }, []);

  // Auto-save draft on every change
  useEffect(() => {
    if (!storyContent && !storyTitle) return;
    try {
      const payload = {
        title: storyTitle,
        subtitle: storySubtitle,
        content: storyContent,
        mode: activeMode,
        author: authorName,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('jadai_writing_studio_draft', JSON.stringify(payload));
    } catch {}
  }, [storyTitle, storySubtitle, storyContent, activeMode, authorName]);

  // Metrics
  const wordCount = storyContent.trim() ? storyContent.trim().split(/\s+/).length : 0;
  const charCount = storyContent.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 220));

  const handleAdoptBlueprintSample = (mode: WritingStyleMode) => {
    try {
      StudioAudio.playClick();
    } catch {}
    const bp = WRITING_BLUEPRINTS[mode];
    setActiveMode(mode);
    setStoryTitle(bp.sampleOpening.title);
    setStoryContent(bp.sampleOpening.text);
    setGenreTag(bp.name);
    setActiveTab('editor');
    showToast(`Adopted "${bp.name}" floor template`, 'success', 'Story Blueprint');
  };

  const handleInsertStarterPrompt = (promptText: string) => {
    try {
      StudioAudio.playClick();
    } catch {}
    const newText = storyContent
      ? `${promptText}\n\n${storyContent}`
      : promptText;
    setStoryContent(newText);
    showToast('Starter hook placed at beginning of story', 'info');
  };

  // AI Co-authoring trigger
  const handleAiTransform = async (actionPrompt: string) => {
    if (!storyContent.trim()) {
      showToast('Write a few sentences first to give the co-author a spark', 'error');
      return;
    }

    setIsAiGenerating(true);
    setAiSuggestion(null);
    try {
      StudioAudio.playClick();
    } catch {}

    const fullInstruction = `You are the Master Ghostwriter & Narrative Architect for Jadai Studios.
Style directive: ${actionPrompt}.
Writing Style: ${WRITING_BLUEPRINTS[activeMode].name}.
Energy: ${WRITING_BLUEPRINTS[activeMode].energy}.

Rewrite or expand the following excerpt according to these rules:
- Begin mid-thought, mid-sentence, mid-journey at the end if asked.
- Avoid boring exposition and cliché corporate filler.
- Use savage honesty, Shakespearean energy, and deep relatable mirrors.
- Keep the writer's authentic voice, but elevate the rhythm, sensory details, and punch.

Current Story Title: "${storyTitle}"
Current Draft Excerpt:
"${storyContent.slice(0, 1500)}"`;

    try {
      // Unified transport — also fixes the old systemInstruction / data.text mismatch
      const result = await askPrime({
        prompt: fullInstruction,
        systemPrompt:
          'You are an award-winning literary ghostwriter who specializes in In-Media-Res narrative arcs and Shakespearean wit.',
        moduleSlug: 'writing-studio',
        scope: 'writing-studio',
      });
      const outputText = result.text;
      if (outputText) {
        setAiSuggestion(outputText);
        try {
          StudioAudio.playSuccessArpeggio();
        } catch {}
        showToast('Narrative draft synthesized by co-author', 'success', 'Ghostwriter Ready');
      } else {
        showToast(result.error ? `AI co-author unreachable — ${result.error}` : 'AI co-author did not return text. Check connection.', 'error');
      }
    } catch {
      // Local fallback rewrite
      const fallback = `The rain had stopped by 4:00 AM, but the damage was already etched into the stone. Every sentence we drafted in the morning seemed like a defense for a trial that hadn't begun yet.\n\n${storyContent}`;
      setAiSuggestion(fallback);
      showToast('Offline rewrite draft ready', 'info');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (!aiSuggestion) return;
    try {
      StudioAudio.playSuccessArpeggio();
    } catch {}
    setStoryContent(aiSuggestion);
    setAiSuggestion(null);
    showToast('Draft updated with co-author polish', 'success');
  };

  const handleCopyDraft = async () => {
    try {
      await navigator.clipboard.writeText(`${storyTitle}\n${storySubtitle}\nby ${authorName}\n\n${storyContent}`);
      StudioAudio.playClick();
      showToast('Full story copied to clipboard', 'success');
    } catch {
      showToast('Unable to copy to clipboard', 'error');
    }
  };

  const handleDownloadMarkdown = () => {
    try {
      StudioAudio.playClick();
      const textBlob = new Blob(
        [`# ${storyTitle}\n*${storySubtitle}*\n**By ${authorName}**\n\n---\n\n${storyContent}`],
        { type: 'text/markdown;charset=utf-8' }
      );
      const url = URL.createObjectURL(textBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${storyTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded .md manuscript file', 'success');
    } catch {
      showToast('Download failed', 'error');
    }
  };

  const handleInscribeCodex = () => {
    try {
      StudioAudio.playSuccessArpeggio();
      const stored = localStorage.getItem('jadai_reflections');
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[`custom-${Date.now()}`] = `${storyTitle}: ${storyContent.slice(0, 300)}...`;
      localStorage.setItem('jadai_reflections', JSON.stringify(parsed));
      showToast('Inscribed in your Private Codex! Visible in Book of Lies.', 'success', 'Canon Testament');
    } catch {}
  };

  const currentBlueprint = WRITING_BLUEPRINTS[activeMode];

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 max-w-7xl mx-auto text-left select-none relative ${isZenMode ? 'fixed inset-0 z-[100] bg-[#050404] p-6 overflow-y-auto' : ''}`}>
      {/* Top Header & Mode Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.25)] text-[#e8c96a] text-xs font-mono uppercase tracking-wider mb-2">
            <Feather className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Story & Ghostwriting Foundry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#f5f3f0] tracking-wide m-0">
            Own Your Story. We Provide The Floor.
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-[#c4c0bb] mt-1 max-w-2xl">
            Novel-style pacing, Shakespearean energy, and in-media-res openings. We provide the architectural scaffolding and ruthless co-authoring tools; the story, words, and copyright belong exclusively to you.
          </p>
        </div>

        {/* Top Tab Bar: [Editor] [Floor Blueprints] [Commission Services] */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('editor');
              try { StudioAudio.playClick(); } catch {}
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'editor'
                ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-md'
                : 'bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-[#c4c0bb] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Writer Canvas</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('blueprints');
              try { StudioAudio.playClick(); } catch {}
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'blueprints'
                ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-md'
                : 'bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-[#c4c0bb] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Story Floors (6)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('services');
              try { StudioAudio.playClick(); } catch {}
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-md'
                : 'bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-[#c4c0bb] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Commissions & Ghostwrite</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          TAB 1: WRITER CANVAS (Full interactive living editor)
         =================================================================== */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {/* Mode Switcher & Quick Stats Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#8a6e2a] uppercase">Active Style:</span>
              <select
                value={activeMode}
                onChange={(e) => {
                  const m = e.target.value as WritingStyleMode;
                  setActiveMode(m);
                  setGenreTag(WRITING_BLUEPRINTS[m].name);
                  try { StudioAudio.playClick(); } catch {}
                }}
                className="bg-[#050404] border border-[rgba(201,168,76,0.3)] text-xs text-[#e8c96a] font-mono px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#C9A84C] cursor-pointer"
              >
                {Object.values(WRITING_BLUEPRINTS).map((bp) => (
                  <option key={bp.id} value={bp.id}>
                    {bp.name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] font-mono text-[#8a6e2a] hidden md:inline">
                {currentBlueprint.energy}
              </span>
            </div>

            {/* Live Stats */}
            <div className="flex items-center gap-4 text-xs font-mono text-[#c4c0bb]">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#C9A84C]" />
                <strong className="text-[#f5f3f0]">{wordCount}</strong> words
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C9A84C]" />
                <strong className="text-[#f5f3f0]">{readTimeMin}</strong> min read
              </span>
              <span>·</span>
              <button
                onClick={() => setIsZenMode(!isZenMode)}
                className="text-[#8a6e2a] hover:text-[#e8c96a] flex items-center gap-1 cursor-pointer"
                title="Toggle Full-Screen Zen Writer"
              >
                {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isZenMode ? 'Exit Zen' : 'Zen View'}</span>
              </button>
            </div>
          </div>

          {/* AI Co-Author Action Bar */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[rgba(201,168,76,0.08)] via-[rgba(192,57,43,0.08)] to-transparent border border-[rgba(201,168,76,0.25)] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#e8c96a] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                Ghostwriter Brain • 1-Tap Narrative Transformation
              </span>
              <span className="text-[10px] text-[#8a6e2a]">Dual Engine: Groq LPU + Gemini 3.8</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                disabled={isAiGenerating}
                onClick={() => handleAiTransform('Rewrite to begin mid-thought, mid-sentence, mid-explosion at the end (In Media Res).')}
                className="px-3 py-1.5 rounded-lg bg-[rgba(201,168,76,0.15)] hover:bg-[rgba(201,168,76,0.28)] border border-[rgba(201,168,76,0.3)] text-xs font-mono text-[#f5f3f0] transition-colors cursor-pointer disabled:opacity-50"
              >
                ⚡ Start Mid-Thought at End
              </button>
              <button
                disabled={isAiGenerating}
                onClick={() => handleAiTransform('Rewrite with Shakespearean venom, poetic bite, and dramatic soliloquy rhythm.')}
                className="px-3 py-1.5 rounded-lg bg-[rgba(201,168,76,0.15)] hover:bg-[rgba(201,168,76,0.28)] border border-[rgba(201,168,76,0.3)] text-xs font-mono text-[#f5f3f0] transition-colors cursor-pointer disabled:opacity-50"
              >
                🎭 Shakespearean Energy & Wit
              </button>
              <button
                disabled={isAiGenerating}
                onClick={() => handleAiTransform('Deepen the Socratic mirror (Book of Lies style): savage, funny, uncomfortable truth.')}
                className="px-3 py-1.5 rounded-lg bg-[rgba(201,168,76,0.15)] hover:bg-[rgba(201,168,76,0.28)] border border-[rgba(201,168,76,0.3)] text-xs font-mono text-[#f5f3f0] transition-colors cursor-pointer disabled:opacity-50"
              >
                🪞 Book of Lies Savage Mirror
              </button>
              <button
                disabled={isAiGenerating}
                onClick={() => handleAiTransform('Tighten every sentence, eliminate adjective fluff, and enhance sensory room details.')}
                className="px-3 py-1.5 rounded-lg bg-[rgba(201,168,76,0.15)] hover:bg-[rgba(201,168,76,0.28)] border border-[rgba(201,168,76,0.3)] text-xs font-mono text-[#f5f3f0] transition-colors cursor-pointer disabled:opacity-50"
              >
                🔪 Cut Fluff & Tighten Prose
              </button>
              <button
                disabled={isAiGenerating}
                onClick={() => handleAiTransform('Continue the next scene with high tension and an unexpected confession.')}
                className="px-3 py-1.5 rounded-lg bg-[rgba(192,57,43,0.2)] hover:bg-[rgba(192,57,43,0.35)] border border-[#C0392B]/40 text-xs font-mono text-rose-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                🔥 Draft Next Scene
              </button>
            </div>
          </div>

          {/* AI Suggestion Preview Box (If generated) */}
          {aiSuggestion && (
            <div className="p-5 rounded-2xl bg-[#0e0c0a] border border-[#C9A84C] space-y-3 shadow-2xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#e8c96a] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>Co-Author Revision Suggestion</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyAiSuggestion}
                    className="px-3 py-1 rounded-lg bg-[#C9A84C] text-[#050404] text-xs font-mono font-bold hover:bg-[#e8c96a] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Adopt Revision</span>
                  </button>
                  <button
                    onClick={() => setAiSuggestion(null)}
                    className="text-xs font-mono text-[#8a6e2a] hover:text-white px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] text-xs font-serif leading-relaxed text-[#f5f3f0] whitespace-pre-wrap max-h-64 overflow-y-auto">
                {aiSuggestion}
              </div>
            </div>
          )}

          {/* Story Document Canvas */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-2xl space-y-4">
            {/* Title & Author Inputs */}
            <div className="space-y-3 border-b border-[rgba(201,168,76,0.15)] pb-5">
              <input
                type="text"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="Story Title (e.g. The Ledger on the Asphalt)"
                className="w-full bg-transparent font-display font-bold text-2xl sm:text-3xl text-[#f5f3f0] placeholder:text-zinc-600 focus:outline-none focus:border-b focus:border-[#C9A84C]"
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-mono">
                <input
                  type="text"
                  value={storySubtitle}
                  onChange={(e) => setStorySubtitle(e.target.value)}
                  placeholder="Subtitle or Premise (e.g. A study in highland friction)"
                  className="flex-1 bg-transparent text-[#e8c96a] placeholder:text-zinc-600 focus:outline-none italic font-serif"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[#8a6e2a]">By</span>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Author Name"
                    className="bg-[#050404] px-2.5 py-1 rounded border border-[rgba(201,168,76,0.2)] text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>
            </div>

            {/* Starter Hook Insert Bar */}
            <div className="p-3 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[#8a6e2a] flex items-center gap-1.5 shrink-0">
                <Flame className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>Opening Hook Prompts:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentBlueprint.starterPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleInsertStarterPrompt(p)}
                    className="px-2.5 py-1 rounded bg-[rgba(201,168,76,0.1)] hover:bg-[rgba(201,168,76,0.25)] text-[#e8c96a] text-[11px] truncate max-w-xs transition-colors cursor-pointer"
                    title={`Insert: "${p}"`}
                  >
                    "{p.slice(0, 36)}..."
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Story Body Text Area */}
            <textarea
              rows={16}
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
              placeholder="Begin mid-thought, mid-sentence, at the end... The fire was already burning when..."
              className="w-full bg-[#050404] p-5 sm:p-6 rounded-2xl border border-[rgba(201,168,76,0.2)] text-[#f5f3f0] font-serif text-sm sm:text-base leading-relaxed placeholder:text-zinc-700 focus:outline-none focus:border-[#C9A84C] selection:bg-[#C9A84C] selection:text-black resize-y"
            />

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[rgba(201,168,76,0.15)]">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyDraft}
                  className="px-3 py-1.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#c4c0bb] hover:text-[#f5f3f0] hover:border-[#C9A84C] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className="px-3 py-1.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#c4c0bb] hover:text-[#f5f3f0] hover:border-[#C9A84C] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>

                <button
                  onClick={handleInscribeCodex}
                  className="px-3 py-1.5 rounded-xl bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] text-xs font-mono text-[#e8c96a] hover:bg-[rgba(201,168,76,0.2)] flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Save into your private Book of Lies personal codex"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Inscribe to Codex</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[#8a6e2a]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Auto-saved to device memory • Ready offline</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 2: STORY FLOORS (6 Narrative Architecture Blueprints)
         =================================================================== */}
      {activeTab === 'blueprints' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] flex items-start gap-3 text-xs font-mono">
            <Layers className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[#f5f3f0] font-bold block">
                The Narrative Floor Doctrine:
              </span>
              <p className="text-[#c4c0bb] leading-relaxed">
                We never own your story. We provide the structural bones: starting mid-climax, arranging the flashback mosaic, injecting Socratic truth, and resolving with an indelible punch. Click any blueprint to adopt its pattern into your writer canvas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(WRITING_BLUEPRINTS).map((bp) => {
              const isSelected = activeMode === bp.id;
              return (
                <GlassCard
                  key={bp.id}
                  className={`p-6 flex flex-col justify-between space-y-4 border transition-all duration-300 ${
                    isSelected
                      ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.08)] shadow-[0_0_30px_rgba(201,168,76,0.2)]'
                      : 'border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">
                        {bp.energy}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-[#C9A84C] text-[#050404]">
                          Active Floor
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-display font-bold text-[#f5f3f0]">
                      {bp.name}
                    </h3>
                    <p className="text-xs font-mono text-[#e8c96a] italic">
                      "{bp.tagline}"
                    </p>
                    <p className="text-xs text-[#c4c0bb] font-serif leading-relaxed">
                      {bp.description}
                    </p>

                    {/* Structural Pattern */}
                    <div className="p-3 rounded-xl bg-black/50 border border-[rgba(201,168,76,0.15)] space-y-1 text-[11px] font-mono text-[#8a6e2a]">
                      <span className="text-[10px] uppercase text-[#e8c96a] block font-bold mb-1">
                        Architectural Pattern:
                      </span>
                      {bp.structurePattern.slice(0, 3).map((st, i) => (
                        <div key={i} className="truncate">
                          {st}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between">
                    <button
                      onClick={() => handleAdoptBlueprintSample(bp.id)}
                      className="w-full py-2 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>Adopt This Floor →</span>
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 3: COMMISSIONS & GHOSTWRITING SERVICES
         =================================================================== */}
      {activeTab === 'services' && (
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono text-[#C9A84C] uppercase tracking-widest">
              Bespoke Authoring Commissions
            </span>
            <h2 className="text-3xl font-display font-bold text-[#f5f3f0]">
              Let Jadai Ghostwrite Your Magnum Opus
            </h2>
            <p className="text-xs sm:text-sm font-serif italic text-[#c4c0bb]">
              We take your messy notes, voice recordings, or rough drafts and transmute them into novel-grade, Shakespearean manuscripts. 100% full copyright retention. International payment accepted globally in USD and NGN.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMMISSION_SERVICES.map((srv) => (
              <GlassCard
                key={srv.id}
                className="p-6 flex flex-col justify-between space-y-5 border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] transition-all relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">
                      Timeline: {srv.turnaround}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
                      Open Slots
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-bold text-[#f5f3f0]">
                    {srv.name}
                  </h3>
                  <p className="text-xs font-mono text-[#e8c96a] italic">
                    {srv.subtitle}
                  </p>

                  {/* Dual Currency Price */}
                  <div className="pt-2 border-t border-[rgba(201,168,76,0.15)] space-y-1">
                    <div className="text-2xl font-mono font-bold text-[#f5f3f0]">
                      {formatPrice(srv.priceUsd, srv.priceNgn)}
                    </div>
                    <div className="text-xs font-mono text-[#8a6e2a]">
                      {formatDual(srv.priceUsd, srv.priceNgn).alt}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 pt-2">
                    {srv.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#c4c0bb]">
                        <Check className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[rgba(201,168,76,0.15)]">
                  <button
                    onClick={() => {
                      setSelectedService(srv);
                      setCommissionSent(false);
                      try { StudioAudio.playClick(); } catch {}
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                  >
                    <span>Commission This Service →</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* International Payment Note */}
          <div className="p-4 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-center text-xs font-mono text-[#8a6e2a] max-w-xl mx-auto space-y-1">
            <span className="text-[#f5f3f0] font-bold block">International Payments Welcome</span>
            <p>
              Accepting all global credit/debit cards (Visa, MasterCard, American Express, Apple Pay) via secure international routing. Zero hidden exchange fees.
            </p>
          </div>
        </div>
      )}

      {/* Commission Inquiry Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.35)] shadow-2xl space-y-4 text-left animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.2)] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#C9A84C]">Ghostwriting Commission</span>
                <h3 className="font-display font-bold text-lg text-[#f5f3f0]">{selectedService.name}</h3>
              </div>
              <button onClick={() => setSelectedService(null)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            {commissionSent ? (
              <div className="text-center py-8 space-y-3">
                <Check className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-display font-bold text-xl text-[#f5f3f0]">Inquiry Dispatched</h4>
                <p className="text-xs text-[#c4c0bb] font-serif max-w-sm mx-auto">
                  We have received your project outline. Our lead ghostwriter will review your brief and send you a private booking link within 24 hours.
                </p>
                <Button variant="primary" size="sm" onClick={() => setSelectedService(null)}>
                  Return to Writer Studio
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!commissionForm.email) return;
                  setCommissionSent(true);
                  StudioAudio.playSuccessArpeggio();
                  showToast('Commission brief sent to Jadai Foundry', 'success');
                }}
                className="space-y-3.5 text-xs font-mono"
              >
                <div className="p-3 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.2)] flex items-center justify-between">
                  <span className="text-[#8a6e2a]">Investment:</span>
                  <span className="text-[#e8c96a] font-bold text-sm">{formatPrice(selectedService.priceUsd, selectedService.priceNgn)}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[#8a6e2a] uppercase block">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={commissionForm.name}
                    onChange={(e) => setCommissionForm({ ...commissionForm, name: e.target.value })}
                    placeholder="e.g. Chief Architect David"
                    className="w-full px-3 py-2 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#8a6e2a] uppercase block">Contact Email (Global)</label>
                  <input
                    type="email"
                    required
                    value={commissionForm.email}
                    onChange={(e) => setCommissionForm({ ...commissionForm, email: e.target.value })}
                    placeholder="david@company.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#8a6e2a] uppercase block">Story Concept or Core Truth</label>
                  <textarea
                    rows={3}
                    value={commissionForm.ideaBrief}
                    onChange={(e) => setCommissionForm({ ...commissionForm, ideaBrief: e.target.value })}
                    placeholder="Tell us what you want to write: novel concept, startup memoir, or philosophical testament..."
                    className="w-full px-3 py-2 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedService(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Send Commission Inquiry
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingStudio;
