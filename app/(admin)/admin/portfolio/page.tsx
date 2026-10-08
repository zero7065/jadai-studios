import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { SEED_PORTFOLIO, PortfolioProject } from '@/lib/data/portfolio';
import { useToast } from '@/components/providers/ToastProvider';
import { Layers, Plus, Edit2, Trash2, Globe, ExternalLink, Github, CheckCircle } from 'lucide-react';

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>(SEED_PORTFOLIO);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
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
  const [enableLivePreview, setEnableLivePreview] = useState(true);

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
    setEnableLivePreview(true);
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
    setEnableLivePreview(true);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tagline) {
      showToast('Please specify title and tagline', 'error');
      return;
    }

    const updatedStack = stack.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                title,
                tagline,
                description,
                long_description: description,
                category,
                status,
                stack: updatedStack,
                live_url: liveUrl,
                github_url: githubUrl,
                featured,
              }
            : p
        )
      );
      showToast(`Project "${title}" updated in master catalog.`, 'success');
    } else {
      const newProj: PortfolioProject = {
        id: `port-${Date.now()}`,
        slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title,
        tagline,
        description,
        long_description: description,
        category,
        status,
        stack: updatedStack,
        live_url: liveUrl,
        github_url: githubUrl,
        featured,
        display_order: projects.length + 1,
        views_count: 0,
        image_placeholder: 'preview',
      };
      setProjects((prev) => [...prev, newProj]);
      showToast(`New frame "${title}" committed to production registry.`, 'success');
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove project "${name}" from public portfolio?`)) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast(`Project "${name}" removed.`, 'info');
    }
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
        <Button variant="primary" size="sm" onClick={openAddModal}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add Project Frame</span>
        </Button>
      </div>

      {/* Projects Table */}
      <GlassCard className="p-4 overflow-x-auto">
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
                    onClick={() => handleDelete(p.id, p.title)}
                    className="p-1 rounded text-[#8a6e2a] hover:text-[#C0392B]"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

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

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableLivePreview}
                onChange={(e) => setEnableLivePreview(e.target.checked)}
                className="w-4 h-4 accent-[#C9A84C]"
              />
              <span className="text-[#f5f3f0]">Enable Live Iframe Preview</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[rgba(201,168,76,0.2)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Project Frame
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
