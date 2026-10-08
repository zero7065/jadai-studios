'use client';

import React, { useState } from 'react';
import EdgeGlow from '../ui/EdgeGlow';
import Button from '../ui/Button';
import { INITIAL_POSTS, CommunityPost, ProfileCategory } from '../../lib/data/communityData';
import { StudioAudio } from '../../lib/watermark';
import { getCustomization } from '../../lib/data/customization';
import { useToast } from '../providers/ToastProvider';
import { Heart, MessageSquare, Share2, Plus, Sparkles, ArrowRight, UserPlus, Users } from 'lucide-react';

export const CommunityFeed: React.FC<{
  onNavigate?: (path: string) => void;
}> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<ProfileCategory>('Developer');
  const customization = getCustomization();
  const { showToast } = useToast();

  const categories = ['All', 'Developer', 'Creator', 'Business Owner', 'Artist', 'Writer', 'Designer'];

  const filteredPosts =
    activeCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StudioAudio.playClick();
    const isLiked = likedPosts[id];
    setLikedPosts((prev) => ({ ...prev, [id]: !isLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    StudioAudio.playSuccessArpeggio();
    const created: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: 'usr-self',
      authorName: 'Studio Architect',
      authorHandle: '@architect',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      category: newPostCategory,
      content: newPostContent.trim(),
      likes: 1,
      commentsCount: 0,
      createdAt: 'Just now',
    };

    setPosts([created, ...posts]);
    setNewPostContent('');
    setNewPostOpen(false);
    showToast('Post dispatched to sovereign network', 'success');
  };

  const handleUserClick = (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StudioAudio.playClick();
    const path = `/u/${username}`;
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-8 text-[#c4c0bb] rounded-3xl overflow-hidden select-none">
      {/* 4K Atmospheric Background Image with Slow Breathing Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 filter brightness-60 contrast-125 animate-atmosphere"
          style={{ backgroundImage: `url(${customization.workBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050404] via-[#050404]/85 to-[#050404]" />

        {/* Ambient Drifting Particles */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#C9A84C]"
              style={{
                width: `${(i % 3) + 1}px`,
                height: `${(i % 3) + 1}px`,
                left: `${(i * 17 + 9) % 100}%`,
                top: `${(i * 13 + 3) % 100}%`,
                opacity: (i % 5 + 3) / 10,
                boxShadow: '0 0 5px #C9A84C',
                animation: `particleFloat ${9 + (i % 5)}s ease-in-out infinite alternate`,
                animationDelay: `${(i % 5) * 0.6}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
              Autonomous Mesh
            </span>
            <span className="text-xs text-[#8a6e2a]">●</span>
            <span className="text-xs font-mono text-[#8a6e2a]">Community Feed</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-[#f5f3f0]">
            Signals from the Network
          </h2>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Engineers, writers, artists, and creators sharing progress, code snippets, and philosophy.
          </p>
        </div>

        <button
          onClick={() => {
            StudioAudio.playClick();
            setNewPostOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Transmit Signal</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 text-xs font-mono">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              StudioAudio.playClick();
              setActiveCategory(cat);
            }}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
              activeCategory === cat
                ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-[0_0_10px_rgba(201,168,76,0.3)]'
                : 'bg-[#0a0908] text-[#c4c0bb] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed Posts */}
      <div className="relative z-10 space-y-5">
        {filteredPosts.map((post) => (
          <EdgeGlow key={post.id} intensity="subtle" color="gold" borderRadius={20}>
            <div
              style={{ borderRadius: '20px' }}
              onClick={() => {
                const username = post.authorHandle.replace('@', '');
                handleUserClick(username, { stopPropagation: () => {} } as any);
              }}
              className="card-3d p-5 sm:p-6 bg-[#0a0908]/90 border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] transition-all duration-300 shadow-lg space-y-4 cursor-pointer"
            >
              {/* Post Author Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-[#C9A84C]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-[#f5f3f0] hover:text-[#e8c96a]">
                        {post.authorName}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)] text-[#e8c96a]">
                        {post.category}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#8a6e2a]">
                      {post.authorHandle} • {post.createdAt}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const username = post.authorHandle.replace('@', '');
                    handleUserClick(username, e);
                  }}
                  className="px-3 py-1 rounded-lg border border-[rgba(201,168,76,0.2)] text-xs font-mono text-[#8a6e2a] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </button>
              </div>

              {/* Post Content */}
              <p className="text-xs sm:text-sm text-[#f5f3f0] leading-relaxed select-text font-sans">
                {post.content}
              </p>

              {/* Optional Post Image */}
              {post.image && (
                <div className="rounded-xl overflow-hidden border border-[rgba(201,168,76,0.2)] max-h-80">
                  <img
                    src={post.image}
                    alt="Post attachment"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Interaction Bar */}
              <div className="flex items-center gap-6 pt-2 border-t border-[rgba(201,168,76,0.15)] text-xs font-mono text-[#8a6e2a]">
                <button
                  onClick={(e) => handleLike(post.id, e)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    likedPosts[post.id] ? 'text-[#C9A84C]' : 'hover:text-[#f5f3f0]'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      likedPosts[post.id] ? 'fill-[#C9A84C] text-[#C9A84C]' : ''
                    }`}
                  />
                  <span>{post.likes}</span>
                </button>

                <div className="flex items-center gap-1.5 hover:text-[#f5f3f0] transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.commentsCount} comments</span>
                </div>
              </div>
            </div>
          </EdgeGlow>
        ))}
      </div>

      {/* New Post Modal */}
      {newPostOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C] font-bold">
                Broadcast New Signal
              </span>
              <button
                onClick={() => setNewPostOpen(false)}
                className="text-xs font-mono text-[#8a6e2a] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#8a6e2a]">Category</label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value as ProfileCategory)}
                  className="w-full p-2.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#8a6e2a]">Signal Transmission</label>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share a milestone, code realization, or sovereign architecture reflection..."
                  required
                  className="w-full p-3.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setNewPostOpen(false)}
                  className="text-xs font-mono text-[#8a6e2a] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all shadow cursor-pointer"
                >
                  Dispatch Signal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default CommunityFeed;
