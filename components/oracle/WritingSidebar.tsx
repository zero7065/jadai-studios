'use client';

import React, { useState } from 'react';
import {
  WRITING_MODES,
  WritingModeId,
  ToneId,
  TONE_OPTIONS,
  WRITING_TEMPLATES,
  WriterMemoryProfile,
} from '@/modules/oracle/lib/writing-modes';
import {
  SlidersHorizontal,
  Sparkles,
  ListTree,
  Brain,
  LayoutTemplate,
  Search,
  Lightbulb,
  Repeat,
  Minimize2,
  Maximize2,
  Palette,
  Check,
  Plus,
  Trash2,
  Quote,
  ExternalLink,
  BookOpen,
  User,
  FileText,
  Bookmark,
  Share2,
  Copy,
} from 'lucide-react';

export type SidebarTab = 'modes' | 'assist' | 'structure' | 'memory' | 'templates' | 'research';

export interface OutlineSection {
  id: string;
  title: string;
  snippet?: string;
}

export interface StoryCharacter {
  id: string;
  name: string;
  role: string;
  traits: string;
}

export interface ResearchSnippet {
  id: string;
  title: string;
  content: string;
  source: string;
}

export interface WritingSidebarProps {
  currentMode: WritingModeId;
  onSelectMode: (mode: WritingModeId) => void;
  currentTone: ToneId;
  onChangeTone: (tone: ToneId) => void;
  // AI Assist actions
  onContinueThought: () => void;
  onSuggestNextSentence: () => void;
  onRewriteParagraph: () => void;
  onSimplify: () => void;
  onExpand: () => void;
  onChangeToneSubmit: (targetTone: ToneId) => void;
  isGenerating: boolean;
  // Outline & Structure
  outline: OutlineSection[];
  onAddOutlineSection: (title: string) => void;
  onRemoveOutlineSection: (id: string) => void;
  onJumpToSection?: (title: string) => void;
  // Characters
  characters: StoryCharacter[];
  onAddCharacter: (char: Omit<StoryCharacter, 'id'>) => void;
  onRemoveCharacter: (id: string) => void;
  // Research notes
  researchNotes: string;
  onChangeResearchNotes: (notes: string) => void;
  // Memory
  memoryProfile: WriterMemoryProfile;
  // Templates
  onInsertTemplate: (scaffold: string) => void;
  // Research
  onSearchResearch: (query: string) => Promise<void>;
  researchResults: string[];
  isSearching: boolean;
  savedSnippets: ResearchSnippet[];
  onSaveSnippet: (snippet: Omit<ResearchSnippet, 'id'>) => void;
  onRemoveSnippet: (id: string) => void;
  onCiteInWriting: (snippetText: string, source: string) => void;
}

