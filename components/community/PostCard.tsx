'use client';

import React, { useState } from 'react';
import { FeedPost, formatRelativeTime, toggleReaction, addPostComment, toggleSavePost } from '../../lib/community/feed';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import GlassCard from '../ui/GlassCard';
import {
  MessageSquare,
  Share2,
  Bookmark,
  Send,
  Code2,
  ChevronDown,
  Check,
} from 'lucide-react';

export interface PostCardProps {
  post: FeedPost;
  onPostUpdated?: (updatedPost: FeedPost) => void;
}

const REACTION_EMOJIS = ['👍', '❤️', '🔥', '💡', '👏', '🎯'];

export const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated }) => {
  const { showToast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSaved, setIsSaved] = useState(post.saved || false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleReactionClick = (emoji: string) => {
    StudioAudio.playClick();
    const updated = toggleReaction(post.id, emoji);
    const thisPost = updated.find((p) => p.id === post.id);
    if (thisPost && onPostUpdated) onPostUpdated(thisPost);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    StudioAudio.playClick();
    const updated = addPostComment(post.id, newComment.trim());
    setNewComment('');
    const thisPost = updated.find((p) => p.id === post.id);
    if (thisPost && onPostUpdated) onPostUpdated(thisPost);
    showToast('Reply published to thread!', 'success');
  };

  const handleShare = () => {
    StudioAudio.playClick();
    const link = `${window.location.origin}/community#${post.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast('Post link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveToggle = () => {
    StudioAudio.playClick();
    const nextSaved = toggleSavePost(post.id);
    setIsSaved(nextSaved);
    showToast(nextSaved ? 'Saved to bookmarks' : 'Removed from bookmarks', 'info');
  };

  return (
    <GlassCard
      id={post.id}
      className="p-5 sm:p-6 border-[rgba(201,168,76,0.22)] hover:border-[rgba(201,168,76,0.4)] transition-all rounded-3xl space-y-4 text-left"
    >
      {/* Header: Author + Category Badge + Timestamp */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover border border-[#C9A84C]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-display font-bold text-[#f5f3f0]">
                {post.authorName}
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.15)] text-[#e8c96a] border border-[#C9A84C]/30">
                {post.category}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#8a857e]">
              <span>{post.authorHandle}</span>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Save Bookmark button */}
        <button
          onClick={handleSaveToggle}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isSaved
              ? 'text-[#e8c96a] bg-[rgba(201,168,76,0.2)]'
              : 'text-[#8a857e] hover:text-[#f5f3f0] bg-white/5'
          }`}
          title={isSaved ? 'Bookmarked' : 'Save post'}
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-3">
        <p className="text-xs sm:text-sm text-[#e0deda] leading-relaxed whitespace-pre-wrap font-sans">
          {post.content}
        </p>

        {/* Attached Sticker */}
        {post.sticker && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/60 border border-[rgba(201,168,76,0.3)] shadow-inner">
            <span className="text-3xl">{post.sticker.emoji}</span>
            <div className="text-left font-mono">
              <span className="text-[10px] text-[#C9A84C] block uppercase tracking-wider">
                {post.sticker.pack} Pack
              </span>
              <span className="text-xs text-[#f5f3f0] font-bold">
                {post.sticker.label}
              </span>
            </div>
          </div>
        )}

        {/* Attached Code Snippet */}
        {post.codeSnippet && (
          <div className="rounded-2xl bg-[#050404] border border-white/10 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8a857e] uppercase">
              <Code2 className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>{post.codeSnippet.language}</span>
            </div>
            <pre className="p-2.5 rounded-xl bg-black font-mono text-xs text-emerald-400 overflow-x-auto">
              <code>{post.codeSnippet.code}</code>
            </pre>
          </div>
        )}

        {/* Attached Image */}
        {post.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-white/10 max-h-96">
            <img
              src={post.imageUrl}
              alt="Post attachment"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Footer Reactions & Interactions Row */}
      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
        {/* Reactions: 👍 ❤️ 🔥 💡 👏 🎯 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {REACTION_EMOJIS.map((emoji) => {
            const count = post.reactions?.[emoji] || 0;
            const hasReacted = !!post.userReactions?.[emoji];

            return (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                  hasReacted
                    ? 'bg-[rgba(201,168,76,0.25)] border border-[#C9A84C] text-[#e8c96a] shadow-xs'
                    : 'bg-white/5 border border-white/10 text-[#8a857e] hover:text-[#f5f3f0] hover:bg-white/10'
                }`}
              >
                <span>{emoji}</span>
                {count > 0 && <span className="font-bold">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Right action buttons: Comments trigger & Share link */}
        <div className="flex items-center gap-2">
          {/* Comments Toggle */}
          <button
            onClick={() => {
              setShowComments(!showComments);
              StudioAudio.playClick();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#c4c0bb] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>{post.comments?.length || 0}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#8a857e] hover:text-[#f5f3f0] transition-all cursor-pointer"
            title="Share post link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="pt-3 border-t border-white/10 space-y-3">
          {/* Existing comments list */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-2.5">
              {post.comments.map((cmt) => (
                <div
                  key={cmt.id}
                  className="p-3 rounded-2xl bg-black/50 border border-white/5 flex items-start gap-2.5"
                >
                  <img
                    src={cmt.authorAvatar}
                    alt={cmt.authorName}
                    className="w-7 h-7 rounded-full object-cover border border-[#C9A84C]/50 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#f5f3f0] truncate">{cmt.authorName}</span>
                      <span className="text-[10px] text-[#8a857e]">{formatRelativeTime(cmt.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[#c4c0bb] mt-0.5 leading-relaxed font-sans">{cmt.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-[#8a857e] text-center py-2">
              No replies yet. Join the conversation.
            </p>
          )}

          {/* Comment composer */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your constructive thought..."
              className="flex-1 bg-black/60 border border-white/10 focus:border-[#C9A84C] rounded-xl px-3 py-2 text-xs text-[#f5f3f0] focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#C9A84C] text-[#050404] hover:bg-[#e8c96a] transition-all cursor-pointer shadow-xs"
              title="Send reply"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </GlassCard>
  );
};

export default PostCard;
