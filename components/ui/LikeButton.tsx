'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';

export interface LikeButtonProps {
  targetType: 'book_of_lies' | 'portfolio' | 'template' | 'hub';
  targetId: string;
  initialLikes?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  targetType,
  targetId,
  initialLikes = 0,
  size = 'md',
  showCount = true,
  className = '',
}) => {
  const storageKey = `jadai_like_${targetType}_${targetId}`;
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    try {
      const isLiked = localStorage.getItem(storageKey) === 'true';
      if (isLiked) {
        setLiked(true);
      }
    } catch {
      // Safe fallback
    }
  }, [storageKey]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 500);

    try {
      localStorage.setItem(storageKey, String(newLiked));
    } catch {
      // Ignore
    }

    if (newLiked) {
      StudioAudio.playClick();
    }

    // Call server API asynchronously
    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          action: newLiked ? 'like' : 'unlike',
        }),
      });
    } catch {
      // Non-blocking
    }
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      aria-label={liked ? 'Unlike' : 'Like'}
      className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
        liked ? 'text-[#C0392B]' : 'text-[#8a6e2a] hover:text-[#C9A84C]'
      } ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition-transform duration-300 ${
          liked ? 'fill-[#C0392B] stroke-[#C0392B]' : 'stroke-current'
        } ${animating ? 'scale-135 animate-bounce' : 'scale-100 hover:scale-110'}`}
      />
      {showCount && (
        <span className="text-xs font-mono tracking-wider tabular-nums">
          {likesCount}
        </span>
      )}
    </button>
  );
};

export default LikeButton;
