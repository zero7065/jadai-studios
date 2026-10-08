import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import Button from '../ui/Button';

export interface NewsletterFormProps {
  source?: string;
  className?: string;
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  source = 'general',
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Subscription transmission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`p-4 rounded bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.35)] flex items-center justify-center gap-2 text-xs font-mono text-[#e8c96a] ${className}`}>
        <Check className="w-4 h-4 text-[#C9A84C]" />
        <span>You're in. The first dispatch lands soon.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6e2a]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email to receive dispatches..."
            required
            className="w-full pl-10 pr-4 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-mono text-xs placeholder-[#4a4744] focus:outline-none focus:border-[#C9A84C]"
          />
        </div>
        <Button type="submit" size="md" disabled={submitting}>
          {submitting ? 'Connecting...' : 'Join Signals'}
        </Button>
      </div>
      {error && <div className="text-[11px] font-mono text-[#C0392B] text-left">{error}</div>}
    </form>
  );
};

export default NewsletterForm;
