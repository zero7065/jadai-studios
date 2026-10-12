'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import { Send, Smartphone } from 'lucide-react';

interface SentNotification {
  id: string;
  title: string;
  body: string;
  actionUrl: string;
  sentAt: string;
  deliveredCount: number;
  note: string;
}

const HISTORY_KEY = 'jadai_admin_broadcast_history';

function loadHistory(): SentNotification[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(HISTORY_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as SentNotification[];
    }
  } catch {}
  return [];
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<SentNotification[]>(loadHistory);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('https://jadai.dev/book-of-lies');
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      showToast('Title and notification body are required', 'error');
      return;
    }

    setSending(true);
    StudioAudio.playClick();

    try {
      if (typeof Notification === 'undefined') {
        throw new Error('this browser does not support the Notification API');
      }

      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      if (permission !== 'granted') {
        showToast('Notification permission not granted — nothing was dispatched.', 'error', 'Dispatch Blocked');
        return;
      }

      // Prefer the service worker (tray notifications + click-through to Target URL).
      let delivered = false;
      try {
        const reg = await navigator.serviceWorker?.ready;
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, {
            body,
            tag: `jadai-broadcast-${Date.now()}`,
            data: { url: actionUrl },
          });
          delivered = true;
        }
      } catch {
        // fall through to plain Notification
      }
      if (!delivered) {
        new Notification(title, { body });
        delivered = true;
      }

      const newNotif: SentNotification = {
        id: `notif-${Date.now()}`,
        title,
        body,
        actionUrl,
        sentAt: new Date().toLocaleString(),
        deliveredCount: delivered ? 1 : 0,
        note: 'This device only — multi-device Web Push (VAPID) backend not connected',
      };

      setNotifications((prev) => {
        const next = [newNotif, ...prev].slice(0, 50);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
      setTitle('');
      setBody('');
      StudioAudio.playSuccessArpeggio();
      showToast('Browser notification shown on this device.', 'success', 'Dispatched Locally');
    } catch (err: any) {
      showToast(`Dispatch failed: ${String(err?.message || err)}`, 'error', 'Not Dispatched');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Signal Broadcast</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">Push Notification Dispatcher</h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Dispatches a real browser notification on this device via the Notification API. Multi-device Web Push requires a VAPID backend, which is not connected yet.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <GlassCard className="lg:col-span-7 p-6 space-y-4">
          <h2 className="text-sm font-display font-bold text-[#f5f3f0] border-b border-[rgba(201,168,76,0.15)] pb-3">
            Compose Signal
          </h2>

          <form onSubmit={handleSend} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Target Audience</label>
              <div className="px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]">
                This device (browser Notification API)
              </div>
            </div>

            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Signal Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Book of Lies // Nightly Transmission"
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
                required
              />
            </div>

            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Transmission Body</label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Brief message appearing on device lockscreen..."
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
                required
              />
            </div>

            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Target URL on Click</label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="https://jadai.dev/..."
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              />
            </div>

            <Button variant="primary" size="md" className="w-full" disabled={sending} type="submit">
              <Send className="w-3.5 h-3.5 mr-2" />
              {sending ? 'Dispatching...' : 'Dispatch Notification (This Device)'}
            </Button>
          </form>
        </GlassCard>

        {/* Live Device Lockscreen Preview */}
        <GlassCard className="lg:col-span-5 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[rgba(201,168,76,0.15)] pb-3">
              <Smartphone className="w-4 h-4 text-[#C9A84C]" />
              <h3 className="font-display font-bold text-sm text-[#f5f3f0]">Device Lockscreen Preview</h3>
            </div>

            {/* Preview Notification Card */}
            <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.35)] shadow-lg space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8a6e2a]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                  <span className="text-[#f5f3f0] font-bold">JADAI STUDIOS</span>
                </div>
                <span>Now</span>
              </div>
              <h4 className="font-bold text-xs text-[#f5f3f0]">
                {title || 'Book of Lies // Nightly Transmission'}
              </h4>
              <p className="text-[11px] text-[#c4c0bb] leading-relaxed">
                {body || 'Episode #001 "The Foundation Invariant" has unlocked on your local feed.'}
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#8a6e2a] text-center pt-4 border-t border-[rgba(201,168,76,0.15)]">
            Preview only — the real dispatch fires through the browser Notification API / service worker.
          </div>
        </GlassCard>
      </div>

      {/* History */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="font-display font-bold text-sm text-[#f5f3f0]">Broadcast History (This Device)</h3>
        <div className="space-y-2 font-mono text-xs">
          {notifications.length === 0 && (
            <p className="text-[#8a6e2a]">No broadcasts dispatched yet from this browser.</p>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="font-bold text-[#f5f3f0] block">{n.title}</span>
                <span className="text-[11px] text-[#8a6e2a]">{n.body}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-[#8a6e2a] shrink-0">
                <span className="text-emerald-400">{n.deliveredCount} delivered (this device)</span>
                <span>{n.sentAt}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
