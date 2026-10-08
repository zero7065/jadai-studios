import React, { useState } from 'react';
import Button from '../ui/Button';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('Consultation');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, reason, message }),
      });
      const data = await res.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      setSubmitted(true);
      showToast('Transmission received at Jos headquarters.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Transmission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 rounded bg-[rgba(201,168,76,0.1)] border border-[#C9A84C] text-center space-y-3">
        <CheckCircle2 className="w-8 h-8 text-[#C9A84C] mx-auto" />
        <h3 className="text-xl font-display font-semibold text-[#f5f3f0]">Transmission Logged</h3>
        <p className="text-xs font-mono text-[#c4c0bb]">
          Jehu Nanpan or a senior studio engineer will respond directly to {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1.5">
            Your Name / Entity
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            required
            className="w-full px-4 py-2.5 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1.5">
            Transmission Address (Email) *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ada@domain.com"
            required
            className="w-full px-4 py-2.5 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-mono text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1.5">
          Reason for Inquiry
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-4 py-2.5 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-sm focus:outline-none focus:border-[#C9A84C]"
        >
          <option value="Consultation">High-Ticket Architecture Consultation</option>
          <option value="CustomBuild">Custom Systems Engineering (Build Pillar)</option>
          <option value="AIIntegration">PRIME Socratic Model Integration (Voice Pillar)</option>
          <option value="DesignSystem">Bespoke Frame / Luxury Design System</option>
          <option value="General">General Inquiry</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1.5">
          The Message / Context *
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="State your operational constraints, timeline, and goals..."
          required
          className="w-full p-4 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-sm focus:outline-none focus:border-[#C9A84C] leading-relaxed resize-none"
        />
      </div>

      <div>
        <Button type="submit" size="lg" disabled={submitting}>
          <Send className="w-4 h-4 mr-2" />
          {submitting ? 'Transmitting...' : 'Dispatch Inquiry'}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;
