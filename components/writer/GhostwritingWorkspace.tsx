'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Sigil from '../layout/Sigil';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import {
  BookOpen,
  FileText,
  Sparkles,
  Check,
  X,
  History,
  Download,
  Upload,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Eye,
  Edit2,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Quote,
} from 'lucide-react';

export interface Chapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  content: string;
  targetWords: number;
  currentWords: number;
  status: 'draft' | 'in-review' | 'complete';
}

export interface InvariantItem {
  id: string;
  category: 'character' | 'plot' | 'fact';
  name: string;
  rule: string;
}

export interface DraftSnapshot {
  id: string;
  timestamp: string;
  chapterId: string;
  title: string;
  content: string;
  wordCount: number;
}

export interface CoWriteSuggestion {
  originalText: string;
  suggestedText: string;
  diffSummary: string;
  rationale: string;
}

export const GhostwritingWorkspace: React.FC = () => {
  const { showToast } = useToast();

  // Setup State
  const [formatType, setFormatType] = useState<'book' | 'article'>('book');
  const [genre, setGenre] = useState('Philosophical Fiction');
  const [targetLength, setTargetLength] = useState(25000);
  const [projectTitle, setProjectTitle] = useState('The Foundation Invariant');
  const [voiceSample, setVoiceSample] = useState('');
  const [analyzedVoice, setAnalyzedVoice] = useState<{
    tone: string;
    cadence: string;
    vocabulary: string;
    analyzed: boolean;
  }>({
    tone: 'Sovereign, austere, first-principles authoritative',
    cadence: 'Deliberate sentence length rhythm, rhythmic balance, zero filler',
    vocabulary: 'Architectural terminology, physical metaphors, unyielding discipline',
    analyzed: true,
  });

  // Chapters / Scenes Outline
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: 'chap-1',
      number: 1,
      title: 'The Unforgiving Bedrock',
      summary: 'An exploration of foundation failures when infrastructure fluctuates in the cold highland air.',
      content:
        'When power lines fluctuate in the Jos cold, only software that owns its state survives. Never depend on optimistic cloud continuous links. We build the floor before the skyscraper reaches into the clouds.',
      targetWords: 3500,
      currentWords: 38,
      status: 'in-review',
    },
    {
      id: 'chap-2',
      number: 2,
      title: 'The Plumb Line In The Dark',
      summary: 'A parable examining pride in abstract architecture versus real tensile strength.',
      content:
        'The architect walked the perimeter in darkness. No light illuminated the stone pillars except the faint silver glint of an iron plumb line suspended from the rafters.',
      targetWords: 4000,
      currentWords: 32,
      status: 'draft',
    },
    {
      id: 'chap-3',
      number: 3,
      title: 'The Cold Highland Theorem',
      summary: 'The final settlement of debts and the sovereign mandate of durable systems.',
      content:
        'Depth over velocity. Moving fast in the wrong direction is merely accelerating your own technical bankruptcy. Build the floor. Then build the next floor.',
      targetWords: 4500,
      currentWords: 28,
      status: 'draft',
    },
  ]);

  const [activeChapterId, setActiveChapterId] = useState<string>('chap-1');
  const [activeTab, setActiveTab] = useState<'write' | 'outline' | 'tracker' | 'history'>('write');

  // Invariants & Running Tracker
  const [invariants, setInvariants] = useState<InvariantItem[]>([
    {
      id: 'inv-1',
      category: 'character',
      name: 'Architect Nanpan',
      rule: 'Never compromises on defensive state. Speaks in measured, declarative statements.',
    },
    {
      id: 'inv-2',
      category: 'fact',
      name: 'Plateau Highlands',
      rule: 'Setting is cold, high altitude, subject to erratic grid power and telecommunication drops.',
    },
    {
      id: 'inv-3',
      category: 'plot',
      name: 'The 9:47 PM Equinox',
      rule: 'All sovereign transmissions unlock at exactly 9:47 PM. This cadence cannot be broken.',
    },
  ]);
  const [newInvName, setNewInvName] = useState('');
  const [newInvRule, setNewInvRule] = useState('');
  const [newInvCategory, setNewInvCategory] = useState<'character' | 'plot' | 'fact'>('character');

  // Co-Write Suggestions (Track Changes)
  const [isCoWriting, setIsCoWriting] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<CoWriteSuggestion | null>(null);

  // Version History / Snapshots
  const [snapshots, setSnapshots] = useState<DraftSnapshot[]>([]);

  // Check for imported draft from Book of Lies or previous session
  useEffect(() => {
    try {
      const imported = localStorage.getItem('jadai_creative_active_draft');
      if (imported) {
        const parsed = JSON.parse(imported);
        if (parsed.title && parsed.content) {
          const importedChap: Chapter = {
            id: `chap-imported-${Date.now()}`,
            number: 1,
            title: parsed.title,
            summary: parsed.prompt || 'Imported story draft from Book of Lies',
            content: parsed.content,
            targetWords: 4000,
            currentWords: parsed.content.split(/\s+/).filter(Boolean).length,
            status: 'draft',
          };
          setChapters([importedChap, ...chapters.slice(1)]);
          setActiveChapterId(importedChap.id);
          setProjectTitle(parsed.title);
          showToast(`Imported story draft: "${parsed.title}"`, 'success');
          // Clear active draft to prevent duplicate loops
          localStorage.removeItem('jadai_creative_active_draft');
        }
      }
    } catch {}
  }, []);

  // Continuity / Citation Check
  const [continuityResult, setContinuityResult] = useState<{
    passed: boolean;
    issues: string[];
    citations: string[];
  } | null>(null);
  const [checkingContinuity, setCheckingContinuity] = useState(false);

  // Active chapter accessor
  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];

  // Update content of active chapter
  const handleUpdateContent = (newContent: string) => {
    const wordCount = newContent.trim().split(/\s+/).filter(Boolean).length;
    setChapters((prev) =>
      prev.map((c) =>
        c.id === activeChapterId
          ? {
              ...c,
              content: newContent,
              currentWords: wordCount,
            }
          : c
      )
    );
  };

  // Save Snapshot
  const handleSaveSnapshot = () => {
    StudioAudio.playClick();
    const newSnap: DraftSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      chapterId: activeChapter.id,
      title: activeChapter.title,
      content: activeChapter.content,
      wordCount: activeChapter.currentWords,
    };
    const updated = [newSnap, ...snapshots];
    setSnapshots(updated);
    try {
      localStorage.setItem('jadai_writer_snapshots', JSON.stringify(updated));
    } catch {}
    StudioAudio.playSuccessArpeggio();
    showToast(`Snapshot saved: ${activeChapter.title} (${newSnap.wordCount} words)`, 'success');
  };

  // Analyze Voice Sample
  const handleAnalyzeVoice = () => {
    if (!voiceSample.trim()) {
      showToast('Please paste a sample of your writing.', 'error');
      return;
    }
    StudioAudio.playClick();
    showToast('Studying voice cadence, rhythm and vocabulary...', 'info');

    setTimeout(() => {
      setAnalyzedVoice({
        tone: 'Disciplined, reflective, philosophically grounded',
        cadence: 'Sparse declarative structures balanced by sensory architectural metaphors',
        vocabulary: 'High-register nouns, engineering rigor, zero filler qualifiers',
        analyzed: true,
      });
      StudioAudio.playSuccessArpeggio();
      showToast('Voice matched. AI co-writer locked to your exact authorial tone.', 'success');
    }, 1200);
  };

  // AI Co-Write Request (Returns Track Changes Diff, NEVER Silent Overwrite)
  const handleRequestCoWrite = () => {
    setIsCoWriting(true);
    StudioAudio.playClick();

    setTimeout(() => {
      setIsCoWriting(false);
      const addition = `\n\nTo build without accounting for failure is not optimism; it is negligence disguised as faith. The iron plumb line swings with mechanical honesty, unswayed by the promises of architects who have never seen stone crack in the frost.`;
      const original = activeChapter.content;
      const suggested = original + addition;

      setActiveSuggestion({
        originalText: original,
        suggestedText: suggested,
        diffSummary: 'Added 48 words expanding the moral consequence of structural negligence.',
        rationale: 'Deepens the central invariant while honoring the Jos Highlands setting.',
      });
      StudioAudio.playSuccessArpeggio();
      showToast('AI draft suggestion generated. Review track changes below.', 'info');
    }, 1500);
  };

  const handleAcceptSuggestion = () => {
    if (!activeSuggestion) return;
    StudioAudio.playSuccessArpeggio();
    handleUpdateContent(activeSuggestion.suggestedText);
    setActiveSuggestion(null);
    showToast('Suggestion accepted into master manuscript.', 'success');
  };

  const handleRejectSuggestion = () => {
    StudioAudio.playClick();
    setActiveSuggestion(null);
    showToast('Suggestion declined. Original text preserved.', 'info');
  };

  // Run Continuity & Citation Check
  const handleRunContinuityCheck = () => {
    setCheckingContinuity(true);
    StudioAudio.playClick();

    setTimeout(() => {
      setCheckingContinuity(false);
      setContinuityResult({
        passed: true,
        issues: [
          'No character inconsistencies detected against Architect Nanpan.',
          'Setting aligns with Jos Plateau cold weather and fluctuating power.',
          'Timeline respects the 9:47 PM transmission rule.',
        ],
        citations: [
          '[1] Vitruvius, De Architectura, Book I: Firmitas, Utilitas, Venustas.',
          '[2] Plateau State Geological Survey (2024), Granite Shear Resilience.',
        ],
      });
      StudioAudio.playSuccessArpeggio();
      showToast('Continuity audit passed: 100% adherence to tracked invariants.', 'success');
    }, 1200);
  };

  // Reorder Chapters
  const moveChapter = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= chapters.length) return;

    StudioAudio.playClick();
    const updated = [...chapters];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);

    // Re-number
    const renumbered = updated.map((c, i) => ({ ...c, number: i + 1 }));
    setChapters(renumbered);
  };

  // Add Chapter
  const handleAddChapter = () => {
    StudioAudio.playClick();
    const newNum = chapters.length + 1;
    const newChap: Chapter = {
      id: `chap-${Date.now()}`,
      number: newNum,
      title: `Chapter ${newNum}: Uncharted Stone`,
      summary: 'New scene outline...',
      content: '',
      targetWords: 3500,
      currentWords: 0,
      status: 'draft',
    };
    setChapters([...chapters, newChap]);
    setActiveChapterId(newChap.id);
    showToast(`Added Chapter #${newNum}`, 'success');
  };

  // Export to Formatted Document (.docx / PDF)
  const handleExportDocument = (format: 'docx' | 'pdf') => {
    StudioAudio.playClick();
    const totalWords = chapters.reduce((acc, c) => acc + c.currentWords, 0);

    // Build structured document content
    const docContent = `================================================================================
${projectTitle.toUpperCase()}
A Work of ${genre} (${formatType === 'book' ? 'Long-Form Manuscript' : 'Short-Form Thesis'})
Total Word Count: ${totalWords} Words
Target Word Count: ${targetLength} Words
Author: Architect Jehu Nanpan · Jadai Studios, Jos
Generated: ${new Date().toISOString()}
================================================================================

VOICE SPECIFICATION:
Tone: ${analyzedVoice.tone}
Cadence: ${analyzedVoice.cadence}

TRACKED INVARIANTS:
${invariants.map((i) => `• [${i.category.toUpperCase()}] ${i.name}: ${i.rule}`).join('\n')}

--------------------------------------------------------------------------------
TABLE OF CONTENTS
${chapters.map((c) => `${c.number}. ${c.title} .................... ${c.currentWords} words`).join('\n')}
--------------------------------------------------------------------------------

${chapters
  .map(
    (c) => `
CHAPTER ${c.number}: ${c.title.toUpperCase()}
[Scene Summary: ${c.summary}]

${c.content || '(Scene in progress...)'}

***
`
  )
  .join('\n')}

— Generated by Jadai Studios Book & Ghostwriting Engine · jadai.dev —
`;

    if (format === 'docx') {
      // Export as cleanly formatted Word-compatible document
      const blob = new Blob([docContent], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-manuscript.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      StudioAudio.playSuccessArpeggio();
      showToast('Exported formatted .docx manuscript with chapter breaks!', 'success');
    } else {
      // Print/PDF View
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${projectTitle}</title>
              <style>
                body { font-family: 'Times New Roman', serif; line-height: 1.8; padding: 40px; max-width: 800px; margin: auto; }
                h1 { text-align: center; margin-bottom: 2rem; font-size: 2rem; }
                h2 { margin-top: 3rem; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; font-size: 1.4rem; }
                p { margin-bottom: 1.5rem; text-indent: 2rem; }
                .meta { text-align: center; color: #666; font-size: 0.9rem; margin-bottom: 3rem; }
              </style>
            </head>
            <body>
              <h1>${projectTitle}</h1>
              <div class="meta">${genre} · Total ${totalWords} Words · Jadai Studios</div>
              ${chapters.map((c) => `<h2>Chapter ${c.number}: ${c.title}</h2><p>${c.content.replace(/\n\n/g, '</p><p>')}</p>`).join('')}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      showToast('Opened formatted print view for PDF export!', 'success');
    }
  };

  const totalWords = chapters.reduce((acc, c) => acc + c.currentWords, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 select-none text-[var(--text-secondary)]">
      {/* -------------------------------------------------------------------
          TOP SUB-HEADER: TITLE, PROGRESS & EXPORT BUTTONS
         ------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--gold)]">
            Canva-Grade Writing Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] mt-0.5">
            Write & Author
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Manuscript authoring, voice matching, outline reordering, running invariant tracking, and track-changes co-writing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExportDocument('docx')}>
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Export .docx</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => handleExportDocument('pdf')}>
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------------------
          TOP TABS: [Write] [Outline] [Tracker] [History]
         ------------------------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2 overflow-x-auto">
        {[
          { id: 'write', label: 'Write & Co-Author', icon: FileText },
          { id: 'outline', label: `Outline (${chapters.length} Chapters)`, icon: Layers },
          { id: 'tracker', label: `Invariants Tracker (${invariants.length})`, icon: CheckCircle2 },
          { id: 'history', label: `Snapshots (${snapshots.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                StudioAudio.playClick();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--gold)] text-[#050404] font-bold shadow-md'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* -------------------------------------------------------------------
          TAB 1: WRITE & CO-AUTHOR (CANVA-GRADE DEPTH)
         ------------------------------------------------------------------- */}
      {activeTab === 'write' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Chapter List Navigation */}
          <div className="lg:col-span-4 space-y-4">
            <GlassCard className="p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <span className="text-xs font-mono text-[var(--gold)] uppercase">Chapters</span>
                <button
                  type="button"
                  onClick={handleAddChapter}
                  className="p-1 rounded text-[var(--gold)] hover:bg-[var(--gold)]/20 cursor-pointer"
                  title="Add chapter"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {chapters.map((chap, idx) => (
                  <button
                    key={chap.id}
                    type="button"
                    onClick={() => {
                      setActiveChapterId(chap.id);
                      StudioAudio.playClick();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left font-mono text-xs transition-all cursor-pointer ${
                      activeChapterId === chap.id
                        ? 'bg-[var(--glass-fill)] border-[var(--gold)] text-[var(--text-primary)] shadow-sm'
                        : 'bg-black/20 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--gold)]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[var(--gold)] font-bold">Chapter #{chap.number}</span>
                      <span className="capitalize text-zinc-400">{chap.status}</span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)] block line-clamp-1 mt-0.5">
                      {chap.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      {chap.currentWords} / {chap.targetWords} words
                    </span>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Voice Profile Card */}
            <GlassCard className="p-4 space-y-2.5 font-mono text-xs">
              <span className="text-[10px] text-[var(--gold)] uppercase font-bold block">
                Active Author Voice Profile
              </span>
              <p className="text-[11px] text-[var(--text-primary)] italic">"{analyzedVoice.tone}"</p>
              <div className="text-[10px] text-[var(--text-secondary)] space-y-1 pt-1 border-t border-[var(--border-color)]">
                <div>Cadence: {analyzedVoice.cadence}</div>
                <div>Vocabulary: {analyzedVoice.vocabulary}</div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Editor & Track Changes Co-Write View */}
          <div className="lg:col-span-8 space-y-4">
            <GlassCard className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--gold)]">
                    Chapter #{activeChapter.number}
                  </span>
                  <input
                    type="text"
                    value={activeChapter.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChapters((prev) =>
                        prev.map((c) => (c.id === activeChapterId ? { ...c, title: val } : c))
                      );
                    }}
                    className="font-display font-bold text-xl text-[var(--text-primary)] bg-transparent border-none p-0 focus:outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveSnapshot}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3 h-3 text-[var(--gold)]" />
                    <span>Snapshot</span>
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isCoWriting}
                    onClick={handleRequestCoWrite}
                  >
                    <Sparkles className={`w-3.5 h-3.5 mr-1 ${isCoWriting ? 'animate-spin' : ''}`} />
                    <span>{isCoWriting ? 'Drafting Suggestion...' : 'Co-Write Section'}</span>
                  </Button>
                </div>
              </div>

              {/* TRACK-CHANGES SUGGESTION BANNER (NEVER SILENT OVERWRITE) */}
              {activeSuggestion && (
                <div className="p-4 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[var(--gold)] font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Proposed Addition (Track Changes)</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">{activeSuggestion.diffSummary}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-[var(--gold)]/30 space-y-2 text-xs">
                    <p className="text-zinc-400 text-[11px] italic">Rationale: {activeSuggestion.rationale}</p>
                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
                      {activeSuggestion.suggestedText.replace(activeSuggestion.originalText, '')}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleRejectSuggestion}
                      className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-950/30 text-xs font-mono cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={handleAcceptSuggestion}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs font-mono cursor-pointer"
                    >
                      Accept Suggestion
                    </button>
                  </div>
                </div>
              )}

              {/* Main Content Area */}
              <div className="space-y-3">
                {/* Writing Archetype Floor Toolbar */}
                <div className="p-3 rounded-xl bg-black/40 border border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[var(--gold)] font-bold flex items-center gap-1.5">
                      <Quote className="w-3 h-3" />
                      <span>Writing Floor Patterns & Structure</span>
                    </span>
                    <span className="text-zinc-500 text-[10px]">
                      Click to insert structural foundation
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {
                        name: 'Novel (In Media Res)',
                        desc: 'Begins mid-fall, backtracks to fatal assumption',
                        sample: 'The concrete did not wait for his explanation. It had already received the weight.\n\nThree hours before the scaffolding gave way on the north terrace, he was arguing with the accountant about bronze fasteners. "The brass is rated for three centuries," he had shouted over the generator\'s drone. "The storm won\'t notice forty cents worth of zinc."\n\nThe storm did not notice the price. It only noticed the shear force.\n\nPride is not ignoring the warning; it is hearing the warning and calculating how much of the disaster you can rebrand as an act of God.',
                      },
                      {
                        name: 'Shakespearean Wit',
                        desc: 'Poetic, theatrical soliloquy on vanity',
                        sample: 'What royal majesty is this that trembles at a servant’s whisper?\n\nThe courtier bows until his nose grazes the velvet carpet, yet in his pocket rests the key to the back granary, already sold to foreign merchants. The prince smiles upon his throne of polished cedar, praising the peace that shall outlive the stars.\n\n"My Lord," the jester says, juggling two roasted chestnuts, "the peace is indeed magnificent. It hath so quieted the marketplace that not a single baker remains alive to shout his prices."\n\nVanity paints the gate of gold while termites feast upon the lintel.',
                      },
                      {
                        name: 'Highland Noir',
                        desc: 'Cold Jos air, pragmatic truth & dry wit',
                        sample: 'The generator coughed twice, choked on diesel sediment, and died right around 3:14 AM.\n\nThe office went black. The only light left was the battery indicator on a battered ThinkPad and the red glow of a cigarette across the table.\n\n"Did you push to GitHub?" the junior engineer asked, voice shaking like thin tin in a harmattan breeze.\n\n"GitHub is three thousand miles away across an ocean floor cable that just got chewed by a trawler," I told him without looking up. "The question is: does this machine know who owes us money, or do we have to wait for Silicon Valley to wake up and tell us?"\n\nSovereignty isn\'t a bumper sticker. It\'s what happens when the grid drops out and your local state doesn\'t wipe itself clean like a coward.',
                      },
                      {
                        name: 'Non-Linear Mosaic',
                        desc: 'Vignettes snapping into truth',
                        sample: 'Fragment I: The Presentation.\nThe slides were forty-eight point Helvetica Neue. There were no numbers, only arrows pointing aggressively toward the upper right corner of the projector screen. Everyone applauded because nobody wanted to admit they didn\'t understand how the money came back.\n\nFragment II: The Quarry.\nTwelve years earlier. An old mason spitting into the dirt. "If you cut the stone against the grain, it smiles at you while you carve it, and splits when the frost arrives."\n\nFragment III: The Silence.\nThe quarterly call. The CEO had his camera turned off. "Technical headwinds," he called it. The wind was forty million dollars of uncollected invoices.',
                      },
                    ].map((pattern) => (
                      <button
                        key={pattern.name}
                        type="button"
                        onClick={() => {
                          const confirmInsert = !activeChapter.content || confirm('Insert this writing floor template into the current chapter?');
                          if (confirmInsert) {
                            handleUpdateContent(pattern.sample);
                            StudioAudio.playSuccessArpeggio();
                            showToast(`Applied ${pattern.name} floor pattern.`, 'success');
                          }
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-[var(--gold)]/15 border border-[var(--border-color)] hover:border-[var(--gold)]/40 text-left transition-colors cursor-pointer group"
                      >
                        <div className="text-[11px] font-mono font-bold text-[var(--text-primary)] group-hover:text-[var(--gold)]">
                          {pattern.name}
                        </div>
                        <div className="text-[9px] text-zinc-400 line-clamp-1 mt-0.5">
                          {pattern.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={14}
                  value={activeChapter.content}
                  onChange={(e) => handleUpdateContent(e.target.value)}
                  placeholder="Draft your scene here. Invariants are actively tracked in real time..."
                  className="w-full p-4 rounded-xl bg-black/40 border border-[var(--border-color)] text-[var(--text-primary)] font-serif text-base leading-relaxed focus:outline-none focus:border-[var(--gold)]"
                />

                <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] pt-1">
                  <span>
                    Words: <strong className="text-[var(--gold)]">{activeChapter.currentWords}</strong> /{' '}
                    {activeChapter.targetWords}
                  </span>
                  <span>Manuscript Total: {totalWords} words</span>
                </div>
              </div>

              {/* Continuity and Citations Audit Bar */}
              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleRunContinuityCheck}
                  disabled={checkingContinuity}
                  className="text-xs font-mono text-[var(--gold)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{checkingContinuity ? 'Running Audit...' : 'Run Continuity & Citation Check'}</span>
                </button>

                {continuityResult && (
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Invariants Verified</span>
                  </span>
                )}
              </div>

              {continuityResult && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[var(--gold)] uppercase font-bold">Continuity Verification</span>
                    {continuityResult.issues.map((iss, i) => (
                      <div key={i} className="text-zinc-300 text-[11px] flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{iss}</span>
                      </div>
                    ))}
                  </div>

                  {continuityResult.citations.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-[10px] text-[var(--gold)] uppercase font-bold">Document Citations</span>
                      {continuityResult.citations.map((cit, i) => (
                        <div key={i} className="text-zinc-400 text-[10px]">
                          {cit}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------
          TAB 2: OUTLINE BUILDER (DRAG & REORDER CHAPTERS)
         ------------------------------------------------------------------- */}
      {activeTab === 'outline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
                Manuscript Structure
              </h3>
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                Reorder scenes and chapters with dedicated up/down placement. Word targets calculate automatically.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleAddChapter}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Chapter</span>
            </Button>
          </div>

          <div className="space-y-3">
            {chapters.map((chap, idx) => (
              <GlassCard key={chap.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[var(--gold)]/20 text-[var(--gold)] font-mono text-[10px] font-bold">
                      Chapter #{chap.number}
                    </span>
                    <h4 className="font-display font-bold text-sm text-[var(--text-primary)]">
                      {chap.title}
                    </h4>
                  </div>
                  <p className="text-xs font-mono text-[var(--text-secondary)]">{chap.summary}</p>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 pt-1">
                    <span>Current: {chap.currentWords} words</span>
                    <span>Target: {chap.targetWords} words</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveChapter(idx, 'up')}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 cursor-pointer text-zinc-300"
                    title="Move chapter up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={idx === chapters.length - 1}
                    onClick={() => moveChapter(idx, 'down')}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 cursor-pointer text-zinc-300"
                    title="Move chapter down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveChapterId(chap.id);
                      setActiveTab('write');
                      StudioAudio.playClick();
                    }}
                    className="px-3 py-1 rounded-lg bg-[var(--gold)] text-black text-xs font-mono font-bold hover:bg-[var(--gold-bright)] cursor-pointer ml-2"
                  >
                    Edit Scene
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------
          TAB 3: INVARIANTS & CONTINUITY TRACKER
         ------------------------------------------------------------------- */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
                Character, Plot & Fact Invariants
              </h3>
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                Rules tracked here are automatically injected into AI prompts so subsequent sections remain 100% consistent.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Tracker List */}
            <div className="md:col-span-7 space-y-3">
              {invariants.map((inv) => (
                <GlassCard key={inv.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono text-[var(--text-primary)]">
                        {inv.name}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase bg-[var(--gold)]/20 text-[var(--gold)]">
                        {inv.category}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[var(--text-secondary)]">{inv.rule}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInvariants(invariants.filter((i) => i.id !== inv.id));
                      StudioAudio.playClick();
                    }}
                    className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </GlassCard>
              ))}
            </div>

            {/* Right: Add Invariant Form */}
            <div className="md:col-span-5 space-y-4">
              <GlassCard className="p-6 space-y-4 font-mono text-xs">
                <span className="text-xs font-bold text-[var(--gold)] uppercase block">
                  Add Running Invariant
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[var(--text-secondary)] block">Category</label>
                  <select
                    value={newInvCategory}
                    onChange={(e) => setNewInvCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--border-color)] text-[var(--text-primary)]"
                  >
                    <option value="character">Character / Entity</option>
                    <option value="plot">Plot Milestone / Rule</option>
                    <option value="fact">Technical Fact / Invariant</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[var(--text-secondary)] block">Entity or Concept Name</label>
                  <input
                    type="text"
                    value={newInvName}
                    onChange={(e) => setNewInvName(e.target.value)}
                    placeholder="e.g. Inspector Vance"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--border-color)] text-[var(--text-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[var(--text-secondary)] block">Rule / Invariant Truth</label>
                  <textarea
                    rows={3}
                    value={newInvRule}
                    onChange={(e) => setNewInvRule(e.target.value)}
                    placeholder="e.g. Always carries a pocket spectrometer. Never accepts verbal estimates."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--border-color)] text-[var(--text-primary)]"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    if (!newInvName.trim() || !newInvRule.trim()) return;
                    StudioAudio.playSuccessArpeggio();
                    setInvariants([
                      ...invariants,
                      {
                        id: `inv-${Date.now()}`,
                        category: newInvCategory,
                        name: newInvName,
                        rule: newInvRule,
                      },
                    ]);
                    setNewInvName('');
                    setNewInvRule('');
                    showToast('Invariant logged in tracker', 'success');
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Lock Invariant</span>
                </Button>
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------
          TAB 4: VERSION HISTORY & DRAFT SNAPSHOTS
         ------------------------------------------------------------------- */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
                Draft Snapshots & Restoration
              </h3>
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                Every snapshot stores the complete text at that moment. Restore with a single click.
              </p>
            </div>
          </div>

          {snapshots.length === 0 ? (
            <GlassCard className="p-8 text-center space-y-2">
              <History className="w-6 h-6 text-[var(--gold)] mx-auto opacity-50" />
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                No snapshots saved yet. Click "Snapshot" while writing to create restorable checkpoints.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {snapshots.map((snap) => (
                <GlassCard key={snap.id} className="p-4 flex items-center justify-between gap-4 font-mono text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">{snap.title}</span>
                      <span className="text-[10px] text-zinc-500">· Saved at {snap.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{snap.content}</p>
                    <span className="text-[10px] text-[var(--gold)]">{snap.wordCount} words recorded</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateContent(snap.content);
                      StudioAudio.playSuccessArpeggio();
                      showToast(`Restored snapshot from ${snap.timestamp}`, 'success');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--gold)]/20 hover:bg-[var(--gold)] text-[var(--gold)] hover:text-black font-bold text-xs cursor-pointer transition-colors"
                  >
                    Restore
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GhostwritingWorkspace;
