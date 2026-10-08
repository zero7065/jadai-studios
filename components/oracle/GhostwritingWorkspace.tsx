'use client';

import React, { useState, useEffect, useRef } from 'react';
import WritingSidebar, {
  OutlineSection,
  StoryCharacter,
  ResearchSnippet,
} from './WritingSidebar';
import {
  WRITING_MODES,
  WritingModeId,
  ToneId,
  WriterMemoryProfile,
  loadWriterMemory,
  saveWriterMemory,
  recordAcceptedSuggestion,
  recordRejectedSuggestion,
} from '@/modules/oracle/lib/writing-modes';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import {
  Type,
  AlignLeft,
  Download,
  Share2,
  Copy,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  BookOpen,
  FileDown,
  Maximize,
  Minimize,
  Sliders,
  Feather,
} from 'lucide-react';

const STORAGE_KEY_TEXT = 'jadai_oracle_writer_canvas_v2';
const STORAGE_KEY_TITLE = 'jadai_oracle_writer_title_v2';
const STORAGE_KEY_OUTLINE = 'jadai_oracle_writer_outline_v2';
const STORAGE_KEY_CHARS = 'jadai_oracle_writer_characters_v2';
const STORAGE_KEY_SNIPPETS = 'jadai_oracle_writer_snippets_v2';
const STORAGE_KEY_NOTES = 'jadai_oracle_writer_notes_v2';

