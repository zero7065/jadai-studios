'use client';

import React, { useState, useEffect, useRef } from 'react';
import LiveIndicator from '@/components/community/LiveIndicator';
import PostComposer from '@/components/community/PostComposer';
import PostCard from '@/components/community/PostCard';
import {
  FeedPost,
  getRealFeedPosts,
  getFeedRecommendations,
  getFeedNotifications,
  markNotificationsAsRead,
  UserCategory,
} from '@/lib/community/feed';
import { StudioAudio } from '@/lib/watermark';
import GlassCard from '@/components/ui/GlassCard';
import {
  Bell,
  Sparkles,
  TrendingUp,
  Users,
  Compass,
  ArrowRight,
  Filter,
  Check,
  Send,
} from 'lucide-react';

export default function CommunityPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const composerTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'All' | UserCategory>('All');
  const [recommendations, setRecommendations] = useState<any>({
    youMightLike: [],
    trending: [],
    suggested: [],
  });

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);

  // Load real posts from feed
  const loadPosts = () => {
    const list = getRealFeedPosts();
    setPosts(list);
    const recs = getFeedRecommendations('Dev');
    setRecommendations(recs);

    const notifs = getFeedNotifications();
    setNotifications(notifs);
    setHasUnreadNotifs(notifs.some((n) => !n.read));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePostCreated = (newPost: FeedPost) => {
    setPosts((prev) => [newPost, ...prev]);
    const recs = getFeedRecommendations(newPost.category);
    setRecommendations(recs);
  };

  const handlePostUpdated = (updatedPost: FeedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handleOpenNotifications = () => {
    StudioAudio.playClick();
    setNotifOpen(!notifOpen);
    if (!notifOpen && hasUnreadNotifs) {
      markNotificationsAsRead();
      setHasUnreadNotifs(false);
    }
  };

  const handleFocusComposer = () => {
    StudioAudio.playClick();
    if (composerTextareaRef.current) {
      composerTextareaRef.current.focus();
      composerTextareaRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredPosts =
    selectedFilter === 'All' ? posts : posts.filter((p) => p.category === selectedFilter);

  return (
    <div className="min-h-screen bg-[#050404] text-[#c4c0bb] py-10 px-4 sm:px-6 max-w-7xl mx-auto space-y-10 select-none">
      {/* -------------------------------------------------------------------
          1. HEADER BAR: TITLE, LIVE INDICATOR & NOTIFICATION BELL
         ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] text-[#e8c96a] text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>COMMUNITY DISPATCH • REAL BUILDER TRANSMISSIONS</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-display font-black text-[#f5f3f0] tracking-tight uppercase"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Community Feed
          </h1>
          <p className="text-xs sm:text-sm text-[#8a857e] mt-1 font-sans">
            Connect, share architectural progress, and collaborate with independent builders.
          </p>
        </div>

        {/* Top-Right Controls: Live Indicator + Notifications Bell */}
        <div className="flex items-center gap-3 relative">
          <LiveIndicator />

          {/* Bell Icon with Pulsing Red Dot when unread */}
          <div className="relative">
            <button
              onClick={handleOpenNotifications}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#C9A84C] text-[#c4c0bb] hover:text-[#fff] transition-all cursor-pointer relative shadow-xs"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadNotifs && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
              {hasUnreadNotifs && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-[0_15px_45px_rgba(0,0,0,0.9)] p-3 z-50 text-left font-mono text-xs backdrop-blur-2xl space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-[#f5f3f0]">Activity Alerts</span>
                  <span className="text-[10px] text-[#8a857e]">Real-time</span>
                </div>
                {notifications.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2 rounded-xl bg-white/5 flex items-center gap-2"
                      >
                        <img
                          src={n.actorAvatar}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="text-[11px] leading-tight">
                          <span className="font-bold text-[#f5f3f0]">{n.actorName}</span>{' '}
                          <span className="text-[#8a857e]">{n.summary}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#8a857e] text-center py-3">
                    No new alerts. Your notifications will appear here.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------
          2. MAIN LAYOUT: FEED COLUMN (LEFT) + RECOMMENDATIONS SIDEBAR (RIGHT)
         ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FEED STREAM COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Sticky Post Composer at top */}
          <PostComposer
            onPostCreated={handlePostCreated}
            composerRef={composerTextareaRef}
          />

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-mono text-[#8a857e] flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-[#C9A84C]" /> Filter:
            </span>
            {(['All', 'Dev', 'Creator', 'Writer', 'Designer'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedFilter(cat);
                  StudioAudio.playClick();
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  selectedFilter === cat
                    ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-xs'
                    : 'bg-white/5 border border-white/10 text-[#8a857e] hover:text-[#f5f3f0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FEED LIST OR EMPTY STATE */}
          {filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostUpdated={handlePostUpdated}
                />
              ))}
            </div>
          ) : (
            /* REAL EMPTY STATE PER PROMPT 5 */
            <GlassCard className="p-10 text-center space-y-4 border-[rgba(201,168,76,0.2)] rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] mx-auto flex items-center justify-center text-[#C9A84C] shadow-md">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-[#f5f3f0]">
                No posts yet. Be the first to share what you're building.
              </h3>
              <p className="text-xs font-mono text-[#8a857e] max-w-md mx-auto">
                Transmit your project milestone, attach a code snippet, or share architectural notes.
              </p>
              <button
                onClick={handleFocusComposer}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(201,168,76,0.3)] cursor-pointer"
              >
                <span>Craft your first post →</span>
              </button>
            </GlassCard>
          )}
        </div>

        {/* RECOMMENDATIONS SIDEBAR (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. "You might like" — Authors based on overlapping skills */}
          <GlassCard className="p-5 border-[rgba(201,168,76,0.2)] rounded-3xl space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Users className="w-4 h-4 text-[#C9A84C]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f5f3f0]">
                You might like
              </h3>
            </div>
            {recommendations.youMightLike && recommendations.youMightLike.length > 0 ? (
              <div className="space-y-3">
                {recommendations.youMightLike.map((user: any) => (
                  <div key={user.handle} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-display font-bold text-[#f5f3f0] truncate block">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#8a857e] truncate block">
                          {user.handle} • {user.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => StudioAudio.playClick()}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-[#e8c96a] border border-white/10 transition-colors cursor-pointer"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#8a857e]">
                New active peers will be matched here as the network grows.
              </p>
            )}
          </GlassCard>

          {/* 2. "Trending today" — Top 3 posts by engagement */}
          <GlassCard className="p-5 border-[rgba(201,168,76,0.2)] rounded-3xl space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <TrendingUp className="w-4 h-4 text-[#C9A84C]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#f5f3f0]">
                Trending today
              </h3>
            </div>
            {recommendations.trending && recommendations.trending.length > 0 ? (
              <div className="space-y-3">
                {recommendations.trending.map((p: any) => (
                  <a
                    key={p.id}
                    href={`#${p.id}`}
                    className="block p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all group"
                  >
                    <span className="text-[10px] font-mono text-[#C9A84C] uppercase block">
                      {p.category} • by {p.authorName}
                    </span>
                    <p className="text-xs text-[#f5f3f0] group-hover:text-[#e8c96a] transition-colors line-clamp-2 mt-1">
                      {p.content}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#8a857e]">
                Highest engagement dispatches will appear here.
              </p>
            )}
          </GlassCard>

          {/* 3. Community Principles Banner */}
          <div className="p-5 rounded-3xl bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.25)] text-left space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C] block font-bold">
              ✦ Community Ethos
            </span>
            <p className="text-xs text-[#c4c0bb] leading-relaxed">
              Build in public. Respect structural invariants. Share runnable software and load-bearing truths.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
