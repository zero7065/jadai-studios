import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Star } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

export interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceContext?: string;
  moduleType?: 'general' | 'module' | 'template' | 'oracle' | 'hub';
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  sourceContext = 'oracle',
  moduleType = 'oracle',
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          message: message.trim() || 'No written critique provided',
          type: moduleType,
          source: sourceContext,
        }),
      });
      const data = await res.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      sessionStorage.setItem('jadai-feedback-submitted', 'true');
      showToast('Transmission recorded in studio audit ledger.', 'success', 'Critique Logged');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Architectural Critique & Rating">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-xs text-[#c4c0bb] leading-relaxed">
          Your feedback calibrates our neural models and architectural joinery. Zero sugar-coating requested.
        </p>

        {/* 5-Star Selector */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  (hoverRating || rating) >= star
                    ? 'text-[#C9A84C] fill-[#C9A84C]'
                    : 'text-[#4a4744]'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Critique Comment */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#8a6e2a] mb-1.5">
            Observations / Recommendations (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Highlight friction points, logical gaps, or strengths..."
            className="w-full px-3.5 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-xs focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Dismiss
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={submitting}>
            {submitting ? 'Transmitting...' : 'Log Feedback'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RatingModal;
