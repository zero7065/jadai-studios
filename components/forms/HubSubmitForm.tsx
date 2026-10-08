import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { PlusCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

export const HubSubmitForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'service' as 'service' | 'product' | 'collab' | 'job',
    title: '',
    description: '',
    stackStr: '',
    price_type: 'fixed' as 'fixed' | 'hourly' | 'equity' | 'free',
    price: 0,
    contact_method: '',
    author_name: '',
    author_location: 'Jos, Nigeria',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.contact_method) return;

    setSubmitting(true);
    const stack = formData.stackStr.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/hub/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          stack,
        }),
      });

      const data = await res.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      setSubmitted(true);
      showToast('Listing submitted for verification.', 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <GlassCard className="p-8 text-center space-y-4 max-w-xl mx-auto border-[#C9A84C]">
        <CheckCircle2 className="w-10 h-10 text-[#C9A84C] mx-auto" />
        <h3 className="text-xl font-display font-semibold text-[#f5f3f0]">Listing Queued</h3>
        <p className="text-xs font-mono text-[#c4c0bb] leading-relaxed">
          Submitted. Jadai reviews every listing personally before releasing it to the active directory.
        </p>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            Submit Another Listing
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 sm:p-8 space-y-6 max-w-2xl mx-auto border-[rgba(201,168,76,0.3)]">
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] block">
          JadaiHub Collaborative Intake
        </span>
        <h2 className="text-2xl font-display font-bold text-[#f5f3f0]">
          Submit a Mission, Listing, or Skill
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
              Listing Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-xs focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="service">Technical Service / Audit</option>
              <option value="collab">Co-Builder / Collaboration</option>
              <option value="product">Digital Product / Asset</option>
              <option value="job">Paid Engineering Contract</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
              Price Structure
            </label>
            <select
              value={formData.price_type}
              onChange={(e) => setFormData({ ...formData, price_type: e.target.value as any })}
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-xs focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="fixed">Fixed Price (NGN)</option>
              <option value="hourly">Hourly Rate</option>
              <option value="equity">Equity / Co-ownership</option>
              <option value="free">Open Collaboration / Free</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
            Listing Headline *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Distributed Consensus Architect for Settlement Network"
            required
            className="w-full px-3.5 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
            Description & Scope *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Explain the technical scope, timeline, and expectations..."
            required
            className="w-full p-3.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-xs focus:outline-none focus:border-[#C9A84C] resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
              Stack / Technologies (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.stackStr}
              onChange={(e) => setFormData({ ...formData, stackStr: e.target.value })}
              placeholder="Next.js, Rust, Supabase, WASM"
              className="w-full px-3.5 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-mono text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
              Amount (₦ NGN) if applicable
            </label>
            <input
              type="number"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value, 10) || 0 })}
              placeholder="150000"
              className="w-full px-3.5 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-mono text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
              Your Name / Entity *
            </label>
            <input
              type="text"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              placeholder="Jehu Nanpan"
              required
              className="w-full px-3.5 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-mono text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
              Contact Method (Email or Handle) *
            </label>
            <input
              type="text"
              value={formData.contact_method}
              onChange={(e) => setFormData({ ...formData, contact_method: e.target.value })}
              placeholder="dev@domain.com or @handle"
              required
              className="w-full px-3.5 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-mono text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" size="md" disabled={submitting}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit for Jadai Verification'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
};

export default HubSubmitForm;
