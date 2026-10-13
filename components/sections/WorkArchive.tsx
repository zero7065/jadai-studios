'use client';

import React, { useState, useEffect } from 'react';
import PortfolioCard from '@/components/content/PortfolioCard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { SEED_PORTFOLIO, PortfolioProject } from '@/lib/data/portfolio';
import { Globe, ExternalLink, X, Loader2 } from 'lucide-react';

/**
 * Public work archive — loads the live registry (falls back to seeds offline)
 * and opens an in-page preview modal instead of jumping straight to an
 * external tab.
 */
export const WorkArchive: React.FC = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>(SEED_PORTFOLIO);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/portfolio')
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setProjects(json.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openPreview = (p: PortfolioProject) => {
    setActive(p);
    // Fire-and-forget view ping (best-effort analytics).
    fetch(`/api/portfolio/${encodeURIComponent(p.slug)}/view`, { method: 'POST' }).catch(() => {});
  };

  const previewSrc = active?.preview_url || active?.live_url;

  return (
    <div className="space-y-6 pt-12 border-t border-[rgba(201,168,76,0.15)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-[#f5f3f0]">
          Complete Repository & Frame Archive
        </h2>
        <span className="text-xs font-mono text-[#8a6e2a]">
          {loading ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading…
            </span>
          ) : (
            `${projects.length} Works Registered`
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p, idx) => (
          <PortfolioCard key={p.id} project={p} index={idx} onClick={() => openPreview(p)} />
        ))}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title || ''}
        maxWidth="max-w-4xl"
      >
        {active && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={active.status} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a6e2a]">
                {active.category}
              </span>
              {active.stack.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)] text-[#C9A84C]"
                >
                  {s}
                </span>
              ))}
            </div>

            <p className="text-xs text-[#c4c0bb] leading-relaxed">
              {active.long_description || active.description}
            </p>

            {previewSrc ? (
              <div className="relative rounded-lg overflow-hidden border border-[rgba(201,168,76,0.25)] bg-[#050404]">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0908] border-b border-[rgba(201,168,76,0.15)]">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C0392B]/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="flex-1 text-center text-[10px] font-mono text-zinc-500 truncate">
                    {previewSrc}
                  </span>
                  <a
                    href={previewSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C9A84C] hover:text-[#e8c96a]"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <iframe
                  src={previewSrc}
                  title={`${active.title} live preview`}
                  className="w-full h-[420px] bg-[#050404]"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-[rgba(201,168,76,0.25)] rounded-lg">
                <Globe className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs font-mono text-zinc-500">
                  No live preview available for this project yet.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(201,168,76,0.15)]">
              <Button variant="outline" size="sm" onClick={() => setActive(null)}>
                <X className="w-3.5 h-3.5 mr-1" />
                <span>Close</span>
              </Button>
              {active.live_url && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.open(active.live_url, '_blank', 'noopener')}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  <span>Visit Live Site</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorkArchive;
