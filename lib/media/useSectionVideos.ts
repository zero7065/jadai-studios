'use client';

import { useState, useEffect } from 'react';

export type SectionVideoSlot =
  | 'marketplace_template_cards'
  | 'forge_card_loop'
  | 'mirage_card_loop'
  | 'community_intro_clips';

export interface SectionVideoRecord {
  slotName: SectionVideoSlot;
  url: string;
  fileName: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

const STORAGE_KEY = 'jadai_section_videos_cache';

export function useSectionVideos() {
  const [videos, setVideos] = useState<Record<string, SectionVideoRecord>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return {};
  });

  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/media/section-videos');
      const data = await res.json();
      if (data.videos) {
        setVideos(data.videos);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.videos));
        }
      }
    } catch {
      // Use local storage cache
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const getVideo = (slot: SectionVideoSlot): SectionVideoRecord | null => {
    return videos[slot] || null;
  };

  return {
    videos,
    loading,
    getVideo,
    refresh: fetchVideos,
  };
}

export default useSectionVideos;
