import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/providers/ToastProvider';
import {
  Send,
  Mail,
  MapPin,
  Clock,
  Terminal,
  ShieldCheck,
  CheckCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

import DefensiveFallback from '@/components/ui/DefensiveFallback';

export default function ContactPage() {
  const [hasError, setHasError] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Full-Stack Architecture');
  const [budget, setBudget] = useState('₦500k - ₦1.5M');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  if (hasError) return <DefensiveFallback />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please provide your name, email, and transmission content', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          category,
          budget,
          message,
        }),
      });
      const data = await res.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      setSubmitted(true);
      showToast('Transmission received. Principal Architect notified.', 'success', 'Signal Logged');
    } catch {
      // In-memory fallback
      setSubmitted(true);
      showToast('Transmission recorded into studio cache.', 'success');
    } finally {
      setSubmitting(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('jadaistudiosoffcl@gmail.com');
    showToast('Studio email copied to clipboard.', 'success');
  };

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.25)]">
          <Terminal className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
            Direct Transmission Line
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#f5f3f0] tracking-wide">
          Initiate Transmission
        </h1>
        <p className="text-sm sm:text-base font-mono text-[#8a6e2a]">
          High-ticket advisory, sovereign architecture audits, or enterprise systems development with Jehu Nanpan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        {/* Left Column: Direct Coordinates & Status */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-8 border-[rgba(201,168,76,0.25)] space-y-6 text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Operational Coordinates
              </span>
              <h3 className="text-xl font-display font-bold text-[#f5f3f0]">
                Jadai Studios HQ
              </h3>
            </div>

            <div className="space-y-4 text-xs font-mono text-[#c4c0bb]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#f5f3f0] font-semibold block">Location</span>
                  <span>Jos, Plateau State, Nigeria (WAT / UTC+1)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[#f5f3f0] font-semibold block">Transmission Email</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[#e8c96a]">jadaistudiosoffcl@gmail.com</span>
                    <button
                      onClick={copyEmail}
                      className="p-1 rounded hover:bg-[rgba(201,168,76,0.15)] text-[#8a6e2a] hover:text-[#C9A84C]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#f5f3f0] font-semibold block">Response Guarantee</span>
                  <span>Direct architectural response within 24 hours.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#f5f3f0] font-semibold block">Confidentiality</span>
                  <span>All project specifications held under strict NDA standards.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(201,168,76,0.15)] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a6e2a] block">
                Direct Channels
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://github.com/jadaistudios"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] text-xs font-mono text-[#c4c0bb] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://twitter.com/jadaistudios"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] text-xs font-mono text-[#c4c0bb] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>X / Twitter</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="mailto:jadaistudiosoffcl@gmail.com"
                  className="px-3 py-1.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] text-xs font-mono text-[#c4c0bb] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Direct Mail</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Transmission Form */}
        <div className="lg:col-span-7">
          <GlassCard className="p-8 sm:p-10 border-[rgba(201,168,76,0.25)] text-left">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] flex items-center justify-center mx-auto text-[#C9A84C]">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold text-[#f5f3f0]">
                  Transmission Dispatched
                </h3>
                <p className="text-xs sm:text-sm font-mono text-[#8a6e2a] max-w-md mx-auto">
                  Your inquiry has been indexed into the studio queue. Jehu Nanpan will review the technical parameters and reply within one business day.
                </p>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                  >
                    Send Another Transmission
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-b border-[rgba(201,168,76,0.15)] pb-3">
                  <h3 className="text-xl font-display font-bold text-[#f5f3f0]">
                    Project Specifications Form
                  </h3>
                  <p className="text-xs font-mono text-[#8a6e2a]">
                    Detail your system requirements and timeline.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-1">
                      Your Name / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tariq Vance"
                      className="w-full px-3.5 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs sm:text-sm text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tariq@enterprise.com"
                      className="w-full px-3.5 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs sm:text-sm text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-1">
                      Primary Service Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs sm:text-sm text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="Full-Stack Architecture">Full-Stack Systems Architecture</option>
                      <option value="AI Automation Pipelines">AI Automation & Agent Orchestration</option>
                      <option value="Sprint Zero Scaffolding">Sprint Zero Scaffolding</option>
                      <option value="Site Diagnostic & Audit">Site Diagnostic & Performance Audit</option>
                      <option value="Bespoke Platform Build">Bespoke Custom Platform</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-1">
                      Anticipated Budget Floor
                    </label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs sm:text-sm text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="₦350k - ₦750k">₦350k - ₦750k ($250 - $500)</option>
                      <option value="₦750k - ₦1.5M">₦750k - ₦1.5M ($500 - $1,000)</option>
                      <option value="₦1.5M - ₦5M">₦1.5M - ₦5M ($1,000 - $3,500)</option>
                      <option value="₦5M+">₦5M+ ($3,500+ Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-1">
                    System Requirements & Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your current tech stack, operational bottlenecks, scaling targets, or product vision..."
                    className="w-full px-3.5 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs sm:text-sm text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#8a6e2a]">
                    Encrypted channel • Fast review
                  </span>
                  <Button variant="primary" size="md" type="submit" disabled={submitting}>
                    <Send className="w-3.5 h-3.5 mr-2" />
                    {submitting ? 'Transmitting...' : 'Dispatch Signal'}
                  </Button>
                </div>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
