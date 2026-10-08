import React, { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

export const DreamForgeForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    building: '',
    obstacles: '',
    tried: '',
    vision6Mo: '',
    email: '',
    whatsapp: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('jadai-dream-forge-draft');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const updateField = (field: string, val: string) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);
    localStorage.setItem('jadai-dream-forge-draft', JSON.stringify(updated));
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/dream-forge/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      setSubmitted(true);
      localStorage.removeItem('jadai-dream-forge-draft');
      showToast('Vision successfully forged in transmission ledger.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <GlassCard className="p-10 text-center space-y-4 max-w-xl mx-auto border-[#C9A84C]">
        <div className="w-14 h-14 rounded-full bg-[rgba(201,168,76,0.12)] border border-[#C9A84C] flex items-center justify-center mx-auto text-[#C9A84C]">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-display font-bold text-[#f5f3f0]">Vision Received</h2>
        <p className="text-sm text-[#c4c0bb] leading-relaxed">
          PRIME will analyze your variables and generate your preliminary 4-phase architectural blueprint within 24 hours. Check your inbox.
        </p>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
            Return to Core
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="max-w-2xl mx-auto p-8 space-y-6 border-[rgba(201,168,76,0.3)] shadow-[0_15px_50px_rgba(0,0,0,0.8)]">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#C9A84C] uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Dream Forge Intake • Step {step} of 5
          </span>
          <span className="text-[#8a6e2a]">
            {Math.round((step / 5) * 100)}%
          </span>
        </div>

        <div className="w-full h-1 bg-[#050404] rounded-full overflow-hidden border border-[rgba(201,168,76,0.2)]">
          <div
            className="h-full bg-gradient-to-r from-[#8a6e2a] via-[#C9A84C] to-[#e8c96a] transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Views */}
      <div className="space-y-4 pt-2">
        {step === 1 && (
          <div className="space-y-3">
            <h3 className="text-xl font-display font-semibold text-[#f5f3f0]">
              1. What are you building or dreaming of?
            </h3>
            <p className="text-xs font-mono text-[#8a6e2a]">
              Describe the product, system, or mission in raw, unfiltered terms.
            </p>
            <textarea
              value={formData.building}
              onChange={(e) => updateField('building', e.target.value)}
              rows={5}
              placeholder="I want to construct a sovereign protocol that solves..."
              autoFocus
              className="w-full p-4 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-sm focus:outline-none focus:border-[#C9A84C] leading-relaxed resize-none"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h3 className="text-xl font-display font-semibold text-[#f5f3f0]">
              2. What is in the way right now?
            </h3>
            <p className="text-xs font-mono text-[#8a6e2a]">
              The technical bottleneck, capital ceiling, missing co-builder, or strategic doubt.
            </p>
            <textarea
              value={formData.obstacles}
              onChange={(e) => updateField('obstacles', e.target.value)}
              rows={5}
              placeholder="The primary friction point is..."
              autoFocus
              className="w-full p-4 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-sm focus:outline-none focus:border-[#C9A84C] leading-relaxed resize-none"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h3 className="text-xl font-display font-semibold text-[#f5f3f0]">
              3. What have you already tried?
            </h3>
            <p className="text-xs font-mono text-[#8a6e2a]">
              Past prototypes, failed partnerships, frameworks abandoned, or lessons extracted.
            </p>
            <textarea
              value={formData.tried}
              onChange={(e) => updateField('tried', e.target.value)}
              rows={5}
              placeholder="We attempted to deploy a prototype with..."
              autoFocus
              className="w-full p-4 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-sm focus:outline-none focus:border-[#C9A84C] leading-relaxed resize-none"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h3 className="text-xl font-display font-semibold text-[#f5f3f0]">
              4. What does 'working' look like in 6 months?
            </h3>
            <p className="text-xs font-mono text-[#8a6e2a]">
              Define the scene: number of sovereign users, daily volume, or operational calm.
            </p>
            <textarea
              value={formData.vision6Mo}
              onChange={(e) => updateField('vision6Mo', e.target.value)}
              rows={5}
              placeholder="In 6 months, the system processes..."
              autoFocus
              className="w-full p-4 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-sm focus:outline-none focus:border-[#C9A84C] leading-relaxed resize-none"
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-display font-semibold text-[#f5f3f0]">
                5. Where should PRIME send the blueprint?
              </h3>
              <p className="text-xs font-mono text-[#8a6e2a]">
                Your confidential transmission address.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="builder@domain.com"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-mono text-sm focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#8a6e2a] mb-1">
                  WhatsApp Direct Line (Optional)
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  placeholder="+234..."
                  className="w-full px-4 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-mono text-sm focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between">
        {step > 1 ? (
          <Button variant="ghost" size="sm" onClick={handlePrev}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <Button variant="primary" size="sm" onClick={handleNext}>
            Next Step
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={submitting || !formData.email}
          >
            {submitting ? 'Forging Blueprint...' : 'Transmit Vision'}
          </Button>
        )}
      </div>
    </GlassCard>
  );
};

export default DreamForgeForm;
