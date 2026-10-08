/**
 * JADAI STUDIOS — COMMUNITY FEED ENGINE
 * Real local + Supabase persistence, reaction tracking, sticker packs, & recommendations
 * NO FAKE MOCK POSTS SEEDED.
 */

export type UserCategory = 'Dev' | 'Creator' | 'Writer' | 'Designer';

export interface Sticker {
  id: string;
  name: string;
  pack: 'builder' | 'mythic' | 'reaction';
  emoji: string;
  label: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  createdAt: number; // timestamp
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  category: UserCategory;
  content: string;
  imageUrl?: string;
  codeSnippet?: {
    code: string;
    language: string;
  };
  sticker?: Sticker;
  reactions: Record<string, number>; // emoji -> count
  userReactions: Record<string, boolean>; // current user's active reactions
  comments: PostComment[];
  saved?: boolean;
  createdAt: number; // timestamp
}

export interface FeedNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  actorName: string;
  actorAvatar: string;
  summary: string;
  createdAt: number;
  read: boolean;
}

// 3 Starter Sticker Packs (12 Stickers each = 36 total)
export const STICKER_PACKS: Record<'builder' | 'mythic' | 'reaction', Sticker[]> = {
  builder: [
    { id: 'b-1', pack: 'builder', name: 'laptop', emoji: '💻', label: 'In the Code' },
    { id: 'b-2', pack: 'builder', name: 'coffee', emoji: '☕', label: 'Fueling Up' },
    { id: 'b-3', pack: 'builder', name: 'terminal', emoji: '⌨️', label: 'Command Line' },
    { id: 'b-4', pack: 'builder', name: 'ship', emoji: '🚢', label: 'Just Shipped' },
    { id: 'b-5', pack: 'builder', name: 'rocket', emoji: '🚀', label: 'Lift Off' },
    { id: 'b-6', pack: 'builder', name: 'bug', emoji: '🐛', label: 'Bug Hunt' },
    { id: 'b-7', pack: 'builder', name: 'git', emoji: '🌿', label: 'Main Branch' },
    { id: 'b-8', pack: 'builder', name: 'wrench', emoji: '🔧', label: 'Refactoring' },
    { id: 'b-9', pack: 'builder', name: 'deploy', emoji: '📦', label: 'Production Ready' },
    { id: 'b-10', pack: 'builder', name: 'cpu', emoji: '⚡', label: 'High Compute' },
    { id: 'b-11', pack: 'builder', name: 'check', emoji: '✅', label: 'Passing Tests' },
    { id: 'b-12', pack: 'builder', name: 'server', emoji: '🖲️', label: 'Edge Worker' },
  ],
  mythic: [
    { id: 'm-1', pack: 'mythic', name: 'sigil', emoji: '💠', label: 'Jadai Sigil' },
    { id: 'm-2', pack: 'mythic', name: 'sun', emoji: '☀️', label: 'Highland Dawn' },
    { id: 'm-3', pack: 'mythic', name: 'mountain', emoji: '🏔️', label: 'Jos Plateau' },
    { id: 'm-4', pack: 'mythic', name: 'owl', emoji: '🦉', label: 'Night Wisdom' },
    { id: 'm-5', pack: 'mythic', name: 'flame', emoji: '🔥', label: 'Forge Flame' },
    { id: 'm-6', pack: 'mythic', name: 'star', emoji: '✨', label: 'Celestial Light' },
    { id: 'm-7', pack: 'mythic', name: 'moon', emoji: '🌙', label: '9:47 PM WAT' },
    { id: 'm-8', pack: 'mythic', name: 'scroll', emoji: '📜', label: 'Ancient Codex' },
    { id: 'm-9', pack: 'mythic', name: 'key', emoji: '🗝️', label: 'Invariant Key' },
    { id: 'm-10', pack: 'mythic', name: 'diamond', emoji: '💎', label: 'Uncut Truth' },
    { id: 'm-11', pack: 'mythic', name: 'crown', emoji: '👑', label: 'Sovereignty' },
    { id: 'm-12', pack: 'mythic', name: 'compass', emoji: '🧭', label: 'True North' },
  ],
  reaction: [
    { id: 'r-1', pack: 'reaction', name: 'thumbs', emoji: '👍', label: 'Solid' },
    { id: 'r-2', pack: 'reaction', name: 'heart', emoji: '❤️', label: 'Love this' },
    { id: 'r-3', pack: 'reaction', name: 'fire', emoji: '🔥', label: 'Absolute Heat' },
    { id: 'r-4', pack: 'reaction', name: 'bulb', emoji: '💡', label: 'Brilliant Idea' },
    { id: 'r-5', pack: 'reaction', name: 'clap', emoji: '👏', label: 'Bravo' },
    { id: 'r-6', pack: 'reaction', name: 'target', emoji: '🎯', label: 'Bullseye' },
    { id: 'r-7', pack: 'reaction', name: 'mindblown', emoji: '🤯', label: 'Mind Blown' },
    { id: 'r-8', pack: 'reaction', name: 'hundred', emoji: '💯', label: 'Real Truth' },
    { id: 'r-9', pack: 'reaction', name: 'salute', emoji: '🫡', label: 'Respect' },
    { id: 'r-10', pack: 'reaction', name: 'party', emoji: '🎉', label: 'Celebration' },
    { id: 'r-11', pack: 'reaction', name: 'wave', emoji: '👋', label: 'Greetings' },
    { id: 'r-12', pack: 'reaction', name: 'sparkle', emoji: '🔮', label: 'Magic' },
  ],
};