export const WritingSidebar: React.FC<WritingSidebarProps> = ({
  currentMode,
  onSelectMode,
  currentTone,
  onChangeTone,
  onContinueThought,
  onSuggestNextSentence,
  onRewriteParagraph,
  onSimplify,
  onExpand,
  onChangeToneSubmit,
  isGenerating,
  outline,
  onAddOutlineSection,
  onRemoveOutlineSection,
  onJumpToSection,
  characters,
  onAddCharacter,
  onRemoveCharacter,
  researchNotes,
  onChangeResearchNotes,
  memoryProfile,
  onInsertTemplate,
  onSearchResearch,
  researchResults,
  isSearching,
  savedSnippets,
  onSaveSnippet,
  onRemoveSnippet,
  onCiteInWriting,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('modes');

  // Local state for forms
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState('');
  const [newCharTraits, setNewCharTraits] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: Array<{ id: SidebarTab; label: string; icon: React.ElementType }> = [
    { id: 'modes', label: 'Modes', icon: SlidersHorizontal },
    { id: 'assist', label: 'AI Assist', icon: Sparkles },
    { id: 'structure', label: 'Structure', icon: ListTree },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'research', label: 'Research', icon: Search },
  ];

  return (
    <aside className="w-full h-full flex flex-col bg-[#0a0908] border-l border-[rgba(201,168,76,0.2)] text-[#c4c0bb] font-sans overflow-hidden">
      {/* 6 Tabs Navigation Header */}
      <div className="flex items-center overflow-x-auto border-b border-[rgba(201,168,76,0.18)] bg-[#050404] px-1 py-1 shrink-0 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium rounded-lg transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[rgba(201,168,76,0.18)] text-[#e8c96a] border border-[rgba(201,168,76,0.35)] shadow-xs'
                  : 'text-[#8a857e] hover:text-[#f5f3f0] hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ===================================================================
            TAB 1: MODES
            =================================================================== */}
        {activeTab === 'modes' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Manuscript Purpose
              </span>
              <h3 className="text-sm font-display font-bold text-[#f5f3f0] mt-0.5">
                Select Writing Mode
              </h3>
              <p className="text-xs text-[#8a857e] mt-1 leading-relaxed">
                Tune the underlying LLM's syntactic cadence, vocabulary density, and structural constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(Object.keys(WRITING_MODES) as WritingModeId[]).map((modeKey) => {
                const mode = WRITING_MODES[modeKey];
                const isSelected = currentMode === modeKey;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onSelectMode(mode.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[rgba(201,168,76,0.14)] border-[#C9A84C] text-[#f5f3f0] shadow-sm ring-1 ring-[#C9A84C]/30'
                        : 'bg-[#0e0d0c] border-[rgba(201,168,76,0.12)] text-[#a8a49e] hover:border-[rgba(201,168,76,0.3)] hover:text-[#f5f3f0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs uppercase tracking-wide text-[#e8c96a]">
                        {mode.label}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]" />
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-[#f5f3f0] mt-0.5">{mode.tagline}</p>
                    <p className="text-[10px] text-[#8a857e] mt-1 leading-normal line-clamp-2">
                      {mode.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: AI ASSIST
            =================================================================== */}
        {activeTab === 'assist' && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Socratic Prose Co-Pilot
              </span>
              <h3 className="text-sm font-display font-bold text-[#f5f3f0] mt-0.5">
                AI Writing Assist
              </h3>
              <p className="text-xs text-[#8a857e] mt-1">
                Refine, continue, and elevate your prose without sounding corporate or synthetic.
              </p>
            </div>

            {/* Quick Continuation Actions */}
            <div className="space-y-2">
              <button
                onClick={onContinueThought}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#b8941e] text-[#050404] font-mono text-xs font-bold hover:brightness-110 active:scale-[0.99] transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Synthesizing...' : 'Continue My Thought'}</span>
              </button>

              <button
                onClick={onSuggestNextSentence}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e0d0c] border border-[rgba(201,168,76,0.3)] text-[#e8c96a] font-mono text-xs font-medium hover:bg-[rgba(201,168,76,0.08)] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>Suggest Next Sentence</span>
              </button>

              <button
                onClick={onRewriteParagraph}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e0d0c] border border-[rgba(201,168,76,0.2)] text-[#c4c0bb] font-mono text-xs hover:border-[#C9A84C] hover:text-[#f5f3f0] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Rewrite Highlighted Paragraph</span>
              </button>
            </div>

            {/* Prose Adjustments */}
            <div className="space-y-2 pt-2 border-t border-[rgba(201,168,76,0.15)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a6e2a]">
                Paragraph Transformations
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onSimplify}
                  disabled={isGenerating}
                  className="px-3 py-2 rounded-lg bg-[#0e0d0c] border border-[rgba(201,168,76,0.2)] text-[11px] font-mono text-[#c4c0bb] hover:border-[#C9A84C] hover:text-[#f5f3f0] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Minimize2 className="w-3 h-3 text-[#C9A84C]" />
                  <span>Simplify</span>
                </button>
                <button
                  onClick={onExpand}
                  disabled={isGenerating}
                  className="px-3 py-2 rounded-lg bg-[#0e0d0c] border border-[rgba(201,168,76,0.2)] text-[11px] font-mono text-[#c4c0bb] hover:border-[#C9A84C] hover:text-[#f5f3f0] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3 text-[#C9A84C]" />
                  <span>Expand</span>
                </button>
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-2 pt-2 border-t border-[rgba(201,168,76,0.15)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a6e2a]">
                  Cadence & Tone
                </span>
                <span className="text-[10px] font-mono text-[#C9A84C] font-bold uppercase">
                  {currentTone}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {TONE_OPTIONS.map((t) => {
                  const isSelected = currentTone === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onChangeTone(t.id);
                        onChangeToneSubmit(t.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[rgba(201,168,76,0.18)] border-[#C9A84C] text-[#f5f3f0]'
                          : 'bg-[#0e0d0c] border-[rgba(201,168,76,0.15)] text-[#a8a49e] hover:border-[rgba(201,168,76,0.3)] hover:text-[#f5f3f0]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold">{t.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#C9A84C]" />}
                      </div>
                      <p className="text-[10px] text-[#8a857e] mt-0.5 line-clamp-1">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: STRUCTURE
            =================================================================== */}
        {activeTab === 'structure' && (
          <div className="space-y-6">
            {/* Outline View */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                    Manuscript Architecture
                  </span>
                  <h4 className="text-xs font-display font-bold text-[#f5f3f0]">Chapters & Outline</h4>
                </div>
                <span className="text-[10px] font-mono text-[#8a6e2a]">{outline.length} sections</span>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {outline.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="group p-2.5 rounded-lg bg-[#0e0d0c] border border-[rgba(201,168,76,0.15)] hover:border-[rgba(201,168,76,0.4)] flex items-center justify-between gap-2 transition-all"
                  >
                    <button
                      onClick={() => onJumpToSection?.(sec.title)}
                      className="flex-1 text-left flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-[10px] font-mono text-[#8a6e2a]">#{idx + 1}</span>
                      <span className="text-xs text-[#f5f3f0] group-hover:text-[#e8c96a] font-medium truncate">
                        {sec.title}
                      </span>
                    </button>
                    <button
                      onClick={() => onRemoveOutlineSection(sec.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#8a857e] hover:text-[#C0392B] transition-opacity cursor-pointer"
                      title="Remove section"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Outline Section Form */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSectionTitle.trim()) {
                      onAddOutlineSection(newSectionTitle.trim());
                      setNewSectionTitle('');
                    }
                  }}
                  placeholder="New chapter or heading..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] placeholder-[#8a857e] focus:outline-none focus:border-[#C9A84C]"
                />
                <button
                  onClick={() => {
                    if (newSectionTitle.trim()) {
                      onAddOutlineSection(newSectionTitle.trim());
                      setNewSectionTitle('');
                    }
                  }}
                  className="p-1.5 rounded-lg bg-[rgba(201,168,76,0.18)] text-[#e8c96a] hover:bg-[#C9A84C] hover:text-[#050404] transition-colors cursor-pointer"
                  title="Add outline section"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Character List (for Stories & Novels) */}
            <div className="space-y-3 pt-3 border-t border-[rgba(201,168,76,0.15)]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                    Dramatis Personae
                  </span>
                  <h4 className="text-xs font-display font-bold text-[#f5f3f0]">Character Roster</h4>
                </div>
                <span className="text-[10px] font-mono text-[#8a6e2a]">{characters.length} characters</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className="p-2.5 rounded-lg bg-[#0e0d0c] border border-[rgba(201,168,76,0.15)] flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-[#C9A84C]" />
                        <span className="text-xs font-bold text-[#f5f3f0]">{char.name}</span>
                        <span className="text-[10px] font-mono text-[#8a6e2a]">({char.role})</span>
                      </div>
                      {char.traits && (
                        <p className="text-[10px] text-[#a8a49e] mt-1 italic">{char.traits}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveCharacter(char.id)}
                      className="p-1 text-[#8a857e] hover:text-[#C0392B] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Character inputs */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={newCharName}
                    onChange={(e) => setNewCharName(e.target.value)}
                    placeholder="Name (e.g. Nanpan)"
                    className="px-2.5 py-1.5 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] placeholder-[#8a857e] focus:outline-none focus:border-[#C9A84C]"
                  />
                  <input
                    type="text"
                    value={newCharRole}
                    onChange={(e) => setNewCharRole(e.target.value)}
                    placeholder="Role (e.g. Architect)"
                    className="px-2.5 py-1.5 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] placeholder-[#8a857e] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newCharTraits}
                    onChange={(e) => setNewCharTraits(e.target.value)}
                    placeholder="Core traits or fatal flaw..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] placeholder-[#8a857e] focus:outline-none focus:border-[#C9A84C]"
                  />
                  <button
                    onClick={() => {
                      if (newCharName.trim()) {
                        onAddCharacter({
                          name: newCharName.trim(),
                          role: newCharRole.trim() || 'Protagonist',
                          traits: newCharTraits.trim(),
                        });
                        setNewCharName('');
                        setNewCharRole('');
                        setNewCharTraits('');
                      }
                    }}
                    className="p-1.5 rounded-lg bg-[rgba(201,168,76,0.18)] text-[#e8c96a] hover:bg-[#C9A84C] hover:text-[#050404] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Research Notes Panel */}
            <div className="space-y-2 pt-3 border-t border-[rgba(201,168,76,0.15)]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Desk Scratchpad
              </span>
              <h4 className="text-xs font-display font-bold text-[#f5f3f0]">Research & Working Notes</h4>
              <textarea
                value={researchNotes}
                onChange={(e) => onChangeResearchNotes(e.target.value)}
                placeholder="Drop raw quotes, facts, citations, plot reminders, or links here..."
                rows={4}
                className="w-full px-3 py-2 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] text-xs font-mono text-[#c4c0bb] placeholder-[#8a857e] focus:outline-none focus:border-[#C9A84C] resize-y"
              />
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: MEMORY (IndexedDB Persistent)
            =================================================================== */}
        {activeTab === 'memory' && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Local IndexedDB Memory
              </span>
              <h3 className="text-sm font-display font-bold text-[#f5f3f0] mt-0.5">
                Author Voice Profile
              </h3>
              <p className="text-xs text-[#8a857e] mt-1 leading-relaxed">
                Persistent across browser sessions. Stored strictly on your local device—never leaves unless synchronized.
              </p>
            </div>

            {/* Voice Profile Card */}
            <div className="p-3.5 rounded-xl bg-[#0e0d0c] border border-[rgba(201,168,76,0.25)] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8a6e2a]">Primary Tone:</span>
                <span className="text-[#e8c96a] font-bold uppercase">{memoryProfile.voiceProfile.primaryTone}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8a6e2a]">Sentence Pacing:</span>
                <span className="text-[#f5f3f0] capitalize">{memoryProfile.voiceProfile.avgSentenceLength}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8a6e2a]">Vocabulary Depth:</span>
                <span className="text-[#f5f3f0] capitalize">{memoryProfile.voiceProfile.vocabularyLevel}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8a6e2a]">Cadence Integrity:</span>
                <span className="text-emerald-400 font-bold">{memoryProfile.voiceProfile.cadenceScore}%</span>
              </div>
            </div>

            {/* You Write */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3 h-3" />
                <span>You Write (Reinforced Patterns)</span>
              </span>
              <ul className="space-y-1.5">
                {memoryProfile.youWrite.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-2 rounded-lg bg-[#0e0d0c] border border-emerald-500/20 text-[11px] text-[#c4c0bb] leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* You Avoid */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C0392B] flex items-center gap-1.5">
                <Trash2 className="w-3 h-3" />
                <span>You Avoid (Rejected Tropes)</span>
              </span>
              <ul className="space-y-1.5">
                {memoryProfile.youAvoid.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-2 rounded-lg bg-[#0e0d0c] border border-[#C0392B]/20 text-[11px] text-[#c4c0bb] leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recurring Themes */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A84C]">
                Recurring Themes & Keywords
              </span>
              <div className="flex flex-wrap gap-1.5">
                {memoryProfile.recurringThemes.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)] text-[10px] font-mono text-[#e8c96a]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 5: TEMPLATES
            =================================================================== */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Architectural Scaffolds
              </span>
              <h3 className="text-sm font-display font-bold text-[#f5f3f0] mt-0.5">
                Pre-Built Templates
              </h3>
              <p className="text-xs text-[#8a857e] mt-1 leading-relaxed">
                Insert battle-tested frameworks directly onto your canvas to accelerate your composition.
              </p>
            </div>

            <div className="space-y-3">
              {WRITING_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-3 rounded-xl bg-[#0e0d0c] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-[#f5f3f0]">
                      {tmpl.title}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[rgba(201,168,76,0.1)] text-[#C9A84C]">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8a857e] leading-snug">
                    {tmpl.description}
                  </p>
                  <button
                    onClick={() => onInsertTemplate(tmpl.scaffoldText)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[rgba(201,168,76,0.15)] text-[#e8c96a] font-mono text-[11px] font-medium hover:bg-[#C9A84C] hover:text-[#050404] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert Template onto Canvas</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 6: RESEARCH
            =================================================================== */}
        {activeTab === 'research' && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Intelligence Grounding
              </span>
              <h3 className="text-sm font-display font-bold text-[#f5f3f0] mt-0.5">
                Web Research & Citation
              </h3>
              <p className="text-xs text-[#8a857e] mt-1">
                Retrieve historical facts, citations, and empirical evidence to substantiate your writing.
              </p>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onSearchResearch(searchQuery.trim());
                  }
                }}
                placeholder="Search web facts, dates, sources..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] placeholder-[#8a857e] focus:outline-none focus:border-[#C9A84C]"
              />
              <button
                onClick={() => {
                  if (searchQuery.trim()) onSearchResearch(searchQuery.trim());
                }}
                disabled={isSearching}
                className="p-2 rounded-xl bg-[rgba(201,168,76,0.18)] text-[#e8c96a] hover:bg-[#C9A84C] hover:text-[#050404] transition-all cursor-pointer disabled:opacity-50"
                title="Execute Research Query"
              >
                <Search className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Live Search Results */}
            {researchResults.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a6e2a]">
                  Synthesized Evidence
                </span>
                {researchResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0e0d0c] border border-[rgba(201,168,76,0.2)] space-y-2"
                  >
                    <p className="text-xs text-[#c4c0bb] leading-relaxed">{res}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <button
                        onClick={() =>
                          onSaveSnippet({
                            title: `Research Note #${idx + 1}`,
                            content: res,
                            source: searchQuery || 'Web Query',
                          })
                        }
                        className="text-[10px] font-mono text-[#8a6e2a] hover:text-[#e8c96a] flex items-center gap-1 cursor-pointer"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>Save Snippet</span>
                      </button>
                      <button
                        onClick={() => onCiteInWriting(res, searchQuery || 'Web Research')}
                        className="text-[10px] font-mono text-[#C9A84C] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Quote className="w-3 h-3" />
                        <span>Cite in Canvas</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Saved Snippets List */}
            <div className="space-y-2 pt-2 border-t border-[rgba(201,168,76,0.15)]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a6e2a]">
                Saved Research Snippets ({savedSnippets.length})
              </span>
              {savedSnippets.length === 0 ? (
                <p className="text-xs text-[#8a857e] italic py-2">
                  No snippets saved yet. Search above and save insights.
                </p>
              ) : (
                <div className="space-y-2">
                  {savedSnippets.map((snp) => (
                    <div
                      key={snp.id}
                      className="p-2.5 rounded-xl bg-[#0e0d0c] border border-[rgba(201,168,76,0.15)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-[#f5f3f0]">
                          {snp.title}
                        </span>
                        <button
                          onClick={() => onRemoveSnippet(snp.id)}
                          className="text-[#8a857e] hover:text-[#C0392B] cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#a8a49e] line-clamp-3 leading-relaxed">
                        "{snp.content}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8a6e2a] pt-1">
                        <span>Src: {snp.source}</span>
                        <button
                          onClick={() => onCiteInWriting(snp.content, snp.source)}
                          className="text-[#e8c96a] hover:underline font-bold cursor-pointer"
                        >
                          Cite ↗
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default WritingSidebar;
