import React, { useState, useEffect, useCallback } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { SEED_PORTFOLIO, PortfolioProject } from '@/lib/data/portfolio';
import { StudioAudio } from '@/lib/watermark';
import { useToast } from '@/components/providers/ToastProvider';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Link2,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface LinkPreview {
  url: string;
  title: string;
  description: string;
  site_name: string;
  image: string;
  favicon: string;
  source: 'fetched' | 'url-derived';
  note?: string;
}

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>(SEED_PORTFOLIO);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const { showToast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PortfolioProject['category']>('Developer Tools');
  const [status, setStatus] = useState<PortfolioProject['status']>('Live');
  const [stack, setStack] = useState('Next.js, TypeScript, Tailwind');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [featured, setFeatured] = useState(false);

  // Link preview state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/portfolio');
      const json = await resp.json();
      if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
        setProjects(json.data);
      }
    } catch {
      // Offline — keep seed fallback.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAddModal = () => {
    setEditingProject(null);
    setTitle('');
    setTagline('');
    setDescription('');
    setCategory('Developer Tools');
    setStatus('Live');
    setStack('Next.js, TypeScript, Tailwind');
    setLiveUrl('');
    setGithubUrl('');
    setFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (p: PortfolioProject) => {
    setEditingProject(p);
    setTitle(p.title);
    setTagline(p.tagline);
    setDescription(p.long_description || p.description);
    setCategory(p.category);
    setStatus(p.status);
    setStack(p.stack.join(', '));
    setLiveUrl(p.live_url || '');
    setGithubUrl(p.github_url || '');
    setFeatured(p.featured);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tagline) {
      showToast('Please specify title and tagline', 'error');
      return;
    }
    setSaving(true);
    try {
      const updatedStack = stack.split(',').map((s) => s.trim()).filter(Boolean);
      const slug =
        editingProject?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const payload: PortfolioProject = {
        id: editingProject?.id || `port-${Date.now()}`,
        slug,
        title,
        tagline,
        description,
        long_description: description,
        category,
        status,
        stack: updatedStack,
        live_url: liveUrl || undefined,
        github_url: githubUrl || undefined,
        featured,
        display_order: editingProject?.display_order || projects.length + 1,
        views_count: editingProject?.views_count || 0,
        image_placeholder: editingProject?.image_placeholder || slug,
        preview_url: editingProject?.preview_url,
      };
      const resp = await fetch('/api/admin/portfolio/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: payload }),
      });
      const json = await resp.json();
      if (!json?.success) throw new Error(json?.error || 'Save failed');
      showToast(`Project "${title}" saved to the registry.`, 'success');
      setModalOpen(false);
      await load();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string, name: string) => {
    if (!window.confirm(`Remove project "${name}" from public portfolio?`)) return;
    setDeletingSlug(slug);
    try {
      const resp = await fetch('/api/admin/portfolio/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const json = await resp.json();
      if (!json?.success) throw new Error(json?.error || 'Delete failed');
      showToast(`Project "${name}" removed.`, 'info');
      await load();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    } finally {
      setDeletingSlug(null);
    }
  };

  const fetchLinkPreview = async () => {
    const url = linkUrl.trim();
    if (!url) return;
    setLinkLoading(true);
    setLinkPreview(null);
    try {
      const resp = await fetch('/api/admin/link-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json = await resp.json();
      if (!json?.success) throw new Error(json?.error || 'Preview failed');
      setLinkPreview(json.preview);
      if (json.preview?.note) showToast(json.preview.note, 'info');
    } catch (err: any) {
      showToast(err.message || 'Preview failed', 'error');
    } finally {
      setLinkLoading(false);
    }
  };

  const applyLinkPreview = () => {
    if (!linkPreview) return;
    setTitle(linkPreview.title || linkPreview.site_name);
    setTagline(linkPreview.description ? linkPreview.description.slice(0, 140) : '');
    setDescription(linkPreview.description || '');
    setLiveUrl(linkPreview.url);
    setLinkModalOpen(false);
    setModalOpen(true);
    showToast('Link metadata applied — review and save.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Architecture Catalog</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">Portfolio & Frame Registry</h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Manage browser frame embeddings, live iframe preview sandboxes, and repository credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { StudioAudio.playClick(); load(); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              StudioAudio.playClick();
              setLinkUrl('');
              setLinkPreview(null);
              setLinkModalOpen(true);
            }}
          >
            <Link2 className="w-3.5 h-3.5 mr-1" />
            <span>Add via Link</span>
          </Button>
          <Button variant="primary" size="sm" onClick={openAddModal}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Project Frame</span>
          </Button>
        </div>
      </div>

      {/* Projects Table */}
      <GlassCard className="p-4 overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-zinc-500 font-mono text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading registry…
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[rgba(201,168,76,0.2)] text-[#8a6e2a] uppercase text-[10px]">
                <th className="py-2.5 px-3">Order</th>
                <th className="py-2.5 px-3">Title & Category</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Live URL / Preview</th>
                <th className="py-2.5 px-3">Featured</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(201,168,76,0.1)]">
              {projects.map((p, idx) => (
                <tr key={p.id} className="hover:bg-[rgba(201,168,76,0.04)] transition-colors">
                  <td className="py-3 px-3 text-[#8a6e2a]">#{idx + 1}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#f5f3f0] block">{p.title}</span>
                    <span className="text-[11px] text-[#8a6e2a]">{p.category}</span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3 px-3 text-[#c4c0bb]">
                    {p.live_url ? (
                      <a
                        href={p.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#C9A84C] hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span className="truncate max-w-[140px]">{p.live_url}</span>
                      </a>
                    ) : (
                      <span className="text-[#8a6e2a]">Internal Prototype</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {p.featured ? (
                      <span className="text-[#e8c96a] font-bold">Featured ✦</span>
                    ) : (
                      <span className="text-[#8a6e2a]">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1 rounded text-[#8a6e2a] hover:text-[#C9A84C]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.slug, p.title)}
                      disabled={deletingSlug === p.slug}
                      className="p-1 rounded text-[#8a6e2a] hover:text-[#C0392B] disabled:opacity-40"
                      title="Delete"
                    >
                      {deletingSlug === p.slug ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>

      {/* Add via Link Modal */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Add Project via Link"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 font-mono text-xs">
          <p className="text-[#c4c0bb]">
            Paste a live URL — we'll fetch its Open Graph title, description, and image so you don't have to type them.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLinkPreview()}
              placeholder="https://example.com"
              className="flex-1 px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
            />
            <Button variant="outline" size="sm" onClick={fetchLinkPreview} disabled={linkLoading || !linkUrl.trim()}>
              {linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              <span className="ml-1">Fetch</span>
            </Button>
          </div>

          {linkPreview && (
            <div className="p-3 rounded-lg border border-[rgba(201,168,76,0.25)] bg-[#050404] space-y-2">
              <div className="flex items-center gap-2">
                {linkPreview.favicon && (
                  <img src={linkPreview.favicon} alt="" className="w-5 h-5 rounded" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                )}
                <span className="text-[#C9A84C] font-bold">{linkPreview.title}</span>
                <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded ${
                  linkPreview.source === 'fetched' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {linkPreview.source}
                </span>
              </div>
              {linkPreview.description && (
                <p className="text-[#c4c0bb] line-clamp-3">{linkPreview.description}</p>
              )}
              {linkPreview.image && (
                <img src={linkPreview.image} alt="" className="w-full h-32 object-cover rounded" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
              )}
              <Button variant="primary" size="sm" onClick={applyLinkPreview} className="w-full">
                Use This Metadata
              </Button>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-[rgba(201,168,76,0.2)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setLinkModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? `Edit Frame: ${editingProject.title}` : 'Add Architecture Frame'}
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
                placeholder="e.g. ExamPadi"
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              >
                <option value="Education AI">Education AI</option>
                <option value="Edge Infrastructure">Edge Infrastructure</option>
                <option value="Media Systems">Media Systems</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Architecture">Architecture</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="One-line sovereign value proposition"
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Full Architectural Narrative</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Live URL (Embedded in frame)</label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://exampadi.com"
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              />
            </div>
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              >
                <option value="Live">Live</option>
                <option value="In Build">In Build</option>
                <option value="Prototype">Prototype</option>
                <option value="Concept">Concept</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#C9A84C]"
              />
              <span className="text-[#f5f3f0]">Feature on Homepage</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[rgba(201,168,76,0.2)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              {saving ? 'Saving…' : 'Save Project Frame'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