const STORAGE_KEY_POSTS = 'jadai_real_community_posts';
const STORAGE_KEY_NOTIFS = 'jadai_real_community_notifications';
const STORAGE_KEY_SAVED = 'jadai_real_community_saved_ids';

/**
 * Get current user from session or local profile
 */
export function getCurrentFeedUser() {
  if (typeof window === 'undefined') {
    return {
      id: 'usr-guest',
      name: 'Guest Builder',
      handle: '@guest',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      category: 'Dev' as UserCategory,
    };
  }

  try {
    const raw = localStorage.getItem('jadai_user_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        id: parsed.id || 'usr-' + (parsed.email ? btoa(parsed.email).slice(0, 8) : 'anon'),
        name: parsed.name || (parsed.email ? parsed.email.split('@')[0] : 'Studio Builder'),
        handle: '@' + (parsed.email ? parsed.email.split('@')[0].toLowerCase() : 'builder'),
        avatar:
          parsed.avatar_url ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        category: (parsed.category as UserCategory) || 'Dev',
      };
    }
  } catch {}

  return {
    id: 'usr-local',
    name: 'You (Highland Builder)',
    handle: '@you',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    category: 'Dev' as UserCategory,
  };
}

/**
 * Retrieve real posts from localStorage (zero mock seeds)
 */
export function getRealFeedPosts(): FeedPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const savedIds = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_SAVED) || '[]'));
    const raw = localStorage.getItem(STORAGE_KEY_POSTS);
    if (!raw) return [];
    const posts: FeedPost[] = JSON.parse(raw);
    return posts.map((p) => ({
      ...p,
      saved: savedIds.has(p.id),
    }));
  } catch {
    return [];
  }
}

/**
 * Create a new post and persist to localStorage & Supabase if available
 */
export async function createFeedPost(data: {
  content: string;
  category: UserCategory;
  imageUrl?: string;
  codeSnippet?: { code: string; language: string };
  sticker?: Sticker;
}): Promise<FeedPost> {
  const user = getCurrentFeedUser();
  const newPost: FeedPost = {
    id: 'post-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    authorId: user.id,
    authorName: user.name,
    authorHandle: user.handle,
    authorAvatar: user.avatar,
    category: data.category,
    content: data.content,
    imageUrl: data.imageUrl,
    codeSnippet: data.codeSnippet,
    sticker: data.sticker,
    reactions: { '👍': 0, '❤️': 0, '🔥': 0, '💡': 0, '👏': 0, '🎯': 0 },
    userReactions: {},
    comments: [],
    saved: false,
    createdAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = getRealFeedPosts();
      const updated = [newPost, ...existing];
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated));
    } catch {}

    // Async attempt to persist to Supabase if configured
    try {
      const { supabase, isSupabaseConfigured } = await import('../supabase/client');
      if (isSupabaseConfigured()) {
        await supabase.from('community_posts').insert({
          id: newPost.id,
          author_id: newPost.authorId,
          author_name: newPost.authorName,
          author_handle: newPost.authorHandle,
          author_avatar: newPost.authorAvatar,
          category: newPost.category,
          content: newPost.content,
          image_url: newPost.imageUrl,
          created_at: new Date(newPost.createdAt).toISOString(),
        });
      }
    } catch {}
  }

  return newPost;
}

