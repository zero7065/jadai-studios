// /modules/sentinel/api/shorten.ts
// Link Shortening, Cloaking, and QR Generation Logic

export interface ShortLinkItem {
  id: string;
  slug: string;
  targetUrl: string;
  cloaked: boolean;
  clicks: number;
  qrCodeUrl: string;
  createdAt: string;
}

const STORAGE_KEY = 'jadai_sentinel_short_links';

export function getShortLinks(): ShortLinkItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: 'lnk-1',
        slug: 'exampadi',
        targetUrl: 'https://exampadi.jadai.dev',
        cloaked: true,
        clicks: 342,
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://exampadi.jadai.dev',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'lnk-2',
        slug: 'book',
        targetUrl: 'https://jadai.dev/book-of-lies',
        cloaked: false,
        clicks: 819,
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://jadai.dev/book-of-lies',
        createdAt: new Date().toISOString(),
      }
    ];
  } catch {
    return [];
  }
}

export function createShortLink(params: {
  targetUrl: string;
  customSlug?: string;
  cloaked?: boolean;
}): ShortLinkItem {
  const links = getShortLinks();
  const slug = params.customSlug?.trim() || Math.random().toString(36).substring(2, 8);
  const targetUrl = params.targetUrl.startsWith('http') ? params.targetUrl : `https://${params.targetUrl}`;

  const newItem: ShortLinkItem = {
    id: `lnk-${Date.now()}`,
    slug,
    targetUrl,
    cloaked: Boolean(params.cloaked),
    clicks: 0,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newItem, ...links];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return newItem;
}