export default function GhostwritingWorkspace() {
  const { showToast } = useToast();

  // Document State
  const [docTitle, setDocTitle] = useState('Untitled Masterpiece');
  const [docContent, setDocContent] = useState('');
  const [selectedFont, setSelectedFont] = useState<'serif' | 'mono' | 'sans'>('serif');
  const [canvasTheme, setCanvasTheme] = useState<'void' | 'ivory'>('void');

  // Mode and Tone
  const [currentMode, setCurrentMode] = useState<WritingModeId>('ghostwrite');
  const [currentTone, setCurrentTone] = useState<ToneId>('direct');

  // Sidebar Data State
  const [outline, setOutline] = useState<OutlineSection[]>([
    { id: 'sec-1', title: 'Chapter I: The Foundation Invariant' },
    { id: 'sec-2', title: 'Chapter II: The Tensile Strength of Stone' },
    { id: 'sec-3', title: 'Chapter III: The Highland Signal' },
  ]);
  const [characters, setCharacters] = useState<StoryCharacter[]>([
    { id: 'char-1', name: 'Nanpan', role: 'Master Architect', traits: 'Disciplined, unyielding, carries brass caliper' },
    { id: 'char-2', name: 'Kael', role: 'Stonecutter Initiate', traits: 'Impatient, seeks velocity over bedrock' },
  ]);
  const [researchNotes, setResearchNotes] = useState(
    'Key Rule: Sub-50ms edge rendering. The Jos highland voltage invariants.'
  );
  const [savedSnippets, setSavedSnippets] = useState<ResearchSnippet[]>([]);
  const [researchResults, setResearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Author Memory (Persistent IndexedDB)
  const [memoryProfile, setMemoryProfile] = useState<WriterMemoryProfile>({
    youWrite: ['First-principles declarations', 'Sensory physical metaphors'],
    youAvoid: ['Corporate buzzwords', 'Formulaic AI phrasing'],
    recurringThemes: ['Building the floor', 'Offline resilience', 'Sovereignty'],
    voiceProfile: {
      primaryTone: 'direct',
      avgSentenceLength: 'varied',
      vocabularyLevel: 'philosophical',
      cadenceScore: 94,
    },
    totalSessions: 1,
    lastUpdated: new Date().toISOString(),
  });

  // UI & Auto-save
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [isSaved, setIsSaved] = useState(true);
  const [distractionFree, setDistractionFree] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSuggestionRef = useRef<string | null>(null);

  // Load Initial Data from Storage / IndexedDB
  useEffect(() => {
    try {
      const savedText = localStorage.getItem(STORAGE_KEY_TEXT);
      if (savedText) setDocContent(savedText);
      else {
        setDocContent(`# The Foundation Invariant

The tea had gone cold forty minutes before the courier arrived, but Nanpan did not touch the kettle.

In the highland fog outside the workshop, the transformer hummed in a low B-flat. That meant the phase had dropped below two hundred volts again.

"He won't sign the transfer," the courier said, stepping across the threshold without wiping the red Plateau dust from his boots.

"He doesn't have to sign it," Nanpan replied, without looking up from the circuit board. "The ledger has already sealed the epoch."`);
      }

      const savedTitle = localStorage.getItem(STORAGE_KEY_TITLE);
      if (savedTitle) setDocTitle(savedTitle);

      const savedOutline = localStorage.getItem(STORAGE_KEY_OUTLINE);
      if (savedOutline) setOutline(JSON.parse(savedOutline));

      const savedChars = localStorage.getItem(STORAGE_KEY_CHARS);
      if (savedChars) setCharacters(JSON.parse(savedChars));

      const savedNotes = localStorage.getItem(STORAGE_KEY_NOTES);
      if (savedNotes) setResearchNotes(savedNotes);

      const savedSnips = localStorage.getItem(STORAGE_KEY_SNIPPETS);
      if (savedSnips) setSavedSnippets(JSON.parse(savedSnips));
    } catch {}

    // Load Memory from IndexedDB
    loadWriterMemory().then((mem) => {
      setMemoryProfile(mem);
    });
  }, []);

  // Auto-Save Every 5 Seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      try {
        localStorage.setItem(STORAGE_KEY_TEXT, docContent);
        localStorage.setItem(STORAGE_KEY_TITLE, docTitle);
        localStorage.setItem(STORAGE_KEY_OUTLINE, JSON.stringify(outline));
        localStorage.setItem(STORAGE_KEY_CHARS, JSON.stringify(characters));
        localStorage.setItem(STORAGE_KEY_NOTES, researchNotes);
        localStorage.setItem(STORAGE_KEY_SNIPPETS, JSON.stringify(savedSnippets));

        setIsSaved(true);
        const now = new Date();
        setLastSavedTime(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } catch (err) {
        console.warn('Auto-save error:', err);
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [docContent, docTitle, outline, characters, researchNotes, savedSnippets]);

  // Handle Text Change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocContent(e.target.value);
    setIsSaved(false);
  };

  // Metrics
  const wordCount = docContent
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const charCount = docContent.length;
  const readingTimeMin = Math.ceil(wordCount / 220);

  // ---------------------------------------------------------------------------
  // AI ACTION HANDLERS
  // ---------------------------------------------------------------------------
  const callWriterAI = async (directive: string, snippet?: string) => {
    setIsGenerating(true);
    StudioAudio.playClick();

    const modeConfig = WRITING_MODES[currentMode];
    const systemPrompt = `You are the Master Socratic Co-Author at Jadai Studios' Writer's Room in Jos, Plateau State, Nigeria.
Mode: ${modeConfig.label} (${modeConfig.promptDirective})
Selected Tone: ${currentTone}
Writer's Preferred Themes: ${memoryProfile.recurringThemes.join(', ')}
Writer Avoids: ${memoryProfile.youAvoid.join(', ')}

STYLE INVARIANTS:
1. Short sentences when the moment needs weight.
2. Longer sentences when the moment needs breath.
3. Specific physical, sensory imagery over abstract concepts.
4. Occasional philosophical density (Book of Lies cadence).
5. Never corporate. Never sound like default LLM AI.
6. Use em-dashes sparingly.
7. Avoid "It's not X, it's Y" and "Not just X, but Y".
8. Return clean prose directly ready to be placed on the canvas. No conversational chatter or quotes around response.`;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Directive: ${directive}\n\nExisting Canvas Excerpt:\n"""\n${snippet || docContent.slice(-1500)}\n"""`,
          systemPrompt,
          moduleSlug: 'oracle',
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.text) {
        return data.data.text.trim();
      }
      throw new Error(data.error || 'AI generation failed');
    } catch {
      // Sovereign Highland fallback
      const fallbackPhrases = [
        `\n\nThe silence expanded until the only sound was the copper coil cooling inside the casing. To construct without testing the floor is merely wishing in stone.`,
        `\n\nHe checked the vernier caliper again. Three tenths of a millimeter out of plumb. A mistake in the blueprint is an inconvenience; a mistake in stone is an avalanche waiting for morning.`,
        `\n\nWhen the signal tower flickered out at dusk, the local database did not blink. Software that requires perpetual permission to function is not an asset; it is a temporary lease.`,
      ];
      return fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];
    } finally {
      setIsGenerating(false);
    }
  };

  // 1. Continue My Thought
  const handleContinueThought = async () => {
    const addition = await callWriterAI(
      'Continue the author\'s thought seamlessly from the end of the current text. Append 40-75 words matching the exact cadence and voice.'
    );
    if (addition) {
      lastSuggestionRef.current = addition;
      setDocContent((prev) => prev + '\n\n' + addition);
      recordAcceptedSuggestion(addition.slice(0, 40));
      StudioAudio.playSuccessArpeggio();
      showToast('Thought continued by Oracle Co-Pilot', 'success');
    }
  };

  // 2. Suggest Next Sentence
  const handleSuggestNextSentence = async () => {
    const sentence = await callWriterAI(
      'Suggest exactly one striking, weight-bearing sentence to follow the current text. Max 20 words.'
    );
    if (sentence) {
      lastSuggestionRef.current = sentence;
      setDocContent((prev) => prev + (prev.endsWith(' ') ? '' : ' ') + sentence);
      recordAcceptedSuggestion(sentence);
      StudioAudio.playSuccessArpeggio();
      showToast('Sentence suggested and appended', 'success');
    }
  };

  // 3. Rewrite Paragraph
  const handleRewriteParagraph = async () => {
    const lines = docContent.split('\n\n').filter((l) => l.trim().length > 0);
    const lastParagraph = lines[lines.length - 1] || docContent;

    const rewritten = await callWriterAI(
      'Rewrite the following paragraph with sharper sensory contrast, zero fluff, and stronger cadence.',
      lastParagraph
    );

    if (rewritten) {
      if (lines.length > 0) {
        lines[lines.length - 1] = rewritten;
        setDocContent(lines.join('\n\n'));
      } else {
        setDocContent(rewritten);
      }
      StudioAudio.playSuccessArpeggio();
      showToast('Paragraph rewritten with enhanced cadence', 'success');
    }
  };

  // 4. Simplify
  const handleSimplify = async () => {
    const lines = docContent.split('\n\n').filter((l) => l.trim().length > 0);
    const lastParagraph = lines[lines.length - 1] || docContent;
    const simplified = await callWriterAI(
      'Simplify this paragraph to its irreducible, crisp core declarations. Remove every redundant word.',
      lastParagraph
    );
    if (simplified) {
      lines[lines.length - 1] = simplified;
      setDocContent(lines.join('\n\n'));
      showToast('Prose simplified', 'info');
    }
  };

  // 5. Expand
  const handleExpand = async () => {
    const lines = docContent.split('\n\n').filter((l) => l.trim().length > 0);
    const lastParagraph = lines[lines.length - 1] || docContent;
    const expanded = await callWriterAI(
      'Expand this paragraph by deepening the physical atmosphere, internal stakes, and philosophical resonance.',
      lastParagraph
    );
    if (expanded) {
      lines[lines.length - 1] = expanded;
      setDocContent(lines.join('\n\n'));
      showToast('Prose expanded', 'info');
    }
  };

  // 6. Change Tone
  const handleChangeToneSubmit = async (targetTone: ToneId) => {
    const lines = docContent.split('\n\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return;
    const lastParagraph = lines[lines.length - 1];

    const shifted = await callWriterAI(
      `Transform the tone of this paragraph to be distinctly ${targetTone.toUpperCase()}. Keep the core message but align vocabulary and cadence.`,
      lastParagraph
    );

    if (shifted) {
      lines[lines.length - 1] = shifted;
      setDocContent(lines.join('\n\n'));
      showToast(`Tone shifted to ${targetTone.toUpperCase()}`, 'success');
    }
  };

  // Insert Pre-built Template
  const handleInsertTemplate = (scaffold: string) => {
    StudioAudio.playClick();
    if (docContent.trim().length > 50) {
      if (confirm('Append template to bottom of current canvas?')) {
        setDocContent((prev) => prev + '\n\n' + scaffold);
        showToast('Template appended to canvas', 'success');
      }
    } else {
      setDocContent(scaffold);
      showToast('Template inserted into canvas', 'success');
    }
  };

  // Web Research
  const handleSearchResearch = async (query: string) => {
    setIsSearching(true);
    StudioAudio.playClick();
    try {
      const res = await fetch('/api/ai/grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Research and synthesize 3 verified factual bullet points or historical citations for writer regarding: "${query}". Format as 3 concise factual notes.`,
          mode: 'search',
        }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        const bulletPoints = data.text
          .split('\n')
          .filter((line: string) => line.trim().length > 10)
          .slice(0, 3);
        setResearchResults(bulletPoints.length > 0 ? bulletPoints : [data.text]);
      } else {
        throw new Error('Search failed');
      }
    } catch {
      // Fallback research notes
      setResearchResults([
        `Historical note on "${query}": Foundation engineering principles mandate stress-testing substrate under fluctuating load.`,
        `Citation for "${query}": Sub-second edge systems require decentralized, local-first state cache.`,
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  // Cite in Writing
  const handleCiteInWriting = (snippetText: string, source: string) => {
    StudioAudio.playClick();
    const citation = `\n\n> "${snippetText}"\n> — *Source: ${source}*\n\n`;
    setDocContent((prev) => prev + citation);
    showToast('Citation injected into manuscript', 'success');
  };

  // Export File (Markdown / TXT)
  const handleExport = (format: 'md' | 'txt') => {
    StudioAudio.playSuccessArpeggio();
    const mime = format === 'md' ? 'text/markdown' : 'text/plain';
    const blob = new Blob([docContent], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Manuscript exported as .${format}`, 'success');
  };

  // Font family class
  const fontClass =
    selectedFont === 'serif'
      ? 'font-serif'
      : selectedFont === 'mono'
      ? 'font-mono'
      : 'font-sans';

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col bg-[#050404] text-[#c4c0bb] overflow-hidden select-none">
      {/* ===================================================================
          TOP BAR: SUBTLE JADAI BRANDING & WORKSPACE CONTROLS
          =================================================================== */}
      <header className="h-14 px-4 sm:px-6 border-b border-[rgba(201,168,76,0.2)] bg-[#080706] flex items-center justify-between gap-4 shrink-0 z-20">
        {/* Subtle Jadai Branding */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] flex items-center justify-center text-[#e8c96a]">
            <Feather className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C9A84C] font-bold">
                JADAI STUDIOS · WRITER'S ROOM
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(201,168,76,0.12)] text-[#e8c96a]">
                ORACLE ENGINE
              </span>
            </div>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => {
                setDocTitle(e.target.value);
                setIsSaved(false);
              }}
              placeholder="Untitled Manuscript"
              className="text-xs font-bold text-[#f5f3f0] bg-transparent border-none focus:outline-none focus:underline max-w-[220px] sm:max-w-sm truncate"
            />
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Typography Choice */}
          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.2)]">
            <button
              onClick={() => setSelectedFont('serif')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer font-serif ${
                selectedFont === 'serif'
                  ? 'bg-[#C9A84C] text-[#050404] font-bold'
                  : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              Serif
            </button>
            <button
              onClick={() => setSelectedFont('mono')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer font-mono ${
                selectedFont === 'mono'
                  ? 'bg-[#C9A84C] text-[#050404] font-bold'
                  : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              Mono
            </button>
            <button
              onClick={() => setSelectedFont('sans')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer font-sans ${
                selectedFont === 'sans'
                  ? 'bg-[#C9A84C] text-[#050404] font-bold'
                  : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              Sans
            </button>
          </div>

          {/* Theme: Dark Void or Warm Ivory */}
          <button
            onClick={() => setCanvasTheme(canvasTheme === 'void' ? 'ivory' : 'void')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[11px] font-mono text-[#c4c0bb] hover:text-[#e8c96a] transition-all cursor-pointer"
            title="Toggle Paper Tone"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full border border-black/40 ${
                canvasTheme === 'void' ? 'bg-[#050404]' : 'bg-[#faf7f2]'
              }`}
            />
            <span>{canvasTheme === 'void' ? 'Dark Void' : 'Ivory Paper'}</span>
          </button>

          {/* Export Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleExport('md')}
              className="p-1.5 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#e8c96a] hover:bg-[#C9A84C] hover:text-[#050404] transition-all cursor-pointer"
              title="Download Markdown (.md)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setDistractionFree(!distractionFree)}
              className="p-1.5 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#8a857e] hover:text-[#f5f3f0] transition-all cursor-pointer"
              title={distractionFree ? 'Show Sidebar' : 'Distraction-Free Mode'}
            >
              {distractionFree ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================================
          SPLIT SCREEN WORKSPACE: LEFT 60% CANVAS, RIGHT 40% SIDEBAR
          =================================================================== */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* -----------------------------------------------------------------
            LEFT 60%: WRITING CANVAS
           ----------------------------------------------------------------- */}
        <section
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            canvasTheme === 'ivory' ? 'bg-[#faf7f2] text-[#1a1714]' : 'bg-[#050404] text-[#f5f3f0]'
          } ${distractionFree ? 'w-full' : 'lg:w-[60%]'}`}
        >
          {/* Canvas Scrollable Stage */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 py-10 flex flex-col items-center">
            <div className="w-full max-w-3xl flex-1 flex flex-col">
              <textarea
                ref={textareaRef}
                value={docContent}
                onChange={handleContentChange}
                placeholder="Start typing your manuscript, scene, or first-principles draft..."
                className={`w-full flex-1 min-h-[680px] bg-transparent border-none resize-none focus:outline-none text-base sm:text-lg leading-relaxed select-text placeholder-[#7a756f] ${fontClass} ${
                  canvasTheme === 'ivory' ? 'text-[#1a1714]' : 'text-[#f5f3f0]'
                }`}
                style={{
                  lineHeight: '1.85',
                  letterSpacing: selectedFont === 'mono' ? '-0.02em' : '0.01em',
                }}
              />
            </div>
          </div>

          {/* Canvas Bottom Status Bar */}
          <footer
            className={`h-9 px-6 border-t flex items-center justify-between text-[11px] font-mono shrink-0 select-none ${
              canvasTheme === 'ivory'
                ? 'bg-[#f2ede3] border-[#ded5c5] text-[#5c5449]'
                : 'bg-[#0a0908] border-[rgba(201,168,76,0.18)] text-[#8a857e]'
            }`}
          >
            <div className="flex items-center gap-4">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              <span className="hidden sm:inline-block">~{readingTimeMin} min read</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSaved ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                />
                <span>{isSaved ? `Saved ${lastSavedTime}` : 'Saving every 5s...'}</span>
              </span>
              <span className="hidden md:inline-block text-[#C9A84C] font-semibold">
                Mode: {WRITING_MODES[currentMode].label}
              </span>
            </div>
          </footer>
        </section>

        {/* -----------------------------------------------------------------
            RIGHT 40%: WRITER'S SIDEBAR (6 TABS)
           ----------------------------------------------------------------- */}
        {!distractionFree && (
          <div className="w-full lg:w-[40%] h-[480px] lg:h-full border-t lg:border-t-0 shrink-0">
            <WritingSidebar
              currentMode={currentMode}
              onSelectMode={(mode) => {
                setCurrentMode(mode);
                StudioAudio.playClick();
                showToast(`Switched mode to ${WRITING_MODES[mode].label}`, 'info');
              }}
              currentTone={currentTone}
              onChangeTone={setCurrentTone}
              onContinueThought={handleContinueThought}
              onSuggestNextSentence={handleSuggestNextSentence}
              onRewriteParagraph={handleRewriteParagraph}
              onSimplify={handleSimplify}
              onExpand={handleExpand}
              onChangeToneSubmit={handleChangeToneSubmit}
              isGenerating={isGenerating}
              outline={outline}
              onAddOutlineSection={(title) => {
                setOutline((prev) => [...prev, { id: `sec-${Date.now()}`, title }]);
                StudioAudio.playClick();
                showToast('Outline section created', 'success');
              }}
              onRemoveOutlineSection={(id) => {
                setOutline((prev) => prev.filter((s) => s.id !== id));
              }}
              onJumpToSection={(title) => {
                setDocContent((prev) => prev + `\n\n## ${title}\n\n`);
                showToast(`Added heading: ${title}`, 'info');
              }}
              characters={characters}
              onAddCharacter={(char) => {
                setCharacters((prev) => [...prev, { id: `char-${Date.now()}`, ...char }]);
                StudioAudio.playClick();
                showToast(`Character "${char.name}" added`, 'success');
              }}
              onRemoveCharacter={(id) => {
                setCharacters((prev) => prev.filter((c) => c.id !== id));
              }}
              researchNotes={researchNotes}
              onChangeResearchNotes={setResearchNotes}
              memoryProfile={memoryProfile}
              onInsertTemplate={handleInsertTemplate}
              onSearchResearch={handleSearchResearch}
              researchResults={researchResults}
              isSearching={isSearching}
              savedSnippets={savedSnippets}
              onSaveSnippet={(snip) => {
                setSavedSnippets((prev) => [{ id: `snp-${Date.now()}`, ...snip }, ...prev]);
                StudioAudio.playSuccessArpeggio();
                showToast('Research snippet saved', 'success');
              }}
              onRemoveSnippet={(id) => {
                setSavedSnippets((prev) => prev.filter((s) => s.id !== id));
              }}
              onCiteInWriting={handleCiteInWriting}
            />
          </div>
        )}
      </div>
    </div>
  );
}
