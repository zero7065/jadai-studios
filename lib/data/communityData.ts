export type ProfileCategory =
  | 'Developer'
  | 'Creator'
  | 'Business Owner'
  | 'Artist'
  | 'Writer'
  | 'Designer'
  | 'Other';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  jadaiId: string;
  avatar: string;
  category: ProfileCategory;
  bio: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    website?: string;
  };
  publicProjects: Array<{
    id: string;
    title: string;
    description: string;
    link: string;
  }>;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  category: ProfileCategory;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  createdAt: string;
}

// Real community profiles start empty until users register in Supabase user_profiles
export const COMMUNITY_PROFILES: UserProfile[] = [];

// Real community posts start empty until published to Supabase community_posts
export const INITIAL_POSTS: CommunityPost[] = [];

export function getProfileByUsername(username: string): UserProfile | undefined {
  return COMMUNITY_PROFILES.find((p) => p.username.toLowerCase() === username.toLowerCase());
}

export function searchProfileByJadaiId(id: string): UserProfile | undefined {
  const clean = id.trim().toUpperCase();
  return COMMUNITY_PROFILES.find((p) => p.jadaiId.toUpperCase() === clean);
}
