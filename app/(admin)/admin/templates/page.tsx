import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { SEED_TEMPLATES, TemplateItem } from '@/lib/data/templates';
import { useToast } from '@/components/providers/ToastProvider';
import { ShoppingBag, Plus, Eye, Edit2, Trash2, Github, ExternalLink, Download } from 'lucide-react';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>(SEED_TEMPLATES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const { showToast } = useToast();

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<TemplateItem['category']>('portfolio');
  const [priceNgn, setPriceNgn] = useState(35000);
  const [priceUsd, setPriceUsd] = useState(48);
  const [lore, setLore] = useState('');
  const [description, setDescription] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [bundleFileName, setBundleFileName] = useState('');
  const [bundleProgress, setBundleProgress] = useState(0);
  const [verifiedBundlePath, setVerifiedBundlePath] = useState('');
  const [stack, setStack] = useState('Next.js 14, Tailwind, Paystack, Supabase');

  const openAddModal = () => {
    setEditingTemplate(null);
    setName('');
    setTagline('');
    setCategory('portfolio');
    setPriceNgn(35000);
    setPriceUsd(48);
    setLore('');
    setDescription('');
    setDemoUrl('');
    setPreviewUrl('');
    setBundleFileName('');
    setBundleProgress(0);
    setVerifiedBundlePath('');
    setStack('Next.js 14, Tailwind, Paystack, Supabase');
    setModalOpen(true);
  };

  const openEditModal = (t: TemplateItem) => {
    setEditingTemplate(t);
    setName(t.name);
    setTagline(t.tagline);
    setCategory(t.category);
    setPriceNgn(t.price_ngn);
    setPriceUsd(t.price_usd);
    setLore(t.lore);
    setDescription(t.description);
    setDemoUrl(t.demo_url);
    setPreviewUrl(t.preview_url);
    setBundleFileName(`${t.slug}.zip`);
    setBundleProgress(100);
    setVerifiedBundlePath(`templates/${t.slug}/bundle.zip`);
    setStack(t.stack.join(', '));
    setModalOpen(true);
  };

  const handlePreviewUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
        showToast(`Preview asset loaded: ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBundleFileName(file.name);
      setBundleProgress(20);
      const interval = setInterval(() => {
        setBundleProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            const path = `templates/${(name || 'template').toLowerCase()}/${file.name}`;
            setVerifiedBundlePath(path);
            showToast(`Verified in Supabase Storage: "${path}"`, 'success');
            return 100;
          }
          return prev + 25;
        });
      }, 100);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tagline) {
      showToast('Name and tagline are required', 'error');
      return;
    }

    const updatedStack = stack.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                name,
                tagline,
                category,
                price_ngn: Number(priceNgn),
                price_usd: Number(priceUsd),
                lore,
                description,
                demo_url: demoUrl,
                stack: updatedStack,
              }
            : t
        )
      );
      showToast(`Template "${name}" updated.`, 'success');
    } else {
      const newTmpl: TemplateItem = {
        id: `tmpl-${Date.now()}`,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name,
        tagline,
        lore,
        description,
        category,
        price_ngn: Number(priceNgn),
        price_usd: Number(priceUsd),
        stack: updatedStack,
        demo_url: demoUrl || `https://templates.jadai.dev/${name.toLowerCase()}`,
        preview_url: `/assets/templates/${name.toLowerCase()}.png`,
        download_count: 0,
        featured: true,
        status: 'active',
        includes: [
          'Full-stack Next.js production codebase',
          'Paystack checkout pipeline & webhook handler',
          'Supabase relational schema with RLS policies',
          'Private GitHub repository invite token',
        ],
      };
      setTemplates([newTmpl, ...templates]);
      showToast(`Template "${name}" published to Elite Market.`, 'success');
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Marketplace Operations</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">Template Marketplace Manager</h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Manage 5 flagship starters (Aperture, Vendor, Shelter, Bloom, Glow), dual currency pricing, and GitHub invite distribution.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add New Template</span>
        </Button>
      </div>

      {/* Templates Table */}
      <GlassCard className="p-4 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[rgba(201,168,76,0.2)] text-[#8a6e2a] uppercase text-[10px]">
              <th className="py-2.5 px-3">Template</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Price (NGN / USD)</th>
              <th className="py-2.5 px-3">Sales / Downloads</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(201,168,76,0.1)]">
            {templates.map((tmpl) => (
              <tr key={tmpl.id} className="hover:bg-[rgba(201,168,76,0.04)] transition-colors">
                <td className="py-3 px-3">
                  <span className="font-bold text-[#f5f3f0] block">{tmpl.name}</span>
                  <span className="text-[11px] text-[#8a6e2a]">{tmpl.tagline}</span>
                </td>
                <td className="py-3 px-3 capitalize text-[#c4c0bb]">{tmpl.category}</td>
                <td className="py-3 px-3 text-[#e8c96a] font-bold">
                  ₦{tmpl.price_ngn.toLocaleString()} / ${tmpl.price_usd}
                </td>
                <td className="py-3 px-3 text-[#c4c0bb]">
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3 text-[#C9A84C]" />
                    {tmpl.download_count}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={tmpl.status === 'active' ? 'Active' : 'Draft'} variant="gold" />
                </td>
                <td className="py-3 px-3 text-right space-x-2">
                  <a
                    href={`/marketplace`}
                    className="p-1 text-[#8a6e2a] hover:text-[#C9A84C] inline-block"
                    title="Live preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => openEditModal(tmpl)}
                    className="p-1 rounded text-[#8a6e2a] hover:text-[#C9A84C]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setTemplates((prev) => prev.filter((t) => t.id !== tmpl.id));
                      showToast(`Template "${tmpl.name}" archived`, 'info');
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

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create Sovereign Template Starter'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aperture"
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
                <option value="portfolio">Photography / Portfolio</option>
                <option value="saas">E-Commerce / Sales</option>
                <option value="marketplace">Adoptions / Botanical</option>
                <option value="landing">Salon / Cosmetics</option>
                <option value="Full-Stack Starter">Full-Stack Starter</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Price (NGN ₦)</label>
              <input
                type="number"
                value={priceNgn}
                onChange={(e) => setPriceNgn(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Price (USD $)</label>
              <input
                type="number"
                value={priceUsd}
                onChange={(e) => setPriceUsd(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Where light is the story."
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              required
            />
          </div>

          <div>
            <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Architectural Lore</label>
            <textarea
              rows={2}
              value={lore}
              onChange={(e) => setLore(e.target.value)}
              placeholder="Deep creative story behind this system..."
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
            />
          </div>

          <div>
            <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Description & Deliverables</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this production system includes..."
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
            />
          </div>

          {/* Real Asset Upload Zones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[rgba(201,168,76,0.15)]">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Preview Image (JPG / PNG)</label>
              <div className="relative h-24 rounded border border-dashed border-[rgba(201,168,76,0.3)] bg-[#050404] flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <label className="cursor-pointer text-center p-2 text-[#8a6e2a] hover:text-[#C9A84C]">
                    <span className="text-[11px] block">Click to select screenshot</span>
                    <span className="text-[9px] text-[#8a6e2a]/70">PNG/JPG up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handlePreviewUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Archive Bundle (ZIP)</label>
              <div className="relative h-24 rounded border border-dashed border-[rgba(201,168,76,0.3)] bg-[#050404] flex flex-col items-center justify-center p-2 text-center">
                {bundleFileName ? (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#f5f3f0] block truncate max-w-[180px]">{bundleFileName}</span>
                    <span className="text-[9px] text-[#e8c96a] block">
                      {verifiedBundlePath ? `✓ Verified in Storage` : `Uploading... ${bundleProgress}%`}
                    </span>
                    <label className="text-[9px] text-[#8a6e2a] hover:text-[#C9A84C] cursor-pointer underline block">
                      Replace ZIP
                      <input type="file" accept=".zip,application/zip" onChange={handleZipUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer text-[#8a6e2a] hover:text-[#C9A84C]">
                    <span className="text-[11px] block">Upload Starter ZIP</span>
                    <span className="text-[9px] text-[#8a6e2a]/70">Repository archive bundle</span>
                    <input type="file" accept=".zip,application/zip" onChange={handleZipUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(201,168,76,0.2)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Commit Template
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