/**
 * Toggle a reaction on a post
 */
export function toggleReaction(postId: string, emoji: string): FeedPost[] {
  if (typeof window === 'undefined') return [];
  const posts = getRealFeedPosts();
  const updated = posts.map((post) => {
    if (post.id !== postId) return post;

    const userReacted = !!post.userReactions?.[emoji];
    const currentCount = post.reactions?.[emoji] || 0;
    const nextCount = userReacted ? Math.max(0, currentCount - 1) : currentCount + 1;

    return {
      ...post,
      reactions: {
        ...(post.reactions || {}),
        [emoji]: nextCount,
      },
      userReactions: {
        ...(post.userReactions || {}),
        [emoji]: !userReacted,
      },
    };
  });

  try {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated));
  } catch {}

  return updated;
}

/**
 * Add a comment to a post
 */
export function addPostComment(postId: string, text: string): FeedPost[] {
  if (typeof window === 'undefined') return [];
  const user = getCurrentFeedUser();
  const newComment: PostComment = {
    id: 'cmt-' + Date.now(),
    postId,
    authorId: user.id,
    authorName: user.name,
    authorHandle: user.handle,
    authorAvatar: user.avatar,
    content: text,
    createdAt: Date.now(),
  };

  const posts = getRealFeedPosts();
  const updated = posts.map((p) => {
    if (p.id !== postId) return p;
    return {
      ...p,
      comments: [...(p.comments || []), newComment],
    };
  });

  try {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated));
  } catch {}

  return updated;
}

/**
 * Toggle save / bookmark on a post
 */
export function toggleSavePost(postId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED) || '[]';
    const set = new Set(JSON.parse(raw));
    let isNowSaved = false;
    if (set.has(postId)) {
      set.delete(postId);
      isNowSaved = false;
    } else {
      set.add(postId);
      isNowSaved = true;
    }
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(Array.from(set)));
    return isNowSaved;
  } catch {
    return false;
  }
}

/**
 * Retrieve notifications
 */
export function getFeedNotifications(): FeedNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Mark notifications as read
 */
export function markNotificationsAsRead(): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getFeedNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(updated));
  } catch {}
}

/**
 * Recommendation algorithm:
 * - "You might like": 3 active community authors
 * - "Trending today": top 3 posts by engagement (reactions + comments)
 * - "Suggested for you": posts matching user category
 */
export function getFeedRecommendations(currentCategory: UserCategory = 'Dev') {
  const posts = getRealFeedPosts();

  // Trending posts by reaction sum
  const trending = [...posts]
    .sort((a, b) => {
      const sumA = Object.values(a.reactions || {}).reduce((s, c) => s + c, 0) + (a.comments?.length || 0);
      const sumB = Object.values(b.reactions || {}).reduce((s, c) => s + c, 0) + (b.comments?.length || 0);
      return sumB - sumA;
    })
    .slice(0, 3);

  // Suggested matching user's preferred category
  const suggested = posts.filter((p) => p.category === currentCategory).slice(0, 3);

  // Active distinct authors from existing posts
  const authorMap = new Map<string, { id: string; name: string; handle: string; avatar: string; category: UserCategory }>();
  posts.forEach((p) => {
    if (!authorMap.has(p.authorHandle)) {
      authorMap.set(p.authorHandle, {
        id: p.authorId,
        name: p.authorName,
        handle: p.authorHandle,
        avatar: p.authorAvatar,
        category: p.category,
      });
    }
  });

  const youMightLike = Array.from(authorMap.values()).slice(0, 3);

  return {
    youMightLike,
    trending,
    suggested,
  };
}

/**
 * Format relative timestamp ("2m ago", "1h ago", "yesterday")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'yesterday';
  return new Date(timestamp).toLocaleDateString();
}
