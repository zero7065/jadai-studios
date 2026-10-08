import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { getAllBookOfLies, BookOfLiesEpisode, MASTER_40_EPISODES } from '@/lib/data/book-of-lies';
import { useToast } from '@/components/providers/ToastProvider';
import { BookOpen, Plus, Flame, Clock, Eye, Heart, Edit2, Trash2 } from 'lucide-react';

type SinType = 'Pride' | 'Envy' | 'Wrath' | 'Sloth' | 'Greed' | 'Gluttony' | 'Lust' | 'Discernment';
type ActType = 1 | 2 | 3;

export default function AdminBookOfLiesPage() {
  const [episodes, setEpisodes] = useState<BookOfLiesEpisode[]>(getAllBookOfLies());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<BookOfLiesEpisode | null>(null);
  const { showToast } = useToast();

  // Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [act, setAct] = useState<ActType>(1);
  const [sin, setSin] = useState<SinType>('Pride');
  const [teaser, setTeaser] = useState('');
  const [fullText, setFullText] = useState('');
  const [isScheduled, setIsScheduled] = useState(true);

  const openAddModal = () => {
    setEditingEpisode(null);
    setTitle('');
    setTagline('');
    setAct(1);
    setSin('Pride');
    setTeaser('');
    setFullText('');
    setModalOpen(true);
  };

  const openEditModal = (ep: BookOfLiesEpisode) => {
    setEditingEpisode(ep);
    setTitle(ep.title);
    setTagline(ep.tagline);
    setAct(ep.act);
    setSin(ep.sin_category);
    setTeaser(ep.teaser);
    setFullText(ep.full_text);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fullText) {
      showToast('Title and full text are required', 'error');
      return;
    }

    if (editingEpisode) {
      const updated = episodes.map((ep) =>
        ep.id === editingEpisode.id
          ? {
              ...ep,
              title,
              tagline,
              act,
              sin_category: sin,
              teaser: teaser || fullText.substring(0, 160) + '...',
              full_text: fullText,
            }
          : ep
      );
      setEpisodes(updated);
      try {
        const custom = updated.filter((e) => e.id.startsWith('bol-custom-') || e.id.startsWith('bol-') && !MASTER_40_EPISODES.find(m => m.id === e.id));
        localStorage.setItem('jadai_custom_episodes', JSON.stringify(custom));
      } catch {}
      showToast(`Episode "${title}" updated.`, 'success');
    } else {
      const newEp: BookOfLiesEpisode = {
        id: `bol-${Date.now()}`,
        slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        episode_number: episodes.length + 1,
        title,
        tagline,
        sin_category: sin,
        act,
        teaser: teaser || fullText.substring(0, 160) + '...',
        full_text: fullText,
        published: true,
        publish_at: new Date().toISOString(),
        views_count: 0,
        likes_count: 0,
        scheduled_for: '9:47 PM',
      };
      const updated = [newEp, ...episodes];
      setEpisodes(updated);
      try {
        const stored = localStorage.getItem('jadai_custom_episodes');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newEp);
        localStorage.setItem('jadai_custom_episodes', JSON.stringify(list));
      } catch {}
      showToast(`Episode "${title}" registered for 9:47 PM broadcast and published live.`, 'success');
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C0392B]">Philosophical Canon</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">The Book of Lies Manager</h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Manage serialized manuscript entries, Sin taxonomy, and nightly 9:47 PM automated release queues.
          </p>
        </div>
        <Button variant="danger" size="sm" onClick={openAddModal}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>New Episode</span>
        </Button>
      </div>

      {/* Episodes Table */}
      <GlassCard className="p-4 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[rgba(201,168,76,0.2)] text-[#8a6e2a] uppercase text-[10px]">
              <th className="py-2.5 px-3">Ep #</th>
              <th className="py-2.5 px-3">Title & Sin</th>
              <th className="py-2.5 px-3">Act</th>
              <th className="py-2.5 px-3">Metrics (Views / Likes)</th>
              <th className="py-2.5 px-3">Cadence</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(201,168,76,0.1)]">
            {episodes.map((ep) => (
              <tr key={ep.id} className="hover:bg-[rgba(201,168,76,0.04)] transition-colors">
                <td className="py-3 px-3 text-[#C0392B] font-bold">#{ep?.episode_number ?? '—'}</td>
                <td className="py-3 px-3">
                  <span className="font-bold text-[#f5f3f0] block">{ep.title}</span>
                  <span className="text-[11px] text-[#8a6e2a]">Sin: {ep.sin_category}</span>
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={`Act ${ep.act}`} variant={ep.act === 1 ? 'gold' : 'crimson'} />
                </td>
                <td className="py-3 px-3 text-[#c4c0bb]">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-[#8a6e2a]" /> {ep.views_count}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[#C0392B]" /> {ep.likes_count}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-[#8a6e2a]">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-[#C9A84C]" /> 9:47 PM
                  </span>
                </td>
                <td className="py-3 px-3 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(ep)}
                    className="p-1 rounded text-[#8a6e2a] hover:text-[#C9A84C]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const filtered = episodes.filter((e) => e.id !== ep.id);
                      setEpisodes(filtered);
                      try {
                        const stored = localStorage.getItem('jadai_custom_episodes');
                        if (stored) {
                          const list = JSON.parse(stored).filter((e: any) => e.id !== ep.id);
                          localStorage.setItem('jadai_custom_episodes', JSON.stringify(list));
                        }
                      } catch {}
                      showToast(`Episode "${ep.title}" removed`, 'info');
                    }}
                    className="p-1 rounded text-[#8a6e2a] hover:text-[#C0392B]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Add / Edit Episode Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEpisode ? `Edit: ${editingEpisode.title}` : 'Draft Book of Lies Transmission'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Pride of the Unbroken..."
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Sin Category</label>
              <select
                value={sin}
                onChange={(e) => setSin(e.target.value as SinType)}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              >
                {['Pride', 'Envy', 'Wrath', 'Sloth', 'Greed', 'Gluttony', 'Lust'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Tagline / Epigraph</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="A single sentence moral puzzle"
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              />
            </div>
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Act (1: Free, 2-3: Paywall)</label>
              <select
                value={act}
                onChange={(e) => setAct(parseInt(e.target.value, 10) as ActType)}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              >
                <option value={1}>Act 1 (Public Floor)</option>
                <option value={2}>Act 2 (Foundation / Voice Tier)</option>
                <option value={3}>Act 3 (Prime Sovereign Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Complete Manuscript Text</label>
            <textarea
              rows={6}
              value={fullText}
              onChange={(e) => setFullText(e.target.value)}
              placeholder="Write the full philosophical fiction episode..."
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-serif leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="bol-947"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="accent-[#C0392B]"
            />
            <label htmlFor="bol-947" className="text-[#f5f3f0] cursor-pointer">
              Deploy to Nightly 9:47 PM Delivery Engine
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(201,168,76,0.2)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Commit Episode
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
