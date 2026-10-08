import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { calculateCosineSimilarity, evaluateRiddleAnswer, ContentItem } from '@/lib/content/delivery';
import { useToast } from '@/components/providers/ToastProvider';
import { FileText, Plus, Clock, Sparkles, Trash2, Edit2, Play, CheckCircle } from 'lucide-react';

const SEED_CONTENT_BANK: ContentItem[] = [
  {
    id: 'cnt-001',
    type: 'riddle',
    title: 'The Foundation Invariant',
    content: 'I have no walls, yet without me the skyscraper cracks. I cost no rent, but I demand all your discipline. What am I?',
    question: 'What am I?',
    answer: 'The floor',
    hint: 'Look to the motto of the studio.',
    lesson: 'Build the floor before you build the glass tower. You cannot scale ungrounded ambition.',
    difficulty: 'initiate',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-002',
    type: 'wisdom',
    title: 'The Doctrine of Zero Chunk Code',
    content: 'A software engineer who writes half-working placeholders builds debt for their future self. If an edge case exists, confront it in turn zero.',
    category: 'Engineering Standards',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-003',
    type: 'philosophy',
    title: 'The Cold Highland Theorem',
    content: 'When power lines fluctuate in the Jos cold, only software that owns its state survives. Never depend on optimistic cloud continuous links.',
    category: 'Sovereignty',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-004',
    type: 'riddle',
    title: 'The 4-Step Chain',
    content: 'First I am lightning fast. If I stumble, the Titan catches the fall. If the Titan is blind, the memory vault answers. What system am I?',
    question: 'What am I?',
    answer: 'AI fallback chain',
    hint: 'Groq, Gemini, and Cache in unison.',
    lesson: 'Redundancy is the only cure for vendor fragility.',
    difficulty: 'adept',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-005',
    type: 'wisdom',
    title: 'The Cost of Convenience',
    content: 'Every external library you import without reading is a silent mortgage on your software autonomy. Prefer 50 lines of clear native code over a heavy dependency.',
    category: 'Architecture',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-006',
    type: 'philosophy',
    title: 'The Law of Soil Integrity',
    content: 'No amount of gilded masonry can redeem a muddy foundation. When a project stalls, examine not the facade, but the unexamined early assumptions.',
    category: 'Truth in Systems',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-007',
    type: 'riddle',
    title: 'The Sovereign Safe',
    content: 'I have twelve ticks and a golden eye. Turn me with intention to unlock every chamber of the studio. What am I?',
    question: 'What am I?',
    answer: 'The Vault dial',
    hint: 'Look to the top corner of your screen.',
    lesson: 'Navigation should feel like turning an ancient brass safe, not clicking an off-the-shelf burger menu.',
    difficulty: 'initiate',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-008',
    type: 'wisdom',
    title: 'Depth Over Velocity',
    content: 'Moving fast in the wrong direction is merely accelerating your own technical bankruptcy. Take the afternoon to think; take the evening to execute cleanly.',
    category: 'Craftsmanship',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-009',
    type: 'philosophy',
    title: 'The Offline Mandate',
    content: 'Software that vanishes when the signal tower cuts out is not a tool; it is a temporary lease on someone else’s server. Build for the disconnect.',
    category: 'Resilience',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-010',
    type: 'riddle',
    title: 'The Silent Ledger',
    content: 'I keep every receipt, every tier shift, and every timestamp. I cannot be bribed, and I never sleep through the equinox. What am I?',
    question: 'What am I?',
    answer: 'The audit log',
    hint: 'Cryptographic records of truth.',
    lesson: 'Truth in systems requires immutable logs. What you cannot trace, you do not own.',
    difficulty: 'adept',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-011',
    type: 'wisdom',
    title: 'The Discipline of the Edge',
    content: 'The user in Kano on 3G deserves the exact same sub-second responsiveness as the user in London on fiber. Optimize payloads ruthlessly.',
    category: 'Performance',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-012',
    type: 'philosophy',
    title: 'The Metatron Proportions',
    content: 'Thirteen circles, seventy-eight connecting vectors. Sacred geometry is not mysticism; it is the mathematical proof that balance is non-negotiable.',
    category: 'Design Systems',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-013',
    type: 'riddle',
    title: 'The Unforgiving Guard',
    content: 'I inspect every query at the door. If your user ID does not match the room, you see only void. What database feature am I?',
    question: 'What am I?',
    answer: 'Row level security',
    hint: 'RLS in PostgreSQL.',
    lesson: 'Security must live in the database floor, never merely in client-side visual toggles.',
    difficulty: 'adept',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-014',
    type: 'wisdom',
    title: 'The Danger of Synthetic Praise',
    content: 'An AI companion that flatters your errors is an enemy to your development. Demand instruments that challenge your premises directly.',
    category: 'Intelligence',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-015',
    type: 'philosophy',
    title: 'The Sovereign Settlement Principle',
    content: 'A business that cannot collect funds across borders without arbitrary account freezes is operating on borrowed time. Dual-currency rails are fundamental.',
    category: 'Commerce',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-016',
    type: 'riddle',
    title: 'The Nightly Transmission',
    content: 'I arrive exactly thirteen minutes before ten o’clock. I carry parables of pride, envy, and stone. What hour am I tied to?',
    question: 'What hour am I tied to?',
    answer: '9:47 PM',
    hint: '21:47 on the 24-hour clock.',
    lesson: 'A rhythm kept with absolute fidelity commands deeper respect than constant noisy broadcasting.',
    difficulty: 'initiate',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-017',
    type: 'wisdom',
    title: 'The Principle of Zero Blank Screens',
    content: 'If an API fails, show cached truth. If cache misses, show deterministic wisdom. Never leave a user staring into a white void of unhandled failure.',
    category: 'User Experience',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-018',
    type: 'philosophy',
    title: 'The Highlands Foundry',
    content: 'Cold air sharpens the intellect. What is forged under pressure on the Plateau carries a temper that soft conditions can never produce.',
    category: 'Origins',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-019',
    type: 'riddle',
    title: 'The Five Flagships',
    content: 'One captures light in a lens, one moves products without noise, one shelters the voiceless, one grows botanical seasons, one illuminates beauty. What are we?',
    question: 'What are we?',
    answer: 'The five templates',
    hint: 'Aperture, Vendor, Shelter, Bloom, Glow.',
    lesson: 'A marketplace should not sell hundred-page junk. It should offer complete, uncompromising instruments.',
    difficulty: 'master',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-020',
    type: 'wisdom',
    title: 'The Fiduciary Code of the Engineer',
    content: 'When you take a client’s capital to build their digital vehicle, building brittle scaffolding is not a mistake; it is a breach of trust. Build the floor.',
    category: 'Professional Ethics',
    scheduled_time: '21:47',
  },
  {
    id: 'cnt-021',
    type: 'philosophy',
    title: 'The Monument of Tomorrow',
    content: 'We do not build for the applause of the timeline. We build systems that will stand quiet, functional, and dignified ten years from tonight.',
    category: 'Vision',
    scheduled_time: '21:47',
  },
];

