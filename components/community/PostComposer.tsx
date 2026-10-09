'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserCategory, Sticker, createFeedPost, getCurrentFeedUser, FeedPost } from '../../lib/community/feed';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import StickerPicker from './StickerPicker';
import {
  Image as ImageIcon,
  Code2,
  Smile,
  Send,
  Share2,
  X,
  Sparkles,
} from 'lucide-react';

export interface PostComposerProps {
  onPostCreated: (post: FeedPost) => void;
  className?: string;
  composerRef?: React.RefObject<HTMLTextAreaElement | null>;
}

const ROTATING_PLACEHOLDERS = [
  'What are you building?',
  'Shipping something today?',
  'Stuck on an architectural problem?',
  'Share your latest milestone with fellow builders...',
];

const CATEGORIES: UserCategory[] = ['Dev', 'Creator', 'Writer', 'Designer'];

export const PostComposer: React.FC<PostComposerProps> = ({
  onPostCreated,
  className = '',
  composerRef: externalRef,
}) => {
  const { showToast } = useToast();
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef || internalRef;

  const [content, setContent] = useState('');
  const [category, setCategory] = useState<UserCategory>('Dev');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Optional attachments
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rotate placeholder every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleCreatePost = async (shareOnTwitter = false) => {
    if (!content.trim() && !imageUrl && !codeContent.trim() && !selectedSticker) {
      showToast('Write a thought or attach an asset before posting.', 'info');
      return;
    }

    setIsSubmitting(true);
    StudioAudio.playClick();

    try {
      const newPost = await createFeedPost({
        content: content.trim(),
        category,
        imageUrl: imageUrl.trim() || undefined,
        codeSnippet: codeContent.trim()
          ? { code: codeContent.trim(), language: codeLanguage }
          : undefined,
        sticker: selectedSticker || undefined,
      });

      StudioAudio.playSuccessArpeggio();
      showToast('Transmission published to live community feed!', 'success');
      onPostCreated(newPost);

      if (shareOnTwitter) {
        const textToShare = encodeURIComponent(
          `Building on @JADAIstudios:\n\n"${content.slice(0, 180)}..."\n\nhttps://jadai.dev/community`
        );
        window.open(`https://twitter.com/intent/tweet?text=${textToShare}`, '_blank');
      }

      // Reset
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      setCodeContent('');
      setShowCodeInput(false);
      setSelectedSticker(null);
      setShowStickerPicker(false);
    } catch (err) {
      showToast("The transmission didn't reach the stream, and nothing was posted. Your draft is still here — send it again.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const user = getCurrentFeedUser();

  return (
    <div
      className={`sticky top-16 sm:top-20 z-40 p-4 sm:p-5 rounded-3xl bg-[#0a0908]/95 border border-[rgba(201,168,76,0.3)] shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl space-y-3 ${className}`}
    >
      {/* Top author & category selector */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-[#C9A84C]"
          />
          <div>
            <span className="text-xs font-display font-bold text-[#f5f3f0] block leading-tight">
              {user.name}
            </span>
            <span className="text-[10px] font-mono text-[#8a857e] leading-tight">
              {user.handle}
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 bg-[#050404] p-1 rounded-xl border border-white/5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                StudioAudio.playClick();
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                category === cat
                  ? 'bg-[#C9A84C] text-[#050404] shadow-xs'
                  : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input with rotating placeholder */}
      <textarea
        ref={textareaRef as any}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={ROTATING_PLACEHOLDERS[placeholderIdx]}
        rows={3}
        className="w-full bg-black/40 border border-white/5 focus:border-[rgba(201,168,76,0.5)] rounded-2xl p-3 text-xs sm:text-sm text-[#f5f3f0] placeholder-[#6b665f] focus:outline-none transition-all resize-none font-sans"
      />

      {/* Attached Sticker Badge */}
      {selectedSticker && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] text-xs font-mono text-[#e8c96a]">
          <span className="text-lg">{selectedSticker.emoji}</span>
          <span>{selectedSticker.label}</span>
          <button
            onClick={() => setSelectedSticker(null)}
            className="hover:text-red-400 cursor-pointer ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Code Snippet Input Drawer */}
      {showCodeInput && (
        <div className="p-3 rounded-2xl bg-[#050404] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#8a857e]">
            <span className="flex items-center gap-1 text-[#e8c96a]">
              <Code2 className="w-3.5 h-3.5" /> Code Snippet
            </span>
            <button
              onClick={() => setShowCodeInput(false)}
              className="hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            placeholder="// Paste executable TypeScript / SQL / Rust code here..."
            rows={3}
            className="w-full bg-black/80 font-mono text-xs text-emerald-300 p-2.5 rounded-xl border border-white/5 focus:outline-none"
          />
        </div>
      )}

      {/* Image Input Drawer */}
      {showImageInput && (
        <div className="p-3 rounded-2xl bg-[#050404] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#8a857e]">
            <span className="flex items-center gap-1 text-[#e8c96a]">
              <ImageIcon className="w-3.5 h-3.5" /> Image Link
            </span>
            <button
              onClick={() => setShowImageInput(false)}
              className="hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://... (direct image link or render)"
            className="w-full bg-black/80 font-mono text-xs text-[#f5f3f0] p-2 rounded-xl border border-white/5 focus:outline-none"
          />
        </div>
      )}

      {/* Bottom Bar: Action triggers + Post Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
        <div className="flex items-center gap-2 relative">
          {/* Image button */}
          <button
            type="button"
            onClick={() => {
              setShowImageInput(!showImageInput);
              StudioAudio.playClick();
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showImageInput
                ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#e8c96a]'
                : 'bg-white/5 border-white/10 text-[#8a857e] hover:text-[#f5f3f0]'
            }`}
            title="Attach Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Code button */}
          <button
            type="button"
            onClick={() => {
              setShowCodeInput(!showCodeInput);
              StudioAudio.playClick();
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showCodeInput
                ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#e8c96a]'
                : 'bg-white/5 border-white/10 text-[#8a857e] hover:text-[#f5f3f0]'
            }`}
            title="Attach Code Snippet"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Stickers button */}
          <button
            type="button"
            onClick={() => {
              setShowStickerPicker(!showStickerPicker);
              StudioAudio.playClick();
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showStickerPicker
                ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#e8c96a]'
                : 'bg-white/5 border-white/10 text-[#8a857e] hover:text-[#f5f3f0]'
            }`}
            title="Attach Jadai Sticker Pack"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Sticker Picker Popup */}
          {showStickerPicker && (
            <div className="absolute top-12 left-0 z-50">
              <StickerPicker
                onSelectSticker={(stk) => setSelectedSticker(stk)}
                onClose={() => setShowStickerPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-2">
          {/* Post + Share on X */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleCreatePost(true)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] font-mono text-[#c4c0bb] hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            title="Publish and compose a tweet on X"
          >
            <Share2 className="w-3 h-3 text-[#C9A84C]" />
            <span className="hidden sm:inline">Post + Share on X</span>
            <span className="sm:hidden">+ X</span>
          </button>

          {/* Standard Gold Post Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleCreatePost(false)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#e8c96a] hover:brightness-110 active:scale-95 text-[#050404] text-xs font-mono font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