export default function AdminContentBankPage() {
  const [items, setItems] = useState<ContentItem[]>(SEED_CONTENT_BANK);
  const [filterType, setFilterType] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [testModalItem, setTestModalItem] = useState<ContentItem | null>(null);
  const [testAnswerInput, setTestAnswerInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const { showToast } = useToast();

  // New Content Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContentItem['type']>('wisdom');
  const [content, setContent] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [lesson, setLesson] = useState('');
  const [difficulty, setDifficulty] = useState<ContentItem['difficulty']>('initiate');
  const [is947Scheduled, setIs947Scheduled] = useState(true);

  const filteredItems = items.filter(
    (i) => filterType === 'All' || i.type === filterType
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      showToast('Title and content are required', 'error');
      return;
    }

    const newItem: ContentItem = {
      id: `cnt-${Date.now()}`,
      type,
      title,
      content,
      answer: type === 'riddle' ? answer : undefined,
      hint: type === 'riddle' ? hint : undefined,
      lesson: type === 'riddle' ? lesson : undefined,
      difficulty: type === 'riddle' ? difficulty : undefined,
      scheduled_time: is947Scheduled ? '21:47' : undefined,
    };

    setItems([newItem, ...items]);
    setModalOpen(false);
    showToast(`Content item "${title}" committed to delivery ledger.`, 'success');
  };

  const handleRunRiddleTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testModalItem || !testModalItem.answer) return;
    const res = evaluateRiddleAnswer(testAnswerInput, testModalItem.answer, testModalItem.lesson);
    setTestResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Content Engine</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">9:47 PM Content Bank</h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Manage philosophical fiction, moral parables, and semantic riddle resonance evaluation.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>New Transmission</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'riddle', 'wisdom', 'philosophy', 'motivation', 'lesson'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3 py-1 rounded text-xs font-mono capitalize transition-all ${
              filterType === cat
                ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-[0_0_10px_rgba(201,168,76,0.3)]'
                : 'bg-[#0a0908] text-[#c4c0bb] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C]'
            }`}
          >
            {cat === 'All' ? 'All Content' : cat}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <GlassCard key={item.id} className="p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#C9A84C] px-2 py-0.5 rounded bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.25)]">
                  {item.type}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8a6e2a]">
                  <Clock className="w-3 h-3 text-[#C9A84C]" />
                  <span>Cadence: 9:47 PM</span>
                </div>
              </div>

              <h3 className="font-display font-bold text-base text-[#f5f3f0]">{item.title}</h3>
              <p className="text-xs text-[#c4c0bb] leading-relaxed line-clamp-3">{item.content}</p>

              {item.type === 'riddle' && (
                <div className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] text-[11px] font-mono text-[#8a6e2a] space-y-1">
                  <div>
                    <span className="text-[#f5f3f0]">Answer:</span> {item.answer}
                  </div>
                  <div>
                    <span className="text-[#f5f3f0]">Lesson:</span> {item.lesson}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between text-xs font-mono">
              {item.type === 'riddle' ? (
                <button
                  onClick={() => {
                    setTestModalItem(item);
                    setTestAnswerInput('');
                    setTestResult(null);
                  }}
                  className="text-[#e8c96a] hover:underline flex items-center gap-1"
                >
                  <Play className="w-3 h-3 text-[#C9A84C]" />
                  <span>Test Resonance Matcher</span>
                </button>
              ) : (
                <span className="text-[#8a6e2a]">Single Transmission</span>
              )}

              <button
                onClick={() => {
                  setItems((prev) => prev.filter((i) => i.id !== item.id));
                  showToast(`Removed "${item.title}"`, 'info');
                }}
                className="text-[#8a6e2a] hover:text-[#C0392B]"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Add Transmission Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Compose Transmission">
        <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Invariant..."
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              >
                <option value="wisdom">Wisdom</option>
                <option value="riddle">Riddle</option>
                <option value="philosophy">Philosophy</option>
                <option value="motivation">Motivation</option>
                <option value="lesson">Lesson</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Content Text</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the transmission text..."
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              required
            />
          </div>

          {type === 'riddle' && (
            <div className="space-y-3 p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)]">
              <div>
                <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Official Expected Answer</label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="e.g. The floor"
                  className="w-full px-3 py-1.5 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-[#f5f3f0]"
                />
              </div>
              <div>
                <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Philosophical Lesson</label>
                <input
                  type="text"
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  placeholder="e.g. Build the floor before the skyscraper"
                  className="w-full px-3 py-1.5 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-[#f5f3f0]"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="sched"
              checked={is947Scheduled}
              onChange={(e) => setIs947Scheduled(e.target.checked)}
              className="accent-[#C9A84C]"
            />
            <label htmlFor="sched" className="text-[#f5f3f0] cursor-pointer">
              Schedule for automated 9:47 PM Nightly Dispatch
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(201,168,76,0.2)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Commit to Bank
            </Button>
          </div>
        </form>
      </Modal>

      {/* Semantic Resonance Riddle Tester Modal */}
      {testModalItem && (
        <Modal
          isOpen={Boolean(testModalItem)}
          onClose={() => setTestModalItem(null)}
          title={`Semantic Resonance: ${testModalItem.title}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-[#c4c0bb]">{testModalItem.content}</p>
            <div className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[11px]">
              <span className="text-[#8a6e2a] block">Target Official Answer:</span>
              <span className="text-[#C9A84C] font-bold">{testModalItem.answer}</span>
            </div>

            <form onSubmit={handleRunRiddleTest} className="space-y-3">
              <div>
                <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">
                  Test User Input Phrasing:
                </label>
                <input
                  type="text"
                  value={testAnswerInput}
                  onChange={(e) => setTestAnswerInput(e.target.value)}
                  placeholder="e.g. A solid floor"
                  className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
                  required
                />
              </div>

              <Button variant="primary" size="sm" type="submit">
                Execute Resonance Scoring
              </Button>
            </form>

            {testResult && (
              <div className="p-4 rounded bg-[#050404] border border-[#C9A84C] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a6e2a]">Semantic Resonance Score:</span>
                  <span className="text-base font-bold text-[#e8c96a]">
                    {(testResult.similarity * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8a6e2a]">Verdict:</span>
                  <span className="font-bold text-[#f5f3f0]">{testResult.judgment}</span>
                </div>
                <p className="text-[11px] text-[#c4c0bb] pt-1 border-t border-[rgba(201,168,76,0.2)]">
                  {testResult.feedback}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
